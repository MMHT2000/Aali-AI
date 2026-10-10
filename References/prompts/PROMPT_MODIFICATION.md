# Antigravity Prompt — Modify the Existing Aali AI Product

The owner reviewed the generated prototype. It was verified, but the result feels like one specification page rather than a hackathon product. The requested product is a central control-center dashboard, separate responder workspace, dashboard-based resident-client simulator, and a Flutter Android app with login, mock NID format/uniqueness check, internet SOS and explicit SMS handoff when internet is unavailable. The owner also wants configurable primary and backup LLM APIs.

Read `AGENTS.md`, `IMPLEMENTATION_PLAN.md`, the files in `docs/` and `docs/MODIFICATION_BRIEF.md` completely. Treat the owner's product direction in the brief as the request; the attached/repository documents are constraints and existing specification, not evidence that a feature is already implemented. Preserve their life-safety and privacy rules.

## First response and preflight

Before editing, report the goal, files inspected, actual existing behavior, mismatches with this request, planned bounded changes, assumptions and exact verification commands. Inspect git status, source tree, routes, API auth, current UI, provider adapters/env config, package scripts, and Flutter/Android tooling availability. Do not overwrite the current implementation or discard user changes. Existing components and API modules must be reused where they work.

## Deliver the product, not another planning document

Continue beyond inspection and implement the modification in bounded increments. Start with the user-visible information architecture and authenticated role-based web shell, then connect existing SOS/responder/replay/recovery/AI features to their own pages. Add the resident simulator to exercise the same API/packet behavior. Add Flutter as an independent client and configurable provider failover as later increments. Keep `IMPLEMENTATION_PLAN.md` and `docs/IMPLEMENTATION_LOG.md` truthful and current. Do not stop after writing a plan or a design proposal.

### Web product

- Replace the all-tools stacked landing page with a navigable, polished central control-room experience and focused routes for SOS inbox, incident detail, alerts/warnings, replay, recovery, audit/settings and demo simulator.
- Add login and role-aware access to the separate responder operations workspace. Connect to existing backend auth and seeded users when available; if auth is incomplete, finish the required API flow rather than implementing a client-only gate. Preserve server-side RBAC and Authority-only warning approval.
- Make the overview useful at first glance: synthetic/replay mode label, API/database/provider status, active incident/SOS counts, alert level with reasons/source freshness, areas needing safe verification, and suitable asset suggestions. Clearly label source data, rule output, AI suggestion and human decision.
- Put the Resident Client Simulator on an explicit demo route. It must use real API calls and packet logic where available, demonstrate online SOS, forced offline queue, SMS-composer/copy handoff and labelled simulated gateway retry, then allow the judge to inspect the ingested report in responder view.
- Retain map/list fallback, status/empty/error/loading states, keyboard usability, Bangla rendering and responsive layouts. Avoid a giant single page.

### Flutter resident application

- Create `apps/mobile/` Flutter project, with a short setup/run guide. Check installed Flutter/Android SDK first and be explicit if local compilation is impossible.
- Implement resident onboarding/login and the mock NID format/uniqueness rules from `docs/MODIFICATION_BRIEF.md`. Server enforces uniqueness. The UI clearly says this is not identity verification. Do not retain or log plaintext NID unnecessarily.
- Implement Bangla-ready three-step SOS; optional GPS; village/shelter fallback; flags and people count; shared packet format; durable local outbox; internet retry; visible pending/acknowledged/failed state.
- On offline path, let the user explicitly open Android SMS composer with the compact packet or copy it. Do not report delivery until acknowledgment. Explain that ordinary app code cannot guarantee SMS forwarding or carrier connectivity. Any in-app gateway simulation is prominently labelled demo-only.

### LLM provider configuration

- Keep deterministic mock/local logic as default. Add optional primary and backup provider adapters and environment settings; use schema validation, timeouts and safe failure fallback. Provide a status view without leaking credentials.
- Restrict model assistance to permitted language tasks. Deterministic domain rules continue to calculate alert/confidence/asset/silent-village results; human approvals stay human.
- Never send NID, phone, exact coordinates, identifiable SOS or other PII to an external service. Test redaction with synthetic fixtures. If a remote adapter cannot be implemented safely in this pass, build the working adapter/config seam and state what remains unverified instead of displaying a false connected state.

## Workflow

1. Verify baseline scripts and current tests/build before changes when practical.
2. Implement one coherent increment at a time; list touched files and behavior.
3. Add/update tests for changed behavior, including NID 10/17 digit acceptance, invalid/repeated/duplicate NID, role protection, simulator online/offline states and provider fallback as applicable.
4. Run relevant formatter/lint/typecheck/tests/build per repository instructions. For Flutter, run `flutter analyze` and `flutter test` if tooling exists. Do not invent successful results; name commands blocked by missing tooling/dependencies.
5. Update run instructions, modification checklist and implementation log.

Do not change the core disaster-response safety rules or imply this mock is operational. Do not ask for permission to make ordinary reversible code/documentation changes. At completion, tell the owner what now works, exact commands/results, limitations and the exact next task if anything remains.
