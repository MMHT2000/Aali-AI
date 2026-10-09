import { BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { VolunteerReading } from '../gauges/entities/observation.entity';
import { UserRole } from '../users/entities/user-role.enum';
import { OperationsMode, OperationsProvenance } from './operations-context';
import { OperationsService } from './operations.service';
import { BmdCapService } from './bmd-cap.service';
import { SimulationService } from './simulation.service';
import { IncidentSummary, IncidentsService } from '../incidents/incidents.service';
import { SosService } from '../sos/sos.service';
import { SosReport } from '../sos/entities/sos-report.entity';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { OperationsSnapshotQueryDto } from './operations-snapshot-query.dto';

const demoEventId = '11111111-1111-1111-1111-111111111103';
const historicalEventId = '11111111-1111-1111-1111-111111111101';

function createService(bmdCapService?: BmdCapService) {
  const simState = {
    scenarioId: 'feni-synthetic-rising-water-v1',
    scenarioName: 'Feni Synthetic Rising Water Exercise',
    provenance: 'SYNTHETIC_SCENARIO_FIXTURE',
    isReconstructed: false,
    mode: 'SIMULATION',
    tickIndex: 0,
    totalTicks: 5,
    running: false,
    speed: 1,
    simulatedAt: '2026-10-10T00:00:00.000Z',
    sourceData: {
      gauge: { valueM: 11.2, available: true, source: 'SYNTHETIC_GAUGE_FIXTURE' },
      rainfall: { valueMm: 22, available: true, source: 'SYNTHETIC_RAINFALL_FIXTURE' },
      volunteerReading: { available: false, source: 'SYNTHETIC_VOLUNTEER_FIXTURE' },
    },
    alert: { computedLevel: 'WATCH', reasonCodes: ['GAUGE_RISE'] },
    incomingSos: 0,
    connectivity: { internetAvailable: true, source: 'SIMULATION_CONTROL' },
  };
  const simulation = { getState: jest.fn(() => simState) } as unknown as SimulationService;
  const incidents: IncidentSummary[] = [{
    id: 'incident-fixture-1', summary: 'Synthetic incident', areaName: 'Parshuram', peopleCount: 3,
    urgencyFlags: { child: false, elderly: false, medical: false, trapped: false },
    confidence: 0.7, confidenceReasons: [], priorityScore: 0.6, priorityReasons: [], status: 'OPEN',
    reportsCount: 1, linkedReportIds: [],
  }];
  const incidentsService = { getIncidents: jest.fn().mockResolvedValue(incidents) } as unknown as IncidentsService;
  const reports = [
    { id: 'direct-report', event_id: demoEventId, transport_kind: 'APP_DIRECT', review_status: 'NEEDS_REVIEW', people_count: 2, received_at: new Date('2026-10-10T00:00:00Z') },
    { id: 'gateway-report', event_id: demoEventId, transport_kind: 'GATEWAY_SIMULATED', review_status: 'NEEDS_REVIEW', people_count: 1, received_at: new Date('2026-10-10T00:01:00Z') },
    { id: 'historical-report', event_id: historicalEventId, transport_kind: 'APP_DIRECT', review_status: 'NEEDS_REVIEW', people_count: 4, received_at: new Date('2024-08-20T00:00:00Z') },
  ] as SosReport[];
  const sosService = { getReports: jest.fn().mockResolvedValue(reports) } as unknown as SosService;
  const repository = {} as Repository<VolunteerReading>;
  return { service: new OperationsService(simulation, incidentsService, sosService, repository, undefined, bmdCapService), simulation, incidentsService, sosService };
}

describe('OperationsService snapshot context and role projections', () => {
  it('defaults to the active synthetic exercise and scopes exercise reports to the selected event', async () => {
    const { service } = createService();
    const snapshot = await service.getSnapshot(UserRole.AUTHORITY);

    expect(snapshot.context.mode).toBe(OperationsMode.EXERCISE);
    expect(snapshot.context.event?.id).toBe(demoEventId);
    expect(snapshot.simulation?.scenarioId).toBe('feni-synthetic-rising-water-v1');
    expect(snapshot.mapLayers.sos.map((report) => report.id)).toEqual(['direct-report', 'gateway-report']);
    expect(snapshot.mapLayers.sos.every((report) => report.provenance === 'API_SUBMITTED_REPORT')).toBe(true);
    expect(snapshot.context.sources.find((source) => source.id === 'ffwc')?.availability).toBe('UNAVAILABLE');
  });

  it('limits volunteer, recovery, viewer and administrator layers to their role needs', async () => {
    const { service } = createService();
    const volunteer = await service.getSnapshot(UserRole.VOLUNTEER);
    const recovery = await service.getSnapshot(UserRole.RECOVERY_COORDINATOR);
    const viewer = await service.getSnapshot(UserRole.VIEWER);
    const admin = await service.getSnapshot(UserRole.ADMIN);

    expect(volunteer.mapLayers.areas.every((area) => area.areaType === 'VILLAGE')).toBe(true);
    expect(volunteer.mapLayers.sos).toHaveLength(0);
    expect(volunteer.mapLayers.assets).toHaveLength(0);
    expect(volunteer.visibility.simulationControls).toBe(false);
    expect(recovery.mapLayers.shelters.length).toBeGreaterThan(0);
    expect(recovery.mapLayers.sos).toHaveLength(0);
    expect(recovery.mapLayers.assets).toHaveLength(0);
    expect(viewer.mapLayers.sos).toHaveLength(0);
    expect(viewer.mapLayers.incidents).toHaveLength(0);
    expect(viewer.visibility.aggregateOnly).toBe(true);
    expect(admin.mapLayers.sos).toHaveLength(0);
    expect(admin.visibility.aggregateOnly).toBe(true);
    expect(admin.visibility.simulationControls).toBe(true);
  });

  it('keeps Live mode free of exercise fixtures and reports external feeds unavailable', async () => {
    const { service } = createService();
    const snapshot = await service.getSnapshot(UserRole.AUTHORITY, { mode: OperationsMode.LIVE });

    expect(snapshot.context.event).toBeNull();
    expect(snapshot.simulation).toBeUndefined();
    expect(snapshot.mapLayers.gauges).toHaveLength(0);
    expect(snapshot.mapLayers.incidents).toHaveLength(0);
    expect(snapshot.mapLayers.sos.map((report) => report.id)).toEqual(['direct-report']);
    expect(snapshot.context.sources.filter((source) => ['ffwc', 'bmd'].includes(source.id)).every((source) => source.availability === 'UNAVAILABLE')).toBe(true);
  });

  it('includes BMD public advisories only in Live mode and keeps them separate from rule output', async () => {
    const bmd = new BmdCapService();
    const getBmdSnapshot = jest.spyOn(bmd, 'getSnapshot').mockResolvedValue({
        alerts: [{ id: 'cap-alert-1', headline: 'Public source advisory', description: null, instruction: null, severity: 'Severe', urgency: 'Immediate', certainty: 'Likely', areas: ['Feni'], issuedAt: null, effectiveAt: null, expiresAt: '2026-10-11T00:00:00.000Z', sourceUrl: 'https://cap.bmd.gov.bd/api/cap/alert.xml', fetchedAt: new Date().toISOString(), provenance: OperationsProvenance.EXTERNAL_OBSERVATION }],
        status: { id: 'bmd', label: 'BMD CAP', availability: 'AVAILABLE', lastCheckedAt: new Date().toISOString(), latestObservedAt: null, ageSeconds: null, message: 'Feed checked.', provenance: OperationsProvenance.EXTERNAL_OBSERVATION },
    });
    const { service } = createService(bmd);

    const live = await service.getSnapshot(UserRole.AUTHORITY, { mode: OperationsMode.LIVE });
    const exercise = await service.getSnapshot(UserRole.AUTHORITY, { mode: OperationsMode.EXERCISE });
    const historical = await service.getSnapshot(UserRole.AUTHORITY, { mode: OperationsMode.HISTORICAL });

    expect(live.externalAlerts).toHaveLength(1);
    expect(live.externalAlerts?.[0].provenance).toBe('EXTERNAL_OBSERVATION');
    expect(exercise.externalAlerts).toEqual([]);
    expect(historical.externalAlerts).toEqual([]);
    expect(getBmdSnapshot).toHaveBeenCalledTimes(1);
  });

  it('keeps historical replay distinct and labels fixture provenance as unverified', async () => {
    const { service } = createService();
    const snapshot = await service.getSnapshot(UserRole.AUTHORITY, { mode: OperationsMode.HISTORICAL });

    expect(snapshot.context.event?.id).toBe(historicalEventId);
    expect(snapshot.simulation).toBeUndefined();
    expect(snapshot.historicalReplay?.isReconstructed).toBe(true);
    expect(snapshot.historicalReplay?.sourceVerification).toBe('FIXTURE_CITATIONS_NOT_YET_AUDITED');
    expect(snapshot.context.sources[0].availability).toBe('RECONSTRUCTED');
    expect(snapshot.mapLayers.sos).toHaveLength(0);
  });

  it('rejects event IDs that do not belong to the selected mode', async () => {
    const { service } = createService();
    await expect(service.getSnapshot(UserRole.AUTHORITY, { mode: OperationsMode.HISTORICAL, eventId: demoEventId }))
      .rejects.toBeInstanceOf(BadRequestException);
    await expect(service.getSnapshot(UserRole.AUTHORITY, { mode: OperationsMode.LIVE, eventId: demoEventId }))
      .rejects.toBeInstanceOf(BadRequestException);
  });

  it('accepts the repository stable event ID format and rejects malformed query values', async () => {
    const valid = plainToInstance(OperationsSnapshotQueryDto, { mode: 'HISTORICAL', eventId: historicalEventId });
    const invalid = plainToInstance(OperationsSnapshotQueryDto, { mode: 'NOT_A_MODE', eventId: 'bad-id' });
    await expect(validate(valid)).resolves.toHaveLength(0);
    await expect(validate(invalid)).resolves.toHaveLength(2);
  });
});
