# AALI AI (আলি এআই) — Flash-Flood Resilience Platform

> **“When the towers die, the SOS doesn’t.”**  
> *Early warning, zero-tower rescue, and fair recovery for Feni & Sylhet in the satellite-to-phone era.*  
> **Track 1: Climate Resilience & Humanitarian Action · Hack for Humanity 2026**

---

## 1. The Ground Reality: One Night in Feni & Sylhet

Rain from the upstream Meghalaya and Tripura hills had fallen relentlessly. On 21 August 2024, the water inundated Parshuram and Fulgazi, filling schools and rooftops with marooned families. Within 48 hours, **616 of Feni’s 653 mobile towers (92.6%) collapsed** as backup battery power failed [1]. Telemetered river gauges stopped transmitting as the Muhuri river crested **+6.92m above danger level** [3]. Responders faced complete blackout; hotlines jammed at 12 calls/min with zero shared visibility [7]. A father held up his phone: zero bars.

**Now picture that scene with Aali AI:** His phone transmits a single 42-byte ASCII distress packet directly to satellite or surviving tower. On the control room map, his report appears instantly—de-duplicated, confidence-scored, and ranked to a rescue boat with night spotlight. Nobody phoned anyone.

| 616 / 653 (92.6%) | +6.92 m in 15 Hours | 42 Bytes | 8–24 Hours Lead Time |
| :---: | :---: | :---: | :---: |
| **Feni Towers Dead (BTRC) [1]** | **Muhuri Rise at Parshuram [3]** | **ASCII Disaster Packet (1 SMS)** | **Via Blank-Gauge Rule** |

---

## 2. System Architecture & The 3-Phase Operational Lifecycle

**WHY NOW:** On 7 October 2026, Banglalink launched commercial Starlink Direct-to-Cell (D2C) in Bangladesh—enabling any standard 4G phone to reach low-earth satellites with no dish [5]. Aali AI provides the operational decision-support software to turn this breakthrough into life-saving action.

```text
┌─────────────────────────────────┐      ┌──────────────────────────────┐
│        EDGE SOS CLIENTS         │      │       TELECOM GATEWAY        │
│ • 3-Tap Resident App (Flutter)  │ ───► │ • SMPP v3.4 Shortcode 1090   │
│ • 42-Byte SMS (Any 2G SIM)      │      │ • 7-Bit GSM PDU Extraction   │
│ • Starlink D2C Satellite Link   │      │ • Multi-Endpoint Auto-Latch  │
│ • Offline SQLite Queue Buffer   │      │ • Ingestion REST Bridge      │
└─────────────────────────────────┘      └──────────────┬───────────────┘
                                                        │
┌─────────────────────────────────┐      ┌──────────────▼───────────────┐
│     WEB SITUATION ROOM (VITE)   │      │   DETERMINISTIC CORES & NLP  │
│ • Live SSE Stream Map (Leaflet) │ ◄─── │ • Blank-Gauge Rule (60m fail)│
│ • Mosque Loudspeaker Audio PA   │      │ • Gemini Flash Dialect NLP   │
│ • Human Rescue Boat Sign-Off    │      │ • Deterministic Regex Engine │
│ • Post-Flood Relief Ledger      │      │ • Boat Priority & Fuel Checks│
└─────────────────────────────────┘      └──────────────────────────────┘
```

---

## 3. The Solution in Three Operational Moves

| BEFORE · Surviving a Blank Gauge | DURING · Rescue with Zero Towers | AFTER · Fair Recovery & Relief |
| :--- | :--- | :--- |
| **• 3-Signal Fusion:** Combines BWDB Muhuri/Surma gauges, satellite rainfall (JAXA GSMaP / BMD), and volunteer staff readings.<br/>**• Blank-Gauge Rule:** When water surges, river sensors often sever. If a gauge goes silent for $\ge 60$ min while rain $>75\text{ mm}$, alert auto-escalates to **`ACT` (Red)**. Silence is never treated as safety.<br/>**• Audio Siren/মাইকিং:** Localized Bengali mosque loudspeaker alerts synthesized for uncharged phones. | **• 42-Byte ASCII Packet:** Distress report compresses into 1 standard SMS or satellite burst.<br/>**• Dialect NLP:** Gemini Flash converts Noakhali/Sylheti dialect into schema JSON; deterministic local regex fallback guarantees zero downtime.<br/>**• Human-in-the-Loop Boats:** Prioritizes stranded families (elderly, infants, roof entrapment, night spotlight, 22km fuel limit). **ZERO auto-dispatch.** | **• Tube-Well Ledger:** Tracks submerged drinking water sources (BBS 2022 Census weighted).<br/>**• Cryptographic Anti-Fraud:** SHA-256 idempotency key prevents relief embezzlement or double-claiming.<br/>**• Silent-Village Detection:** Flags communities with high hazard but zero reports (absence of calls $\neq$ proof of safety). |

---

## 4. The 42-Byte ASCII Disaster Packet: Precision Engineering

When mobile networks collapse, high-bandwidth data drops to 0 kbps. Aali AI encodes full distress telemetry into an ultra-dense 42-byte ASCII packet that comfortably fits within a single 160-character 7-bit GSM SMS or narrowband satellite frame:

