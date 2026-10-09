# Initial Antigravity Prompt — Aali AI

Copy the whole prompt below into a new Antigravity conversation with this repository open.

---

You are the lead full-stack engineer for **Aali AI**, a Feni flash-flood warning, rescue coordination and recovery prototype. Your implementation must follow the repository instructions in `AGENTS.md` and the detailed specification documents in `docs/`.

## First: explore and plan, then execute

1. Inspect the current workspace before creating or replacing files. Identify whether this is a fresh repo or an existing implementation. Inspect package manifests, lockfiles, source tree, database migrations, current git state, and available run/test commands.
2. Read `IMPLEMENTATION_PLAN.md`, `docs/PRODUCT_REQUIREMENTS.md`, `docs/ARCHITECTURE.md`, `docs/DATABASE_SCHEMA.md`, `docs/API_CONTRACT.md`, `docs/SECURITY_PRIVACY.md`, and `docs/ACCEPTANCE_TESTS.md` completely.
3. Create an Antigravity plan/artifact that maps the current repository to the phases in `IMPLEMENTATION_PLAN.md`. List the exact files you intend to create or change, dependencies required, migrations needed and verification commands. Keep the plan consistent with the written contracts.
4. Then implement **Phase 0 and Phase 1 only**: baseline repository inspection, workspace scaffold, developer setup, MySQL configuration, NestJS API shell and React shell, health endpoint, lint/typecheck/test/build scripts, environment validation and README setup instructions. Do not implement all product features in this first pass.
5. Run all checks that are now available. Start MySQL if the environment allows it, verify health endpoint and web boot where possible, and distinguish successful checks from those not run.
6. Update the implementation checklist and add `docs/IMPLEMENTATION_LOG.md` with the date, files changed, commands run, results, and limitations.
7. Stop after these phases and provide a concise handoff that tells me which phase to run next. Do not ask broad clarifying questions; make reasonable, documented choices from the existing specification.

## Product in one paragraph
Aali must cover three stages: **BEFORE** flood — evaluate gauge rate-of-rise, rainfall and volunteer staff-gauge readings; **DURING** flood — capture SOS reports that can be queued offline and transported through available channels, show a shared rescue map, merge likely duplicates, flag silent villages and rank assets; **AFTER** flood — track damage, needs and aid deliveries by village. All warnings require authorized human approval. AI is used to extract structured details from Bangla/Banglish SOS messages and voice transcripts, suggest duplicate matches, and draft clear Bangla warnings/summaries. Life-critical scoring and alert decisions remain deterministic rules.

## Fixed stack
- NestJS + TypeScript backend.
- React + TypeScript + Vite frontend.
- MySQL 8.4 LTS with TypeORM migrations.
- REST API version prefix `/api/v1` and Swagger/OpenAPI.
- Docker Compose for local MySQL.
- Leaflet-compatible map component with a list fallback.
- Deterministic mock AI, official-data adapters and gateway/satellite simulators for the default demo.

## Mandatory honesty about offline and satellite behavior
A browser-only React PWA cannot independently transmit SMS when every data path is down. Implement an offline IndexedDB queue and a packet handoff that opens a supported OS SMS composer or lets the user copy the compact ASCII packet. For the demo, implement a clearly labelled **Gateway Simulator** that accepts a packet and forwards it to the backend as a simulated carrier gateway would. Satellite transport is also a clearly labelled simulation unless real approved carrier access and a device test are configured outside this repository. Do not invent an actual integration or claim transport has been proven.

## Core build behavior
- A three-tap Bangla-friendly SOS: need rescue; people count; urgency flags (elderly, child, medical, trapped). Capture GPS when permission is available; otherwise allow village/shelter selection. Keep SOS usable when geolocation is denied.
- Compact, versioned, ASCII Disaster Packet; validate checksum; idempotently ignore exact duplicate packet delivery while preserving the sender/report relationship.
- Confidence formula and boat priority formula must match `docs/PRODUCT_REQUIREMENTS.md`, show a breakdown, and be unit-tested.
- Duplicate detection combines text similarity/AI suggestion with geohash, event time and people-count similarity. AI never silently merges records: a human can accept, reject or split a suggested merge. If AI is down, rule-only fallback works.
- Silent-village alerts flag areas to verify safely; they never declare an area safe or order responders into it.
- Flood replay must support two labelled historical reconstructions: 19–24 Aug 2024 and 20–22 Jul 2025. Preserve dataset provenance and gaps. Add a switch that blanks the gauge; when other conditions in the written rule are met, show the silent-gauge escalation and reason.
- Warning drafting generates Bangla text plus a read-aloud audio placeholder/export hook. Officially sending a warning is disabled in the default demo; an authority user must approve the draft. Real SMS/cell-broadcast delivery is a future adapter.
- A recovery board links needs and aid receipts to villages and prevents double-counting by tracking delivery records; it must not determine who deserves aid.
- Role-based access, audit events for approvals/merges/dispatch decisions/delivery receipts, rate limits, minimal personal data and synthetic demo data are required.

## Build protocol after Phase 1
Use `IMPLEMENTATION_PLAN.md` in sequence. Implement one phase at a time. The expected order is domain and migrations; packet + offline SOS; gateway simulator; responder dashboard and rules; historical flood replay/alerts; AI-assisted language features; recovery board; security, accessibility and end-to-end demo hardening. Before marking a phase complete, run the test, lint, typecheck and build commands that exist, add relevant tests, update docs and explain anything unverified.

Do not use broad TODO placeholders for required flows. If a stretch feature must be simulated, implement a working deterministic simulation and label it in the UI. Prioritize core SOS, packet parsing, replay alert with silent-gauge switch, confidence + duplicates, and silent-village flag over decorative features.

---

## Follow-up prompt template for later phases

> Read `AGENTS.md` and `IMPLEMENTATION_PLAN.md`. Inspect the current repository and `docs/IMPLEMENTATION_LOG.md`. Implement **Phase [N] only**. First list the exact files and the acceptance tests for this phase, then make the smallest coherent set of changes. Do not redo completed phases. Preserve the architecture and API/database contracts unless you document a necessary change in `docs/DECISIONS_AND_ASSUMPTIONS.md`. Run all relevant tests, lint, typecheck and builds; fix failures before marking the phase complete. Update the checklist and implementation log. Clearly state what is real, simulated, unverified and the next phase.
