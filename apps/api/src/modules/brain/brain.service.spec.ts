import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { BrainService } from './brain.service';
import { BrainControl } from './brain-control.entity';
import { BrainRun } from './brain-run.entity';
import { BrainPersonalizeDto, BrainQueryDto, BrainReviewDto } from './brain.dto';
import { EnvironmentalDataService, exerciseEnvironment } from './environmental-data.service';
import { OpenAiBrainAgent } from './openai-brain-agent';
import { SosService } from '../sos/sos.service';
import { RecoveryService } from '../recovery/recovery.service';
import { UserRole } from '../users/entities/user-role.enum';
import { BRAIN_AREAS, BrainPlan } from './brain.types';

describe('brain persistence, scope and approval boundary', () => {
  const rows: BrainRun[] = [];
  const persistedControls: BrainControl[] = [];
  const save = jest.fn(async (row: BrainRun) => { rows.push(row); return row; });
  const findOne = jest.fn(async () => rows.at(-1) ?? null);
  const managerSave = jest.fn(async () => undefined);
  const manager = { find: jest.fn(async () => [...persistedControls]), connection: { isInitialized: true }, transaction: async (fn: (m: unknown) => unknown) => fn({ findOne: async () => rows.at(-1) ?? null, save: managerSave, upsert: async (_type: unknown, row: BrainControl) => { const index = persistedControls.findIndex(control => control.scope === row.scope); if (index < 0) persistedControls.push(row); else persistedControls[index] = row; }, create: (_type: unknown, value: unknown) => value }) };
  const repository = { manager, findOne, save, create: (row: BrainRun) => row } as unknown as Repository<BrainRun>;
  const environment = { get: jest.fn(async () => exerciseEnvironment(BRAIN_AREAS[0])) };
  const agent = { review: jest.fn(async (plan: BrainPlan) => plan.agent) };
  const sos = { getReports: jest.fn(async () => []) };
  const recovery = { getReports: jest.fn(async () => []), getDeliveries: jest.fn(async () => []) };
  let service: BrainService;
  beforeEach(() => {
    rows.length = 0; persistedControls.length = 0; jest.clearAllMocks(); manager.connection.isInitialized = true;
    service = new BrainService(repository, environment as unknown as EnvironmentalDataService, agent as unknown as OpenAiBrainAgent, new ConfigService({}), sos as unknown as SosService, recovery as unknown as RecoveryService);
  });
  it('persists a human pause with an audit and reloads it before planning', async () => {
    await service.setAutonomyControl({ scope: 'ALL', paused: true, reason: 'Synthetic field verification' }, { id: 'authority', role: UserRole.AUTHORITY });
    expect(managerSave).toHaveBeenCalledTimes(1);
    const run = jest.spyOn(service, 'run'); await service.autonomousSweep();
    expect(run).not.toHaveBeenCalled();
    expect(service.autonomyStatus().areas['feni:LIVE'].status).toBe('PAUSED_BY_HUMAN');
    await service.setAutonomyControl({ scope: 'ALL', paused: false, reason: 'Verification complete' }, { id: 'authority', role: UserRole.AUTHORITY });
    expect(persistedControls[0].paused).toBe(false);
  });
  it('pauses one area without pausing other profiles and preserves manual analysis', async () => {
    await service.setAutonomyControl({ scope: 'feni', paused: true, reason: 'Field checks pending' }, { id: 'authority', role: UserRole.AUTHORITY });
    const run = jest.spyOn(service, 'run').mockResolvedValue({ id: 'saved', risk: { level: 'MONITOR' } } as BrainPlan);
    await service.autonomousSweep();
    expect(run).not.toHaveBeenCalledWith({ areaId: 'feni', mode: 'LIVE' }, false);
    expect(run).toHaveBeenCalledWith({ areaId: 'sylhet', mode: 'LIVE' }, false);
    run.mockRestore();
    await expect(service.run({ areaId: 'feni', mode: 'EXERCISE' })).resolves.toMatchObject({ areaId: 'feni' });
  });
  it('rejects unauthorized intervention and stops when controls cannot be read', async () => {
    await expect(service.setAutonomyControl({ scope: 'ALL', paused: true, reason: 'Synthetic pause' }, { id: 'responder', role: UserRole.RESPONDER })).rejects.toThrow('Authority');
    manager.find.mockRejectedValueOnce(new Error('database unavailable'));
    const run = jest.spyOn(service, 'run'); await service.autonomousSweep();
    expect(run).not.toHaveBeenCalled(); expect(service.autonomyStatus().controlsHealthy).toBe(false);
  });
  it('automatically covers every live area and isolates exercise runs after a failed area', async () => {
    const run = jest.spyOn(service, 'run').mockImplementation(async query => {
      if (query.areaId === 'feni' && query.mode === 'LIVE') throw new Error('offline');
      return { id: query.areaId, risk: { level: 'MONITOR' } } as BrainPlan;
    });
    await service.autonomousSweep();
    for (const area of BRAIN_AREAS) expect(run).toHaveBeenCalledWith({ areaId: area.id, mode: 'LIVE' }, false);
    expect(run).toHaveBeenCalledWith({ areaId: 'feni', mode: 'EXERCISE' }, false);
    expect(service.autonomyStatus().areas['feni:LIVE'].status).toBe('RETRY_NEXT_SWEEP');
    expect(service.autonomyStatus().lastCompletedAt).not.toBeNull();
  });
  it('does not overlap background sweeps and stops on shutdown', async () => {
    let release!: () => void;
    const pending = new Promise<void>(resolve => { release = resolve; });
    let signalStarted!: () => void;
    const started = new Promise<void>(resolve => { signalStarted = resolve; });
    const run = jest.spyOn(service, 'run').mockImplementation(async () => { signalStarted(); await pending; return { id: 'saved', risk: { level: 'UNKNOWN' } } as BrainPlan; });
    const first = service.autonomousSweep();
    await started;
    await service.autonomousSweep(); expect(run).toHaveBeenCalledTimes(1);
    service.onModuleDestroy(); release(); await first;
    await service.autonomousSweep(); expect(run).toHaveBeenCalledTimes(1);
  });
  it('limits automatic GPT retries after provider fallback while still saving fresh plans', async () => {
    await service.run({ areaId: 'feni', mode: 'LIVE' }, false);
    expect(agent.review).toHaveBeenCalledTimes(1);
    rows[0].plan.createdAt = new Date(Date.now() - 120000).toISOString();
    await service.run({ areaId: 'feni', mode: 'LIVE' }, false);
    expect(agent.review).toHaveBeenCalledTimes(1); expect(save).toHaveBeenCalledTimes(2);
  });
  it('reuses an unchanged GPT briefing with only valid action references', async () => {
    const fixedEnvironment = exerciseEnvironment(BRAIN_AREAS[0]);
    environment.get.mockResolvedValueOnce(fixedEnvironment).mockResolvedValueOnce(fixedEnvironment);
    const previous = await service.run({ areaId: 'feni', mode: 'LIVE' });
    previous.agent.provider = 'OPENAI'; previous.agent.focusActionIds.push('invalid-reference');
    previous.createdAt = new Date(Date.now() - 120000).toISOString();
    const next = await service.run({ areaId: 'feni', mode: 'LIVE' }, false);
    expect(agent.review).toHaveBeenCalledTimes(1); expect(next.agent.provider).toBe('OPENAI');
    expect(next.agent.focusActionIds).not.toContain('invalid-reference');
  });
  it('keeps an optional human dismissal when the evidence and task stay unchanged', async () => {
    const fixed = exerciseEnvironment(BRAIN_AREAS[0]);
    environment.get.mockResolvedValueOnce(fixed).mockResolvedValueOnce(fixed);
    const previous = await service.run({ areaId: 'feni', mode: 'LIVE' });
    previous.actions[0].state = 'DISMISSED';
    previous.createdAt = new Date(Date.now() - 120000).toISOString();
    const next = await service.run({ areaId: 'feni', mode: 'LIVE' }, false);
    expect(next.actions[0].state).toBe('DISMISSED');
    expect(next.limitations.some(note => note.includes(previous.id))).toBe(true);
  });
  it('saves one analysis for concurrent requests and avoids repeated LLM calls', async () => {
    const results = await Promise.all([service.run({ areaId: 'feni', mode: 'LIVE' }), service.run({ areaId: 'feni', mode: 'LIVE' })]);
    expect(save).toHaveBeenCalledTimes(1); expect(agent.review).toHaveBeenCalledTimes(1); expect(results[0].id).toBe(results[1].id);
    await service.run({ areaId: 'feni', mode: 'LIVE' }); expect(save).toHaveBeenCalledTimes(1);
  });
  it('never pulls seeded rescue, shelter or relief records into live mode', async () => {
    const result = await service.run({ areaId: 'sylhet', mode: 'LIVE' }); expect(sos.getReports).not.toHaveBeenCalled(); expect(recovery.getReports).not.toHaveBeenCalled(); expect(result.operations.shelters).toEqual([]);
  });
  it('does not substitute Feni exercise records for unsupported areas', async () => {
    const result = await service.run({ areaId: 'kurigram', mode: 'EXERCISE' }); expect(result.operations.provenance).toBe('NO_VERIFIED_OPERATIONAL_DATA'); expect(sos.getReports).not.toHaveBeenCalled();
  });
  it('serves public preparation without a database or GPT and exposes no operational records', async () => {
    manager.connection.isInitialized = false;
    const result = await service.household({ areaId: 'feni', mode: 'LIVE' });
    expect(result.locationStatus).toBe('LOCATION_UNKNOWN'); expect(result.shelterCandidates).toEqual([]); expect(agent.review).not.toHaveBeenCalled(); expect(sos.getReports).not.toHaveBeenCalled();
    await expect(service.household({ areaId: 'feni', mode: 'EXERCISE' })).rejects.toThrow('Live');
  });
  it('fails honestly when the database is unavailable', async () => {
    manager.connection.isInitialized = false; await expect(service.run({ areaId: 'feni', mode: 'LIVE' })).rejects.toThrow('Database unavailable'); expect(environment.get).not.toHaveBeenCalled();
  });
  it('rejects cross-area GPS and expired analyses', async () => {
    await service.run({ areaId: 'feni', mode: 'EXERCISE' });
    await expect(service.personal({ areaId: 'feni', mode: 'EXERCISE', latitude: 25.08, longitude: 91.75 })).rejects.toThrow('outside');
    rows[0].plan.createdAt = '2020-01-01T00:00:00Z'; await expect(service.personal({ areaId: 'feni', mode: 'EXERCISE' })).rejects.toThrow('stale');
  });
  it('checks the action role even for Admin and records review without execution', async () => {
    const result = await service.run({ areaId: 'feni', mode: 'EXERCISE' }); const action = result.actions[0];
    await expect(service.review(result.id, { actionId: action.id, decision: 'ACKNOWLEDGED', reason: 'Verified source' }, { id: 'admin', role: UserRole.ADMIN })).rejects.toThrow('role');
    await service.review(result.id, { actionId: action.id, decision: 'ACKNOWLEDGED', reason: 'Verified source' }, { id: 'authority', role: UserRole.AUTHORITY });
    expect(action.state).toBe('ACKNOWLEDGED'); expect(managerSave).toHaveBeenCalledTimes(2);
    await service.review(result.id, { actionId: action.id, decision: 'ACKNOWLEDGED', reason: 'Retry review' }, { id: 'authority', role: UserRole.AUTHORITY }); expect(managerSave).toHaveBeenCalledTimes(2);
    await expect(service.review(result.id, { actionId: action.id, decision: 'DISMISSED', reason: 'Different decision' }, { id: 'authority', role: UserRole.AUTHORITY })).rejects.toThrow('already reviewed');
  });
  it('projects recovery and response views without leaking the other operational scope', async () => {
    const result = await service.run({ areaId: 'feni', mode: 'EXERCISE' });
    result.operations.reports.push({ id: 'private-sos', people: 5, trapped: true, child: false, medical: true, receivedAt: null });
    result.actions.push({ id: 'private-action', kind: 'REVIEW_RESCUE', detail: 'report', title: 'report', priority: 90, requiredRole: 'RESPONDER', sourceIds: ['private-sos'], state: 'PENDING_REVIEW' });
    const recoveryView = service.project(result, UserRole.RECOVERY_COORDINATOR); expect(JSON.stringify(recoveryView)).not.toContain('private-sos'); expect(result.operations.reports).toHaveLength(1);
  });
});

describe('brain request validation', () => {
  it.each([
    { areaId: 'unknown', mode: 'LIVE' }, { areaId: 'feni', mode: 'HISTORICAL' }, { areaId: 'feni' },
  ])('rejects unsupported area/mode %j', async data => { expect((await validate(plainToInstance(BrainQueryDto, data))).length).toBeGreaterThan(0); });
  it.each([
    { latitude: 23 }, { longitude: 91 }, { latitude: 91, longitude: 91 }, { latitude: 23, longitude: 181 }, { people: 0 }, { people: 100 }, { people: 1.5 },
  ])('rejects incomplete location or invalid household %j', async data => { expect((await validate(plainToInstance(BrainPersonalizeDto, { areaId: 'feni', mode: 'LIVE', ...data }))).length).toBeGreaterThan(0); });
  it('allows denied GPS and rejects nonexistent automatic action states', async () => {
    expect(await validate(plainToInstance(BrainPersonalizeDto, { areaId: 'feni', mode: 'LIVE', people: 5 }))).toHaveLength(0);
    expect((await validate(plainToInstance(BrainReviewDto, { actionId: 'x', decision: 'DISPATCHED', reason: 'auto' }))).length).toBeGreaterThan(0);
  });
});