```text
A1|S|w7cx000|04|E1C0M0T1|261011-0246|SOS7|0NTV
```

| Field | Segment | Technical Definition & Operational Function |
| :--- | :---: | :--- |
| **Protocol & Type** | `A1` \| `S` | Version `A1` allows backward compatibility; `S` indicates Emergency SOS (`R` = Road hazard, `N` = Need, `G` = Gauge observation). |
| **Geohash-7** | `w7cx000` | Compresses GPS latitude/longitude to a $153\text{ m} \times 153\text{ m}$ bounding box without requesting map tiles or cellular triangulation. |
| **Vulnerabilities** | `04` \| `E1C0M0T1` | Headcount (4 people). Bitflags: `E1` = Elderly present, `C0` = No infants, `M0` = No acute medication, `T1` = Trapped on roof/tree. |
| **Checksum & ID** | `SOS7` \| `0NTV` | Unique short identifier `SOS7` + CRC-16/CCITT-FALSE 4-character Base36 checksum (`0NTV`) preventing corrupt packet ingestion. |

---

## 5. The Institutional Premise: The Aali Emergency Compact

Technology cannot succeed without institutional alignment. Aali AI is premised on a three-party emergency compact activated during declared flood events (mirroring Jamaica’s 2025 Starlink activation during Hurricane Melissa [9]):

| Stakeholder | Operational Commitment | Institutional Benefit & Value |
| :--- | :--- | :--- |
| **Government (BTRC, DDM, BWDB)** | Declares flood emergency for named upazilas; signs official alerts; owns the immutable audit trail. | Unified multi-agency situational awareness; zero reliance on blind hotlines. |
| **Telecoms (Banglalink, GP, Robi)** | Opens satellite D2C emergency roaming to all SIMs; forwards SOS packets to Aali; zero-rates mobile app. | Fulfills ITU Early Warnings for All mandate; high-impact humanitarian showcase. |
| **Responders (Red Crescent, FSCD)** | Operates Web Command Room; manages rescue boat inventory; confirms field rescues and relief. | Eliminates dangerous blind dispatch; protects volunteer boat crews. |

---

## 6. Ethical AI Boundaries: What AI Does vs. What Remains Deterministic

* **Where AI Does the Work:** (1) Reads unstructured dialect Bengali/Banglish SOS text and audio into schema JSON; (2) Semantic text-similarity matching for duplicate reports; (3) Drafts localized evacuation warnings and boat dispatch reasoning.
* **Where AI is Strictly Barred (100% Deterministic Code):** Flood warning levels (`Watch`/`Warning`/`Act`), confidence scoring ($0-100\%$), boat prioritization math, and relief entitlement are **100% transparent deterministic domain code**. An AI hallucination never risks a human life. **ZERO auto-dispatch:** All operations require an authenticated human signature.

---

## 7. Verified Full-Stack Prototype Status & Physical Final Readiness

| Subsystem | Technology Stack & Endpoints | Verification Status & Hardware Evidence |
| :--- | :--- | :--- |
| **Backend API** | NestJS 10, TypeORM, MySQL 8.4 (`:3001`/`:3002`) | **113 / 113 Tests Passed** (26 suites). SSE stream, strict RBAC, HMAC privacy hashing. |
| **Web Situation Room** | React 18, Vite, Leaflet, Dark UI (`:5173`/`:5174`) | **48 / 48 Tests Passed** (13 suites). 1-Click Demo Director, emergency alert banner. |
| **Tactile Mobile App** | Flutter 3.x, Material 3, Vector Canvas | **16 / 16 Tests Passed**. Verified on physical Android 13+ device via wireless ADB (`192.168.0.110`). |
| **SMPP Telecom Gateway**| Node.js TCP PDU Server (`:2775`) | Shortcode 1090 GSM 03.38 PDU parsing and REST bridge operational. |

* **Honest Simulation Disclosures:** Carrier satellite-to-phone spectrum is simulated via local Wi-Fi uplink (`STARLINK_D2C_WIFI`); cell tower blackout is simulated via control toggles; flood hydrograph is reconstructed from published BWDB/FFWC observations.
* **Physical Final Readiness (October 23, 2026):** The system is completely stage-rehearsed with dual-screen scrcpy mobile mirroring, 1-click Demo Director HUD, portable loudspeaker amp connection, and full multi-district (Feni & Sylhet) support.

---

### Sources & References
[1] BTRC via Daily Star, Dhaka Tribune, Jagonews, 23–24 Aug 2024. [2] TBS Panorama on amateur radio in Feni; Prothom Alo, 23 Aug 2024. [3] UNB, Feni embankment collapse, July 2025. [4] Daily Star, 26 Aug 2024. [5] BSS, Daily Star, Prothom Alo, 7 Oct 2026. [6] ITU, WMO and UNDRR, Bangladesh Early Warnings for All roadmap. [7] IFRC, 7 Oct 2024. [8] Daily Star/UNB, Sept 2024. [9] Liberty Latin America, 29 Oct 2025. [11] BTRC subscriber data via Wikipedia, June 2025.
