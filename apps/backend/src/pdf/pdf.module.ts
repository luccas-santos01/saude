import { Module } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { PdfController } from './pdf.controller';
import { DietsModule } from '../diets/diets.module';
import { TrainingsModule } from '../trainings/trainings.module';
import { BodyMeasurementsModule } from '../body-measurements/body-measurements.module';

@Module({
  imports: [DietsModule, TrainingsModule, BodyMeasurementsModule],
  controllers: [PdfController],
  providers: [PdfService],
  exports: [PdfService],
})
export class PdfModule {}
