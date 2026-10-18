import { DemoMomentRequest, SimulationGaugeRequest, SimulationTickRequest } from '../../common/validation/workflow.dto';
import { Body, Controller, Get, Patch, Post, Query, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/auth/roles.decorator';
import { Public } from '../../common/auth/public.decorator';
import { UserRole } from '../users/entities/user-role.enum';
import { SimulationService } from './simulation.service';
import { CreateFieldReadingDto } from './field-reading.dto';
import { OperationsService } from './operations.service';
import { SetSimulationConnectivityDto, SetSimulationSpeedDto } from './simulation-controls.dto';
import { OperationsSnapshotQueryDto } from './operations-snapshot-query.dto';
import { OperationsStreamService } from '../../common/stream/operations-stream.service';
import { Sse, MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';

@ApiTags('Operations Control Room & Synthetic Simulation')
@ApiBearerAuth()
@Controller('api/v1')
export class OperationsController {
  constructor(
    private readonly operations: OperationsService,
    private readonly simulation: SimulationService,
    private readonly streamService: OperationsStreamService,
  ) {}

  @Sse('operations/live-stream')
  @Public()
  @ApiOperation({ summary: 'Real-time Server-Sent Events stream for zero-latency crisis updates' })
  streamEvents(): Observable<MessageEvent> {
    return this.streamService.getStream();
  }

  @Post('operations/demo-moment')
  @Public()
  @ApiOperation({ summary: 'Broadcast a stage demo moment event across all connected dashboards' })
  broadcastMoment(@Body() body: DemoMomentRequest) {
    this.streamService.emit('DEMO_MOMENT', {
      moment: body.moment,
      title: body.title,
      payload: body.payload || {},
    });
    return { status: 'broadcasted', moment: body.moment, timestamp: new Date().toISOString() };
  }

  @Get('operations/snapshot')
  @Roles(UserRole.AUTHORITY, UserRole.RESPONDER, UserRole.VOLUNTEER, UserRole.RECOVERY_COORDINATOR, UserRole.VIEWER, UserRole.ADMIN)
  @ApiQuery({ name: 'mode', required: false, enum: ['LIVE', 'EXERCISE', 'HISTORICAL'] })
  @ApiQuery({ name: 'eventId', required: false, description: 'Supported event ID for Exercise or Historical mode.' })
  getSnapshot(@Request() req: { user: { role: UserRole } }, @Query() query: OperationsSnapshotQueryDto) {
    return this.operations.getSnapshot(req.user.role, query);
  }

  @Post('field-readings')
  @Roles(UserRole.VOLUNTEER)
  recordFieldReading(@Body() dto: CreateFieldReadingDto, @Request() req: { user: { id: string } }) {
    return this.operations.recordFieldReading(dto, req.user.id);
  }

  @Post('simulation/start')
  @Roles(UserRole.AUTHORITY, UserRole.ADMIN)
  start() { return this.simulation.start(); }

  @Post('simulation/pause')
  @Roles(UserRole.AUTHORITY, UserRole.ADMIN)
  pause() { return this.simulation.pause(); }

  @Post('simulation/step')
  @Roles(UserRole.AUTHORITY, UserRole.ADMIN)
  step() { return this.simulation.step(); }

  @Post('simulation/reset')
  @Roles(UserRole.AUTHORITY, UserRole.ADMIN)
  reset() { return this.simulation.reset(); }

  @Patch('simulation/speed')
  @Roles(UserRole.AUTHORITY, UserRole.ADMIN)
  setSpeed(@Body() dto: SetSimulationSpeedDto) { return this.simulation.setSpeed(dto.speed); }

  @Patch('simulation/connectivity')
  @Roles(UserRole.AUTHORITY, UserRole.ADMIN)
  setConnectivity(@Body() dto: SetSimulationConnectivityDto) {
    return this.simulation.setConnectivity(dto.internetAvailable);
  }

  @Patch('simulation/gauge')
  @Roles(UserRole.AUTHORITY, UserRole.ADMIN, UserRole.RESPONDER, UserRole.VIEWER)
  toggleGauge(@Body() body: SimulationGaugeRequest) {
    return this.simulation.toggleGauge(body.available);
  }

  @Patch('simulation/tick')
  @Roles(UserRole.AUTHORITY, UserRole.ADMIN, UserRole.RESPONDER, UserRole.VIEWER)
  setTick(@Body() body: SimulationTickRequest) {
    return this.simulation.setTick(body.tickIndex);
  }
}
