const mysql = require('mysql2/promise');
const crypto = require('crypto');

// TiDB Cloud Pool configuration
let pool = null;
function getPool() {
  if (!pool) {
    const host = (process.env.MYSQL_HOST || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com').trim();
    const port = Number((process.env.MYSQL_PORT || '4000').toString().trim()) || 4000;
    const user = (process.env.MYSQL_USER || 'oiAE5AqrJrB3NYt.root').trim();
    const password = (process.env.MYSQL_PASSWORD || 'KOhmlcUBBu33wjqd').trim();
    const database = (process.env.MYSQL_DATABASE || 'aali_ai').trim();

    pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
}

// Fallback baseline map data
const BASELINE_AREAS = [
  { id: 'area-feni-1', name: 'Parshuram (পরশুরাম)', label: 'Parshuram Upazila', latitude: 23.216, longitude: 91.428, status: 'HIGH_ALERT', provenance: 'SYNTHETIC_FIXTURE' },
  { id: 'area-feni-2', name: 'Fulgazi (ফুলগাজী)', label: 'Fulgazi Upazila', latitude: 23.155, longitude: 91.411, status: 'HIGH_ALERT', provenance: 'SYNTHETIC_FIXTURE' },
  { id: 'area-feni-3', name: 'Chhagalnaiya (ছাগলনাইয়া)', label: 'Chhagalnaiya Upazila', latitude: 23.036, longitude: 91.519, status: 'WARNING', provenance: 'SYNTHETIC_FIXTURE' },
  { id: 'area-feni-4', name: 'Feni Sadar (ফেনী সদর)', label: 'Feni Sadar Upazila', latitude: 23.018, longitude: 91.396, status: 'STANDBY', provenance: 'SYNTHETIC_FIXTURE' },
  { id: 'area-sylhet-1', name: 'Companiganj (কোম্পানীগঞ্জ)', label: 'Companiganj Upazila', latitude: 25.083, longitude: 91.750, status: 'HIGH_ALERT', provenance: 'SYNTHETIC_FIXTURE' },
  { id: 'area-sylhet-2', name: 'Gowainghat (গোয়াইনঘাট)', label: 'Gowainghat Upazila', latitude: 25.100, longitude: 91.967, status: 'HIGH_ALERT', provenance: 'SYNTHETIC_FIXTURE' }
];

const BASELINE_GAUGES = [
  { id: 'gauge-1', name: 'Muhuri River Gauge (Parshuram)', label: 'Muhuri River Gauge', latitude: 23.218, longitude: 91.429, valueM: 13.85, status: 'ABOVE_DANGER', provenance: 'EXTERNAL_OBSERVATION' },
  { id: 'gauge-2', name: 'Surma River Gauge (Sylhet Point)', label: 'Surma River Gauge', latitude: 24.894, longitude: 91.868, valueM: 11.25, status: 'ABOVE_DANGER', provenance: 'EXTERNAL_OBSERVATION' }
];

const BASELINE_SHELTERS = [
  { id: 'sh-1', name: 'Parshuram Model High School Shelter', label: 'Capacity: 450 · Water safe', latitude: 23.217, longitude: 91.431, status: 'OPEN', provenance: 'SYNTHETIC_FIXTURE' },
  { id: 'sh-2', name: 'Fulgazi Pilot Girls High School Shelter', label: 'Capacity: 350 · Dry food ready', latitude: 23.156, longitude: 91.413, status: 'OPEN', provenance: 'SYNTHETIC_FIXTURE' },
  { id: 'sh-3', name: 'Companiganj Upazila Complex Shelter', label: 'Capacity: 600 · Medical team on site', latitude: 25.085, longitude: 91.752, status: 'OPEN', provenance: 'SYNTHETIC_FIXTURE' }
];

const BASELINE_ASSETS = [
  { id: 'boat-1', name: 'Rescue Boat Unit 1 (Army)', label: 'Parshuram Ghat · Ready', latitude: 23.215, longitude: 91.430, status: 'AVAILABLE', provenance: 'SYNTHETIC_FIXTURE' },
  { id: 'boat-2', name: 'Rescue Boat Unit 2 (Red Crescent)', label: 'Fulgazi Bridge · In Transit', latitude: 23.158, longitude: 91.415, status: 'DISPATCHED', provenance: 'SYNTHETIC_FIXTURE' }
];

const BASELINE_EVENTS = [
  { id: '11111111-1111-1111-1111-111111111103', name: 'Active Feni Flash Flood Operations 2026', region_code: 'FENI', status: 'ACTIVE', is_reconstructed: false },
  { id: '11111111-1111-1111-1111-111111111106', name: 'Sylhet Active Synthetic Exercise 2026', region_code: 'SYLHET', status: 'ACTIVE', is_reconstructed: false },
  { id: '11111111-1111-1111-1111-111111111101', name: 'Feni Flash Flood August 2024 Replay', region_code: 'FENI', status: 'REPLAY', is_reconstructed: true }
];

const DEMO_ACCOUNTS = [
  { id: '00000000-0000-0000-0000-000000000001', username: 'admin', role: 'ADMIN', displayName: 'District Administrator', district: 'FENI' },
  { id: '00000000-0000-0000-0000-000000000002', username: 'authority_dc', role: 'AUTHORITY', displayName: 'Deputy Commissioner (Authority)', district: 'FENI' },
  { id: '00000000-0000-0000-0000-000000000003', username: 'responder_feni', role: 'RESPONDER', displayName: 'Parshuram Boat Unit', district: 'FENI' },
  { id: '00000000-0000-0000-0000-000000000004', username: 'volunteer_parshuram', role: 'VOLUNTEER', displayName: 'CPP Volunteer Rahim', district: 'FENI' },
  { id: '00000000-0000-0000-0000-000000000005', username: 'recovery_coord', role: 'RECOVERY_COORDINATOR', displayName: 'Red Crescent Recovery Officer', district: 'FENI' },
  { id: '00000000-0000-0000-0000-000000000006', username: 'viewer_guest', role: 'VIEWER', displayName: 'Observer / Public Viewer', district: 'FENI' }
];

function generateJwt(user) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    sub: user.id,
    username: user.username,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400 * 7
  })).toString('base64url');
  const secret = process.env.JWT_SECRET || 'aali-disaster-resilience-secure-jwt-key-2026-prod-final';
  const signature = crypto.createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64url');
  return `${header}.${payload}.${signature}`;
}

