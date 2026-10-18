const mysql = require('mysql2/promise');
require('dotenv').config();

const USERS = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    username: 'admin',
    password_hash: '$2b$10$wK1W.Q9PZtYQv48xQ1fFGe1N4P4V3d8a8JtE9B9j9.zG1C4X/eXKy', // Admin123!
    display_name: 'Feni District Admin',
    role: 'ADMIN',
    is_active: 1
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    username: 'authority_dc',
    password_hash: '$2b$10$wK1W.Q9PZtYQv48xQ1fFGe1N4P4V3d8a8JtE9B9j9.zG1C4X/eXKy', // Admin123!
    display_name: 'Deputy Commissioner (Authority)',
    role: 'AUTHORITY',
    is_active: 1
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    username: 'responder_feni',
    password_hash: '$2b$10$wK1W.Q9PZtYQv48xQ1fFGe1N4P4V3d8a8JtE9B9j9.zG1C4X/eXKy', // Admin123!
    display_name: 'Parshuram Boat Unit',
    role: 'RESPONDER',
    is_active: 1
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    username: 'volunteer_parshuram',
    password_hash: '$2b$10$wK1W.Q9PZtYQv48xQ1fFGe1N4P4V3d8a8JtE9B9j9.zG1C4X/eXKy', // Admin123!
    display_name: 'CPP Volunteer Rahim',
    role: 'VOLUNTEER',
    is_active: 1
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    username: 'recovery_coord',
    password_hash: '$2b$10$wK1W.Q9PZtYQv48xQ1fFGe1N4P4V3d8a8JtE9B9j9.zG1C4X/eXKy', // Admin123!
    display_name: 'Red Crescent Recovery Officer',
    role: 'RECOVERY_COORDINATOR',
    is_active: 1
  },
  {
    id: '00000000-0000-0000-0000-000000000006',
    username: 'viewer_guest',
    password_hash: '$2b$10$wK1W.Q9PZtYQv48xQ1fFGe1N4P4V3d8a8JtE9B9j9.zG1C4X/eXKy', // Admin123!
    display_name: 'Observer / Public Viewer',
    role: 'VIEWER',
    is_active: 1
  }
];

const RESIDENT_ACCOUNTS = [
  {
    id: 'res-resident-1',
    nid_hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    nid_last4: '1234',
    display_name: 'Mominul Huq (Resident)',
    phone_redacted: '018****1234'
  },
  {
    id: 'res-resident-2',
    nid_hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    nid_last4: '5678',
    display_name: 'Fatema Begum (Resident)',
    phone_redacted: '017****5678'
  }
];

const FLOOD_EVENTS = [
  {
    id: '11111111-1111-1111-1111-111111111101',
    name: 'Feni Flash Flood August 2024 Replay',
    region_code: 'FENI',
    start_at: '2024-08-19 00:00:00',
    end_at: '2024-08-24 23:59:59',
    status: 'REPLAY',
    mode: 'REPLAY',
    provenance_note: 'Historical reconstruction of August 2024 Feni flood from published BWDB reports.',
    is_reconstructed: 1
  },
  {
    id: '11111111-1111-1111-1111-111111111102',
    name: 'Feni Monsoonal Surge July 2025 Replay',
    region_code: 'FENI',
    start_at: '2025-07-20 00:00:00',
    end_at: '2025-07-22 23:59:59',
    status: 'REPLAY',
    mode: 'REPLAY',
    provenance_note: 'Reconstructed scenario for July 2025 surge with gauge anomalies.',
    is_reconstructed: 1
  },
  {
    id: '11111111-1111-1111-1111-111111111103',
    name: 'Active Demo Exercise 2026',
    region_code: 'FENI',
    start_at: '2026-10-09 00:00:00',
    end_at: null,
    status: 'ACTIVE',
    mode: 'DEMO',
    provenance_note: 'Live demonstration synthetic scenario.',
    is_reconstructed: 0
  },
  {
    id: '11111111-1111-1111-1111-111111111104',
    name: 'Sylhet Megaflood June 2022 Replay',
    region_code: 'SYLHET',
    start_at: '2022-06-15 00:00:00',
    end_at: '2022-06-21 23:59:59',
    status: 'REPLAY',
    mode: 'REPLAY',
    provenance_note: 'Historical reconstruction of June 2022 Surma deluge from BWDB Sylhet Point & Cherrapunji IMD records.',
    is_reconstructed: 1
  },
  {
    id: '11111111-1111-1111-1111-111111111105',
    name: 'Sylhet Flash Surge May 2024 Replay',
    region_code: 'SYLHET',
    start_at: '2024-05-28 00:00:00',
    end_at: '2024-05-31 23:59:59',
    status: 'REPLAY',
    mode: 'REPLAY',
    provenance_note: 'Reconstructed pre-monsoon deluge in Surma-Kushiyara basin triggered by Meghalaya upstream rainfall.',
    is_reconstructed: 1
  },
  {
    id: '11111111-1111-1111-1111-111111111106',
    name: 'Sylhet Active Synthetic Exercise 2026',
    region_code: 'SYLHET',
    start_at: '2026-10-09 00:00:00',
    end_at: null,
    status: 'ACTIVE',
    mode: 'DEMO',
    provenance_note: 'Synthetic Sylhet exercise; separate from the June 2022 and May 2024 historical replays.',
    is_reconstructed: 0
  }
];

