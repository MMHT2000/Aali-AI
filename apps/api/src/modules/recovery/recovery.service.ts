import { Injectable, Logger } from '@nestjs/common';
import {
  calculateVillageNeedScore,
  VillageNeedInput,
  VillageNeedScoreOutput,
} from '../../domain/recovery/recovery-scoring';
import { AidDelivery, RecoveryReport } from './entities/recovery.entity';

export interface CreateReportDto {
  eventId?: string;
  areaId: string;
  villageName?: string;
  damageLevel: 'DESTROYED' | 'SEVERE' | 'MODERATE' | 'LOW';
  tubeWellContaminated: boolean;
  roadPassability: 'IMPASSABLE' | 'BOAT_ONLY' | '4WD_ONLY' | 'OPEN';
  needWater: boolean;
  needMedicine: boolean;
  needFood: boolean;
  reportedWaterLitresNeed?: number;
  reportedFoodPacksNeed?: number;
  evidenceNote?: string;
  reportedBy: string;
}

export interface RecordDeliveryDto {
  eventId?: string;
  areaId: string;
  organizationLabel: string;
  itemCode: string; // 'CLEAN_WATER' | 'FOOD_PACK' | 'MEDICINE_KIT'
  quantity: number;
  unit: string;
  idempotencyKey: string;
  receiptNote?: string;
  recordedBy: string;
}

import { AuditService } from '../audit/audit.service';

@Injectable()
export class RecoveryService {
  private readonly logger = new Logger(RecoveryService.name);
  private reports: RecoveryReport[] = [];
  private deliveries: AidDelivery[] = [];

  constructor(private readonly auditService?: AuditService) {
    this.seedInitialRecoveryData();
  }

  private seedInitialRecoveryData() {
    // Seed reports for Parshuram villages
    const r1 = new RecoveryReport();
    r1.id = 'rec-rep-01';
    r1.event_id = '11111111-1111-1111-1111-111111111103';
    r1.area_id = '22222222-2222-2222-2222-222222222205'; // Chitholia
    r1.report_type = 'DAMAGE_AND_NEEDS';
    r1.damage_level = 'DESTROYED';
    r1.tube_well_status = 'CONTAMINATED';
    r1.road_passability = 'BOAT_ONLY';
    r1.need_water = true;
    r1.need_medicine = true;
    r1.need_food = true;
    r1.needs_json = { waterLitres: 4000, foodPacks: 200, families: 200 };
    r1.evidence_note = 'Embankment breached. Tube-wells flooded under muddy water. Road inaccessible except by country boats.';
    r1.source_kind = 'COMMUNITY_LEADER';
    r1.reported_at = new Date('2026-10-09T10:00:00Z');
    r1.reported_by = '00000000-0000-0000-0000-000000000004';
    r1.status = 'CONFIRMED';
    this.reports.push(r1);

    const r2 = new RecoveryReport();
    r2.id = 'rec-rep-02';
    r2.event_id = '11111111-1111-1111-1111-111111111103';
    r2.area_id = '22222222-2222-2222-2222-222222222204'; // Mirzanagar
    r2.report_type = 'DAMAGE_AND_NEEDS';
    r2.damage_level = 'SEVERE';
    r2.tube_well_status = 'PARTIALLY_USABLE';
    r2.road_passability = '4WD_ONLY';
    r2.need_water = true;
    r2.need_medicine = false;
    r2.need_food = true;
    r2.needs_json = { waterLitres: 2500, foodPacks: 120, families: 120 };
    r2.evidence_note = 'Courtyard water receding slowly. Main road passable by tractor.';
    r2.source_kind = 'FIELD_VOLUNTEER';
    r2.reported_at = new Date('2026-10-09T11:00:00Z');
    r2.reported_by = '00000000-0000-0000-0000-000000000004';
    r2.status = 'CONFIRMED';
    this.reports.push(r2);

    // Seed delivery receipt
    const d1 = new AidDelivery();
    d1.id = 'aid-del-01';
    d1.event_id = '11111111-1111-1111-1111-111111111103';
    d1.area_id = '22222222-2222-2222-2222-222222222204'; // Mirzanagar
    d1.organization_label = 'Bangladesh Red Crescent Society (BDRCS)';
    d1.item_code = 'CLEAN_WATER';
    d1.quantity = 1500;
    d1.unit = 'LITRES';
    d1.delivered_at = new Date('2026-10-09T13:00:00Z');
    d1.recorded_by = '00000000-0000-0000-0000-000000000003';
    d1.source_reference = 'BDRCS-TRUCK-FENI-404';
    d1.receipt_note = 'Delivered 300 5L water containers to village distribution point.';
    d1.idempotency_key = 'bdrcs-mirzanagar-water-batch-01';
    d1.created_at = new Date('2026-10-09T13:10:00Z');
    this.deliveries.push(d1);
  }

