# Aali AI

### When the towers die, the SOS doesn’t.

Aali AI is a next-generation flood-response coordination platform for Feni, Bangladesh. It brings resident reports, field observations, warning evidence, responder review and recovery needs into one shared operating picture—so communities and response teams can work from connected information before, during and after a flood.

## The product

Flash floods can disrupt mobile connectivity just when people need to report danger. Information can also become fragmented between residents, field volunteers, authorities, responders and recovery teams. Aali AI demonstrates how those reports and decisions could be coordinated through a common, auditable system.

The product provides two connected operational experiences:

- **A resident and field app** for creating a short SOS, recording needs and field observations, and seeing whether a report was acknowledged by the server, saved locally, or handed off to the phone’s SMS composer.
- **A web operations room** for viewing the Feni operating picture, reviewing SOS reports, examining warning evidence, coordinating response resources and tracking recovery needs.

The same event and report records connect these workflows. The map and accompanying lists show the information available to each authorized role, with its source and provenance.

## How Aali works

### Before a flood

Operators can review a clearly labeled synthetic exercise or historical reconstruction. In the exercise, visible deterministic rules combine gauge, rainfall and field signals to produce alert levels and reason codes. A warning remains a draft until an authorized human reviews and approves it.

### During a flood

Residents can create an SOS with the number of people and urgent needs. GPS is optional; a location can be selected from a list or left unknown. The web simulator and Flutter app demonstrate submitting and queueing reports. Responders can review reports and related incident information in their role workspace.

### After a flood

Recovery coordinators can record village-level needs and delivery receipts, then review coverage gaps. The system supports coordination; it does not decide who qualifies for aid.

## Workspaces

| User | Aali workspace |
| --- | --- |
| Authority | Shared situation picture, source and warning evidence, approvals and oversight |
| Responder | SOS and incident review, shelters, assets and human-reviewed response actions |
| Volunteer | Field readings and observation entry |
| Recovery coordinator | Village needs, deliveries and coverage gaps |
| Viewer | Permitted read-only summary |
| Administrator | Configuration and system oversight |
| Resident | SOS and report status in the mobile app or web demonstration flow |

The server enforces role permissions. The interface is still being refined, so some role workspaces and shared views are more complete than others.

## What the demo data means

- **Synthetic exercise:** deterministic scenario data created for the demo; it is not a live flood observation or a trained forecast.
- **Historical reconstruction:** a small reconstructed fixture set. It is not yet a complete, audited historical record.
- **BMD CAP:** the LIVE API checks the public BMD RSS feed and its linked alert records. Only effective, unexpired `Actual` alerts are shown. Feed publication time and fetch status are reported separately. The latest feed may be stale or contain no active alerts; an empty alert list does not mean an area is safe.
- **Other external data:** FFWC river observations and GSMaP rainfall are not connected. An unavailable source is not replaced silently with demo data.
- **AI assistance:** language help and suggestions do not determine flood alert levels, approve warnings, dispatch responders or decide aid eligibility. Deterministic local fallback is available.

## Safety and delivery limits

- Aali AI is an operational emergency coordination platform. For immediate danger, use locally recognized emergency channels.
- Offline reports may remain queued on the device. Opening an SMS composer is a user handoff; the user must review and send the message. Neither queueing nor SMS handoff proves delivery.
- Gateway forwarding, satellite-to-phone delivery, operator-wide emergency access and cell broadcast are demo assumptions or simulations, not verified integrations.
- Mock NID checks validate a number’s format and uniqueness only. They do not verify identity.
- Warnings, evacuation orders, rescue assignments and aid decisions require authorized human action.
- Demo people, incidents, phone numbers and locations must be synthetic. Do not enter real personal or emergency data.

## Run the demo

### Docker Compose

With Docker Desktop running, copy `.env.example` to `.env`, then run:

```powershell
docker compose up --build -d
```

Open the web app at [http://localhost:5174](http://localhost:5174). The API readiness check is [http://localhost:3002/api/v1/health/readiness](http://localhost:3002/api/v1/health/readiness). Compose starts the web app, API and MySQL; it waits for MySQL before starting the API, which applies versioned migrations. The database uses a persistent Docker volume. Default Docker ports `3307`, `3002` and `5174` avoid the native development ports and XAMPP’s usual MySQL port `3306`.

To inspect service health and logs:

```powershell
docker compose ps
docker compose logs -f api
```

Stop the containers with `docker compose down`. This keeps the database volume for the next run.

### Native development

Install Node.js/npm, start XAMPP MySQL on port `3306` (or configure `.env` for another MySQL server), and run:

```powershell
npm install
npm run dev:api
npm run dev:web
```

The native web app defaults to [http://localhost:5173](http://localhost:5173); the API defaults to port `3001`. For Flutter development, see [`apps/mobile/README.md`](apps/mobile/README.md).

## Project guide

- [Demo runbook](docs/DEMO_RUNBOOK.md) — suggested demonstration flow and fallbacks.
- [Product requirements](docs/PRODUCT_REQUIREMENTS.md) — product journeys and boundaries.
- [Security and privacy](docs/SECURITY_PRIVACY.md) — access control and data-handling rules.
- [Web experience plan](docs/WEB_UI_REDESIGN_PLAN.md) — operations-room goals and remaining work.
- [Android experience plan](docs/ANDROID_UI_REDESIGN_PLAN.md) — resident SOS and field-work goals.
- [Data access audit](docs/PRODUCT_DATA_ACCESS_AUDIT.md) — verified public-source access and gaps.

## Built with

React and TypeScript for the web app, NestJS for the REST API, MySQL for persistence, and Flutter for the mobile app. The prototype is organized as a modular monolith; external providers and AI services are accessed through explicit adapters.
