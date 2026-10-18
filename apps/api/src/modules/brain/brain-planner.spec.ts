import { buildBrainPlan, distanceKm, personalizePlan } from './brain-planner';
import { BRAIN_AREAS, EnvironmentalData, OperationalFacts } from './brain.types';
import { exerciseEnvironment } from './environmental-data.service';

const now = new Date('2026-10-18T10:00:00Z');
const area = BRAIN_AREAS[0];
const empty: OperationalFacts = { provenance: 'NO_VERIFIED_OPERATIONAL_DATA', reports: [], shelters: [], relief: [] };
const plan = (env = exerciseEnvironment(area, now), facts = empty) => buildBrainPlan('run', area, 'EXERCISE', env, facts, now);

describe('area intelligence planner', () => {
  it('uses visible rules rather than claiming a learned flood probability', () => {
    const result = plan(); expect(result.risk.level).toBe('HIGH'); expect(result.risk.dischargeRisePercent).toBe(90);
    expect(result.risk.label).toContain('not a calibrated'); expect(result.actions.every(a => a.state === 'PENDING_REVIEW')).toBe(true);
  });
  it('does not interpret missing providers as safe zero rainfall', () => {
    const env: EnvironmentalData = { evidence: [], days: [], imagery: [], grid: null };
    const result = plan(env); expect(result.risk.level).toBe('UNKNOWN'); expect(result.risk.rain24hMm).toBeNull(); expect(result.actions.some(a => a.kind === 'VERIFY_DATA')).toBe(true);
  });
  it('ignores stale or unavailable rainfall even when values are present', () => {
    const env = exerciseEnvironment(area, now); env.evidence.forEach(e => { e.status = 'STALE'; });
    expect(plan(env).risk.level).toBe('UNKNOWN');
  });
  it('handles zero discharge without dividing by zero or inventing a percentage', () => {
    const env = exerciseEnvironment(area, now); env.days.forEach(d => { d.discharge = 0; d.rainMm = 0; });
    expect(plan(env).risk.dischargeRisePercent).toBeNull(); expect(plan(env).risk.level).toBe('MONITOR');
  });
  it('excludes historical days from forward screening', () => {
    const env = exerciseEnvironment(area, new Date('2026-01-01T00:00:00Z'));
    expect(plan(env).risk.rain24hMm).toBeNull(); expect(plan(env).risk.level).toBe('UNKNOWN');
  });
  it.each([59, 60, 119, 120])('applies area rainfall boundaries at %d mm', rain => {
    const env = exerciseEnvironment(area, now); env.days.forEach(d => { d.discharge = 100; d.rainMm = rain; });
    expect(plan(env).risk.level).toBe(rain >= 120 ? 'HIGH' : rain >= 60 ? 'ELEVATED' : 'MONITOR');
  });
  it('preserves low-count and stale SOS reports as review tasks, never dispatches', () => {
    const result = plan(undefined, { ...empty, reports: [{ id: 'sos-1', people: 1, trapped: true, medical: true, child: true, receivedAt: null }] });
    const action = result.actions.find(a => a.kind === 'REVIEW_RESCUE'); expect(action?.priority).toBe(95); expect(action?.detail).toContain('reverify'); expect(action?.requiredRole).toBe('RESPONDER');
  });
  it('finds unreached relief areas without negative needs after overdelivery', () => {
    const result = plan(undefined, { ...empty, relief: [{ id: 'need-1', areaName: 'A', waterNeed: 100, waterDelivered: 0, foodNeed: 10, foodDelivered: 0 }, { id: 'need-2', areaName: 'B', waterNeed: 100, waterDelivered: 500, foodNeed: 0, foodDelivered: 0 }] });
    expect(result.actions.filter(a => a.kind === 'REVIEW_RELIEF')).toHaveLength(1); expect(result.actions[0].sourceIds).toContain('need-1');
  });
  it('never guesses household location', () => {
    const result = personalizePlan(plan()); expect(result.shelterCandidates).toEqual([]); expect(result.locationStatus).toBe('LOCATION_UNKNOWN');
  });
  it('excludes full and closed shelters and preserves capacity on repeated requests', () => {
    const result = plan(undefined, { ...empty, shelters: [
      { id: 'full', name: 'Full', latitude: 23.22, longitude: 91.44, capacity: 10, occupied: 10, available: true },
      { id: 'closed', name: 'Closed', latitude: 23.22, longitude: 91.44, capacity: 10, occupied: 0, available: false },
      { id: 'open', name: 'Open', latitude: 23.23, longitude: 91.45, capacity: 10, occupied: 3, available: true },
    ] });
    const first = personalizePlan(result, 23.22, 91.44, 7); expect(first.shelterCandidates.map(s => s.id)).toEqual(['open']);
    expect(first.shelterCandidates[0].routeVerified).toBe(false); expect(personalizePlan(result, 23.22, 91.44, 8).shelterCandidates).toEqual([]);
    expect(personalizePlan(result, 23.22, 91.44, 7)).toEqual(first);
  });
  it('computes finite straight-line distances at identical and antipodal points', () => {
    expect(distanceKm(area, area)).toBe(0); expect(Number.isFinite(distanceKm({ latitude: 90, longitude: 0 }, { latitude: -90, longitude: 180 }))).toBe(true);
  });
});
