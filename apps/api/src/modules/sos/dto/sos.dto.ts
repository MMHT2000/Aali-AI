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
  @ApiProperty({ description: 'Stable client-generated report ID for idempotency' })
  @IsString()
  @IsNotEmpty()
  clientReportId!: string;

  @ApiPropertyOptional({ description: 'Optional flood event ID' })
  @IsString()
  @IsOptional()
  eventId?: string;

  @ApiPropertyOptional({ description: 'Selected village or area ID' })
  @IsString()
  @IsOptional()
  areaId?: string;

  @ApiProperty({ description: 'Number of people needing rescue (1 - 99)', minimum: 1, maximum: 99 })
  @IsInt()
  @Min(1)
  @Max(99)
  peopleCount!: number;

  @ApiPropertyOptional({ description: 'Count of elderly individuals' })
  @IsInt()
  @IsOptional()
  elderlyCount?: number;

  @ApiProperty({ description: 'Has infants or children' })
  @IsBoolean()
  hasChild!: boolean;

  @ApiProperty({ description: 'Has urgent medical need or injury' })
  @IsBoolean()
  hasMedicalNeed!: boolean;

  @ApiProperty({ description: 'Trapped on roof, tree or isolated high spot' })
  @IsBoolean()
  isTrapped!: boolean;

  @ApiPropertyOptional({ description: 'GPS latitude if permitted' })
  @IsNumber()
  @IsOptional()
  locationLat?: number;

  @ApiPropertyOptional({ description: 'GPS longitude if permitted' })
  @IsNumber()
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

  @ApiPropertyOptional({ description: 'Canonical validated ASCII packet produced by the resident client' })
  @IsString()
  @MaxLength(160)
  @IsOptional()
  packet?: string;
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

