import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { AuditService } from './audit.service';
import { AuditLog } from './entities/audit-log.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';

describe('AuditService', () => {
  let auditService: AuditService;

  beforeEach(() => {
    auditService = new AuditService();
  });

  it('records audit events with timestamps, before/after summaries, and actor IDs', async () => {
    const entry = await auditService.record({
      actorUserId: 'user-auth-001',
      action: 'APPROVE_WARNING',
      entityType: 'WARNING',
      entityId: 'warn-101',
      reason: 'Parshuram model shelter verified ready',
      beforeSummary: { state: 'PENDING_APPROVAL' },
      afterSummary: { state: 'APPROVED' },
    });

    expect(entry.id).toMatch(/^[0-9a-f-]{36}$/i);
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

  it('filters audit logs by entityType and entityId', async () => {
    await auditService.record({
      action: 'SPLIT_INCIDENT',
      entityType: 'INCIDENT',
      entityId: 'inc-01',
      reason: 'Separating unrelated volunteer report',
    });

    await auditService.record({
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

  it('persists entries and reads ordered history from the repository outside test mode', async () => {
    const stored: AuditLog[] = [];
    const queryBuilder = {
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn<() => Promise<AuditLog[]>>().mockResolvedValue([]),
    } as unknown as SelectQueryBuilder<AuditLog>;
    const repository = {
      save: jest.fn(async (entry: AuditLog) => { stored.push(entry); return entry; }),
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    } as unknown as Repository<AuditLog>;
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    const service = new AuditService(repository);

    try {
      const entry = await service.record({ action: 'TEST_ACTION', entityType: 'TEST', entityId: 'test-1' });
      expect(repository.save).toHaveBeenCalledWith(entry);
      expect(stored).toHaveLength(1);
      await service.getPersistedLogs({ entityType: 'TEST', entityId: 'test-1' });
      expect(queryBuilder.andWhere).toHaveBeenCalledTimes(2);
      expect(queryBuilder.orderBy).toHaveBeenCalledWith('audit.occurred_at', 'DESC');
      expect(queryBuilder.take).toHaveBeenCalledWith(500);
    } finally {
      if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = originalNodeEnv;
    }
  });
});

