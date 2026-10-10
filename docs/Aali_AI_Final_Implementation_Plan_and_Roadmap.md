# AALI AI — Detailed Implementation Plan & Roadmap

> **Current State, Technical Limitations & Target Deliverables for Physical Final on October 23, 2026**  
> *Prepared for: Hack for Humanity 2026 Finals Committee & Mentors*

---

## 1. Executive Overview & Physical Final Context

Aali AI is a production-grade full-stack disaster resilience and decision-support prototype engineered for the flash-flood vulnerabilities of Bangladesh (specifically Feni Muhuri basin and Sylhet Surma basin). The system addresses total infrastructure collapse (616 of 653 cell towers offline) using 42-byte ASCII packets, satellite Direct-to-Cell routing, deterministic hydrology escalation, and human-in-the-loop rescue coordination.

The project is competing in the **National Physical Final on October 23, 2026**. This document establishes the exact verified state of the codebase as of October 11, codifies honest engineering boundaries, and details the sprint roadmap leading into the live stage showcase.

---

## 2. Current State: Component-by-Component Audit (October 11, 2026)

| Component & Layer | Technology Stack | Current Operational State & Verification Metrics |
| :--- | :--- | :--- |
| **Backend API Gateway** | NestJS 10, TypeORM, MySQL 8.4, RxJS SSE stream | Fully operational on `:3001` (Dev) and `:3002` (Docker). **113 of 113 automated tests passing**. Zero-latency SSE event bus, strict RBAC, HMAC-SHA256 privacy hashing, and OpenAPI/Swagger documentation. |
| **Web Situation Room** | React 18, TypeScript, Vite, Leaflet, Pure Dark UI | Operational on `:5173` (Dev) and `:5174` (Docker). **48 of 48 unit tests passing**. Real-time emergency banner, 1-Click Stage Demo Director, master crisis clock, and multi-district map toggling. |
| **Tactile Mobile Client** | Flutter 3.x, Material 3, Custom Vector Canvas | **Installed and verified live on physical Android 13+ device via wireless ADB**. **16 of 16 tests passing**. Multi-transport auto-latching across LAN endpoints (`:3001`, `:5173`, `:5174`, `:3002`). Offline SQLite outbox buffer. |
| **Telecom SMPP Gateway** | Node.js TCP PDU Server (SMPP v3.4), GSM 03.38 | Listens on port `:2775` for telecom carrier links. Emulates shortcode 1090 routing, unpacking 42-byte ASCII packets directly into the REST API. |
| **Regional Audio Engine** | HTML5 Web Audio, Bengali SpeechSynthesis, Loudspeaker PA | Operational on both web dashboard and mobile client. Synthesizes mosque loudspeaker (মাইকিং) alerts for Sylhet DC and Feni DC with local TTS fallback. |

---

## 3. Honest Engineering Limitations & Boundaries

In strict compliance with humanitarian integrity and contest rules, all operational simulations are explicitly disclosed:

* **Satellite Direct-to-Cell Carrier Spectrum:** Live low-earth-orbit Starlink cellular spectrum is licensed exclusively to mobile network operators (Banglalink). In the prototype, satellite transmission is honesty-modeled via Wi-Fi uplink (`X-Transport-Type: STARLINK_D2C_WIFI`) and transparently badged `[HACKATHON SIMULATION]`.
* **Cell Tower Blackout:** Software-controlled simulation toggle based on verified BTRC August 2024 outage data (92.6% tower collapse).
* **Human-in-the-Loop Constraint:** AI is strictly barred from autonomous boat dispatch, warning publication, or aid entitlement. A human commander must sign every operational change, producing an immutable audit log.
* **Flood Hydrology:** Reconstructed from published BWDB/FFWC station records for the August 2024 Feni flood and July 2024 Sylhet flood. We do not claim an uncalibrated physics simulation.

---

## 4. Sprint Roadmap Before the Physical Final (October 11 – October 23)

### Sprint 1: Physical Stage Rig & Hotspot Resilience (Oct 11 – Oct 14)
1. **Dedicated Stage Hotspot:** Configure a standalone Wi-Fi router (`192.168.1.1`) to isolate the presentation laptop and mobile devices from conference hall Wi-Fi congestion.
2. **Dual-Display Wireless Mirroring:** Configure scrcpy / wireless ADB casting to display the physical mobile screen side-by-side with the Web Situation Room on stage.
3. **Docker One-Command Freeze:** Verify `docker compose up -d` launches all services cleanly on cold boot without requiring internet package fetches.

### Sprint 2: Offline Multi-Hop Mesh Buffer (Oct 15 – Oct 18)
1. **Peer-to-Peer Wi-Fi Direct / BLE SOS Relay:** Extend Flutter client with lightweight peer exchange so devices without satellite coverage can store-and-forward packets through neighboring devices that regain connectivity.
2. **Bundled Audio Assets:** Bundle pre-recorded high-fidelity Bengali PA audio announcements inside the APK assets to eliminate any network dependency during audio playback.
3. **High-Contrast Sunlight Theme:** Polish outdoor visibility for field responder screens under bright stage floodlights.

### Sprint 3: Physical Audio & Shelter Onboarding Rig (Oct 19 – Oct 21)
1. **External Loudspeaker Amplifier Hookup:** Integrate a 3.5mm / Bluetooth portable megaphone to play the mosque evacuation broadcast audibly during the 5-minute presentation.
2. **Offline Shelter QR Station:** Create printable QR codes allowing marooned citizens entering school shelters to tap-and-check-in without cellular coverage.
3. **Volunteer Field Reading Calibration:** Fine-tune staff gauge reading input form for CPP volunteers.

### Sprint 4: Full Dress Rehearsal & Live Pitch Freeze (Oct 22 – Oct 23)
1. **5-Minute Choreography Dry-Runs:** Rehearse the 5 stage moments using the Stage Demo Director HUD.
2. **Rapid Q&A Defense Drills:** Practice handling harsh panel inquiries on telecom partnerships, operational costs, and ethics.
3. **Codebase Lock & Tag:** Git tag `v1.0.0-physical-final` with complete test logs and evidence files.

---

## 5. Risk Assessment & Mitigation Matrix

| Identified Risk | Impact | Pre-Engineered Mitigation Strategy |
| :--- | :--- | :--- |
| **Stage venue Wi-Fi drops or blocks LAN ports** | **High** | Standalone portable router with pre-configured static IPs (`192.168.1.100` laptop, `192.168.1.110` mobile). Zero dependence on venue Wi-Fi. |
| **Gemini Flash API rate-limited or offline** | **Medium** | Built-in deterministic regex fallback engine extracts headcount and urgency keywords instantly with zero network delay. |
| **Physical Android phone battery or display glitch** | **High** | Backup secondary device with pre-installed APK ready on standby, plus browser-based 3-Tap SOS simulator as fallback. |
| **Judges challenge satellite-to-phone realism** | **Medium** | Cite Banglalink 7 Oct 2026 launch approval, BTRC regulatory filings, and Liberty Caribbean Jamaica precedent in the Stage Defense Playbook. |
