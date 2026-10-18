import { IsBoolean, IsIn, IsInt, IsLatitude, IsLongitude, IsOptional, IsString, Length, Max, Min, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';
import { BRAIN_AREAS } from './brain.types';

export class BrainControlDto {
  @IsIn(['ALL', ...BRAIN_AREAS.map(area => area.id)]) scope!: string;
  @IsBoolean() paused!: boolean;
  @IsString() @Length(5, 300) reason!: string;
}

export class BrainQueryDto {
  @IsIn(BRAIN_AREAS.map(area => area.id)) areaId!: string;
  @IsIn(['LIVE', 'EXERCISE']) mode!: 'LIVE' | 'EXERCISE';
}
export class BrainPersonalizeDto extends BrainQueryDto {
  @ValidateIf(o => o.latitude !== undefined || o.longitude !== undefined)
  @Type(() => Number) @IsLatitude() latitude?: number;
  @ValidateIf(o => o.latitude !== undefined || o.longitude !== undefined)
  @Type(() => Number) @IsLongitude() longitude?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(99) people?: number;
}
export class BrainReviewDto {
  @IsString() @Length(1, 180) actionId!: string;
  @IsIn(['ACKNOWLEDGED', 'DISMISSED']) decision!: 'ACKNOWLEDGED' | 'DISMISSED';
  @IsString() @Length(5, 300) reason!: string;
}
