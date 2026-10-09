import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertEvaluation, Warning } from './entities/warning.entity';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AlertEvaluation, Warning])],
  controllers: [AlertsController],
  providers: [AlertsService],
  exports: [AlertsService],
})
export class WarningsModule {}

