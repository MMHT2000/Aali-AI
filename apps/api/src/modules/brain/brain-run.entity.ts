import { Column, Entity, Index, PrimaryColumn } from 'typeorm';
import { BrainPlan } from './brain.types';

@Entity('brain_runs')
@Index(['area_id', 'mode', 'created_at'])
export class BrainRun {
  @PrimaryColumn({ type: 'varchar', length: 36 }) id!: string;
  @Column({ type: 'varchar', length: 40 }) area_id!: string;
  @Column({ type: 'varchar', length: 20 }) mode!: 'LIVE' | 'EXERCISE';
  @Column({ type: 'json' }) plan!: BrainPlan;
  @Column({ type: 'datetime' }) created_at!: Date;
}
