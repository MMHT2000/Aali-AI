# Road to 100 — Aali AI

This roadmap defines the concrete, prioritized backlog required to take Aali AI from its baseline panel score of **86 / 100** to **88 / 100** (Quick Wins verified) and to a **perfect 100 / 100** for the AIUB Grand Finale.

Actions are ranked by **expected panel points per unit of effort**.

---

## 1. Quick Wins (Completed 10 Oct 2026) · High Points / Low Effort (S: < 2h)

| ID | Originating Judge | Criteria Moved | Exp. Points | Effort | Action | Status & Acceptance Verification |
|---|---|---|:---:|:---:|---|---|
| **ACT-01** | Developer | D4 | **+1** | S (< 1h) | **Hard-lock production JWT startup check.** Refuse server start if `JWT_SECRET` is unset or matches dev default. | **COMPLETED & VERIFIED.** Throws fatal error on startup when `NODE_ENV=production` and secret is empty. (`main.ts:25`) |
| **ACT-02** | Field Expert | F2 | **+2** | S (< 2h) | **Tactile Step-Sliders for Mobile Volunteer Form.** Replace numeric text entry with +/- 10cm quick-tap water level step buttons & BWDB presets. | **COMPLETED & VERIFIED.** Mobile volunteer view allows submitting water readings without virtual keyboard. (`main.dart:450`) |
| **ACT-03** | UI/UX Designer | U1 | **+1** | S (< 1.5h) | **Disaster Lifecycle Accordions in Sidebar.** Group workspace sidebar into "BEFORE (Preparedness)", "DURING (Rescue)", and "AFTER (Recovery)". | **COMPLETED & VERIFIED.** Sidebar displays 3 collapsible phase headers with badge indicators. (`ControlRoom.tsx:135`) |
| **ACT-04** | Academician | A1, A4 | **+1** | S (< 1h) | **Formal Census Demographic Citation.** Add BBS 2022 Census citation for Feni district's 1.65M population in proposal text. | **COMPLETED & VERIFIED.** Formally documented in `docs/proposal/DEMOGRAPHIC_CITATION_BBS2022.md`; Claim S-10 verified. |
| **ACT-05** | Mobile Operator | O3 | **+1** | S (< 1.5h) | **Satellite Open-Sky Guide on Mobile.** Add an in-app visual hint: "For Satellite D2C, step away from metal roofs and hold phone toward open sky". | **COMPLETED & VERIFIED.** Mobile app displays bilingual guidance banner when satellite transport is active. (`main.dart:285`) |

*Subtotal Gain Achieved: +6 Criteria Points (+2 Composite Panel Points, Score: 88/100)*

---

## 2. Finale Enhancements (Before 24 Oct AIUB Finale) · Medium Effort (M: 2–6h)

| ID | Originating Judge | Criteria Moved | Exp. Points | Effort | Action | Acceptance Test & Files |
|---|---|---|:---:|:---:|---|---|
| **ACT-06** | Developer | D3, D8 | **+3** | M (3h) | **Headless Playwright End-to-End Smoke Test.** Automate the 5-minute judge demo flow in headless Chromium and commit video recording. | `npm run test:e2e` launches browser, clicks through demo runner, asserts status transitions. |
| **ACT-07** | Field Expert | F6 | **+3** | M (4h) | **Ready-to-Air Loudspeaker Audio Generator.** Use Web Speech API or local TTS to generate a downloadable Bengali MP3 announcement. | Warning approval view generates a `.mp3` audio player for mosque loudspeaker broadcast. (`alerts.controller.ts`) |
| **ACT-08** | Mobile Operator | O8, O10 | **+3** | M (4h) | **Telecom SMPP v3.4 Ingestion Gateway Container.** Provide a lightweight mock SMPP gateway translating telecom short-code SMS to Disaster Packets. | Docker container receives simulated SMPP PDU, decodes packet, posts to Aali API. (`docker-compose.yml`) |
| **ACT-09** | Academician | A3 | **+3** | M (4h) | **Dialect Corpus Benchmark Expansion.** Expand synthetic benchmark from 30 to 100 messages including colloquial Feni/Noakhali phrases. | `GET /api/v1/ai/benchmark/samples` returns 100 evaluated cases with ROC curve. (`ai.service.ts`) |
| **ACT-10** | Field Expert | F4 | **+3** | M (3h) | **Boat Fuel & Night Visibility Constraints.** Add fuel consumption radius and night spotlight flags to boat asset suggestions. | Asset cards display estimated fuel range in km and daylight requirement flags. (`boat-priority.service.ts`) |

*Subtotal Potential Gain: +15 Panel Points*

---

## 3. Post-Hackathon Research & Vision (Long-Term / Institutional Pilot)

1. **Physical Banglalink Starlink Field Test:** Conduct live transmission of a 42-character packet from a zero-cellular valley in Parshuram.
2. **BTRC Emergency Roaming Regulatory Directive:** Work with BTRC, DDM, and MNOs to draft the official emergency telecom clearinghouse tariff.
3. **On-Device Whisper STT:** Run offline speech-to-text quantized model directly on Android handsets for voice notes.
4. **Dynamic Embankment Siltation Calibration:** Partner with BWDB to calibrate riverbed siltation shifts on the Muhuri gauge SW212.

---

## 4. The "Do NOT Do" List (Anti-Patterns to Avoid)

1. **DO NOT replace deterministic alert rules with deep neural networks.** The academician and field judges praised transparent rules. Replacing them with a black-box model will lose 10+ points.
2. **DO NOT auto-dispatch rescue boats.** Always maintain the human authorization gate. Autonomous emergency dispatch is an instant red flag.
3. **DO NOT invent real people's phone numbers or addresses in demo data.** Always use synthetic fixtures.
4. **DO NOT claim satellite D2C is "proven in Feni floodwaters."** Maintain the honest phrasing: *"Built for the D2C service that went live on Oct 7, 2026; simulated in demonstration."*

---

## 5. Cap Removal Verification
All 10 Global Caps (C1 through C10) were audited by the Chair. **Zero caps were triggered** because:
- Clean checkout boots in ~1.2 minutes (Cap C1 limit: 15 min).
- Core rescue flow functions end-to-end with immutable audit logs (Cap C2 limit).
- System has 10 multi-role screens and JWT RBAC (Cap C3 limit).
- 170 unit & integration tests pass cleanly with zero failures (Cap C6 limit).
- Plaintext NIDs and passwords are fully hashed with SHA-256 HMAC and bcrypt (Cap C7 limit).
- Flutter 3.47 Android APK compiles cleanly (Cap C8 limit).
- AI layer has deterministic regex fallback (Cap C9 limit).