const AREAS = [
  {
    id: '22222222-2222-2222-2222-222222222201',
    parent_id: null,
    area_type: 'DISTRICT',
    name_en: 'Feni District',
    name_bn: 'ফেনী জেলা',
    code: 'FENI_DIST',
    latitude: 23.0159,
    longitude: 91.3976,
    exposure_level: 'HIGH',
    population_estimate: 1437371,
    geohash7: 'wh0w7g1',
    source_name: 'SYNTHETIC_FENI_FIXTURE',
    is_synthetic: 1
  },
  {
    id: '22222222-2222-2222-2222-222222222202',
    parent_id: '22222222-2222-2222-2222-222222222201',
    area_type: 'UPAZILA',
    name_en: 'Parshuram',
    name_bn: 'পরশুরাম',
    code: 'PARSHURAM_UPZ',
    latitude: 23.2325,
    longitude: 91.4361,
    exposure_level: 'VERY_HIGH',
    population_estimate: 101000,
    geohash7: 'wh0xs6m',
    source_name: 'SYNTHETIC_FENI_FIXTURE',
    is_synthetic: 1
  },
  {
    id: '22222222-2222-2222-2222-222222222203',
    parent_id: '22222222-2222-2222-2222-222222222201',
    area_type: 'UPAZILA',
    name_en: 'Fulgazi',
    name_bn: 'ফুলগাজী',
    code: 'FULGAZI_UPZ',
    latitude: 23.1611,
    longitude: 91.4167,
    exposure_level: 'VERY_HIGH',
    population_estimate: 119000,
    geohash7: 'wh0wz8s',
    source_name: 'SYNTHETIC_FENI_FIXTURE',
    is_synthetic: 1
  },
  {
    id: '22222222-2222-2222-2222-222222222204',
    parent_id: '22222222-2222-2222-2222-222222222202',
    area_type: 'VILLAGE',
    name_en: 'Mirzanagar',
    name_bn: 'মির্জানগর',
    code: 'MIRZANAGAR_VIL',
    latitude: 23.245,
    longitude: 91.442,
    exposure_level: 'HIGH',
    population_estimate: 4200,
    geohash7: 'wh0xsk0',
    source_name: 'SYNTHETIC_FENI_FIXTURE',
    is_synthetic: 1
  },
  {
    id: '22222222-2222-2222-2222-222222222205',
    parent_id: '22222222-2222-2222-2222-222222222202',
    area_type: 'VILLAGE',
    name_en: 'Chitholia (Silent Candidate)',
    name_bn: 'চিথলিয়া (নীরব গ্রাম)',
    code: 'CHITHOLIA_VIL',
    latitude: 23.218,
    longitude: 91.428,
    exposure_level: 'VERY_HIGH',
    population_estimate: 5100,
    geohash7: 'wh0xs4a',
    source_name: 'SYNTHETIC_FENI_FIXTURE',
    is_synthetic: 1
  },
  {
    id: '22222222-2222-2222-2222-222222222206',
    parent_id: null,
    area_type: 'DISTRICT',
    name_en: 'Sylhet District',
    name_bn: 'সিলেট জেলা',
    code: 'SYLHET_DIST',
    latitude: 24.8949,
    longitude: 91.8687,
    exposure_level: 'VERY_HIGH',
    population_estimate: 3857037,
    geohash7: 'wh1p9c1',
    source_name: 'SYNTHETIC_SYLHET_FIXTURE',
    is_synthetic: 1
  },
  {
    id: '22222222-2222-2222-2222-222222222207',
    parent_id: '22222222-2222-2222-2222-222222222206',
    area_type: 'UPAZILA',
    name_en: 'Companiganj',
    name_bn: 'কোম্পানীগঞ্জ',
    code: 'COMPANIGANJ_UPZ',
    latitude: 25.0805,
    longitude: 91.7523,
    exposure_level: 'VERY_HIGH',
    population_estimate: 174000,
    geohash7: 'wh1qu1m',
    source_name: 'SYNTHETIC_SYLHET_FIXTURE',
    is_synthetic: 1
  },
  {
    id: '22222222-2222-2222-2222-222222222208',
    parent_id: '22222222-2222-2222-2222-222222222206',
    area_type: 'UPAZILA',
    name_en: 'Gowainghat',
    name_bn: 'গোয়াইনঘাট',
    code: 'GOWAINGHAT_UPZ',
    latitude: 25.056,
    longitude: 91.971,
    exposure_level: 'VERY_HIGH',
    population_estimate: 287000,
    geohash7: 'wh1rp6w',
    source_name: 'SYNTHETIC_SYLHET_FIXTURE',
    is_synthetic: 1
  },
  {
    id: '22222222-2222-2222-2222-222222222209',
    parent_id: '22222222-2222-2222-2222-222222222207',
    area_type: 'VILLAGE',
    name_en: 'Rustampur',
    name_bn: 'রুস্তমপুর',
    code: 'RUSTAMPUR_VIL',
    latitude: 25.092,
    longitude: 91.785,
    exposure_level: 'VERY_HIGH',
    population_estimate: 6800,
    geohash7: 'wh1quuk',
    source_name: 'SYNTHETIC_SYLHET_FIXTURE',
    is_synthetic: 1
  }
];

