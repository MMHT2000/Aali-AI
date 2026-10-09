import { Injectable, Logger, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { AuditLog } from './entities/audit-log.entity';

export interface RecordAuditParams {
  actorUserId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  reason?: string | null;
  beforeSummary?: Record<string, unknown> | null;
  afterSummary?: Record<string, unknown> | null;
  requestId?: string | null;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);
  private auditLogs: AuditLog[] = [];

  constructor(
    @Optional() @InjectRepository(AuditLog) private readonly repository?: Repository<AuditLog>,
  ) {}

  async record(params: RecordAuditParams): Promise<AuditLog> {
    const entry = new AuditLog();
    entry.id = randomUUID();
    entry.actor_user_id = params.actorUserId || null;
    entry.action = params.action;
    entry.entity_type = params.entityType;
    entry.entity_id = params.entityId;
    entry.occurred_at = new Date();
    entry.reason = params.reason || null;
    entry.before_summary = params.beforeSummary || null;
    entry.after_summary = params.afterSummary || null;
    entry.request_id = params.requestId || null;

    if (this.repository && process.env.NODE_ENV !== 'test') {
      await this.repository.save(entry);
    }
    this.auditLogs.unshift(entry);
    this.logger.log(
      `[AUDIT] Action: ${entry.action} on ${entry.entity_type}:${entry.entity_id} by ${entry.actor_user_id || 'SYSTEM'}`,
    );
    return entry;
  }

  async getPersistedLogs(filter?: { entityType?: string; entityId?: string }): Promise<AuditLog[]> {
    if (!this.repository || process.env.NODE_ENV === 'test') return this.getLogs(filter);
    const query = this.repository.createQueryBuilder('audit');
    if (filter?.entityType) query.andWhere('audit.entity_type = :entityType', { entityType: filter.entityType });
    if (filter?.entityId) query.andWhere('audit.entity_id = :entityId', { entityId: filter.entityId });
    return query.orderBy('audit.occurred_at', 'DESC').take(500).getMany();
  }

  getLogs(filter?: { entityType?: string; entityId?: string }): AuditLog[] {
    let result = [...this.auditLogs];
    if (filter?.entityType) {
      result = result.filter((l) => l.entity_type === filter.entityType);
    }
    if (filter?.entityId) {
      result = result.filter((l) => l.entity_id === filter.entityId);
    }
    return result;
  }
}

