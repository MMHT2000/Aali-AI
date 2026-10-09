import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { AuditModule } from '../audit/audit.module';
import { AlertEvaluation, Warning } from './entities/warning.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Warning, AlertEvaluation]), AuditModule],
  controllers: [AlertsController],
  providers: [AlertsService],
  exports: [AlertsService],
})
export class WarningsModule {}