  createReport(dto: CreateReportDto): RecoveryReport {
    const rep = new RecoveryReport();
    rep.id = `rec-rep-${Date.now()}`;
    rep.event_id = dto.eventId || '11111111-1111-1111-1111-111111111103';
    rep.area_id = dto.areaId;
    rep.report_type = 'DAMAGE_AND_NEEDS';
    rep.damage_level = dto.damageLevel;
    rep.tube_well_status = dto.tubeWellContaminated ? 'CONTAMINATED' : 'SAFE';
    rep.road_passability = dto.roadPassability;
    rep.need_water = dto.needWater;
    rep.need_medicine = dto.needMedicine;
    rep.need_food = dto.needFood;
    rep.needs_json = {
      waterLitres: dto.reportedWaterLitresNeed || (dto.needWater ? 2000 : 0),
      foodPacks: dto.reportedFoodPacksNeed || (dto.needFood ? 100 : 0),
    };
    rep.evidence_note = dto.evidenceNote || null;
    rep.source_kind = 'COORDINATOR_ASSESSMENT';
    rep.reported_at = new Date();
    rep.reported_by = dto.reportedBy;
    rep.status = 'SUBMITTED';

    this.reports.unshift(rep);
    this.logger.log(`Created recovery need report ${rep.id} for area ${dto.areaId}`);
    return rep;
  }

  getReports(): RecoveryReport[] {
    return this.reports;
  }

  async recordDelivery(dto: RecordDeliveryDto): Promise<{ delivery: AidDelivery; isDuplicateIgnored: boolean }> {
    // Idempotency check: Guard against duplicate deliveries
    const existing = this.deliveries.find((d) => d.idempotency_key === dto.idempotencyKey);
    if (existing) {
      this.logger.warn(`Duplicate delivery submission rejected with idempotency key: ${dto.idempotencyKey}`);
      return { delivery: existing, isDuplicateIgnored: true };
    }

    const del = new AidDelivery();
    del.id = `aid-del-${Date.now()}`;
    del.event_id = dto.eventId || '11111111-1111-1111-1111-111111111103';
    del.area_id = dto.areaId;
    del.organization_label = dto.organizationLabel;
    del.item_code = dto.itemCode;
    del.quantity = dto.quantity;
    del.unit = dto.unit;
    del.delivered_at = new Date();
    del.recorded_by = dto.recordedBy;
    del.source_reference = dto.receiptNote || 'Verified field delivery receipt';
    del.receipt_note = dto.receiptNote || null;
    del.idempotency_key = dto.idempotencyKey;
    del.created_at = new Date();

    await this.auditService?.record({
      actorUserId: dto.recordedBy,
      action: 'RECORD_AID_DELIVERY',
      entityType: 'AID_DELIVERY',
      entityId: del.id,
      reason: `Recorded ${dto.quantity} ${dto.unit} of ${dto.itemCode} to area ${dto.areaId}`,
      afterSummary: {
        areaId: dto.areaId,
        organizationLabel: dto.organizationLabel,
        itemCode: dto.itemCode,
        quantity: dto.quantity,
        idempotencyKey: dto.idempotencyKey,
      },
    });

    this.deliveries.unshift(del);
    this.logger.log(`Recorded aid delivery receipt ${del.id}`);

    return { delivery: del, isDuplicateIgnored: false };
  }