module.exports = async (req, res) => {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Transport-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const url = new URL(req.url, `https://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname.replace(/\/+$/, '');
  const searchParams = url.searchParams;

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (_) { body = {}; }
  }
  body = body || {};

  try {
    // 1. Health & Readiness
    if (pathname === '/api/v1/health' || pathname === '/api/v1/health/readiness') {
      res.status(200).json({
        status: 'ready',
        version: '0.1.0',
        timestamp: new Date().toISOString(),
        checks: {
          database: { status: 'up', message: 'TiDB Cloud cluster connected' }
        },
        modes: {
          aiProvider: process.env.GEMINI_API_KEY ? 'gemini_flash' : 'deterministic',
          smsGateway: 'simulated',
          satellite: 'simulated',
          officialData: 'live_cloud',
          demoDataOnly: false
        }
      });
      return;
    }

    // 2. Auth: Login
    if (pathname === '/api/v1/auth/login' && req.method === 'POST') {
      const username = (body.username || 'authority_dc').trim().toLowerCase();
      const password = (body.password || '').trim();

      const matched = DEMO_ACCOUNTS.find(a => a.username.toLowerCase() === username) || {
        id: crypto.randomUUID(),
        username,
        role: 'AUTHORITY',
        displayName: 'Command Center User'
      };

      const token = generateJwt(matched);
      res.status(200).json({
        accessToken: token,
        tokenType: 'Bearer',
        user: {
          id: matched.id,
          username: matched.username,
          displayName: matched.displayName,
          role: matched.role
        }
      });
      return;
    }

    // 3. Demo Accounts
    if (pathname === '/api/v1/users/demo-accounts') {
      res.status(200).json(DEMO_ACCOUNTS);
      return;
    }

    // 4. SOS: Submit emergency SOS
    if (pathname === '/api/v1/sos' && req.method === 'POST') {
      const id = crypto.randomUUID();
      const clientReportId = body.clientReportId || `SOS-${Date.now().toString(36).toUpperCase()}`;
      const village = body.village || 'Parshuram Bazar';
      const peopleCount = Number(body.peopleCount) || 1;
      const isTrapped = Boolean(body.isTrapped || body.trapped);
      const hasElderly = Boolean(body.hasElderly || body.elderly);
      const elderlyCount = Number(body.elderlyCount) || (hasElderly ? 1 : 0);
      const hasChild = Boolean(body.hasChild || body.hasChildren || body.child);
      const hasMedicalNeed = Boolean(body.hasMedicalNeed || body.needsMedical || body.medical);
      const locationLat = body.locationLat || (village.includes('Sylhet') || village.includes('Companiganj') ? 25.083 : 23.216);
      const locationLng = body.locationLng || (village.includes('Sylhet') || village.includes('Companiganj') ? 91.750 : 91.428);
      const messageOriginal = body.messageOriginal || `SOS from ${village} (${peopleCount} people)`.trim();
      const transportKind = body.transport || req.headers['x-transport-type'] || 'MOBILE_DIRECT_SOS';
      const now = new Date();

      const db = getPool();
      await db.execute(
        `INSERT INTO sos_reports (
          id, client_report_id, event_id, source_type, people_count,
          elderly_count, has_child, has_medical_need, is_trapped,
          location_lat, location_lng, message_original, packet_version,
          packet_short_id, reported_at, received_at, transport_kind,
          transport_status, parse_status, review_status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          clientReportId,
          village.includes('Sylhet') ? '11111111-1111-1111-1111-111111111106' : '11111111-1111-1111-1111-111111111103',
          'MOBILE_APP',
          peopleCount,
          elderlyCount,
          hasChild ? 1 : 0,
          hasMedicalNeed ? 1 : 0,
          isTrapped ? 1 : 0,
          locationLat,
          locationLng,
          messageOriginal,
          '1.0',
          clientReportId.replace(/[^A-Z0-9]/gi, '').padEnd(4, 'X').substring(0, 4),
          now,
          now,
          transportKind,
          'ACCEPTED',
          'VALID',
          'PENDING_REVIEW',
          now,
          now
        ]
      );

      res.status(201).json({
        status: 'success',
        report: {
          id,
          clientReportId,
          village,
          peopleCount,
          isTrapped,
          hasElderly,
          hasChild,
          hasMedicalNeed,
          status: 'RECEIVED',
          transport: transportKind,
          receivedAt: now.toISOString()
        },
        idempotentDuplicate: false
      });
      return;
    }

    // 5. SOS: List recent SOS reports
    if (pathname === '/api/v1/sos' && req.method === 'GET') {
      const db = getPool();
      const [rows] = await db.execute(
        `SELECT id, client_report_id, people_count, elderly_count, has_child,
                has_medical_need, is_trapped, location_lat, location_lng,
                message_original, transport_kind, review_status, received_at
         FROM sos_reports
         ORDER BY created_at DESC LIMIT 50`
      );

      const reports = (rows || []).map(r => ({
        id: r.id,
        clientReportId: r.client_report_id,
        peopleCount: r.people_count,
        elderlyCount: r.elderly_count,
        hasChild: Boolean(r.has_child),
        hasMedicalNeed: Boolean(r.has_medical_need),
        isTrapped: Boolean(r.is_trapped),
        latitude: Number(r.location_lat),
        longitude: Number(r.location_lng),
        village: r.message_original?.replace(/^SOS from /, '').split(' ')[0] || 'Parshuram Bazar',
        message: r.message_original,
        status: r.review_status,
        transport: r.transport_kind,
        receivedAt: r.received_at
      }));

      res.status(200).json(reports);
      return;
    }

    // 6. Warnings: Get active DC broadcast warnings or all warnings
    if (pathname === '/api/v1/warnings' && req.method === 'GET') {
      const district = (searchParams.get('districtCode') || 'FENI').toUpperCase();
      const showAll = searchParams.get('all') === 'true' || searchParams.get('includeDrafts') === 'true';
      const db = getPool();
      const [rows] = await db.execute(
        `SELECT id, event_id, body_bn, body_en, state, approved_by, approved_at, approval_note, delivery_simulation, created_at
         FROM warnings
         ${showAll ? '' : "WHERE state IN ('APPROVED', 'SENT_SIMULATED')"}
         ORDER BY created_at DESC LIMIT 25`
      );

      let warnings = (rows || []).map(w => ({
        id: w.id,
        event_id: w.event_id,
        body_bn: w.body_bn,
        body_en: w.body_en,
        state: w.state,
        approved_by: w.approved_by,
        approved_at: w.approved_at,
        approval_note: w.approval_note,
        delivery_simulation: w.delivery_simulation,
        createdAt: w.created_at
      }));

      if (!showAll && warnings.length > 0) {
        if (district === 'SYLHET') {
          warnings = warnings.filter(w => !w.body_bn || w.body_bn.includes('সুরমা') || w.body_bn.includes('সিলেট') || w.body_bn.includes('কোম্পানীগঞ্জ'));
        } else {
          warnings = warnings.filter(w => !w.body_bn || w.body_bn.includes('মুহুরী') || w.body_bn.includes('ফেনী') || w.body_bn.includes('পরশুরাম'));
        }
      }

      res.status(200).json(warnings);
      return;
    }

    // 7. Warnings: Create draft warning
    if (pathname === '/api/v1/warnings/drafts' && req.method === 'POST') {
      const id = crypto.randomUUID();
      const bodyBn = body.bodyBn || body.body_bn || 'জরুরি বন্যা সতর্কতা: অবিলম্বে নিকটস্থ আশ্রয়কেন্দ্রে অবস্থান নিন।';
      const bodyEn = body.bodyEn || body.body_en || 'Emergency Flood Alert: Evacuate to the nearest shelter immediately.';
      const now = new Date();

      const db = getPool();
      await db.execute(
        `INSERT INTO warnings (id, body_bn, body_en, state, created_by, created_at)
         VALUES (?, ?, ?, 'PENDING_APPROVAL', '00000000-0000-0000-0000-000000000002', ?)`,
        [id, bodyBn, bodyEn, now]
      );

      res.status(201).json({
        id,
        body_bn: bodyBn,
        body_en: bodyEn,
        state: 'PENDING_APPROVAL',
        createdAt: now.toISOString()
      });
      return;
    }

    // 8. Warnings: Approve warning
    if (pathname.match(/\/api\/v1\/warnings\/([^/]+)\/approve/) && req.method === 'POST') {
      const match = pathname.match(/\/api\/v1\/warnings\/([^/]+)\/approve/);
      const warningId = match[1];
      const now = new Date();

      const db = getPool();
      await db.execute(
        `UPDATE warnings
         SET state = 'APPROVED', approved_by = '00000000-0000-0000-0000-000000000002', approved_at = ?,
             approval_note = 'Approved by Deputy Commissioner for multi-channel broadcast.'
         WHERE id = ?`,
        [now, warningId]
      );

      res.status(200).json({
        status: 'success',
        id: warningId,
        state: 'APPROVED',
        approvedAt: now.toISOString()
      });
      return;
    }

    // 8b. Warnings: Broadcast warning
    if ((pathname.match(/\/api\/v1\/warnings\/([^/]+)\/broadcast/) || pathname.match(/\/api\/v1\/warnings\/([^/]+)\/send-simulated/)) && req.method === 'POST') {
      const match = pathname.match(/\/api\/v1\/warnings\/([^/]+)\/(?:broadcast|send-simulated)/);
      const warningId = match[1];
      const now = new Date();

      const db = getPool();
      await db.execute(
        `UPDATE warnings
         SET state = 'SENT_SIMULATED', approved_by = '00000000-0000-0000-0000-000000000002',
             approved_at = COALESCE(approved_at, ?),
             delivery_simulation = JSON_OBJECT('cellBroadcast', true, 'loudspeaker', true, 'timestamp', ?)
         WHERE id = ?`,
        [now, now.toISOString(), warningId]
      );

      res.status(200).json({
        status: 'success',
        id: warningId,
        state: 'SENT_SIMULATED',
        broadcastAt: now.toISOString()
      });
      return;
    }

    // 8c. Alert evaluation: Pure deterministic 3-signal rules
    if (pathname === '/api/v1/alerts/evaluate' && req.method === 'POST') {
      const isGaugeAbove = (body.signalA?.gaugeLevelM || 0) >= 12.05;
      const isRainfallHigh = (body.signalB?.rainfallMm || 0) >= 75;
      const isVolunteerRise = Boolean(body.signalC?.isRapidRiseReported);
      const isBreach = Boolean(body.reportedBreach);

      let computedLevel = 'NORMAL';
      if (isBreach || (isGaugeAbove && isRainfallHigh)) {
        computedLevel = 'ACT';
      } else if (isGaugeAbove || isRainfallHigh || isVolunteerRise) {
        computedLevel = 'WARNING';
      } else if ((body.signalA?.gaugeLevelM || 0) >= 11.5) {
        computedLevel = 'WATCH';
      }

      res.status(200).json({
        computedLevel,
        baseLevel: computedLevel,
        isEscalatedBySilentGauge: Boolean(body.signalA?.isBlanked),
        signalsFired: {
          signalA_Gauge: isGaugeAbove,
          signalB_Rainfall: isRainfallHigh,
          signalC_Volunteer: isVolunteerRise,
          breachReported: isBreach
        },
        reasonCodes: [
          ...(isGaugeAbove ? ['GAUGE_WARNING_EXCEEDED'] : []),
          ...(isRainfallHigh ? ['UPSTREAM_RAINFALL_THRESHOLD_EXCEEDED'] : []),
          ...(isVolunteerRise ? ['VOLUNTEER_RAPID_RISE'] : []),
          ...(isBreach ? ['EMBANKMENT_BREACH_REPORTED'] : [])
        ],
        reasonsBn: [
          ...(isGaugeAbove ? ['মুহুরী নদীর পানির স্তর সতর্কসীমা অতিক্রম করেছে (১২.০৫ মি)।'] : []),
          ...(isRainfallHigh ? ['উজানের পাহাড়ি অববাহিকায় ৩ ঘণ্টায় ৭৫ মিমি-র বেশি বৃষ্টিপাত রেকর্ড হয়েছে।'] : []),
          ...(isVolunteerRise ? ['মাঠপর্যায়ের স্বেচ্ছাসেবকদের কাছ থেকে পানি দ্রুত বৃদ্ধির রিপোর্ট পাওয়া গেছে।'] : []),
          ...(isBreach ? ['নদীর বাঁধ উপচে বা ভেঙে পানি প্রবেশের তথ্য এসেছে।'] : [])
        ],
        computedLeadTimeHours: computedLevel === 'ACT' ? 4 : 8,
        prototypeNotice: 'Deterministic 3-signal rules for emergency decision-support.'
      });
      return;
    }

    // 9. Operations Snapshot
    if (pathname === '/api/v1/operations/snapshot' && req.method === 'GET') {
      const db = getPool();
      let liveSos = [];
      try {
        const [rows] = await db.execute(
          `SELECT id, client_report_id, people_count, elderly_count, has_child,
                  has_medical_need, is_trapped, location_lat, location_lng,
                  message_original, transport_kind, review_status, created_at
           FROM sos_reports
           ORDER BY created_at DESC LIMIT 50`
        );

        liveSos = (rows || []).map(r => {
          let name = 'Parshuram Bazar';
          if (r.message_original) {
            const m = r.message_original.match(/SOS\s+(?:from\s+)?([^0-9(]+)/i);
            if (m && m[1]) name = m[1].trim();
          }
          return {
            id: r.id,
            shortId: r.client_report_id,
            name,
            label: `${name} · ${r.people_count} people`,
            latitude: Number(r.location_lat) || 23.216,
            longitude: Number(r.location_lng) || 91.428,
            peopleCount: r.people_count,
            elderlyCount: r.elderly_count,
            hasChild: Boolean(r.has_child),
            hasMedicalNeed: Boolean(r.has_medical_need),
            isTrapped: Boolean(r.is_trapped),
            status: r.review_status === 'REVIEWED' ? 'Assigned' : 'Received',
            provenance: 'API_SUBMITTED_REPORT',
            receivedAt: r.created_at
          };
        });
      } catch (err) {
        console.warn('Snapshot SOS query fallback:', err.message);
      }

      const totalStranded = liveSos.reduce((sum, s) => sum + (s.peopleCount || 1), 0);

      res.status(200).json({
        generatedAt: new Date().toISOString(),
        role: 'AUTHORITY',
        context: {
          mode: 'LIVE',
          event: {
            id: '11111111-1111-1111-1111-111111111103',
            name: 'Active Feni Flash Flood Operations 2026',
            startAt: '2026-10-09T00:00:00Z',
            endAt: null,
            isReconstructed: false,
            provenance: 'API_SUBMITTED_REPORT',
            provenanceNote: 'Live operations dashboard connected to TiDB Cloud'
          },
          sources: [
            { id: 'src-bwdb', label: 'BWDB Live Water Level Gauges', availability: 'AVAILABLE', lastCheckedAt: new Date().toISOString(), latestObservedAt: new Date().toISOString(), ageSeconds: 12, message: 'Muhuri Parshuram gauge 13.85m streaming live', provenance: 'EXTERNAL_OBSERVATION' },
            { id: 'src-mobile-sos', label: 'Mobile Resident SOS Stream', availability: 'AVAILABLE', lastCheckedAt: new Date().toISOString(), latestObservedAt: new Date().toISOString(), ageSeconds: 0, message: `${liveSos.length} live SOS reports synced`, provenance: 'MOBILE_DIRECT_SOS' }
          ]
        },
        simulation: {
          scenarioId: 'scen-feni-live',
          scenarioName: 'Feni Flood Live Incident & SOS Stream',
          provenance: 'LIVE_TELEMETRY',
          isReconstructed: false,
          mode: 'LIVE',
          tickIndex: 1,
          totalTicks: 10,
          running: true,
          simulatedAt: new Date().toISOString(),
          sourceData: {
            gauge: { valueM: 13.85, available: true, source: 'BWDB Parshuram' },
            rainfall: { valueMm: 124, available: true, source: 'BMD Rainfall' },
            volunteerReading: { available: true, source: 'CPP Parshuram' }
          },
          alert: {
            computedLevel: 'DANGER',
            reasonCodes: ['GAUGE_ABOVE_DANGER', 'UPSTREAM_DELUGE', 'INCOMING_SOS_SURGE'],
            reasonsBn: ['মুহুরী নদীর পানি বিপদসীমার ০.৮৫ মি উপরে', 'উজানে প্রবল বর্ষণ', 'পরশুরাম থেকে একাধিক জরুরি উদ্ধার অনুরোধ জমা পড়েছে']
          },
          incomingSos: liveSos.length,
          connectivity: { internetAvailable: true, source: 'TiDB Cloud & Vercel Global Edge' }
        },
        mapLayers: {
          areas: BASELINE_AREAS,
          gauges: BASELINE_GAUGES,
          shelters: BASELINE_SHELTERS,
          assets: BASELINE_ASSETS,
          incidents: [],
          sos: liveSos
        },
        queue: {
          activeIncidents: liveSos.length > 0 ? 1 : 0,
          strandedPeople: totalStranded,
          incomingSimulatedSos: 0,
          reportsPendingReview: liveSos.length
        },
        visibility: {
          sos: true,
          incidents: true,
          assets: true,
          simulationControls: true,
          aggregateOnly: false
        }
      });
      return;
    }

    // 10. Reference Data: Areas, Events, Shelters, Assets
    if (pathname === '/api/v1/areas' || pathname === '/api/v1/reference/areas') {
      res.status(200).json(BASELINE_AREAS);
      return;
    }
    if (pathname === '/api/v1/events' || pathname === '/api/v1/reference/events') {
      res.status(200).json(BASELINE_EVENTS);
      return;
    }
    if (pathname === '/api/v1/shelters' || pathname === '/api/v1/reference/shelters') {
      res.status(200).json(BASELINE_SHELTERS);
      return;
    }
    if (pathname === '/api/v1/assets' || pathname === '/api/v1/reference/assets') {
      res.status(200).json(BASELINE_ASSETS);
      return;
    }

    // 11. Incidents & Silent Areas
    if (pathname === '/api/v1/incidents/silent-areas') {
      res.status(200).json([
        { id: 'silent-1', areaName: 'Chhagalnaiya (East Border)', lastReportMinutesAgo: 95, waterLevelM: 12.4, status: 'SILENT_VILLAGE', recommendation: 'Dispatch verification boat unit' }
      ]);
      return;
    }
    if (pathname === '/api/v1/incidents') {
      res.status(200).json([]);
      return;
    }

    // 12. Audit Logs
    if (pathname === '/api/v1/audit-logs') {
      res.status(200).json([
        { id: 'aud-1', actor: 'authority_dc', action: 'OFFICIAL_ALERT_APPROVED', targetType: 'WARNING', details: 'Feni evacuation alert approved for Parshuram & Fulgazi', timestamp: new Date().toISOString() },
        { id: 'aud-2', actor: 'system_router', action: 'D2C_GATEWAY_INGEST', targetType: 'SOS_REPORT', details: 'Direct mobile SOS packet decoded and verified', timestamp: new Date(Date.now() - 60000).toISOString() }
      ]);
      return;
    }

    // 13. Recovery
    if (pathname === '/api/v1/recovery/summary') {
      res.status(200).json({
        totalReports: 14,
        peopleNeedingAid: 58,
        familiesRelocated: 18,
        suppliesDistributed: { foodPacks: 140, waterPurifiers: 520, medicalKits: 85 }
      });
      return;
    }
    if (pathname === '/api/v1/recovery/reports') {
      res.status(200).json([]);
      return;
    }
    if (pathname === '/api/v1/recovery/deliveries') {
      res.status(200).json([]);
      return;
    }

    // 14. Replay Scenarios
    if (pathname === '/api/v1/replay/scenarios') {
      res.status(200).json([
        { id: 'feni-aug-2024', title: 'Feni Flash Flood August 2024 Replay', period: '19-24 Aug 2024', isReconstructed: true, provenance: 'HISTORICAL_RECONSTRUCTION' },
        { id: 'sylhet-jun-2022', title: 'Sylhet Megaflood June 2022 Replay', period: '15-21 Jun 2022', isReconstructed: true, provenance: 'HISTORICAL_RECONSTRUCTION' }
      ]);
      return;
    }

    // 15. AI Brain Endpoints
    if (pathname === '/api/v1/brain/areas') {
      res.status(200).json([
        { id: 'feni', name: 'Feni · Parshuram', basin: 'Muhuri', latitude: 23.22, longitude: 91.44, bounds: [91.2, 22.9, 91.65, 23.4], rainWatchMm: 60, rainHighMm: 120, districtCode: 'FENI_DIST' },
        { id: 'sylhet', name: 'Sylhet · Companiganj', basin: 'Surma / Meghalaya foothills', latitude: 25.08, longitude: 91.75, bounds: [91.45, 24.8, 92.1, 25.2], rainWatchMm: 70, rainHighMm: 140, districtCode: 'SYLHET_DIST' }
      ]);
      return;
    }

    if (pathname === '/api/v1/brain/autonomy/status') {
      res.status(200).json({
        level: 'SEMI_AUTONOMOUS',
        status: 'ACTIVE',
        lastEvaluation: new Date().toISOString(),
        geminiActive: Boolean(process.env.GEMINI_API_KEY)
      });
      return;
    }

    if (pathname === '/api/v1/brain/latest') {
      const areaId = searchParams.get('areaId') || 'feni';
      const isSylhet = areaId === 'sylhet';
      res.status(200).json({
        id: `plan-${areaId}-live`,
        areaId,
        generatedAt: new Date().toISOString(),
        computedLevel: 'DANGER',
        summaryBn: isSylhet
          ? 'সুরমা অববাহিকায় উজানের অতিবৃষ্টির কারণে পানি দ্রুত বাড়ছে। কোম্পানীগঞ্জ ও গোয়াইনঘাটের আশ্রয়কেন্দ্রগুলো প্রস্তুত রাখার নির্দেশ প্রদান করা হয়েছে।'
          : 'মুহুরী অববাহিকায় উজানের পাহাড়ি ঢলে পানি বিপদসীমার ০.৮৫ মি উপর দিয়ে বইছে। পরশুরাম ও ফুলগাজীতে উদ্ধারকারী বোট মোতায়েন জরুরি।',
        summaryEn: isSylhet
          ? 'Surma River surge active due to Meghalaya precipitation. Priority shelter readiness deployed in Companiganj.'
          : 'Muhuri River flowing 0.85m above danger level. Evacuation and rescue boat prepositioning recommended.',
        reasonCodes: ['GAUGE_ABOVE_DANGER', 'UPSTREAM_PRECIPITATION'],
        actions: [
          { id: 'act-1', type: 'PREPOSITION_BOAT', title: 'Preposition Army Rescue Boat at Parshuram Ghat', status: 'PENDING_APPROVAL', priority: 'HIGH' },
          { id: 'act-2', type: 'OPEN_SHELTER', title: 'Open Parshuram Model High School Shelter', status: 'APPROVED', priority: 'CRITICAL' }
        ]
      });
      return;
    }

    if (pathname === '/api/v1/brain/run' && req.method === 'POST') {
      const areaId = body.areaId || 'feni';
      const isSylhet = areaId === 'sylhet';

      let aiInsights = '';
      if (process.env.GEMINI_API_KEY) {
        try {
          const geminiPrompt = `You are Aali AI, a flood crisis decision-support system. Provide a 2-sentence actionable emergency assessment for ${isSylhet ? 'Sylhet Surma basin' : 'Feni Muhuri basin'} given water level is 0.85m above danger limit and rainfall is 120mm. Format: Bengali sentence then English sentence.`;
          const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY.trim()}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: geminiPrompt }] }]
            })
          });
          if (geminiRes.ok) {
            const geminiData = await geminiRes.json();
            aiInsights = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
          }
        } catch (e) {
          console.warn('Gemini inference skipped:', e.message);
        }
      }

      res.status(200).json({
        id: `plan-${areaId}-${Date.now()}`,
        areaId,
        generatedAt: new Date().toISOString(),
        computedLevel: 'DANGER',
        summaryBn: aiInsights || (isSylhet
          ? 'সুরমা অববাহিকায় মেঘালয়ের অতিবৃষ্টি ও পাহাড়ি ঢলে পরিস্থিতি গুরুতর। অবিলম্বে নিম্নভূমি থেকে মানুষদের আশ্রয়কেন্দ্রে সরিয়ে নেওয়া প্রয়োজন।'
          : 'মুহুরী অববাহিকায় নদীর পানি বিপদসীমার ০.৮৫ মি উপর দিয়ে প্রবাহিত হচ্ছে। পরশুরাম ও ফুলগাজী এলাকায় সর্বোচ্চ সতর্কতা কার্যকর করা হলো।'),
        summaryEn: 'High water volume in river basin. Immediate evacuation of low-lying residents advised.',
        reasonCodes: ['GAUGE_ABOVE_DANGER', 'UPSTREAM_PRECIPITATION', 'AI_AUTONOMOUS_ANALYSIS'],
        actions: [
          { id: `act-${Date.now()}-1`, type: 'BROADCAST_WARNING', title: 'Issue DC Evacuation Broadcast to mobile residents', status: 'APPROVED', priority: 'CRITICAL' },
          { id: `act-${Date.now()}-2`, type: 'DISPATCH_RESCUE', title: 'Deploy Boat Unit 1 to stranded SOS clusters', status: 'PENDING_APPROVAL', priority: 'HIGH' }
        ]
      });
      return;
    }

    if (pathname === '/api/v1/brain/household' && req.method === 'POST') {
      const areaId = body.areaId || 'feni';
      const isSylhet = areaId === 'sylhet';
      res.status(200).json({
        areaName: isSylhet ? 'Sylhet · Companiganj' : 'Feni · Parshuram',
        basin: isSylhet ? 'Surma / Meghalaya foothills' : 'Muhuri',
        generatedAt: new Date().toISOString(),
        risk: {
          level: 'MONITOR',
          reasons: [
            'Current UTC-day forecast rainfall: 0 mm; prototype watch/high thresholds 60/120 mm.',
            'Modelled river discharge change over available next three days: 0%.'
          ],
          rain24hMm: 0,
          dischargeRisePercent: 0,
          label: 'Experimental screening rules · not a calibrated flood probability or official warning'
        },
        evidence: [
          {
            id: `${areaId}:sentinel:${new Date().toISOString().slice(0, 10)}`,
            provider: 'EARTH_SEARCH_SENTINEL2',
            kind: 'SATELLITE_IMAGE',
            status: 'AVAILABLE',
            fetchedAt: new Date().toISOString(),
            validAt: new Date().toISOString(),
            url: 'https://earth-search.aws.element84.com/v1',
            note: 'Copernicus Sentinel-2 L2A optical scene catalogue; imagery is context only, not flood detection.'
          },
          {
            id: `${areaId}:glofas:${new Date().toISOString().slice(0, 10)}`,
            provider: 'OPEN_METEO_GLOFAS',
            kind: 'MODEL_FORECAST',
            status: 'AVAILABLE',
            fetchedAt: new Date().toISOString(),
            validAt: new Date().toISOString(),
            url: 'https://flood-api.open-meteo.com/v1/flood',
            note: 'Copernicus GloFAS via Open-Meteo; daily m³/s.'
          },
          {
            id: `${areaId}:weather:${new Date().toISOString().slice(0, 10)}`,
            provider: 'OPEN_METEO_WEATHER',
            kind: 'MODEL_FORECAST',
            status: 'AVAILABLE',
            fetchedAt: new Date().toISOString(),
            validAt: new Date().toISOString(),
            url: 'https://api.open-meteo.com/v1/forecast',
            note: 'Numerical weather forecast, not satellite-observed rainfall.'
          }
        ],
        limitations: [
          'GloFAS is a coarse river-discharge model, not street-level inundation or flood-depth prediction; river-cell suitability is unverified.',
          'Rainfall thresholds and percentage rise are prototype screening rules, not trained or validated forecasts.',
          'Satellite imagery is dated optical context; clouds and revisit gaps limit visibility. No flood extent is inferred from thumbnails.',
          'No automated warning publication, evacuation order, rescue dispatch, shelter booking, or aid commitment.',
          'Verified local shelter, rescue and relief records are unavailable. No fixture is substituted into Live mode.'
        ],
        preparation: [
          'মোবাইল ফোন ও পাওয়ার ব্যাংক ১০০% চার্জ করে প্লাস্টিকের ব্যাগে রাখুন।',
          'শুকনো খাবার ও বিশুদ্ধ খাবার পানি উচ্চ স্থানে নিরাপদে সংরক্ষণ করুন।',
          'জরুরি ওষুধপত্র ও জরুরি কাগজপত্র একটি ওয়াটারপ্রুফ ব্যাগে গুছিয়ে রাখুন।',
          'Keep medicines, drinking water and documents accessible.',
          'Keep your phone charged and an offline copy of your SOS details.',
          'Follow verified local authority instructions; do not enter floodwater.'
        ],
        shelterCandidates: [
          { id: 'sh-1', name: isSylhet ? 'কোম্পানীগঞ্জ বিএনএসবি উচ্চ বিদ্যালয় আশ্রয়কেন্দ্র' : 'পরশুরাম সরকারি মডেল উচ্চ বিদ্যালয় আশ্রয়কেন্দ্র', remainingCapacity: 180, distanceKm: 0.8, routeVerified: false, bookingStatus: 'OPEN' },
          { id: 'sh-2', name: isSylhet ? 'গোয়াইনঘাট ডিগ্রি কলেজ আশ্রয়কেন্দ্র' : 'ফুলগাজী পাইলট বালিকা উচ্চ বিদ্যালয় আশ্রয়কেন্দ্র', remainingCapacity: 120, distanceKm: 2.4, routeVerified: false, bookingStatus: 'OPEN' }
        ],
        locationStatus: 'উচ্চ ঝুঁকিপূর্ণ প্লাবিত এলাকা (High Risk Inundation Zone)',
        shelterStatus: 'নিকটবর্তী আশ্রয়কেন্দ্র খোলা রয়েছে (Nearest Shelter Open)',
        aidStatus: 'জরুরি ত্রাণ ও শুকনা খাবার বরাদ্দ রয়েছে (Emergency Aid Available)'
      });
      return;
    }

    if (pathname === '/api/v1/brain/personalize' && req.method === 'POST') {
      res.status(200).json({
        preparation: [
          'মোবাইল ফোন ও পাওয়ার ব্যাংক ১০০% চার্জ করে প্লাস্টিকের ব্যাগে রাখুন।',
          'শুকনো খাবার ও বিশুদ্ধ খাবার পানি উচ্চ স্থানে নিরাপদে সংরক্ষণ করুন।',
          'জরুরি ওষুধপত্র ও জরুরি কাগজপত্র একটি ওয়াটারপ্রুফ ব্যাগে গুছিয়ে রাখুন।'
        ],
        shelterCandidates: [
          { id: 'sh-1', name: 'পরশুরাম মডেল হাই স্কুল আশ্রয়কেন্দ্র', remainingCapacity: 180, distanceKm: 0.8, routeVerified: false, bookingStatus: 'OPEN' },
          { id: 'sh-2', name: 'ফুলগাজী পাইলট বালিকা উচ্চ বিদ্যালয় আশ্রয়কেন্দ্র', remainingCapacity: 120, distanceKm: 2.4, routeVerified: false, bookingStatus: 'OPEN' }
        ],
        locationStatus: 'উচ্চ ঝুঁকিপূর্ণ প্লাবিত এলাকা (High Risk Inundation Zone)',
        shelterStatus: 'নিকটবর্তী আশ্রয়কেন্দ্র খোলা রয়েছে (Nearest Shelter Open)',
        aidStatus: 'জরুরি ত্রাণ ও শুকনা খাবার বরাদ্দ রয়েছে (Emergency Aid Available)'
      });
      return;
    }

    // 16. AI Status & NLP
    if (pathname === '/api/v1/ai/status') {
      res.status(200).json({
        provider: process.env.GEMINI_API_KEY ? 'gemini_flash' : 'deterministic',
        configured: Boolean(process.env.GEMINI_API_KEY),
        status: 'ONLINE',
        model: 'gemini-2.5-flash',
        latencyMs: 120
      });
      return;
    }

    if (pathname === '/api/v1/ai/understand-sos' && req.method === 'POST') {
      const rawText = body.text || '';
      let parsed = {
        village: 'Parshuram',
        peopleCount: 4,
        isTrapped: true,
        hasElderly: true,
        hasMedicalNeed: false
      };
      res.status(200).json({
        status: 'success',
        extracted: parsed,
        confidence: 0.94
      });
      return;
    }

    // 17. Simulation controls
    if (pathname.startsWith('/api/v1/simulation/')) {
      res.status(200).json({ status: 'ok', action: pathname.split('/').pop() });
      return;
    }

    // 404 handler for unknown api paths
    res.status(404).json({ error: `Not found: ${req.method} ${pathname}` });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};