const GAUGES = [
  {
    id: '33333333-3333-3333-3333-333333333301',
    code: 'MUHURI_PARSHURAM',
    name: 'Muhuri River at Parshuram',
    area_id: '22222222-2222-2222-2222-222222222202',
    river_name: 'Muhuri',
    warning_level_m: 12.05,
    danger_level_m: 13.0,
    source_name: 'BWDB_SYNTHETIC',
    is_active: 1
  },
  {
    id: '33333333-3333-3333-3333-333333333302',
    code: 'SURMA_SYLHET',
    name: 'Surma River at Sylhet Point',
    area_id: '22222222-2222-2222-2222-222222222207',
    river_name: 'Surma',
    warning_level_m: 10.80,
    danger_level_m: 11.25,
    source_name: 'BWDB_SYNTHETIC',
    is_active: 1
  },
  {
    id: '33333333-3333-3333-3333-333333333303',
    code: 'KUSHIYARA_SHEOLA',
    name: 'Kushiyara River at Sheola',
    area_id: '22222222-2222-2222-2222-222222222208',
    river_name: 'Kushiyara',
    warning_level_m: 12.50,
    danger_level_m: 13.05,
    source_name: 'BWDB_SYNTHETIC',
    is_active: 1
  }
];

const SHELTERS = [
  {
    id: '66666666-6666-6666-6666-666666666601',
    area_id: '22222222-2222-2222-2222-222222222202',
    name_en: 'Parshuram Govt Model High School Shelter',
    name_bn: 'পরশুরাম সরকারি মডেল উচ্চ বিদ্যালয় আশ্রয়কেন্দ্র',
    latitude: 23.235,
    longitude: 91.438,
    capacity_estimate: 450,
    status: 'OPEN',
    access_notes: 'Road dry on west entrance, high-ground building.',
    source_kind: 'SYNTHETIC',
    is_synthetic: 1
  },
  {
    id: '66666666-6666-6666-6666-666666666602',
    area_id: '22222222-2222-2222-2222-222222222203',
    name_en: 'Fulgazi Pilot Girls School Shelter',
    name_bn: 'ফুলগাজী পাইলট বালিকা উচ্চ বিদ্যালয় আশ্রয়কেন্দ্র',
    latitude: 23.163,
    longitude: 91.418,
    capacity_estimate: 350,
    status: 'OPEN',
    access_notes: 'Equipped with solar emergency power backup.',
    source_kind: 'SYNTHETIC',
    is_synthetic: 1
  },
  {
    id: '66666666-6666-6666-6666-666666666603',
    area_id: '22222222-2222-2222-2222-222222222207',
    name_en: 'Companiganj BNSB High School Shelter',
    name_bn: 'কোম্পানীগঞ্জ বিএনএসবি উচ্চ বিদ্যালয় আশ্রয়কেন্দ্র',
    latitude: 25.082,
    longitude: 91.754,
    capacity_estimate: 600,
    status: 'OPEN',
    access_notes: 'Elevated multi-story concrete structure with dry boat dock.',
    source_kind: 'SYNTHETIC',
    is_synthetic: 1
  },
  {
    id: '66666666-6666-6666-6666-666666666604',
    area_id: '22222222-2222-2222-2222-222222222208',
    name_en: 'Gowainghat Degree College Shelter',
    name_bn: 'গোয়াইনঘাট ডিগ্রি কলেজ আশ্রয়কেন্দ্র',
    latitude: 25.058,
    longitude: 91.973,
    capacity_estimate: 500,
    status: 'OPEN',
    access_notes: 'Emergency water filtration plant operational.',
    source_kind: 'SYNTHETIC',
    is_synthetic: 1
  }
];

