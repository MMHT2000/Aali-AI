# Aali AI — Antigravity Agent Instructions

You are implementing **Aali AI**, a disaster-resilience prototype for Feni flash floods. Your job is to turn the requirements in this repository into a tested, honest, demoable full-stack product using **NestJS, React, TypeScript and MySQL**.

## 1. Read before acting
Before editing code, read:
1. `IMPLEMENTATION_PLAN.md`
2. `docs/PRODUCT_REQUIREMENTS.md`
3. `docs/ARCHITECTURE.md`
4. `docs/DATABASE_SCHEMA.md`
5. `docs/API_CONTRACT.md`
6. `docs/SECURITY_PRIVACY.md`
7. `docs/ACCEPTANCE_TESTS.md`

If the workspace already contains code, inspect it first. Do not replace working code or rebuild an existing feature without establishing its current state. Report mismatches between the repository and this plan, then adapt with the smallest safe change.

## 2. Work in gated phases
- Implement exactly one numbered phase per work session unless the user explicitly requests otherwise.
- Begin each phase by stating the goal, inspected files, planned changes, assumptions and verification commands.
- Make coherent edits; avoid giant rewrites and unnecessary dependencies.
- Run the relevant formatter, lint, typecheck, unit tests and build before marking the phase complete.
- Fix failures caused by your changes before proceeding. If a command cannot run, state why and provide the exact unverified items.
- Update the checklist in `IMPLEMENTATION_PLAN.md` and add a concise entry to `docs/IMPLEMENTATION_LOG.md` after each completed phase.
- Do not claim tests passed unless you ran them and observed success.

## 3. Non-negotiable product and safety rules
- This is a **decision-support prototype**, not an operational emergency service.
- Never auto-approve an official warning, evacuation order, boat dispatch, rescue assignment or aid entitlement. A properly authorized human must approve these actions.
- Flood alert levels, confidence scores, silent-village flags and boat priorities must be produced by visible deterministic rules, with reason codes and input evidence. AI can interpret language, suggest duplicate matches and draft text only.
- An SOS must never be rejected solely because confidence is low or a sender is unfamiliar. Apply rate limits to abuse, but preserve the report and flag it for review.
- Treat no calls/no SOS as **unknown**, not as proof of safety. Silent-village logic is a verification flag, not an instruction to enter a dangerous area.
- Use synthetic fixtures only. Never send a real person’s phone number, SOS, exact location or other personal data to an external AI service.
- Clearly label demo-only or simulated integrations: tower blackout, carrier gateway forwarding, satellite SMS, all-operator emergency access, cell broadcast, official feed data and historical replay reconstructions.
- Do not state or imply that satellite-to-phone rescue delivery in a Feni flood has been proven.
- Do not fabricate official observations, event outcomes, lead-time results or integration credentials. If a value is missing, label it unavailable or synthetic.
- Map markers and alerts must distinguish **source data**, **rule output**, **AI suggestion**, and **human-approved action**.

## 4. Required technology and architecture
- Backend: NestJS, TypeScript, REST API under `/api/v1`, DTO validation, OpenAPI/Swagger, TypeORM migrations.
- Database: MySQL. `synchronize: false` outside throwaway tests; use explicit versioned migrations.
- Frontend: React + TypeScript + Vite, typed API client, route-based pages and reusable components.
- Prefer modular monolith architecture with clear feature modules. Do not introduce microservices.
- Use UTC timestamps in storage/API and render local time as Asia/Dhaka.
- Keep secrets in environment variables; validate configuration at application startup.
- Keep AI and external data integrations behind interfaces/adapters. The default demo provider must be deterministic and local.

## 5. Implementation quality rules
- TypeScript strict mode; avoid `any`, unsafe casts and duplicated domain logic.
- Validate every external input at the API boundary. Use DTOs and class-validator or a consistent NestJS-supported validation strategy.
- Use database transactions for multi-record merges, approvals and delivery receipts.
- Use stable IDs; record actor, timestamp, reason and before/after summary for meaningful state changes.
- Use pagination, filters and explicit sort orders for list endpoints.
- No secrets or full phone numbers in application logs. Redact packet sender data where it is not needed.
- Add unit tests for decision rules and packet parsing before wiring UI behavior.
- Build accessible controls with keyboard focus, labels, visible status text and color-independent meaning. Bangla UI strings must render correctly.
- Keep a usable empty/error/loading state on every primary screen. A map failure must not block the list/table view.

## 6. Delivery response format
At the end of a phase, report:
1. What changed (files and observable behavior).
2. Commands run and actual results.
3. Acceptance criteria satisfied and not yet satisfied.
4. Known limitations, simulations and follow-up risks.
5. Exact next phase to run.

Never silently skip a failed test, hide a limitation or mark a simulated adapter as a real integration.
