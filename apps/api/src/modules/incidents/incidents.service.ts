import { Injectable, Logger, OnModuleInit, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { calculateBoatPriority } from '../../domain/boat-priority/boat-priority';
import { calculateConfidenceScore } from '../../domain/confidence/confidence';
import { evaluateDuplicateCandidate } from '../../domain/duplicate/duplicate';
import { evaluateSilentVillage } from '../../domain/silent-village/silent-village';
import { SYNTHETIC_FENI_SEEDS } from '../../database/seeds/feni-synthetic.seeds';
import { SosSourceType } from '../sos/entities/sos-report.entity';
import { SosService } from '../sos/sos.service';
import { Incident, DuplicateCandidate, IncidentStatus } from './entities/incident.entity';
import { DispatchSuggestion } from '../assets/entities/asset.entity';

export interface IncidentSummary {
  id: string;
  summary: string;
  areaName: string;
  peopleCount: number;
  urgencyFlags: {
    child: boolean;
    elderly: boolean;
    medical: boolean;
    trapped: boolean;
  };
  confidence: number;
  confidenceReasons: string[];
  priorityScore: number;
  priorityReasons: string[];
  status: 'OPEN' | 'TRIAGED' | 'ASSIGNED' | 'RESCUED' | 'CLOSED';
  reportsCount: number;
  linkedReportIds: string[];
  duplicateCandidate?: {
    candidateId: string;
    similarityScore: number;
    reasons: string[];
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  };
  suggestedBoat?: {
    assetId: string;
    name: string;
    capacity: number;
    suitability: string;
    status: 'PROPOSED' | 'ACCEPTED' | 'REJECTED';
  };
}

import { AuditService } from '../audit/audit.service';

@Injectable()
export class IncidentsService implements OnModuleInit {
  private readonly logger = new Logger(IncidentsService.name);
  private incidents: IncidentSummary[] = [];

  constructor(
    private readonly sosService: SosService,
    @Optional()
    @InjectRepository(Incident)
    private readonly incidentRepository?: Repository<Incident>,
    @Optional()
    @InjectRepository(DuplicateCandidate)
    private readonly duplicateRepository?: Repository<DuplicateCandidate>,
    @Optional()
    @InjectRepository(DispatchSuggestion)
    private readonly dispatchRepository?: Repository<DispatchSuggestion>,
    private readonly auditService?: AuditService,
  ) {
    this.initDemoIncidents();
  }

  async onModuleInit() {
    if (this.incidentRepository) {
      try {
        const count = await this.incidentRepository.count();
        if (count === 0 && this.incidents.length > 0) {
          for (const inc of this.incidents) {
            const statusEnum = IncidentStatus[inc.status as keyof typeof IncidentStatus] ?? IncidentStatus.OPEN;
            const entity = this.incidentRepository.create({
              id: inc.id,
              status: statusEnum,
              priority: inc.priorityScore,
              confidence_score: inc.confidence,
              confidence_breakdown: { reasons: inc.confidenceReasons },
              summary: inc.summary,
              opened_at: new Date(),
            });
            await this.incidentRepository.save(entity);
          }
        }
      } catch {
        // fallback
      }
    }
  }

  private initDemoIncidents() {
    // Generate initial structured demo incidents from synthetic fixtures
    const conf1 = calculateConfidenceScore({
      sourceType: SosSourceType.RESPONDER,
      independentCorroboratingReportsCount: 2,
      nearbyGaugeAboveWarningOrHeavyRain: true,
    });

    const boatRank1 = calculateBoatPriority({
      peopleCount: 8,
      vulnerabilityFlags: { hasChild: true, elderly: true, medical: true, trapped: true },
      confidenceScore: conf1.score,
      waterTrend: 'RISING_RAPID',
      waitingMinutes: 45,
    });

    const dupEval = evaluateDuplicateCandidate({
      leftReport: { id: 'sos-demo-1', geohash7: 'wh0xs6m', peopleCount: 8, reportedAt: '2026-10-09T13:30:00Z' },
      rightReport: { id: 'sos-demo-2', geohash7: 'wh0xs6m', peopleCount: 7, reportedAt: '2026-10-09T13:40:00Z' },
      aiTextSimilarity: 0.92,
    });

    this.incidents = [
      {
        id: 'inc-feni-001',
        summary: 'Mirzanagar Ward 3 Embankment Overflow - 8 People Stranded on Roof',
        areaName: 'Mirzanagar / মির্জানগর',
        peopleCount: 8,
        urgencyFlags: { child: true, elderly: true, medical: true, trapped: true },
        confidence: conf1.score,
        confidenceReasons: conf1.breakdown.reasons,
        priorityScore: boatRank1.score,
        priorityReasons: boatRank1.factorBreakdown.reasons,
        status: 'OPEN',
        reportsCount: 2,
        linkedReportIds: ['sos-demo-1', 'sos-demo-2'],
        duplicateCandidate: {
          candidateId: 'dup-cand-001',
          similarityScore: dupEval.score,
          reasons: dupEval.reasonCodes,
          status: 'PENDING',
        },
        suggestedBoat: {
          assetId: '77777777-7777-7777-7777-777777777701',
          name: 'Engine Boat Red Crescent Unit 1',
          capacity: 12,
          suitability: 'SHALLOW_DRAFT',
          status: 'PROPOSED',
        },
      },
      {
        id: 'inc-feni-002',
        summary: 'Fulgazi Munshirhat Road Water Surge - Elderly couple trapped',
        areaName: 'Fulgazi / ফুলগাজী',
        peopleCount: 2,
        urgencyFlags: { child: false, elderly: true, medical: false, trapped: true },
        confidence: 0.55,
        confidenceReasons: ['Base score 0.40 from new user', 'Corroboration bonus +0.15 from 1 report'],
        priorityScore: 0.48,
        priorityReasons: ['People count: 2 (20% normalized)', 'Elderly flag active (25%)'],
        status: 'OPEN',
        reportsCount: 1,
        linkedReportIds: ['sos-demo-3'],
        suggestedBoat: {
          assetId: '77777777-7777-7777-7777-777777777702',
          name: 'Fire Service Inflatable Boat 2',
          capacity: 8,
          suitability: 'SWIFT_WATER',
          status: 'PROPOSED',
        },
      },
    ];
  }

  async getIncidents(eventId?: string): Promise<IncidentSummary[]> {
    if (eventId && eventId !== '11111111-1111-1111-1111-111111111103') return [];
    return this.incidents;
  }

  async getIncidentById(id: string): Promise<IncidentSummary | null> {
    return this.incidents.find((i) => i.id === id) || null;
  }

  async reviewDuplicateCandidate(
    incidentId: string,
    candidateId: string,
    decision: 'ACCEPT' | 'REJECT',
    reason: string,
    operatorUserId?: string,
  ): Promise<{ status: string; incident: IncidentSummary }> {
    const inc = this.incidents.find((i) => i.id === incidentId);
    if (!inc || !inc.duplicateCandidate || inc.duplicateCandidate.candidateId !== candidateId) {
      throw new Error('Candidate not found on incident');
    }

    const nextStatus = decision === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED';
    this.logger.log(
      `Operator reviewed duplicate candidate ${candidateId} on incident ${incidentId}: ${decision}. Reason: ${reason}`,
    );

    await this.auditService?.record({
      actorUserId: operatorUserId,
      action: decision === 'ACCEPT' ? 'MERGE_DUPLICATE_ACCEPTED' : 'MERGE_DUPLICATE_REJECTED',
      entityType: 'INCIDENT',
      entityId: incidentId,
      reason,
      afterSummary: { candidateId, decision, status: nextStatus },
    });

    inc.duplicateCandidate.status = nextStatus;

    if (this.duplicateRepository) {
      try {
        await this.duplicateRepository.update(
          { id: candidateId },
          { status: nextStatus, reviewed_by: operatorUserId, reviewed_at: new Date() },
        );
      } catch {
        // fallback
      }
    }

    return { status: 'success', incident: inc };
  }

  async reviewBoatSuggestion(
    incidentId: string,
    decision: 'ACCEPT' | 'REJECT',
    reason: string,
    operatorUserId?: string,
  ): Promise<{ status: string; incident: IncidentSummary }> {
    const inc = this.incidents.find((i) => i.id === incidentId);
    if (!inc || !inc.suggestedBoat) {
      throw new Error('Suggested boat not found on incident');
    }

    const prevStatus = inc.suggestedBoat.status;
    const nextStatus = decision === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED';
    this.logger.log(
      `Operator ${operatorUserId || 'RESPONDER'} reviewed boat ${inc.suggestedBoat.name} on incident ${incidentId}: ${decision}. Note: ${reason} (NO AUTO-DISPATCH)`,
    );

    await this.auditService?.record({
      actorUserId: operatorUserId || '00000000-0000-0000-0000-000000000003',
      action: decision === 'ACCEPT' ? 'BOAT_DISPATCH_PROPOSAL_ACCEPTED' : 'BOAT_DISPATCH_PROPOSAL_REJECTED',
      entityType: 'ASSET_PROPOSAL',
      entityId: inc.suggestedBoat.assetId,
      reason,
      beforeSummary: { incidentId, status: prevStatus },
      afterSummary: {
        incidentId,
        boatName: inc.suggestedBoat.name,
        decision,
        status: nextStatus,
        note: 'HUMAN APPROVAL ONLY: Recommendation acknowledged by responder; no automatic external dispatch triggered.',
      },
    });

    inc.suggestedBoat.status = nextStatus;

    if (this.dispatchRepository) {
      try {
        await this.dispatchRepository.update(
          { incident_id: incidentId, asset_id: inc.suggestedBoat.assetId },
          {
            status: nextStatus === 'ACCEPTED' ? 'ACCEPTED' : 'REJECTED',
            reviewed_by: operatorUserId,
            reviewed_at: new Date(),
            review_reason: reason,
          },
        );
      } catch {
        // fallback
      }
    }

    return { status: 'success', incident: inc };
  }

  async splitIncident(
    incidentId: string,
    reportIdToSeparate: string,
    reason: string,
    operatorUserId?: string,
  ): Promise<{ originalIncident: IncidentSummary; newIncident: IncidentSummary }> {
    const inc = this.incidents.find((i) => i.id === incidentId);
    if (!inc || !inc.linkedReportIds.includes(reportIdToSeparate)) {
      throw new Error('Report not linked to incident');
    }

    const newInc: IncidentSummary = {
      id: `inc-split-${Date.now().toString(36)}`,
      summary: `Split Report: ${reportIdToSeparate} separated from ${incidentId}`,
      areaName: inc.areaName,
      peopleCount: Math.max(1, Math.floor(inc.peopleCount / 2)),
      urgencyFlags: { ...inc.urgencyFlags },
      confidence: 0.40,
      confidenceReasons: [`Split from ${incidentId} by operator: ${reason}`],
      priorityScore: 0.35,
      priorityReasons: ['Default evaluation after unmerge'],
      status: 'OPEN',
      reportsCount: 1,
      linkedReportIds: [reportIdToSeparate],
    };

    await this.auditService?.record({
      actorUserId: operatorUserId,
      action: 'SPLIT_INCIDENT',
      entityType: 'INCIDENT',
      entityId: incidentId,
      reason,
      beforeSummary: { originalLinkedReportIds: [...inc.linkedReportIds, reportIdToSeparate] },
      afterSummary: {
        originalIncidentId: inc.id,
        separatedReportId: reportIdToSeparate,
        newIncidentId: newInc.id,
      },
    });

    inc.linkedReportIds = inc.linkedReportIds.filter((id) => id !== reportIdToSeparate);
    inc.reportsCount = inc.linkedReportIds.length;
    this.incidents.push(newInc);

    if (this.incidentRepository) {
      try {
        const statusEnum = IncidentStatus[newInc.status as keyof typeof IncidentStatus] ?? IncidentStatus.OPEN;
        const entity = this.incidentRepository.create({
          id: newInc.id,
          status: statusEnum,
          priority: newInc.priorityScore,
          confidence_score: newInc.confidence,
          confidence_breakdown: { reasons: newInc.confidenceReasons },
          summary: newInc.summary,
          opened_at: new Date(),
        });
        await this.incidentRepository.save(entity);
      } catch {
        // fallback
      }
    }
    this.logger.log(`Incident ${incidentId} split. Separated report ${reportIdToSeparate} into ${newInc.id}.`);

    return { originalIncident: inc, newIncident: newInc };
  }

  getSilentVillages(eventId?: string) {
    if (eventId && eventId !== '11111111-1111-1111-1111-111111111103') return [];
    // Evaluates silent village detection for seeded areas
    return SYNTHETIC_FENI_SEEDS.areas.map((a) => {
      const isChitholia = a.code === 'CHITHOLIA_VIL';
      const exposure = (a.exposure_level === 'EXTREME' || a.exposure_level === 'HIGH' || a.exposure_level === 'MEDIUM' || a.exposure_level === 'LOW') ? a.exposure_level : 'HIGH';
      return evaluateSilentVillage({
        areaId: a.id!,
        areaName: a.name_en!,
        exposureLevel: exposure,
        alertLevel: isChitholia ? 'WARNING' : 'NORMAL',
        minutesSinceLastReport: isChitholia ? 25 : 5,
        neighboringAreasReportingCount: isChitholia ? 3 : 1,
      });
    }).filter((r) => r.isSilentVillage);
  }
}