const ASSETS = [
  {
    id: '77777777-7777-7777-7777-777777777701',
    event_id: '11111111-1111-1111-1111-111111111103',
    name: 'Engine Boat Red Crescent Unit 1',
    asset_type: 'BOAT',
    area_id: '22222222-2222-2222-2222-222222222202',
    latitude: 23.23,
    longitude: 91.435,
    availability_status: 'AVAILABLE',
    capacity_people: 12,
    water_suitability: 'SHALLOW_DRAFT',
    capability_flags: JSON.stringify({ nightNavigation: true, medicalKit: true }),
    updated_by: '00000000-0000-0000-0000-000000000001',
    is_synthetic: 1
  },
  {
    id: '77777777-7777-7777-7777-777777777702',
    event_id: '11111111-1111-1111-1111-111111111103',
    name: 'Fire Service Inflatable Boat 2',
    asset_type: 'BOAT',
    area_id: '22222222-2222-2222-2222-222222222203',
    latitude: 23.165,
    longitude: 91.42,
    availability_status: 'AVAILABLE',
    capacity_people: 8,
    water_suitability: 'SWIFT_WATER',
    capability_flags: JSON.stringify({ lifeJacketsCount: 15, trainedDivers: true }),
    updated_by: '00000000-0000-0000-0000-000000000001',
    is_synthetic: 1
  },
  {
    id: '77777777-7777-7777-7777-777777777703',
    event_id: '11111111-1111-1111-1111-111111111103',
    name: 'Sylhet Red Crescent Speed Boat Unit',
    asset_type: 'BOAT',
    area_id: '22222222-2222-2222-2222-222222222207',
    latitude: 25.081,
    longitude: 91.751,
    availability_status: 'AVAILABLE',
    capacity_people: 15,
    water_suitability: 'SHALLOW_DRAFT',
    capability_flags: JSON.stringify({ nightNavigation: true, medicalKit: true, satComm: true }),
    updated_by: '00000000-0000-0000-0000-000000000001',
    is_synthetic: 1
  },
  {
    id: '77777777-7777-7777-7777-777777777704',
    event_id: '11111111-1111-1111-1111-111111111103',
    name: 'Companiganj Fire Service Rescue Craft',
    asset_type: 'BOAT',
    area_id: '22222222-2222-2222-2222-222222222207',
    latitude: 25.083,
    longitude: 91.756,
    availability_status: 'AVAILABLE',
    capacity_people: 10,
    water_suitability: 'SWIFT_WATER',
    capability_flags: JSON.stringify({ lifeJacketsCount: 20, trainedDivers: true }),
    updated_by: '00000000-0000-0000-0000-000000000001',
    is_synthetic: 1
  }
];

