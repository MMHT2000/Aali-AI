import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Max,
  Min,
} from 'class-validator';

export class CreateSosDto {
  @ApiPropertyOptional({ description: 'Stable client-generated report ID for idempotency' })
  @IsString()
  @IsOptional()
  clientReportId?: string;

  @ApiPropertyOptional({ description: 'Optional flood event ID' })
  @IsString()
  @IsOptional()
  eventId?: string;

  @ApiPropertyOptional({ description: 'Selected village or area ID' })
  @IsString()
  @IsOptional()
  areaId?: string;

  @ApiPropertyOptional({ description: 'Village name alias' })
  @IsString()
  @IsOptional()
  village?: string;

  @ApiProperty({ description: 'Number of people needing rescue (1 - 99)', minimum: 1, maximum: 99 })
  @IsInt()
  @Min(1)
  @Max(99)
  peopleCount!: number;

  @ApiPropertyOptional({ description: 'Count of elderly individuals' })
  @IsInt()
  @Min(0)
  @Max(99)
  @IsOptional()
  elderlyCount?: number;

  @ApiPropertyOptional({ description: 'Has elderly flag' })
  @IsBoolean()
  @IsOptional()
  hasElderly?: boolean;

  @ApiPropertyOptional({ description: 'Has infants or children' })
  @IsBoolean()
  @IsOptional()
  hasChild?: boolean;

  @ApiPropertyOptional({ description: 'Has children flag alias' })
  @IsBoolean()
  @IsOptional()
  hasChildren?: boolean;

  @ApiPropertyOptional({ description: 'Has urgent medical need or injury' })
  @IsBoolean()
  @IsOptional()
  hasMedicalNeed?: boolean;

  @ApiPropertyOptional({ description: 'Needs medical alias' })
  @IsBoolean()
  @IsOptional()
  needsMedical?: boolean;

  @ApiProperty({ description: 'Trapped on roof, tree or isolated high spot' })
  @IsBoolean()
  isTrapped!: boolean;

  @ApiPropertyOptional({ description: 'GPS latitude if permitted' })
  @IsNumber()
  @Min(-90)
  @Max(90)
  @IsOptional()
  locationLat?: number;

  @ApiPropertyOptional({ description: 'GPS longitude if permitted' })
  @IsNumber()
  @Min(-180)
  @Max(180)
  @IsOptional()
  locationLng?: number;

  @ApiPropertyOptional({ description: 'Optional text notes or voice transcript' })
  @IsString()
  @IsOptional()
  messageOriginal?: string;

  @ApiPropertyOptional({ description: 'Source type (NEW_USER, RESPONDER, etc.)', default: 'NEW_USER' })
  @IsString()
  @IsOptional()
  sourceType?: string;

  @ApiPropertyOptional({ description: 'Optional contact phone (redacted in audit logs)' })
  @IsString()
  @IsOptional()
  residentPhone?: string;

  @ApiPropertyOptional({ description: 'Optional reporter phone alias' })
  @IsString()
  @IsOptional()
  reporterPhone?: string;

  @ApiPropertyOptional({ description: 'Canonical validated ASCII packet produced by the resident client' })
  @IsString()
  @MaxLength(160)
  @IsOptional()
  packet?: string;

  @ApiPropertyOptional({ description: 'Transport channel used (e.g. STARLINK_D2C_WIFI, TERRESTRIAL_USB, GATEWAY_SIMULATED)' })
  @IsString()
  @IsOptional()
  transport?: string;
}

export class DecodePacketDto {
  @ApiProperty({
    example: 'A1|S|wh0xs6m|05|E1C0M1T0|261009-1430|7Q2K|1G90',
    description: 'Raw ASCII disaster packet to parse and validate',
  })
  @IsString()
  @IsNotEmpty()
  packet!: string;
}

