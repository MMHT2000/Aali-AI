import { Module } from '@nestjs/common';
import { SosModule } from '../sos/sos.module';
import { AuditModule } from '../audit/audit.module';
import { IncidentsController } from './incidents.controller';
import { IncidentsService } from './incidents.service';

@Module({
  imports: [SosModule, AuditModule],
  controllers: [IncidentsController],
  providers: [IncidentsService],
  exports: [IncidentsService],
})
export class IncidentsModule {}

