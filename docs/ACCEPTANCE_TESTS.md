# Acceptance and Test Plan

## Test pyramid
1. **Pure unit tests:** packet parser/serializer, checksum, confidence, boat priority normalization, alert signal mapping, silent-gauge escalation, silent-village criteria, duplicate candidate scoring and recovery coverage formula.
2. **Backend integration tests:** migrations, DTO validation, role guards, packet ingestion idempotency, merge/split transaction, authority-only approval, audit record creation, replay API and recovery delivery idempotency.
3. **Frontend component tests:** three-tap SOS, no-GPS fallback, offline/pending indicators, transport label, score explanation, duplicate review, replay gauge toggle, warning approval UI role restriction and recovery coverage.
4. **End-to-end acceptance:** one full synthetic rescue-to-recovery story using the seeded scenario.

## Must-pass scenarios

### A. Startup and roles
- Fresh database migration and seed succeed without manual SQL.
- API readiness fails cleanly when MySQL is unavailable and recovers when database returns.
- Unauthenticated users cannot call protected endpoints.
- Volunteer cannot approve official warning; Viewer cannot edit report; Authority can approve/reject warning.
- `ADMIN` does not bypass declared role lists: Admin may use explicit oversight/synthetic-control routes but cannot read SOS/incident detail, inspect rescue asset positions, approve warnings, or make responder/recovery field actions.
- Reference assets are available only to Authority and Responder; resident-safe area/shelter references remain available to their intended authenticated roles.
- Snapshot projection tests assert allowed and excluded layers for Authority, Responder, Volunteer, Recovery Coordinator, Viewer and Admin.

### B. SOS and packet
- SOS can be created with valid GPS.
- SOS can be created when geolocation is denied using village selection.
- SOS form is usable at mobile viewport width and keeps the primary path to three short steps.
- Serializer output round-trips through parser; packet is ASCII and below 160 characters.
- Wrong checksum, unsupported version, bad people count and invalid geohash return explicit parse errors.
- Same packet replayed with the same idempotency context creates one report and returns an idempotent acknowledgement.
- Offline submit persists to IndexedDB before network attempt; after browser refresh it remains pending.
- Reconnection/manual retry updates queue state only after server acknowledgement.
- Copying/opening SMS composer does not mark the SOS delivered.
- Gateway simulator response carries `simulation: true` and a visible UI label.

### C. Confidence and duplicates
- Source base values match proposal: responder .90, known volunteer .75, new user .40.
- Each independent corroboration within 300 m/30 min adds .15, with corroboration capped at .30.
- Applicable high gauge/heavy rain adds .10; final score is clamped to [0,1].
- Low score is visible but does not block or delete SOS.
- Duplicate candidate needs combined evidence; candidate includes reason codes and can be accepted/rejected.
- Merging keeps original reports and linkage provenance. Split operation is reversible enough to restore the separated report links.
- AI down/invalid output leaves deterministic candidate logic available.

### D. Silent village and assets
- At Warning+ with high exposure, no reports for threshold interval and neighboring reports, fixture area appears with `VERIFY_BY_SAFE_MEANS`.
- No reports alone do not trigger a “safe” state.
- Asset suggestions exclude unavailable or unsuitable boats.
- Score factors sum using normalized inputs and display the same value as API.
- Accept/reject changes suggestion state and audit record; no dispatch message is sent.

### E. Alert replay and warning
- Test each of the three signals independently; one -> Watch, two -> Warning, three -> Act.
- A reported breach triggers Act.
- Silent gauge at 60 minutes plus high rainfall or volunteer reading raises alert one step and records `GAUGE_SILENT`.
- Missing data shows missing/aged source state instead of fake zero measurement.
- Gauge toggle changes subsequent evaluation and is represented in the replay trace.
- Replay header says reconstructed/not live; lead time is calculated from fixture timestamps, not hard-coded.
- Warning draft cites its supporting records; only Authority can approve; approval is separately audited.
- Sending warning is simulation-only and distinctly labelled.

### F. AI and fallback
- 30 synthetic Bangla/Banglish messages have expected fields and reproducible measured field accuracy.
- AI returns strict schema or is rejected; malformed output falls back to keyword/manual form.
- Original text remains visible to authorized reviewers; model cannot write alert level or boat score.
- Language draft uses only facts provided in its source IDs and remains editable.
- AI unavailable does not break packet decoding, confidence, alert rules or manual SOS creation.

### G. Recovery
- Need/damage report is saved against a village and event.
- Need ranking exposes transparent inputs/reasons.
- Aid receipt updates village coverage and unmet amount/need summary.
- Duplicate idempotency key cannot double-count delivery.
- No eligibility or “deservingness” decision is produced.

### H. Security, quality and UI
- No `.env` secrets in source control; logs redact auth tokens and unnecessary personal data.
- Main write routes enforce role guards and DTO validation.
- Important state changes have actor/action/time audit records.
- Map tile failure leaves a usable list/table.
- Loading, error, empty and stale-data states exist.
- Keyboard, labels, focus and Bangla text rendering are reviewed.
- Lint, typecheck, backend tests, frontend tests and production builds pass, or unrun checks are explicitly listed.
