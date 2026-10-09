import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuditService } from './audit.service';

@ApiTags('Audit Trail')
@Controller('api/v1/audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'List immutable audit logs for sensitive operations' })
  @ApiQuery({ name: 'entityType', required: false, description: 'Filter by entity type (WARNING, INCIDENT, AID_DELIVERY)' })
  @ApiQuery({ name: 'entityId', required: false, description: 'Filter by entity ID' })
  getAuditLogs(
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
  ) {
    return this.auditService.getLogs({ entityType, entityId });
  }
}
