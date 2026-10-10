# AALI AI (আলি এআই) — Feni & Sylhet Flash-Flood Resilience Platform

> **"When the towers die, the SOS doesn't."**  
> *Track 1: Climate Resilience & Humanitarian Action · Hack for Humanity 2026*  
> *Team: Aali AI Resilience Core*

---

## 1. The Crisis Baseline: 92.6% Cellular Collapse in Feni & Sylhet

In August 2024, **616 of 653 cellular base stations (92.6%) in Feni failed within 48 hours** due to submerged backup power. Telemetered river gauges stopped transmitting as waters surged **+6.92m in 15 hours**. Over 350,000 citizens were stranded in total communication blackout while emergency hotlines jammed at 12 calls/minute with zero shared visibility. Similar catastrophic infrastructure collapse isolated Sylhet in 2022 and 2024.

| 616 / 653 (92.6%) | +6.92 m in 15h | 42 Bytes | 8–24 Hours |
| :---: | :---: | :---: | :---: |
| **Feni Towers Down by Aug 24 (BTRC)** | **Muhuri River Rise at Parshuram (BWDB)** | **Compact ASCII Distress Packet (1 SMS)** | **Evacuation Lead Time via Blank-Gauge Rule** |

---

## 2. The Operational Breakthrough: Before, During, and After Collapse

| BEFORE · Proactive Warning | DURING · Zero-Tower SOS & Triage | AFTER · Fair Relief & Audit |
| :--- | :--- | :--- |
| **• 3-Signal Hydrology Fusion:** Fuses BWDB river gauges, satellite rainfall (NASA GPM/BMD), and volunteer staff readings.<br/>**• Blank-Gauge Escalation Rule:** A silent sensor is *never* treated as safe water. If a gauge stops transmitting for $\ge 60$ min while rain $>75\text{ mm}$, alert escalates to **`ACT` (Red)** immediately.<br/>**• Mosque Audio Broadcast:** Automated Mosque Loudspeaker (মাইকিং) Bengali voice alerts for areas without phones. | **• 42-Byte ASCII Packet:** Entire distress call (headcount, elderly, child, trapped, geohash) compressed into 1 standard SMS or Starlink Direct-to-Cell burst.<br/>**• Dialect NLP:** Gemini Flash translates regional Noakhali/Feni dialects into structured JSON, backed by deterministic local regex fallback.<br/>**• Human-in-the-Loop Rescue:** Deterministic boat ranking (people, water rise, spotlight, fuel range). **ZERO auto-dispatch.** | **• Tube-Well Contamination Ledger:** Tracks submerged drinking water sources by village (BBS Census weighted).<br/>**• SHA-256 Anti-Fraud Guard:** Cryptographic idempotency keys prevent relief double-claiming or paperwork tampering.<br/>**• Silent-Village Detection:** Flags communities with high hazard but zero reports (absence of calls $\neq$ proof of safety). |

---

## 3. System Architecture & The Aali Compact (The Institutional Premise)

Aali AI bridges the real-world humanitarian gap under an institutional three-party emergency compact:

| Stakeholder | Operational Role & Commitment | Value Received |
| :--- | :--- | :--- |
| **Government (BTRC, DDM, BWDB)** | Declares emergency mode for affected upazilas; signs official warnings; owns the immutable audit trail. | Verified common operating picture; automated draft alerts. |
| **Telecoms (Banglalink, GP, Robi)** | Opens satellite-to-phone (Starlink D2C) emergency roaming to all SIMs; auto-forwards SOS packets to Aali; zero-rates app. | Turnkey humanitarian use case for newly launched satellite spectrum. |
| **Responders (Red Crescent, FSCD)** | Operates from unified Web Situation Room; maintains live boat inventory; signs off rescue missions. | Eliminates blind double-dispatch; prioritizes trapped families with spotlight equipment. |

---

## 4. Ethical AI Boundaries: What AI Does vs. What Remains Deterministic

* **AI DOES (Assistance & Synthesis):**
  1. Parses unstructured dialect Bengali/Banglish SOS text and audio into schema JSON.
  2. Matches differently worded duplicate reports using semantic text similarity.
  3. Drafts localized evacuation warnings and boat dispatch reasoning.
* **AI NEVER DOES (Strict Deterministic Rules):**
  * Flood alert levels (`Watch`/`Warning`/`Act`), confidence scores ($0-100\%$), boat prioritization math, and relief entitlements are **100% deterministic, transparent code**.
  * An AI hallucination or network drop never costs a human life.
  * **Zero auto-dispatch:** An incident commander must explicitly approve every rescue mission.

---

## 5. Verified Prototype Evidence (100% Passing Test Suites)

| Component | Technology Stack | Verification & Live Hardware Status |
| :--- | :--- | :--- |
| **Backend API Gateway** | NestJS 10, TypeORM, MySQL 8.4, SSE Stream | **113 / 113 Tests Passed** (26 suites). Strict RBAC & audit logging. |
| **Web Situation Room** | React 18, TypeScript, Vite, Pure Dark UI | **48 / 48 Tests Passed** (13 suites). Zero-lag SSE stream, Leaflet maps. |
| **Resident Mobile App** | Flutter 3.x, Material 3, Vector Canvas Map | **16 / 16 Tests Passed**. Verified on physical Android 13+ device via wireless ADB. |
| **SMPP Telecom Gateway** | Node.js TCP PDU Server (Port 2775) | Shortcode 1090 GSM 03.38 PDU parsing and REST bridge operational. |

---

## 6. Honest Scope & Physical Final Readiness (October 23, 2026)

* **What is 100% Real in the Demo:** Working REST API, real-time SSE stream, full React Web Command Room, physical Flutter app on Android 13+ with offline SQLite queue, audio broadcasts, and MySQL database.
* **What is Honest Simulation:** Carrier satellite-to-phone spectrum is simulated via local Wi-Fi uplink (`STARLINK_D2C_WIFI`); cell tower blackout is simulated via control toggles; flood hydrograph is reconstructed from published BWDB/FFWC observations.
* **Physical Final Staging (Oct 23):** Fully rehearsal-ready with 1-click Stage Demo Director, physical Android device wireless mirror, mosque loudspeaker amp output, and full multi-district (Feni & Sylhet) operational coverage.

