import { PartialType } from '@nestjs/swagger';
import { CreateBodyMeasurementDto } from './create-body-measurement.dto';

export class UpdateBodyMeasurementDto extends PartialType(CreateBodyMeasurementDto) {}
