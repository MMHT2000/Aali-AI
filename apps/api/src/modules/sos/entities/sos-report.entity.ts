import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum SosSourceType {
  RESPONDER = 'RESPONDER',
  KNOWN_VOLUNTEER = 'KNOWN_VOLUNTEER',
  NEW_USER = 'NEW_USER',
  GATEWAY = 'GATEWAY',
  MANUAL = 'MANUAL',
}

@Entity('sos_reports')
export class SosReport {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100 })
  client_report_id!: string;

  @Index()
  @Column({ type: 'varchar', length: 36, nullable: true })
  event_id!: string | null;

  @Index()
  @Column({ type: 'varchar', length: 36, nullable: true })
  area_id!: string | null;

  @Column({ type: 'varchar', length: 36, nullable: true })
  source_user_id!: string | null;

  @Column({
    type: 'enum',
    enum: SosSourceType,
    default: SosSourceType.NEW_USER,
  })
  source_type!: SosSourceType;

  @Column({ type: 'int', default: 1 })
  people_count!: number;

  @Column({ type: 'int', nullable: true })
  elderly_count!: number | null;

  @Column({ type: 'boolean', default: false })
  has_child!: boolean;

  @Column({ type: 'boolean', default: false })
  has_medical_need!: boolean;

  @Column({ type: 'boolean', default: false })
  is_trapped!: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  location_lat!: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  location_lng!: number | null;

  @Index()
  @Column({ type: 'varchar', length: 12, nullable: true })
  geohash7!: string | null;

  @Column({ type: 'text', nullable: true })
  message_original!: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  message_language!: string | null;

  @Column({ type: 'json', nullable: true })
  extracted_fields!: Record<string, unknown> | null;

  @Column({ type: 'json', nullable: true })
  field_confidence!: Record<string, unknown> | null;

  @Column({ type: 'varchar', length: 10, default: '1' })
  packet_version!: string;

  @Index()
  @Column({ type: 'varchar', length: 16, nullable: true })
  packet_checksum!: string | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  packet_short_id!: string | null;

  @Index()
  @Column({ type: 'datetime' })
  reported_at!: Date;

  @Column({ type: 'datetime' })
  received_at!: Date;

  @Column({ type: 'datetime', nullable: true })
  last_seen_at!: Date | null;

  @Column({ type: 'varchar', length: 50, default: 'APP_DIRECT' })
  transport_kind!: string;

  @Column({ type: 'varchar', length: 50, default: 'DELIVERED' })
  transport_status!: string;

  @Column({ type: 'varchar', length: 50, default: 'VALID' })
  parse_status!: string;

  @Index()
  @Column({ type: 'varchar', length: 50, default: 'TRIAGED' })
  review_status!: string;

  @CreateDateColumn({ type: 'datetime' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updated_at!: Date;
}

