# Aali AI â€” Detailed Implementation Plan

**Purpose:** turn the Aali AI Feni flash-flood resilience proposal (Detailed Plan Rev 3 and two-page proposal, dated 9 Oct 2026) into a practical, phased full-stack prototype.

## 0. Product definition and boundaries

Aali is an application/coordination layer around existing official data, phone/SMS capabilities and responders. It does not replace BWDB-FFWC, BMD, DDM, mobile operators, Red Crescent, Fire Service or local authorities. The prototype must demonstrate three moments:

1. **BEFORE â€” warn earlier:** combine river gauge trend/threshold, satellite rainfall and volunteer gauge readings; escalate if the gauge is silent under risky conditions; draft ward-level Bangla warning for approval.
2. **DURING â€” get SOS through and coordinate response:** create a compact SOS, queue offline, simulate gateway forwarding, put reports on a map, calculate explainable confidence, identify likely duplicates, flag silent villages and rank suitable available boats/assets for human review.
3. **AFTER â€” recover fairly:** track village-level damage/needs and aid receipts; display unmet needs and coverage gaps without making eligibility decisions.

### Must-have demo features
- Three-tap Bangla-friendly SOS form with people count and urgency flags.
- Versioned one-message ASCII Disaster Packet; parser, checksum validation and idempotent ingestion.
- Offline browser outbox using IndexedDB and retry on app connectivity; clear queued/sent/failed state.
- Gateway phone simulator/adapter path; a visible label says simulation.
- Live-looking responder dashboard with map and a table/list fallback.
- Transparent confidence score and component breakdown.
- Duplicate suggestions based on text similarity plus place/time/count; accept/reject/split by operator.
- High-risk silent-village flag in a staged test; never infer safety from no reports.
- Historical replay selector for 19â€“24 Aug 2024 and 20â€“22 Jul 2025, provenance labels and a silent-gauge switch.
- Three-signal deterministic flood alert rules and Bangla warning drafts that require authority approval.
- Boat/asset priority suggestions with reasons; no automatic dispatch.
- AI workflow for Bangla/Banglish SOS extraction, duplicate suggestions and communication drafting; deterministic local mock and keyword fallback available.
- Basic village recovery board and aid-delivery receipts.
- Synthetic seed data, demo accounts, role-based views, audit log, usable empty/error/offline states.

### Explicitly simulated or adapter-only
Unless verified credentials/hardware/legal agreements are added separately, these are not real integrations: satellite SMS; access for subscribers of all operators; carrier-to-platform automatic forwarding; actual carrier SMS/cell-broadcast delivery; official flood feed ingestion; field-verified location accuracy; live rescue dispatch. Demo data and replay reconstructions must be labelled. A real external LLM is not required; use synthetic messages and local/mock providers by default.

## 1. Fixed implementation decisions

| Concern | Decision |
|---|---|
| Repository style | Modular monorepo: `apps/api`, `apps/web`, shared contracts only if genuinely useful |
| API | NestJS REST JSON under `/api/v1`; Swagger in development |
| Validation | NestJS DTO validation at every request boundary |
| Persistence | MySQL 8.4 LTS + TypeORM; committed migrations; `synchronize: false` |
| Frontend | React + TypeScript + Vite; React Router; typed API client; TanStack Query or a comparable query/cache library if it reduces boilerplate |
| Map | Leaflet with OpenStreetMap-compatible base layer; mock/local list fallback when network tiles are unavailable |
| Offline SOS | IndexedDB outbox; deterministic retry rules; no claim that a browser can send SMS without OS/carrier support |
| AI | `SosUnderstandingProvider`, `DuplicateSimilarityProvider`, `CommunicationDraftProvider`; deterministic local/mock implementation first; optional local model adapter later |
| Gateway | `SmsGatewayAdapter` interface + testable simulator endpoint; no undocumented dependence on Android SMS permissions |
| Authentication | JWT access tokens for prototype, seeded local accounts, role guards; never hard-code production secrets |
| Auditability | append-only application audit records for approvals and other consequential actions |
| Time | persist UTC; render in Asia/Dhaka |
| Tests | Jest for NestJS unit/integration tests; Vitest + React Testing Library for web; Playwright or Cypress E2E only after core flow is stable |

