import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class TrainingExerciseDto {
  @ApiProperty()
  @IsString()
  exerciseId: string;

  @ApiProperty({ example: 4 })
  @IsInt()
  @Min(1)
  sets: number;

  @ApiProperty({ example: '10-12' })
  @IsString()
  reps: string;

  @ApiPropertyOptional({ example: 60 })
  @IsOptional()
  @IsInt()
  @Min(0)
  restSeconds?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  weight?: number;

  @ApiPropertyOptional({ example: 'Aumentar carga se completar 12 reps' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}

export class CreateTrainingDto {
  @ApiProperty({ example: 'Treino A - Peito e Tríceps' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Treino focado em push' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Hipertrofia' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 1, description: '0-6 (Domingo-Sábado)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek?: number;

  @ApiPropertyOptional({ example: 60, description: 'Duração em minutos' })
  @IsOptional()
  @IsInt()
  @Min(0)
  duration?: number;

  @ApiPropertyOptional({ type: [TrainingExerciseDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrainingExerciseDto)
  exercises?: TrainingExerciseDto[];
}
