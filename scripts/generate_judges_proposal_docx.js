const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, PageBreak } = require('docx');
const fs = require('fs');
const path = require('path');

// Typography & Palette
const COLOR_PRIMARY = '0F172A';  // Slate 900
const COLOR_ACCENT = 'B91C1C';   // Deep Red 700
const COLOR_BLUE = '1D4ED8';     // Blue 700
const COLOR_MUTED = '475569';    // Slate 600
const COLOR_BG_LIGHT = 'F8FAFC'; // Slate 50
const COLOR_BORDER = 'CBD5E1';   // Slate 300
const COLOR_CARD_BORDER = '94A3B8';

function text(t, opts = {}) {
  return new TextRun({
    text: t,
    font: 'Calibri',
    size: opts.size ?? 19, // 9.5pt
    color: opts.color ?? COLOR_PRIMARY,
    bold: opts.bold ?? false,
    italics: opts.italics ?? false,
  });
}

function p(children, opts = {}) {
  return new Paragraph({
    spacing: { before: opts.before ?? 40, after: opts.after ?? 40, line: opts.line ?? 240 },
    alignment: opts.alignment ?? AlignmentType.LEFT,
    children: Array.isArray(children) ? children : [children],
  });
}

function sectionHeader(title) {
  return new Paragraph({
    spacing: { before: 90, after: 30 },
    children: [
      new TextRun({ text: title.toUpperCase(), bold: true, size: 21, color: COLOR_ACCENT, font: 'Calibri' }),
    ],
  });
}

function cell(content, opts = {}) {
  const children = Array.isArray(content) ? content : [p(content, { before: 20, after: 20 })];
  return new TableCell({
    width: { size: opts.width ?? 50, type: WidthType.PERCENTAGE },
    shading: opts.shading ? { fill: opts.shading } : undefined,
    margins: { top: 50, bottom: 50, left: 80, right: 80 },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: COLOR_BORDER },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: COLOR_BORDER },
      left: { style: BorderStyle.SINGLE, size: 1, color: COLOR_BORDER },
      right: { style: BorderStyle.SINGLE, size: 1, color: COLOR_BORDER },
    },
    children,
  });
}

