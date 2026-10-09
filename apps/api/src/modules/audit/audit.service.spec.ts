import { describe, it, expect, beforeEach } from '@jest/globals';
import { AuditService } from './audit.service';

describe('AuditService', () => {
  let auditService: AuditService;

  beforeEach(() => {
    auditService = new AuditService();
  });

  it('records audit events with timestamps, before/after summaries, and actor IDs', () => {
    const entry = auditService.record({
      actorUserId: 'user-auth-001',
      action: 'APPROVE_WARNING',
      entityType: 'WARNING',
      entityId: 'warn-101',
      reason: 'Parshuram model shelter verified ready',
      beforeSummary: { state: 'PENDING_APPROVAL' },
      afterSummary: { state: 'APPROVED' },
    });

    expect(entry.id).toMatch(/^audit-/);
    expect(entry.action).toBe('APPROVE_WARNING');
    expect(entry.entity_type).toBe('WARNING');
    expect(entry.entity_id).toBe('warn-101');
    expect(entry.actor_user_id).toBe('user-auth-001');
    expect(entry.occurred_at).toBeInstanceOf(Date);
    expect(entry.reason).toBe('Parshuram model shelter verified ready');

    const logs = auditService.getLogs({ entityType: 'WARNING' });
    expect(logs.length).toBe(1);
    expect(logs[0].id).toBe(entry.id);
  });

  it('filters audit logs by entityType and entityId', () => {
    auditService.record({
      action: 'SPLIT_INCIDENT',
      entityType: 'INCIDENT',
      entityId: 'inc-01',
      reason: 'Separating unrelated volunteer report',
    });

    auditService.record({
      action: 'RECORD_AID_DELIVERY',
      entityType: 'AID_DELIVERY',
      entityId: 'del-01',
      reason: 'Delivered water',
    });

    const incidentLogs = auditService.getLogs({ entityType: 'INCIDENT' });
    expect(incidentLogs.length).toBe(1);
    expect(incidentLogs[0].action).toBe('SPLIT_INCIDENT');

    const aidLogs = auditService.getLogs({ entityType: 'AID_DELIVERY' });
    expect(aidLogs.length).toBe(1);
    expect(aidLogs[0].action).toBe('RECORD_AID_DELIVERY');
  });
});

