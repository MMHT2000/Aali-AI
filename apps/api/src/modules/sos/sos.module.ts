import { Module } from '@nestjs/common';
import { SosController } from './sos.controller';
import { SosService } from './sos.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SosReport } from './entities/sos-report.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SosReport])],
  controllers: [SosController],
  providers: [SosService],
  exports: [SosService],
})
export class SosModule {}

