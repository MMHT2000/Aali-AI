# Product Requirements — Aali AI

## 1. Audience and product promise
Primary users are emergency authorities, responders, volunteers and recovery coordinators in Feni. The prototype demonstrates one shared, auditable view for the warning, response and recovery stages. Tagline: **When the towers die, the SOS doesn't.**

## 2. Roles
- `ADMIN`: manages demo users/configuration and can inspect all data.
- `AUTHORITY`: reviews and approves flood-warning drafts; sees alert evidence and audit history.
- `RESPONDER`: triages SOS incidents, reviews duplicates, assets and shelters, and accepts/rejects dispatch recommendations.
- `VOLUNTEER`: submits staff-gauge readings and field observations; access to minimal relevant view.
- `RECOVERY_COORDINATOR`: enters damage/needs and aid receipts.
- `VIEWER`: read-only access to permitted dashboard summaries.

## 3. Main user journeys
### Before a flood
1. Select a labelled replay or synthetic active scenario.
2. Inspect gauge rise, rainfall and volunteer gauge signals, their source times and gaps.
3. Observe `WATCH`, `WARNING` or `ACT` derived from transparent rules.
4. Disable/blank the gauge during replay; observe `GAUGE_SILENT` escalation only when the documented risk conditions are satisfied.
5. Draft a ward-specific Bangla warning; an Authority inspects source facts and approves it. Delivery remains simulated.

### During a flood
1. A resident selects “Need rescue”, number of people and urgency flags in no more than three short steps.
2. GPS is optional. If denied/unavailable, choose a village/shelter/location from a list or leave location unknown.
3. The app makes a compact ASCII packet and stores it in IndexedDB before attempting transport.
4. With Internet available, send normally. With Internet disabled, show queued state and expose OS SMS composer/copy handoff. For the demo only, the labelled Gateway Simulator transports the packet to the API.
5. API validates packet, records provenance and avoids duplicate ingest on retry.
6. Responders inspect the report, source-derived confidence reasons, duplicate candidates, silent-village indicators and suitable asset recommendations.
7. Human actors approve consequential actions; audit entries record actor, time and reason.

### After a flood
1. Authorized coordinator enters village damage, water/medicine needs, road passability and infrastructure status.
2. Dashboard ranks unmet needs transparently and shows coverage from aid receipts.
3. Coordinators add delivery receipts and inspect what remains unmet.
4. Records help coordinate aid; the system does not decide eligibility or worthiness.

## 4. Functional requirements
- FR-01 Authentication and role-based access.
- FR-02 Synthetic Feni demo seed data and clearly labelled historical replay fixtures.
- FR-03 Three-tap, Bangla-friendly SOS with people count and vulnerability flags.
- FR-04 Optional GPS and manual village/shelter fallback.
- FR-05 Versioned packet encode/decode/checksum and idempotent ingestion.
- FR-06 Offline IndexedDB queue with explicit retry and transport state.
- FR-07 Labeled gateway and satellite transport simulations/adapters.
- FR-08 SOS inbox and incident map/list with filters and stale-data states.
- FR-09 Explainable confidence score; never block SOS solely on trust score.
- FR-10 Duplicate candidate suggestions with human merge/reject/split.
- FR-11 Silent-village flag under documented scenario conditions.
- FR-12 Available/suitable asset register and rule-based priority suggestions.
- FR-13 Three-signal flood alert rules, stale/silent-gauge escalation and replay controls.
- FR-14 Bangla warning draft with human Authority approval; external send remains simulated.
- FR-15 AI extraction, text similarity and language drafting with local deterministic fallback.
- FR-16 Recovery needs board, aid receipts and coverage gap reporting.
- FR-17 Audit events, privacy controls, health status and role-scoped screens.
- FR-18 Demo runbook and end-to-end tests.

## 5. Non-functional requirements
- Local demo must run without external AI service.
- SOS data-entry path must work without GPS permission and remain usable on mobile width.
- Browser offline storage must clearly show that a report is pending, not delivered.
- API errors are actionable and do not expose secrets or stack traces in production mode.
- List/table is an alternate to map; network tile failure cannot block rescue work.
- All computed scores and rule results expose inputs/reasons.
- Store timestamps in UTC; show Asia/Dhaka local time in the UI.
- All demo people, reports, phone numbers and locations are synthetic unless data provenance is explicitly documented.

## 6. Out of scope
- Production emergency-service deployment or certification.
- Claims that all towers/operators, cell broadcast or satellite links work with this app out of the box.
- Automatic evacuation, warning publication, rescue dispatch or aid eligibility decisions.
- Creating a new satellite/rainfall processing pipeline.
- Trained ML flood forecast from the two replayed floods.
- Native Android app or silent SMS sending from a browser.
- Real beneficiary identities or external AI processing of personal data.
