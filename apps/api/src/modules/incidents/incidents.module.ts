import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SosModule } from '../sos/sos.module';
import { AuditModule } from '../audit/audit.module';
import { IncidentsController } from './incidents.controller';
import { IncidentsService } from './incidents.service';
import { Incident, IncidentReport, DuplicateCandidate } from './entities/incident.entity';
import { Asset, DispatchSuggestion } from '../assets/entities/asset.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Incident, IncidentReport, DuplicateCandidate, Asset, DispatchSuggestion]),
    SosModule,
    AuditModule,
  ],
  controllers: [IncidentsController],
  providers: [IncidentsService],
  exports: [IncidentsService],
})
export class IncidentsModule {}

