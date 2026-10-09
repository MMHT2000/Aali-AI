import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../app.module';
import { AuthService } from '../modules/auth/auth.service';
import { GatewayService } from '../modules/gateway/gateway.service';
import { IncidentsService } from '../modules/incidents/incidents.service';
import { AlertsService } from '../modules/warnings/alerts.service';
import { RecoveryService } from '../modules/recovery/recovery.service';
import { AuditService } from '../modules/audit/audit.service';
import { encodeDisasterPacket } from '../common/packet/disaster-packet';
import { AuditLog } from '../modules/audit/entities/audit-log.entity';
import { SosService } from '../modules/sos/sos.service';

describe('Aali AI — End-to-End Synthetic Flood Journey (Phase 9 Acceptance)', () => {
  let app: INestApplication;
  let authService: AuthService;
  let gatewayService: GatewayService;
  let incidentsService: IncidentsService;
  let alertsService: AlertsService;
  let recoveryService: RecoveryService;
  let auditService: AuditService;

  beforeAll(async () => {
    const sosRecords = new Map<string, { id: string; transport_kind: string; geohash7: string | null }>();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).overrideProvider(SosService).useValue({
      createSos: async (dto: { clientReportId: string }) => {
        const prior = sosRecords.get(dto.clientReportId);
        if (prior) return { report: prior, isDuplicate: true };
        const report = { id: `e2e-${sosRecords.size + 1}`, transport_kind: 'APP_DIRECT', geohash7: null };
        sosRecords.set(dto.clientReportId, report);
        return { report, isDuplicate: false };
      },
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    authService = moduleFixture.get<AuthService>(AuthService);
    gatewayService = moduleFixture.get<GatewayService>(GatewayService);
    incidentsService = moduleFixture.get<IncidentsService>(IncidentsService);
    alertsService = moduleFixture.get<AlertsService>(AlertsService);
    recoveryService = moduleFixture.get<RecoveryService>(RecoveryService);
    auditService = moduleFixture.get<AuditService>(AuditService);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('Step 1: Authenticates operator and verifies JWT claims', async () => {
    const loginRes = await authService.login({
      username: 'authority_dc',
      password: 'Admin123!',
    });

    expect(loginRes.accessToken).toBeDefined();
    expect(loginRes.user.role).toBe('AUTHORITY');
    expect(loginRes.user.username).toBe('authority_dc');
  });

  it('Step 2: Creates compact Disaster Packet SOS under 60 chars (<160 SMS limit)', () => {
    const packet = encodeDisasterPacket({
      geohash7: 'wh0r789',
      peopleCount: 6,
      flags: { child: true, elderly: true, medical: true, trapped: true },
      timestamp: '261009-1400',
      shortId: 'E2E1',
    });

    expect(packet.length).toBeLessThan(60); // Must fit single 160-char SMS segment
    expect(packet).toMatch(/^A1\|S\|wh0r789\|06\|E1C1M1T1\|261009-1400\|E2E1\|/);
  });

  it('Step 3: Transports packet through carrier gateway simulator with idempotency check', async () => {
    const packet = encodeDisasterPacket({
      geohash7: 'wh0r000',
      peopleCount: 4,
      flags: { child: false, elderly: true, medical: false, trapped: true },
      timestamp: '261009-1405',
      shortId: 'E2E2',
    });

    const sendRes1 = await gatewayService.ingestSimulatedPacket({
      packet,
      gatewayId: 'SIMULATED_CARRIER_GATEWAY_FENI',
    });

    expect(sendRes1.simulation).toBe(true);
    expect(sendRes1.status).toBe('ACCEPTED');
    expect(sendRes1.isIdempotentDuplicate).toBe(false);

    // Replay duplicate packet -> must be detected idempotently
    const sendRes2 = await gatewayService.ingestSimulatedPacket({
      packet,
      gatewayId: 'SIMULATED_CARRIER_GATEWAY_FENI',
    });

    expect(sendRes2.status).toBe('DUPLICATE_IGNORED');
    expect(sendRes2.isIdempotentDuplicate).toBe(true);
  });

  it('Step 4: Triages incident, flags silent village, and audits duplicate review', async () => {
    const incidents = await incidentsService.getIncidents();
    expect(incidents.length).toBeGreaterThan(0);

    const firstInc = incidents[0];
    expect(firstInc.confidence).toBeGreaterThan(0);
    expect(firstInc.priorityScore).toBeGreaterThan(0);

    // Silent village rule verification
    const silentVillages = incidentsService.getSilentVillages();
    expect(silentVillages.length).toBeGreaterThanOrEqual(1);
    expect(silentVillages[0].actionRequired).toBe('VERIFY_BY_SAFE_MEANS');

    // Operator duplicate merge review
    if (firstInc.duplicateCandidate) {
      const reviewRes = await incidentsService.reviewDuplicateCandidate(
        firstInc.id,
        firstInc.duplicateCandidate.candidateId,
        'ACCEPT',
        'Verified matching coordinates and demographic profiles',
      );
      expect(reviewRes.incident.duplicateCandidate?.status).toBe('ACCEPTED');

      // Verify audit record was created
      const auditEntries = auditService.getLogs({ entityType: 'INCIDENT', entityId: firstInc.id });
      expect(auditEntries.some((e: AuditLog) => e.action === 'MERGE_DUPLICATE_ACCEPTED')).toBe(true);
    }
  });

  it('Step 5: Reviews boat dispatch recommendation with human approval and audit trail', async () => {
    const incidents = await incidentsService.getIncidents();
    const inc = incidents[0];

    expect(inc.suggestedBoat).toBeDefined();
    const boatReview = await incidentsService.reviewBoatSuggestion(
      inc.id,
      'ACCEPT',
      'Engine boat accepted by field responder unit',
      '00000000-0000-0000-0000-000000000003',
    );

    expect(boatReview.incident.suggestedBoat?.status).toBe('ACCEPTED');
    const boatAudits = auditService.getLogs({ entityType: 'ASSET_PROPOSAL' });
    expect(boatAudits.some((e: AuditLog) => e.action === 'BOAT_DISPATCH_PROPOSAL_ACCEPTED')).toBe(true);
  });

  it('Step 6: Runs historical replay, blanks sensor, and approves warning via human Authority', async () => {
    const scenarios = alertsService.getScenarios();
    expect(scenarios.length).toBeGreaterThanOrEqual(2);

    const run = alertsService.startReplay(scenarios[0].id);
    expect(run.currentEvaluation).toBeDefined();

    // Blank sensor telemetry
    const blankedRun = alertsService.setGaugeState(run.runId, true);
    expect(blankedRun.isGaugeBlankedOverride).toBe(true);

    // Step replay to observe sensor silent escalation
    const stepped = alertsService.stepReplay(run.runId, 'SET_TICK', 3);
    expect(stepped.currentEvaluation.reasonCodes).toContain('GAUGE_SILENT');

    // Authority warning approval
    const warnings = alertsService.getWarnings();
    const draft = warnings[0];
    const approvedWarning = await alertsService.approveWarning(
      draft.id,
      '00000000-0000-0000-0000-000000000002',
      'Official warning approved following Muhuri crest and gauge telemetry blackout',
    );

    expect(approvedWarning.state).toBe('APPROVED');
    expect(approvedWarning.approved_by).toBe('00000000-0000-0000-0000-000000000002');

    // Verify warning approval was audited
    const warningAudits = auditService.getLogs({ entityType: 'WARNING', entityId: draft.id });
    expect(warningAudits.some((e: AuditLog) => e.action === 'APPROVE_WARNING')).toBe(true);
  });

  it('Step 7: Records post-disaster recovery aid delivery with idempotency and audit record', async () => {
    const initialSummary = recoveryService.getSummary();
    expect(initialSummary.villagesRanking.length).toBeGreaterThan(0);
    const topVillage = initialSummary.villagesRanking[0];

    const delRes1 = await recoveryService.recordDelivery({
      areaId: topVillage.villageId,
      organizationLabel: 'Bangladesh Red Crescent Society (BDRCS)',
      itemCode: 'CLEAN_WATER',
      quantity: 2000,
      unit: 'LITRES',
      recordedBy: '00000000-0000-0000-0000-000000000003',
      idempotencyKey: 'e2e-delivery-batch-001',
    });

    expect(delRes1.isDuplicateIgnored).toBe(false);

    // Replay same delivery idempotency key
    const delRes2 = await recoveryService.recordDelivery({
      areaId: topVillage.villageId,
      organizationLabel: 'Bangladesh Red Crescent Society (BDRCS)',
      itemCode: 'CLEAN_WATER',
      quantity: 2000,
      unit: 'LITRES',
      recordedBy: '00000000-0000-0000-0000-000000000003',
      idempotencyKey: 'e2e-delivery-batch-001',
    });

    expect(delRes2.isDuplicateIgnored).toBe(true);

    // Verify aid audit log
    const aidAudits = auditService.getLogs({ entityType: 'AID_DELIVERY' });
    expect(aidAudits.some((e: AuditLog) => e.action === 'RECORD_AID_DELIVERY')).toBe(true);
  });
});
