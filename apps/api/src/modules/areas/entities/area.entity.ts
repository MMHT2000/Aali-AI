import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum AreaType {
  DISTRICT = 'DISTRICT',
  UPAZILA = 'UPAZILA',
  UNION = 'UNION',
  WARD = 'WARD',
  VILLAGE = 'VILLAGE',
}

@Entity('areas')
export class Area {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'varchar', length: 36, nullable: true })
  parent_id!: string | null;

  @Column({
    type: 'enum',
    enum: AreaType,
    default: AreaType.VILLAGE,
  })
  area_type!: AreaType;

  @Column({ type: 'varchar', length: 150 })
  name_en!: string;

  @Column({ type: 'varchar', length: 150 })
  name_bn!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50 })
  code!: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude!: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude!: number | null;

  @Column({ type: 'varchar', length: 50, default: 'MEDIUM' })
  exposure_level!: string;

  @Column({ type: 'int', nullable: true })
  population_estimate!: number | null;

  @Index()
  @Column({ type: 'varchar', length: 12, nullable: true })
  geohash7!: string | null;

  @Column({ type: 'varchar', length: 100, default: 'SYNTHETIC_FENI_FIXTURE' })
  source_name!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  source_url!: string | null;

  @Column({ type: 'datetime', nullable: true })
  source_updated_at!: Date | null;

  @Column({ type: 'boolean', default: true })
  is_synthetic!: boolean;
}

