import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { Roles } from '../../common/auth/roles.decorator';
import { UserRole } from '../users/entities/user-role.enum';

@ApiTags('Audit Trail')
@Controller('api/v1/audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles(UserRole.AUTHORITY, UserRole.ADMIN)
  @ApiOperation({ summary: 'List immutable audit logs for sensitive operations' })
  @ApiQuery({ name: 'entityType', required: false, description: 'Filter by entity type (WARNING, INCIDENT, AID_DELIVERY)' })
  @ApiQuery({ name: 'entityId', required: false, description: 'Filter by entity ID' })
  getAuditLogs(
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
  ) {
    return this.auditService.getPersistedLogs({ entityType, entityId });
  }
}
