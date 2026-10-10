# Security, Privacy and Life-Safety Guardrails

## Human control
- An Authority must approve each warning before any delivery step.
- Responders review duplicate merge/split, asset suggestions and dispatch decisions.
- No automated evacuation instruction, automatic dispatch, automatic aid eligibility decision or automatic rejection of low-confidence SOS.
- AI output is untrusted draft content. Never feed model output directly into alert level, confidence, boat priority or authority state.

## Data minimization
- Use synthetic data throughout the demo.
- Disaster Packet must not include names or exact street addresses; location uses geohash7 or a selected village where appropriate.
- Separate phone/sender reference from general dashboard payloads; hash or redact sender references in logs and simulator trace.
- Do not store real voice recordings; synthetic example transcripts are sufficient. If a real audio adapter is later added, require explicit retention and consent design first.
- Provide configurable retention/anonymization for phone identifiers and precise coordinates. Keep audit records without retaining unnecessary personal data.

## Authentication/authorization
- Hash passwords with a modern, standard password-hashing library; never store plaintext.
- Keep JWT signing secret in environment configuration and validate its strength in non-test environments.
- Protect all write routes with role guards; client-side route restrictions are only UX, not security.
- Scope volunteer and recovery roles to the data they need; avoid exposing contact numbers or raw reports to viewer roles.
- A role guard enforces the endpoint's declared role list exactly. `ADMIN` has no implicit operational or human-approval authority; include it only on explicit system oversight or synthetic-control routes. Warning approval is Authority-only, rescue triage is Responder-only, field entry is Volunteer-only, and recovery writes are Recovery-Coordinator-only.
- Reference endpoints may expose event/area/shelter metadata to roles that need location context. Rescue assets are limited to Authority and Responder. Snapshot projections must omit rescue records and unnecessary map layers for Volunteer, Recovery, Viewer and Admin roles, with role-matrix tests for both allowed and forbidden access.
- Enforce body size limits, rate limits, DTO validation and safe error responses.

## External services
- Default AI provider is local deterministic mock. Any optional remote provider must be explicit in env config, disabled by default and prevented from receiving PII by a tested redaction layer.
- Do not commit API keys, carrier credentials or actual phone numbers.
- Real operator, satellite, SMS, cell-broadcast and official data access requires separately authorized adapters and verification; do not imply it is active because an interface exists.

## Audit
Audit at least: warning approvals/rejections, simulated send actions, duplicate merge/reject/split, incident status changes, dispatch suggestion acceptance/rejection, asset availability changes, recovery report edits and aid receipts. Keep audit append-only in normal application flows. Record the actor, timestamp, action, entity, reason and safe summary of before/after state.

## UI wording
Prefer “suggested”, “reconstructed”, “simulated”, “needs verification”, “source stale” and “pending delivery”. Avoid “confirmed safe”, “sent by satellite” or “forecast proved” unless an actual verified provider/device event supports it.
