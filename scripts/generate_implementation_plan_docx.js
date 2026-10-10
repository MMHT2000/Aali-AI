const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, HeadingLevel, AlignmentType } = require('docx');
const fs = require('fs');
const path = require('path');

// Styling Constants
const COLOR_PRIMARY = '0F172A'; // Slate 900
const COLOR_ACCENT = '2563EB';  // Blue 600
const COLOR_ALERT = 'DC2626';   // Red 600
const COLOR_MUTED = '475569';   // Slate 600
const COLOR_BG_LIGHT = 'F8FAFC'; // Slate 50
const COLOR_BORDER = 'CBD5E1';  // Slate 300

function createTitle(text, subtitle) {
  return [
    new Paragraph({
      spacing: { before: 100, after: 60 },
      children: [
        new TextRun({ text, bold: true, size: 28, color: COLOR_PRIMARY, font: 'Calibri' }),
      ],
    }),
    new Paragraph({
      spacing: { before: 0, after: 140 },
      children: [
        new TextRun({ text: subtitle, italics: true, size: 18, color: COLOR_MUTED, font: 'Calibri' }),
      ],
    }),
  ];
}

function createHeading(title) {
  return new Paragraph({
    spacing: { before: 200, after: 80 },
    children: [
      new TextRun({ text: title, bold: true, size: 20, color: COLOR_ACCENT, font: 'Calibri' }),
    ],
  });
}

function createSubHeading(title) {
  return new Paragraph({
    spacing: { before: 140, after: 60 },
    children: [
      new TextRun({ text: title, bold: true, size: 17, color: COLOR_PRIMARY, font: 'Calibri' }),
    ],
  });
}

function createParagraph(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 40, after: opts.after ?? 60 },
    children: [
      new TextRun({
        text,
        size: opts.size ?? 16,
        color: opts.color ?? COLOR_PRIMARY,
        bold: opts.bold ?? false,
        italics: opts.italics ?? false,
        font: 'Calibri',
      }),
    ],
  });
}

