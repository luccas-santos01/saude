import { PartialType } from '@nestjs/swagger';
import { CreateMicronutrientDto } from './create-micronutrient.dto';

export class UpdateMicronutrientDto extends PartialType(CreateMicronutrientDto) {}
