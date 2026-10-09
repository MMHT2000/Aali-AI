import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SimulatedGatewayIngestDto } from './dto/gateway-ingest.dto';
import { GatewayService } from './gateway.service';
import { SmsGatewayIngestResult } from './transport-adapter.interface';

@ApiTags('Transport & Gateway Simulator')
@Controller('api/v1/gateway')
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Post('simulated/ingest')
  @ApiOperation({
    summary: 'Demo only: Ingest an ASCII Disaster Packet through simulated carrier SMS gateway',
    description:
      'Accepts an ASCII disaster packet, verifies checksum/schema, avoids duplicate report creation on retry, and returns explicit simulation: true label.',
  })
  @ApiResponse({
    status: 201,
    description: 'Packet accepted or existing idempotent report returned with simulation: true',
  })
  @ApiResponse({ status: 400, description: 'Packet malformed or checksum mismatch' })
  async ingestSimulatedPacket(
    @Body() dto: SimulatedGatewayIngestDto,
  ): Promise<SmsGatewayIngestResult> {
    return this.gatewayService.ingestSimulatedPacket(dto);
  }

  @Get('simulated/traces')
  @ApiOperation({ summary: 'List recent simulated gateway transmission traces' })
  getGatewayTraces() {
    return this.gatewayService.getGatewayTraces();
  }
}
