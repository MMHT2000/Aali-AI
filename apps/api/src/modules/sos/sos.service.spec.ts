import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { encodeDisasterPacket } from '../../common/packet/disaster-packet';
import { SosReport } from './entities/sos-report.entity';
import { SosService } from './sos.service';

describe('SosService persistence contract', () => {
  let service: SosService;
  const stored = new Map<string, SosReport>();

  beforeEach(async () => {
    stored.clear();
    const module = await Test.createTestingModule({
      providers: [SosService, {
        provide: getRepositoryToken(SosReport),
        useValue: {
          findOneBy: async (where: { client_report_id?: string; id?: string }) => Array.from(stored.values()).find((report) => where.client_report_id ? report.client_report_id === where.client_report_id : report.id === where.id) ?? null,
          create: (values: Partial<SosReport>) => Object.assign(new SosReport(), values),
          save: async (report: SosReport) => { report.id ??= `test-${stored.size + 1}`; stored.set(report.client_report_id, report); return report; },
          find: async () => Array.from(stored.values()),
        },
      }],
    }).compile();
    service = module.get(SosService);
  });

  const packet = encodeDisasterPacket({ geohash7: 'wh0xs4a', peopleCount: 2, flags: { elderly: true, child: false, medical: true, trapped: true }, timestamp: '261010-1200', shortId: 'A1B2' });
  const input = { clientReportId: 'mobile-contract-1', peopleCount: 2, elderlyCount: 1, hasChild: false, hasMedicalNeed: true, isTrapped: true, packet };

  it('stores canonical client packet evidence and deduplicates by client report ID', async () => {
    const first = await service.createSos(input);
    const duplicate = await service.createSos(input);
    expect(first.report.geohash7).toBe('wh0xs4a');
    expect(first.report.packet_checksum).toBeDefined();
    expect(duplicate.isDuplicate).toBe(true);
    expect(duplicate.report.id).toBe(first.report.id);
    expect(stored.size).toBe(1);
  });

  it('preserves the report only when the packet validates and its SOS fields match', async () => {
    await expect(service.createSos({ ...input, packet: packet.replace(/.$/, '0') })).rejects.toThrow('Packet validation failed');
    await expect(service.createSos({ ...input, peopleCount: 3 })).rejects.toThrow('do not match');
    expect(stored.size).toBe(0);
  });
  it('preserves zero latitude and longitude instead of replacing them with a village centroid', async () => {
    const result = await service.createSos({ peopleCount: 1, isTrapped: false, locationLat: 0, locationLng: 0, areaId: '22222222-2222-2222-2222-222222222205' });
    expect(result.report.location_lat).toBe(0);
    expect(result.report.location_lng).toBe(0);
  });
});
