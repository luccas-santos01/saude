import { IsString, IsOptional, IsInt, Min, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class MealFoodInput {
  @ApiProperty({ example: 'uuid-do-alimento' })
  @IsString()
  foodId: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  quantity: number;
}

export class CreateMealDto {
  @ApiProperty({ example: 'Café da Manhã' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Primeira refeição do dia' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '08:00' })
  @IsOptional()
  @IsString()
  time?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({ type: [MealFoodInput] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MealFoodInput)
  foods?: MealFoodInput[];
}
