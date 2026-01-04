import { Module } from '@nestjs/common';
import { MicronutrientsService } from './micronutrients.service';
import { MicronutrientsController } from './micronutrients.controller';

@Module({
  controllers: [MicronutrientsController],
  providers: [MicronutrientsService],
  exports: [MicronutrientsService],
})
export class MicronutrientsModule {}
