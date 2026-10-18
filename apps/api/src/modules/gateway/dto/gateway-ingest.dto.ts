import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class SimulatedGatewayIngestDto {
  @ApiProperty({
    example: 'A1|S|wh0xs6m|05|E1C0M1T0|261009-1430|7Q2K|1G90',
    description: 'Raw ASCII disaster packet received from SMS gateway simulator',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  packet!: string;

  @ApiPropertyOptional({
    example: 'SIMULATOR-FENI-GW-01',
    description: 'Identifier of the simulated carrier gateway or mobile station',
  })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  gatewayId?: string;

  @ApiPropertyOptional({
    example: '2026-10-09T14:30:00Z',
    description: 'Timestamp when the message was received by the gateway',
  })
  @IsDateString()
  @IsOptional()
  receivedAt?: string;
}

export class SmsGatewayRequest {
  @IsOptional() @IsString() @MaxLength(160) packet?: string;
  @IsOptional() @IsString() @MaxLength(160) rawMessage?: string;
  @IsOptional() @IsString() @MaxLength(160) rawPacket?: string;
  @IsOptional() @IsString() @MaxLength(100) gatewayId?: string;
  @IsOptional() @IsString() @MaxLength(100) operator?: string;
  @IsOptional() @IsDateString() receivedAt?: string;
}

