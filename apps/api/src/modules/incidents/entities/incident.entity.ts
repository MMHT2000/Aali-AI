import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum IncidentStatus {
  OPEN = 'OPEN',
  TRIAGED = 'TRIAGED',
  ASSIGNED = 'ASSIGNED',
  RESCUED = 'RESCUED',
  CLOSED = 'CLOSED',
}

@Entity('incidents')
export class Incident {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'varchar', length: 36, nullable: true })
  event_id!: string | null;

  @Index()
  @Column({ type: 'varchar', length: 36, nullable: true })
  area_id!: string | null;

  @Index()
  @Column({
    type: 'enum',
    enum: IncidentStatus,
    default: IncidentStatus.OPEN,
  })
  status!: IncidentStatus;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  priority!: number;

  @Column({ type: 'decimal', precision: 4, scale: 3, default: 0.4 })
  confidence_score!: number;

  @Column({ type: 'json', nullable: true })
  confidence_breakdown!: Record<string, unknown> | null;

  @Column({ type: 'text', nullable: true })
  summary!: string | null;

  @Column({ type: 'datetime' })
  opened_at!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  last_updated_at!: Date;

  @Column({ type: 'datetime', nullable: true })
  closed_at!: Date | null;
}

@Entity('incident_reports')
export class IncidentReport {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'varchar', length: 36 })
  incident_id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 36 })
  sos_report_id!: string;

  @CreateDateColumn({ type: 'datetime' })
  linked_at!: Date;

  @Column({ type: 'varchar', length: 36, nullable: true })
  linked_by!: string | null;

  @Column({ type: 'varchar', length: 100, default: 'PRIMARY' })
  link_reason!: string;

  @Column({ type: 'boolean', default: true })
  is_primary!: boolean;
}

@Entity('duplicate_candidates')
export class DuplicateCandidate {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'varchar', length: 36, nullable: true })
  event_id!: string | null;

  @Index()
  @Column({ type: 'varchar', length: 36 })
  left_report_id!: string;

  @Index()
  @Column({ type: 'varchar', length: 36 })
  right_report_id!: string;

  @Column({ type: 'decimal', precision: 4, scale: 3, nullable: true })
  text_similarity!: number | null;

  @Column({ type: 'boolean', default: false })
  spatial_match!: boolean;

  @Column({ type: 'int', default: 0 })
  time_delta_seconds!: number;

  @Column({ type: 'boolean', default: false })
  people_count_match!: boolean;

  @Column({ type: 'decimal', precision: 4, scale: 3, default: 0 })
  score!: number;

  @Column({ type: 'json', nullable: true })
  reason_codes!: Record<string, unknown> | null;

  @Column({ type: 'varchar', length: 50, default: 'PENDING' })
  status!: string;

  @Column({ type: 'varchar', length: 36, nullable: true })
  reviewed_by!: string | null;

  @Column({ type: 'datetime', nullable: true })
  reviewed_at!: Date | null;
}

