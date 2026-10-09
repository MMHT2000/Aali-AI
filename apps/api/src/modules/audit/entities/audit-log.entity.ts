import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'varchar', length: 36, nullable: true })
  actor_user_id!: string | null;

  @Index()
  @Column({ type: 'varchar', length: 100 })
  action!: string;

  @Index()
  @Column({ type: 'varchar', length: 100 })
  entity_type!: string;

  @Index()
  @Column({ type: 'varchar', length: 36 })
  entity_id!: string;

  @Index()
  @Column({ type: 'datetime' })
  occurred_at!: Date;

  @Column({ type: 'text', nullable: true })
  reason!: string | null;

  @Column({ type: 'json', nullable: true })
  before_summary!: Record<string, unknown> | null;

  @Column({ type: 'json', nullable: true })
  after_summary!: Record<string, unknown> | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  request_id!: string | null;
}