## 2. Phase-by-phase roadmap

> **Status correction (2026-10-10):** Historical phase completion labels and the 2026-10-09 Modification Track claims below were not a reliable acceptance audit. The Aali AI Product Overhaul acceptance criteria are now tracked separately at the end of this document; only items verified in the current repository and environment are called complete.

Each phase is a separate agent task. The agent must inspect the current code first and adapt if equivalent working code already exists. A phase is complete only when its exit gate passes and `docs/IMPLEMENTATION_LOG.md` is updated.

### Phase 0 â€” Repository discovery and baseline
**Tasks**
- Inspect current files, git status, installed runtimes, manifests, lockfiles and existing code.
- Record current commands and baseline test/build results; do not overwrite the user's work.
- Identify conflicts between repository and this specification; document any proposed adjustment.

**Deliverables:** baseline section in implementation log; confirmed plan with file map.

**Exit gate:** no unexplained destructive changes; known starting state and executable checks listed.

### Phase 1 â€” Monorepo scaffold and local development
**Tasks**
- Create `apps/api` NestJS and `apps/web` React/Vite projects with strict TypeScript.
- Add root scripts for dev, build, lint, typecheck, tests and database actions; use workspace tooling only if it simplifies Windows development.
- Add Docker Compose for MySQL health-checked service, persistent local volume and documented ports.
- Add `.env.example`, env validation, `.gitignore`, health endpoint and minimal web page that checks API health.
- Add API CORS configuration for local web origin, structured logging with redaction, `/api/v1/health` and Swagger.
- Ensure Windows PowerShell instructions are included; avoid relying exclusively on Unix-only scripts.

**Exit gate:** clean install, MySQL starts, API health works, web renders, typecheck/build pass, no secrets committed.

### Phase 2 â€” Domain model, migrations, auth and seed data
**Tasks**
- Implement entities/migrations for users/roles, flood events, areas/villages, gauges/observations, shelters, SOS reports, incidents/report links, assets, alerts/warnings, recovery reports/deliveries, gateway messages and audit events.
- Add explicit indexes for report time, event/area state, packet ID/checksum, incident status, geospatial lookup columns and audit time.
- Use foreign keys; define delete behavior. Do not cascade-delete audit history or reports needed for incident provenance.
- Implement JWT authentication and role guards for `ADMIN`, `AUTHORITY`, `RESPONDER`, `VOLUNTEER`, `RECOVERY_COORDINATOR`, `VIEWER`.
- Seed synthetic Feni map locations, villages, shelters, gauges, roads/weak embankment points, boats, users and scenario data. Include obvious demo-only markers/credentials in development docs.
- Add migration rollback policy and repeatable seed command.

**Exit gate:** fresh database migration + seed succeeds; auth role tests pass; unauthorized requests are rejected; seeded data is synthetic and deterministically reproducible.

### Phase 3 â€” Disaster Packet and SOS capture
**Tasks**
- Build a single canonical packet serializer/parser shared via an API contract or mirrored with contract tests.
- Implement schema/version validation, compact ASCII fields, geohash7, people count, urgency flags, timestamp/event context, short report ID and checksum.
- Preserve the illustrative Rev 3 example but resolve its flag-token ambiguity in `docs/DECISIONS_AND_ASSUMPTIONS.md`; keep encoding under one conventional ASCII SMS segment (under 160 characters). Avoid Bangla Unicode in the transport packet; Bangla text remains in app/SMS composer where appropriate.
- Provide parser outcomes: valid, unsupported version, malformed field, checksum mismatch, stale timestamp and exact duplicate. Never silently discard a malformed report; show a clear reason and let the receiver preserve it as an unparsed/manual-review item when safe.
- Implement three-tap SOS UI in Bangla and English, people count, elderly/child/medical/trapped flags, GPS with explicit permission, village/shelter fallback, local timestamp, local outbox ID and accessibility-friendly controls.
- Store unsent reports in IndexedDB and retry on `online`; expose pending/sent/failed states and a manual retry button.

**Exit gate:** round-trip packet tests; corrupted packet rejected with reason; offline queue survives refresh; SOS can be entered without GPS; simulated packet fits one ASCII SMS segment; all core controls usable on mobile-sized viewport.