const WARNINGS = [
  {
    id: '88888888-8888-8888-8888-888888888801',
    event_id: '11111111-1111-1111-1111-111111111103',
    area_id: '22222222-2222-2222-2222-222222222202',
    body_bn: 'জরুরি বন্যা সতর্কতা: মুহুরী নদীর পানি বিপদসীমার ০.৮৫ মি উপরে প্রবাহিত হচ্ছে। পরশুরাম ও ফুলগাজীর নিচু এলাকার বাসিন্দারা দ্রুত নিকটস্থ সাইক্লোন শেল্টারে আশ্রয় নিন।',
    body_en: 'Emergency Flood Alert: Muhuri river is 0.85m above danger level. Residents of low-lying areas in Parshuram & Fulgazi are advised to move to nearest shelters.',
    state: 'APPROVED',
    created_by: '00000000-0000-0000-0000-000000000002',
    approved_by: '00000000-0000-0000-0000-000000000002',
    approved_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    approval_note: 'Approved by Deputy Commissioner for multi-channel loudspeaker & mobile alert broadcast.',
    delivery_simulation: JSON.stringify({ cellBroadcast: true, loudspeakerUnits: 4, smsGateway: 'simulated' }),
    created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
  },
  {
    id: '88888888-8888-8888-8888-888888888802',
    event_id: '11111111-1111-1111-1111-111111111106',
    area_id: '22222222-2222-2222-2222-222222222207',
    body_bn: 'সুরমা নদী সতর্কতা: কোম্পানীগঞ্জ ও গোয়াইনঘাট এলাকায় পাহাড়ি ঢলের পানি প্রবেশ করছে। আশ্রয়কেন্দ্রে অবস্থান নিশ্চিত করুন।',
    body_en: 'Surma River Alert: Inundation detected in Companiganj and Gowainghat. Proceed to designated safety centers.',
    state: 'DRAFT',
    created_by: '00000000-0000-0000-0000-000000000002',
    approved_by: null,
    approved_at: null,
    approval_note: null,
    delivery_simulation: null,
    created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
  }
];

