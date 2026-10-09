import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SimulatedGatewayIngestDto {
  @ApiProperty({
    example: 'A1|S|wh0xs6m|05|E1C0M1T0|261009-1430|7Q2K|1G90',
    description: 'Raw ASCII disaster packet received from SMS gateway simulator',
  })
  @IsString()
  @IsNotEmpty()
  packet!: string;

  @ApiPropertyOptional({
    example: 'SIMULATOR-FENI-GW-01',
    description: 'Identifier of the simulated carrier gateway or mobile station',
  })
  @IsString()
  @IsOptional()
  gatewayId?: string;

  @ApiPropertyOptional({
    example: '2026-10-09T14:30:00Z',
    description: 'Timestamp when the message was received by the gateway',
  })
  @IsString()
  @IsOptional()
  receivedAt?: string;
}

