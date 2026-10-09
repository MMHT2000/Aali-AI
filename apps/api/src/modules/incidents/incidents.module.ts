import { Module } from '@nestjs/common';
import { SosModule } from '../sos/sos.module';
import { IncidentsController } from './incidents.controller';
import { IncidentsService } from './incidents.service';

@Module({
  imports: [SosModule],
  controllers: [IncidentsController],
  providers: [IncidentsService],
  exports: [IncidentsService],
})
export class IncidentsModule {}

