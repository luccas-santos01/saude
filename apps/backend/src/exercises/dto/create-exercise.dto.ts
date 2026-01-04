import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExerciseDto {
  @ApiProperty({ example: 'Supino Reto' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Exercício para peito' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Peito' })
  @IsOptional()
  @IsString()
  muscleGroup?: string;

  @ApiPropertyOptional({ example: 'Barra' })
  @IsOptional()
  @IsString()
  equipment?: string;

  @ApiPropertyOptional({ example: 'Deitar no banco, segurar a barra...' })
  @IsOptional()
  @IsString()
  instructions?: string;

  @ApiPropertyOptional({ example: 'https://youtube.com/...' })
  @IsOptional()
  @IsString()
  videoUrl?: string;
}
