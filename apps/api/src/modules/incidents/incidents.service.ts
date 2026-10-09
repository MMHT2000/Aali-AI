import { Injectable, Logger } from '@nestjs/common';
import { calculateBoatPriority } from '../../domain/boat-priority/boat-priority';
import { calculateConfidenceScore } from '../../domain/confidence/confidence';
import { evaluateDuplicateCandidate } from '../../domain/duplicate/duplicate';
import { evaluateSilentVillage } from '../../domain/silent-village/silent-village';
import { SYNTHETIC_FENI_SEEDS } from '../../database/seeds/feni-synthetic.seeds';
import { SosSourceType } from '../sos/entities/sos-report.entity';
import { SosService } from '../sos/sos.service';

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
  };
}

@Injectable()
export class IncidentsService {
  private readonly logger = new Logger(IncidentsService.name);
  private incidents: IncidentSummary[] = [];

  constructor(private readonly sosService: SosService) {
    this.initDemoIncidents();
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
        },
      },
    ];
  }

  async getIncidents(): Promise<IncidentSummary[]> {
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
  ): Promise<{ status: string; incident: IncidentSummary }> {
    const inc = this.incidents.find((i) => i.id === incidentId);
    if (!inc || !inc.duplicateCandidate || inc.duplicateCandidate.candidateId !== candidateId) {
      throw new Error('Candidate not found on incident');
    }

    inc.duplicateCandidate.status = decision === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED';
    this.logger.log(
      `Operator reviewed duplicate candidate ${candidateId} on incident ${incidentId}: ${decision}. Reason: ${reason}`,
    );

    return { status: 'success', incident: inc };
  }

  async splitIncident(
    incidentId: string,
    reportIdToSeparate: string,
    reason: string,
  ): Promise<{ originalIncident: IncidentSummary; newIncident: IncidentSummary }> {
    const inc = this.incidents.find((i) => i.id === incidentId);
    if (!inc || !inc.linkedReportIds.includes(reportIdToSeparate)) {
      throw new Error('Report not linked to incident');
    }

    inc.linkedReportIds = inc.linkedReportIds.filter((id) => id !== reportIdToSeparate);
    inc.reportsCount = inc.linkedReportIds.length;

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

    this.incidents.push(newInc);
    this.logger.log(`Incident ${incidentId} split. Separated report ${reportIdToSeparate} into ${newInc.id}.`);
    return { originalIncident: inc, newIncident: newInc };
  }

  getSilentVillages() {
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

