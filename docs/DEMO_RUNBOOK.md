# Five-Minute Demo Runbook

All data and transport stages are synthetic/simulated unless an operator integration has independently been configured and verified.

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
Open the July 2025 replay, point to gauge/rain/volunteer signals and alert reason list. Blank the gauge. Show escalation only if rule conditions hold and highlight the `GAUGE_SILENT` reason. Show that replay data is reconstructed and lead time is computed from fixture timestamps.

### 1:20–3:10 — DURING: blackout SOS
Switch to the resident view, submit a three-step SOS with synthetic people/urgency details and no GPS if practical. Disable app network submit; show `QUEUED`. Copy/open the SMS packet and send it through the clearly labelled Gateway Simulator. Open responder view and find the single ingested report.

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
