# API Contract — REST `/api/v1`

This is a contract target, not a claim that endpoints already exist. Antigravity must implement DTOs, validation, role guards, OpenAPI documentation and tests. Use a consistent JSON error envelope with `statusCode`, `code`, `message`, `requestId` and field details when relevant. Paginated collections return `items`, `page`, `pageSize`, `total`.

## Auth and health
- `GET /health` — liveness.
- `GET /api/v1/health` — API version/status.
- `GET /api/v1/health/readiness` — DB and essential dependency status.
- `POST /api/v1/auth/login` — `{ username, password }` -> access token, expiry and safe user profile.
- `GET /api/v1/auth/me` — current authenticated user.

## Shared operations context
- `GET /api/v1/operations/snapshot?mode=LIVE|EXERCISE|HISTORICAL&eventId=` — authenticated, role-projected operating picture. `mode` defaults to `EXERCISE` for backward compatibility. `LIVE` does not accept a synthetic/replay event ID; it includes current API-submitted reports for active events, BMD CAP RSS source status and separate public CAP advisory records. BMD CAP records include issue/effective/expiry timestamps, fetched time, original source URL and external-observation provenance; only `Actual`, effective and unexpired `Alert`/`Update` records are emitted, and cancellation/supersession references are applied. Feed build time is reported separately from fetch time. CAP advisories do not become Aali rule outputs, approvals or map markers. FFWC and GSMaP remain unavailable. `EXERCISE` accepts the active synthetic demo event. `HISTORICAL` accepts only seeded replay event IDs and returns reconstructed fixture metadata/ticks with source-verification status. An event ID from another mode returns `400`.
- Snapshot context includes selected mode/event, source availability, last check, latest observation time/age when known, and item provenance. API service health is not an external provider health signal.
- Role projection: Authority and Responder can see permitted SOS/incidents/assets; Volunteer receives village-level field reference and synthetic gauges but no rescue queue/shelters; Recovery Coordinator receives village-level recovery and shelter context but no gauges or rescue records/assets; Viewer receives reference layers and public source status without SOS/incident/asset records; Admin receives source/system status and aggregate queues, with no operational record details or rescue assets. Admin is not an implicit supervisor: it can only call routes that explicitly include `ADMIN`; warning approval and field/rescue/recovery write actions remain role-specific. Server route/action guards remain authoritative.
- Provenance values include `SYNTHETIC_FIXTURE`, `SYNTHETIC_SIMULATION`, `HISTORICAL_RECONSTRUCTION`, `API_SUBMITTED_REPORT`, `DETERMINISTIC_RULE_OUTPUT`, `AI_SUGGESTION`, `HUMAN_ACTION`, and `EXTERNAL_OBSERVATION`.
- Historical tick fixtures currently carry `FIXTURE_CITATIONS_NOT_YET_AUDITED`; this is an explicit source verification limitation, not a claim that the values are verified observations.

## Demo and reference data
- `GET /api/v1/events` — list flood/replay scenarios.
- `GET /api/v1/events/:eventId` — event details/provenance/mode.
- `GET /api/v1/areas?parentId=&type=&q=` — filter areas/villages.
- `GET /api/v1/shelters?areaId=&status=` — shelters and nearest safe options when coordinates are known.
- `GET /api/v1/assets?type=&status=&areaId=` — asset register for Authority and Responder only; Admin, Viewer, Volunteer, Recovery Coordinator and Resident do not receive rescue asset positions.
- `PATCH /api/v1/assets/:id` — authorized availability/status update; audit required.

## SOS and packet ingestion
- `POST /api/v1/sos` — authenticated/manual UI report JSON with `clientReportId`, optional event/area/GPS, people count, flags, source text and source type. Validate and persist; return report + transport/review state.
- `POST /api/v1/packets/decode` — validate packet without creating a report; safe for UI preview/testing.
- `POST /api/v1/gateway/simulated/ingest` — **demo only**, accepts `{ packet, gatewayId, receivedAt? }`, returns parsed report ID, idempotency result and explicit `simulation: true`.
- `GET /api/v1/sos?eventId=&areaId=&status=&urgency=&from=&to=&page=&pageSize=` — paginated inbox.
- `GET /api/v1/sos/:id` — report and provenance, role-filtered.
- `PATCH /api/v1/sos/:id/review` — mark triaged/needs-info/confirmed; require responder role and reason.

