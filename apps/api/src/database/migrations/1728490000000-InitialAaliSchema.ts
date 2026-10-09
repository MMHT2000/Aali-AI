import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialAaliSchema1728490000000 implements MigrationInterface {
  name = 'InitialAaliSchema1728490000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. users
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` varchar(36) NOT NULL,
        \`username\` varchar(100) NOT NULL,
        \`password_hash\` varchar(255) NOT NULL,
        \`display_name\` varchar(150) NOT NULL,
        \`role\` varchar(50) NOT NULL DEFAULT 'VIEWER',
        \`is_active\` tinyint(1) NOT NULL DEFAULT 1,
        \`last_login_at\` datetime NULL,
        \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_users_username\` (\`username\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. flood_events
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`flood_events\` (
        \`id\` varchar(36) NOT NULL,
        \`name\` varchar(150) NOT NULL,
        \`region_code\` varchar(50) NOT NULL DEFAULT 'FENI',
        \`start_at\` datetime NOT NULL,
        \`end_at\` datetime NULL,
        \`status\` varchar(50) NOT NULL DEFAULT 'ACTIVE',
        \`mode\` varchar(50) NOT NULL DEFAULT 'DEMO',
        \`provenance_note\` text NULL,
        \`is_reconstructed\` tinyint(1) NOT NULL DEFAULT 0,
        \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`created_by\` varchar(36) NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. areas
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`areas\` (
        \`id\` varchar(36) NOT NULL,
        \`parent_id\` varchar(36) NULL,
        \`area_type\` varchar(50) NOT NULL DEFAULT 'VILLAGE',
        \`name_en\` varchar(150) NOT NULL,
        \`name_bn\` varchar(150) NOT NULL,
        \`code\` varchar(50) NOT NULL,
        \`latitude\` decimal(10,7) NULL,
        \`longitude\` decimal(10,7) NULL,
        \`exposure_level\` varchar(50) NOT NULL DEFAULT 'MEDIUM',
        \`population_estimate\` int NULL,
        \`geohash7\` varchar(12) NULL,
        \`source_name\` varchar(100) NOT NULL DEFAULT 'SYNTHETIC_FENI_FIXTURE',
        \`source_url\` varchar(255) NULL,
        \`source_updated_at\` datetime NULL,
        \`is_synthetic\` tinyint(1) NOT NULL DEFAULT 1,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_areas_code\` (\`code\`),
        KEY \`IDX_areas_parent_id\` (\`parent_id\`),
        KEY \`IDX_areas_geohash7\` (\`geohash7\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. gauges & observations
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`gauges\` (
        \`id\` varchar(36) NOT NULL,
        \`code\` varchar(50) NOT NULL,
        \`name\` varchar(150) NOT NULL,
        \`area_id\` varchar(36) NULL,
        \`river_name\` varchar(100) NOT NULL,
        \`warning_level_m\` decimal(6,2) NOT NULL,
        \`danger_level_m\` decimal(6,2) NOT NULL,
        \`source_name\` varchar(100) NOT NULL DEFAULT 'BWDB_SYNTHETIC',
        \`is_active\` tinyint(1) NOT NULL DEFAULT 1,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_gauges_code\` (\`code\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`gauge_observations\` (
        \`id\` varchar(36) NOT NULL,
        \`gauge_id\` varchar(36) NOT NULL,
        \`event_id\` varchar(36) NOT NULL,
        \`observed_at\` datetime NOT NULL,
        \`level_m\` decimal(6,2) NOT NULL,
        \`rise_3h_cm\` decimal(6,2) NULL,
        \`source_kind\` varchar(50) NOT NULL DEFAULT 'AUTOMATED_TELEMETRY',
        \`quality_status\` varchar(50) NOT NULL DEFAULT 'VERIFIED',
        \`provenance\` text NULL,
        \`is_reconstructed\` tinyint(1) NOT NULL DEFAULT 0,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_gauge_obs_gauge_time\` (\`gauge_id\`, \`observed_at\`),
        KEY \`IDX_gauge_obs_event_time\` (\`event_id\`, \`observed_at\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`rainfall_observations\` (
        \`id\` varchar(36) NOT NULL,
        \`event_id\` varchar(36) NOT NULL,
        \`area_id\` varchar(36) NULL,
        \`observed_at\` datetime NOT NULL,
        \`rainfall_mm\` decimal(6,2) NOT NULL,
        \`window_minutes\` int NOT NULL DEFAULT 180,
        \`source_kind\` varchar(50) NOT NULL DEFAULT 'SATELLITE_GSMaP',
        \`provenance\` text NULL,
        \`is_reconstructed\` tinyint(1) NOT NULL DEFAULT 0,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_rainfall_event_time\` (\`event_id\`, \`observed_at\`),
        KEY \`IDX_rainfall_area_time\` (\`area_id\`, \`observed_at\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`volunteer_readings\` (
        \`id\` varchar(36) NOT NULL,
        \`event_id\` varchar(36) NOT NULL,
        \`area_id\` varchar(36) NULL,
        \`gauge_id\` varchar(36) NULL,
        \`submitted_by\` varchar(36) NOT NULL,
        \`observed_at\` datetime NOT NULL,
        \`level_m\` decimal(6,2) NULL,
        \`raw_message\` text NULL,
        \`parse_status\` varchar(50) NOT NULL DEFAULT 'PARSED',
        \`source_kind\` varchar(50) NOT NULL DEFAULT 'SMS_VOLUNTEER',
        \`provenance\` text NULL,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_volunteer_readings_time\` (\`observed_at\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 5. shelters
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`shelters\` (
        \`id\` varchar(36) NOT NULL,
        \`area_id\` varchar(36) NULL,
        \`name_en\` varchar(150) NOT NULL,
        \`name_bn\` varchar(150) NOT NULL,
        \`latitude\` decimal(10,7) NOT NULL,
        \`longitude\` decimal(10,7) NOT NULL,
        \`capacity_estimate\` int NULL,
        \`status\` varchar(50) NOT NULL DEFAULT 'OPEN',
        \`access_notes\` text NULL,
        \`source_kind\` varchar(50) NOT NULL DEFAULT 'SYNTHETIC',
        \`is_synthetic\` tinyint(1) NOT NULL DEFAULT 1,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_shelters_area_id\` (\`area_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 6. sos_reports & gateway_messages
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`sos_reports\` (
        \`id\` varchar(36) NOT NULL,
        \`client_report_id\` varchar(100) NOT NULL,
        \`event_id\` varchar(36) NULL,
        \`area_id\` varchar(36) NULL,
        \`source_user_id\` varchar(36) NULL,
        \`source_type\` varchar(50) NOT NULL DEFAULT 'NEW_USER',
        \`people_count\` int NOT NULL DEFAULT 1,
        \`elderly_count\` int NULL,
        \`has_child\` tinyint(1) NOT NULL DEFAULT 0,
        \`has_medical_need\` tinyint(1) NOT NULL DEFAULT 0,
        \`is_trapped\` tinyint(1) NOT NULL DEFAULT 0,
        \`location_lat\` decimal(10,7) NULL,
        \`location_lng\` decimal(10,7) NULL,
        \`geohash7\` varchar(12) NULL,
        \`message_original\` text NULL,
        \`message_language\` varchar(10) NULL,
        \`extracted_fields\` json NULL,
        \`field_confidence\` json NULL,
        \`packet_version\` varchar(10) NOT NULL DEFAULT '1',
        \`packet_checksum\` varchar(16) NULL,
        \`packet_short_id\` varchar(32) NULL,
        \`reported_at\` datetime NOT NULL,
        \`received_at\` datetime NOT NULL,
        \`last_seen_at\` datetime NULL,
        \`transport_kind\` varchar(50) NOT NULL DEFAULT 'APP_DIRECT',
        \`transport_status\` varchar(50) NOT NULL DEFAULT 'DELIVERED',
        \`parse_status\` varchar(50) NOT NULL DEFAULT 'VALID',
        \`review_status\` varchar(50) NOT NULL DEFAULT 'TRIAGED',
        \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_sos_client_report_id\` (\`client_report_id\`),
        KEY \`IDX_sos_event_time\` (\`event_id\`, \`reported_at\`),
        KEY \`IDX_sos_geohash_time\` (\`geohash7\`, \`reported_at\`),
        KEY \`IDX_sos_area_time\` (\`area_id\`, \`reported_at\`),
        KEY \`IDX_sos_checksum\` (\`packet_checksum\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`gateway_messages\` (
        \`id\` varchar(36) NOT NULL,
        \`gateway_kind\` varchar(50) NOT NULL DEFAULT 'SIMULATED_CARRIER',
        \`simulation\` tinyint(1) NOT NULL DEFAULT 1,
        \`packet_raw\` text NOT NULL,
        \`packet_checksum\` varchar(16) NOT NULL,
        \`sender_ref_hash\` varchar(64) NULL,
        \`received_at\` datetime NOT NULL,
        \`processed_at\` datetime NULL,
        \`processing_status\` varchar(50) NOT NULL DEFAULT 'PROCESSED',
        \`failure_reason\` text NULL,
        \`sos_report_id\` varchar(36) NULL,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_gateway_checksum\` (\`packet_checksum\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 7. incidents & duplicates
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`incidents\` (
        \`id\` varchar(36) NOT NULL,
        \`event_id\` varchar(36) NULL,
        \`area_id\` varchar(36) NULL,
        \`status\` varchar(50) NOT NULL DEFAULT 'OPEN',
        \`priority\` decimal(5,2) NOT NULL DEFAULT 0,
        \`confidence_score\` decimal(4,3) NOT NULL DEFAULT 0.400,
        \`confidence_breakdown\` json NULL,
        \`summary\` text NULL,
        \`opened_at\` datetime NOT NULL,
        \`last_updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`closed_at\` datetime NULL,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_incidents_status\` (\`status\`),
        KEY \`IDX_incidents_event\` (\`event_id\`),
        KEY \`IDX_incidents_area\` (\`area_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`incident_reports\` (
        \`id\` varchar(36) NOT NULL,
        \`incident_id\` varchar(36) NOT NULL,
        \`sos_report_id\` varchar(36) NOT NULL,
        \`linked_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`linked_by\` varchar(36) NULL,
        \`link_reason\` varchar(100) NOT NULL DEFAULT 'PRIMARY',
        \`is_primary\` tinyint(1) NOT NULL DEFAULT 1,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_incident_reports_sos\` (\`sos_report_id\`),
        KEY \`IDX_incident_reports_incident\` (\`incident_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`duplicate_candidates\` (
        \`id\` varchar(36) NOT NULL,
        \`event_id\` varchar(36) NULL,
        \`left_report_id\` varchar(36) NOT NULL,
        \`right_report_id\` varchar(36) NOT NULL,
        \`text_similarity\` decimal(4,3) NULL,
        \`spatial_match\` tinyint(1) NOT NULL DEFAULT 0,
        \`time_delta_seconds\` int NOT NULL DEFAULT 0,
        \`people_count_match\` tinyint(1) NOT NULL DEFAULT 0,
        \`score\` decimal(4,3) NOT NULL DEFAULT 0,
        \`reason_codes\` json NULL,
        \`status\` varchar(50) NOT NULL DEFAULT 'PENDING',
        \`reviewed_by\` varchar(36) NULL,
        \`reviewed_at\` datetime NULL,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_dup_left\` (\`left_report_id\`),
        KEY \`IDX_dup_right\` (\`right_report_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 8. assets & dispatch suggestions
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`assets\` (
        \`id\` varchar(36) NOT NULL,
        \`event_id\` varchar(36) NULL,
        \`name\` varchar(150) NOT NULL,
        \`asset_type\` varchar(50) NOT NULL DEFAULT 'BOAT',
        \`area_id\` varchar(36) NULL,
        \`latitude\` decimal(10,7) NULL,
        \`longitude\` decimal(10,7) NULL,
        \`availability_status\` varchar(50) NOT NULL DEFAULT 'AVAILABLE',
        \`capacity_people\` int NULL,
        \`water_suitability\` varchar(50) NOT NULL DEFAULT 'SHALLOW_DRAFT',
        \`capability_flags\` json NULL,
        \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`updated_by\` varchar(36) NULL,
        \`is_synthetic\` tinyint(1) NOT NULL DEFAULT 1,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_assets_area\` (\`area_id\`),
        KEY \`IDX_assets_status\` (\`availability_status\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`dispatch_suggestions\` (
        \`id\` varchar(36) NOT NULL,
        \`incident_id\` varchar(36) NOT NULL,
        \`asset_id\` varchar(36) NOT NULL,
        \`priority_score\` decimal(5,3) NOT NULL,
        \`factor_breakdown\` json NOT NULL,
        \`suggested_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`status\` varchar(50) NOT NULL DEFAULT 'SUGGESTED',
        \`reviewed_by\` varchar(36) NULL,
        \`reviewed_at\` datetime NULL,
        \`review_reason\` text NULL,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_dispatch_incident\` (\`incident_id\`),
        KEY \`IDX_dispatch_asset\` (\`asset_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 9. alert_evaluations & warnings
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`alert_evaluations\` (
        \`id\` varchar(36) NOT NULL,
        \`event_id\` varchar(36) NULL,
        \`area_id\` varchar(36) NULL,
        \`evaluated_at\` datetime NOT NULL,
        \`computed_level\` varchar(50) NOT NULL DEFAULT 'NORMAL',
        \`signal_values\` json NOT NULL,
        \`reason_codes\` json NOT NULL,
        \`source_ages\` json NOT NULL,
        \`config_version\` varchar(20) NOT NULL DEFAULT '1.0',
        \`is_reconstructed\` tinyint(1) NOT NULL DEFAULT 0,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_eval_event\` (\`event_id\`),
        KEY \`IDX_eval_area\` (\`area_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`warnings\` (
        \`id\` varchar(36) NOT NULL,
        \`event_id\` varchar(36) NULL,
        \`area_id\` varchar(36) NULL,
        \`alert_evaluation_id\` varchar(36) NULL,
        \`body_bn\` text NOT NULL,
        \`body_en\` text NULL,
        \`state\` varchar(50) NOT NULL DEFAULT 'DRAFT',
        \`created_by\` varchar(36) NOT NULL,
        \`approved_by\` varchar(36) NULL,
        \`approved_at\` datetime NULL,
        \`approval_note\` text NULL,
        \`delivery_simulation\` json NULL,
        \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_warnings_state\` (\`state\`),
        KEY \`IDX_warnings_event\` (\`event_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 10. recovery_reports & aid_deliveries
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`recovery_reports\` (
        \`id\` varchar(36) NOT NULL,
        \`event_id\` varchar(36) NULL,
        \`area_id\` varchar(36) NOT NULL,
        \`report_type\` varchar(50) NOT NULL DEFAULT 'DAMAGE_AND_NEEDS',
        \`damage_level\` varchar(50) NULL,
        \`tube_well_status\` varchar(50) NULL,
        \`crop_loss_level\` varchar(50) NULL,
        \`pond_loss_level\` varchar(50) NULL,
        \`road_passability\` varchar(50) NULL,
        \`need_water\` tinyint(1) NOT NULL DEFAULT 0,
        \`need_medicine\` tinyint(1) NOT NULL DEFAULT 0,
        \`need_food\` tinyint(1) NOT NULL DEFAULT 0,
        \`needs_json\` json NULL,
        \`evidence_note\` text NULL,
        \`source_kind\` varchar(50) NOT NULL DEFAULT 'COORDINATOR_ASSESSMENT',
        \`reported_at\` datetime NOT NULL,
        \`reported_by\` varchar(36) NOT NULL,
        \`status\` varchar(50) NOT NULL DEFAULT 'SUBMITTED',
        PRIMARY KEY (\`id\`),
        KEY \`IDX_recovery_area\` (\`area_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`aid_deliveries\` (
        \`id\` varchar(36) NOT NULL,
        \`event_id\` varchar(36) NULL,
        \`area_id\` varchar(36) NOT NULL,
        \`organization_label\` varchar(150) NOT NULL,
        \`item_code\` varchar(50) NOT NULL,
        \`quantity\` decimal(10,2) NOT NULL,
        \`unit\` varchar(30) NOT NULL,
        \`delivered_at\` datetime NOT NULL,
        \`recorded_by\` varchar(36) NOT NULL,
        \`source_reference\` varchar(150) NULL,
        \`receipt_note\` text NULL,
        \`idempotency_key\` varchar(100) NOT NULL,
        \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_aid_idempotency\` (\`idempotency_key\`),
        KEY \`IDX_aid_area\` (\`area_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 11. audit_logs
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`audit_logs\` (
        \`id\` varchar(36) NOT NULL,
        \`actor_user_id\` varchar(36) NULL,
        \`action\` varchar(100) NOT NULL,
        \`entity_type\` varchar(100) NOT NULL,
        \`entity_id\` varchar(36) NOT NULL,
        \`occurred_at\` datetime NOT NULL,
        \`reason\` text NULL,
        \`before_summary\` json NULL,
        \`after_summary\` json NULL,
        \`request_id\` varchar(100) NULL,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_audit_time\` (\`occurred_at\`),
        KEY \`IDX_audit_actor\` (\`actor_user_id\`),
        KEY \`IDX_audit_entity\` (\`entity_type\`, \`entity_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS \`audit_logs\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`aid_deliveries\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`recovery_reports\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`warnings\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`alert_evaluations\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`dispatch_suggestions\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`assets\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`duplicate_candidates\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`incident_reports\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`incidents\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`gateway_messages\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`sos_reports\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`shelters\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`volunteer_readings\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`rainfall_observations\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`gauge_observations\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`gauges\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`areas\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`flood_events\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`users\``);
  }
}

