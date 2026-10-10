# 02 Prior-Art and Competitive Analysis Report

Conducted by: Prior-Art Analyst (Non-Voting Officer)
Date: 2026-10-10
Status: Verified & Benchmarked

## 1. Competitive Landscape Comparison Matrix

| System / Platform | Warning & Forecasting | SOS Distress Channel | Offline / Blackout Operation | Coordination & Triage | Local Language (Bangla / Banglish) | Cost / Availability in Bangladesh |
|---|---|---|---|---|---|---|
| **Google Flood Hub** | High (AI hydrological forecast up to 7 days) | None (Purely broadcast forecasting; zero citizen distress uplink) | Zero (Requires internet data connection to render maps) | None (Public consumer dashboard; no boat or mission triage) | Partial (Web UI localized, but river stage descriptions generic) | Free / Public web; operational along major rivers (e.g., Jamuna, Padma) |
| **Bangladesh FFWC & BMD CAP** | Medium (Daily water level bulletins, CAP RSS feeds) | None (Unidirectional government broadcast) | Zero (Requires cellular web or radio/TV) | Disconnected (District administration receives bulletins via fax/email) | Native Bangla bulletins | Free / National; suffers from gauge submersion (Parshuram sensor severed Aug 2024) |
| **Apple Emergency SOS via Satellite** | None (Incident response only) | Proprietary Satellite SOS (Short text questionnaire via Globalstar) | High (Direct LEO/MEO satellite uplink with sky-pointing guide) | Routed to proprietary Apple relay centers -> PSAP (911/999) | English / limited European languages; zero dialect Bangla support | Hardware-locked (iPhone 14+); Service not officially licensed or active in Bangladesh |
| **Starlink Direct-to-Cell (T-Mobile / Banglalink)** | None (Pure transport bearer) | Standard SMS / LTE data over satellite payload | High (Overcomes ground tower collapse via space base station) | Transport layer only; zero incident triage, boat routing, or recovery ledger | Transparent bearer (any text) | Commercial carrier partnership; Banglalink trial announced Oct 2026, regulatory approvals pending |
| **Ushahidi / Crisis Cleanup** | None (Crowdsourced incident tracking) | Web, SMS, email crowd-mapping forms | Poor (Web-centric; SMS ingestion requires complex third-party aggregators) | Good for crowd pins; lacks deterministic life-saving boat priority | English-centric; relies on human crowdsourced translators | Open-source / SaaS; unintegrated with Bangladesh civil defense or BTRC |
| **Cyclone Preparedness Programme (CPP)** | Community flags & megaphones | HF/VHF radio relays to Upazila command | High (Human volunteer network with battery radios) | Manual paper ledgers and radio dispatch logs | Native oral dialects | Government/IFRC funded; primary focus on coastal cyclone surge rather than flash flood rivers |
| **Aali AI (This Submission)** | **3-Signal deterministic alert (Gauge + Rain + Volunteer) + Blank-Gauge Anomaly** | **Compact 42-byte ASCII packet via SMS (1090) or D2C, fallback to web direct** | **Designed for 94% tower blackout; survives zero data network** | **Deterministic multi-factor incident priority + Human-in-the-loop boat dispatch + Equity recovery ledger** | **Dual English/Bangla + Dialect/Banglish AI parser with keyword fallback** | **Zero bespoke hardware; runs on commodity Android & feature phones** |

## 2. What is Genuinely New in Aali AI (Narrowly Defined)
1. **The Blank-Gauge Escalation Rule**: Unlike Google Flood Hub or FFWC which halt or display stale data when river telemetry gauges submerge or sever power, Aali AI deterministically detects a silent sensor under heavy rain and escalates alert levels with an explicit `GAUGE_SILENT` reason code.
2. **Deterministic 42-Byte ASCII Packet Envelope**: Encapsulating 7-character geohash coordinates, demographic headcounts (elderly, child, medical, trapped), UTC timestamps, and CRC-16 checksum into 42 printable ASCII characters allows life-saving distress data to survive across a single 160-character SMS segment with 118 bytes of headroom for retransmission.
3. **Silent Village Spatial Anomaly Detection**: Detecting uncontacted clusters whose geographical neighbors are actively reporting floodwaters, flagging them as `VERIFY_BY_SAFE_MEANS` to prevent out-of-sight disaster casualties.
4. **Resilient AI Subsystem with Deterministic Guardrails**: Restricting AI strictly to non-consequential tasks (dialect extraction, duplicate candidate suggestion, notification drafting) while delegating life-critical boat prioritization, triage, and warning state transitions to immutable deterministic code.

## 3. What is Already Solved Better Elsewhere
1. **Macro Hydrological Modeling**: Google Flood Hub and GloFAS have vastly superior long-range satellite gauge inundation forecasting models with multi-day lead times based on comprehensive digital elevation models (DEM).
2. **Direct Satellite Radio Handshake**: Apple's custom RF satellite baseband chips and antenna pointing guidance offer superior link budget performance compared to generic terrestrial LTE antennas attempting LEO satellite handshakes under torrential rain.
3. **Mass Alerting Reach**: Government Cell Broadcast Systems (CBC/CMAS) reach millions of cellular handsets in seconds without network congestion; Aali AI must feed into cell broadcast rather than attempt point-to-point SMS delivery at scale.

## 4. Platform Encroachment Risk (Big Tech / Carrier Clone Risk)
- **High Risk**: A mobile operating system vendor (Google Android) or telecom giant (e.g., Grameenphone / Banglalink) could natively integrate SMS distress compression into their core operating system dialer or network gateway within 6–12 months if emergency standards mandate it.
- **Defensible Wedge**: Aali's defensibility lies in its institutional integration with Upazila Disaster Management Committees (UDMC), volunteer staff-gauge validation networks (CPP/BDRCS), and local dialect understanding that generic planetary platforms ignore.

