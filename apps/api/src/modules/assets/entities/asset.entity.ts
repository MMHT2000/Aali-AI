import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum AssetType {
  BOAT = 'BOAT',
  RESCUE_TEAM = 'RESCUE_TEAM',
  VEHICLE = 'VEHICLE',
  SUPPLY = 'SUPPLY',
}

@Entity('assets')
export class Asset {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'varchar', length: 36, nullable: true })
  event_id!: string | null;

  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({
    type: 'enum',
    enum: AssetType,
    default: AssetType.BOAT,
  })
  asset_type!: AssetType;

  @Index()
  @Column({ type: 'varchar', length: 36, nullable: true })
  area_id!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude!: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude!: number | null;

  @Column({ type: 'varchar', length: 50, default: 'AVAILABLE' })
  availability_status!: string;

  @Column({ type: 'int', nullable: true })
  capacity_people!: number | null;

  @Column({ type: 'varchar', length: 50, default: 'SHALLOW_DRAFT' })
  water_suitability!: string;

  @Column({ type: 'json', nullable: true })
  capability_flags!: Record<string, unknown> | null;

  @UpdateDateColumn({ type: 'datetime' })
  updated_at!: Date;

  @Column({ type: 'varchar', length: 36, nullable: true })
  updated_by!: string | null;

  @Column({ type: 'boolean', default: true })
  is_synthetic!: boolean;
}

@Entity('dispatch_suggestions')
export class DispatchSuggestion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'varchar', length: 36 })
  incident_id!: string;

  @Index()
  @Column({ type: 'varchar', length: 36 })
  asset_id!: string;

  @Column({ type: 'decimal', precision: 5, scale: 3 })
  priority_score!: number;

  @Column({ type: 'json' })
  factor_breakdown!: Record<string, unknown>;

  @CreateDateColumn({ type: 'datetime' })
  suggested_at!: Date;

  @Column({ type: 'varchar', length: 50, default: 'SUGGESTED' })
  status!: string;

  @Column({ type: 'varchar', length: 36, nullable: true })
  reviewed_by!: string | null;

  @Column({ type: 'datetime', nullable: true })
  reviewed_at!: Date | null;

  @Column({ type: 'text', nullable: true })
  review_reason!: string | null;
}

