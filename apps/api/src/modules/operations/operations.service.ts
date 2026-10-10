import { Injectable } from '@nestjs/common';
import { UserRole } from '../users/entities/user-role.enum';
import { SYNTHETIC_FENI_SEEDS } from '../../database/seeds/feni-synthetic.seeds';
import { IncidentsService } from '../incidents/incidents.service';
import { SosService } from '../sos/sos.service';
import { SimulationService } from './simulation.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VolunteerReading } from '../gauges/entities/observation.entity';
import { CreateFieldReadingDto } from './field-reading.dto';
import { BadRequestException } from '@nestjs/common';

import { AuditService } from '../audit/audit.service';
import { Optional } from '@nestjs/common';
import { FloodEventMode } from '../flood-events/entities/flood-event.entity';
import { REPLAY_SCENARIOS } from '../../domain/flood-alert/replay-scenarios';
import { OperationsMode, OperationsProvenance, OperationsSourceStatus } from './operations-context';
import { OperationsSnapshotQueryDto } from './operations-snapshot-query.dto';
import { BmdCapService } from './bmd-cap.service';

@Injectable()
export class OperationsService {
  constructor(
    private readonly simulation: SimulationService,
    private readonly incidents: IncidentsService,
    private readonly sos: SosService,
    @InjectRepository(VolunteerReading) private readonly volunteerReadingRepository: Repository<VolunteerReading>,
    @Optional() private readonly auditService?: AuditService,
    @Optional() private readonly bmdCapService?: BmdCapService,
  ) {}

  async recordFieldReading(dto: CreateFieldReadingDto, submittedBy: string) {
    const area = SYNTHETIC_FENI_SEEDS.areas.find((item) => item.id === dto.areaId && item.area_type === 'VILLAGE');
    if (!area) throw new BadRequestException('Select a known village from the synthetic Feni fixture.');
    const readingData = {
      id: `field-reading-${Date.now()}`,
      event_id: '11111111-1111-1111-1111-111111111103',
      area_id: area.id,
      gauge_id: '33333333-3333-3333-3333-333333333301',
      submitted_by: submittedBy,
      observed_at: new Date(),
      level_m: dto.levelM,
      raw_message: dto.note ?? null,
      parse_status: 'PARSED',
      source_kind: 'VOLUNTEER_APP',
      provenance: 'API_SUBMITTED_FIELD_READING',
    };

    let saved = readingData as unknown as VolunteerReading;
    if (this.volunteerReadingRepository?.manager?.connection?.isInitialized) {
      const entity = this.volunteerReadingRepository.create(readingData);
      saved = await this.volunteerReadingRepository.save(entity);
    }

    await this.auditService?.record({
      actorUserId: submittedBy,
      action: 'SUBMIT_FIELD_READING',
      entityType: 'VOLUNTEER_READING',
      entityId: saved.id,
      reason: `Volunteer field reading of ${dto.levelM}m at ${area.name_en}`,
      afterSummary: {
        areaId: area.id,
        levelM: dto.levelM,
        note: dto.note,
      },
    });

    return saved;
  }

  async getSnapshot(role: UserRole, query: OperationsSnapshotQueryDto = {}) {
    return this.getContextSnapshot(role, query);
  }

