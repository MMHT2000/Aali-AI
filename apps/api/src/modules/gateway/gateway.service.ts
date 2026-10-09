import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { parseDisasterPacket } from '../../common/packet/disaster-packet';
import { SosSourceType } from '../sos/entities/sos-report.entity';
import { SosService } from '../sos/sos.service';
import { SimulatedGatewayIngestDto } from './dto/gateway-ingest.dto';
import { SmsGatewayIngestResult } from './transport-adapter.interface';

@Injectable()
export class GatewayService {
  private readonly logger = new Logger(GatewayService.name);
  // Store gateway message traces for auditing packet arrivals
  private readonly gatewayTraces: Map<string, {
    packetChecksum: string;
    receivedAt: string;
    clientReportId: string;
    gatewayId: string;
    reportId: string;
  }> = new Map();

  constructor(private readonly sosService: SosService) {}

  async ingestSimulatedPacket(dto: SimulatedGatewayIngestDto): Promise<SmsGatewayIngestResult> {
    const rawPacket = dto.packet.trim();
    const gatewayId = dto.gatewayId || 'GATEWAY_SIMULATOR_DEFAULT';
    const receivedAt = dto.receivedAt || new Date().toISOString();

    // 1. Validate packet checksum and schema
    const parseOutcome = parseDisasterPacket(rawPacket);
    if (parseOutcome.status !== 'VALID') {
      this.logger.warn(`Simulated gateway rejected invalid packet: ${parseOutcome.status}`);
      throw new BadRequestException({
        statusCode: 400,
        error: 'Bad Request',
        message: `Packet validation failed: ${parseOutcome.status}`,
        details: parseOutcome,
      });
    }

    const { data, checksum } = parseOutcome;
    const clientReportId = `SOS-PKT-${data.shortId}-${checksum}`;

    // 2. Idempotency check: has this packet already been processed?
    const existingTrace = this.gatewayTraces.get(checksum);
    if (existingTrace) {
      this.logger.log(`Duplicate gateway packet received with checksum=${checksum}. Idempotently ignoring duplicate ingest.`);
      return {
        simulation: true,
        gatewayId,
        reportId: existingTrace.reportId,
        clientReportId: existingTrace.clientReportId,
        packetChecksum: checksum,
        isIdempotentDuplicate: true,
        status: 'DUPLICATE_IGNORED',
        receivedAt,
      };
    }

    // 3. Create SOS report via SosService
    const { report } = await this.sosService.createSos({
      clientReportId,
      peopleCount: data.peopleCount,
      elderlyCount: data.flags.elderly ? 1 : 0,
      hasChild: data.flags.child,
      hasMedicalNeed: data.flags.medical,
      isTrapped: data.flags.trapped,
      packet: rawPacket,
      sourceType: SosSourceType.GATEWAY,
      messageOriginal: `[GATEWAY SIMULATION] Packet: ${rawPacket}`,
    }, undefined, SosSourceType.GATEWAY);

    // Record trace
    this.gatewayTraces.set(checksum, {
      packetChecksum: checksum,
      receivedAt,
      clientReportId,
      gatewayId,
      reportId: report.id,
    });

    this.logger.log(`Successfully ingested simulated gateway packet checksum=${checksum} -> reportId=${report.id}`);

    return {
      simulation: true,
      gatewayId,
      reportId: report.id,
      clientReportId,
      packetChecksum: checksum,
      isIdempotentDuplicate: false,
      status: 'ACCEPTED',
      receivedAt,
    };
  }

  getGatewayTraces() {
    return Array.from(this.gatewayTraces.values());
  }
}
