import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AlertsService, WarningDraftDto } from './alerts.service';
import { ThreeSignalAlertInput } from '../../domain/flood-alert/three-signal-alert';
import { Roles } from '../../common/auth/roles.decorator';
import { UserRole } from '../users/entities/user-role.enum';

@ApiTags('Flood Alerts, Historical Replay & Warning Approvals')
@Controller('api/v1')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @ApiOperation({ summary: 'Evaluate pure deterministic 3-signal flood alert rules' })
  @Post('alerts/evaluate')
  @Roles(UserRole.AUTHORITY, UserRole.ADMIN)
  evaluateAlert(@Body() body: ThreeSignalAlertInput) {
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
  @Roles(UserRole.AUTHORITY, UserRole.RESPONDER, UserRole.ADMIN)
  startReplay(@Body('scenarioId') scenarioId: string) {
    return this.alertsService.startReplay(scenarioId);
  }

  @ApiOperation({ summary: 'Get current replay run state' })
  @Get('replay/runs/:id')
  @Roles(UserRole.AUTHORITY, UserRole.RESPONDER, UserRole.ADMIN, UserRole.VIEWER)
  getReplayRun(@Param('id') runId: string) {
    return this.alertsService.getReplayRun(runId);
  }

  @ApiOperation({ summary: 'Step replay tick forward/backward' })
  @Post('replay/runs/:id/step')
  @Roles(UserRole.AUTHORITY, UserRole.RESPONDER, UserRole.ADMIN)
  stepReplay(
    @Param('id') runId: string,
    @Body('direction') direction: 'NEXT' | 'PREV' | 'SET_TICK',
    @Body('targetTick') targetTick?: number,
  ) {
    return this.alertsService.stepReplay(runId, direction, targetTick);
  }

  @ApiOperation({ summary: 'Blank/restore river gauge sensor telemetry (simulation)' })
  @Patch('replay/runs/:id/gauge-state')
  @Roles(UserRole.AUTHORITY, UserRole.ADMIN)
  setGaugeState(
    @Param('id') runId: string,
    @Body('blanked') blanked: boolean,
  ) {
    return this.alertsService.setGaugeState(runId, blanked);
  }

  @ApiOperation({ summary: 'List all warning drafts and approvals' })
  @Get('warnings')
  @Roles(UserRole.AUTHORITY, UserRole.ADMIN)
  getWarnings() {
    return this.alertsService.getWarnings();
  }

  @ApiOperation({ summary: 'Draft a ward-level emergency warning citing supporting signals' })
  @Post('warnings/drafts')
  @Roles(UserRole.AUTHORITY, UserRole.ADMIN)
  createDraft(@Body() dto: WarningDraftDto, @Request() req: { user: { id: string } }) {
    return this.alertsService.createWarningDraft(dto, req.user.id);
  }

  @ApiOperation({ summary: 'Approve warning draft (human authority approval required)' })
  @Post('warnings/:id/approve')
  @Roles(UserRole.AUTHORITY, UserRole.ADMIN)
  approveWarning(
    @Param('id') id: string,
    @Body('note') note: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.alertsService.approveWarning(id, req.user.id, note || 'Approved by District Disaster Authority');
  }

  @ApiOperation({ summary: 'Reject warning draft' })
  @Post('warnings/:id/reject')
  @Roles(UserRole.AUTHORITY, UserRole.ADMIN)
  rejectWarning(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.alertsService.rejectWarning(id, req.user.id, reason || 'Conditions resolved');
  }

  @ApiOperation({ summary: 'Simulate warning broadcast via cell broadcast/SMS (Demo only)' })
  @Post('warnings/:id/send-simulated')
  @Roles(UserRole.AUTHORITY, UserRole.ADMIN)
  simulateBroadcast(@Param('id') id: string) {
    return this.alertsService.simulateBroadcast(id);
  }
}

