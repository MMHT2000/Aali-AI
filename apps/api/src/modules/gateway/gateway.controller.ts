import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SimulatedGatewayIngestDto, SmsGatewayRequest } from './dto/gateway-ingest.dto';
import { GatewayService } from './gateway.service';
import { SmsGatewayIngestResult } from './transport-adapter.interface';
import { Roles } from '../../common/auth/roles.decorator';
import { UserRole } from '../users/entities/user-role.enum';

@ApiTags('Transport & Gateway Simulator')
@Controller('api/v1/gateway')
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Post('simulated/ingest')
  @Roles(UserRole.AUTHORITY, UserRole.RESPONDER)
  @ApiOperation({
    summary: 'Demo only: Ingest an ASCII Disaster Packet through simulated carrier SMS gateway',
    description:
      'Accepts an ASCII disaster packet, verifies optional HMAC-SHA256 signature (X-Carrier-Signature), checksum/schema, avoids duplicate report creation on retry, and returns explicit simulation: true label.',
  })
  @ApiResponse({
    status: 201,
    description: 'Packet accepted or existing idempotent report returned with simulation: true',
  })
  @ApiResponse({ status: 400, description: 'Packet malformed or checksum mismatch' })
  @ApiResponse({ status: 401, description: 'Invalid or missing carrier HMAC signature' })
  async ingestSimulatedPacket(
    @Body() dto: SimulatedGatewayIngestDto,
    @Headers('x-carrier-signature') signature?: string,
  ): Promise<SmsGatewayIngestResult> {
    return this.gatewayService.ingestSimulatedPacket(dto, signature);
  }

  @Post('sms')
  @Roles(UserRole.AUTHORITY, UserRole.RESPONDER)
  @ApiOperation({ summary: 'SMS / Telecom Short-Code Gateway Ingestion Endpoint' })
  async ingestSmsPacket(
    @Body() body: SmsGatewayRequest,
    @Headers('x-carrier-signature') signature?: string,
  ): Promise<SmsGatewayIngestResult> {
    const packet = body.packet || body.rawMessage || body.rawPacket || '';
    return this.gatewayService.ingestSimulatedPacket({
      packet,
      gatewayId: body.gatewayId || body.operator || 'TELECOM_SMS_GW',
      receivedAt: body.receivedAt,
    }, signature);
  }

  @Get('simulated/traces')
  @Roles(UserRole.AUTHORITY, UserRole.RESPONDER)
  @ApiOperation({ summary: 'List recent simulated gateway transmission traces' })
  getGatewayTraces() {
    return this.gatewayService.getGatewayTraces();
  }
}

