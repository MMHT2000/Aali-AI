// Local synthetic API audit. Exercises every registered operation, including
// guarded/invalid paths; a covered operation is not a claim of exhaustive safety.
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const origin = process.env.AALI_API_ORIGIN || 'http://127.0.0.1:3001';
const base = '/api/v1/';
const missing = 'ffffffff-ffff-4fff-8fff-ffffffffffff';
const event = '11111111-1111-1111-1111-111111111103';
const area = '22222222-2222-2222-2222-222222222205';
const results = [];
const covered = new Set();
const tokens = {};
async function call(method, url, body, role = 'authority', timeout = 35000) {
  const response = await fetch(origin + url, { method, headers: { 'Content-Type': 'application/json', ...(tokens[role] ? { Authorization: 'Bearer ' + tokens[role] } : {}) }, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(timeout) });
  const data = await response.json().catch(() => null);
  return { status: response.status, data };
}
async function check(operation, method, url, body, role, expected, label = 'functional') {
  covered.add(operation);
  let actual, error;
  try { const result = await call(method, url, body, role); actual = result.status; if (!expected.includes(actual)) error = 'Unexpected HTTP status'; }
  catch (failure) { actual = 'NETWORK_ERROR'; error = failure.message; }
  results.push({ operation, check: label, expected, actual, passed: !error, ...(error ? { error } : {}) });
  console.log(`${error ? 'FAIL' : 'PASS'} ${method} ${url} [${label}] ${actual}`);
}
function packet() {
  const prefix = 'A1|S|wh0xs6m|03|E0C1M0T1|261018-1400|AUDT'; let crc = 0xffff;
  for (const character of prefix) { crc ^= character.charCodeAt(0) << 8; for (let i = 0; i < 8; i++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff; }
  return prefix + '|' + crc.toString(36).toUpperCase().padStart(4, '0');
}
(async () => {
  const specResponse = await fetch(origin + '/api/docs-json'); if (!specResponse.ok) throw new Error('OpenAPI unavailable');
  const spec = await specResponse.json();
  for (const [role, username] of Object.entries({ authority: 'authority_dc', responder: 'responder_feni', recovery: 'recovery_coord', volunteer: 'volunteer_parshuram', viewer: 'viewer_guest', admin: 'admin' })) {
    const response = await call('POST', base + 'auth/login', { username, password: 'Admin123!' }, 'anonymous');
    if (response.status !== 201) throw new Error('Login failed for synthetic role ' + role);
    tokens[role] = response.data.accessToken;
  }
  const refs = await call('GET', base + 'events');
  const scenarios = await call('GET', base + 'replay/scenarios');
  const replay = await call('POST', base + 'replay/runs', { scenarioId: scenarios.data[0].id });
  const reports = await call('GET', base + 'sos');
  const incidents = await call('GET', base + 'incidents');
  const warnings = await call('GET', base + 'warnings');
  const rawPacket = packet();
  const sos = await call('POST', base + 'sos', { clientReportId: 'audit-' + randomUUID(), eventId: event, areaId: area, peopleCount: 3, isTrapped: true, messageOriginal: 'Synthetic API audit only' }, 'anonymous');
  const ids = { 'events/{id}': refs.data[0].id, 'sos/{id}': sos.data?.report?.id || reports.data[0]?.id || missing, 'incidents/{id}': incidents.data[0]?.id || missing, 'replay/runs/{id}': replay.data.runId, 'warnings/{id}/loudspeaker-audio': warnings.data[0]?.id || missing };
  const bodies = {
    'auth/login': { username: 'authority_dc', password: 'Admin123!' },
    'auth/resident-register': { fullName: 'Synthetic audit resident', phoneNumber: '01700000000', mockNid: 'not-valid' },
    'sos': { clientReportId: 'audit-second-' + randomUUID(), eventId: event, areaId: area, peopleCount: 2, isTrapped: false },
    'packets/decode': { packet: rawPacket }, 'sos/packet': { packet: rawPacket },
    'gateway/simulated/ingest': { packet: rawPacket, gatewayId: 'SYNTHETIC_AUDIT' }, 'gateway/sms': { packet: rawPacket, gatewayId: 'SYNTHETIC_AUDIT' },
    'alerts/evaluate': { areaId: area, areaName: 'Synthetic audit area', signalB: { rainfallMm: 100, windowMinutes: 180, minutesSinceObservation: 0 } },
    'replay/runs': { scenarioId: scenarios.data[0].id },
    'replay/runs/{id}/step': { direction: 'NEXT' }, 'replay/runs/{id}/gauge-state': { blanked: false },
    'warnings/drafts': { eventId: event, areaId: area, areaName: 'Synthetic audit area', alertLevel: 'WATCH', supportingSignals: ['synthetic-audit'], shelterName: 'Unverified exercise shelter' },
    'ai/status/outage': { outage: false }, 'ai/understand-sos': { text: 'Synthetic exercise: 3 people trapped at Parshuram', forceFallback: true },
    'ai/duplicate-similarity': { leftReportText: 'Synthetic 3 people Parshuram', rightReportText: 'Synthetic 3 people Parshuram', spatialMatch: true },
    'ai/draft-communication': { alertLevel: 'WATCH', areaName: 'Synthetic area', shelterName: 'Exercise shelter', sourceRecordIds: ['synthetic-audit'] },
    'ai/shift-summary': { totalSos: 2, criticalEvacuations: 0, silentVillages: 0, deliveriesLogged: 0, recordIds: ['synthetic-audit'] },
    'ai/transcribe-voice-sos': { simulatedVoiceNoteId: 'synthetic-audit', dialect: 'feni' },
    'recovery/reports': { eventId: event, areaId: area, damageLevel: 'LOW', tubeWellContaminated: false, roadPassability: 'OPEN', needWater: false, needMedicine: false, needFood: false, reportedWaterLitresNeed: 0, reportedFoodPacksNeed: 0, evidenceNote: 'Synthetic audit record only' },
    'recovery/deliveries': { eventId: event, areaId: area, organizationLabel: 'Synthetic audit', itemCode: 'CLEAN_WATER', quantity: 1, unit: 'LITRES', idempotencyKey: 'audit-' + randomUUID(), receiptNote: 'Synthetic audit only' },
    'operations/demo-moment': { moment: 0, title: 'Synthetic API verification' },
    'field-readings': { areaId: area, levelM: 1, note: 'Synthetic API verification' },
    'simulation/speed': { speed: 1 }, 'simulation/connectivity': { internetAvailable: true }, 'simulation/gauge': { available: true }, 'simulation/tick': { tickIndex: 0 },
    'brain/household': { areaId: 'feni', mode: 'LIVE', people: 1 }, 'brain/run': { areaId: 'feni', mode: 'EXERCISE' }, 'brain/personalize': { areaId: 'feni', mode: 'EXERCISE', people: 1 },
    'brain/autonomy/control': { scope: 'kurigram', paused: false, reason: 'Synthetic API audit: retain autonomous monitoring' },
  };
  // The API audit must not replace existing needs, field readings, approvals,
  // or intervention controls. Their mutations use invalid input / missing IDs.
  const invalidOnly = new Set(['recovery/reports', 'recovery/deliveries', 'field-readings', 'warnings/drafts', 'brain/autonomy/control']);
  const publicRoutes = new Set(['GET /health', 'GET /api/v1/health', 'GET /api/v1/health/readiness', 'POST /api/v1/auth/login', 'POST /api/v1/auth/resident-register', 'POST /api/v1/sos', 'POST /api/v1/sos/packet', 'GET /api/v1/warnings', 'GET /api/v1/warnings/{id}/loudspeaker-audio', 'GET /api/v1/operations/live-stream', 'POST /api/v1/operations/demo-moment', 'GET /api/v1/brain/areas', 'POST /api/v1/brain/household']);
  for (const [route, verbs] of Object.entries(spec.paths)) for (const verb of Object.keys(verbs).filter(value => ['get', 'post', 'put', 'patch', 'delete'].includes(value))) {
    const method = verb.toUpperCase(), operation = method + ' ' + route, short = route.replace(base, '');
    if (short === 'operations/live-stream') {
      covered.add(operation);
      try { const response = await fetch(origin + route, { signal: AbortSignal.timeout(2000) }); const ok = response.status === 200 && response.headers.get('content-type')?.includes('text/event-stream'); await response.body.cancel(); results.push({ operation, check: 'SSE connection headers', actual: response.status, passed: !!ok }); }
      catch (error) { results.push({ operation, check: 'SSE connection headers', actual: error.message, passed: false }); }
      continue;
    }
    let role = short.startsWith('recovery/') && method === 'POST' ? 'recovery' : short === 'field-readings' ? 'volunteer' : short.startsWith('users/') && short !== 'users/responder-action' || short === 'ai/status/outage' ? 'admin' : short.startsWith('incidents/') && method === 'POST' || short === 'users/responder-action' ? 'responder' : 'authority';
    let url = route, expected = [method === 'GET' ? 200 : 201], body = method === 'GET' ? undefined : bodies[short] || {};
    if (method === 'PATCH' || method === 'PUT') expected = [200];
    if (short.includes('{')) {
      if (short.startsWith('replay/runs/')) url = route.replace('{id}', replay.data.runId);
      else if (method === 'GET' && ids[short]) url = route.replace('{id}', ids[short]);
      else { url = route.replaceAll('{id}', missing).replaceAll('{candidateId}', missing); body = short.includes('review') ? { decision: 'REJECT', reason: 'Synthetic audit missing record' } : short.endsWith('/split') ? { reportId: missing, reason: 'Synthetic audit missing record' } : {}; expected = short.startsWith('brain/runs/') ? [400] : [404]; }
    }
    if (method !== 'GET' && invalidOnly.has(short)) { body = {}; expected = [400]; }
    if (short === 'brain/latest') url += '?areaId=feni&mode=EXERCISE';
    if (short === 'auth/resident-register') expected = [400];
    if (method === 'GET' && short === 'recovery/summary') url += '?eventId=' + event;
    await check(operation, method, url, body, role, expected, method !== 'GET' && invalidOnly.has(short) ? 'invalid input rejected' : 'functional');
    if (!publicRoutes.has(operation)) await check(operation, method, url, method === 'GET' ? undefined : {}, 'anonymous', [401], 'authentication');
  }
  for (const endpoint of ['ai/understand-sos', 'ai/duplicate-similarity', 'alerts/evaluate', 'replay/runs']) await check('POST '+base+endpoint, 'POST', base+endpoint, {}, 'authority', [400], 'empty input');
  await check('PUT '+base+'ai/status/outage', 'PUT', base+'ai/status/outage', { outage: 'false' }, 'admin', [400], 'boolean string rejected');
  await check('POST '+base+'brain/autonomy/control', 'POST', base+'brain/autonomy/control', { scope: 'ALL', paused: true, reason: 'Unauthorized audit' }, 'responder', [403], 'role restriction');
  await check('GET '+base+'events/{id}', 'GET', base+'events/'+missing, undefined, 'authority', [404], 'unknown event');
  await check('GET '+base+'replay/runs/{id}', 'GET', base+'replay/runs/'+missing, undefined, 'authority', [404], 'unknown run');
  await check('GET '+base+'warnings/{id}/loudspeaker-audio', 'GET', base+'warnings/'+missing+'/loudspeaker-audio', undefined, 'anonymous', [404], 'unknown warning');
  await check('POST '+base+'replay/runs/{id}/step', 'POST', base+'replay/runs/'+replay.data.runId+'/step', { direction: 'SET_TICK', targetTick: 1.5 }, 'authority', [400], 'fractional replay index');
  // Check every role, district, and data mode using actual API projections.
  for (const role of Object.keys(tokens)) for (const districtCode of ['FENI_DIST','SYLHET_DIST']) for (const mode of ['LIVE','EXERCISE','HISTORICAL']) await check('GET '+base+'operations/snapshot', 'GET', base+'operations/snapshot?'+new URLSearchParams({mode,districtCode}), undefined, role, [200], role+'/'+districtCode+'/'+mode);
  const operations = Object.entries(spec.paths).flatMap(([route, verbs]) => Object.keys(verbs).filter(verb => ['get','post','put','patch','delete'].includes(verb)).map(verb=>verb.toUpperCase()+' '+route));
  const report = { generatedAt: new Date().toISOString(), operations: operations.length, coveredOperations: covered.size, checks: results.length, failed: results.filter(item=>!item.passed).length, uncovered: operations.filter(item=>!covered.has(item)), limitations: ['Synthetic local environment only; external carrier/dispatch integrations are not connected.', 'Some mutation routes are verified through validation, missing-record and authorization cases; happy-path state changes are covered separately by unit/integration tests.', 'External providers may change availability. This does not prove all field conditions or prediction accuracy.'], results };
  fs.mkdirSync(path.resolve(__dirname,'../docs/media'),{recursive:true});
  fs.writeFileSync(path.resolve(__dirname,'../docs/media/api-audit.json'), JSON.stringify(report,null,2));
  console.log(JSON.stringify({operations:report.operations,covered:report.coveredOperations,checks:report.checks,failed:report.failed,uncovered:report.uncovered}));
  if(report.failed || report.uncovered.length) process.exitCode=1;
})().catch(error=>{ console.error(error.message); process.exitCode=1; });
