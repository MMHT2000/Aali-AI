import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('shelters')
export class Shelter {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'varchar', length: 36, nullable: true })
  area_id!: string | null;

  @Column({ type: 'varchar', length: 150 })
  name_en!: string;

  @Column({ type: 'varchar', length: 150 })
  name_bn!: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude!: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude!: number;

  @Column({ type: 'int', nullable: true })
  capacity_estimate!: number | null;

  @Column({ type: 'varchar', length: 50, default: 'OPEN' })
  status!: string;

  @Column({ type: 'text', nullable: true })
  access_notes!: string | null;

  @Column({ type: 'varchar', length: 50, default: 'SYNTHETIC' })
  source_kind!: string;

  @Column({ type: 'boolean', default: true })
  is_synthetic!: boolean;
}