  private async getContextSnapshot(role: UserRole, query: OperationsSnapshotQueryDto) {
    const mode = query.mode ?? OperationsMode.EXERCISE;
    const context = this.resolveContext(mode, query.eventId);
    const isAuthority = role === UserRole.AUTHORITY;
    const isResponder = role === UserRole.RESPONDER;
    const canSeeRescueRecords = isAuthority || isResponder;
    const simulation = mode === OperationsMode.EXERCISE ? this.simulation.getState() : undefined;
    const shouldLoadReports = canSeeRescueRecords && (mode === OperationsMode.LIVE || mode === OperationsMode.EXERCISE);
    const shouldLoadIncidents = canSeeRescueRecords && mode === OperationsMode.EXERCISE;
    const [allIncidents, allReports] = await Promise.all([
      shouldLoadIncidents ? this.incidents.getIncidents() : Promise.resolve([]),
      shouldLoadReports ? this.sos.getReports() : Promise.resolve([]),
    ]);
    const activeEventIds = new Set(SYNTHETIC_FENI_SEEDS.floodEvents.filter((event) => event.status === 'ACTIVE').map((event) => event.id));
    const reports = mode === OperationsMode.HISTORICAL
      ? []
      : mode === OperationsMode.EXERCISE
        ? allReports.filter((report) => report.event_id === context.event?.id)
        : allReports.filter((report) => Boolean(report.event_id && activeEventIds.has(report.event_id)) && report.transport_kind !== 'GATEWAY_SIMULATED');
    const incidents = mode === OperationsMode.EXERCISE ? allIncidents : [];
    const isOperationalRole = isAuthority || isResponder;
    const isVolunteer = role === UserRole.VOLUNTEER;
    const isRecovery = role === UserRole.RECOVERY_COORDINATOR;
    const isViewer = role === UserRole.VIEWER;
    const isAdmin = role === UserRole.ADMIN;
    const generatedAt = new Date().toISOString();
    const areas = SYNTHETIC_FENI_SEEDS.areas
      .filter((area) => !isAdmin && (!(isVolunteer || isRecovery) || area.area_type === 'VILLAGE'))
      .map((area) => ({
        id: area.id,
        name: area.name_en,
        nameBn: area.name_bn,
        areaType: area.area_type,
        latitude: area.latitude,
        longitude: area.longitude,
        exposure: area.exposure_level,
        provenance: OperationsProvenance.SYNTHETIC_FIXTURE,
      }));
    const areaFor = (name: string) => SYNTHETIC_FENI_SEEDS.areas.find((area) =>
      name.toLowerCase().includes((area.name_en ?? '').toLowerCase()) ||
      (area.name_en ?? '').toLowerCase().includes(name.split('/')[0].trim().toLowerCase()),
    );
    const isFieldOrSituationRole = isAuthority || isResponder || isVolunteer || isViewer;
    const canSeeShelters = (isAuthority || isResponder || isRecovery || isViewer) && mode === OperationsMode.EXERCISE;
    const canSeeRescueResources = isAuthority || isResponder;
    const canSeeReports = canSeeRescueRecords;
    const mapLayers = {
      areas,
      gauges: isFieldOrSituationRole && !isRecovery && mode === OperationsMode.EXERCISE && simulation
        ? SYNTHETIC_FENI_SEEDS.gauges.map((gauge) => {
          const area = SYNTHETIC_FENI_SEEDS.areas.find((item) => item.id === gauge.area_id);
          return { id: gauge.id, name: gauge.name, latitude: area?.latitude, longitude: area?.longitude, valueM: simulation.sourceData.gauge.valueM, status: simulation.sourceData.gauge.available ? 'REPORTING' : 'STALE', provenance: OperationsProvenance.SYNTHETIC_SIMULATION };
        }) : [],
      shelters: canSeeShelters ? SYNTHETIC_FENI_SEEDS.shelters.map((shelter) => ({
        id: shelter.id, name: shelter.name_en, latitude: shelter.latitude, longitude: shelter.longitude,
        status: shelter.status, provenance: OperationsProvenance.SYNTHETIC_FIXTURE,
      })) : [],
      assets: canSeeRescueResources && mode === OperationsMode.EXERCISE ? SYNTHETIC_FENI_SEEDS.assets.map((asset) => ({
        id: asset.id, name: asset.name, latitude: asset.latitude, longitude: asset.longitude,
        status: asset.availability_status, provenance: OperationsProvenance.SYNTHETIC_FIXTURE,
      })) : [],
      incidents: canSeeRescueResources ? incidents.map((incident) => {
        const area = areaFor(incident.areaName);
        return { id: incident.id, label: incident.summary, latitude: area?.latitude, longitude: area?.longitude, status: incident.status, peopleCount: incident.peopleCount, provenance: OperationsProvenance.SYNTHETIC_FIXTURE };
      }) : [],
      sos: canSeeReports ? reports.map((report, idx) => {
        let area = SYNTHETIC_FENI_SEEDS.areas.find((item) => item.id === report.area_id);
        if (!area && report.geohash7) {
          area = SYNTHETIC_FENI_SEEDS.areas.find((item) => item.geohash7 === report.geohash7);
        }
        const areaLabel = area ? (area.name_bn || area.name_en) : 'Feni District';
        const lat = report.location_lat ?? area?.latitude ?? (23.015 + ((idx * 7) % 20 - 10) * 0.003);
        const lng = report.location_lng ?? area?.longitude ?? (91.397 + ((idx * 13) % 20 - 10) * 0.003);
        return {
          id: report.id,
          shortId: report.packet_short_id,
          name: area ? `${area.name_en} (${report.packet_short_id})` : `SOS ${report.packet_short_id ?? report.id.slice(0, 8)}`,
          label: `${areaLabel} · ${report.people_count} people affected`,
          latitude: Number(lat),
          longitude: Number(lng),
          status: report.review_status,
          peopleCount: report.people_count,
          hasChild: report.has_child,
          hasMedicalNeed: report.has_medical_need,
          isTrapped: report.is_trapped,
          elderlyCount: report.elderly_count,
          geohash7: report.geohash7,
          receivedAt: report.received_at,
          provenance: OperationsProvenance.API_SUBMITTED_REPORT,
        };
      }) : [],
    };
    const bmdSnapshot = mode === OperationsMode.LIVE && this.bmdCapService
      ? await this.bmdCapService.getSnapshot()
      : undefined;
    const sources = this.getSourceStatuses(mode, generatedAt, bmdSnapshot?.status);
    const historicalReplay = mode === OperationsMode.HISTORICAL
      ? REPLAY_SCENARIOS.find((scenario) => scenario.id === context.event?.id)
      : undefined;

    return {
      generatedAt,
      role,
      context: {
        mode,
        event: context.event ? {
          id: context.event.id,
          name: context.event.name,
          startAt: context.event.start_at,
          endAt: context.event.end_at,
          isReconstructed: context.event.is_reconstructed,
          provenance: mode === OperationsMode.HISTORICAL
            ? OperationsProvenance.HISTORICAL_RECONSTRUCTION
            : OperationsProvenance.SYNTHETIC_FIXTURE,
          provenanceNote: context.event.provenance_note,
        } : null,
        sources,
      },
      externalAlerts: mode === OperationsMode.LIVE ? bmdSnapshot?.alerts ?? [] : [],
      simulation: isOperationalRole && mode === OperationsMode.EXERCISE ? simulation : undefined,
      historicalReplay: historicalReplay ? {
        scenarioId: historicalReplay.id,
        title: historicalReplay.name,
        period: historicalReplay.period,
        isReconstructed: true,
        provenance: OperationsProvenance.HISTORICAL_RECONSTRUCTION,
        sourceVerification: 'FIXTURE_CITATIONS_NOT_YET_AUDITED',
        ticks: historicalReplay.ticks,
      } : undefined,
      mapLayers,
      queue: {
        activeIncidents: isOperationalRole && mode === OperationsMode.EXERCISE ? incidents.filter((item) => item.status !== 'CLOSED').length : undefined,
        strandedPeople: isOperationalRole && mode === OperationsMode.EXERCISE ? incidents.reduce((sum, item) => sum + item.peopleCount, 0) : undefined,
        incomingSimulatedSos: isOperationalRole && mode === OperationsMode.EXERCISE ? simulation?.incomingSos : undefined,
        reportsPendingReview: canSeeReports ? reports.filter((item) => item.review_status === 'NEEDS_REVIEW').length : undefined,
      },
      visibility: {
        sos: canSeeReports,
        incidents: canSeeRescueResources,
        assets: canSeeRescueResources,
        simulationControls: isAuthority || isAdmin,
        aggregateOnly: isViewer || isAdmin,
      },
    };
  }

