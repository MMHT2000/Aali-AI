import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { encodeDisasterPacket } from '../../common/packet/disaster-packet';
import { SosService } from '../sos/sos.service';
import { GatewayService } from './gateway.service';

describe('GatewayService (Simulation & Deduplication)', () => {
  let gatewayService: GatewayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GatewayService, SosService],
    }).compile();

    gatewayService = module.get<GatewayService>(GatewayService);
  });

  const validPacket = encodeDisasterPacket({
    geohash7: 'wh0xs6m',
    peopleCount: 3,
    flags: {
      elderly: false,
      child: true,
      medical: true,
      trapped: false,
    },
    timestamp: '261009-1430',
    shortId: '9K2M',
  });

  it('should ingest valid simulated packet and return simulation: true', async () => {
    const result = await gatewayService.ingestSimulatedPacket({
      packet: validPacket,
      gatewayId: 'TEST-GW-01',
    });

    expect(result.simulation).toBe(true);
    expect(result.status).toBe('ACCEPTED');
    expect(result.isIdempotentDuplicate).toBe(false);
    expect(result.reportId).toBeDefined();
    expect(result.packetChecksum).toBeDefined();
  });

  it('should idempotently ignore identical packet resubmission and not duplicate reports', async () => {
    const firstResult = await gatewayService.ingestSimulatedPacket({
      packet: validPacket,
      gatewayId: 'TEST-GW-01',
    });

    const secondResult = await gatewayService.ingestSimulatedPacket({
      packet: validPacket,
      gatewayId: 'TEST-GW-01',
    });

    expect(secondResult.isIdempotentDuplicate).toBe(true);
    expect(secondResult.status).toBe('DUPLICATE_IGNORED');
    expect(secondResult.reportId).toBe(firstResult.reportId);
  });

  it('should reject malformed or tampered packet with BadRequestException', async () => {
    const tamperedPacket = validPacket.replace('|03|', '|88|');
    await expect(
      gatewayService.ingestSimulatedPacket({
        packet: tamperedPacket,
      }),
    ).rejects.toThrow(BadRequestException);
  });
});

