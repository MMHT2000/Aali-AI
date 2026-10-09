import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('gateway_messages')
export class GatewayMessage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50, default: 'SIMULATED_CARRIER' })
  gateway_kind!: string;

  @Column({ type: 'boolean', default: true })
  simulation!: boolean;

  @Column({ type: 'text' })
  packet_raw!: string;

  @Index()
  @Column({ type: 'varchar', length: 16 })
  packet_checksum!: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  sender_ref_hash!: string | null;

  @Column({ type: 'datetime' })
  received_at!: Date;

  @Column({ type: 'datetime', nullable: true })
  processed_at!: Date | null;

  @Column({ type: 'varchar', length: 50, default: 'PROCESSED' })
  processing_status!: string;

  @Column({ type: 'text', nullable: true })
  failure_reason!: string | null;

  @Column({ type: 'varchar', length: 36, nullable: true })
  sos_report_id!: string | null;
}

