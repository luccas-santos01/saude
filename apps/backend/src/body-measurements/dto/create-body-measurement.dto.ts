import { IsOptional, IsNumber, IsString, IsDateString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBodyMeasurementDto {
  @ApiPropertyOptional({ example: '2026-01-03' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ example: 80.5, description: 'Peso em kg' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({ example: 175, description: 'Altura em cm' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  height?: number;

  @ApiPropertyOptional({ example: 15.5, description: 'Percentual de gordura' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  bodyFat?: number;

  @ApiPropertyOptional({ example: 35, description: 'Massa muscular em kg' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  muscleMass?: number;

  @ApiPropertyOptional({ example: 100, description: 'Peito em cm' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  chest?: number;

  @ApiPropertyOptional({ example: 80, description: 'Cintura em cm' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  waist?: number;

  @ApiPropertyOptional({ example: 95, description: 'Quadril em cm' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  hips?: number;

  @ApiPropertyOptional({ example: 35, description: 'Braço esquerdo em cm' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  leftArm?: number;

  @ApiPropertyOptional({ example: 35, description: 'Braço direito em cm' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rightArm?: number;

  @ApiPropertyOptional({ example: 55, description: 'Coxa esquerda em cm' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  leftThigh?: number;

  @ApiPropertyOptional({ example: 55, description: 'Coxa direita em cm' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rightThigh?: number;

  @ApiPropertyOptional({ example: 38, description: 'Panturrilha esquerda em cm' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  leftCalf?: number;

  @ApiPropertyOptional({ example: 38, description: 'Panturrilha direita em cm' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rightCalf?: number;

  @ApiPropertyOptional({ example: 120, description: 'Ombros em cm' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  shoulders?: number;

  @ApiPropertyOptional({ example: 40, description: 'Pescoço em cm' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  neck?: number;

  @ApiPropertyOptional({ example: 'Medidas após treino' })
  @IsOptional()
  @IsString()
  notes?: string;
}
