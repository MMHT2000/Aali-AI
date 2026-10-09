import { Body, Controller, Get, Patch, Post, Query, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/auth/roles.decorator';
import { UserRole } from '../users/entities/user-role.enum';
import { SimulationService } from './simulation.service';
import { CreateFieldReadingDto } from './field-reading.dto';
import { OperationsService } from './operations.service';
import { SetSimulationConnectivityDto, SetSimulationSpeedDto } from './simulation-controls.dto';
import { OperationsSnapshotQueryDto } from './operations-snapshot-query.dto';

@ApiTags('Operations Control Room & Synthetic Simulation')
@ApiBearerAuth()
@Controller('api/v1')
export class OperationsController {
  constructor(private readonly operations: OperationsService, private readonly simulation: SimulationService) {}

  @Get('operations/snapshot')
  @Roles(UserRole.AUTHORITY, UserRole.RESPONDER, UserRole.VOLUNTEER, UserRole.RECOVERY_COORDINATOR, UserRole.VIEWER, UserRole.ADMIN)
  @ApiQuery({ name: 'mode', required: false, enum: ['LIVE', 'EXERCISE', 'HISTORICAL'] })
  @ApiQuery({ name: 'eventId', required: false, description: 'Supported event ID for Exercise or Historical mode.' })
  getSnapshot(@Request() req: { user: { role: UserRole } }, @Query() query: OperationsSnapshotQueryDto) {
    return this.operations.getSnapshot(req.user.role, query);
  }

  @Post('field-readings')
  @Roles(UserRole.VOLUNTEER, UserRole.ADMIN)
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
  @Roles(UserRole.AUTHORITY, UserRole.ADMIN, UserRole.RESPONDER)
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
}
