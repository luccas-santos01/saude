import { IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProgressImageDto {
  @ApiPropertyOptional({ example: '2026-01-03' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ example: 'Frontal' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 'Foto após 3 meses de treino' })
  @IsOptional()
  @IsString()
  description?: string;
}
