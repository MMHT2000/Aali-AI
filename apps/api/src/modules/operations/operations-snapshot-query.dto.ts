import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsIn, IsOptional, IsString, Matches } from 'class-validator';
import { OperationsMode } from './operations-context';

export class OperationsSnapshotQueryDto {
  @ApiPropertyOptional({ enum: OperationsMode, default: OperationsMode.EXERCISE })
  @IsOptional()
  @IsEnum(OperationsMode)
  mode?: OperationsMode;

  @ApiPropertyOptional({ description: 'Stable flood event ID. Required only to select a specific supported historical replay.' })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
  eventId?: string;

  @ApiPropertyOptional({ description: 'District tenant partition code (e.g., FENI_DIST, SYLHET_DIST)', default: 'FENI_DIST' })
  @IsOptional()
  @IsString()
  @IsIn(['FENI_DIST', 'SYLHET_DIST'])
  districtCode?: string;
}
