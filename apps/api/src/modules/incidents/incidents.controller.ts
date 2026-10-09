import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Request,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IncidentsService } from './incidents.service';
import { Roles } from '../../common/auth/roles.decorator';
import { UserRole } from '../users/entities/user-role.enum';

@ApiTags('Incidents, Triage & Responder Operations')
@Controller('api/v1/incidents')
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Get()
  @Roles(UserRole.AUTHORITY, UserRole.RESPONDER, UserRole.ADMIN)
  @ApiOperation({ summary: 'List all open incidents with confidence and boat priority' })
  async getIncidents() {
    return this.incidentsService.getIncidents();
  }

  @Get('silent-areas')
  @Roles(UserRole.AUTHORITY, UserRole.RESPONDER, UserRole.ADMIN)
  @ApiOperation({ summary: 'List high-risk silent areas requiring verification by safe means' })
  getSilentAreas() {
    return this.incidentsService.getSilentVillages();
  }

  @Get(':id')
  @Roles(UserRole.AUTHORITY, UserRole.RESPONDER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get details for a specific incident' })
  async getIncidentById(@Param('id') id: string) {
    const inc = await this.incidentsService.getIncidentById(id);
    if (!inc) {
      throw new NotFoundException(`Incident ${id} not found`);
    }
    return inc;
  }

  @Post(':id/duplicate-candidates/:candidateId/review')
  @Roles(UserRole.RESPONDER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Operator review for duplicate match candidate (ACCEPT or REJECT)' })
  async reviewDuplicate(
    @Param('id') incidentId: string,
    @Param('candidateId') candidateId: string,
    @Body() body: { decision: 'ACCEPT' | 'REJECT'; reason: string },
    @Request() req: { user: { id: string } },
  ) {
    return this.incidentsService.reviewDuplicateCandidate(
      incidentId,
      candidateId,
      body.decision,
      body.reason || 'Operator review',
      req.user.id,
    );
  }

  @Post(':id/split')
  @Roles(UserRole.RESPONDER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Operator unmerge/split action: separates linked report into new incident' })
  async splitIncident(
    @Param('id') incidentId: string,
    @Body() body: { reportId: string; reason: string },
    @Request() req: { user: { id: string } },
  ) {
    return this.incidentsService.splitIncident(
      incidentId,
      body.reportId,
      body.reason || 'Operator split action',
      req.user.id,
    );
  }

  @Post(':id/boat-recommendation/review')
  @Roles(UserRole.RESPONDER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Operator human review for suggested boat dispatch (ACCEPT or REJECT, no auto-dispatch)' })
  async reviewBoatRecommendation(
    @Param('id') incidentId: string,
    @Body() body: { decision: 'ACCEPT' | 'REJECT'; reason?: string },
    @Request() req: { user: { id: string } },
  ) {
    return this.incidentsService.reviewBoatSuggestion(
      incidentId,
      body.decision,
      body.reason || 'Responder review on boat recommendation',
      req.user.id,
    );
  }
}

