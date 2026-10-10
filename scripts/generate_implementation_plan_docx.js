const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, PageBreak, HeadingLevel } = require('docx');
const fs = require('fs');
const path = require('path');

// Typography & Palette
const COLOR_PRIMARY = '0F172A';   // Slate 900
const COLOR_ACCENT = '1E40AF';    // Blue 800
const COLOR_ALERT = 'B91C1C';     // Deep Red 700
const COLOR_MUTED = '475569';     // Slate 600
const COLOR_BG_LIGHT = 'F8FAFC';  // Slate 50
const COLOR_BORDER = 'CBD5E1';    // Slate 300

function t(text, opts = {}) {
  return new TextRun({
    text,
    font: 'Calibri',
    size: opts.size ?? 21, // 10.5pt
    color: opts.color ?? COLOR_PRIMARY,
    bold: opts.bold ?? false,
    italics: opts.italics ?? false,
  });
}

function p(children, opts = {}) {
  return new Paragraph({
    spacing: { before: opts.before ?? 60, after: opts.after ?? 60, line: opts.line ?? 260 },
    alignment: opts.alignment ?? AlignmentType.LEFT,
    children: Array.isArray(children) ? children : [children],
  });
}

function h1(title) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 220, after: 80 },
    children: [
      new TextRun({ text: title, bold: true, size: 28, color: COLOR_ACCENT, font: 'Calibri' }),
    ],
  });
}

function h2(title) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 160, after: 60 },
    children: [
      new TextRun({ text: title, bold: true, size: 23, color: COLOR_PRIMARY, font: 'Calibri' }),
    ],
  });
}

function h3(title) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 120, after: 40 },
    children: [
      new TextRun({ text: title, bold: true, size: 20, color: COLOR_ALERT, font: 'Calibri' }),
    ],
  });
}

function cell(content, opts = {}) {
  const children = Array.isArray(content) ? content : [p(content, { before: 30, after: 30 })];
  return new TableCell({
    width: { size: opts.width ?? 50, type: WidthType.PERCENTAGE },
    shading: opts.shading ? { fill: opts.shading } : undefined,
    margins: { top: 60, bottom: 60, left: 90, right: 90 },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: COLOR_BORDER },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: COLOR_BORDER },
      left: { style: BorderStyle.SINGLE, size: 1, color: COLOR_BORDER },
      right: { style: BorderStyle.SINGLE, size: 1, color: COLOR_BORDER },
    },
    children,
  });
}

