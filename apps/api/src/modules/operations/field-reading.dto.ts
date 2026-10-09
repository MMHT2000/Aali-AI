import { IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateFieldReadingDto {
  @IsNumber()
  @Min(0)
  @Max(20)
  levelM!: number;

  @IsString()
  @MaxLength(36)
  areaId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
