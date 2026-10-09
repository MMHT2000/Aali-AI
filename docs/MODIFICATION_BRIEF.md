# Aali AI — Product Modification Brief

## Owner's direction

The previous generated result was technically verified but presented as a single long prototype page. That experience reads like a specification or school project instead of a hackathon product. Evolve the existing implementation into a believable, navigable mock product for a disaster-response control center. Retain the working domain features and safety rules; change how the product is organized and add the missing user-facing surfaces.

## Product experience

### 1. Central Control Center

Build a polished, role-aware operations workspace that feels monitored from a central control room. It should have an authenticated entry, persistent application shell, navigation, operational status and purposeful pages instead of stacking every feature on one page. The default operations view should bring together current synthetic/replay event state, SOS/incident activity, alert evidence, areas requiring verification, suitable asset suggestions and system/provider status. Clearly identify source observations, deterministic rule results, AI suggestions and human-approved actions. Make the shared overview live-looking through real API refresh/polling or deterministic local demo state, not decorative animation pretending to be live data.

Suggested routes: `/login`, `/control-room`, `/control-room/sos`, `/control-room/incidents/:id`, `/control-room/alerts`, `/control-room/replay`, `/control-room/recovery`, `/control-room/audit`, `/control-room/settings`.

### 2. Separate responder workspace

Responders log in and receive a focused workspace for SOS triage, incident detail, duplicate review, asset/boat recommendations, shelter/area context and their own human decisions. Provide role-appropriate views for Authority, Volunteer, Recovery Coordinator, Viewer and Admin as supported by existing RBAC. Keep server-side authorization authoritative. Never let the frontend role switch grant access. Warning approval remains Authority-only; dispatch remains a recorded human decision and never sends a boat automatically.

### 3. Dashboard client simulator

Add a clearly named **Resident Client Simulator** inside the dashboard/demo area so judges can simulate client journeys without installing a phone app. Include sign-in/onboarding with synthetic test identity, SOS creation, connectivity toggle, internet submission, pending offline queue, simulated SMS/gateway handoff, retry and the resulting report in responder view. Keep all simulation controls and synthetic records clearly labelled. The simulator must exercise the same API and packet contracts as the Flutter client wherever practical, rather than creating a disconnected fake flow.

### 4. Flutter Android app

Add an independent Flutter app under `apps/mobile` (or document a justified compatible path after repository inspection). Include a resident login/onboarding flow, accessible Bangla/English-ready SOS capture, optional location permission, village/shelter fallback, people count and vulnerability flags, and a local outbox that survives app restart. A resident can submit using internet when available. When internet is unavailable, prepare the compact Disaster Packet for an Android SMS handoff using an explicit user action (open SMS composer / choose recipient where configured), and retain a queued state until an actual backend acknowledgment. Do not silently claim SMS sent merely because an intent was opened. A clearly labelled simulated gateway path may be available for the hackathon demo.

#### Mock NID policy

For prototype onboarding only, accept an NID-like value consisting of exactly **10 or 17 ASCII digits**, provided it is not all the same digit and is unique among registered demo accounts. Normalize and enforce uniqueness on the server/database; avoid logging or displaying the full value; store a one-way keyed hash or equivalent minimized identifier if feasible. Do not call this government verification, validate real NID authenticity, send it to any LLM/provider, or use real identity documents. UI must say “Demo NID format check — not identity verification.” Tests must cover valid 10-digit and 17-digit values, wrong lengths, nondigits, repeated-digit values, duplicate registration and concurrent duplicate attempts.

### 5. Primary and backup LLM configuration

Retain the deterministic local provider as the default reliable path. Add configuration for a primary and optional backup LLM provider, with adapter interfaces, startup validation, timeouts, safe fallback/failover, provider health/status and visible attribution in the UI. The product must remain usable when both providers are absent or fail. AI is limited to SOS language extraction, duplicate text similarity and drafting communications; it must not set flood levels, confidence scores, boat priorities, silent-village flags, warning approval or aid eligibility.

Any external provider request must use synthetic demo text or a tested redacted/minimized payload. Never transmit NID, phone number, exact location, raw personal SOS text or other personal data. Keep keys only in environment configuration and `.env.example` placeholders. Never expose keys in UI, health responses, logs, fixtures or version control. Do not imply that adding a provider variable means a provider integration has been tested.

## UX and quality bar

- Product-first visual hierarchy, consistent layout, responsive desktop and mobile states, route titles, useful empty/loading/error states, accessible keyboard navigation and visible status text.
- Provide role-aware demo accounts/credentials in local-only setup docs if seeded auth already supports them; mark credentials as synthetic and development-only.
- Avoid a single scrolling page that embeds every tool. Give each major workflow its own route or focused panel.
- Keep Bangla text readable and make English/Bangla switching possible where practical.
- Make simulator controls understandable to a judge without implying a real carrier, government feed, AI provider or rescue operation is connected.
- Preserve UTC storage and Asia/Dhaka display conventions.

## Non-negotiable safety and product truth

This is a decision-support mock product, not an operational emergency service. Preserve all existing requirements in `AGENTS.md` and `docs/SECURITY_PRIVACY.md`. SOS is never rejected solely for low confidence or an unfamiliar sender. Lack of reports means unknown. Human approval is required for official warnings; no automatic evacuation order, boat dispatch or aid eligibility decision. Mark replay and all simulated integrations. Do not claim satellite-to-phone rescue delivery is proven. Use synthetic fixtures only.

## Change strategy and acceptance

Inspect the existing source and current behavior before editing. Preserve working APIs and features; report mismatches and identify what already exists. Update `IMPLEMENTATION_PLAN.md` by appending a clearly identified modification track or new numbered phases that do not rewrite history. Implement one bounded phase at a time and update `docs/IMPLEMENTATION_LOG.md` with observed results.

Minimum acceptance for this modification track:

1. Entry/login and separate role-aware control-room and responder routes work; protected API routes remain server-guarded.
2. Existing SOS, gateway simulator, responder, replay/warnings, AI fallback and recovery flows are reachable through clear navigation and no longer require one giant page.
3. Dashboard client simulator can create an SOS, demonstrate internet/offline queue and a labelled simulated SMS/gateway path, and show the acknowledged report in responder operations.
4. Flutter app builds and provides demo onboarding, NID-like format/uniqueness enforcement, SOS form, durable outbox and explicit internet/SMS handoff states.
5. Primary/backup LLM settings fail over safely and deterministic local fallback remains available. No PII is sent externally.
6. Tests cover NID validation/uniqueness and the changed role/navigation/SOS transport journeys. Report actual commands/results; do not claim unrun checks.
7. Setup documentation includes web/API/database/Flutter run commands, synthetic demo accounts, provider configuration and honest limitations.

If the hackathon timebox cannot complete every item, deliver the polished role-based web product and working dashboard simulator first, then the Flutter app, then optional external LLM adapters. Keep the explicit backup-provider configuration seam documented; do not substitute a fake “connected” indicator.
