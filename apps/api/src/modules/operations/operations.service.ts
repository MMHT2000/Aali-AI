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

@Injectable()
export class OperationsService {
  constructor(
    private readonly simulation: SimulationService,
    private readonly incidents: IncidentsService,
    private readonly sos: SosService,
    @InjectRepository(VolunteerReading) private readonly volunteerReadingRepository: Repository<VolunteerReading>,
    @Optional() private readonly auditService?: AuditService,
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

  async getSnapshot(role: UserRole) {
    const [incidents, reports] = await Promise.all([this.incidents.getIncidents(), this.sos.getReports()]);
    const simulation = this.simulation.getState();
    const canViewRescueOperations = [UserRole.AUTHORITY, UserRole.RESPONDER, UserRole.ADMIN].includes(role);
    const areas = SYNTHETIC_FENI_SEEDS.areas.map((area) => ({
      id: area.id,
      name: area.name_en,
      nameBn: area.name_bn,
      latitude: area.latitude,
      longitude: area.longitude,
      exposure: area.exposure_level,
      provenance: 'SYNTHETIC_FIXTURE',
    }));
    const areaFor = (name: string) => SYNTHETIC_FENI_SEEDS.areas.find((area) =>
      name.toLowerCase().includes((area.name_en ?? '').toLowerCase()) ||
      (area.name_en ?? '').toLowerCase().includes(name.split('/')[0].trim().toLowerCase()),
    );

    const mapLayers = {
      areas,
      gauges: SYNTHETIC_FENI_SEEDS.gauges.map((gauge) => {
        const area = SYNTHETIC_FENI_SEEDS.areas.find((item) => item.id === gauge.area_id);
        return { id: gauge.id, name: gauge.name, latitude: area?.latitude, longitude: area?.longitude, valueM: simulation.sourceData.gauge.valueM, status: simulation.sourceData.gauge.available ? 'REPORTING' : 'STALE', provenance: simulation.sourceData.gauge.source };
      }),
      shelters: SYNTHETIC_FENI_SEEDS.shelters.map((shelter) => {
        const area = SYNTHETIC_FENI_SEEDS.areas.find((item) => item.id === shelter.area_id);
        return { id: shelter.id, name: shelter.name_en, latitude: shelter.latitude ?? area?.latitude, longitude: shelter.longitude ?? area?.longitude, status: shelter.status, provenance: 'SYNTHETIC_FIXTURE' };
      }),
      assets: canViewRescueOperations ? SYNTHETIC_FENI_SEEDS.assets.map((asset) => {
        const area = SYNTHETIC_FENI_SEEDS.areas.find((item) => item.id === asset.area_id);
        return { id: asset.id, name: asset.name, latitude: asset.latitude ?? area?.latitude, longitude: asset.longitude ?? area?.longitude, status: asset.availability_status, provenance: 'SYNTHETIC_FIXTURE' };
      }) : [],
      incidents: canViewRescueOperations ? incidents.map((incident) => {
        const area = areaFor(incident.areaName);
        return { id: incident.id, label: incident.summary, latitude: area?.latitude, longitude: area?.longitude, status: incident.status, peopleCount: incident.peopleCount, provenance: 'SYNTHETIC_FIXTURE' };
      }) : [],
      sos: canViewRescueOperations ? reports.map((report) => ({
        id: report.id,
        latitude: report.location_lat,
        longitude: report.location_lng,
        status: report.review_status,
        peopleCount: report.people_count,
        provenance: 'API_SUBMITTED_REPORT',
      })) : [],
    };

    const simulationForRole = canViewRescueOperations ? simulation : {
      scenarioId: simulation.scenarioId,
      scenarioName: simulation.scenarioName,
      provenance: simulation.provenance,
      isReconstructed: simulation.isReconstructed,
      mode: simulation.mode,
      tickIndex: simulation.tickIndex,
      totalTicks: simulation.totalTicks,
      running: simulation.running,
      simulatedAt: simulation.simulatedAt,
      alert: { computedLevel: simulation.alert.computedLevel },
    };

    return {
      generatedAt: new Date().toISOString(),
      role,
      simulation: simulationForRole,
      mapLayers,
      queue: {
        activeIncidents: canViewRescueOperations ? incidents.filter((item) => item.status !== 'CLOSED').length : undefined,
        strandedPeople: canViewRescueOperations ? incidents.reduce((sum, item) => sum + item.peopleCount, 0) : undefined,
        incomingSimulatedSos: canViewRescueOperations ? simulation.incomingSos : undefined,
        reportsPendingReview: canViewRescueOperations ? reports.filter((item) => item.review_status === 'NEEDS_REVIEW').length : undefined,
      },
    };
  }
}