function createCell(content, opts = {}) {
  const children = Array.isArray(content) ? content : [
    new Paragraph({
      spacing: { before: 30, after: 30 },
      children: [
        new TextRun({
          text: content,
          size: opts.size ?? 14,
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
    margins: { top: 70, bottom: 70, left: 90, right: 90 },
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
          run: { font: 'Calibri', size: 16, color: COLOR_PRIMARY },
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
          ...createTitle('AALI AI — Detailed Implementation Plan & Roadmap', 'Current State, Technical Limitations & Target Deliverables for Physical Final on October 23, 2026'),

          createHeading('1. Executive Overview & Physical Final Context'),
          createParagraph('Aali AI is a production-grade full-stack disaster resilience and decision-support prototype engineered for the flash-flood vulnerabilities of Bangladesh (specifically Feni Muhuri basin and Sylhet Surma basin). The system addresses total infrastructure collapse (616 of 653 cell towers offline) using 42-byte ASCII packets, satellite Direct-to-Cell routing, deterministic hydrology escalation, and human-in-the-loop rescue coordination.'),
          createParagraph('The project is competing in the National Physical Final on October 23, 2026. This document establishes the exact verified state of the codebase as of October 11, codifies honest engineering boundaries, and details the sprint roadmap leading into the live stage showcase.'),

          createHeading('2. Current State: Component-by-Component Audit (October 11, 2026)'),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell('Component & Layer', { width: 25, bold: true, shading: COLOR_BORDER }),
                  createCell('Technology Stack', { width: 30, bold: true, shading: COLOR_BORDER }),
                  createCell('Current Operational State & Verification Metrics', { width: 45, bold: true, shading: COLOR_BORDER }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Backend API Gateway', { width: 25, bold: true }),
                  createCell('NestJS 10, TypeORM, MySQL 8.4, RxJS SSE stream', { width: 30 }),
                  createCell('Fully operational on :3001 (Dev) and :3002 (Docker). 113 of 113 automated tests passing. Zero-latency SSE event bus, strict RBAC, HMAC-SHA256 privacy hashing, and OpenAPI/Swagger documentation.', { width: 45 }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Web Situation Room', { width: 25, bold: true }),
                  createCell('React 18, TypeScript, Vite, Leaflet, Pure Dark UI', { width: 30 }),
                  createCell('Operational on :5173 (Dev) and :5174 (Docker). 48 of 48 unit tests passing. Real-time emergency banner, 1-Click Stage Demo Director, master crisis clock, and multi-district map toggling.', { width: 45 }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Tactile Mobile Client', { width: 25, bold: true }),
                  createCell('Flutter 3.x, Material 3, Custom Vector Canvas', { width: 30 }),
                  createCell('Installed and verified live on physical Android 13+ device via wireless ADB. 16 of 16 tests passing. Multi-transport auto-latching across LAN endpoints (:3001, :5173, :5174, :3002). Offline SQLite outbox buffer.', { width: 45 }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Telecom SMPP Gateway', { width: 25, bold: true }),
                  createCell('Node.js TCP PDU Server (SMPP v3.4), GSM 03.38', { width: 30 }),
                  createCell('Listens on port :2775 for telecom carrier links. Emulates shortcode 1090 routing, unpacking 42-byte ASCII packets directly into the REST API.', { width: 45 }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Regional Audio Engine', { width: 25, bold: true }),
                  createCell('HTML5 Web Audio, Bengali SpeechSynthesis, Loudspeaker PA', { width: 30 }),
                  createCell('Operational on both web dashboard and mobile client. Synthesizes mosque loudspeaker (মাইকিং) alerts for Sylhet DC and Feni DC with local TTS fallback.', { width: 45 }),
                ],
              }),
            ],
          }),

          createHeading('3. Honest Engineering Limitations & Boundaries'),
          createParagraph('In strict compliance with humanitarian integrity and contest rules, all operational simulations are explicitly disclosed:'),
          createParagraph('• Satellite Direct-to-Cell Carrier Spectrum: Live low-earth-orbit Starlink cellular spectrum is licensed exclusively to mobile network operators (Banglalink). In the prototype, satellite transmission is honesty-modeled via Wi-Fi uplink (X-Transport-Type: STARLINK_D2C_WIFI) and transparently badged [HACKATHON SIMULATION].'),
          createParagraph('• Cell Tower Blackout: Software-controlled simulation toggle based on verified BTRC August 2024 outage data (92.6% tower collapse).'),
          createParagraph('• Human-in-the-Loop Constraint: AI is strictly barred from autonomous boat dispatch, warning publication, or aid entitlement. A human commander must sign every operational change, producing an immutable audit log.'),
          createParagraph('• Flood Hydrology: Reconstructed from published BWDB/FFWC station records for the August 2024 Feni flood and July 2024 Sylhet flood. We do not claim an uncalibrated physics simulation.'),

          createHeading('4. Sprint Roadmap Before the Physical Final (October 11 – October 23)'),

          createSubHeading('Sprint 1: Physical Stage Rig & Hotspot Resilience (Oct 11 – Oct 14)'),
          createParagraph('1. Dedicated Stage Hotspot: Configure a standalone Wi-Fi router (192.168.1.1) to isolate the presentation laptop and mobile devices from conference hall Wi-Fi congestion.\n2. Dual-Display Wireless Mirroring: Configure scrcpy / wireless ADB casting to display the physical mobile screen side-by-side with the Web Situation Room on stage.\n3. Docker One-Command Freeze: Verify docker compose up -d launches all services cleanly on cold boot without requiring internet package fetches.'),

          createSubHeading('Sprint 2: Offline Multi-Hop Mesh Buffer (Oct 15 – Oct 18)'),
          createParagraph('1. Peer-to-Peer Wi-Fi Direct / BLE SOS Relay: Extend Flutter client with lightweight peer exchange so devices without satellite coverage can store-and-forward packets through neighboring devices that regain connectivity.\n2. Bundled Audio Assets: Bundle pre-recorded high-fidelity Bengali PA audio announcements inside the APK assets to eliminate any network dependency during audio playback.\n3. High-Contrast Sunlight Theme: Polish outdoor visibility for field responder screens under bright stage floodlights.'),

          createSubHeading('Sprint 3: Physical Audio & Shelter Onboarding Rig (Oct 19 – Oct 21)'),
          createParagraph('1. External Loudspeaker Amplifier Hookup: Integrate a 3.5mm / Bluetooth portable megaphone to play the mosque evacuation broadcast audibly during the 5-minute presentation.\n2. Offline Shelter QR Station: Create printable QR codes allowing marooned citizens entering school shelters to tap-and-check-in without cellular coverage.\n3. Volunteer Field Reading Calibration: Fine-tune staff gauge reading input form for CPP volunteers.'),

          createSubHeading('Sprint 4: Full Dress Rehearsal & Live Pitch Freeze (Oct 22 – Oct 23)'),
          createParagraph('1. 5-Minute Choreography Dry-Runs: Rehearse the 5 stage moments using the Stage Demo Director HUD.\n2. Rapid Q&A Defense Drills: Practice handling harsh panel inquiries on telecom partnerships, operational costs, and ethics.\n3. Codebase Lock & Tag: Git tag v1.0.0-physical-final with complete test logs and evidence files.'),

          createHeading('5. Risk Assessment & Mitigation Matrix'),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell('Identified Risk', { width: 30, bold: true, shading: COLOR_BORDER }),
                  createCell('Impact', { width: 25, bold: true, shading: COLOR_BORDER }),
                  createCell('Pre-Engineered Mitigation Strategy', { width: 45, bold: true, shading: COLOR_BORDER }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Stage venue Wi-Fi drops or blocks LAN ports', { width: 30 }),
                  createCell('High (Network severed)', { width: 25, color: COLOR_ALERT, bold: true }),
                  createCell('Standalone portable router with pre-configured static IPs (192.168.1.100 laptop, 192.168.1.110 mobile). Zero dependence on venue Wi-Fi.', { width: 45 }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Gemini Flash API rate-limited or offline', { width: 30 }),
                  createCell('Medium (Dialect NLP fails)', { width: 25, color: COLOR_ALERT }),
                  createCell('Built-in deterministic regex fallback engine extracts headcount and urgency keywords instantly with zero network delay.', { width: 45 }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Physical Android phone battery or display glitch', { width: 30 }),
                  createCell('High (Demo disrupted)', { width: 25, color: COLOR_ALERT, bold: true }),
                  createCell('Backup secondary device with pre-installed APK ready on standby, plus browser-based 3-Tap SOS simulator as fallback.', { width: 45 }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Judges challenge satellite-to-phone realism', { width: 30 }),
                  createCell('Medium (Scoring penalty)', { width: 25, color: COLOR_ALERT }),
                  createCell('Cite Banglalink 7 Oct 2026 launch approval, BTRC regulatory filings, and Liberty Caribbean Jamaica precedent in the Stage Defense Playbook.', { width: 45 }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join(__dirname, '../docs/Aali_AI_Final_Implementation_Plan_and_Roadmap.docx');
  fs.writeFileSync(outPath, buffer);
  console.log('Generated:', outPath, 'Bytes:', buffer.length);
}

generate().catch(console.error);
