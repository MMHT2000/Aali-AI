# System audit and autonomous monitoring update

Verified locally on 18 October 2026 against the running NestJS API, MySQL 8.4 and Chrome. This audit covers registered HTTP operations and permitted web screens; it does not prove every possible flood, device or field condition.

## Results

- All 76 registered HTTP operations exercised across 185 checks; 0 failed checks. Expected validation, authorization and missing-record responses are checked explicitly.
- 27 browser checks passed: 25 permitted role/route screens, mobile map layout and blocked-basemap list fallback. No page crashes, unexpected API errors or horizontal overflow in that run.
- Actual browser intervention check: reason required, persisted area resume, reload state and corrected built-in packet decode passed.
- Actual MySQL intervention check: Kurigram pause and audit saved, pause survived API restart, Kurigram skipped while Feni continued; resumed through the browser afterward.
- Backend: 204 tests passed in 34 suites. Final briefing-fingerprint adjustment also passed the 27-test Brain service suite.
- Frontend: 65 tests passed in 16 suites. Type checks, backend/web production builds and lint passed. Final lint: zero errors and zero warnings.
- React test act/router notices and the Vite bundle-size advisory remain; they are recorded rather than suppressed.

## Problems corrected

| Finding | Result |
|---|---|
| Empty language requests produced HTTP 500 | Runtime DTO validation returns 400 before calling providers |
| Missing incident review/split records produced HTTP 500 | Explicit 404 responses |
| Missing event/replay IDs silently returned another record | Explicit 404; unsupported inputs return 400 |
| Runtime booleans could convert the string false to true | Strict body types; invalid strings rejected |
| Unrelated routes shared a rate-limit allowance | Per-controller/handler/client limits; arbitrary forwarded headers ignored |
| Public SSE exposed SOS and field details | Change notifications only; details fetched through authenticated snapshots |
| Map inserted fake Sylhet SOS as API-submitted data | Removed injection; records and counts scoped to district and event |
| Missing coordinates were plotted at guessed positions | Missing coordinates stay unknown and records remain in lists |
| Sylhet exercise reused historical/Feni context and form IDs | Dedicated event 106 and correct Sylhet area IDs |
| Admin navigation exposed actions forbidden by API | Oversight controls available; operational routes stay role-scoped |
| Audit UI used wrong timestamp/actor keys | Actual occurred_at/actor_user_id rendered in Asia/Dhaka |
| Judge inspector shipped an invalid packet and silently failed | Canonical packet generator, read-only decode endpoint and visible errors |
| Explicit zero GPS/needs were replaced by defaults | Nullish handling preserves zero |
| Delivery item/unit mismatch could distort coverage | Mismatches rejected; coverage respects units |
| Warning audio metadata implied an ungenerated WAV | Explicit SCRIPT_ONLY metadata, missing warning returns 404 |
| Simulated broadcast bypassed warning approval | Approval checked and simulated send audited |

## Autonomous operation and intervention

Monitoring and planning run at startup and every 15 minutes without an open browser. Preparation/data-gap guidance is automatically READY; its human review is optional. Unchanged reviewed/dismissed tasks carry forward with a reference to the original audited analysis. Changed evidence requires a fresh review.

Authority/Admin can pause all areas or one area with a reason. Controls are persisted in brain_controls by migration 1792290000000 and written transactionally with an audit entry. Each sweep reloads controls, and automatic publication rechecks controls after source/LLM requests. When controls cannot be read, automatic planning suspends. In-flight external reads can finish; no external write tool is attached. Resume takes effect on the next scheduled sweep. Manual analysis and task review remain available. Admin can access aggregate monitoring/intervention without reading operational plans.

The AI Brain page now includes an OpenStreetMap/Leaflet map of all six profiles, analysis bounds, GloFAS model cells and available synthetic shelters. It provides national/focused views, area selection, legends and a list fallback. Boundaries are analysis bounds, not inferred flood extent. Animation reflects actual sweep state or user navigation and respects reduced-motion preferences.

## Boundaries and unverified work

