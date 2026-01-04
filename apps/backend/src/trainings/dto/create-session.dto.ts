import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsDateString,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

class SessionExerciseDto {
  @ApiPropertyOptional({ example: 'Supino Reto' })
  @IsString()
  exerciseName: string;

  @ApiPropertyOptional({ example: 4 })
  @IsInt()
  @Min(1)
  sets: number;

  @ApiPropertyOptional({ example: '10' })
  @IsString()
  reps: string;

  @ApiPropertyOptional({ example: 80 })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiPropertyOptional({ example: 'Aumentei a carga' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}

export class CreateSessionDto {
  @ApiPropertyOptional({ example: '2026-01-03' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ example: 55, description: 'Duração em minutos' })
  @IsOptional()
  @IsInt()
  @Min(0)
  duration?: number;

  @ApiPropertyOptional({ example: 'Treino intenso hoje' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @ApiPropertyOptional({ type: [SessionExerciseDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SessionExerciseDto)
  exercises?: SessionExerciseDto[];
}
