import { BadRequestException, ConflictException, ForbiddenException, Injectable, Logger, NotFoundException, OnModuleDestroy, OnApplicationBootstrap, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { SYNTHETIC_FENI_SEEDS } from '../../database/seeds/feni-synthetic.seeds';
import { AuditLog } from '../audit/entities/audit-log.entity';
import { RecoveryService } from '../recovery/recovery.service';
import { SosService } from '../sos/sos.service';
import { UserRole } from '../users/entities/user-role.enum';
import { BrainControlDto, BrainPersonalizeDto, BrainQueryDto, BrainReviewDto } from './brain.dto';
import { BrainControl } from './brain-control.entity';
import { buildBrainPlan, personalizePlan } from './brain-planner';
import { BrainRun } from './brain-run.entity';
import { BRAIN_AREAS, BrainArea, BrainPlan, OperationalFacts } from './brain.types';
import { EnvironmentalDataService, exerciseEnvironment } from './environmental-data.service';
import { OpenAiBrainAgent } from './openai-brain-agent';

@Injectable()
export class BrainService implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(BrainService.name);
  private timer?: ReturnType<typeof setInterval>;
  private readonly running = new Map<string, Promise<BrainPlan>>();
  private stopped = false;
  private sweeping = false;
  private readonly controls = new Map<string, BrainControl>();
  private controlRevision = 0;
  private controlsHealthy = false;
  private readonly automaticReviews = new Map<string, number>();
  private readonly worker = { enabled: false, running: false, lastStartedAt: null as string | null, lastCompletedAt: null as string | null, nextRunAt: null as string | null, areas: {} as Record<string, { mode: string; runId?: string; checkedAt: string; status: string; riskLevel?: string }> };
  autonomyStatus() { return { ...structuredClone(this.worker), controlsHealthy: this.controlsHealthy, controls: [...this.controls.values()].map(control => ({ scope: control.scope, paused: control.paused, reason: control.reason, updatedAt: control.updated_at.toISOString() })), intervalMinutes: 15, browserRequired: false, notificationDelivery: 'IN_APP_ONLY', operationalActions: 'REQUIRE_AUTHORIZED_REVIEW' }; }

  async setAutonomyControl(dto: BrainControlDto, actor: { id: string; role: UserRole }) {
    if (![UserRole.AUTHORITY, UserRole.ADMIN].includes(actor.role)) throw new ForbiddenException('Authority or Admin intervention required.');
    this.available();
    if (dto.reason.trim().length < 5) throw new BadRequestException('Explain the intervention in at least five characters.');
    const control = await this.runs.manager.transaction(async manager => {
      // Upsert serializes competing controls on the same primary key.
      const row = manager.create(BrainControl, { scope: dto.scope, paused: dto.paused, actor_id: actor.id, reason: dto.reason.trim(), updated_at: new Date() });
      await manager.upsert(BrainControl, row, ['scope']);
      await manager.save(AuditLog, manager.create(AuditLog, { actor_user_id: actor.id, action: dto.paused ? 'PAUSE_AUTONOMY' : 'RESUME_AUTONOMY', entity_type: 'BRAIN_CONTROL', entity_id: '00000000-0000-0000-0000-000000000001', occurred_at: new Date(), reason: row.reason, before_summary: null, after_summary: { scope: dto.scope, paused: dto.paused }, request_id: null }));
      return row;
    });
    // Reload persisted controls at each sweep and before automatic publication.
    this.controls.set(dto.scope, control); this.controlRevision++;
    return this.autonomyStatus();
  }

  private async loadControls() {
    const records = await this.runs.manager.find(BrainControl);
    this.controls.clear(); records.forEach(row => this.controls.set(row.scope, row));
    this.controlsHealthy = true;
  }
  private paused(areaId: string) { return this.controls.get('ALL')?.paused || this.controls.get(areaId)?.paused; }
  constructor(
    @InjectRepository(BrainRun) private readonly runs: Repository<BrainRun>,
    private readonly environment: EnvironmentalDataService,
    private readonly agent: OpenAiBrainAgent,
    private readonly config: ConfigService,
    private readonly sos: SosService,
    private readonly recovery: RecoveryService,
  ) {}

  onApplicationBootstrap() {
    if (process.env.NODE_ENV === 'test' || String(this.config.get('BRAIN_AUTORUN_ENABLED', 'false')) !== 'true') return;
    this.worker.enabled = true;
    void this.autonomousSweep();
    this.timer = setInterval(() => { void this.autonomousSweep(); }, 15 * 60000);
    this.timer.unref();
  }
  onModuleDestroy() { this.stopped = true; if (this.timer) clearInterval(this.timer); }
  async autonomousSweep() {
    if (this.sweeping || this.stopped) return;
    this.sweeping = true; this.worker.running = true;
    this.worker.lastStartedAt = new Date().toISOString();
    try {
      try { await this.loadControls(); } catch {
        this.controlsHealthy = false;
        this.logger.warn('Autonomy controls unavailable; automatic planning suspended until controls can be loaded.');
        return;
      }
      // Live coverage never borrows synthetic operational records. Exercises stay separate.
      const queries: BrainQueryDto[] = BRAIN_AREAS.flatMap(area => [
        { areaId: area.id, mode: 'LIVE' as const },
        ...(area.exerciseEventId ? [{ areaId: area.id, mode: 'EXERCISE' as const }] : []),
      ]);
      for (const query of queries) {
        if (this.stopped) break;
        const key = query.areaId + ':' + query.mode;
        if (this.paused(query.areaId)) {
          this.worker.areas[key] = { mode: query.mode, checkedAt: new Date().toISOString(), status: 'PAUSED_BY_HUMAN' };
          continue;
        }
        try {
          const plan = await this.run(query, false);
          this.worker.areas[key] = { mode: query.mode, runId: plan.id, checkedAt: new Date().toISOString(), status: plan.risk.level === 'UNKNOWN' ? 'DATA_UNAVAILABLE' : 'MONITORED', riskLevel: plan.risk.level };
        } catch {
          this.worker.areas[key] = { mode: query.mode, checkedAt: new Date().toISOString(), status: 'RETRY_NEXT_SWEEP' };
          this.logger.warn('Automatic area analysis unavailable; retry scheduled.');
        }
      }
      this.worker.lastCompletedAt = new Date().toISOString();
    } finally {
      this.sweeping = false; this.worker.running = false;
      this.worker.nextRunAt = new Date(Date.now() + 15 * 60000).toISOString();
    }
  }
  project(plan: BrainPlan | null, role: UserRole): BrainPlan | null {
    if (!plan) return null;
    const copy = structuredClone(plan);
    if (role === UserRole.RECOVERY_COORDINATOR) {
      copy.operations.reports = [];
      copy.actions = copy.actions.filter(a => a.kind !== 'REVIEW_RESCUE');
    }
    if (role === UserRole.RESPONDER) {
      copy.operations.relief = [];
      copy.actions = copy.actions.filter(a => a.kind !== 'REVIEW_RELIEF');
    }
    copy.agent.focusActionIds = copy.agent.focusActionIds.filter(id => copy.actions.some(a => a.id === id));
    if (role !== UserRole.AUTHORITY) copy.agent.summary = `${copy.risk.level} experimental screening. ${copy.actions.length} tasks visible to your role; review original evidence before acting.`;
    return copy;
  }
  private area(id: string): BrainArea { const area = BRAIN_AREAS.find(a => a.id === id); if (!area) throw new BadRequestException('Unsupported area'); return area; }
  private available() { if (!this.runs.manager.connection.isInitialized) throw new ServiceUnavailableException('Database unavailable; analysis cannot be saved.'); }

  async latest(query: BrainQueryDto): Promise<BrainPlan | null> {
    this.area(query.areaId); this.available();
    return (await this.runs.findOne({ where: { area_id: query.areaId, mode: query.mode }, order: { created_at: 'DESC' } }))?.plan ?? null;
  }
  async run(query: BrainQueryDto, useLlm = true): Promise<BrainPlan> {
    const area = this.area(query.areaId); this.available();
    const key = `${area.id}:${query.mode}`;
    const pending = this.running.get(key); if (pending) return pending;
    const task = this.execute(area, query.mode, useLlm); this.running.set(key, task);
    try { return await task; } finally { this.running.delete(key); }
  }
  private async execute(area: BrainArea, mode: 'LIVE' | 'EXERCISE', useLlm: boolean): Promise<BrainPlan> {
    const revision = this.controlRevision;
    const previous = await this.latest({ areaId: area.id, mode });
    if (previous && Date.now() - Date.parse(previous.createdAt) < 60000) return previous;
    const [data, facts] = await Promise.all([mode === 'EXERCISE' ? Promise.resolve(exerciseEnvironment(area)) : this.environment.get(area), this.operationalFacts(area, mode)]);
    const plan = buildBrainPlan(randomUUID(), area, mode, data, facts);
    const key = area.id + ':' + mode;
    const fingerprint = (value: BrainPlan) => JSON.stringify({ risk: value.risk, days: value.environment.days, evidence: value.environment.evidence.map(e => [e.id, e.status, e.validAt]), operations: value.operations });
    const changed = !previous || fingerprint(previous) !== fingerprint(plan);
    // At most one automatic GPT attempt per area/mode/hour, including provider failures.
    const lastAttempt = this.automaticReviews.get(key) ?? (previous?.agent.provider === 'OPENAI' ? Date.parse(previous.createdAt) : 0);
    if (useLlm || ((changed || previous?.agent.provider !== 'OPENAI') && Date.now() - lastAttempt >= 3600000)) {
      if (!useLlm) this.automaticReviews.set(key, Date.now());
      plan.agent = await this.agent.review(plan);
    } else if (!changed && previous?.agent.provider === 'OPENAI') {
      plan.agent = { ...structuredClone(previous.agent), focusActionIds: previous.agent.focusActionIds.filter(id => plan.actions.some(action => action.id === id)) };
    }
    if (!useLlm && this.worker.enabled) {
      await this.loadControls();
      if (this.stopped || this.paused(area.id) || revision !== this.controlRevision) throw new ConflictException('Automatic publication stopped after human intervention.');
    }
    await this.runs.save(this.runs.create({ id: plan.id, area_id: area.id, mode, plan, created_at: new Date(plan.createdAt) }));
    return plan;
  }
  private async operationalFacts(area: BrainArea, mode: 'LIVE' | 'EXERCISE'): Promise<OperationalFacts> {
    // Existing operational stores are seeded exercises without verified live provenance.
    // Never promote them into live records or infer coordinates for missing locations.
    const empty: OperationalFacts = { provenance: 'NO_VERIFIED_OPERATIONAL_DATA', reports: [], shelters: [], relief: [] };
    if (mode !== 'EXERCISE' || !area.exerciseEventId) return empty;
    const [reports, needs, deliveries] = await Promise.all([this.sos.getReports(), this.recovery.getReports(area.exerciseEventId), this.recovery.getDeliveries(area.exerciseEventId)]);
    const [west, south, east, north] = area.bounds;
    const scopedNeeds = needs.filter(item => item.event_id === area.exerciseEventId).sort((a, b) => b.reported_at.getTime() - a.reported_at.getTime());
    const latestNeeds = [...new Map([...scopedNeeds].reverse().map(item => [item.area_id, item])).values()];
    const nonnegative = (value: unknown) => typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : 0;
    return {
      provenance: 'SYNTHETIC_EXERCISE',
      reports: reports.filter(r => r.event_id === area.exerciseEventId && r.review_status !== 'CLOSED').slice(0, 100).map(r => ({ id: r.id, people: r.people_count, trapped: r.is_trapped, medical: r.has_medical_need, child: r.has_child, receivedAt: r.received_at?.toISOString() ?? null })),
      shelters: SYNTHETIC_FENI_SEEDS.shelters.filter(s => s.latitude !== undefined && s.longitude !== undefined && s.longitude >= west && s.longitude <= east && s.latitude >= south && s.latitude <= north).map(s => ({ id: s.id!, name: s.name_en!, latitude: s.latitude!, longitude: s.longitude!, capacity: s.capacity_estimate ?? 0, occupied: 0, available: s.status === 'OPEN' })),
      relief: latestNeeds.map(n => ({ id: n.id, areaName: SYNTHETIC_FENI_SEEDS.areas.find(a => a.id === n.area_id)?.name_en ?? 'Unknown area', waterNeed: nonnegative(n.needs_json?.waterLitres), foodNeed: nonnegative(n.needs_json?.foodPacks), waterDelivered: deliveries.filter(d => d.area_id === n.area_id && d.item_code === 'CLEAN_WATER' && d.unit === 'LITRES').reduce((sum, d) => sum + nonnegative(Number(d.quantity)), 0), foodDelivered: deliveries.filter(d => d.area_id === n.area_id && d.item_code === 'FOOD_PACK' && d.unit === 'PACKS').reduce((sum, d) => sum + nonnegative(Number(d.quantity)), 0) })),
    };
  }

  async personal(dto: BrainPersonalizeDto) {
    const area = this.area(dto.areaId);
    if (dto.latitude !== undefined && dto.longitude !== undefined) {
      const [west, south, east, north] = area.bounds;
      if (dto.latitude < south || dto.latitude > north || dto.longitude < west || dto.longitude > east) throw new BadRequestException('Location is outside the selected area. Choose a matching area; no cross-area shelter recommendation was made.');
    }
    const plan = await this.latest(dto);
    if (!plan) throw new NotFoundException('Run area analysis first.');
    if (Date.now() - Date.parse(plan.createdAt) > 30 * 60000) throw new ConflictException('Analysis is stale; refresh before requesting location guidance.');
    return personalizePlan(plan, dto.latitude, dto.longitude, dto.people);
  }

  async household(dto: BrainPersonalizeDto) {
    const area = this.area(dto.areaId);
    if (dto.mode !== 'LIVE') throw new BadRequestException('Public household guidance uses Live sources only.');
    if (dto.latitude !== undefined && dto.longitude !== undefined) {
      const [west, south, east, north] = area.bounds;
      if (dto.latitude < south || dto.latitude > north || dto.longitude < west || dto.longitude > east) throw new BadRequestException('Location is outside the selected area; select the matching area.');
    }
    const data = await this.environment.get(area);
    const plan = buildBrainPlan('household-preview', area, 'LIVE', data, { provenance: 'NO_VERIFIED_OPERATIONAL_DATA', reports: [], shelters: [], relief: [] });
    // No GPT call, precise-coordinate storage, operational report exposure, booking or dispatch.
    return { areaName: area.name, basin: area.basin, generatedAt: plan.createdAt, risk: plan.risk, evidence: data.evidence, limitations: plan.limitations, ...personalizePlan(plan, dto.latitude, dto.longitude, dto.people) };
  }

  async review(runId: string, dto: BrainReviewDto, actor: { id: string; role: UserRole }) {
    this.available();
    return this.runs.manager.transaction(async manager => {
      const run = await manager.findOne(BrainRun, { where: { id: runId }, lock: { mode: 'pessimistic_write' } });
      if (!run) throw new NotFoundException('Analysis not found');
      if (Date.now() - Date.parse(run.plan.createdAt) > 30 * 60000) throw new ConflictException('Analysis is stale; refresh first.');
      const action = run.plan.actions.find(a => a.id === dto.actionId);
      if (!action) throw new NotFoundException('Action not found');
      if (actor.role !== action.requiredRole) throw new ForbiddenException('Your operational role cannot review this task.');
      if (action.state === dto.decision) return run.plan;
      if (action.state !== 'PENDING_REVIEW') throw new ConflictException('Task already reviewed.');
      const before = action.state; action.state = dto.decision;
      await manager.save(run);
      await manager.save(AuditLog, manager.create(AuditLog, { id: randomUUID(), actor_user_id: actor.id, action: 'BRAIN_TASK_REVIEW', entity_type: 'BRAIN_RUN', entity_id: run.id, occurred_at: new Date(), reason: dto.reason, before_summary: { actionId: action.id, state: before }, after_summary: { state: action.state, operationalActionExecuted: false } }));
      return run.plan;
    });
  }
}
