import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsBoolean, IsIn, IsInt, IsNumber, IsObject, IsOptional, IsString, Length, Max, MaxLength, Min, ValidateNested } from 'class-validator';

export class UnderstandSosRequest {
  @IsString() @Length(1, 4000) text!: string;
  @IsOptional() @IsBoolean() forceFallback?: boolean;
}
export class DuplicateSimilarityRequest {
  @IsString() @Length(1, 4000) leftReportText!: string;
  @IsString() @Length(1, 4000) rightReportText!: string;
  @IsOptional() @IsBoolean() spatialMatch?: boolean;
}
export class DraftCommunicationRequest {
  @IsIn(['NORMAL', 'WATCH', 'WARNING', 'ACT']) alertLevel!: string;
  @IsString() @Length(1, 150) areaName!: string;
  @IsString() @Length(1, 200) shelterName!: string;
  @IsArray() @ArrayMaxSize(100) @IsString({ each: true }) sourceRecordIds!: string[];
}
export class OutageRequest { @IsBoolean() outage!: boolean; }
export class ShiftSummaryRequest {
  @IsOptional() @IsInt() @Min(0) @Max(10000000) totalSos?: number;
  @IsOptional() @IsInt() @Min(0) @Max(10000000) criticalEvacuations?: number;
  @IsOptional() @IsInt() @Min(0) @Max(10000000) silentVillages?: number;
  @IsOptional() @IsInt() @Min(0) @Max(10000000) deliveriesLogged?: number;
  @IsOptional() @IsArray() @ArrayMaxSize(100) @IsString({ each: true }) recordIds?: string[];
}
export class VoiceRequest {
  @IsOptional() @IsString() @MaxLength(100000) audioBase64?: string;
  @IsOptional() @IsString() @Length(1, 100) simulatedVoiceNoteId?: string;
  @IsOptional() @IsString() @Length(1, 50) dialect?: string;
}
export class ResidentRegisterRequest {
  @IsString() @Length(1, 150) fullName!: string;
  @IsString() @Length(7, 25) phoneNumber!: string;
  @IsString() @Length(10, 17) mockNid!: string;
}
export class RecoveryReportRequest {
  @IsOptional() @IsString() @Length(1, 36) eventId?: string;
  @IsString() @Length(1, 36) areaId!: string;
  @IsOptional() @IsString() @MaxLength(150) villageName?: string;
  @IsIn(['DESTROYED', 'SEVERE', 'MODERATE', 'LOW']) damageLevel!: 'DESTROYED' | 'SEVERE' | 'MODERATE' | 'LOW';
  @IsBoolean() tubeWellContaminated!: boolean;
  @IsIn(['IMPASSABLE', 'BOAT_ONLY', '4WD_ONLY', 'OPEN']) roadPassability!: 'IMPASSABLE' | 'BOAT_ONLY' | '4WD_ONLY' | 'OPEN';
  @IsBoolean() needWater!: boolean;
  @IsBoolean() needMedicine!: boolean;
  @IsBoolean() needFood!: boolean;
  @IsOptional() @IsNumber() @Min(0) @Max(100000000) reportedWaterLitresNeed?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(100000000) reportedFoodPacksNeed?: number;
  @IsOptional() @IsString() @MaxLength(1000) evidenceNote?: string;
  @IsOptional() @IsString() @MaxLength(36) reportedBy?: string;
}
export class DeliveryRequest {
  @IsOptional() @IsString() @Length(1, 36) eventId?: string;
  @IsString() @Length(1, 36) areaId!: string;
  @IsString() @Length(1, 150) organizationLabel!: string;
  @IsIn(['CLEAN_WATER', 'FOOD_PACK', 'MEDICINE_KIT']) itemCode!: string;
  @IsNumber() @Min(0.001) @Max(100000000) quantity!: number;
  @IsIn(['LITRES', 'PACKS', 'KITS']) unit!: string;
  @IsString() @Length(1, 120) idempotencyKey!: string;
  @IsOptional() @IsString() @MaxLength(1000) receiptNote?: string;
  @IsOptional() @IsString() @MaxLength(36) recordedBy?: string;
}
export class ReplayStartRequest { @IsString() @Length(1, 100) scenarioId!: string; }
export class ReplayStepRequest {
  @IsIn(['NEXT', 'PREV', 'SET_TICK']) direction!: 'NEXT' | 'PREV' | 'SET_TICK';
  @IsOptional() @IsInt() @Min(0) @Max(10000) targetTick?: number;
}
export class GaugeStateRequest { @IsBoolean() blanked!: boolean; }
export class SimulationGaugeRequest { @IsOptional() @IsBoolean() available?: boolean; }
export class SimulationTickRequest { @IsInt() @Min(0) @Max(10000) tickIndex!: number; }
export class ReviewRequest {
  @IsIn(['ACCEPT', 'REJECT']) decision!: 'ACCEPT' | 'REJECT';
  @IsOptional() @IsString() @Length(1, 1000) reason?: string;
}
export class TriageRequest {
  @IsOptional() @IsIn(['CONFIRM', 'REJECT']) action?: string;
  @IsOptional() @IsIn(['ACCEPT', 'REJECT']) decision?: 'ACCEPT' | 'REJECT';
  @IsOptional() @IsString() @MaxLength(1000) note?: string;
  @IsOptional() @IsString() @MaxLength(1000) reason?: string;
}
export class SplitRequest {
  @IsString() @Length(1, 100) reportId!: string;
  @IsOptional() @IsString() @Length(1, 1000) reason?: string;
}
export class WarningDraftRequest {
  @IsOptional() @IsString() @Length(1, 36) eventId?: string;
  @IsOptional() @IsString() @Length(1, 36) areaId?: string;
  @IsOptional() @IsString() @Length(1, 150) areaName?: string;
  @IsOptional() @IsIn(['NORMAL', 'WATCH', 'WARNING', 'ACT']) alertLevel?: string;
  @IsOptional() @IsArray() @ArrayMaxSize(100) @IsString({ each: true }) supportingSignals?: string[];
  @IsOptional() @IsString() @Length(1, 200) shelterName?: string;
  @IsOptional() @IsString() @MaxLength(4000) bodyBn?: string;
  @IsOptional() @IsString() @MaxLength(4000) bodyEn?: string;
}
export class WarningApproveRequest { @IsOptional() @IsString() @MaxLength(1000) note?: string; }
export class WarningRejectRequest { @IsOptional() @IsString() @MaxLength(1000) reason?: string; }
export class DemoMomentRequest {
  @IsInt() @Min(0) @Max(20) moment!: number;
  @IsString() @Length(1, 200) title!: string;
  @IsOptional() @IsObject() payload?: Record<string, unknown>;
}
class GaugeSignalRequest {
  @IsNumber() gaugeLevelM!: number;
  @IsNumber() rise3hCm!: number;
  @IsOptional() @IsNumber() warningLevelM?: number;
  @IsNumber() @Min(0) minutesSinceObservation!: number;
  @IsOptional() @IsBoolean() isBlanked?: boolean;
}
class RainSignalRequest {
  @IsNumber() @Min(0) rainfallMm!: number;
  @IsNumber() @Min(1) windowMinutes!: number;
  @IsOptional() @IsNumber() @Min(0) thresholdMm?: number;
  @IsNumber() @Min(0) minutesSinceObservation!: number;
}
class VolunteerSignalRequest {
  @IsNumber() levelM!: number;
  @IsBoolean() isRapidRiseReported!: boolean;
  @IsOptional() @IsNumber() thresholdM?: number;
  @IsNumber() @Min(0) minutesSinceObservation!: number;
}
export class AlertEvaluateRequest {
  @IsString() @Length(1, 100) areaId!: string;
  @IsString() @Length(1, 150) areaName!: string;
  @IsOptional() @IsBoolean() reportedBreach?: boolean;
  @IsOptional() @ValidateNested() @Type(() => GaugeSignalRequest) signalA?: GaugeSignalRequest;
  @IsOptional() @ValidateNested() @Type(() => RainSignalRequest) signalB?: RainSignalRequest;
  @IsOptional() @ValidateNested() @Type(() => VolunteerSignalRequest) signalC?: VolunteerSignalRequest;
  @IsOptional() @IsNumber() dangerLevelM?: number;
}
