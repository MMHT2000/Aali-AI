import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

export interface PersistedSimulationState {
  tickIndex: number;
  speed: number;
  internetOverride: boolean | null;
}

@Entity('simulation_run_state')
export class SimulationRunState {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  id!: string;

  @Column({ type: 'json' })
  state!: PersistedSimulationState;

  @UpdateDateColumn({ type: 'datetime' })
  updated_at!: Date;
}
