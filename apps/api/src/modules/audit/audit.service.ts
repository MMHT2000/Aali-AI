import { Injectable, Logger } from '@nestjs/common';
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

  record(params: RecordAuditParams): AuditLog {
    const entry = new AuditLog();
    entry.id = `audit-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    entry.actor_user_id = params.actorUserId || null;
    entry.action = params.action;
    entry.entity_type = params.entityType;
    entry.entity_id = params.entityId;
    entry.occurred_at = new Date();
    entry.reason = params.reason || null;
    entry.before_summary = params.beforeSummary || null;
    entry.after_summary = params.afterSummary || null;
    entry.request_id = params.requestId || null;

    this.auditLogs.unshift(entry);
    this.logger.log(
      `[AUDIT] Action: ${entry.action} on ${entry.entity_type}:${entry.entity_id} by ${entry.actor_user_id || 'SYSTEM'}. Reason: ${entry.reason || 'None'}`,
    );
    return entry;
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

