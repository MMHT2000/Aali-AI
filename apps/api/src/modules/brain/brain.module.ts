import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecoveryModule } from '../recovery/recovery.module';
import { SosModule } from '../sos/sos.module';
import { BrainController } from './brain.controller';
import { BrainRun } from './brain-run.entity';
import { BrainService } from './brain.service';
import { EnvironmentalDataService } from './environmental-data.service';
import { OpenAiBrainAgent } from './openai-brain-agent';
@Module({ imports: [TypeOrmModule.forFeature([BrainRun]), RecoveryModule, SosModule], controllers: [BrainController], providers: [BrainService, EnvironmentalDataService, OpenAiBrainAgent] })
export class BrainModule {}
