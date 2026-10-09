import { IsBoolean, IsIn, IsInt } from 'class-validator';

export class SetSimulationSpeedDto {
  @IsInt()
  @IsIn([1, 2, 4])
  speed!: number;
}

export class SetSimulationConnectivityDto {
  @IsBoolean()
  internetAvailable!: boolean;
}