async function buildProposalDocx() {
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Calibri', size: 19, color: COLOR_PRIMARY },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 500, bottom: 500, left: 600, right: 600 },
          },
        },
        children: [
          // ==================== PAGE 1 ====================
          // Title Banner
          p([
            new TextRun({ text: 'AALI AI (আলি এআই)  ·  Flash-Flood Resilience Platform', bold: true, size: 28, color: COLOR_PRIMARY, font: 'Calibri' }),
          ], { before: 0, after: 20 }),
          p([
            new TextRun({ text: '“When the towers die, the SOS doesn’t.”  ', bold: true, italics: true, size: 21, color: COLOR_ACCENT, font: 'Calibri' }),
            new TextRun({ text: 'Early warning, zero-tower rescue, and fair recovery for Feni & Sylhet in the satellite-to-phone era.', size: 18, color: COLOR_MUTED, font: 'Calibri' }),
          ], { before: 0, after: 60 }),

          // Context & The Composite Scene
          sectionHeader('1. The Ground Reality: One Night in Feni & Sylhet'),
          p([
            text('Rain from the upstream Meghalaya and Tripura hills had fallen relentlessly. On 21 August 2024, the water inundated Parshuram and Fulgazi, filling schools and rooftops with marooned families. Within 48 hours, '),
            text('616 of Feni’s 653 mobile towers (92.6%) collapsed', { bold: true }),
            text(' as backup battery power failed [1]. Telemetered river gauges stopped transmitting as the Muhuri river crested +6.92m above danger level [3]. Responders faced complete blackout; hotlines jammed at 12 calls/min with zero shared visibility [7]. A father held up his phone: zero bars. '),
            text('Now picture that scene with Aali AI: His phone transmits a single 42-byte ASCII distress packet directly to satellite or surviving tower. On the control room map, his report appears instantly—de-duplicated, confidence-scored, and ranked to a rescue boat with night spotlight. Nobody phoned anyone.', { bold: true, color: COLOR_BLUE }),
          ], { before: 10, after: 50 }),

          // Sourced Empirical Evidence Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  cell([p(text('616 / 653 (92.6%)', { bold: true, size: 20, color: COLOR_ACCENT })), p(text('Feni Towers Dead (BTRC) [1]', { size: 15, color: COLOR_MUTED }))], { width: 25, shading: COLOR_BG_LIGHT }),
                  cell([p(text('+6.92 m in 15 Hours', { bold: true, size: 20, color: COLOR_ACCENT })), p(text('Muhuri Rise at Parshuram [3]', { size: 15, color: COLOR_MUTED }))], { width: 25, shading: COLOR_BG_LIGHT }),
                  cell([p(text('42 Bytes', { bold: true, size: 20, color: COLOR_ACCENT })), p(text('ASCII Disaster Packet (1 SMS)', { size: 15, color: COLOR_MUTED }))], { width: 25, shading: COLOR_BG_LIGHT }),
                  cell([p(text('8–24 Hours Lead Time', { bold: true, size: 20, color: COLOR_ACCENT })), p(text('Via Blank-Gauge Rule', { size: 15, color: COLOR_MUTED }))], { width: 25, shading: COLOR_BG_LIGHT }),
                ],
              }),
            ],
          }),

          // The Breakthrough & System Flow Diagram
          sectionHeader('2. System Architecture & The 3-Phase Operational Lifecycle'),
          p([
            text('WHY NOW: On 7 October 2026, Banglalink launched commercial Starlink Direct-to-Cell (D2C) in Bangladesh—enabling any standard 4G phone to reach low-earth satellites with no dish [5]. Aali AI provides the operational decision-support software to turn this breakthrough into life-saving action:'),
          ], { before: 10, after: 40 }),

          // Visual Flow Box Diagram
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  cell([
                    p(text('EDGE SOS CLIENTS', { bold: true, size: 16, color: COLOR_ACCENT }), { before: 0, after: 10 }),
                    p(text('• 3-Tap Resident App\n• 42-Byte SMS (Any 2G SIM)\n• Starlink D2C Satellite Link\n• Offline SQLite Queue Buffer', { size: 15 }), { before: 0, after: 0 }),
                  ], { width: 27, shading: COLOR_BG_LIGHT }),
                  cell([
                    p(text('TELECOM GATEWAY', { bold: true, size: 16, color: COLOR_BLUE }), { before: 0, after: 10 }),
                    p(text('• SMPP v3.4 Shortcode 1090\n• 7-Bit GSM PDU Extraction\n• Multi-Endpoint Auto-Latch\n• Ingestion REST Bridge', { size: 15 }), { before: 0, after: 0 }),
                  ], { width: 26, shading: COLOR_BG_LIGHT }),
                  cell([
                    p(text('DETERMINISTIC CORES & NLP', { bold: true, size: 16, color: COLOR_ACCENT }), { before: 0, after: 10 }),
                    p(text('• Blank-Gauge Rule (60m fail)\n• Gemini Flash Dialect NLP\n• Deterministic Regex Fallback\n• Boat Priority & Fuel Checks', { size: 15 }), { before: 0, after: 0 }),
                  ], { width: 27, shading: COLOR_BG_LIGHT }),
                  cell([
                    p(text('SITUATION ROOM', { bold: true, size: 16, color: COLOR_PRIMARY }), { before: 0, after: 10 }),
                    p(text('• Live SSE Stream Map\n• Mosque Loudspeaker Audio\n• Human Rescue Sign-Off\n• Post-Flood Relief Ledger', { size: 15 }), { before: 0, after: 0 }),
                  ], { width: 20, shading: COLOR_BG_LIGHT }),
                ],
              }),
            ],
          }),

          // 3 Moves: Before, During, After
          sectionHeader('3. The Solution in Three Operational Moves'),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  cell([
                    p(text('BEFORE · SURVIVING A BLANK GAUGE', { bold: true, size: 16, color: COLOR_ACCENT }), { before: 0, after: 20 }),
                    p(text('• 3-Signal Fusion: Combines BWDB Muhuri/Surma gauges, satellite rainfall (JAXA GSMaP / BMD), and volunteer staff readings.\n• Blank-Gauge Rule: When water surges, river sensors often sever. If a gauge goes silent for ≥60 min while rain >75mm, alert auto-escalates to ACT (Red). Silence is never treated as safety.\n• Audio Siren/মাইকিং: Localized Bengali mosque loudspeaker alerts synthesized for uncharged phones.', { size: 15 }), { before: 0, after: 0 }),
                  ], { width: 34, shading: COLOR_BG_LIGHT }),
                  cell([
                    p(text('DURING · RESCUE WITH ZERO TOWERS', { bold: true, size: 16, color: COLOR_BLUE }), { before: 0, after: 20 }),
                    p(text('• 42-Byte ASCII Packet: Distress report compresses into 1 standard SMS or satellite burst.\n• Dialect NLP: Gemini Flash converts Noakhali/Sylheti dialect into schema JSON; deterministic local regex fallback guarantees zero downtime.\n• Human-in-the-Loop Boats: Prioritizes stranded families (elderly, infants, roof entrapment, night spotlight, 22km fuel limit). ZERO auto-dispatch.', { size: 15 }), { before: 0, after: 0 }),
                  ], { width: 33, shading: COLOR_BG_LIGHT }),
                  cell([
                    p(text('AFTER · FAIR RECOVERY & RELIEF', { bold: true, size: 16, color: COLOR_PRIMARY }), { before: 0, after: 20 }),
                    p(text('• Tube-Well Ledger: Tracks submerged drinking water sources (BBS 2022 Census weighted).\n• Cryptographic Anti-Fraud: SHA-256 idempotency key prevents relief embezzlement or double-claiming.\n• Silent-Village Detection: Flags communities with high hazard but zero reports (absence of calls ≠ proof of safety).', { size: 15 }), { before: 0, after: 0 }),
                  ], { width: 33, shading: COLOR_BG_LIGHT }),
                ],
              }),
            ],
          }),

          // PAGE BREAK TO EXACTLY PAGE 2
          p([new PageBreak()]),

          // ==================== PAGE 2 ====================
          // 42-Byte Packet Protocol Deep Dive
          sectionHeader('4. The 42-Byte ASCII Disaster Packet: Precision Engineering'),
          p([
            text('When mobile networks collapse, high-bandwidth data drops to 0 kbps. Aali AI encodes full distress telemetry into an ultra-dense 42-byte ASCII packet that comfortably fits within a single 160-character 7-bit GSM SMS or narrowband satellite frame:'),
          ], { before: 0, after: 30 }),
          p([
            text('Packet String:  ', { bold: true, size: 16 }),
            text('A1|S|w7cx000|04|E1C0M0T1|261011-0246|SOS7|0NTV', { bold: true, size: 17, color: COLOR_BLUE }),
          ], { before: 0, after: 40 }),
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
                  cell('A1 | S', { width: 15, bold: true, color: COLOR_BLUE }),
                  cell('Version A1 allows backward compatibility; S indicates Emergency SOS (R = Road hazard, N = Need, G = Gauge observation).', { width: 70 }),
                ],
              }),
              new TableRow({
                children: [
                  cell('Geohash-7', { width: 15, bold: true }),
                  cell('w7cx000', { width: 15, bold: true, color: COLOR_BLUE }),
                  cell('Compresses GPS latitude/longitude to a 153m × 153m bounding box without requesting map tiles or cellular triangulation.', { width: 70 }),
                ],
              }),
              new TableRow({
                children: [
                  cell('Vulnerabilities', { width: 15, bold: true }),
                  cell('04 | E1C0M0T1', { width: 15, bold: true, color: COLOR_BLUE }),
                  cell('Headcount (4 people). Bitflags: E1 = Elderly present, C0 = No infants, M0 = No acute medication, T1 = Trapped on roof/tree.', { width: 70 }),
                ],
              }),
              new TableRow({
                children: [
                  cell('Checksum & ID', { width: 15, bold: true }),
                  cell('SOS7 | 0NTV', { width: 15, bold: true, color: COLOR_BLUE }),
                  cell('Unique short identifier SOS7 + CRC-16/CCITT-FALSE 4-character Base36 checksum (0NTV) preventing corrupt packet ingestion.', { width: 70 }),
                ],
              }),
            ],
          }),

          // The Aali Compact
          sectionHeader('5. The Institutional Premise: The Aali Emergency Compact'),
          p([
            text('Technology cannot succeed without institutional alignment. Aali AI is premised on a three-party emergency compact activated during declared flood events (mirroring Jamaica’s 2025 Starlink activation during Hurricane Melissa [9]):'),
          ], { before: 0, after: 30 }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  cell('Stakeholder', { width: 22, bold: true, shading: COLOR_BORDER }),
                  cell('Operational Commitment', { width: 45, bold: true, shading: COLOR_BORDER }),
                  cell('Institutional Benefit & Value', { width: 33, bold: true, shading: COLOR_BORDER }),
                ],
              }),
              new TableRow({
                children: [
                  cell('Government (BTRC, DDM, BWDB)', { width: 22, bold: true }),
                  cell('Declares flood emergency for named upazilas; signs official alerts; owns the immutable audit trail.', { width: 45 }),
                  cell('Unified multi-agency situational awareness; zero reliance on blind hotlines.', { width: 33 }),
                ],
              }),
              new TableRow({
                children: [
                  cell('Telecoms (Banglalink, GP, Robi)', { width: 22, bold: true }),
                  cell('Opens satellite D2C emergency roaming to all SIMs; forwards SOS packets to Aali; zero-rates mobile app.', { width: 45 }),
                  cell('Fulfills ITU Early Warnings for All mandate; high-impact humanitarian showcase.', { width: 33 }),
                ],
              }),
              new TableRow({
                children: [
                  cell('Responders (Red Crescent, FSCD)', { width: 22, bold: true }),
                  cell('Operates Web Command Room; manages rescue boat inventory; confirms field rescues and relief.', { width: 45 }),
                  cell('Eliminates dangerous blind dispatch; protects volunteer boat crews.', { width: 33 }),
                ],
              }),
            ],
          }),

          // Ethical AI Boundaries & Deterministic Rules
          sectionHeader('6. Ethical AI Boundaries: What AI Does vs. What Remains Deterministic'),
          p([
            text('• Where AI Does the Work: ', { bold: true, color: COLOR_PRIMARY }),
            text('(1) Reads unstructured dialect Bengali/Banglish SOS text and audio into schema JSON; (2) Semantic text-similarity matching for duplicate reports; (3) Drafts localized evacuation warnings and boat dispatch reasoning.\n'),
            text('• Where AI is Strictly Barred (100% Deterministic Code): ', { bold: true, color: COLOR_ACCENT }),
            text('Flood warning levels (`Watch`/`Warning`/`Act`), confidence scoring (0-100%), boat prioritization math, and relief entitlement are 100% transparent deterministic domain code. An AI hallucination never risks a human life. ZERO auto-dispatch: All operations require an authenticated human signature.'),
          ], { before: 0, after: 40 }),

          // Verified Prototype Evidence & Final Readiness
          sectionHeader('7. Verified Full-Stack Prototype Status & Physical Final Readiness'),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  cell('Subsystem', { width: 25, bold: true, shading: COLOR_BORDER }),
                  cell('Technology Stack & Endpoints', { width: 35, bold: true, shading: COLOR_BORDER }),
                  cell('Verification Status & Hardware Evidence', { width: 40, bold: true, shading: COLOR_BORDER }),
                ],
              }),
              new TableRow({
                children: [
                  cell('Backend API', { width: 25, bold: true }),
                  cell('NestJS 10, TypeORM, MySQL 8.4 (:3001/:3002)', { width: 35 }),
                  cell('113 / 113 Tests Passed (26 suites). SSE stream, strict RBAC, HMAC privacy hashing.', { width: 40 }),
                ],
              }),
              new TableRow({
                children: [
                  cell('Web Situation Room', { width: 25, bold: true }),
                  cell('React 18, Vite, Leaflet, Dark UI (:5173/:5174)', { width: 35 }),
                  cell('48 / 48 Tests Passed (13 suites). 1-Click Demo Director, emergency alert banner.', { width: 40 }),
                ],
              }),
              new TableRow({
                children: [
                  cell('Tactile Mobile App', { width: 25, bold: true }),
                  cell('Flutter 3.x, Material 3, Vector Canvas', { width: 35 }),
                  cell('16 / 16 Tests Passed. Verified on physical Android 13+ device via wireless ADB (192.168.0.110).', { width: 40 }),
                ],
              }),
              new TableRow({
                children: [
                  cell('SMPP Telecom Gateway', { width: 25, bold: true }),
                  cell('Node.js TCP PDU Server (:2775)', { width: 35 }),
                  cell('Shortcode 1090 GSM 03.38 PDU parsing and REST bridge operational.', { width: 40 }),
                ],
              }),
            ],
          }),
          p([
            text('• Honest Simulation Disclosures: ', { bold: true }),
            text('Carrier satellite-to-phone spectrum is simulated via local Wi-Fi uplink (`STARLINK_D2C_WIFI`); cell tower blackout is simulated via control toggles; flood hydrograph is reconstructed from published BWDB/FFWC observations.\n'),
            text('• Physical Final Readiness (October 23, 2026): ', { bold: true }),
            text('The system is completely stage-rehearsed with dual-screen scrcpy mobile mirroring, 1-click Demo Director HUD, portable loudspeaker amp connection, and full multi-district (Feni & Sylhet) support.'),
          ], { before: 20, after: 10 }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join(__dirname, '../docs/Aali_AI_Judges_Proposal_2pg.docx');
  fs.writeFileSync(outPath, buffer);
  console.log('Generated Proposal DOCX:', outPath, 'Bytes:', buffer.length);
}

buildProposalDocx().catch(console.error);
