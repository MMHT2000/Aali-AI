import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecoveryService } from './recovery.service';
import { RecoveryController } from './recovery.controller';
import { AuditModule } from '../audit/audit.module';
import { AidDelivery, RecoveryReport } from './entities/recovery.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RecoveryReport, AidDelivery]), AuditModule],
  controllers: [RecoveryController],
  providers: [RecoveryService],
  exports: [RecoveryService],
})
export class RecoveryModule {}

