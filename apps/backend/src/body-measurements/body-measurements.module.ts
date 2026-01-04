import { Module } from '@nestjs/common';
import { BodyMeasurementsService } from './body-measurements.service';
import { BodyMeasurementsController } from './body-measurements.controller';

@Module({
  controllers: [BodyMeasurementsController],
  providers: [BodyMeasurementsService],
  exports: [BodyMeasurementsService],
})
export class BodyMeasurementsModule {}
