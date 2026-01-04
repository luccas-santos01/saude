import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMicronutrientDto {
  @ApiProperty({ example: 'Vitamina D' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'UI' })
  @IsString()
  unit: string;
}
