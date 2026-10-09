import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import {
  encodeDisasterPacket,
  parseDisasterPacket,
  PacketParseOutcome,
} from '../../common/packet/disaster-packet';
import { CreateSosDto, DecodePacketDto } from './dto/sos.dto';
import { SosReport, SosSourceType } from './entities/sos-report.entity';

@Injectable()
export class SosService {
  constructor(@InjectRepository(SosReport) private readonly reports: Repository<SosReport>) {}

  async createSos(dto: CreateSosDto, userId?: string, trustedSource?: SosSourceType): Promise<{ report: SosReport; isDuplicate: boolean }> {
    // Idempotency check: if clientReportId already exists, return existing report
    const existing = await this.reports.findOneBy({ client_report_id: dto.clientReportId });
    if (existing) {
      return { report: existing, isDuplicate: true };
    }

    const packetOutcome = dto.packet ? parseDisasterPacket(dto.packet) : null;
    if (packetOutcome && packetOutcome.status !== 'VALID') {
      throw new BadRequestException(`Packet validation failed: ${packetOutcome.status}`);
    }
    const packetData = packetOutcome?.status === 'VALID' ? packetOutcome.data : null;
    if (packetData && (packetData.peopleCount !== dto.peopleCount || packetData.flags.child !== dto.hasChild || packetData.flags.medical !== dto.hasMedicalNeed || packetData.flags.trapped !== dto.isTrapped || packetData.flags.elderly !== Boolean(dto.elderlyCount && dto.elderlyCount > 0))) {
      throw new BadRequestException('SOS fields do not match the validated packet.');
    }
    const shortId = packetData?.shortId ?? dto.clientReportId.replace(/[^A-Za-z0-9]/g, '').slice(-4).toUpperCase().padStart(4, 'A');
    const now = new Date();
    // format YYMMDD-HHMM
    const yy = String(now.getUTCFullYear()).slice(-2);
    const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(now.getUTCDate()).padStart(2, '0');
    const hh = String(now.getUTCHours()).padStart(2, '0');
    const min = String(now.getUTCMinutes()).padStart(2, '0');
    const timestampStr = `${yy}${mm}${dd}-${hh}${min}`;

    const packetRaw = dto.packet ?? encodeDisasterPacket({
      geohash7: '0000000', peopleCount: dto.peopleCount,
      flags: { elderly: Boolean(dto.elderlyCount && dto.elderlyCount > 0), child: dto.hasChild, medical: dto.hasMedicalNeed, trapped: dto.isTrapped },
      timestamp: timestampStr, shortId,
    });

    const parsed = parseDisasterPacket(packetRaw);
    const checksum = parsed.status === 'VALID' ? parsed.checksum : null;

    const report = new SosReport();
    report.client_report_id = dto.clientReportId;
    report.event_id = dto.eventId || '11111111-1111-1111-1111-111111111103';
    report.area_id = dto.areaId || null;
    report.source_user_id = userId || null;
    report.source_type = trustedSource ?? SosSourceType.NEW_USER;
    report.people_count = dto.peopleCount;
    report.elderly_count = dto.elderlyCount || null;
    report.has_child = dto.hasChild;
    report.has_medical_need = dto.hasMedicalNeed;
    report.is_trapped = dto.isTrapped;
    report.location_lat = dto.locationLat || null;
    report.location_lng = dto.locationLng || null;
    report.geohash7 = packetData?.geohash7 ?? '0000000';
    report.message_original = dto.messageOriginal || null;
    report.packet_version = 'A1';
    report.packet_checksum = checksum;
    report.packet_short_id = shortId;
    report.reported_at = now;
    report.received_at = now;
    report.transport_kind = trustedSource === SosSourceType.GATEWAY ? 'GATEWAY_SIMULATED' : 'APP_DIRECT';
    report.transport_status = 'DELIVERED';
    report.parse_status = 'VALID';
    report.review_status = 'TRIAGED';
    report.created_at = now;
    report.updated_at = now;

    try {
      return { report: await this.reports.save(report), isDuplicate: false };
    } catch (error) {
      if (error instanceof QueryFailedError && (error as QueryFailedError & { driverError?: { code?: string } }).driverError?.code === 'ER_DUP_ENTRY') {
        const raced = await this.reports.findOneBy({ client_report_id: dto.clientReportId });
        if (raced) return { report: raced, isDuplicate: true };
        throw new ConflictException('SOS report identifier already exists.');
      }
      throw error;
    }
  }

  decodePacket(dto: DecodePacketDto): PacketParseOutcome {
    return parseDisasterPacket(dto.packet);
  }

  async getReports(): Promise<SosReport[]> {
    if (!this.reports?.manager?.connection?.isInitialized) {
      return [];
    }
    return this.reports.find({ order: { reported_at: 'DESC' }, take: 500 });
  }

  async getReportById(id: string): Promise<SosReport | null> {
    if (!this.reports?.manager?.connection?.isInitialized) {
      return null;
    }
    return this.reports.findOneBy({ id });
  }
}

