const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, HeadingLevel, AlignmentType } = require('docx');
const fs = require('fs');
const path = require('path');

// Colors
const COLOR_PRIMARY = '0F172A'; // Slate 900
const COLOR_ACCENT = 'DC2626';  // Red 600
const COLOR_MUTED = '475569';   // Slate 600
const COLOR_BG_LIGHT = 'F8FAFC'; // Slate 50
const COLOR_BORDER = 'CBD5E1';  // Slate 300

function createHeaderParagraph(text, subtext) {
  return new Paragraph({
    spacing: { before: 0, after: 80 },
    children: [
      new TextRun({ text, bold: true, size: 28, color: COLOR_PRIMARY, font: 'Calibri' }),
      new TextRun({ text: '  ·  ' + subtext, bold: false, size: 20, color: COLOR_MUTED, font: 'Calibri' }),
    ],
  });
}

function createSectionHeading(title) {
  return new Paragraph({
    spacing: { before: 120, after: 40 },
    children: [
      new TextRun({ text: title.toUpperCase(), bold: true, size: 18, color: COLOR_ACCENT, font: 'Calibri' }),
    ],
  });
}

function createParagraph(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 20, after: opts.after ?? 40 },
    alignment: opts.alignment ?? AlignmentType.LEFT,
    children: [
      new TextRun({
        text,
        size: opts.size ?? 17,
        color: opts.color ?? COLOR_PRIMARY,
        bold: opts.bold ?? false,
        italics: opts.italics ?? false,
        font: 'Calibri',
      }),
    ],
  });
}

function createTableCell(content, opts = {}) {
  const children = Array.isArray(content) ? content : [
    new Paragraph({
      spacing: { before: 20, after: 20 },
      children: [
        new TextRun({
          text: content,
          size: opts.size ?? 15,
          bold: opts.bold ?? false,
          color: opts.color ?? COLOR_PRIMARY,
          font: 'Calibri',
        }),
      ],
    }),
  ];

  return new TableCell({
    width: { size: opts.width ?? 50, type: WidthType.PERCENTAGE },
    shading: opts.shading ? { fill: opts.shading } : undefined,
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: COLOR_BORDER },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: COLOR_BORDER },
      left: { style: BorderStyle.SINGLE, size: 1, color: COLOR_BORDER },
      right: { style: BorderStyle.SINGLE, size: 1, color: COLOR_BORDER },
    },
    children,
  });
}

