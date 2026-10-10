import { Module } from '@nestjs/common';
import { IncidentsModule } from '../incidents/incidents.module';
import { SosModule } from '../sos/sos.module';
import { OperationsController } from './operations.controller';
import { OperationsService } from './operations.service';
import { SimulationService } from './simulation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VolunteerReading } from '../gauges/entities/observation.entity';
import { SimulationRunState } from './entities/simulation-run-state.entity';
import { AuditModule } from '../audit/audit.module';
import { BmdCapService } from './bmd-cap.service';
import { OperationsStreamService } from '../../common/stream/operations-stream.service';

@Module({
  imports: [IncidentsModule, SosModule, AuditModule, TypeOrmModule.forFeature([VolunteerReading, SimulationRunState])],
  controllers: [OperationsController],
  providers: [OperationsService, SimulationService, BmdCapService, OperationsStreamService],
  exports: [OperationsService, SimulationService, OperationsStreamService],
})
export class OperationsModule {}
