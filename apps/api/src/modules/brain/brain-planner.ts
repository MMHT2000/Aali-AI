import { BrainAction, BrainArea, BrainPlan, EnvironmentalData, OperationalFacts } from './brain.types';

export function distanceKm(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }): number {
  const rad = Math.PI / 180;
  const h = Math.sin((b.latitude - a.latitude) * rad / 2) ** 2 + Math.cos(a.latitude * rad) * Math.cos(b.latitude * rad) * Math.sin((b.longitude - a.longitude) * rad / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(Math.min(1, Math.max(0, h))));
}

export function buildBrainPlan(id: string, area: BrainArea, mode: 'LIVE' | 'EXERCISE', environment: EnvironmentalData, operations: OperationalFacts, now = new Date()): BrainPlan {
  const current = now.toISOString().slice(0, 10);
  const upcoming = environment.days.filter(day => day.date >= current).slice(0, 3);
  const rain = upcoming[0]?.rainMm ?? null;
  const discharge = upcoming.map(day => day.discharge).filter((value): value is number => value !== null && Number.isFinite(value) && value >= 0);
  const rise = discharge.length >= 2 && discharge[0] > 0 ? Math.round((Math.max(...discharge) / discharge[0] - 1) * 100) : null;
  const ready = (provider: string) => environment.evidence.some(e => e.provider === provider && e.status === 'AVAILABLE');
  const hasRain = ready('OPEN_METEO_WEATHER') && rain !== null;
  const hasRiver = ready('OPEN_METEO_GLOFAS') && discharge.length >= 2;
  const level = !hasRain && !hasRiver ? 'UNKNOWN' : hasRain && rain >= area.rainHighMm ? 'HIGH' : (hasRain && rain >= area.rainWatchMm) || (hasRiver && rise !== null && rise >= 40) ? 'ELEVATED' : 'MONITOR';
  const reasons = [hasRain ? `Current UTC-day forecast rainfall: ${rain} mm; prototype watch/high thresholds ${area.rainWatchMm}/${area.rainHighMm} mm.` : 'Rainfall forecast unavailable or stale.', hasRiver ? `Modelled river discharge change over available next three days: ${rise ?? 'unknown'}%.` : 'River forecast unavailable or incomplete.'];
  const actions: BrainAction[] = [];
  const add = (kind: BrainAction['kind'], key: string, title: string, detail: string, priority: number, sourceIds: string[], requiredRole: BrainAction['requiredRole']) => actions.push({ id: `${area.id}:${kind}:${key}`, kind, title, detail, priority, sourceIds, requiredRole, state: kind === 'PREPARE' || kind === 'VERIFY_DATA' ? 'READY' : 'PENDING_REVIEW' });
  add('PREPARE', 'household', 'Prepare household essentials', 'Keep drinking water, prescribed medicines, documents and a charged phone accessible. Follow verified local authority updates. This is a preparation checklist, not an evacuation order.', level === 'HIGH' ? 85 : 35, environment.evidence.filter(e => e.status === 'AVAILABLE').map(e => e.id), 'AUTHORITY');
  if (!hasRain || !hasRiver || environment.evidence.some(e => e.status !== 'AVAILABLE')) add('VERIFY_DATA', 'sources', 'Verify missing or ageing sources', 'Missing observations mean unknown conditions. Seek current official and safe field verification before any operational action.', 80, environment.evidence.filter(e => e.status !== 'AVAILABLE').map(e => e.id), 'AUTHORITY');
  for (const report of operations.reports) {
    const priority = Math.min(100, 40 + (report.trapped ? 25 : 0) + (report.medical ? 20 : 0) + (report.child ? 10 : 0));
    const time = report.receivedAt ? new Date(report.receivedAt).getTime() : NaN;
    const stale = !Number.isFinite(time) || now.getTime() - time > 90 * 60000 || time > now.getTime() + 5 * 60000;
    add('REVIEW_RESCUE', report.id, `Review SOS · ${report.people} people reported`, `Report ${report.id}. ${stale ? 'Timestamp missing or stale; reverify conditions. ' : ''}Review original report, location and asset suitability. No boat is dispatched by this planner.`, priority, [report.id], 'RESPONDER');
  }
  for (const gap of operations.relief) {
    const water = Math.max(0, gap.waterNeed - gap.waterDelivered);
    const food = Math.max(0, gap.foodNeed - gap.foodDelivered);
    if (water || food) add('REVIEW_RELIEF', gap.id, `Coverage gap · ${gap.areaName}`, `Recorded unmet needs: ${water} litres water; ${food} food packs. These are recorded needs, not verified current demand or aid entitlement. Verify access and stock before planning delivery.`, water > 0 && gap.waterDelivered === 0 ? 90 : 65, [gap.id], 'RECOVERY_COORDINATOR');
  }
  if (operations.shelters.length) add('VERIFY_SHELTER', 'capacity', 'Check shelter availability and access', 'Candidate shelters are exercise fixtures. Confirm current capacity, accessibility and route conditions; proximity does not establish a safe route.', 70, operations.shelters.map(s => s.id), 'RESPONDER');
  actions.sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id));
  return { id, areaId: area.id, mode, createdAt: now.toISOString(), risk: { level, reasons, rain24hMm: hasRain ? rain : null, dischargeRisePercent: hasRiver ? rise : null, label: 'Experimental screening rules · not a calibrated flood probability or official warning' }, environment, operations, actions, agent: { provider: 'LOCAL_PLANNER', status: 'LOCAL_READY', summary: `${area.name}: ${level.toLowerCase()} screening signals. ${actions.length} preparation and review tasks generated. Human review remains required.`, focusActionIds: actions.slice(0, 3).map(a => a.id), trace: [] }, limitations: ['GloFAS is a coarse river-discharge model, not street-level inundation or flood-depth prediction; river-cell suitability is unverified.', 'Rainfall thresholds and percentage rise are prototype screening rules, not trained or validated forecasts.', 'Satellite imagery is dated optical context; clouds and revisit gaps limit visibility. No flood extent is inferred from thumbnails.', 'No automated warning publication, evacuation order, rescue dispatch, shelter booking, or aid commitment.', operations.provenance === 'SYNTHETIC_EXERCISE' ? 'Operational reports, shelters and recovery records in this plan are synthetic exercise data.' : 'Verified local shelter, rescue and relief records are unavailable. No fixture is substituted into Live mode.'] };
}

export function personalizePlan(plan: BrainPlan, latitude?: number, longitude?: number, people = 1) {
  const located = latitude !== undefined && longitude !== undefined;
  const candidates = !located ? [] : plan.operations.shelters.filter(s => s.available && s.capacity - s.occupied >= people).map(s => ({ ...s, remainingCapacity: Math.max(0, s.capacity - s.occupied), distanceKm: Math.round(distanceKm({ latitude, longitude }, s) * 10) / 10, routeVerified: false as const, bookingStatus: 'NOT_RESERVED' as const })).sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 3);
  return { preparation: ['Keep medicines, drinking water and documents accessible.', 'Keep your phone charged and an offline copy of your SOS details.', 'Follow verified local authority instructions; do not enter floodwater.'], shelterCandidates: candidates, locationStatus: located ? 'LOCATION_PROVIDED_NOT_STORED' : 'LOCATION_UNKNOWN', shelterStatus: !located ? 'Provide a location or use the area selector; no location is guessed.' : candidates.length ? 'Candidates require human verification; straight-line distance is not a route.' : 'No verified suitable shelter is available in this plan. Ask the local coordinator; availability is unknown.', aidStatus: 'No relief has been booked or dispatched.' };
}
