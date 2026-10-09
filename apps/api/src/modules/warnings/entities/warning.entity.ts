import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum AlertLevel {
  NORMAL = 'NORMAL',
  WATCH = 'WATCH',
  WARNING = 'WARNING',
  ACT = 'ACT',
}

export enum WarningState {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SENT_SIMULATED = 'SENT_SIMULATED',
}

@Entity('alert_evaluations')
export class AlertEvaluation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'varchar', length: 36, nullable: true })
  event_id!: string | null;

  @Index()
  @Column({ type: 'varchar', length: 36, nullable: true })
  area_id!: string | null;

  @Column({ type: 'datetime' })
  evaluated_at!: Date;

  @Column({
    type: 'enum',
    enum: AlertLevel,
    default: AlertLevel.NORMAL,
  })
  computed_level!: AlertLevel;

  @Column({ type: 'json' })
  signal_values!: Record<string, unknown>;

  @Column({ type: 'json' })
  reason_codes!: string[];

  @Column({ type: 'json' })
  source_ages!: Record<string, unknown>;

  @Column({ type: 'varchar', length: 20, default: '1.0' })
  config_version!: string;

  @Column({ type: 'boolean', default: false })
  is_reconstructed!: boolean;
}

@Entity('warnings')
export class Warning {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'varchar', length: 36, nullable: true })
  event_id!: string | null;

  @Index()
  @Column({ type: 'varchar', length: 36, nullable: true })
  area_id!: string | null;

  @Column({ type: 'varchar', length: 36, nullable: true })
  alert_evaluation_id!: string | null;

  @Column({ type: 'text' })
  body_bn!: string;

  @Column({ type: 'text', nullable: true })
  body_en!: string | null;

  @Column({
    type: 'enum',
    enum: WarningState,
    default: WarningState.DRAFT,
  })
  state!: WarningState;

  @Column({ type: 'varchar', length: 36 })
  created_by!: string;

  @Column({ type: 'varchar', length: 36, nullable: true })
  approved_by!: string | null;

  @Column({ type: 'datetime', nullable: true })
  approved_at!: Date | null;

  @Column({ type: 'text', nullable: true })
  approval_note!: string | null;

  @Column({ type: 'json', nullable: true })
  delivery_simulation!: Record<string, unknown> | null;

  @CreateDateColumn({ type: 'datetime' })
  created_at!: Date;
}

