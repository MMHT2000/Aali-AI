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
import { SYNTHETIC_FENI_SEEDS } from '../../database/seeds/feni-synthetic.seeds';

@Injectable()
export class SosService {
  constructor(@InjectRepository(SosReport) private readonly reports: Repository<SosReport>) {}

  async createSos(dto: CreateSosDto, userId?: string, trustedSource?: SosSourceType): Promise<{ report: SosReport; isDuplicate: boolean }> {
    const clientReportId = dto.clientReportId || `sos-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const hasChild = dto.hasChild ?? dto.hasChildren ?? false;
    const hasMedicalNeed = dto.hasMedicalNeed ?? dto.needsMedical ?? false;
    const elderlyCount = dto.elderlyCount ?? (dto.hasElderly ? 1 : null);
    let areaId: string | null = dto.areaId || null;
    if (!areaId && dto.village) {
      const match = SYNTHETIC_FENI_SEEDS.areas.find((a) =>
        (a.name_en && a.name_en.toLowerCase().includes(dto.village!.toLowerCase())) ||
        (a.name_bn && a.name_bn.includes(dto.village!)) ||
        (a.name_en && dto.village!.toLowerCase().includes(a.name_en.toLowerCase()))
      );
      if (match && match.id) areaId = match.id;
    }

    // Idempotency check: if clientReportId already exists, return existing report
    const existing = await this.reports.findOneBy({ client_report_id: clientReportId });
    if (existing) {
      return { report: existing, isDuplicate: true };
    }

    const packetOutcome = dto.packet ? parseDisasterPacket(dto.packet) : null;
    if (packetOutcome && packetOutcome.status !== 'VALID') {
      throw new BadRequestException(`Packet validation failed: ${packetOutcome.status}`);
    }
    const packetData = packetOutcome?.status === 'VALID' ? packetOutcome.data : null;
    if (packetData && (packetData.peopleCount !== dto.peopleCount || packetData.flags.child !== hasChild || packetData.flags.medical !== hasMedicalNeed || packetData.flags.trapped !== dto.isTrapped || packetData.flags.elderly !== Boolean(elderlyCount && elderlyCount > 0))) {
      throw new BadRequestException('SOS fields do not match the validated packet.');
    }
    const shortId = packetData?.shortId ?? clientReportId.replace(/[^A-Za-z0-9]/g, '').slice(-4).toUpperCase().padStart(4, 'A');
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
      flags: { elderly: Boolean(elderlyCount && elderlyCount > 0), child: hasChild, medical: hasMedicalNeed, trapped: dto.isTrapped },
      timestamp: timestampStr, shortId,
    });

    const parsed = parseDisasterPacket(packetRaw);
    const checksum = parsed.status === 'VALID' ? parsed.checksum : null;

    const report = new SosReport();
    report.client_report_id = clientReportId;
    report.event_id = dto.eventId || '11111111-1111-1111-1111-111111111103';
    report.area_id = areaId;
    report.source_user_id = userId || null;
    report.source_type = trustedSource ?? SosSourceType.NEW_USER;
    report.people_count = dto.peopleCount;
    report.elderly_count = elderlyCount;
    report.has_child = hasChild;
    report.has_medical_need = hasMedicalNeed;
    report.is_trapped = dto.isTrapped;
    let lat = dto.locationLat || null;
    let lng = dto.locationLng || null;
    if ((!lat || !lng) && areaId) {
      const area = SYNTHETIC_FENI_SEEDS.areas.find((item) => item.id === areaId);
      if (area) {
        lat = area.latitude ?? null;
        lng = area.longitude ?? null;
      }
    }

    report.location_lat = lat;
    report.location_lng = lng;
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
    report.review_status = 'NEEDS_REVIEW';
    report.created_at = now;
    report.updated_at = now;

    try {
      return { report: await this.reports.save(report), isDuplicate: false };
    } catch (error) {
      if (error instanceof QueryFailedError && (error as QueryFailedError & { driverError?: { code?: string } }).driverError?.code === 'ER_DUP_ENTRY') {
        const raced = await this.reports.findOneBy({ client_report_id: clientReportId });
        if (raced) return { report: raced, isDuplicate: true };
        throw new ConflictException('SOS report identifier already exists.');
      }
      throw error;
    }
  }

  async createSosFromPacket(packetString: string, userId?: string, trustedSource?: SosSourceType): Promise<{ report: SosReport; isDuplicate: boolean }> {
    const outcome = parseDisasterPacket(packetString);
    if (outcome.status !== 'VALID' || !outcome.data) {
      throw new BadRequestException(`Cannot create SOS from invalid packet: ${outcome.status}`);
    }
    const data = outcome.data;
    const dto: CreateSosDto = {
      clientReportId: `pkt-${data.shortId}-${Date.now()}`,
      peopleCount: data.peopleCount,
      hasChild: data.flags.child,
      hasMedicalNeed: data.flags.medical,
      isTrapped: data.flags.trapped,
      hasElderly: data.flags.elderly,
      elderlyCount: data.flags.elderly ? 1 : 0,
      packet: packetString,
      messageOriginal: `Disaster Packet ${packetString}`,
    };
    return this.createSos(dto, userId, trustedSource);
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

