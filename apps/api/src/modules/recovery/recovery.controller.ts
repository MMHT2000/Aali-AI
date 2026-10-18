import { DeliveryRequest, RecoveryReportRequest } from '../../common/validation/workflow.dto';
import { Body, Controller, Get, Post, Query, Request } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  RecoveryService,
} from './recovery.service';
import { Roles } from '../../common/auth/roles.decorator';
import { UserRole } from '../users/entities/user-role.enum';
import { OperationsSnapshotQueryDto } from '../operations/operations-snapshot-query.dto';

@ApiTags('Recovery & Aid Delivery Ledger')
@Controller('api/v1/recovery')
export class RecoveryController {
  constructor(private readonly recoveryService: RecoveryService) {}

  @ApiOperation({ summary: 'Submit village damage and needs assessment report' })
  @Post('reports')
  @Roles(UserRole.RECOVERY_COORDINATOR)
  createReport(@Body() dto: RecoveryReportRequest, @Request() req: { user: { id: string } }) {
    return this.recoveryService.createReport({ ...dto, reportedBy: req.user.id });
  }

  @ApiOperation({ summary: 'List all submitted damage/needs reports' })
  @Get('reports')
  @Roles(UserRole.RECOVERY_COORDINATOR, UserRole.AUTHORITY)
  getReports(@Query() query: OperationsSnapshotQueryDto) {
    return this.recoveryService.getReports(query.eventId);
  }

  @ApiOperation({ summary: 'Record aid delivery receipt with idempotency guard' })
  @Post('deliveries')
  @Roles(UserRole.RECOVERY_COORDINATOR)
  recordDelivery(@Body() dto: DeliveryRequest, @Request() req: { user: { id: string } }) {
    return this.recoveryService.recordDelivery({ ...dto, recordedBy: req.user.id });
  }

  @ApiOperation({ summary: 'List all recorded aid delivery receipts' })
  @Get('deliveries')
  @Roles(UserRole.RECOVERY_COORDINATOR, UserRole.AUTHORITY)
  getDeliveries(@Query() query: OperationsSnapshotQueryDto) {
    return this.recoveryService.getDeliveries(query.eventId);
  }

  @ApiOperation({ summary: 'Get village unmet-needs ranking and relief coverage summary' })
  @Get('summary')
  @Roles(UserRole.RECOVERY_COORDINATOR, UserRole.AUTHORITY, UserRole.ADMIN, UserRole.VIEWER)
  getSummary(@Query() query: OperationsSnapshotQueryDto) {
    return this.recoveryService.getSummary(query.eventId);
  }
}