### Phase 4 â€” Transport adapters and blackout demonstration
**Tasks**
- Define `TransportAdapter` / `SmsGatewayAdapter` interfaces with statuses and explicit failure reasons.
- Implement app API delivery, phone outbox, SMS composer/copy handoff and a Gateway Simulator that accepts a packet then posts it to the backend as a simulated operator gateway.
- Build a blackout mode for the demo that blocks app network submission but leaves the phone queue and simulated SMS/gateway path available to show fallback behavior. Do not fake browser-level real SMS transmission.
- Show attempt history: app internet, SMS handoff, satellite-simulation and queued waiting. Persist delivery trace records without claiming carrier-level delivery receipts.
- Add idempotency at packet ingestion to avoid creating duplicated reports after retry.

**Exit gate:** with internet submission disabled, a user can create the packet, use the labeled simulated fallback, and later see exactly one report in the dashboard. The demo labels all simulated stages.

### Phase 5 â€” Responder dashboard, confidence, incidents and asset ranking [COMPLETED]
**Tasks**
- Build routes/views: Dashboard, SOS Inbox, Incident Detail, Asset Register, Shelters/Areas, Alert Center, Replay, Recovery, Audit and Admin/Health.
- Provide KPI cards, map/list toggle, filters by event/area/status/urgency/confidence, source badges, status updates and a detail drawer/panel.
- Implement confidence formula exactly as specified below and display component-level reasons.
- Implement candidate duplicate detection using text similarity signal + same geohash7 cell + 30-minute window + similar people count. AI similarity is a suggestion; operator approves merge. Include split/unmerge correction path with audit record and linked report preservation.
- Implement silent-village detector using configured high hazard, high exposure, no reports for about 20 minutes while neighbor cells report; output `VERIFY_BY_SAFE_MEANS` with reasoning, not â€œsafeâ€.
- Implement asset/boat priority formula and rank only suitable, available assets; operator approves/rejects recommendation; log all decisions and reason codes.

**Exit gate:** unit tests cover score formula boundaries; dashboard updates from API; duplicate can be accepted/rejected/split; one high-risk silent village is flagged in fixtures; assets rank reproducibly; no auto-dispatch exists. (PASSED)

### Phase 6 â€” Flood alert rules, historical replay and warning approval [COMPLETED]
**Tasks**
- Create replay scenarios for 19â€“24 Aug 2024 and 20â€“22 Jul 2025 using only sourced/published readings entered as fixture data. Every record contains provenance, known gap and `reconstructed=true` metadata when applicable.
- Add playback controls, time slider/tick stepping, scenario title, event date and a visible â€œRECONSTRUCTED / NOT LIVEâ€ banner.
- Implement signals for Muhuri at Parshuram: (1) gauge rate-of-rise over prior 3 hours or level above the 12.05 m warning mark; (2) basin satellite rainfall signal including Tripura side; (3) volunteer staff-gauge reading via compact message. Starting values should be configurable, not hidden in UI code.
- Apply source rule: Watch if any one signal fires; Warning if any two; Act if all three or a breach is reported. If gauge data is silent for 60 minutes while rain or volunteer reading is high, raise the level by one step and show `GAUGE_SILENT` reason. Define the no-level-overflow rule clearly.
- Show which signals fired, source age, missing signals and alert history.
- Draft ward-level Bangla warning with incident context, affected wards, protective action and nearest shelter. Require an Authority role to approve; draft/approved/sent states must be separate. Sending stays simulated.
- Add a gauge-blanking switch in the replay. Demonstrate escalation only when the documented conditions are met.
- Calculate alert lead-time against the danger threshold during replay and show the actual computed number, even when negative/zero/unavailable; do not hard-code impressive values.

**Exit gate:** replay can be run from seed; changing/blanking gauge affects rules as expected; each alert shows why; warning is impossible to approve without Authority role; no claim of generalized ML forecast. (PASSED)

