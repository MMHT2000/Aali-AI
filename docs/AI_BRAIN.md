# AI Brain — implemented capabilities and boundaries

Implemented 18 October 2026. A decision-support prototype, not an operational emergency service or validated flood-prediction model.

## Open the experience

- Staff: sign in as Authority, Responder or Recovery Coordinator, then open **AI Brain · Area intelligence** at `/control-room/brain`.
- Residents: open `/preparedness` or the new preparation link on the sign-in screen. No account or GPS required.
- Live uses public environmental sources. Exercise uses clearly marked synthetic weather and event-scoped exercise records. Current forecasts cannot be mixed with Historical replay.
- Area profiles: Feni, Sylhet, Sunamganj, Kurigram, Sirajganj and Chattogram. Only Feni and Sylhet have local exercise records; other areas do not inherit Feni data.

## Setup

Keep the user's key only in the repository-root `.env`, never in a frontend/VITE variable:

```dotenv
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
BRAIN_AUTORUN_ENABLED=true
```

Add the key to enable GPT. Without it, the local planner works and the interface identifies the fallback. Real GPT inference was verified on 18 October 2026 after the user's key was configured: direct synthetic review and saved Feni Live/Exercise and Sylhet Exercise plans used OpenAI successfully. The key is not in this document or example configuration. The older language-assistant integration is separate. See [the readiness review](AI_READINESS_REVIEW.md).

`BRAIN_AUTORUN_ENABLED=true` starts a full sweep at server startup and every 15 minutes. All six live profiles and the separate Feni/Sylhet exercises are refreshed without an open browser. Per-area failures are isolated; retries occur on the next sweep. Overlapping sweeps are skipped and shutdown stops subsequent work. Automatic GPT attempts are limited to one per area/mode/hour within a process; unchanged successful briefings are reused with valid action references. Saved successful GPT plans also inform the cooldown after restart. Failure cooldowns and worker status are in memory; this is a single-process scheduler, without distributed ownership. Staff pages read saved results every 15 seconds. No external messages or operational commitments are sent.

The registered migration `1792280000000-BrainRuns` adds `brain_runs`. The existing database lifecycle runs migrations. Persisted staff analyses require MySQL; public household guidance can fetch environmental data without it. Schema synchronization remains disabled.

## Public evidence

