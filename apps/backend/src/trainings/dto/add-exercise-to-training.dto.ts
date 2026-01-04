import { IsString, IsOptional, IsInt, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddExerciseToTrainingDto {
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
  @IsNumber()
  weight?: number;

  @ApiPropertyOptional({ example: 'Aumentar carga se completar 12 reps' })
  @IsOptional()
  @IsString()
  notes?: string;
}
