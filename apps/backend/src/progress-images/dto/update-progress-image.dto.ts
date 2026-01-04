import { PartialType } from '@nestjs/swagger';
import { CreateProgressImageDto } from './create-progress-image.dto';

export class UpdateProgressImageDto extends PartialType(CreateProgressImageDto) {}
