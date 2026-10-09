import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AlertsService, WarningDraftDto } from './alerts.service';
import { ThreeSignalAlertInput } from '../../domain/flood-alert/three-signal-alert';

@ApiTags('Flood Alerts, Historical Replay & Warning Approvals')
@Controller('api/v1')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @ApiOperation({ summary: 'Evaluate pure deterministic 3-signal flood alert rules' })
  @Post('alerts/evaluate')
  evaluateAlert(@Body() body: ThreeSignalAlertInput) {
    return this.alertsService.evaluateAlert(body);
  }

  @ApiOperation({ summary: 'Get available historical flood replay scenarios' })
  @Get('replay/scenarios')
  getScenarios() {
    return this.alertsService.getScenarios();
  }

  @ApiOperation({ summary: 'Initialize or start historical replay scenario' })
  @Post('replay/runs')
  startReplay(@Body('scenarioId') scenarioId: string) {
    return this.alertsService.startReplay(scenarioId);
  }

  @ApiOperation({ summary: 'Get current replay run state' })
  @Get('replay/runs/:id')
  getReplayRun(@Param('id') runId: string) {
    return this.alertsService.getReplayRun(runId);
  }

  @ApiOperation({ summary: 'Step replay tick forward/backward' })
  @Post('replay/runs/:id/step')
  stepReplay(
    @Param('id') runId: string,
    @Body('direction') direction: 'NEXT' | 'PREV' | 'SET_TICK',
    @Body('targetTick') targetTick?: number,
  ) {
    return this.alertsService.stepReplay(runId, direction, targetTick);
  }

  @ApiOperation({ summary: 'Blank/restore river gauge sensor telemetry (simulation)' })
  @Patch('replay/runs/:id/gauge-state')
  setGaugeState(
    @Param('id') runId: string,
    @Body('blanked') blanked: boolean,
  ) {
    return this.alertsService.setGaugeState(runId, blanked);
  }

  @ApiOperation({ summary: 'List all warning drafts and approvals' })
  @Get('warnings')
  getWarnings() {
    return this.alertsService.getWarnings();
  }

  @ApiOperation({ summary: 'Draft a ward-level emergency warning citing supporting signals' })
  @Post('warnings/drafts')
  createDraft(@Body() dto: WarningDraftDto) {
    const defaultAuthor = '00000000-0000-0000-0000-000000000002'; // Authority user
    return this.alertsService.createWarningDraft(dto, defaultAuthor);
  }

  @ApiOperation({ summary: 'Approve warning draft (human authority approval required)' })
  @Post('warnings/:id/approve')
  approveWarning(
    @Param('id') id: string,
    @Body('note') note: string,
  ) {
    const authorityUser = '00000000-0000-0000-0000-000000000002';
    return this.alertsService.approveWarning(id, authorityUser, note || 'Approved by District Disaster Authority');
  }

  @ApiOperation({ summary: 'Reject warning draft' })
  @Post('warnings/:id/reject')
  rejectWarning(
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    const authorityUser = '00000000-0000-0000-0000-000000000002';
    return this.alertsService.rejectWarning(id, authorityUser, reason || 'Conditions resolved');
  }

  @ApiOperation({ summary: 'Simulate warning broadcast via cell broadcast/SMS (Demo only)' })
  @Post('warnings/:id/send-simulated')
  simulateBroadcast(@Param('id') id: string) {
    return this.alertsService.simulateBroadcast(id);
  }
}
