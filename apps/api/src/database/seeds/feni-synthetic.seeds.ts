import { Area, AreaType } from '../../modules/areas/entities/area.entity';
import { Asset, AssetType } from '../../modules/assets/entities/asset.entity';
import { FloodEvent, FloodEventMode } from '../../modules/flood-events/entities/flood-event.entity';
import { Gauge, GaugeObservation } from '../../modules/gauges/entities/gauge.entity';
import { RainfallObservation, VolunteerReading } from '../../modules/gauges/entities/observation.entity';
import { Shelter } from '../../modules/shelters/entities/shelter.entity';
import { User } from '../../modules/users/entities/user.entity';
import { UserRole } from '../../modules/users/entities/user-role.enum';

export interface SeedData {
  users: Partial<User>[];
  floodEvents: Partial<FloodEvent>[];
  areas: Partial<Area>[];
  gauges: Partial<Gauge>[];
  gaugeObservations: Partial<GaugeObservation>[];
  rainfallObservations: Partial<RainfallObservation>[];
  volunteerReadings: Partial<VolunteerReading>[];
  shelters: Partial<Shelter>[];
  assets: Partial<Asset>[];
}

export const SYNTHETIC_FENI_SEEDS: SeedData = {
  users: [
    {
      id: '00000000-0000-0000-0000-000000000001',
      username: 'admin',
      password_hash: '$2b$10$wK1W.Q9PZtYQv48xQ1fFGe1N4P4V3d8a8JtE9B9j9.zG1C4X/eXKy', // hashed 'Admin123!'
      display_name: 'Feni District Admin',
      role: UserRole.ADMIN,
      is_active: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      username: 'authority_dc',
      password_hash: '$2b$10$wK1W.Q9PZtYQv48xQ1fFGe1N4P4V3d8a8JtE9B9j9.zG1C4X/eXKy', // hashed 'Admin123!'
      display_name: 'Deputy Commissioner (Authority)',
      role: UserRole.AUTHORITY,
      is_active: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      username: 'responder_feni',
      password_hash: '$2b$10$wK1W.Q9PZtYQv48xQ1fFGe1N4P4V3d8a8JtE9B9j9.zG1C4X/eXKy', // hashed 'Admin123!'
      display_name: 'Parshuram Boat Unit',
      role: UserRole.RESPONDER,
      is_active: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000004',
      username: 'volunteer_parshuram',
      password_hash: '$2b$10$wK1W.Q9PZtYQv48xQ1fFGe1N4P4V3d8a8JtE9B9j9.zG1C4X/eXKy', // hashed 'Admin123!'
      display_name: 'CPP Volunteer Rahim',
      role: UserRole.VOLUNTEER,
      is_active: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000005',
      username: 'recovery_coord',
      password_hash: '$2b$10$wK1W.Q9PZtYQv48xQ1fFGe1N4P4V3d8a8JtE9B9j9.zG1C4X/eXKy', // hashed 'Admin123!'
      display_name: 'Red Crescent Recovery Officer',
      role: UserRole.RECOVERY_COORDINATOR,
      is_active: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000006',
      username: 'viewer_guest',
      password_hash: '$2b$10$wK1W.Q9PZtYQv48xQ1fFGe1N4P4V3d8a8JtE9B9j9.zG1C4X/eXKy', // hashed 'Admin123!'
      display_name: 'Observer / Public Viewer',
      role: UserRole.VIEWER,
      is_active: true,
    },
  ],

  floodEvents: [
    {
      id: '11111111-1111-1111-1111-111111111101',
      name: 'Feni Flash Flood August 2024 Replay',
      region_code: 'FENI',
      start_at: new Date('2024-08-19T00:00:00Z'),
      end_at: new Date('2024-08-24T23:59:59Z'),
      status: 'REPLAY',
      mode: FloodEventMode.REPLAY,
      provenance_note: 'Historical reconstruction of August 2024 Feni flood from published BWDB reports.',
      is_reconstructed: true,
    },
    {
      id: '11111111-1111-1111-1111-111111111102',
      name: 'Feni Monsoonal Surge July 2025 Replay',
      region_code: 'FENI',
      start_at: new Date('2025-07-20T00:00:00Z'),
      end_at: new Date('2025-07-22T23:59:59Z'),
      status: 'REPLAY',
      mode: FloodEventMode.REPLAY,
      provenance_note: 'Reconstructed scenario for July 2025 surge with gauge anomalies.',
      is_reconstructed: true,
    },
    {
      id: '11111111-1111-1111-1111-111111111103',
      name: 'Active Demo Exercise 2026',
      region_code: 'FENI',
      start_at: new Date('2026-10-09T00:00:00Z'),
      end_at: null,
      status: 'ACTIVE',
      mode: FloodEventMode.DEMO,
      provenance_note: 'Live demonstration synthetic scenario.',
      is_reconstructed: false,
    },
  ],

  areas: [
    {
      id: '22222222-2222-2222-2222-222222222201',
      parent_id: null,
      area_type: AreaType.DISTRICT,
      name_en: 'Feni District',
      name_bn: 'ফেনী জেলা',
      code: 'FENI_DIST',
      latitude: 23.0159,
      longitude: 91.3976,
      exposure_level: 'HIGH',
      population_estimate: 1437371,
      geohash7: 'wh0w7g1',
      source_name: 'SYNTHETIC_FENI_FIXTURE',
      is_synthetic: true,
    },
    {
      id: '22222222-2222-2222-2222-222222222202',
      parent_id: '22222222-2222-2222-2222-222222222201',
      area_type: AreaType.UPAZILA,
      name_en: 'Parshuram',
      name_bn: 'পরশুরাম',
      code: 'PARSHURAM_UPZ',
      latitude: 23.2325,
      longitude: 91.4361,
      exposure_level: 'VERY_HIGH',
      population_estimate: 101000,
      geohash7: 'wh0xs6m',
      source_name: 'SYNTHETIC_FENI_FIXTURE',
      is_synthetic: true,
    },
    {
      id: '22222222-2222-2222-2222-222222222203',
      parent_id: '22222222-2222-2222-2222-222222222201',
      area_type: AreaType.UPAZILA,
      name_en: 'Fulgazi',
      name_bn: 'ফুলগাজী',
      code: 'FULGAZI_UPZ',
      latitude: 23.1611,
      longitude: 91.4167,
      exposure_level: 'VERY_HIGH',
      population_estimate: 119000,
      geohash7: 'wh0wz8s',
      source_name: 'SYNTHETIC_FENI_FIXTURE',
      is_synthetic: true,
    },
    {
      id: '22222222-2222-2222-2222-222222222204',
      parent_id: '22222222-2222-2222-2222-222222222202',
      area_type: AreaType.VILLAGE,
      name_en: 'Mirzanagar',
      name_bn: 'মির্জানগর',
      code: 'MIRZANAGAR_VIL',
      latitude: 23.245,
      longitude: 91.442,
      exposure_level: 'HIGH',
      population_estimate: 4200,
      geohash7: 'wh0xsk0',
      source_name: 'SYNTHETIC_FENI_FIXTURE',
      is_synthetic: true,
    },
    {
      id: '22222222-2222-2222-2222-222222222205',
      parent_id: '22222222-2222-2222-2222-222222222202',
      area_type: AreaType.VILLAGE,
      name_en: 'Chitholia (Silent Candidate)',
      name_bn: 'চিথলিয়া (নীরব গ্রাম)',
      code: 'CHITHOLIA_VIL',
      latitude: 23.218,
      longitude: 91.428,
      exposure_level: 'VERY_HIGH',
      population_estimate: 5100,
      geohash7: 'wh0xs4a',
      source_name: 'SYNTHETIC_FENI_FIXTURE',
      is_synthetic: true,
    },
    // Multi-District Tenant Seeds: Sylhet Surma-Kushiyara Basin
    {
      id: '22222222-2222-2222-2222-222222222206',
      parent_id: null,
      area_type: AreaType.DISTRICT,
      name_en: 'Sylhet District',
      name_bn: 'সিলেট জেলা',
      code: 'SYLHET_DIST',
      latitude: 24.8949,
      longitude: 91.8687,
      exposure_level: 'VERY_HIGH',
      population_estimate: 3857037,
      geohash7: 'wh1p9c1',
      source_name: 'SYNTHETIC_SYLHET_FIXTURE',
      is_synthetic: true,
    },
    {
      id: '22222222-2222-2222-2222-222222222207',
      parent_id: '22222222-2222-2222-2222-222222222206',
      area_type: AreaType.UPAZILA,
      name_en: 'Companiganj',
      name_bn: 'কোম্পানীগঞ্জ',
      code: 'COMPANIGANJ_UPZ',
      latitude: 25.0805,
      longitude: 91.7523,
      exposure_level: 'VERY_HIGH',
      population_estimate: 174000,
      geohash7: 'wh1qu1m',
      source_name: 'SYNTHETIC_SYLHET_FIXTURE',
      is_synthetic: true,
    },
  ],

  gauges: [
    {
      id: '33333333-3333-3333-3333-333333333301',
      code: 'MUHURI_PARSHURAM',
      name: 'Muhuri River at Parshuram',
      area_id: '22222222-2222-2222-2222-222222222202',
      river_name: 'Muhuri',
      warning_level_m: 12.05,
      danger_level_m: 13.0,
      source_name: 'BWDB_SYNTHETIC',
      is_active: true,
    },
  ],

  gaugeObservations: [
    {
      id: '33333333-3333-3333-3333-333333333311',
      gauge_id: '33333333-3333-3333-3333-333333333301',
      event_id: '11111111-1111-1111-1111-111111111103',
      observed_at: new Date('2026-10-09T12:00:00Z'),
      level_m: 12.45,
      rise_3h_cm: 35.0,
      source_kind: 'AUTOMATED_TELEMETRY',
      quality_status: 'VERIFIED',
      provenance: 'Simulated active demo reading',
      is_reconstructed: false,
    },
  ],

  rainfallObservations: [
    {
      id: '44444444-4444-4444-4444-444444444401',
      event_id: '11111111-1111-1111-1111-111111111103',
      area_id: '22222222-2222-2222-2222-222222222202',
      observed_at: new Date('2026-10-09T12:00:00Z'),
      rainfall_mm: 88.5,
      window_minutes: 180,
      source_kind: 'SATELLITE_GSMaP',
      provenance: 'Tripura upper-basin satellite estimate',
      is_reconstructed: false,
    },
  ],

  volunteerReadings: [
    {
      id: '55555555-5555-5555-5555-555555555501',
      event_id: '11111111-1111-1111-1111-111111111103',
      area_id: '22222222-2222-2222-2222-222222222202',
      gauge_id: '33333333-3333-3333-3333-333333333301',
      submitted_by: '00000000-0000-0000-0000-000000000004',
      observed_at: new Date('2026-10-09T12:15:00Z'),
      level_m: 12.5,
      raw_message: 'MUHURI 12.50M STAFF GAUGE WATER RISING FAST',
      parse_status: 'PARSED',
      source_kind: 'SMS_VOLUNTEER',
      provenance: 'CPP staff gauge volunteer observation',
    },
  ],

  shelters: [
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
      is_synthetic: true,
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
      is_synthetic: true,
    },
  ],

  assets: [
    {
      id: '77777777-7777-7777-7777-777777777701',
      event_id: '11111111-1111-1111-1111-111111111103',
      name: 'Engine Boat Red Crescent Unit 1',
      asset_type: AssetType.BOAT,
      area_id: '22222222-2222-2222-2222-222222222202',
      latitude: 23.23,
      longitude: 91.435,
      availability_status: 'AVAILABLE',
      capacity_people: 12,
      water_suitability: 'SHALLOW_DRAFT',
      capability_flags: { nightNavigation: true, medicalKit: true },
      updated_by: '00000000-0000-0000-0000-000000000001',
      is_synthetic: true,
    },
    {
      id: '77777777-7777-7777-7777-777777777702',
      event_id: '11111111-1111-1111-1111-111111111103',
      name: 'Fire Service Inflatable Boat 2',
      asset_type: AssetType.BOAT,
      area_id: '22222222-2222-2222-2222-222222222203',
      latitude: 23.165,
      longitude: 91.42,
      availability_status: 'AVAILABLE',
      capacity_people: 8,
      water_suitability: 'SWIFT_WATER',
      capability_flags: { lifeJacketsCount: 15, trainedDivers: true },
      updated_by: '00000000-0000-0000-0000-000000000001',
      is_synthetic: true,
    },
  ],
};
