import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('gauges')
export class Gauge {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50 })
  code!: string;

  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({ type: 'varchar', length: 36, nullable: true })
  area_id!: string | null;

  @Column({ type: 'varchar', length: 100 })
  river_name!: string;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  warning_level_m!: number;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  danger_level_m!: number;

  @Column({ type: 'varchar', length: 100, default: 'BWDB_SYNTHETIC' })
  source_name!: string;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;
}

@Entity('gauge_observations')
export class GaugeObservation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'varchar', length: 36 })
  gauge_id!: string;

  @Index()
  @Column({ type: 'varchar', length: 36 })
  event_id!: string;

  @Index()
  @Column({ type: 'datetime' })
  observed_at!: Date;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  level_m!: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  rise_3h_cm!: number | null;

  @Column({ type: 'varchar', length: 50, default: 'AUTOMATED_TELEMETRY' })
  source_kind!: string;

  @Column({ type: 'varchar', length: 50, default: 'VERIFIED' })
  quality_status!: string;

  @Column({ type: 'text', nullable: true })
  provenance!: string | null;

  @Column({ type: 'boolean', default: false })
  is_reconstructed!: boolean;
}

