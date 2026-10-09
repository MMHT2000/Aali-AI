import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('rainfall_observations')
export class RainfallObservation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'varchar', length: 36 })
  event_id!: string;

  @Index()
  @Column({ type: 'varchar', length: 36, nullable: true })
  area_id!: string | null;

  @Index()
  @Column({ type: 'datetime' })
  observed_at!: Date;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  rainfall_mm!: number;

  @Column({ type: 'int', default: 180 })
  window_minutes!: number;

  @Column({ type: 'varchar', length: 50, default: 'SATELLITE_GSMaP' })
  source_kind!: string;

  @Column({ type: 'text', nullable: true })
  provenance!: string | null;

  @Column({ type: 'boolean', default: false })
  is_reconstructed!: boolean;
}

@Entity('volunteer_readings')
export class VolunteerReading {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'varchar', length: 36 })
  event_id!: string;

  @Index()
  @Column({ type: 'varchar', length: 36, nullable: true })
  area_id!: string | null;

  @Column({ type: 'varchar', length: 36, nullable: true })
  gauge_id!: string | null;

  @Column({ type: 'varchar', length: 36 })
  submitted_by!: string;

  @Index()
  @Column({ type: 'datetime' })
  observed_at!: Date;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  level_m!: number | null;

  @Column({ type: 'text', nullable: true })
  raw_message!: string | null;

  @Column({ type: 'varchar', length: 50, default: 'PARSED' })
  parse_status!: string;

  @Column({ type: 'varchar', length: 50, default: 'SMS_VOLUNTEER' })
  source_kind!: string;

  @Column({ type: 'text', nullable: true })
  provenance!: string | null;
}

