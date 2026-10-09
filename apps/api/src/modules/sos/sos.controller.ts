import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateSosDto, DecodePacketDto } from './dto/sos.dto';
import { SosService } from './sos.service';

@ApiTags('SOS & Disaster Packets')
@Controller('api/v1')
export class SosController {
  constructor(private readonly sosService: SosService) {}

  @Post('sos')
  @ApiOperation({ summary: 'Submit an emergency SOS report (idempotent)' })
  @ApiResponse({ status: 201, description: 'SOS report created or existing idempotent record returned' })
  async createSos(@Body() dto: CreateSosDto) {
    const result = await this.sosService.createSos(dto);
    return {
      status: 'success',
      report: result.report,
      idempotentDuplicate: result.isDuplicate,
    };
  }

  @Post('packets/decode')
  @ApiOperation({ summary: 'Validate and decode an ASCII Disaster Packet without creating a report' })
  @ApiResponse({ status: 200, description: 'Parse outcome and validated fields' })
  decodePacket(@Body() dto: DecodePacketDto) {
    return this.sosService.decodePacket(dto);
  }

  @Get('sos')
  @ApiOperation({ summary: 'List recent SOS reports' })
  async getReports() {
    return this.sosService.getReports();
  }

  @Get('sos/:id')
  @ApiOperation({ summary: 'Get a single SOS report by ID' })
  async getReportById(@Param('id') id: string) {
    const report = await this.sosService.getReportById(id);
    if (!report) {
      throw new NotFoundException(`SOS Report with id ${id} not found`);
    }
    return report;
  }
}

