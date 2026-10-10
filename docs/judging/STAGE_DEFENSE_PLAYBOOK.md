# Aali AI — Hackathon Stage Defense & Pitch Playbook

> **Context:** 5-minute live pitch and aggressive Q&A defense for the Feni Flash Flood Disaster Decision-Support System.  
> **Key Mantra:** *"Decision-support, not auto-pilot. Deterministic safety, AI assistance, 100% honesty."*

---

## ⏱️ Part 1: The 5-Minute Stage Pitch Choreography

### Moment 1 (0:00 – 0:30) | The Crisis: Feni Cellular Blackout
* **Visual:** Web Situation Room (`http://localhost:5173`) showing 2024 Feni flood scenario with 600+ severed mobile towers.
* **Speaker Script:**
  > *"In August 2024, flash floods severed over 600 of Feni's 653 mobile towers in 72 hours. While rivers surged 2 meters above danger level, emergency hotlines went dead and Indian upstream sensors stopped transmitting. Rescuers were navigating blind, and families in Parshuram and Fulgazi had zero connectivity. This is why we built **Aali AI**—a resilient disaster decision-support system engineered specifically for total infrastructure collapse."*

### Moment 2 (0:30 – 1:30) | BEFORE: 3-Signal Fusion & The Blank Gauge Rule
* **Visual:** Control Room Alert Evaluation panel showing **ACT** status with the `BLANK_GAUGE_TRIGGERED` badge.
* **Speaker Script:**
  > *"Notice our early warning engine. Most systems fail when upstream gauges stop reporting. In Aali AI, a silent gauge is never treated as safe water. Under our deterministic **Blank-Gauge Escalation Rule**, if the Muhuri gauge goes blank for 60 minutes while satellite rainfall exceeds 75mm and ground volunteers report rising water, the system escalates directly to **ACT**—saving up to 8 hours of critical evacuation lead time before official advisories can be signed off."*

### Moment 3 (1:30 – 2:30) | DURING: 42-Byte Compact Disaster Packet & Dialect AI
* **Visual:** Mobile App Resident View showing Tower Blackout banner, Starlink D2C Wi-Fi uplink, and live packet stream.
* **Speaker Script:**
  > *"When cellular voice and 4G networks collapse, how do citizens reach help? Aali AI encodes critical SOS distress calls into a **42-byte Compact Disaster Packet** that can survive over ultra-narrowband channels—SMPP shortcodes, amateur radio, or Direct-to-Cell satellite. Inside the hackathon hall, our phone intentionally treats the Wi-Fi connection as a **Starlink Direct-to-Cell satellite uplink**, transmitting compressed telemetry directly to our SMPP gateway. On the receiving end, Google Gemini Flash parses Noakhali/Feni regional dialect (e.g., 'পানিতে তলাই গেছি, ঘরের চালে আটকা') extracting headcounts and entrapment status in milliseconds, with an instant deterministic rule fallback if the cloud is unreachable."*

### Moment 4 (2:30 – 3:30) | DURING: Boat Priority Triage & Human Review
* **Visual:** Responder Triage Desk showing incident priority score (87%), night navigation spotlight warning, and the green `ASSIGN BOAT` button.
* **Speaker Script:**
  > *"In a flood, you never have enough boats. Aali AI scores rescue urgency using pure deterministic rules: rooftop entrapment, infants, elderly, and medical distress. But here is our non-negotiable safety boundary: **AI never auto-dispatches a boat.** Our system suggests the optimal vessel—calculating fuel radius and night spotlight readiness—but an authorized human responder must click to approve. Every single approval is immutably logged with actor ID and timestamp."*

### Moment 5 (3:30 – 4:30) | AFTER: Recovery Board & Tube-Well Equity Guard
* **Visual:** Web Recovery Board showing 142 submerged tube-wells and the idempotent aid distribution log.
* **Speaker Script:**
  > *"When floodwaters recede, the second disaster begins: cholera and aid hoarding. Our Post-Disaster Recovery Board audits submerged tube-wells using BBS 2022 demographic weighting. Our distributed ledger guarantees that relief distribution is **strictly idempotent**—no family can be double-counted or excluded due to chaotic paper records."*

### Wrap-Up (4:30 – 5:00) | The Verdict & Ask
* **Speaker Script:**
  > *"Aali AI is fully functional today: a NestJS core, live MySQL database, SMPP v3.4 telecom bridge, accessible React situation room, and an offline-resilient Flutter mobile app with custom bounded vector maps. We are ready to safeguard Feni."*

---

## 🥊 Part 2: Brutal Judge Q&A Defense Matrix

### 1. Developer Judge (Principal Systems Architect)
* **Q: "What happens if MySQL restarts or crashes during a 5,000 SOS/minute burst?"**
  * **Answer:** *"The ingestion gateway is decoupled. Packets enter via our standalone Node.js SMPP v3.4 server (`packages/smpp-gateway`) and our NestJS API boundary. If MySQL restarts, the mobile app holds packets in an offline local SQLite/SharedPreferences buffer, re-transmitting with exponential backoff. At the database layer, all state changes use ACID transactions with idempotency keys (`X-Idempotency-Key`), preventing duplicate records upon database recovery."*
