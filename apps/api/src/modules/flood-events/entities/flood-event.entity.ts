import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum FloodEventMode {
  SYNTHETIC = 'SYNTHETIC',
  REPLAY = 'REPLAY',
  DEMO = 'DEMO',
}

@Entity('flood_events')
export class FloodEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({ type: 'varchar', length: 50, default: 'FENI' })
  region_code!: string;

  @Column({ type: 'datetime' })
  start_at!: Date;

  @Column({ type: 'datetime', nullable: true })
  end_at!: Date | null;

  @Column({ type: 'varchar', length: 50, default: 'ACTIVE' })
  status!: string;

  @Column({
    type: 'enum',
    enum: FloodEventMode,
    default: FloodEventMode.DEMO,
  })
  mode!: FloodEventMode;

  @Column({ type: 'text', nullable: true })
  provenance_note!: string | null;

  @Column({ type: 'boolean', default: false })
  is_reconstructed!: boolean;

  @CreateDateColumn({ type: 'datetime' })
  created_at!: Date;

  @Column({ type: 'varchar', length: 36, nullable: true })
  created_by!: string | null;
}

