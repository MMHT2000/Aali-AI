import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('recovery_reports')
export class RecoveryReport {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'varchar', length: 36, nullable: true })
  event_id!: string | null;

  @Index()
  @Column({ type: 'varchar', length: 36 })
  area_id!: string;

  @Column({ type: 'varchar', length: 50, default: 'DAMAGE_AND_NEEDS' })
  report_type!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  damage_level!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  tube_well_status!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  crop_loss_level!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  pond_loss_level!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  road_passability!: string | null;

  @Column({ type: 'boolean', default: false })
  need_water!: boolean;

  @Column({ type: 'boolean', default: false })
  need_medicine!: boolean;

  @Column({ type: 'boolean', default: false })
  need_food!: boolean;

  @Column({ type: 'json', nullable: true })
  needs_json!: Record<string, unknown> | null;

  @Column({ type: 'text', nullable: true })
  evidence_note!: string | null;

  @Column({ type: 'varchar', length: 50, default: 'COORDINATOR_ASSESSMENT' })
  source_kind!: string;

  @Column({ type: 'datetime' })
  reported_at!: Date;

  @Column({ type: 'varchar', length: 36 })
  reported_by!: string;

  @Column({ type: 'varchar', length: 50, default: 'SUBMITTED' })
  status!: string;
}

@Entity('aid_deliveries')
export class AidDelivery {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'varchar', length: 36, nullable: true })
  event_id!: string | null;

  @Index()
  @Column({ type: 'varchar', length: 36 })
  area_id!: string;

  @Column({ type: 'varchar', length: 150 })
  organization_label!: string;

  @Column({ type: 'varchar', length: 50 })
  item_code!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity!: number;

  @Column({ type: 'varchar', length: 30 })
  unit!: string;

  @Column({ type: 'datetime' })
  delivered_at!: Date;

  @Column({ type: 'varchar', length: 36 })
  recorded_by!: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  source_reference!: string | null;

  @Column({ type: 'text', nullable: true })
  receipt_note!: string | null;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100 })
  idempotency_key!: string;

  @CreateDateColumn({ type: 'datetime' })
  created_at!: Date;
}