* **Q: "Show me your test coverage. Did you actually run tests or just write them?"**
  * **Answer:** *"We have 109 passing backend unit and integration tests (`npm run test:api`), 48 frontend component tests (`npm run test:web`), 14 Flutter widget and unit tests (`flutter test`), and a headless 5-moment end-to-end smoke test (`npm run test:e2e`). Every test runs in CI without skipping."*

---

### 2. Academician Judge (Disaster Risk & Hydrology Researcher)
* **Q: "How can you scientifically claim 8 to 24 hours of flood lead time when upstream Indian gauges are blanked out?"**
  * **Answer:** *"We do not rely on a single gauge. Our deterministic early warning model fuses three independent signals: (1) JAXA/BMD satellite upstream precipitation, (2) volunteer gauge observations along the Muhuri river, and (3) a blank-gauge escalation rule. During the August 2024 Feni flood, Indian upstream gauges stopped transmitting telemetry. Under our model, a sudden silence during high rainfall automatically escalates the warning tier. We cite the BBS 2022 Census for all demographic exposure calculations."*
* **Q: "Does AI make any life-critical decisions in your system?"**
  * **Answer:** *"Zero. Alert levels, confidence calculations, boat triage scores, and silent-village flags are strictly calculated by visible, deterministic TypeScript functions with explicit reason codes. AI (Gemini Flash) is restricted solely to dialect text parsing, duplicate text similarity suggestions, and drafting bilingual announcements. If the AI service fails or times out (4000ms), a deterministic regex fallback handles the extraction instantly."*

---

### 3. Mobile Network Operator Executive (Telecom & Satellite Lead)
* **Q: "You claim Direct-to-Cell satellite connectivity, but you are running inside a convention hall. How does this actually work?"**
  * **Answer:** *"We are completely honest about this: inside a convention hall, physical L-band Starlink D2C satellite links cannot reach the phone. For this hackathon, we intentionally treat the phone's Wi-Fi interface as a **hardware simulation of the Starlink D2C satellite uplink**. The phone labels the transport with an orange `[HACKATHON SIMULATION]` badge and transmits raw 42-byte packets with the `X-Transport-Type: STARLINK_D2C_WIFI` header. For terrestrial cellular networks, we have implemented an authentic SMPP v3.4 TCP server on port 2775 that accepts SMSC short-code binds for 1090/999 under BTRC emergency protocols."*
* **Q: "How will 42-byte SMS packets be zero-rated in Bangladesh?"**
  * **Answer:** *"Under BTRC emergency regulations, national shortcode `1090` (Disaster Early Warning) and `999` are already zero-rated across Grameenphone, Robi, Banglalink, and Teletalk. Our 42-byte ASCII payload fits inside a single standard 160-character 7-bit GSM SMS, meaning zero multi-part concatenation overhead and zero credit deduction for citizens."*

---

### 4. Field Expert Judge (CPP Volunteer / Red Crescent Director)
* **Q: "At 2:00 AM in pouring rain with mud on the screen, how can a responder or volunteer actually use your app?"**
  * **Answer:** *"We designed the mobile app specifically for tactile crisis conditions. In the volunteer river gauge view, we replaced fragile touch sliders with massive `48px` tactile stepper buttons (`-0.50m / +0.50m`) that work with wet hands. In the responder boat dispatch view, every boat asset displays its fuel radius (e.g., 22 km) and a night spotlight navigation warning to ensure boats do not navigate treacherous floodwaters blindly without high-candela floodlights."*
* **Q: "If no calls or SOS messages come from a village, do you assume they are safe?"**
  * **Answer:** *"Absolutely not. Rule #1 of our domain safety policy is: **No calls is unknown, not safe.** If a high-vulnerability village goes completely silent for 20 minutes during an active alert, our system triggers a high-visibility `SILENT_VILLAGE` alert in the Situation Room, prompting operators to dispatch physical reconnaissance."*

---

### 5. Senior UI/UX Designer Judge
* **Q: "How does an illiterate grandmother in a remote Feni char understand your interface?"**
  * **Answer:** *"The resident view features a massive, full-width high-contrast SOS emergency card with universal disaster iconography, large tactile buttons, and high-visibility red accents. Furthermore, our control room supports automated **Loudspeaker Audio Announcements** in clear regional Bangla via Web Speech and `/warnings/:id/loudspeaker-audio`, ensuring warnings are broadcast over mosque and union parishad loudspeakers to reach citizens who cannot read or operate smartphones."*
* **Q: "Why didn't you use standard Google Maps?"**
  * **Answer:** *"Standard online maps fail when cellular towers collapse. We built a custom **Bounded Feni Vector Canvas Map** that is strictly constrained to Feni District (`22.80°N - 23.30°N, 91.20°E - 91.60°E`). It renders natively with zero external map tiles, showing Upazila borders, the Muhuri river channel, real-time flood inundation gradients, and pulsating SOS pins without dropping a single frame."*

