import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsDateString,
  IsArray,
  Min,
  ValidateNested,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class DayMealInput {
  @ApiProperty()
  @IsString()
  mealId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  time?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  order?: number;
}

class DietDayInput {
  @ApiProperty()
  @IsInt()
  @Min(0)
  dayOfWeek: number;

  @ApiProperty({ type: [DayMealInput] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DayMealInput)
  meals: DayMealInput[];
}

export class CreateDietDto {
  @ApiProperty({ example: 'Dieta Cutting' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Dieta para definição muscular' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '2026-01-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-03-01' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 2000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  targetCalories?: number;

  @ApiPropertyOptional({ example: 150 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  targetProteins?: number;

  @ApiPropertyOptional({ example: 200 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  targetCarbohydrates?: number;

  @ApiPropertyOptional({ example: 60 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  targetFats?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mealIds?: string[];

  @ApiPropertyOptional({ type: [DietDayInput] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DietDayInput)
  days?: DietDayInput[];
}
