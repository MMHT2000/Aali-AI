import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
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

  async ingestSimulatedPacket(dto: SimulatedGatewayIngestDto, signatureHeader?: string): Promise<SmsGatewayIngestResult> {
    const rawPacket = dto.packet.trim();
    const gatewayId = dto.gatewayId || 'GATEWAY_SIMULATOR_DEFAULT';
    const receivedAt = dto.receivedAt || new Date().toISOString();
    const carrierSecret = process.env.CARRIER_HMAC_SECRET || 'aali-carrier-secret-key-2026';
    const requireSignature = process.env.CARRIER_REQUIRE_SIGNATURE === 'true';

    let signatureVerified = false;
    let authMethod: 'HMAC_SHA256' | 'DEMO_TRUSTED_PEER' = 'DEMO_TRUSTED_PEER';

    // 0. Cryptographic HMAC verification
    if (signatureHeader) {
      const expectedSignature = crypto
        .createHmac('sha256', carrierSecret)
        .update(rawPacket)
        .digest('hex');

      const sigBuf = Buffer.from(signatureHeader.trim().toLowerCase());
      const expBuf = Buffer.from(expectedSignature.toLowerCase());

      if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
        this.logger.warn(`Invalid carrier HMAC signature rejected for gatewayId=${gatewayId}`);
        throw new UnauthorizedException({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Invalid X-Carrier-Signature HMAC',
        });
      }
      signatureVerified = true;
      authMethod = 'HMAC_SHA256';
    } else if (requireSignature) {
      throw new UnauthorizedException({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Missing required X-Carrier-Signature header',
      });
    }

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
      const existingReceipt = {
        recipientPhone: undefined,
        messageTextBn: `আলি কন্ট্রোল: আপনার এসওএস ইতিপূর্বে রেকর্ড করা হয়েছে (আইডি: ${existingTrace.clientReportId})। উদ্ধার কার্যক্রম প্রক্রিয়াধীন।`,
        messageTextEn: `Aali Control: Prior SOS already on record (ID: ${existingTrace.clientReportId}). Response queue active.`,
        sentAt: new Date().toISOString(),
        shortCode: '1090',
        channel: 'SMS_TRANSACTIONAL_1090' as const,
      };

      return {
        simulation: true,
        gatewayId,
        reportId: existingTrace.reportId,
        clientReportId: existingTrace.clientReportId,
        packetChecksum: checksum,
        isIdempotentDuplicate: true,
        status: 'DUPLICATE_IGNORED',
        receivedAt,
        signatureVerified,
        authMethod,
        outboundReceipt: existingReceipt,
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

    const outboundReceipt = {
      recipientPhone: undefined,
      messageTextBn: `আলি কন্ট্রোল: আপনার জরুরি এসওএস গৃহীত হয়েছে (আইডি: ${data.shortId})। উদ্ধারকারী দলকে অবহিত করা হচ্ছে। পানি বৃদ্ধি পেলে নিরাপদ উঁচু স্থান বা ছাদে অবস্থান নিন।`,
      messageTextEn: `Aali Control: Emergency SOS received (ID: ${data.shortId}). Rescue units notified. Seek higher ground if water rises.`,
      sentAt: new Date().toISOString(),
      shortCode: '1090',
      channel: 'SMS_TRANSACTIONAL_1090' as const,
    };

    return {
      simulation: true,
      gatewayId,
      reportId: report.id,
      clientReportId,
      packetChecksum: checksum,
      isIdempotentDuplicate: false,
      status: 'ACCEPTED',
      receivedAt,
      signatureVerified,
      authMethod,
      outboundReceipt,
    };
  }

  getGatewayTraces() {
    return Array.from(this.gatewayTraces.values());
  }
}
