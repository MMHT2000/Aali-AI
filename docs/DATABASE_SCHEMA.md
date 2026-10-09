# Database Schema — MySQL / TypeORM

This is the target relational model. Names may be adapted to existing conventions if relationships and guarantees remain intact. Use TypeORM migrations and foreign keys; disable automatic schema synchronization outside ephemeral tests.

## Tables and critical fields

### `users`
- `id` UUID/CHAR(36) primary key
- `username` unique, `password_hash`, `display_name`, `role` enum/string
- `is_active`, `created_at`, `updated_at`, `last_login_at`
- Never seed a real user's account; demo credentials are local only.

### `flood_events`
- `id`, `name`, `region_code`, `start_at`, `end_at`, `status`
- `mode` (`SYNTHETIC`, `REPLAY`, `DEMO`), `provenance_note`, `is_reconstructed`
- `created_at`, `created_by`
- Multiple replays must be independently repeatable and resettable.

### `areas`
- `id`, `parent_id` nullable, `area_type` (district/upazila/union/ward/village), `name_en`, `name_bn`, `code`
- `latitude`, `longitude`, `exposure_level`, `population_estimate` nullable, `geohash7` nullable
- `source_name`, `source_url` nullable, `source_updated_at` nullable, `is_synthetic`
- Unique code where known; index parent and geospatial lookup columns.

### `gauges`, `gauge_observations`
- Gauge: `id`, `code`, `name`, `area_id`, `river_name`, `warning_level_m`, `danger_level_m`, `source_name`, `is_active`
- Observation: `id`, `gauge_id`, `event_id`, `observed_at`, `level_m`, `rise_3h_cm` nullable, `source_kind`, `quality_status`, `provenance`, `is_reconstructed`
- Index `(gauge_id, observed_at)` and `(event_id, observed_at)`.

### `rainfall_observations`
- `id`, `event_id`, `area_id` nullable, `observed_at`, `rainfall_mm`, `window_minutes`, `source_kind`, `provenance`, `is_reconstructed`
- Index event/time and area/time.

### `volunteer_readings`
- `id`, `event_id`, `area_id`, `gauge_id` nullable, `submitted_by`, `observed_at`, `level_m` nullable, `raw_message` nullable, `parse_status`, `source_kind`, `provenance`
- Keep raw message access role-scoped; no phone in general dashboard response.

### `shelters`
- `id`, `area_id`, `name_en`, `name_bn`, `latitude`, `longitude`, `capacity_estimate` nullable, `status`, `access_notes` nullable, `source_kind`, `is_synthetic`

### `sos_reports`
- `id`, `client_report_id` unique per source client where appropriate, `event_id`, `area_id` nullable, `source_user_id` nullable
- `source_type` (`RESPONDER`, `KNOWN_VOLUNTEER`, `NEW_USER`, `GATEWAY`, `MANUAL`)
- `people_count`, `elderly_count` nullable, `has_child`, `has_medical_need`, `is_trapped`, `location_lat` nullable, `location_lng` nullable, `geohash7` nullable
- `message_original` nullable, `message_language` nullable, `extracted_fields` JSON nullable, `field_confidence` JSON nullable
- `packet_version`, `packet_checksum` nullable, `packet_short_id` nullable, `reported_at`, `received_at`, `last_seen_at` nullable
- `transport_kind`, `transport_status`, `parse_status`, `review_status`, `created_at`, `updated_at`
- Index event/time, status/time, geohash/time, area/time. Do not store precise location longer than needed by the retention policy.

### `gateway_messages`
- `id`, `gateway_kind`, `simulation` boolean, `packet_raw`, `packet_checksum`, `sender_ref_hash` nullable, `received_at`, `processed_at` nullable, `processing_status`, `failure_reason` nullable, `sos_report_id` nullable
- Unique idempotency key using packet/client context; don't rely only on packet body if two actual reports could share identical fields.

### `incidents`, `incident_reports`
- Incident: `id`, `event_id`, `area_id` nullable, `status`, `priority`, `confidence_score`, `confidence_breakdown` JSON, `summary` nullable, `opened_at`, `last_updated_at`, `closed_at` nullable
- Link: `incident_id`, `sos_report_id`, `linked_at`, `linked_by`, `link_reason`, `is_primary`; unique report linkage only if domain rules guarantee one active incident/report relation.
- Never delete source SOS when merging incidents; retain links so merge can be reversed/split.

