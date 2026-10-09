import { Module } from '@nestjs/common';
import { ReferenceDataController } from './reference.controller';

@Module({
  controllers: [ReferenceDataController],
  exports: [],
})
export class ReferenceModule {}

