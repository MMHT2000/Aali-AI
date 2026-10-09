import { Body, Controller, Get, Patch, Post, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/auth/roles.decorator';
import { UserRole } from '../users/entities/user-role.enum';
import { SimulationService } from './simulation.service';
import { CreateFieldReadingDto } from './field-reading.dto';
import { OperationsService } from './operations.service';
import { SetSimulationConnectivityDto, SetSimulationSpeedDto } from './simulation-controls.dto';

@ApiTags('Operations Control Room & Synthetic Simulation')
@ApiBearerAuth()
@Controller('api/v1')
export class OperationsController {
  constructor(private readonly operations: OperationsService, private readonly simulation: SimulationService) {}

  @Get('operations/snapshot')
  @Roles(UserRole.AUTHORITY, UserRole.RESPONDER, UserRole.VOLUNTEER, UserRole.RECOVERY_COORDINATOR, UserRole.VIEWER, UserRole.ADMIN)
  getSnapshot(@Request() req: { user: { role: UserRole } }) {
    return this.operations.getSnapshot(req.user.role);
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