- All checks use synthetic local accounts and records. Some mutation routes are covered through validation/authentication/missing-record cases; this report does not claim every mutation received a happy-path end-to-end test.
- Verified live shelters, occupancy, safe road routes, relief stock and dispatch partners are not connected. No fixture substitutes for live field availability in AI Brain.
- External SMS/push wake-up delivery and real rescue execution are not implemented. Hosting must keep the API and database running.
- Satellite catalogue connectivity is not a trained flood predictor or raster flood segmentation. Prediction accuracy remains unvalidated.
- Scheduling is single-process; distributed locking, retention policy and production deployment remain work.
- Native Flutter flows were not executed because a Flutter runtime is unavailable here.

## Reproduce

```powershell
node scripts/audit_api.cjs
node scripts/audit_browser.cjs
node scripts/verify_brain_autonomy.cjs
# Synthetic intervention verification changes Kurigram only; restore with resume afterward.
node scripts/verify_brain_intervention.cjs pause
# Restart API, then:
node scripts/verify_brain_intervention.cjs check
node scripts/verify_brain_intervention.cjs resume
```

Browser checks require installed Chrome and playwright-core through AALI_PLAYWRIGHT_PATH. Runtime API audit writes synthetic SOS/packet/replay/simulation fixtures; it does not perform real sending.

## Every registered HTTP operation

