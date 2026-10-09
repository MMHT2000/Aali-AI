# Five-Minute Demo Runbook

All data and transport stages are synthetic/simulated unless an operator integration has independently been configured and verified.

## Current local setup (XAMPP)
- Start the XAMPP MySQL service on port `3306`; the local `.env` uses database `aali_ai` and the XAMPP `root` account. If your root account has a password, set `MYSQL_PASSWORD` in `.env`.
- Run API migrations at startup and wait for `GET /api/v1/health/readiness` to report `ready` before opening the web app.
- The authenticated web application opens role workspaces. Authority starts at the map-first `/control-room/map`; Responders use `/control-room/responder`; Volunteers use `/control-room/field`; Recovery Coordinators use `/control-room/recovery`.
- Authority can run the API-backed synthetic scenario from the map workspace. Scenario position persists in MySQL and the API restarts in a paused state; it is not a trained forecasting model.
- Web resident simulator and Flutter client source are distinct: Flutter still needs API onboarding/SOS wiring and Flutter CLI verification before it can be used as the same end-to-end flow.

## Docker Compose setup (full stack)
- Copy `.env.example` to `.env` if you have not already done so.
- Run `docker compose up --build -d`. Compose starts MySQL, API and web; wait until `docker compose ps` reports all three healthy.
- Open `http://localhost:5174`. API readiness is `http://localhost:3002/api/v1/health/readiness`; the UI proxies `/api` requests to the API container.
- Compose uses MySQL host port `3307` and a dedicated non-root `aali_dev` account, so it can run alongside XAMPP on port `3306` and the native web/API servers on `5173`/`3001`.
- Docker DB credentials and published ports are set with `AALI_DB_*`, `MYSQL_PUBLISHED_PORT`, `AALI_API_PORT`, and `AALI_WEB_PORT` in `.env`. The MySQL data lives in the `aali_mysql_data` named volume and persists across container restarts.

## Pre-demo checklist
- Start MySQL, apply migrations, seed fixtures, start API and web.
- Use the seeded Authority and Responder demo accounts from local developer docs; do not deploy the demo password.
- Ensure the two labelled replay scenarios are available.
- Confirm gateway simulator works, then confirm the API internet-submit path can be disabled in the demo toggle.
- Keep a screen recording available. If map tiles fail, use the incident list fallback.
- Check the demo banner says `DEMO DATA` and simulated satellite/gateway paths are labelled.

## Five-minute path
### 0:00–0:30 — Problem and honesty
Show the Feni scenario and the tower-outage context from the proposal. State that the prototype demonstrates the app/packet/rules; the operator compact and satellite delivery are assumptions/simulations, not proven field performance.

### 0:30–1:20 — BEFORE: replay and gauge silence
Open Replay & Exercise, then the July 2025 reconstructed replay view. Separately return to Situation Map to run the current deterministic synthetic scenario and show API snapshot updates, gauge/rain inputs and alert reason codes. Do not describe the exercise timeline as an ML forecast.

### 1:20–3:10 — DURING: blackout SOS
Open Resident Simulator and submit a three-step SOS with synthetic people/urgency details and no GPS if practical. The API stores SOS submissions in MySQL with client-ID idempotency. The SMS composer remains an explicit user handoff; the gateway path is a simulation. Open Rescue Operations and inspect API-submitted SOS records where the current role snapshot includes them.

Show confidence components. Submit or load a second differently-worded synthetic report from the same school; inspect the duplicate suggestion, then manually accept/reject it. Show the silent-village indicator and “verify by safe means.” Review the boat priority breakdown and explicitly mention that a human approves any action.

### 3:10–4:00 — AFTER: recovery board
Open village needs, add a synthetic need report and record a delivery receipt. Show the unmet-need/coverage summary change. Say the board supports coordination and does not decide who deserves aid.

### 4:00–5:00 — AI, compact and close
Run a Bangla/Banglish synthetic SOS extraction and show editable fields plus original message. Disable AI and demonstrate the keyword/manual fallback. Show warning draft requiring Authority approval and the simulated delivery label. Close with the three-party Aali Compact as the premise, not an existing signed agreement.

## Failure fallback
- If live replay fails: use a pre-recorded replay clip or screenshot while keeping source labels visible.
- If AI fails: run the deterministic mock/keyword parser; do not improvise model output.
- If map tiles fail: use the report list and synthetic area table.
- If Gateway Simulator fails: use the pre-recorded packet ingest flow and show the raw packet + queued state; never claim delivery.
- If network at venue is unreliable: run local services; present local DB records and a backup recording.