### Phase 7 â€” AI-assisted language features with fallback [COMPLETED]
**Tasks**
- Define provider interfaces and a deterministic mock provider first, with optional locally hosted model adapter behind environment configuration.
- Implement SOS understanding from Bangla/Banglish text and optional supplied voice transcript into strict validated JSON: people count, elderly, child, medical, trapped, location words, water trend and confidence per field. Preserve original text and let an operator correct values.
- For voice, support upload/transcript workflow or a clear transcription-adapter boundary; do not claim real-time voice transcription without implementing and testing it.
- Implement duplicate candidate explanation from similarity output while retaining deterministic geohash/time/count checks.
- Draft Bangla alerts, boat-rank explanations and shift summaries from known records only. Store source record IDs and keep every output editable. AI may not introduce unstated facts.
- Fallback chain: configured local model -> deterministic keyword parser/forms -> manual form. Expose provider status and demonstrate AI-unavailable mode.
- Include 30 synthetic messages with expected fields and report field accuracy and operator correction rate. Do not send personal data to remote inference.

**Exit gate:** contract tests validate AI JSON; malformed output falls back safely; all score/alert decisions remain rule-based; operator can inspect original content and edit extracted fields; benchmark report generated on synthetic set. (PASSED)

### Phase 8 â€” Recovery and aid ledger
**Tasks**
- Add reports for house damage level, tube-well status/contamination, crop/pond loss, road passability, water/medicine needs and local evidence notes.
- Aggregate needs by village and severity, track status/last update and calculate coverage from aid delivery receipts.
- Record delivery receipts with organization/volunteer actor, items/quantity/unit, recipient aggregate or village-level identifier, time and source reference; avoid unnecessary named beneficiary data.
- Present unmet-needs rank with human-readable reasons and an â€œaid deliveredâ€ ledger; never algorithmically decide who deserves aid.
- Allow published Sentinel-1 flood footprint image overlay as optional static backdrop; do not build a satellite-processing pipeline in scope.

**Exit gate:** needs can be entered, ranked transparently and marked served; receipts change coverage; duplicate receipts are guarded; the screen explains that rankings support coordination, not eligibility decisions.

### Phase 9 â€” Security, reliability, accessibility and demo freeze
**Tasks**
- Review role checks on every write/action endpoint, DTO validation, rate limits, CORS, auth/session behavior, safe error handling, logging redaction, environment variables, SQL/index/query behavior and migrations.
- Ensure audit trail covers warning approval, incident merge/split, dispatch recommendation acceptance/rejection and aid receipt changes.
- Add health/readiness checks, loading/empty/error states, request retry rules and stale-data indicators.
- Verify keyboard path, text contrast, labels, screen-reader status, Bangla fonts and small-screen SOS view.
- Add E2E journey: login -> create SOS -> simulate blackout/gateway packet -> view report -> handle duplicate -> view asset priority -> run replay and blank gauge -> approve warning -> record recovery need/delivery.
- Record timed demo backup video/run sheet; ensure every simulated integration is labelled.

**Exit gate:** all must-have acceptance tests pass, fresh setup documented, no unresolved critical security/logic defect, demo can run without external AI and with network-dependent map tiles unavailable.

### Phase 10 â€” Optional/stretch items (only after must-haves)
Order to cut if time runs out:
1. Flood-footprint visual overlay.
2. Rich recovery-board charts (replace with clear static summary if necessary).
3. AI shift summaries.
4. Pre-positioning/staging suggestions.
5. Learned river-rise baseline; only attempt if sufficient FFWC history can be obtained, otherwise omit.
6. One real satellite SMS test from a suitable no-coverage location, only if legally and technically possible; it remains a stretch goal and must not block the core demo.

Never cut: blackout SOS fallback demonstration; AI-assisted Bangla SOS reading or its deterministic fallback demo; replay alert with silent-gauge switch; responder dashboard with confidence and duplicate review; silent-village flag; human approval gates.

## 3. Business rules to implement and test

### Confidence score
Starting rule from the proposal:
- Base by source: responder `0.90`, known volunteer `0.75`, new user `0.40`.
- Add `0.15` per independent report within 300 m and 30 minutes, capped at `+0.30`.
- Add `+0.10` when nearby gauge is above warning level or rainfall is heavy.
- Clamp final score to `[0, 1]` and show each contribution, applied cap and freshness.
- Road/water reports fade after 1â€“2 hours: implement a configurable freshness window (default 90 minutes for prototype) and display stale status. Do not erase source records.
- Confidence is context for responders, not a gate that blocks an SOS.