| Operation | Checks | Observed statuses | Result |
|---|---:|---|---|
| `GET /health` | 1 | 200 | PASS |
| `GET /api/v1/health` | 1 | 200 | PASS |
| `GET /api/v1/health/readiness` | 1 | 200 | PASS |
| `POST /api/v1/auth/login` | 1 | 201 | PASS |
| `GET /api/v1/auth/me` | 2 | 200, 401 | PASS |
| `POST /api/v1/auth/resident-register` | 1 | 400 | PASS |
| `GET /api/v1/users/demo-accounts` | 2 | 200, 401 | PASS |
| `POST /api/v1/users/authority-action` | 2 | 201, 401 | PASS |
| `POST /api/v1/users/responder-action` | 2 | 201, 401 | PASS |
| `GET /api/v1/events` | 2 | 200, 401 | PASS |
| `GET /api/v1/events/{id}` | 3 | 200, 401, 404 | PASS |
| `GET /api/v1/areas` | 2 | 200, 401 | PASS |
| `GET /api/v1/shelters` | 2 | 200, 401 | PASS |
| `GET /api/v1/assets` | 2 | 200, 401 | PASS |
| `POST /api/v1/sos` | 1 | 201 | PASS |
| `GET /api/v1/sos` | 2 | 200, 401 | PASS |
| `POST /api/v1/packets/decode` | 2 | 201, 401 | PASS |
| `POST /api/v1/sos/packet` | 1 | 201 | PASS |
| `GET /api/v1/sos/{id}` | 2 | 200, 401 | PASS |
| `POST /api/v1/gateway/simulated/ingest` | 2 | 201, 401 | PASS |
| `POST /api/v1/gateway/sms` | 2 | 201, 401 | PASS |
| `GET /api/v1/gateway/simulated/traces` | 2 | 200, 401 | PASS |
| `GET /api/v1/incidents` | 2 | 200, 401 | PASS |
| `GET /api/v1/incidents/silent-areas` | 2 | 200, 401 | PASS |
| `GET /api/v1/incidents/{id}` | 2 | 200, 401 | PASS |
| `POST /api/v1/incidents/{id}/duplicate-candidates/{candidateId}/review` | 2 | 404, 401 | PASS |
| `POST /api/v1/incidents/{id}/split` | 2 | 404, 401 | PASS |
| `POST /api/v1/incidents/{id}/boat-recommendation/review` | 2 | 404, 401 | PASS |
| `POST /api/v1/incidents/{id}/review` | 2 | 404, 401 | PASS |
| `GET /api/v1/audit-logs` | 2 | 200, 401 | PASS |
| `POST /api/v1/alerts/evaluate` | 3 | 201, 401, 400 | PASS |
| `GET /api/v1/replay/scenarios` | 2 | 200, 401 | PASS |
| `POST /api/v1/replay/runs` | 3 | 201, 401, 400 | PASS |
| `GET /api/v1/replay/runs/{id}` | 3 | 200, 401, 404 | PASS |
| `POST /api/v1/replay/runs/{id}/step` | 3 | 201, 401, 400 | PASS |
| `PATCH /api/v1/replay/runs/{id}/gauge-state` | 2 | 200, 401 | PASS |
| `GET /api/v1/warnings` | 1 | 200 | PASS |
| `POST /api/v1/warnings/drafts` | 2 | 400, 401 | PASS |
| `POST /api/v1/warnings/{id}/approve` | 2 | 404, 401 | PASS |
| `POST /api/v1/warnings/{id}/reject` | 2 | 404, 401 | PASS |
| `POST /api/v1/warnings/{id}/send-simulated` | 2 | 404, 401 | PASS |
| `GET /api/v1/warnings/{id}/loudspeaker-audio` | 2 | 200, 404 | PASS |
| `GET /api/v1/ai/status` | 2 | 200, 401 | PASS |
| `PUT /api/v1/ai/status/outage` | 3 | 200, 401, 400 | PASS |
| `POST /api/v1/ai/understand-sos` | 3 | 201, 401, 400 | PASS |
| `POST /api/v1/ai/duplicate-similarity` | 3 | 201, 401, 400 | PASS |
| `POST /api/v1/ai/draft-communication` | 2 | 201, 401 | PASS |
| `GET /api/v1/ai/benchmark/samples` | 2 | 200, 401 | PASS |
| `GET /api/v1/ai/benchmark` | 2 | 200, 401 | PASS |
| `POST /api/v1/ai/shift-summary` | 2 | 201, 401 | PASS |
| `POST /api/v1/ai/transcribe-voice-sos` | 2 | 201, 401 | PASS |
| `POST /api/v1/recovery/reports` | 2 | 400, 401 | PASS |
| `GET /api/v1/recovery/reports` | 2 | 200, 401 | PASS |
| `POST /api/v1/recovery/deliveries` | 2 | 400, 401 | PASS |
| `GET /api/v1/recovery/deliveries` | 2 | 200, 401 | PASS |
| `GET /api/v1/recovery/summary` | 2 | 200, 401 | PASS |
| `GET /api/v1/operations/live-stream` | 1 | 200 | PASS |
| `POST /api/v1/operations/demo-moment` | 1 | 201 | PASS |
| `GET /api/v1/operations/snapshot` | 38 | 200, 401 | PASS |
| `POST /api/v1/field-readings` | 2 | 400, 401 | PASS |
| `POST /api/v1/simulation/start` | 2 | 201, 401 | PASS |
| `POST /api/v1/simulation/pause` | 2 | 201, 401 | PASS |
| `POST /api/v1/simulation/step` | 2 | 201, 401 | PASS |
| `POST /api/v1/simulation/reset` | 2 | 201, 401 | PASS |
| `PATCH /api/v1/simulation/speed` | 2 | 200, 401 | PASS |
| `PATCH /api/v1/simulation/connectivity` | 2 | 200, 401 | PASS |
| `PATCH /api/v1/simulation/gauge` | 2 | 200, 401 | PASS |
| `PATCH /api/v1/simulation/tick` | 2 | 200, 401 | PASS |
| `GET /api/v1/brain/autonomy/status` | 2 | 200, 401 | PASS |
| `POST /api/v1/brain/autonomy/control` | 3 | 400, 401, 403 | PASS |
| `GET /api/v1/brain/areas` | 1 | 200 | PASS |
| `POST /api/v1/brain/household` | 1 | 201 | PASS |
| `GET /api/v1/brain/latest` | 2 | 200, 401 | PASS |
| `POST /api/v1/brain/run` | 2 | 201, 401 | PASS |
| `POST /api/v1/brain/personalize` | 2 | 201, 401 | PASS |
| `POST /api/v1/brain/runs/{id}/review` | 2 | 400, 401 | PASS |

Machine-readable evidence: [API audit](media/api-audit.json), [browser audit](media/browser-audit.json). Visual evidence: [desktop map](media/brain-map-desktop.png), [mobile map](media/brain-map-mobile.png).

The older judge smoke was also repaired: it previously printed receipt success on HTTP 400. It now submits the actual DTO, requires 201, repeats the same key, verifies the same saved ID and asserts exactly one persisted receipt audit entry. The corrected synthetic smoke passed. Fabricated summary counts and claimed satellite transport were removed from its output.

Final follow-up verification: the actual MySQL aid_deliveries table contained the two newly tested synthetic receipts; no in-memory-only success was assumed. API CORS allowed the configured localhost web origin and omitted access permission for an untrusted origin. The final browser audit again passed all 27 checks.
