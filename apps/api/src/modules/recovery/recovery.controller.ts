import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CreateReportDto,
  RecordDeliveryDto,
  RecoveryService,
} from './recovery.service';

@ApiTags('Recovery & Aid Delivery Ledger')
@Controller('api/v1/recovery')
export class RecoveryController {
  constructor(private readonly recoveryService: RecoveryService) {}

  @ApiOperation({ summary: 'Submit village damage and needs assessment report' })
  @Post('reports')
  createReport(@Body() dto: CreateReportDto) {
    return this.recoveryService.createReport(dto);
  }

  @ApiOperation({ summary: 'List all submitted damage/needs reports' })
  @Get('reports')
  getReports() {
    return this.recoveryService.getReports();
  }

  @ApiOperation({ summary: 'Record aid delivery receipt with idempotency guard' })
  @Post('deliveries')
  recordDelivery(@Body() dto: RecordDeliveryDto) {
    return this.recoveryService.recordDelivery(dto);
  }

  @ApiOperation({ summary: 'List all recorded aid delivery receipts' })
  @Get('deliveries')
  getDeliveries() {
    return this.recoveryService.getDeliveries();
  }

  @ApiOperation({ summary: 'Get village unmet-needs ranking and relief coverage summary' })
  @Get('summary')
  getSummary() {
    return this.recoveryService.getSummary();
  }
}

