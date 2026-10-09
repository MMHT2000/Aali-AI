import { Injectable, Logger } from '@nestjs/common';
import {
  encodeDisasterPacket,
  parseDisasterPacket,
  PacketParseOutcome,
} from '../../common/packet/disaster-packet';
import { CreateSosDto, DecodePacketDto } from './dto/sos.dto';
import { SosReport, SosSourceType } from './entities/sos-report.entity';

@Injectable()
export class SosService {
  private readonly logger = new Logger(SosService.name);
  // In-memory store for prototype before direct DB sync
  private readonly reports: Map<string, SosReport> = new Map();

  async createSos(dto: CreateSosDto, userId?: string): Promise<{ report: SosReport; isDuplicate: boolean }> {
    // Idempotency check: if clientReportId already exists, return existing report
    const existing = this.reports.get(dto.clientReportId);
    if (existing) {
      this.logger.log(`Duplicate SOS submission received for clientReportId=${dto.clientReportId}. Returning existing record.`);
      return { report: existing, isDuplicate: true };
    }

    const shortId = dto.clientReportId.replace(/[^A-Za-z0-9]/g, '').slice(-4).toUpperCase().padStart(4, 'A');
    const now = new Date();
    // format YYMMDD-HHMM
    const yy = String(now.getUTCFullYear()).slice(-2);
    const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(now.getUTCDate()).padStart(2, '0');
    const hh = String(now.getUTCHours()).padStart(2, '0');
    const min = String(now.getUTCMinutes()).padStart(2, '0');
    const timestampStr = `${yy}${mm}${dd}-${hh}${min}`;

    const packetRaw = encodeDisasterPacket({
      geohash7: '0000000',
      peopleCount: dto.peopleCount,
      flags: {
        elderly: (dto.elderlyCount && dto.elderlyCount > 0) || false,
        child: dto.hasChild,
        medical: dto.hasMedicalNeed,
        trapped: dto.isTrapped,
      },
      timestamp: timestampStr,
      shortId,
    });

    const parsed = parseDisasterPacket(packetRaw);
    const checksum = parsed.status === 'VALID' ? parsed.checksum : null;

    const report = new SosReport();
    report.id = `sos-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    report.client_report_id = dto.clientReportId;
    report.event_id = dto.eventId || '11111111-1111-1111-1111-111111111103';
    report.area_id = dto.areaId || null;
    report.source_user_id = userId || null;
    report.source_type = (dto.sourceType as SosSourceType) || SosSourceType.NEW_USER;
    report.people_count = dto.peopleCount;
    report.elderly_count = dto.elderlyCount || null;
    report.has_child = dto.hasChild;
    report.has_medical_need = dto.hasMedicalNeed;
    report.is_trapped = dto.isTrapped;
    report.location_lat = dto.locationLat || null;
    report.location_lng = dto.locationLng || null;
    report.geohash7 = '0000000';
    report.message_original = dto.messageOriginal || null;
    report.packet_version = 'A1';
    report.packet_checksum = checksum;
    report.packet_short_id = shortId;
    report.reported_at = now;
    report.received_at = now;
    report.transport_kind = 'APP_DIRECT';
    report.transport_status = 'DELIVERED';
    report.parse_status = 'VALID';
    report.review_status = 'TRIAGED';
    report.created_at = now;
    report.updated_at = now;

    this.reports.set(dto.clientReportId, report);
    return { report, isDuplicate: false };
  }

  decodePacket(dto: DecodePacketDto): PacketParseOutcome {
    return parseDisasterPacket(dto.packet);
  }

  async getReports(): Promise<SosReport[]> {
    return Array.from(this.reports.values());
  }

  async getReportById(id: string): Promise<SosReport | null> {
    for (const r of this.reports.values()) {
      if (r.id === id) return r;
    }
    return null;
  }
}