### Duplicate candidates
- Candidate window: 30 minutes; candidate spatial cell: same geohash7; similar people count increases match strength.
- Combine deterministic location/time/count evidence with text-similarity provider output.
- Keep source reports immutable and linked to an incident. Operator can merge, reject or split; preserve provenance and audit each change.
- Exact duplicate transport retry is an ingestion/idempotency concern and must not create another report.

### Silent village
Flag when all configured fixture/rule conditions hold: alert level Warning or higher, exposure high, no reports in approximately 20 minutes, and neighboring cells are reporting. Phrase the action as â€œverify by safe meansâ€; never infer the village is safe.

### Boat/asset priority
Use the proposal's starting weights:
`priority = 0.30 * people_at_risk + 0.25 * vulnerability_flags + 0.20 * confidence + 0.15 * water_trend + 0.10 * time_waiting`.
- Normalize every input to `[0,1]`, document the normalization and test it.
- Filter unavailable/inappropriate assets first; then show a suggested suitable asset and factor breakdown.
- Operator alone accepts/rejects the recommendation. No automatic dispatch.

### Three-signal alert
- Signal A: gauge rate-of-rise over the prior 3 hours **or** gauge level above the configured warning mark (12.05 m in proposal).
- Signal B: basin satellite rainfall threshold.
- Signal C: recent volunteer staff-gauge reading.
- Watch: any one signal; Warning: any two; Act: all three **or** reported breach.
- Gauge silent at least 60 minutes while rainfall or volunteer reading is high -> raise level one step and add reason `GAUGE_SILENT`.
- The specific rainfall thresholds/rise-rate settings must be configuration data with provenance and labeled â€œprototype starting values.â€ Do not present them as validated forecasting thresholds.

## 4. Suggested final project tree

```text
.
â”œâ”€â”€ AGENTS.md
â”œâ”€â”€ PROMPT_START_HERE.md
â”œâ”€â”€ IMPLEMENTATION_PLAN.md
â”œâ”€â”€ docker-compose.yml
â”œâ”€â”€ .env.example
â”œâ”€â”€ apps/
â”‚   â”œâ”€â”€ api/                   # NestJS modules, DTOs, providers, entities, migrations
â”‚   â””â”€â”€ web/                   # React/Vite routes, views, hooks, API client, offline outbox
â”œâ”€â”€ packages/
â”‚   â””â”€â”€ contracts/             # optional shared packet/API types; add only if beneficial
â”œâ”€â”€ docs/                      # this specification, decisions, test plan, implementation log
â””â”€â”€ .agents/
    â”œâ”€â”€ rules/
    â”œâ”€â”€ skills/
    â””â”€â”€ agents/
```

Suggested Nest modules: `AuthModule`, `UsersModule`, `FloodEventsModule`, `AreasModule`, `GaugesModule`, `RainfallModule`, `AlertRulesModule`, `WarningsModule`, `SosModule`, `PacketsModule`, `GatewayModule`, `IncidentsModule`, `AssetsModule`, `SheltersModule`, `ReplayModule`, `AiModule`, `RecoveryModule`, `AuditModule`, `HealthModule`.

Suggested web feature areas: `auth`, `dashboard`, `sos`, `incidents`, `alerts`, `replay`, `assets`, `shelters`, `recovery`, `audit`, `settings`, `shared`.

## 5. Required commands and verification

Antigravity must define root or per-package scripts and document their actual names. At minimum there must be runnable equivalents for:
- install dependencies reproducibly from lockfiles;
- start/stop MySQL;
- apply and revert/inspect migrations;
- seed demo fixtures;
- start API and web in development;
- lint;
- strict typecheck;
- unit/integration tests;
- production build;
- E2E acceptance test after the skeleton is stable.

The plan must not hard-code commands that don't exist. If the monorepo uses separate package scripts, list them clearly. Always verify in a fresh checkout/setup before the final demo.

## 6. Final acceptance gate