async function generate() {
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Calibri', size: 17, color: COLOR_PRIMARY },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 450, bottom: 450, left: 550, right: 550 }, // Tight margins for clean 2-page fit
          },
        },
        children: [
          // Header / Title Banner
          createHeaderParagraph('AALI AI (আলি এআই)', 'Feni & Sylhet Flash-Flood Resilience Platform'),
          new Paragraph({
            spacing: { before: 0, after: 80 },
            children: [
              new TextRun({ text: '“When the towers die, the SOS doesn’t.”  ', bold: true, italics: true, size: 19, color: COLOR_ACCENT, font: 'Calibri' }),
              new TextRun({ text: 'Track 1: Climate Resilience & Humanitarian Action · Hack for Humanity 2026', size: 16, color: COLOR_MUTED, font: 'Calibri' }),
            ],
          }),

          // The Problem & Baseline Metrics Table
          createSectionHeading('1. The Crisis Baseline: 92.6% Cellular Collapse in Feni & Sylhet'),
          new Paragraph({
            spacing: { before: 0, after: 60 },
            children: [
              new TextRun({ text: 'In August 2024, ', font: 'Calibri', size: 17 }),
              new TextRun({ text: '616 of 653 mobile towers (92.6%) in Feni failed within 48 hours', bold: true, font: 'Calibri', size: 17 }),
              new TextRun({ text: ' due to submerged power backups. Telemetered river gauges went silent as waters surged +6.92m in 15 hours. Over 350,000 citizens were marooned in total communication blackout while rescue hotlines jammed at 12 calls/min with zero shared visibility. Similar infrastructure collapse severed Sylhet in 2022/2024.', font: 'Calibri', size: 17 }),
            ],
          }),

          // Key Stats Grid Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createTableCell('616 / 653 (92.6%)', { width: 25, bold: true, size: 18, color: COLOR_ACCENT, shading: COLOR_BG_LIGHT }),
                  createTableCell('+6.92 m in 15h', { width: 25, bold: true, size: 18, color: COLOR_ACCENT, shading: COLOR_BG_LIGHT }),
                  createTableCell('42 Bytes', { width: 25, bold: true, size: 18, color: COLOR_ACCENT, shading: COLOR_BG_LIGHT }),
                  createTableCell('8–24 Hours', { width: 25, bold: true, size: 18, color: COLOR_ACCENT, shading: COLOR_BG_LIGHT }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell('Feni Towers Down by Aug 24 (BTRC)', { width: 25, size: 14, color: COLOR_MUTED }),
                  createTableCell('Muhuri River Rise at Parshuram (BWDB)', { width: 25, size: 14, color: COLOR_MUTED }),
                  createTableCell('Compact ASCII Distress Packet (1 SMS)', { width: 25, size: 14, color: COLOR_MUTED }),
                  createTableCell('Evacuation Lead Time via Blank-Gauge Rule', { width: 25, size: 14, color: COLOR_MUTED }),
                ],
              }),
            ],
          }),

          // The Core Breakthrough
          createSectionHeading('2. The Operational Breakthrough: Before, During, and After Collapse'),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createTableCell([
                    new Paragraph({ children: [new TextRun({ text: 'BEFORE · PROACTIVE WARNING', bold: true, size: 15, color: COLOR_ACCENT })] }),
                    new Paragraph({ children: [new TextRun({ text: '• 3-Signal Hydrology Fusion: Combines BWDB river gauges, satellite rainfall (NASA GPM/BMD), and volunteer staff readings.\n• Blank-Gauge Escalation Rule: A silent sensor is NEVER treated as safe water. If a gauge stops transmitting for ≥60 min while rain >75mm, alert escalates to ACT (Red) immediately.\n• Audio Broadcast: Automated Mosque Loudspeaker (মাইকিং) Bengali voice warnings for zero-phone areas.', size: 14 })] }),
                  ], { width: 33, shading: COLOR_BG_LIGHT }),
                  createTableCell([
                    new Paragraph({ children: [new TextRun({ text: 'DURING · ZERO-TOWER SOS & TRIAGE', bold: true, size: 15, color: COLOR_ACCENT })] }),
                    new Paragraph({ children: [new TextRun({ text: '• 42-Byte ASCII Packet: Entire distress call (headcount, elderly, child, trapped, geohash) compressed into 1 standard SMS or Starlink Direct-to-Cell burst.\n• Dialect NLP: Gemini Flash translates regional Noakhali/Feni dialects with deterministic local regex fallback.\n• Human-in-the-Loop Rescue: Deterministic boat ranking (people, water rise, spotlight, fuel range). ZERO auto-dispatch.', size: 14 })] }),
                  ], { width: 34, shading: COLOR_BG_LIGHT }),
                  createTableCell([
                    new Paragraph({ children: [new TextRun({ text: 'AFTER · FAIR RELIEF & AUDIT', bold: true, size: 15, color: COLOR_ACCENT })] }),
                    new Paragraph({ children: [new TextRun({ text: '• Tube-Well Contamination Ledger: Tracks submerged water sources by village (BBS Census weighted).\n• SHA-256 Anti-Fraud Guard: Cryptographic idempotency keys prevent relief double-claiming.\n• Silent-Village Detection: Flags communities with high hazard but zero reports (absence of calls ≠ safety).', size: 14 })] }),
                  ], { width: 33, shading: COLOR_BG_LIGHT }),
                ],
              }),
            ],
          }),

          // Architecture & The Aali Compact
          createSectionHeading('3. System Architecture & The Aali Compact (The Institutional Premise)'),
          createParagraph('Aali AI bridges the real-world humanitarian gap under an institutional three-party emergency compact:', { after: 20 }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createTableCell('Stakeholder', { width: 22, bold: true, size: 15, shading: COLOR_BORDER }),
                  createTableCell('Operational Role & Commitment', { width: 48, bold: true, size: 15, shading: COLOR_BORDER }),
                  createTableCell('Value Received', { width: 30, bold: true, size: 15, shading: COLOR_BORDER }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell('Government (BTRC, DDM, BWDB)', { width: 22, bold: true, size: 14 }),
                  createTableCell('Declares emergency mode for affected upazilas; signs official warnings; owns the immutable audit trail.', { width: 48, size: 14 }),
                  createTableCell('Verified common operating picture; automated draft alerts.', { width: 30, size: 14 }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell('Telecoms (Banglalink, GP, Robi)', { width: 22, bold: true, size: 14 }),
                  createTableCell('Opens satellite-to-phone (Starlink D2C) emergency roaming to all SIMs; auto-forwards SOS packets to Aali; zero-rates app.', { width: 48, size: 14 }),
                  createTableCell('Turnkey humanitarian use case for new satellite spectrum.', { width: 30, size: 14 }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell('Responders (Red Crescent, FSCD)', { width: 22, bold: true, size: 14 }),
                  createTableCell('Operates from unified Web Situation Room; maintains live boat inventory; signs off rescue missions.', { width: 48, size: 14 }),
                  createTableCell('Eliminates blind double-dispatch; prioritizes trapped families.', { width: 30, size: 14 }),
                ],
              }),
            ],
          }),

          // Where AI Does the Work vs Where It Stays Out
          createSectionHeading('4. Ethical AI Boundaries: What AI Does vs. What Remains Deterministic'),
          new Paragraph({
            spacing: { before: 20, after: 40 },
            children: [
              new TextRun({ text: '• AI DOES: ', bold: true, color: COLOR_PRIMARY, size: 15 }),
              new TextRun({ text: '(1) Understands unstructured dialect Bengali/Banglish SOS text and audio into schema JSON; (2) Matches differently worded duplicate reports using semantic similarity; (3) Drafts localized evacuation warning texts.\n', size: 15 }),
              new TextRun({ text: '• AI NEVER DOES (Strict Deterministic Rules): ', bold: true, color: COLOR_ACCENT, size: 15 }),
              new TextRun({ text: 'Flood alert levels (Watch/Warning/Act), confidence scores (0-100%), boat prioritization math, and relief entitlements are 100% deterministic code. An AI error never costs a human life. Zero auto-dispatch without human authorization.', size: 15 }),
            ],
          }),

          // Live Prototype Verification Matrix
          createSectionHeading('5. Verified Prototype Evidence (100% Passing Test Suites)'),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createTableCell('Component', { width: 28, bold: true, size: 14, shading: COLOR_BORDER }),
                  createTableCell('Technology Stack', { width: 32, bold: true, size: 14, shading: COLOR_BORDER }),
                  createTableCell('Verification & Live Hardware Status', { width: 40, bold: true, size: 14, shading: COLOR_BORDER }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell('Backend API Gateway', { width: 28, bold: true, size: 13 }),
                  createTableCell('NestJS 10, TypeORM, MySQL 8.4, SSE', { width: 32, size: 13 }),
                  createTableCell('113 / 113 Tests Passed (26 suites). Strict RBAC & audit logging.', { width: 40, size: 13 }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell('Web Situation Room', { width: 28, bold: true, size: 13 }),
                  createTableCell('React 18, TypeScript, Vite, Pure Dark UI', { width: 32, size: 13 }),
                  createTableCell('48 / 48 Tests Passed (13 suites). Zero-lag SSE stream, Leaflet maps.', { width: 40, size: 13 }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell('Resident Mobile App', { width: 28, bold: true, size: 13 }),
                  createTableCell('Flutter 3.x, Material 3, Canvas Map', { width: 32, size: 13 }),
                  createTableCell('16 / 16 Tests Passed. Verified on physical Android device via wireless ADB.', { width: 40, size: 13 }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell('SMPP Telecom Gateway', { width: 28, bold: true, size: 13 }),
                  createTableCell('Node.js TCP PDU Server (Port 2775)', { width: 32, size: 13 }),
                  createTableCell('Shortcode 1090 GSM 03.38 PDU parsing and REST bridge operational.', { width: 40, size: 13 }),
                ],
              }),
            ],
          }),

          // Honest Limitations & Physical Final Readiness
          createSectionHeading('6. Honest Scope & Physical Final Readiness (October 23, 2026)'),
          new Paragraph({
            spacing: { before: 20, after: 20 },
            children: [
              new TextRun({ text: '• What is Real in the Demo: ', bold: true, size: 15 }),
              new TextRun({ text: 'Working REST API, real-time SSE stream, full React Web Command Room, physical Flutter app on Android 13+ with offline SQLite queue, audio broadcasts, and MySQL database.\n', size: 14 }),
              new TextRun({ text: '• What is Honest Simulation: ', bold: true, size: 15 }),
              new TextRun({ text: 'Carrier satellite-to-phone spectrum is simulated via local Wi-Fi uplink (`STARLINK_D2C_WIFI`); cell tower blackout is simulated via control toggles; flood hydrograph is reconstructed from published BWDB/FFWC observations.\n', size: 14 }),
              new TextRun({ text: '• Physical Final Staging (Oct 23): ', bold: true, size: 15 }),
              new TextRun({ text: 'Fully rehearsal-ready with 1-click Stage Demo Director, physical Android device wireless mirror, mosque loudspeaker amp output, and full multi-district (Feni & Sylhet) operational coverage.', size: 14 }),
            ],
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join(__dirname, '../docs/Aali_AI_Judges_Proposal_2pg.docx');
  fs.writeFileSync(outPath, buffer);
  console.log('Generated:', outPath, 'Bytes:', buffer.length);
}

generate().catch(console.error);

