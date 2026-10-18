// Local synthetic smoke against a running API and migrated MySQL. No external operational action.
const assert = require('assert/strict');
const base = process.env.AALI_API_URL || 'http://127.0.0.1:3001/api/v1';
async function api(path, body, token, expected = body ? 201 : 200) {
  const response = await fetch(`${base}/${path}`, { method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const result = await response.json(); assert.equal(response.status, expected, `${path}: expected ${expected}, received ${response.status}: ${JSON.stringify(result)}`); return result;
}
async function login(username) { return (await api('auth/login', { username, password: 'Admin123!' })).accessToken; }
(async () => {
  assert.equal((await api('health/readiness')).status, 'ready');
  const areas = await api('brain/areas'); assert.equal(areas.length, 6);
  const authority = await login('authority_dc'); const responder = await login('responder_feni'); const recovery = await login('recovery_coord');
  const plan = await api('brain/run', { areaId: 'feni', mode: 'EXERCISE' }, authority);
  assert.equal(plan.mode, 'EXERCISE'); assert.equal(plan.risk.level, 'HIGH'); assert.ok(['LOCAL_PLANNER', 'OPENAI'].includes(plan.agent.provider));
  if (process.env.AALI_REQUIRE_OPENAI === 'true') assert.equal(plan.agent.provider, 'OPENAI', `Expected real GPT, received ${plan.agent.status}`);
  assert.ok(plan.actions.some(a => a.kind === 'REVIEW_RELIEF'));
  const action = plan.actions.find(a => a.requiredRole === 'AUTHORITY' && ['PENDING_REVIEW', 'READY'].includes(a.state)) || plan.actions.find(a => a.requiredRole === 'AUTHORITY' && a.state === 'ACKNOWLEDGED'); assert.ok(action, 'Authority preparation task required');
  const body = { actionId: action.id, decision: 'ACKNOWLEDGED', reason: 'Synthetic database smoke: evidence reviewed' };
  await api(`brain/runs/${plan.id}/review`, body, responder, 403);
  const [reviewed] = await Promise.all([api(`brain/runs/${plan.id}/review`, body, authority), api(`brain/runs/${plan.id}/review`, body, authority)]); assert.equal(reviewed.actions.find(a => a.id === action.id).state, 'ACKNOWLEDGED');
  await api(`brain/runs/${plan.id}/review`, body, authority);
  await api(`brain/runs/${plan.id}/review`, { ...body, decision: 'DISMISSED' }, authority, 409);
  const audit = await api(`audit-logs?entityType=BRAIN_RUN&entityId=${plan.id}`, undefined, authority);
  assert.equal(audit.filter(entry => entry.before_summary?.actionId === action.id).length, 1, 'Concurrent/idempotent review must have one audit entry');
  const saved = await api('brain/latest?areaId=feni&mode=EXERCISE', undefined, authority); assert.equal(saved.id, plan.id); assert.equal(saved.actions.find(a => a.id === action.id).state, 'ACKNOWLEDGED');
  const scoped = await api('brain/latest?areaId=feni&mode=EXERCISE', undefined, recovery); assert.equal(scoped.operations.reports.length, 0); assert.ok(scoped.actions.every(a => a.kind !== 'REVIEW_RESCUE'));
  await api('brain/personalize', { areaId: 'feni', mode: 'EXERCISE', latitude: 25.08, longitude: 91.75, people: 5 }, authority, 400);
  const personal = await api('brain/personalize', { areaId: 'feni', mode: 'EXERCISE', latitude: 23.22, longitude: 91.44, people: 5 }, authority); assert.ok(personal.shelterCandidates.length > 0); assert.ok(personal.shelterCandidates.every(s => s.routeVerified === false && s.bookingStatus === 'NOT_RESERVED'));
  const live = await api('brain/run', { areaId: 'feni', mode: 'LIVE' }, authority); assert.equal(live.operations.provenance, 'NO_VERIFIED_OPERATIONAL_DATA'); assert.equal(live.operations.reports.length, 0); assert.equal(live.operations.shelters.length, 0);
  const sylhet = await api('brain/run', { areaId: 'sylhet', mode: 'EXERCISE' }, authority); assert.equal(sylhet.areaId, 'sylhet'); assert.ok(sylhet.operations.shelters.every(s => s.latitude > 24)); assert.ok(sylhet.actions.every(a => a.id.startsWith('sylhet:')));
  console.log('PASS: actual MySQL save/read, role denial, transactional review, retry/conflict handling, scoped projection, GPS bounds, shelter candidates, live/exercise and Feni/Sylhet isolation.');
})().catch(error => { console.error(error.message); process.exitCode = 1; });