The prototype is ready only when a reviewer can, using synthetic data and the written runbook:
1. Start MySQL, API and React client from a fresh checkout.
2. Log in using a seeded role and see access-appropriate views.
3. Submit a three-tap SOS with no internet and no GPS; see it queue locally.
4. Send the packet through the labeled gateway simulator and see it arrive exactly once.
5. Open the incident, inspect confidence reasons and a duplicate suggestion; accept/reject/split with audit trail.
6. Observe the silent-village flag under a reproducible scenario.
7. Play a labelled flood replay and blank the gauge to demonstrate the documented escalation.
8. Draft a Bangla warning and show that only an Authority can approve it; external delivery remains simulated.
9. Inspect a suitable boat recommendation and its score reasons without auto-dispatch.
10. Record needs and aid receipts, then see village-level unmet-needs coverage update.
11. Disable AI provider and show keyword/manual fallback while core rules still work.
12. Pass lint, typecheck, relevant unit/integration tests and builds; report any test that could not be run.

## 7. Checklist

- [x] Phase 0 â€” discovery and baseline
- [x] Phase 1 â€” scaffold and local development
- [x] Phase 2 â€” schema, migrations, auth and seeds
- [x] Phase 3 â€” packet and offline SOS
- [x] Phase 4 â€” transport simulation
- [x] Phase 5 â€” responder dashboard and deterministic rules
- [x] Phase 6 â€” flood replay and warning approval
- [x] Phase 7 â€” AI language layer and fallback
- [x] Phase 8 â€” recovery ledger
- [x] Phase 9 â€” security, accessibility, E2E and demo freeze
- [x] Phase 10 â€” optional stretch items only if time remains

## 8. Modification Track (Hackathon Product Evolution)
- [x] Mod 1: Mock NID format (10/17 digits) & resident registration API with SHA-256 minimization
- [x] Mod 2: Central Control Room layout & dedicated role-aware operations tabs
- [x] Mod 3: Interactive Resident Client Simulator with online/offline queue and gateway handoff
- [x] Mod 4: Configurable primary/backup LLM failover seam with strict PII protections
- [x] Mod 5: Independent Flutter resident mobile app (`apps/mobile`) with setup instructions

## 9. Aali AI Product Overhaul â€” Current Acceptance Status (2026-10-10)

This status supersedes earlier blanket completion labels where they conflict with the verified state below. Historical Mod 1â€“5 UI presence is not evidence that its full end-to-end behavior passed.

### Verified in this work
- [x] XAMPP MySQL at `127.0.0.1:3306` connects; versioned migrations run with TypeORM `synchronize: false`; readiness reports MySQL up.
- [x] JWT is enforced globally except explicitly public health/onboarding and SOS intake; operational controllers carry role guards; warning approval uses the authenticated actor.
- [x] Resident mock NID format and uniqueness are stored using a one-way keyed identifier hash and a database unique constraint. It is a format check, not identity verification.
- [x] SOS records use the MySQL repository and unique `client_report_id` for idempotency; live API smoke check created then deduplicated a report.
- [x] Deterministic scenario controls and role-aware operations snapshot API exist; alert level comes from deterministic rules; web polls every five seconds while the workspace is open.
- [x] Simulation tick, speed and connectivity override persist through a versioned migration; API restart restores the tick paused. A live XAMPP restart smoke check restored tick 2 as paused.
- [x] Map-first Authority workspace uses API layer data, OSM attribution, layer controls, provenance and list fallback. Navigation is distinct for Authority/Admin, Responder, Volunteer, Recovery Coordinator and Viewer.
- [x] Volunteer field reporting writes an API-backed observation; SMS remains an explicit composer handoff, not delivery.
- [x] Incidents, warnings drafts/approvals, recovery reports and aid delivery ledger are durably persisted through TypeORM MySQL repositories (`warnings`, `recovery_reports`, `aid_deliveries`, `incidents`).
- [x] Service actor context and security audit logging are consistently attributed to authenticated users for warnings, incidents, aid deliveries, and volunteer field reports.
- [x] Expanded API authorization suite (`authorization.e2e.spec.ts`) verifies forbidden routes (403) and authorized capabilities for every role (Viewer, Volunteer, Recovery Coordinator, Responder, Authority, Admin).
- [x] Endpoint role declarations are enforced exactly; Admin has no implicit bypass. Authorization tests cover Authority-only warning approval, Responder-only rescue decisions, Volunteer field entry, Recovery Coordinator writes, restricted rescue-asset access, and role-projected snapshot layers.
- [x] Resident Simulator aligned with backend `CreateSosDto` and `SimulatedGatewayIngestDto`, utilizing CRC16-CCITT Base36 disaster packet encoding and authenticated API fetch.
- [x] Flutter mobile client (`apps/mobile/`) generated with native Android Gradle scaffold; `flutter analyze` passes with 0 issues; Dart unit tests pass 10/10.
- [x] Android uses a Material 3 resident flow plus authenticated, role-matched Responder and Volunteer workspaces. The mobile API contract includes village type metadata and responder actions remain human-reviewed.
- [x] Local Android execution verified: Android Studio, OpenJDK 21, Android SDK Platform 36, and NDK 28 integrated; `app-debug.apk` successfully compiled via `flutter build apk --debug`.
- [x] Live Google Gemini Flash integration verified: `@google/genai` provider operational with strict PII sanitization (phone/NID/GPS redacting) and automatic deterministic failover on timeout or 503.
- [x] Flutter mobile client enhanced: Added dynamic Wi-Fi/LAN Server IP configuration dialog, in-app Cellular Blackout simulation switch, and Satellite D2C simulation relay action.
- [x] Web typecheck, lint, tests (30/30) and production build pass; API typecheck, lint and tests (94/94 across 21 suites) pass.