### `duplicate_candidates`
- `id`, `event_id`, `left_report_id`, `right_report_id`, `text_similarity` nullable, `spatial_match`, `time_delta_seconds`, `people_count_match`, `score`, `reason_codes` JSON, `status` (`PENDING`, `ACCEPTED`, `REJECTED`, `REVERSED`), `reviewed_by`, `reviewed_at`
- Unique ordered pair per detection version/run where appropriate.

### `assets`
- `id`, `event_id` nullable, `name`, `asset_type` (`BOAT`, `RESCUE_TEAM`, `VEHICLE`, `SUPPLY`), `area_id` nullable, `latitude` nullable, `longitude` nullable
- `availability_status`, `capacity_people` nullable, `water_suitability`, `capability_flags` JSON, `updated_at`, `updated_by`, `is_synthetic`

### `dispatch_suggestions`
- `id`, `incident_id`, `asset_id`, `priority_score`, `factor_breakdown` JSON, `suggested_at`, `status` (`SUGGESTED`, `ACCEPTED`, `REJECTED`, `CANCELLED`), `reviewed_by`, `reviewed_at`, `review_reason` nullable
- A suggestion is not a dispatch. No automatic action on insert.

### `alert_evaluations`, `warnings`
- Evaluation: `id`, `event_id`, `area_id`, `evaluated_at`, `computed_level`, `signal_values` JSON, `reason_codes` JSON, `source_ages` JSON, `config_version`, `is_reconstructed`
- Warning: `id`, `event_id`, `area_id`, `alert_evaluation_id`, `body_bn`, `body_en` nullable, `state` (`DRAFT`, `PENDING_APPROVAL`, `APPROVED`, `REJECTED`, `SENT_SIMULATED`), `created_by`, `approved_by` nullable, `approved_at` nullable, `approval_note` nullable, `delivery_simulation` JSON nullable

### `recovery_reports`, `aid_deliveries`
- Report: `id`, `event_id`, `area_id`, `report_type`, `damage_level` nullable, `tube_well_status` nullable, `crop_loss_level` nullable, `pond_loss_level` nullable, `road_passability` nullable, `need_water`, `need_medicine`, `need_food`, `needs_json`, `evidence_note` nullable, `source_kind`, `reported_at`, `reported_by`, `status`
- Delivery: `id`, `event_id`, `area_id`, `organization_label`, `item_code`, `quantity`, `unit`, `delivered_at`, `recorded_by`, `source_reference` nullable, `receipt_note` nullable, `idempotency_key` unique
- Prefer village/aggregate records; avoid beneficiary names or exact household identity in the prototype.

### `replay_runs`, `replay_ticks`
- Run: `id`, `event_id`, `scenario_key`, `started_at`, `current_tick_at`, `status`, `gauge_blanked`, `is_reconstructed`
- Tick: `id`, `run_id`, `observed_at`, `gauge_observation_id` nullable, `rainfall_observation_id` nullable, `volunteer_reading_id` nullable, `evaluated_level`, `reason_codes` JSON, `lead_time_minutes` nullable

### `audit_logs`
- `id`, `actor_user_id` nullable, `action`, `entity_type`, `entity_id`, `occurred_at`, `reason` nullable, `before_summary` JSON nullable, `after_summary` JSON nullable, `request_id` nullable
- Append-only at application level. Do not log passwords, JWTs, full phone numbers or raw private voice recordings.

## Technical rules
- Use consistent UTC `datetime(3)` columns and server-side UTC clock.
- Store money only if scope later needs it; not part of current MVP.
- Avoid excessive JSON for fields that need filtering; JSON is appropriate for reason breakdowns/source metadata, while queryable values get first-class columns.
- Add migrations for indexes and constraints rather than relying on entity sync.
- Add retention configuration and a safe deletion/anonymization path for personal identifiers.
- Use transactions when linking/merging incidents, reviewing warnings and recording delivery changes.
