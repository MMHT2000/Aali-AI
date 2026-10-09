import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity('resident_accounts')
export class ResidentAccount {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id!: string;

  @Index('UQ_resident_accounts_nid_hash', { unique: true })
  @Column({ type: 'char', length: 64, select: false })
  nid_hash!: string;

  @Column({ type: 'char', length: 4 })
  nid_last4!: string;

  @Column({ type: 'varchar', length: 150 })
  display_name!: string;

  @Column({ type: 'varchar', length: 20 })
  phone_redacted!: string;

  @CreateDateColumn({ type: 'datetime', precision: 3 })
  created_at!: Date;
}