### Still incomplete or limited
- [ ] Sentinel-1 SAR flood footprint in the recovery ledger is a simulated visual overlay, not a live satellite feed.
- [ ] Emergency telecom gateway and satellite forwarding remain explicitly labelled simulations for demo safety.

## 10. Web and Android UI Redesign Plans (2026-10-10)

These are approved redesigns being delivered in reviewable increments. The present map/API/role implementation remains the functional baseline and must be preserved where it works.

- [ ] Web: implement the persistent, role-aware Feni Operations Control Room described in [`docs/WEB_UI_REDESIGN_PLAN.md`](docs/WEB_UI_REDESIGN_PLAN.md): map-centered Authority situation room, triage queue, evidence drawer, distinct role workspaces, and explicit provenance/freshness states.
- [ ] Android: implement the emergency-first Resident experience and focused authenticated Responder/Volunteer field workspaces described in [`docs/ANDROID_UI_REDESIGN_PLAN.md`](docs/ANDROID_UI_REDESIGN_PLAN.md): SOS entry without a profile/login barrier, short report flow, truthful API/outbox/SMS states, and accessible field tasks.
- **Current redesign progress:** Product/data/access audit is recorded in [`docs/PRODUCT_DATA_ACCESS_AUDIT.md`](docs/PRODUCT_DATA_ACCESS_AUDIT.md). The API snapshot accepts shared Live / Exercise / Historical event context, emits provenance/source status and role-specific layers. BMD CAP RSS/XML is connected as a separately-provenanced public advisory; its feed can be stale. FFWC developer access and JAXA registration remain unconfirmed; CAP polygons are not rendered. Role-specific web homes exist, the responder exercise desk now has a focused triage layout, and the API role guard enforces explicit route grants without implicit Admin bypass. Role-matrix endpoint and projection tests cover major boundaries; record-level ownership, full UI workflows and responsive review remain incomplete. Do not treat API health as source-feed freshness. Detailed verified status is in `docs/WEB_UI_REDESIGN_PLAN.md`, `docs/PRODUCT_DATA_ACCESS_AUDIT.md` and the implementation log. Android redesign remains incomplete.
- [ ] Before UI implementation, capture route screenshots and complete the UTF-8/Bangla rendering inventory for both clients.
- [ ] Preserve backend role enforcement, deterministic rule semantics, API contracts, human approval gates and demo/synthetic disclosures. Any required API/security changes must be separately scoped and tested.
- [ ] Implement each platform in reviewable increments and mark acceptance criteria complete only after role-by-role, responsive/accessibility and real API-flow checks.
- **Design tools installed:** `figma-create-design-system-rules` and `figma-generate-design` in the local Codex skills directory. Their Figma workflows require an available Figma MCP connection; direct codebase implementation does not.

