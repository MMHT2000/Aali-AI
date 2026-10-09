# Aali AI — Antigravity Implementation Pack

This folder is the implementation brief and agent operating kit for the Aali AI Feni flash-flood resilience prototype.

## Stack
- **Backend:** NestJS + TypeScript + REST API
- **Frontend:** React + TypeScript + Vite
- **Database:** MySQL 8.4 LTS with TypeORM migrations
- **Maps:** Leaflet / OpenStreetMap-compatible tiles; use deterministic local fixture data when tiles/network are unavailable
- **Local development:** Docker Compose for MySQL, separate API and web dev servers

## Start here
1. Open this folder as the Antigravity workspace.
2. Read `AGENTS.md` and `PROMPT_START_HERE.md`.
3. Start a new Antigravity session and paste the complete prompt from `PROMPT_START_HERE.md`.
4. Implement **one phase at a time** from `IMPLEMENTATION_PLAN.md`; do not ask the agent to generate the entire project in one pass.
5. Use `/implement-phase` and `/verify-phase` skills as needed. The skill commands appear automatically if the current Antigravity surface indexes workspace skills.

## Key files
- `AGENTS.md` — always-on project instructions for Antigravity.
- `IMPLEMENTATION_PLAN.md` — phased task plan, ordered dependencies and exit gates.
- `PROMPT_START_HERE.md` — full initial prompt to paste to Antigravity.
- `docs/PRODUCT_REQUIREMENTS.md` — product behavior and scope.
- `docs/ARCHITECTURE.md` — boundaries and module layout.
- `docs/DATABASE_SCHEMA.md` — MySQL entities, relations and indexes.
- `docs/API_CONTRACT.md` — REST endpoints and payload expectations.
- `docs/ACCEPTANCE_TESTS.md` — testable acceptance criteria.
- `docs/SECURITY_PRIVACY.md` — privacy and safety requirements.
- `docs/DEMO_RUNBOOK.md` — five-minute demo sequence and fallback behavior.
- `.agents/rules/` — focused persistent constraints.
- `.agents/skills/` — reusable multi-step agent playbooks.
- `.agents/agents/` — specialist persona files for delegating bounded tasks.

## Important product honesty
Aali is a prototype and a decision-support platform. Satellite-to-phone delivery, operator-wide emergency access, automatic operator forwarding, cell broadcast and real government data integrations must be **simulated or adapter-based unless separately configured and verified**. The UI must label simulated behavior visibly. Life-critical alert thresholds, confidence calculations, silent-village detection and boat ranking are deterministic rules with reasons; a model must not approve warnings, issue evacuation orders or auto-dispatch rescue assets.

## Local setup overview
1. Copy `.env.example` to `.env` and change local-only credentials if desired.
2. Start MySQL with `docker compose up -d mysql`.
3. Ask Antigravity to scaffold the API and web packages following `IMPLEMENTATION_PLAN.md`.
4. Run migrations and seed synthetic Feni demo data.
5. Start the API and web app using scripts Antigravity creates and documents.

Do not commit `.env`, real personal data, real phone numbers or production credentials.
