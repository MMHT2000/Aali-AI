import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('brain_controls')
export class BrainControl {
  @PrimaryColumn({ type: 'varchar', length: 40 }) scope!: string;
  @Column({ type: 'boolean', default: false }) paused!: boolean;
  @Column({ type: 'varchar', length: 36 }) actor_id!: string;
  @Column({ type: 'varchar', length: 300 }) reason!: string;
  @Column({ type: 'datetime', precision: 3 }) updated_at!: Date;
}