| Source | Implementation | Limits |
| --- | --- | --- |
| [Open-Meteo Flood API](https://open-meteo.com/en/docs/flood-api), Copernicus GloFAS | Seven UTC-day river-discharge values, P25/P75 ensembles and selected grid coordinates | ~5 km model. River selection may be wrong. Discharge is not flood depth, street inundation or calibrated flood probability. |
| [Open-Meteo Weather API](https://open-meteo.com/en/docs) | Seven UTC-day rainfall totals | Numerical forecast, not satellite-observed precipitation. Current-day total is not a rolling future 24-hour accumulation. |
| [Element 84 Earth Search](https://earth-search.aws.element84.com/v1/api.html), Copernicus Sentinel-2 L2A | Recent scene records, acquisition times, cloud cover and available thumbnails | Optical context only; no raster water segmentation, flood-extent estimation or satellite-derived prediction. |

No keys are needed for these requests. Open-Meteo's hosted free access is for non-commercial use subject to its [terms](https://open-meteo.com/en/terms). Source links and attribution appear in the UI. Provider availability is outside Aali's control.

Requests use fixed provider hosts, timeouts, bounded response parsing, UTC-date alignment, unit checks, null preservation, per-area caching and concurrent-request coalescing. Scenes older than seven days are stale. Retrieval time is not a model issuance timestamp; issuance freshness is unavailable and explicitly disclosed.

## Experimental screening and automatic planning

The deterministic planner uses visible prototype thresholds:

- UNKNOWN if neither usable current-day rainfall nor enough forward river data exists.
- HIGH if rainfall meets the area's high threshold.
- ELEVATED if rainfall meets the watch threshold or discharge rises at least 40% over the available next three UTC days.
- MONITOR otherwise. This does not establish safety or account for absolute river danger levels.

Initial watch/high rainfall thresholds are 60/120 mm for most profiles and 70/140 mm for Sylhet/Sunamganj. They need local calibration. No model was trained on flood outcomes. A zero starting discharge never produces an infinite percentage.

Automatically generated tasks cover household preparation, missing-data verification, SOS review, shelter verification and relief gaps. Each has source IDs, an explainable priority and a required operational role. Live does not substitute seeded shelters, reports or relief records. Exercise reads the selected event's synthetic reports and needs/delivery records. Needs minus unit-compatible deliveries produce nonnegative relief gaps, not aid entitlement.

## GPT agent

Uses the [Responses API](https://developers.openai.com/api/docs/guides/function-calling), strict function schemas and structured output. Read-only allowlist:

- `read_forecast`
- `read_satellite`
- `read_operations`
- `read_proposed_actions`

At most six calls/seven turns share a 20-second timeout. GPT must inspect forecast and proposed actions before its answer is accepted. Unexpected tools/arguments, fabricated task IDs, malformed JSON, incomplete responses, provider errors and budget exhaustion retain the local plan. No raw SOS text, identity, phone or household GPS enters GPT; response storage is disabled. GPT text stays an unverified draft and cannot alter risk rules or operational state. Schema checks do not prove prose is factually correct.

## Human review and household guidance

Task acknowledgement/dismissal is role-specific, transactionally saved and audited with actor/reason. Matching retries are idempotent; conflicting decisions and analyses older than 30 minutes are rejected. Acknowledgement does not dispatch a boat, publish a warning, book a shelter or commit relief. Existing operational approval workflows remain separate.

GPS is optional, validated against the chosen area's bounds, used only for the current request and never stored by AI Brain. Shelter candidates use straight-line distances, exclude full/closed/undersized exercise shelters and make no booking or safe-route claim. Exercise occupancy is an explicit zero-occupancy fixture assumption. No verified live shelter or relief register is connected, so live availability stays unknown. Public household responses expose no operational report records.

## Verification

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run test:api
npm.cmd run test:web
npm.cmd run build
node scripts/verify_brain_live.cjs feni
node scripts/verify_brain_live.cjs all
node scripts/verify_brain_e2e.cjs
```

Tests cover rule boundaries, zero/missing/stale data, units and cache isolation, historical exclusion, GPS bounds/absence, shelter capacity, relief overdelivery, role projections, HTTP guards and DTO validation, concurrent runs, database outages, transactional review/idempotency, tool limits, fabricated IDs and provider failures. They do not cover every real-world flood/device/network.

Observed verification on 18 October 2026:

- Type checking: passed. Lint: zero errors, eight existing warnings.
- Backend: 176 tests passed across 32 suites, including 61 AI Brain tests. Web: 56 tests passed across 15 suites.
- Backend and frontend production builds: passed; Vite reports the existing bundle-size warning.
- Existing five-moment demo smoke: passed against the running API and actual MySQL.
- New AI Brain database smoke: passed against isolated MySQL 8.4.11, including migration, save/reload, concurrent/idempotent review with one audit entry, role denial, GPS bounds, shelter candidates and area/mode separation. Reviewed state survived an API restart.
- Browser checks in installed headless Chrome: real public guidance, real staff authentication/persisted analysis, and synthetic review flow passed. Desktop/mobile checks caught and fixed a two-pixel overflow in the existing demo stepper.
- Live-source calls returned GloFAS, weather and Sentinel-2 metadata for all six areas. Feni's newest scene was acquired 17 October 2026. [Saved public-source results](media/brain-live-verification.json) establish connectivity/parsing, not forecast accuracy or flood detection.
- Screenshots: [public mobile](media/brain-household-mobile.png), [staff with actual API and exercise records](media/brain-staff-live-api.png), [synthetic review browser fixture](media/brain-staff-desktop.png).

The optional browser smoke requires `playwright-core` through `AALI_PLAYWRIGHT_PATH`, installed Chrome and running local API/web servers. It does not add a production dependency. Temporary checksum-verified Node and MySQL runtimes were used because the initial environment had neither installed; no Windows service or global runtime installation was added.

## Remaining deployment work

- Keep testing real inference against held-out synthetic scenarios; initial live GPT verification passed.
- Obtain current verified shelters, occupancy, accessibility, roads, relief stock and field receipts for every area.
- Add explicit provenance/consent for real resident reports; do not promote synthetic records into Live mode.
- Validate river-cell selection and backtest locally calibrated predictions against held-out floods. Satellite raster segmentation and a trained predictor are not implemented.
- Connect approved notification/field partners; no external sending, rescue execution, reservation or aid allocation is automated here.
- Add native mobile household guidance; the new resident experience is currently web-based.
- Add distributed scheduling, operational monitoring, retention and production-scale scope controls before deployment.

## Autonomous monitoring verification ? 18 October 2026

Enabled in the local ignored `.env` and key-free example. `GET /api/v1/brain/autonomy/status` exposes authenticated worker health and per-area outcomes. `node scripts/verify_brain_autonomy.cjs` uses login and GET requests only; it verified saved background plans for all six live areas after API restart, without opening a browser or requesting a manual analysis. First sweep completed at 14:06:31 UTC. All live plans retained `NO_VERIFIED_OPERATIONAL_DATA`.

New tests cover area-failure isolation, full coverage, exercise separation, overlapping sweeps, shutdown, GPT failure cooldown and briefing reuse. Type checking and production builds passed; lint has zero errors and eight existing warnings. Web tests: 65 passed. Final backend suite: 180 tests passed across 32 suites, including the cooldown/reuse cases. Existing Vite bundle and React test warnings remain.

Always-on hosting and phone push/SMS delivery are not configured. Closing the browser is supported; switching off the API machine is not. Existing reviewed tasks are not silently approved by the worker. Verified field data, route safety, shelter reservations and real dispatch remain outside autonomous execution.