async function seed() {
  console.log('Connecting to TiDB Cloud...');
  const conn = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
    port: Number(process.env.MYSQL_PORT) || 4000,
    user: process.env.MYSQL_USER || 'oiAE5AqrJrB3NYt.root',
    password: process.env.MYSQL_PASSWORD || 'KOhmlcUBBu33wjqd',
    database: process.env.MYSQL_DATABASE || 'aali_ai',
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
  });

  console.log('Connected! Disabling FK checks during seed...');
  await conn.query('SET FOREIGN_KEY_CHECKS = 0');

  // 1. Users
  for (const u of USERS) {
    await conn.execute(
      `INSERT INTO users (id, username, password_hash, display_name, role, is_active)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), display_name = VALUES(display_name), role = VALUES(role), is_active = VALUES(is_active)`,
      [u.id, u.username, u.password_hash, u.display_name, u.role, u.is_active]
    );
  }
  console.log(`Seeded ${USERS.length} users`);

  // 2. Resident accounts
  for (const r of RESIDENT_ACCOUNTS) {
    await conn.execute(
      `INSERT INTO resident_accounts (id, nid_hash, nid_last4, display_name, phone_redacted)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE display_name = VALUES(display_name), phone_redacted = VALUES(phone_redacted)`,
      [r.id, r.nid_hash, r.nid_last4, r.display_name, r.phone_redacted]
    );
  }
  console.log(`Seeded ${RESIDENT_ACCOUNTS.length} resident accounts`);

  // 3. Flood events
  for (const e of FLOOD_EVENTS) {
    await conn.execute(
      `INSERT INTO flood_events (id, name, region_code, start_at, end_at, status, mode, provenance_note, is_reconstructed)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), region_code = VALUES(region_code), status = VALUES(status), mode = VALUES(mode)`,
      [e.id, e.name, e.region_code, e.start_at, e.end_at, e.status, e.mode, e.provenance_note, e.is_reconstructed]
    );
  }
  console.log(`Seeded ${FLOOD_EVENTS.length} flood events`);

  // 4. Areas
  for (const a of AREAS) {
    await conn.execute(
      `INSERT INTO areas (id, parent_id, area_type, name_en, name_bn, code, latitude, longitude, exposure_level, population_estimate, geohash7, source_name, is_synthetic)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name_en = VALUES(name_en), name_bn = VALUES(name_bn), latitude = VALUES(latitude), longitude = VALUES(longitude)`,
      [a.id, a.parent_id, a.area_type, a.name_en, a.name_bn, a.code, a.latitude, a.longitude, a.exposure_level, a.population_estimate, a.geohash7, a.source_name, a.is_synthetic]
    );
  }
  console.log(`Seeded ${AREAS.length} areas`);

  // 5. Gauges
  for (const g of GAUGES) {
    await conn.execute(
      `INSERT INTO gauges (id, code, name, area_id, river_name, warning_level_m, danger_level_m, source_name, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), river_name = VALUES(river_name), warning_level_m = VALUES(warning_level_m), danger_level_m = VALUES(danger_level_m)`,
      [g.id, g.code, g.name, g.area_id, g.river_name, g.warning_level_m, g.danger_level_m, g.source_name, g.is_active]
    );
  }
  console.log(`Seeded ${GAUGES.length} gauges`);

  // 6. Shelters
  for (const s of SHELTERS) {
    await conn.execute(
      `INSERT INTO shelters (id, area_id, name_en, name_bn, latitude, longitude, capacity_estimate, status, access_notes, source_kind, is_synthetic)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name_en = VALUES(name_en), name_bn = VALUES(name_bn), capacity_estimate = VALUES(capacity_estimate), status = VALUES(status)`,
      [s.id, s.area_id, s.name_en, s.name_bn, s.latitude, s.longitude, s.capacity_estimate, s.status, s.access_notes, s.source_kind, s.is_synthetic]
    );
  }
  console.log(`Seeded ${SHELTERS.length} shelters`);

  // 7. Assets
  for (const ast of ASSETS) {
    await conn.execute(
      `INSERT INTO assets (id, event_id, name, asset_type, area_id, latitude, longitude, availability_status, capacity_people, water_suitability, capability_flags, updated_by, is_synthetic)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), availability_status = VALUES(availability_status), capacity_people = VALUES(capacity_people)`,
      [ast.id, ast.event_id, ast.name, ast.asset_type, ast.area_id, ast.latitude, ast.longitude, ast.availability_status, ast.capacity_people, ast.water_suitability, ast.capability_flags, ast.updated_by, ast.is_synthetic]
    );
  }
  console.log(`Seeded ${ASSETS.length} assets`);

  // 8. Warnings
  for (const w of WARNINGS) {
    await conn.execute(
      `INSERT INTO warnings (id, event_id, area_id, body_bn, body_en, state, created_by, approved_by, approved_at, approval_note, delivery_simulation, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE state = VALUES(state), body_bn = VALUES(body_bn)`,
      [w.id, w.event_id, w.area_id, w.body_bn, w.body_en, w.state, w.created_by, w.approved_by, w.approved_at, w.approval_note, w.delivery_simulation, w.created_at]
    );
  }
  console.log(`Seeded ${WARNINGS.length} warnings`);

  // 9. Default brain controls
  await conn.execute(
    `INSERT INTO brain_controls (scope, paused, actor_id, reason, updated_at)
     VALUES ('global', 0, '00000000-0000-0000-0000-000000000001', 'Initial seeding default unpaused', NOW())
     ON DUPLICATE KEY UPDATE paused = 0`
  );
  console.log('Seeded brain controls');

  await conn.query('SET FOREIGN_KEY_CHECKS = 1');
  await conn.end();
  console.log('Seeding finished successfully!');
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