  getDeliveries(): AidDelivery[] {
    return this.deliveries;
  }

  getSummary(): {
    villagesRanking: VillageNeedScoreOutput[];
    totalReports: number;
    totalDeliveries: number;
    disclaimer: string;
  } {
    const villageNames: Record<string, string> = {
      '22222222-2222-2222-2222-222222222205': 'চিথলিয়া (Chitholia)',
      '22222222-2222-2222-2222-222222222204': 'মির্জানগর (Mirzanagar)',
      '22222222-2222-2222-2222-222222222203': 'ফুলগাজী (Fulgazi)',
    };

    const villageCoords: Record<string, { lat: number; lng: number }> = {
      '22222222-2222-2222-2222-222222222205': { lat: 23.235, lng: 91.415 }, // Chitholia
      '22222222-2222-2222-2222-222222222204': { lat: 23.218, lng: 91.432 }, // Mirzanagar
      '22222222-2222-2222-2222-222222222203': { lat: 23.165, lng: 91.410 }, // Fulgazi
    };

    // Aggregate by area
    const areaIds = Array.from(new Set(this.reports.map((r) => r.area_id)));

    const rankings: VillageNeedScoreOutput[] = areaIds.map((areaId) => {
      const areaReports = this.reports.filter((r) => r.area_id === areaId);
      const latest = areaReports[0];

      const areaDeliveries = this.deliveries.filter((d) => d.area_id === areaId);
      const deliveredWater = areaDeliveries
        .filter((d) => d.item_code === 'CLEAN_WATER')
        .reduce((sum, d) => sum + Number(d.quantity), 0);
      const deliveredFood = areaDeliveries
        .filter((d) => d.item_code === 'FOOD_PACK')
        .reduce((sum, d) => sum + Number(d.quantity), 0);

      const needsData = latest.needs_json as Record<string, number> | null;
      const waterNeed = needsData?.waterLitres ?? (latest.need_water ? 3000 : 0);
      const foodNeed = needsData?.foodPacks ?? (latest.need_food ? 150 : 0);

      const villageInput: VillageNeedInput = {
        villageId: areaId,
        villageName: villageNames[areaId] || 'Feni Village',
        damageLevel: (latest.damage_level as VillageNeedInput['damageLevel']) || 'MODERATE',
        tubeWellContaminated: latest.tube_well_status === 'CONTAMINATED',
        roadPassability: (latest.road_passability as VillageNeedInput['roadPassability']) || 'OPEN',
        needWater: latest.need_water,
        needMedicine: latest.need_medicine,
        needFood: latest.need_food,
        estimatedFamilies: needsData?.families ?? 100,
        reportedWaterLitresNeed: waterNeed,
        reportedFoodPacksNeed: foodNeed,
        coordinates: villageCoords[areaId] || { lat: 23.210, lng: 91.430 },
      };

      return calculateVillageNeedScore(villageInput, {
        deliveredWaterLitres: deliveredWater,
        deliveredFoodPacks: deliveredFood,
        lastDeliveryTime: areaDeliveries[0]?.delivered_at?.toISOString() || null,
      });
    });

    // Sort by unmet priority score descending
    rankings.sort((a, b) => b.priorityScore - a.priorityScore);

    return {
      villagesRanking: rankings,
      totalReports: this.reports.length,
      totalDeliveries: this.deliveries.length,
      disclaimer: 'Rankings support logistical coordination and relief transparency, not beneficiary eligibility.',
    };
  }
}