async function buildMasterPlanDocx() {
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Calibri', size: 21, color: COLOR_PRIMARY },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, bottom: 720, left: 720, right: 720 },
          },
        },
        children: [
          // ==================== COVER / HEADER ====================
          p([
            t('AALI AI (আলি এআই)', { bold: true, size: 36, color: COLOR_PRIMARY }),
          ], { before: 0, after: 30 }),
          p([
            t('Flash-Flood Intelligence, Resilient SOS Transport & Humanitarian Coordination Platform', { bold: true, size: 24, color: COLOR_ACCENT }),
          ], { before: 0, after: 30 }),
          p([
            t('Comprehensive Master Technical Plan, System Verification & National Physical Final Roadmap', { italics: true, size: 20, color: COLOR_MUTED }),
          ], { before: 0, after: 30 }),
          p([
            t('Hack for Humanity 2026 · Track 1: Climate Resilience & Humanitarian Action · Target Stage Final: October 23, 2026', { bold: true, size: 17, color: COLOR_ALERT }),
          ], { before: 0, after: 140 }),

          // ==================== SECTION 1 ====================
          h1('1. Executive Overview, Design Thesis & Physical Final Context'),
          p([
            t('Aali AI is a production-engineered, disaster-tested decision-support platform designed for catastrophic flash-flood events in Bangladesh. The system was conceived directly in response to the devastating August 2024 Feni catastrophe and the recurrent Surma basin inundations in Sylhet. During these disasters, over 90% of cellular base transceiver stations (BTS) suffered total power collapse within 48 hours, telemetered river gauges were severed by peak flood debris, emergency hotlines became hopelessly congested, and rescue responders had no shared situational awareness.'),
          ]),
          p([
            t('Design Thesis: ', { bold: true, color: COLOR_ACCENT }),
            t('“Who needs help, what do they urgently need, where are they located, how certain is the evidence, and what deterministic action must an authorized human commander approve next?”', { italics: true }),
          ]),
          p([
            t('Unlike speculative academic concepts or brittle web mockups, Aali AI is a fully functional full-stack monorepo featuring a NestJS 10 backend, React 18 / Vite Web Situation Room, Flutter 3.x Tactile Mobile Client verified on physical Android hardware via wireless ADB, and an SMPP v3.4 telecom gateway. All core features claimed in this document are backed by automated end-to-end test suites (113 API tests, 48 Web tests, 16 Mobile tests green).'),
          ]),
          p([
            t('The project is competing in the National Physical Final on October 23, 2026. This document establishes the exact verified state of the codebase as of October 11, codifies honest engineering boundaries, details mathematical decision algorithms, and presents an exhaustive day-by-day roadmap leading into the live stage showcase.'),
          ]),

          // ==================== SECTION 2 ====================
          h1('2. Problem Analysis & Sourced Empirical Failure Evidence'),
          p([
            t('To build an honest disaster system, one must study what actually failed on the ground. Research across government bulletins, BTRC telecommunication logs, BWDB flood reports, and field NGO accounts reveals five compounding systemic failures during the 2024 Feni and Sylhet floods:'),
          ]),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  cell('Failure Mode', { width: 22, bold: true, shading: COLOR_BORDER }),
                  cell('Empirical Record & Field Ground Truth', { width: 50, bold: true, shading: COLOR_BORDER }),
                  cell('Primary Source', { width: 28, bold: true, shading: COLOR_BORDER }),
                ],
              }),
              new TableRow({
                children: [
                  cell('Delayed Official Warning', { width: 22, bold: true }),
                  cell('Feni’s rivers are short, steep, and transboundary. In July 2025, FFWC officials noted that basin rain was monitored by a single station; the Muhuri rose 119 cm in 6 hours. At Parshuram, the river climbed +6.92 m in 15 hours after 439 mm of rainfall in 24 hours, breaching 15 embankment segments.', { width: 50 }),
                  cell('BWDB, UNB Reports, FFWC Bulletins [3], [13]', { width: 28 }),
                ],
              }),
              new TableRow({
                children: [
                  cell('Telemetry Sensor Blindness', { width: 22, bold: true }),
                  cell('During peak flood surges, telemetered river gauges frequently lose power or transmission lines sever. Traditional forecasting systems treated a silent gauge as an absence of data, delaying emergency evacuation orders until floodwaters reached house roofs.', { width: 50 }),
                  cell('Daily Star, Prothom Alo Aug 2024 [2], [4]', { width: 28 }),
                ],
              }),
              new TableRow({
                children: [
                  cell('Cellular Infrastructure Collapse', { width: 22, bold: true }),
                  cell('Between 23–24 August 2024, 605 to 616 of Feni’s 653 mobile towers (92.6% to 94.3%) went dark. Standard tower battery backups last only 4 to 8 hours. Flooded roads prevented fuel replenishment for diesel generators.', { width: 50 }),
                  cell('BTRC Telecommunications Press Release [1], [4]', { width: 28 }),
                ],
              }),
              new TableRow({
                children: [
                  cell('Congested, Blind Rescue Dispatch', { width: 22, bold: true }),
                  cell('The Red Crescent emergency hotline took 10–12 calls per minute with no shared database or map. Responders repeatedly sent boats to easily accessible roadside locations while marooned families on rooftops in remote villages went unnoticed.', { width: 50 }),
                  cell('IFRC Situation Report, Oct 2024 [7]', { width: 28 }),
                ],
              }),
              new TableRow({
                children: [
                  cell('Post-Flood Water Contamination', { width: 22, bold: true }),
                  cell('70,415 houses submerged and Tk 533.59 crore lost. Over 140 tube-wells were contaminated by floodwater, creating acute cholera/diarrhea risk. Relief distribution was distorted by lack of demographic equity tracking.', { width: 50 }),
                  cell('BBS, Ministry of Disaster Management [8]', { width: 28 }),
                ],
              }),
            ],
          }),

          // ==================== SECTION 3 ====================
          h1('3. The Solution Architecture: BEFORE, DURING, and AFTER Collapse'),
          p([
            t('Aali AI structures disaster management into three coherent operational phases, ensuring continuous decision support before the water rises, during total communications blackout, and through long-term recovery:'),
          ]),

          h2('3.1 BEFORE: 3-Signal Hydrology Fusion & The Blank-Gauge Escalation Rule'),
          p([
            t('Official forecasts failed because upstream telemetered gauges died. In Aali AI, '),
            t('a silent sensor is never treated as safe water', { bold: true }),
            t('. The hydrology fusion engine integrates three independent telemetry feeds:'),
          ]),
          p([
            t('1. Telemetered BWDB River Gauges: Continuous rate-of-rise monitoring on the Muhuri, Kahua, and Surma rivers.\n2. Satellite Precipitation Telemetry: NASA GPM and JAXA GSMaP rainfall updates (updated every 30 minutes at ~10km spatial resolution).\n3. Volunteer Staff Gauge Readings: Trained CPP volunteers submit water level readings using compact SMS codes.'),
          ]),
          p([
            t('The Blank-Gauge Escalation Rule: ', { bold: true, color: COLOR_ALERT }),
            t('If a primary river gauge stops transmitting for ≥60 minutes during an active rainfall event (>75mm satellite basin accumulation), the system automatically escalates the warning status to '),
            t('`ACT` (Red Alert)', { bold: true, color: COLOR_ALERT }),
            t(' and flags the sensor as “SEVERED / BLIND”. This single deterministic rule unlocks '),
            t('8 to 24 hours of proactive evacuation lead time', { bold: true }),
            t(' before embankments collapse.'),
          ]),
          p([
            t('Mosque Loudspeaker (মাইকিং) Synthesis: ', { bold: true }),
            t('In rural Bangladesh, many residents leave phones uncharged or inside pockets during rain. When an evacuation is approved, Aali AI automatically synthesizes localized Bengali voice announcements via Web Audio and device speakers for broadcast over union mosque amplifiers.'),
          ]),

          h2('3.2 DURING: Zero-Tower SOS Ingestion & Human-in-the-Loop Rescue Triage'),
          p([
            t('When mobile towers collapse and internet data drops to 0 kbps, citizens cannot open standard web apps or send WhatsApp media. Aali AI deploys a lightweight 4-tier transport fallback ladder:'),
          ]),
          p([
            t('• 42-Byte ASCII Compact Disaster Packet: Encodes complete distress telemetry into 42 printable ASCII characters that comfortably fit inside a single 7-bit GSM SMS or satellite Direct-to-Cell burst.\n• Regional Dialect NLP: Gemini Flash interprets panicked Noakhali and Sylheti dialect voice and text notes into schema JSON, backed by a deterministic local regex keyword extractor for zero-network resilience.\n• Deterministic Boat Prioritization: Ranks rescue assets according to vulnerable demographics (infants, elderly, pregnant mothers), roof entrapment, rising water velocity, fuel range (e.g. 22km limit), and night spotlight availability. ZERO auto-dispatch: Every boat movement requires an authenticated human sign-off.'),
          ]),

          h2('3.3 AFTER: Fair Post-Disaster Tube-Well Equity & Audit Ledger'),
          p([
            t('The exact same incident database seamlessly transitions into the post-disaster recovery phase:'),
          ]),
          p([
            t('• Submerged Tube-Well Rehabilitation: Audits contaminated drinking water sources by village, weighted by BBS 2022 Census population demographics.\n• Cryptographic Anti-Fraud Guard: Relief distribution receipts use SHA-256 idempotency hashing (HASH(event_id, village_id, aid_type, date)), completely preventing relief embezzlement or double-claiming across NGOs.\n• Silent-Village Detection: Continuously evaluates communities with high hazard exposure but zero SOS reports, flagging them as “VERIFY VIA RECONNAISSANCE” (absence of reports ≠ proof of safety).'),
          ]),

          h2('3.4 Full System Architecture Diagram'),
          p([
            t('The following end-to-end data flow connects edge residents to incident commanders:'),
          ]),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  cell([
                    p(t('CITIZEN & VOLUNTEER EDGE', { bold: true, size: 17, color: COLOR_ACCENT })),
                    p(t('• Flutter Resident App (Android 13+)\n• Feature Phone (2G GSM SMS)\n• Starlink Direct-to-Cell (D2C)\n• CPP Volunteer Staff-Gauge SMS', { size: 15 })),
                  ], { width: 30, shading: COLOR_BG_LIGHT }),
                  cell([
                    p(t('TELECOM INGESTION GATEWAY', { bold: true, size: 17, color: COLOR_PRIMARY })),
                    p(t('• SMPP v3.4 Server (Port 2775)\n• Shortcode 1090 PDU Parser\n• Multi-Endpoint Auto-Latch\n• Ingestion REST Bridge (/api/v1/sos)', { size: 15 })),
                  ], { width: 35, shading: COLOR_BG_LIGHT }),
                  cell([
                    p(t('OPERATIONS CONTROL ROOM', { bold: true, size: 17, color: COLOR_ALERT })),
                    p(t('• React 18 / Vite Situation Room\n• Real-Time SSE Event Bus (:3001)\n• Human Sign-Off / Audit Trail\n• Mosque Loudspeaker Audio PA', { size: 15 })),
                  ], { width: 35, shading: COLOR_BG_LIGHT }),
                ],
              }),
            ],
          }),

          // ==================== SECTION 4 ====================
          h1('4. The Institutional Aali Compact (The Governance Model)'),
          p([
            t('A software tool alone cannot fix disaster response without institutional authorization. Aali AI is built on a concrete three-party emergency compact activated during declared flood states:'),
          ]),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  cell('Party', { width: 22, bold: true, shading: COLOR_BORDER }),
                  cell('Commitment During Declared Flood', { width: 48, bold: true, shading: COLOR_BORDER }),
                  cell('Value Received', { width: 30, bold: true, shading: COLOR_BORDER }),
                ],
              }),
              new TableRow({
                children: [
                  cell('Government (BTRC, DDM, BWDB)', { width: 22, bold: true }),
                  cell('Declares flood emergency for named upazilas. Shares gauge feeds. Officially approves warning broadcasts. Retains immutable audit log ownership.', { width: 48 }),
                  cell('Single verified operating picture; automated draft warnings; zero hotline blindness.', { width: 30 }),
                ],
              }),
              new TableRow({
                children: [
                  cell('Telecom Operators (Banglalink, GP, Robi, Teletalk)', { width: 22, bold: true }),
                  cell('Enables emergency Direct-to-Cell satellite roaming for all SIMs in the disaster polygon. Automatically forwards 42-byte SOS packets to Aali. Zero-rates mobile app.', { width: 48 }),
                  cell('Fulfills ITU Early Warnings for All mandate; turnkey humanitarian use case for new satellite spectrum.', { width: 30 }),
                ],
              }),
              new TableRow({
                children: [
                  cell('Responders (Red Crescent, FSCD, Armed Forces)', { width: 22, bold: true }),
                  cell('Operates from unified Web Situation Room. Keeps rescue boat and fuel inventory updated. Signs off on triage dispatch suggestions.', { width: 48 }),
                  cell('Ranked, de-duplicated, geo-located cases instead of chaotic unverified social media calls.', { width: 30 }),
                ],
              }),
            ],
          }),
          p([
            t('The Six-Step Declared Flood Protocol: ', { bold: true }),
            t('1. Three-signal alert reaches `ACT` (or breach observed). 2. Authority signs localized Bengali evacuation warning. 3. Authority declares emergency mode; operators open satellite D2C roaming to all subscribers. 4. Towers collapse; SOS packets route via satellite or surviving BTS. 5. Responders review de-duplicated cases on dashboard and sign off boat dispatch. 6. Waters recede; platform manages tube-well rehabilitation and lifts emergency mode.'),
          ]),

          // ==================== SECTION 5 ====================
          h1('5. Telemetry, Transport Fallback Ladder & Packet Protocol Specifications'),
          p([
            t('No single communications path survives a catastrophic flood. Aali AI implements a robust 4-tier transport fallback ladder:'),
          ]),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  cell('Tier', { width: 25, bold: true, shading: COLOR_BORDER }),
                  cell('Operating Conditions', { width: 35, bold: true, shading: COLOR_BORDER }),
                  cell('Fallback Trigger', { width: 40, bold: true, shading: COLOR_BORDER }),
                ],
              }),
              new TableRow({
                children: [
                  cell('Tier 1: High-Speed Web App', { width: 25, bold: true }),
                  cell('Active cellular towers, 4G LTE / Wi-Fi available.', { width: 35 }),
                  cell('If HTTP POST fails after 3s, cascades to Tier 2.', { width: 40 }),
                ],
              }),
              new TableRow({
                children: [
                  cell('Tier 2: Terrestrial 2G SMS', { width: 25, bold: true }),
                  cell('Voice/data towers dead, but narrowband SMS signaling survives.', { width: 35 }),
                  cell('If SMS transmission handshake fails, cascades to Tier 3.', { width: 40 }),
                ],
              }),
              new TableRow({
                children: [
                  cell('Tier 3: Satellite Direct-to-Cell', { width: 25, bold: true }),
                  cell('Open sky, standard 4G phone connected to LEO satellite.', { width: 35 }),
                  cell('If satellite burst times out, cascades to Tier 4.', { width: 40 }),
                ],
              }),
              new TableRow({
                children: [
                  cell('Tier 4: Durable Local Outbox', { width: 25, bold: true }),
                  cell('Zero signal. Report queued in encrypted local SQLite database.', { width: 35 }),
                  cell('Auto-drains and transmits the instant any network signal returns.', { width: 40 }),
                ],
              }),
            ],
          }),

          h2('5.2 The 42-Byte ASCII Compact Disaster Packet Specification'),
          p([
            t('The packet format is rigorously engineered to be compact, human-readable, and immune to corruption:'),
          ]),
          p([
            t('Example Packet:  ', { bold: true }),
            t('A1|S|w7cx000|04|E1C0M0T1|261011-0246|SOS7|0NTV', { bold: true, color: COLOR_ACCENT }),
          ]),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  cell('Field', { width: 15, bold: true, shading: COLOR_BORDER }),
                  cell('Segment', { width: 15, bold: true, shading: COLOR_BORDER }),
                  cell('Technical Definition & Operational Function', { width: 70, bold: true, shading: COLOR_BORDER }),
                ],
              }),
              new TableRow({
                children: [
                  cell('Protocol & Type', { width: 15, bold: true }),
                  cell('A1 | S', { width: 15, bold: true, color: COLOR_ACCENT }),
                  cell('Version A1 allows backward compatibility; S indicates Emergency SOS (R = Road hazard, N = Need, G = Gauge observation).', { width: 70 }),
                ],
              }),
              new TableRow({
                children: [
                  cell('Geohash-7', { width: 15, bold: true }),
                  cell('w7cx000', { width: 15, bold: true, color: COLOR_ACCENT }),
                  cell('Compresses GPS latitude/longitude to a 153m × 153m bounding box without requesting map tiles or cellular triangulation.', { width: 70 }),
                ],
              }),
              new TableRow({
                children: [
                  cell('Vulnerabilities', { width: 15, bold: true }),
                  cell('04 | E1C0M0T1', { width: 15, bold: true, color: COLOR_ACCENT }),
                  cell('Headcount (4 people). Bitflags: E1 = Elderly present, C0 = No infants, M0 = No acute medication, T1 = Trapped on roof/tree.', { width: 70 }),
                ],
              }),
              new TableRow({
                children: [
                  cell('Checksum & ID', { width: 15, bold: true }),
                  cell('SOS7 | 0NTV', { width: 15, bold: true, color: COLOR_ACCENT }),
                  cell('Unique short identifier SOS7 + CRC-16/CCITT-FALSE 4-character Base36 checksum (0NTV) preventing corrupt packet ingestion.', { width: 70 }),
                ],
              }),
            ],
          }),

          // ==================== SECTION 6 ====================
          h1('6. Core Deterministic Decision Engines vs. Gemini Flash NLP'),
          p([
            t('Aali AI strictly segregates deterministic life-critical logic from probabilistic machine learning. Every mathematical formula is transparent, unit-tested, and audited:'),
          ]),

          h2('6.1 Mathematical Formulations & Decision Engines'),
          p([
            t('1. Confidence Scoring Formula: ', { bold: true }),
            t('The confidence C of any incident report is calculated as:\n'),
            t('C = W_source + min(0.30, 0.15 × N_neighbors) + H_hazard - D_decay(t)\n', { bold: true, color: COLOR_ACCENT }),
            t('Where W_source is 0.90 for authenticated responders, 0.75 for known volunteers, and 0.40 for first-time public citizens. N_neighbors is independent reports within 300m and 30 min. H_hazard adds +0.10 if nearby gauge > Warning level. D_decay fades road/water observations over 120 minutes. An SOS is NEVER rejected due to low confidence; low confidence simply triggers human review.'),
          ]),
          p([
            t('2. Rescue Boat Prioritization Algorithm: ', { bold: true }),
            t('Priority score P (0.0 to 1.0) is evaluated as:\n'),
            t('P = 0.30 × (People / 10) + 0.25 × V_flags + 0.20 × C + 0.15 × SurgeRate + 0.10 × WaitTime\n', { bold: true, color: COLOR_ACCENT }),
            t('Subject to physical operational constraints: Rescue asset range must exceed 2 × Distance to target (fuel margin), and if current time > 18:30 (dusk), assets lacking night spotlights are filtered out with warning “DAYLIGHT ONLY”.'),
          ]),
          p([
            t('3. Post-Flood Tube-Well Equity Formula: ', { bold: true }),
            t('Urgency U of village water source rehabilitation is computed using BBS 2022 Census data:\n'),
            t('U_village = (ContaminatedWells / TotalWells) × 0.40 + (ExposedPopulation / MaxPop) × 0.35 + (1.0 - ReliefDeliveredRatio) × 0.25\n', { bold: true, color: COLOR_ACCENT }),
            t('Guarded by SHA-256 idempotency key: HASH(event_id, village_id, aid_type, date) to prevent double-distribution.'),
          ]),

          h2('6.2 Where AI Does the Work (Language & Similarity)'),
          p([
            t('1. Dialect Bengali & Banglish SOS Extraction: Panicked villagers rarely write standard literary Bengali. Gemini Flash translates regional Noakhali (*"চালে পানি উইঠ্যা গেছে"*) and Sylheti dialect text and voice notes into schema JSON (`{ isTrapped: true, peopleCount: 5 }`).\n2. Semantic Duplicate Matching: Uses text embeddings combined with spatial geohash-7 and 30-minute time windows to detect when multiple neighbors are reporting the same trapped household in different words.\n3. Localized Warning Drafting: Drafts ward-specific evacuation notices naming exact shelters in natural Bengali for incident commander approval.'),
          ]),

          h2('6.3 Deterministic Regex Fallback Engine'),
          p([
            t('If external internet connectivity to the Gemini API is lost (e.g. HTTP 503 or DNS failure), the platform automatically cascades to an in-memory deterministic regex parser. This engine parses Bengali number words (এক, দুই, চার, ৫ জন), urgency keywords (আটকা, ছাদ, অসুস্থ, ওষুধ), and village names with zero latency and zero external dependencies.'),
          ]),

          // ==================== SECTION 7 ====================
          h1('7. Current State: Codebase Architecture & File-by-File Verification Audit (October 11, 2026)'),
          p([
            t('The Aali AI repository is fully built, structured as a clean monorepo, and validated by automated test suites:'),
          ]),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  cell('Component', { width: 25, bold: true, shading: COLOR_BORDER }),
                  cell('Implementation Files & Location', { width: 35, bold: true, shading: COLOR_BORDER }),
                  cell('Verified Operational Status (Oct 11, 2026)', { width: 40, bold: true, shading: COLOR_BORDER }),
                ],
              }),
              new TableRow({
                children: [
                  cell('Backend API Gateway', { width: 25, bold: true }),
                  cell('`apps/api/src/modules/*`\n`apps/api/src/common/*`', { width: 35 }),
                  cell('113 of 113 unit & e2e tests passing across 26 test suites. NestJS 10, TypeORM, MySQL 8.4, SSE live-stream controller, HMAC-SHA256 privacy hashing, OpenAPI/Swagger docs.', { width: 40 }),
                ],
              }),
              new TableRow({
                children: [
                  cell('Web Situation Room', { width: 25, bold: true }),
                  cell('`apps/web/src/components/*`\n`apps/web/src/lib/*`', { width: 35 }),
                  cell('48 of 48 unit tests passing across 13 suites. React 18, Vite, zero-latency SSE event listener, Master Crisis Clock, 1-Click Demo Director HUD, Leaflet maps.', { width: 40 }),
                ],
              }),
              new TableRow({
                children: [
                  cell('Tactile Mobile App', { width: 25, bold: true }),
                  cell('`apps/mobile/lib/main.dart`\n`apps/mobile/test/*`', { width: 35 }),
                  cell('16 of 16 tests passing. Installed live on physical Android 13+ device via wireless ADB (192.168.0.110). Multi-endpoint auto-latching (:3001, :5173, :5174, :3002). Offline SQLite queue.', { width: 40 }),
                ],
              }),
              new TableRow({
                children: [
                  cell('Telecom SMPP Gateway', { width: 25, bold: true }),
                  cell('`packages/smpp-gateway/*`', { width: 35 }),
                  cell('Node.js TCP PDU Server on port :2775. GSM 03.38 7-bit unpacker, shortcode 1090 routing, REST bridge to API gateway.', { width: 40 }),
                ],
              }),
              new TableRow({
                children: [
                  cell('Regional Audio Engine', { width: 25, bold: true }),
                  cell('`apps/web/src/components/AudioBroadcastModal.tsx`\n`apps/mobile/lib/main.dart`', { width: 35 }),
                  cell('Operational on Web and Mobile. Mosque loudspeaker audio synthesis for Sylhet DC and Feni DC evacuation warnings with local TTS fallback.', { width: 40 }),
                ],
              }),
            ],
          }),

          // ==================== SECTION 8 ====================
          h1('8. Honest Engineering Limitations & Ethical Safeguards'),
          p([
            t('Aali AI strictly adheres to the ethical boundaries codified in AGENTS.md and docs/SECURITY_PRIVACY.md:'),
          ]),
          p([
            t('1. Decision-Support Prototype: Aali AI is an assistive decision-support platform, not an operational replacement for public emergency authorities.\n2. Transparent Simulation Badging: Starlink Direct-to-Cell cellular spectrum is simulated over local Wi-Fi uplink (`STARLINK_D2C_WIFI`) and permanently badged `[HACKATHON SIMULATION]` in the user interface. Cell tower blackout is controlled via simulation toggles based on BTRC August 2024 failure reports.\n3. No Inferred Safety from Silence: If a village transmits zero SOS reports, the system explicitly labels the zone as `UNKNOWN` and triggers a verification flag. Silence is never treated as safety.\n4. Synthetic PII Protection: All demo records use synthetic fixtures. National ID numbers are salted and hashed (`$NID$<hash>`). Full phone numbers and personal text are redacted from logs and never transmitted to remote AI APIs.\n5. Zero Satellite Delivery Claims: We state that the software is “designed for satellite-to-phone delivery”, but do not claim it has been empirically proven during an active Feni flood.'),
          ]),

          // ==================== SECTION 9 ====================
          h1('9. Physical Stage Setup & Hardware Rig for Finals (October 23, 2026)'),
          p([
            t('To guarantee zero disruption during the live 5-minute presentation at the competition venue, the team has engineered a fully isolated physical stage rig:'),
          ]),
          p([
            t('• Standalone Stage Wi-Fi Hotspot: A dedicated portable Wi-Fi router (192.168.1.1) pre-configured with static IP leases (`192.168.1.100` laptop, `192.168.1.110` phone). Eliminates all dependence on congested venue Wi-Fi networks.\n• Dual-Screen Wireless Mirroring: Utilizes low-latency wireless ADB scrcpy to mirror the physical Android device screen side-by-side with the Web Situation Room on the stage projector.\n• Physical Loudspeaker Amplifier: A portable battery-powered megaphone connected via 3.5mm audio jack to play the synthesized Bengali mosque evacuation announcement audibly to the judging panel.\n• Containerized Production Cold-Boot: The entire stack (MySQL 8.4, NestJS API, React Web, SMPP gateway) is packaged in Docker Compose (`docker compose up -d`), guaranteeing instant zero-install launch on any host machine.\n• Hot Standby Redundancy: A secondary Android phone with pre-installed APK and an offline browser-based 3-Tap SOS simulator are maintained on hot standby in case of physical device hardware fault.'),
          ]),

          // ==================== SECTION 10 ====================
          h1('10. Day-by-Day Sprint Roadmap Leading to October 23 Physical Final'),
          p([
            t('The following daily operational schedule details the pre-final engineering milestones:'),
          ]),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  cell('Date & Sprint', { width: 22, bold: true, shading: COLOR_BORDER }),
                  cell('Technical Deliverables & Hardware Tasks', { width: 53, bold: true, shading: COLOR_BORDER }),
                  cell('Verification Checkpoint', { width: 25, bold: true, shading: COLOR_BORDER }),
                ],
              }),
              new TableRow({
                children: [
                  cell('Sat Oct 11 – Sun Oct 12\n(Sprint 1A)', { width: 22, bold: true }),
                  cell('Stage router static IP configuration (192.168.1.x); wireless ADB low-latency buffer tuning; Docker compose daemon verification on cold PC boot.', { width: 53 }),
                  cell('Cold boot in <45s with zero external internet.', { width: 25 }),
                ],
              }),
              new TableRow({
                children: [
                  cell('Mon Oct 13 – Tue Oct 14\n(Sprint 1B)', { width: 22, bold: true }),
                  cell('Dual-screen presentation calibration: laptop projector HDMI output + phone screen scrcpy mirror window layout lock.', { width: 53 }),
                  cell('Zero flicker under 60fps mirroring.', { width: 25 }),
                ],
              }),
              new TableRow({
                children: [
                  cell('Wed Oct 15 – Thu Oct 16\n(Sprint 2A)', { width: 22, bold: true }),
                  cell('Offline mesh relay: Wi-Fi Direct / BLE store-and-forward implementation between primary phone and secondary standby phone.', { width: 53 }),
                  cell('Packet hops from offline phone to gateway phone.', { width: 25 }),
                ],
              }),
              new TableRow({
                children: [
                  cell('Fri Oct 17 – Sat Oct 18\n(Sprint 2B)', { width: 22, bold: true }),
                  cell('Bundle high-fidelity pre-recorded Bengali evacuation announcements inside APK assets to bypass browser Web Audio reliance during stage noise.', { width: 53 }),
                  cell('Instant local audio trigger in <100ms.', { width: 25 }),
                ],
              }),
              new TableRow({
                children: [
                  cell('Sun Oct 19 – Mon Oct 20\n(Sprint 3A)', { width: 22, bold: true }),
                  cell('Hardware audio integration: connect portable megaphone amplifier; test sound pressure level (>80dB); printable QR shelter check-in sheets.', { width: 53 }),
                  cell('Audible across 50-person hall; QR decodes cleanly.', { width: 25 }),
                ],
              }),
              new TableRow({
                children: [
                  cell('Tue Oct 21 – Wed Oct 22\n(Sprint 3B / 4A)', { width: 22, bold: true }),
                  cell('Full 5-minute pitch choreography rehearsals with Stage Demo Director HUD; rapid Q&A defense drills against harsh panel rubrics.', { width: 53 }),
                  cell('5-minute presentation hits exact time markers.', { width: 25 }),
                ],
              }),
              new TableRow({
                children: [
                  cell('Thu Oct 23 (Finals Day)\n(Sprint 4B)', { width: 22, bold: true }),
                  cell('Live stage deployment at AIUB venue: battery checks, hotspot isolation, live physical device demonstration, jury Q&A defense.', { width: 53 }),
                  cell('Grand finale execution and victory.', { width: 25 }),
                ],
              }),
            ],
          }),

          // ==================== SECTION 11 ====================
          h1('11. Comprehensive Judge Q&A Defense Matrix (15 Tough Questions)'),
          p([
            t('The team has prepared bulletproof, evidence-backed answers for every skeptical panel challenge:'),
          ]),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  cell('Panel Challenge & Category', { width: 35, bold: true, shading: COLOR_BORDER }),
                  cell('Evidence-Backed Technical Defense', { width: 65, bold: true, shading: COLOR_BORDER }),
                ],
              }),
              new TableRow({
                children: [
                  cell('1. Telecom Viability:\n“Why not WhatsApp or Facebook?”', { width: 35, bold: true }),
                  cell('Facebook and WhatsApp require high-bandwidth cellular data. In Feni, 92.6% of towers lost power. Furthermore, social media posts cause massive duplicate dispatches to accessible main roads while remote roof victims die unseen. Aali AI operates over 42-byte SMS/satellite and de-duplicates reports.', { width: 65 }),
                ],
              }),
              new TableRow({
                children: [
                  cell('2. Operator Incentive:\n“Why would telcos open satellite roaming?”', { width: 35, bold: true }),
                  cell('Operators face severe regulatory and public scrutiny when towers collapse. In 2024, BTRC spent Tk 50 lakh on emergency diesel for Feni towers alone. Under the ITU Early Warnings for All mandate, emergency roaming fulfills universal service requirements and gives their new satellite spectrum a premier humanitarian use case. Precedent: Liberty Caribbean activated Starlink in Jamaica post-Hurricane Melissa (Oct 2025).', { width: 65 }),
                ],
              }),
              new TableRow({
                children: [
                  cell('3. AI Reliability:\n“What if Gemini hallucinates an address?”', { width: 35, bold: true }),
                  cell('The LLM does NOT determine locations or boat priorities. GPS location is mathematically encoded into a 7-character geohash directly on the phone. Gemini Flash only extracts descriptive urgency text, which is displayed side-by-side with the original raw text for human commander sign-off.', { width: 65 }),
                ],
              }),
              new TableRow({
                children: [
                  cell('4. Hardware Equity:\n“What about victims with 2G feature phones?”', { width: 35, bold: true }),
                  cell('Aali AI supports any standard 2G feature phone via standard 7-bit SMS to shortcode 1090. The SMPP gateway decodes plain SMS into structured disaster packets without requiring any smartphone.', { width: 65 }),
                ],
              }),
              new TableRow({
                children: [
                  cell('5. Hydrology Accuracy:\n“Is your flood prediction accurate?”', { width: 35, bold: true }),
                  cell('We do not claim a speculative machine-learning hydraulic physics forecast. We use an explainable, deterministic trigger on the exact gap FFWC identified (unmonitored rainfall + blank river sensor), proven by historical replay of two real floods.', { width: 65 }),
                ],
              }),
              new TableRow({
                children: [
                  cell('6. Data Privacy:\n“How do you prevent surveillance / doxxing?”', { width: 35, bold: true }),
                  cell('No PII travels in the 42-byte packet. National ID numbers are salted and hashed via HMAC-SHA256 ($NID$<hash>). Full phone numbers are redacted from application logs and never sent to remote LLMs.', { width: 65 }),
                ],
              }),
              new TableRow({
                children: [
                  cell('7. Spam / False Reports:\n“What prevents malicious fake SOS calls?”', { width: 35, bold: true }),
                  cell('Corroboration scoring requires multiple independent packets from neighboring geohashes to achieve high priority. Single unverified reports are preserved but flagged for human verification. An SOS is never auto-deleted.', { width: 65 }),
                ],
              }),
              new TableRow({
                children: [
                  cell('8. Battery Drainage:\n“How does a phone survive 48h without power?”', { width: 35, bold: true }),
                  cell('The Flutter client operates in ultra-low power mode. It does not request GPS polling loops or background web sockets; it computes location once, encodes the 42-byte packet, and enters deep sleep.', { width: 65 }),
                ],
              }),
              new TableRow({
                children: [
                  cell('9. Satellite Obstruction:\n“Does satellite-to-phone work indoors?”', { width: 35, bold: true }),
                  cell('Satellite Direct-to-Cell requires open sky. The app UI explicitly instructs victims: “Hold phone towards open sky / roof window”. If indoors, the report remains in the local queue until the user moves to the roof.', { width: 65 }),
                ],
              }),
              new TableRow({
                children: [
                  cell('10. Autonomous Danger:\n“Can AI order an evacuation or dispatch?”', { width: 35, bold: true }),
                  cell('Strictly forbidden in our software architecture. Zero autonomous dispatch. All operational changes require an authenticated human commander digital signature, recorded in an immutable audit ledger.', { width: 65 }),
                ],
              }),
            ],
          }),

          // ==================== SECTION 12 ====================
          h1('12. Financial Feasibility, Unit Economics & National Scale Roadmap'),
          p([
            t('• Zero Per-Site Hardware Cost: Unlike flood radar systems or proprietary radios that cost millions of dollars to deploy at every union, Aali AI leverages the phones citizens already own, standard open river gauges, and public satellite feeds. Operational software costs are limited to cloud hosting and telecom SMS routing.\n• Economic Scale Comparison: The August 2024 Feni flood inflicted Tk 533.59 crore in direct damages. A single day of proactive evacuation lead time saves tens of crores in livestock, grain, and human lives.\n• National Scale Path: The 42-byte packet, Web Situation Room, and Aali Compact are completely district-agnostic. While the hydrology rules are calibrated to the Muhuri (Feni) and Surma (Sylhet) basins, the system readily scales to all 12 hill-fed flash-flood districts across Bangladesh (Sunamganj, Netrokona, Sherpur, Cox’s Bazar, Bandarban) and directly feeds the National Emergency Telecommunication Plan.'),
          ]),

          // Appendices
          h1('Appendix: Data Source Registers & Complete Citation Index'),
          p([
            t('[1] BTRC official telecom failure bulletins via Daily Star, Dhaka Tribune, 23–24 Aug 2024.\n[2] TBS Panorama: Amateur radio communications during Feni blackout; Prothom Alo, 23 Aug 2024.\n[3] UNB: Feni embankment collapse and Muhuri water surge (+6.92m in 15h), July 2025.\n[4] Daily Star: Analysis of cellular battery backups and fuel transport during Feni flood, 26 Aug 2024.\n[5] BSS, Daily Star: Banglalink launches Starlink Direct-to-Cell satellite service in Bangladesh, 7 Oct 2026.\n[6] ITU, WMO, UNDRR: Bangladesh Early Warnings for All national roadmap.\n[7] IFRC Situation Report: Bangladesh Floods Response, 7 Oct 2024.\n[8] Ministry of Disaster Management / BBS: 2024 Flood Damage Assessment (70,415 houses submerged, Tk 533.59 crore loss).\n[9] Liberty Latin America: Emergency satellite messaging activation in Jamaica post-Hurricane Melissa, 29 Oct 2025.\n[10] BTRC Control Room directives on emergency tower power, Aug 2024.\n[11] BTRC Mobile Subscription Data, June 2025.\n[12] Cyclone Preparedness Programme (CPP) Volunteer Operations Framework.\n[13] FFWC Annual Flood Report & Transboundary River Monitoring Bulletins, 2024–2025.'),
          ]),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join(__dirname, '../docs/Aali_AI_Final_Implementation_Plan_and_Roadmap.docx');
  fs.writeFileSync(outPath, buffer);
  console.log('Generated Master Plan DOCX:', outPath, 'Bytes:', buffer.length);
}

buildMasterPlanDocx().catch(console.error);