## Incidents, duplicates and assets
- `GET /api/v1/incidents?eventId=&status=&priority=&areaId=` — incident list/map data.
- `GET /api/v1/incidents/:id` — linked report summaries, scores, duplicate candidates and audit summary.
- `POST /api/v1/incidents/:id/duplicate-candidates/:candidateId/review` — `{ decision: "ACCEPT" | "REJECT", reason }`; responder role; transaction + audit.
- `POST /api/v1/incidents/:id/split` — identify reports to move into a new incident; explicit confirmation, transaction and audit.
- `GET /api/v1/incidents/silent-areas?eventId=` — computed flags with source data age and reason codes.
- `GET /api/v1/incidents/:id/asset-suggestions` — ordered suitable available assets and factor breakdown.
- `POST /api/v1/dispatch-suggestions/:id/review` — `{ decision: "ACCEPT" | "REJECT", reason }`; this stores a human decision only; it does not contact a boat.

## Flood alert and replay
- `GET /api/v1/observations?eventId=&gaugeId=&from=&to=` — historical/seeded observations with provenance.
- `POST /api/v1/alerts/evaluate` — run rules for event/area; must use configured thresholds and record evaluation.
- `GET /api/v1/alerts?eventId=&areaId=&level=` — current/recent evaluations.
- `POST /api/v1/replay/runs` — start/rewind a supported replay scenario.
- `GET /api/v1/replay/runs/:id` — state/current tick.
- `POST /api/v1/replay/runs/:id/step` — advance tick(s), recompute rule outputs.
- `PATCH /api/v1/replay/runs/:id/gauge-state` — `{ blanked: boolean }`; simulation-only; audit/log event.
- `GET /api/v1/replay/runs/:id/results` — alert timeline and computed lead-time with gaps and reconstructed labels.

## Warning approvals
- `POST /api/v1/warnings/drafts` — draft from an alert evaluation, target areas and known shelter facts; AI output remains untrusted draft text.
- `GET /api/v1/warnings?eventId=&state=` — authorized drafts/history.
- `GET /api/v1/warnings/:id` — warning body, source record IDs and approval history.
- `POST /api/v1/warnings/:id/approve` — Authority role only; reason required.
- `POST /api/v1/warnings/:id/reject` — Authority role only; reason required.
- `POST /api/v1/warnings/:id/send-simulated` — explicit simulation action after approval; never send a real external message by default.

## AI providers
- `POST /api/v1/ai/understand-sos` — input is synthetic or locally held text; returns schema-validated extracted fields, per-field confidence, provider mode and fallback status. Keep original content out of logs.
- `POST /api/v1/ai/duplicate-similarity` — accepts report IDs; only returns suggestion scores/reasons.
- `POST /api/v1/ai/draft-communication` — drafts Bangla text using supplied alert facts, named areas and shelter facts; output records the source IDs used.
- `GET /api/v1/ai/status` — reports `mock`, `local`, `unavailable`, etc.; never expose keys or provider URLs containing credentials.

## Recovery and audit
- `POST /api/v1/recovery/reports` — create/update village need/damage report.
- `GET /api/v1/recovery/reports?eventId=&areaId=&need=&status=` — filtered records.
- `GET /api/v1/recovery/summary?eventId=` — ranked needs and village coverage; include calculation explanation.
- `POST /api/v1/recovery/deliveries` — record an aid receipt with idempotency key.
- `GET /api/v1/recovery/deliveries?eventId=&areaId=` — delivery ledger.
- `GET /api/v1/audit?entityType=&entityId=&from=&to=` — role-guarded audit query.

## API rules
- Validate all IDs, enum values, ranges, event ownership, counts and coordinate bounds.
- Use explicit status codes and idempotency for retry-prone write endpoints.
- Avoid placing full raw phone numbers in normal response payloads; expose only to authorized operational roles if later required.
- All decisions altering approved warnings, incident relationships, dispatch recommendation state or delivery records are transactional and audited.
- `simulation: true` must be returned for simulated gateway, satellite or delivery paths so the frontend can visibly label them.
