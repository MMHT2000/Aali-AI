# Architecture

## 1. System topology

```text
React + Vite client (online UI + IndexedDB outbox)
  ├─ Resident SOS flow
  ├─ Responder operations dashboard / replay / recovery
  ├─ Gateway Simulator page
  └─ typed API client
        │ HTTPS / JSON /api/v1
        ▼
NestJS modular monolith
  ├─ Auth / Users / RBAC
  ├─ SOS + Packet parser + Transport adapters
  ├─ Incidents + confidence + duplicate suggestions
  ├─ Flood signals + alert rules + replay + warning approval
  ├─ Assets / Shelters / Recovery
  ├─ AI provider interfaces + deterministic fallback
  ├─ Audit + Health
        │ TypeORM migrations / transactions
        ▼
MySQL 8.4

Optional adapters (disabled by default): local language model, real SMS provider,
official gauge/rainfall feeds, carrier gateway. In the demo, deterministic fixtures
and labelled simulators provide the expected observable behavior.
```

## 2. Backend module boundaries
- **AuthModule / UsersModule:** login, token validation, role guards, demo users.
- **FloodEventsModule / AreasModule:** event runs, upazilas/wards/villages, coordinates/exposure, event date and provenance.
- **GaugesModule / RainfallModule:** observations and source freshness.
- **AlertRulesModule:** pure deterministic functions; no AI dependency.
- **WarningsModule:** draft, review, approve, simulated delivery, audit event.
- **SosModule / PacketsModule:** DTO validation, packet parsing, SOS storage, idempotency, status transitions.
- **GatewayModule:** simulated gateway ingestion plus future adapter interfaces.
- **IncidentsModule:** report linkage, duplicate candidate workflow, confidence score and silent-village logic.
- **AssetsModule / SheltersModule:** availability, suitability, priority reasons.
- **ReplayModule:** fixture-backed event playback, gauge silence toggle and computed lead-time.
- **AiModule:** provider interfaces, local deterministic mock, strict schema and fallback.
- **RecoveryModule:** needs reports, deliveries, village-level coverage.
- **AuditModule:** append-only history for consequential updates.
- **HealthModule:** liveness/readiness, provider status and DB health.

Business rules should be pure functions in domain/service files, separated from controllers and database access. Controllers authenticate/validate inputs, services orchestrate, repositories persist. Keep one deployable API, not microservices.

## 3. Suggested directory layout

```text
apps/api/src/
  app.module.ts
  main.ts
  common/{auth,filters,interceptors,validation,errors}/
  config/
  modules/<domain>/{<domain>.module.ts,<domain>.controller.ts,<domain>.service.ts,dto/,entities/,tests/}
  domain/{packet,confidence,duplicate,alerts,boat-priority,silent-village}/
  database/{migrations,seeds}/

apps/web/src/
  app/{router,providers}/
  features/{auth,dashboard,sos,incidents,alerts,replay,assets,shelters,recovery,audit,settings}/
  components/{layout,forms,map,status,feedback}/
  lib/{api,auth,offline,packet,format,validation}/
  types/
```

## 4. Key sequence: SOS delivery
1. UI validates minimal form and creates a stable `clientReportId`.
2. Packet utility generates canonical ASCII packet and checksum.
3. Persist local draft/outbox record to IndexedDB before any network request.
4. Try normal API transport if online. If offline/failure, remain queued and reveal copy/open-SMS handoff. Do not mark delivered on copy/open action alone.
5. Gateway Simulator receives a user-submitted packet and posts it to the simulator endpoint.
6. API verifies grammar/checksum, parses fields, links transport trace, and ingests idempotently.
7. Report/incident service recomputes confidence and duplicate candidates; dashboard refreshes.
8. Append audit log for human review/merge/decision, not every typing keystroke.

## 5. Key sequence: warning approval
1. Rule engine evaluates evidence and produces level + reason codes.
2. Draft service uses only known alert/ward/shelter records to compose Bangla text.
3. Draft is saved as `PENDING_APPROVAL`, with provenance record IDs.
4. An authenticated Authority previews, edits, approves or rejects.
5. Approval event is recorded. Delivery is simulated and separately labelled; no external sending occurs by default.

## 6. Key sequence: duplicate review
1. Compute deterministic candidate subset by geohash7 and time window.
2. Add people-count similarity and optional AI text similarity.
3. Save candidate score and reasons, not automatic merge.
4. Operator accepts/rejects or later splits an incident; preserve original reports and references.
5. Audit action, actor, time, reason and old/new incident linkage.

## 7. Reliability and failure behavior
- DB unavailable: API readiness fails; do not show a fake success state.
- AI unavailable/invalid JSON: fallback to keyword parser/manual form and show provider status.
- Map tiles unavailable: show list and cached/synthetic coordinates.
- Browser offline: store SOS locally and label pending. No assertion of transmission until server acknowledges ingestion.
- Gateway simulator down: retain packet for retry and show failure; do not auto-create duplicate reports.
- Missing official feed: use labelled replay fixture or “data unavailable”, never an invented live observation.
