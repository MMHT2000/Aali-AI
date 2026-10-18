import { AlertEvaluateRequest, ReplayStartRequest, ReplayStepRequest, GaugeStateRequest, WarningDraftRequest, WarningApproveRequest, WarningRejectRequest } from '../../common/validation/workflow.dto';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AlertsService } from './alerts.service';

import { Roles } from '../../common/auth/roles.decorator';
import { Public } from '../../common/auth/public.decorator';
import { UserRole } from '../users/entities/user-role.enum';

@ApiTags('Flood Alerts, Historical Replay & Warning Approvals')
@Controller('api/v1')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @ApiOperation({ summary: 'Evaluate pure deterministic 3-signal flood alert rules' })
  @Post('alerts/evaluate')
  @Roles(UserRole.AUTHORITY, UserRole.RESPONDER, UserRole.ADMIN, UserRole.VIEWER, UserRole.VOLUNTEER, UserRole.RECOVERY_COORDINATOR)
  evaluateAlert(@Body() body: AlertEvaluateRequest) {
    return this.alertsService.evaluateAlert(body);
  }

  @ApiOperation({ summary: 'Get available historical flood replay scenarios' })
  @Get('replay/scenarios')
  @Roles(UserRole.AUTHORITY, UserRole.RESPONDER, UserRole.ADMIN, UserRole.VIEWER)
  getScenarios() {
    return this.alertsService.getScenarios();
  }

  @ApiOperation({ summary: 'Initialize or start historical replay scenario' })
  @Post('replay/runs')
  @Roles(UserRole.AUTHORITY, UserRole.ADMIN)
  startReplay(@Body() body: ReplayStartRequest) {
    return this.alertsService.startReplay(body.scenarioId);
  }

  @ApiOperation({ summary: 'Get current replay run state' })
  @Get('replay/runs/:id')
  @Roles(UserRole.AUTHORITY, UserRole.RESPONDER, UserRole.ADMIN, UserRole.VIEWER)
  getReplayRun(@Param('id') runId: string) {
    return this.alertsService.getReplayRun(runId);
  }

  @ApiOperation({ summary: 'Step replay tick forward/backward' })
  @Post('replay/runs/:id/step')
  @Roles(UserRole.AUTHORITY, UserRole.ADMIN)
  stepReplay(
    @Param('id') runId: string,
    @Body() body: ReplayStepRequest,
  ) {
    return this.alertsService.stepReplay(runId, body.direction, body.targetTick);
  }

  @ApiOperation({ summary: 'Blank/restore river gauge sensor telemetry (simulation)' })
  @Patch('replay/runs/:id/gauge-state')
  @Roles(UserRole.AUTHORITY, UserRole.ADMIN)
  setGaugeState(
    @Param('id') runId: string,
    @Body() body: GaugeStateRequest,
  ) {
    return this.alertsService.setGaugeState(runId, body.blanked);
  }

  @ApiOperation({ summary: 'List all warning drafts and approvals' })
  @Get('warnings')
  @Public()
  getWarnings(
    @Query('eventId') eventId?: string,
    @Query('districtCode') districtCode?: string,
  ) {
    return this.alertsService.getWarnings(eventId, districtCode);
  }

  @ApiOperation({ summary: 'Draft a ward-level emergency warning citing supporting signals' })
  @Post('warnings/drafts')
  @Roles(UserRole.AUTHORITY)
  createDraft(@Body() dto: WarningDraftRequest, @Request() req: { user: { id: string } }) {
    return this.alertsService.createWarningDraft(dto, req.user.id);
  }

  @ApiOperation({ summary: 'Approve warning draft (human authority approval required)' })
  @Post('warnings/:id/approve')
  @Roles(UserRole.AUTHORITY)
  approveWarning(
    @Param('id') id: string,
    @Body() body: WarningApproveRequest,
    @Request() req: { user: { id: string } },
  ) {
    return this.alertsService.approveWarning(id, req.user.id, body.note || 'Approved by District Disaster Authority');
  }

  @ApiOperation({ summary: 'Reject warning draft' })
  @Post('warnings/:id/reject')
  @Roles(UserRole.AUTHORITY)
  rejectWarning(
    @Param('id') id: string,
    @Body() body: WarningRejectRequest,
    @Request() req: { user: { id: string } },
  ) {
    return this.alertsService.rejectWarning(id, req.user.id, body.reason || 'Conditions resolved');
  }

  @ApiOperation({ summary: 'Simulate warning broadcast via cell broadcast/SMS (Demo only)' })
  @Post('warnings/:id/send-simulated')
  @Roles(UserRole.AUTHORITY)
  simulateBroadcast(@Param('id') id: string) {
    return this.alertsService.simulateBroadcast(id);
  }

  @ApiOperation({ summary: 'Get ready-to-air loudspeaker audio announcement script and metadata for mosque broadcast' })
  @Get('warnings/:id/loudspeaker-audio')
  @Public()
  getLoudspeakerAudio(@Param('id') id: string) {
    return this.alertsService.getLoudspeakerAudio(id);
  }
}