  private resolveContext(mode: OperationsMode, eventId?: string) {
    if (mode === OperationsMode.LIVE) {
      if (eventId) throw new BadRequestException('Live source mode does not select a replay or exercise event.');
      return { event: null as (typeof SYNTHETIC_FENI_SEEDS.floodEvents)[number] | null };
    }
    const expectedMode = mode === OperationsMode.EXERCISE ? FloodEventMode.DEMO : FloodEventMode.REPLAY;
    const candidates = SYNTHETIC_FENI_SEEDS.floodEvents.filter((event) => event.mode === expectedMode);
    const event = eventId ? candidates.find((candidate) => candidate.id === eventId) : candidates[0];
    if (!event) throw new BadRequestException(`Event is not available in ${mode.toLowerCase()} mode.`);
    return { event };
  }

  private getSourceStatuses(mode: OperationsMode, checkedAt: string, bmdStatus?: OperationsSourceStatus): OperationsSourceStatus[] {
    if (mode === OperationsMode.EXERCISE) return [
      { id: 'exercise-scenario', label: 'Synthetic exercise scenario', availability: 'SYNTHETIC', lastCheckedAt: checkedAt, latestObservedAt: null, ageSeconds: null, message: 'Deterministic fixture values; not a live observation. Scenario observation time is not modeled.', provenance: OperationsProvenance.SYNTHETIC_SIMULATION },
      { id: 'ffwc', label: 'FFWC river data', availability: 'UNAVAILABLE', lastCheckedAt: null, latestObservedAt: null, ageSeconds: null, message: 'External provider adapter is not configured.', provenance: OperationsProvenance.EXTERNAL_OBSERVATION },
      { id: 'bmd', label: 'BMD alerts', availability: 'UNAVAILABLE', lastCheckedAt: null, latestObservedAt: null, ageSeconds: null, message: 'External provider adapter is not configured.', provenance: OperationsProvenance.EXTERNAL_OBSERVATION },
      { id: 'gsmap', label: 'GSMaP rainfall', availability: 'UNAVAILABLE', lastCheckedAt: null, latestObservedAt: null, ageSeconds: null, message: 'External provider adapter is not configured.', provenance: OperationsProvenance.EXTERNAL_OBSERVATION },
    ];
    if (mode === OperationsMode.HISTORICAL) return [
      { id: 'historical-fixture', label: 'Historical replay fixture', availability: 'RECONSTRUCTED', lastCheckedAt: checkedAt, latestObservedAt: null, ageSeconds: null, message: 'Reconstruction fixture; source records and gaps have not yet been verified.', provenance: OperationsProvenance.HISTORICAL_RECONSTRUCTION },
    ];
    return [
      { id: 'aali-reports', label: 'Aali API-submitted reports', availability: 'AVAILABLE', lastCheckedAt: checkedAt, latestObservedAt: null, ageSeconds: null, message: 'Application API state only; source report times remain on each record.', provenance: OperationsProvenance.API_SUBMITTED_REPORT },
      { id: 'ffwc', label: 'FFWC river data', availability: 'UNAVAILABLE', lastCheckedAt: null, latestObservedAt: null, ageSeconds: null, message: 'External provider adapter is not configured.', provenance: OperationsProvenance.EXTERNAL_OBSERVATION },
      bmdStatus ?? { id: 'bmd', label: 'BMD CAP public alerts', availability: 'UNAVAILABLE', lastCheckedAt: null, latestObservedAt: null, ageSeconds: null, message: 'Public CAP feed has not been checked yet.', provenance: OperationsProvenance.EXTERNAL_OBSERVATION },
      { id: 'gsmap', label: 'GSMaP rainfall', availability: 'UNAVAILABLE', lastCheckedAt: null, latestObservedAt: null, ageSeconds: null, message: 'External provider adapter is not configured.', provenance: OperationsProvenance.EXTERNAL_OBSERVATION },
    ];
  }
}
