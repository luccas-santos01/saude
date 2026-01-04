import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class FoodMicronutrientDto {
  @ApiProperty()
  @IsString()
  micronutrientId: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  amount: number;
}

export class CreateFoodDto {
  @ApiProperty({ example: 'Frango Grelhado' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Sadia' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  servingSize: number;

  @ApiPropertyOptional({ example: 'g', default: 'g' })
  @IsOptional()
  @IsString()
  servingUnit?: string;

  @ApiProperty({ example: 165 })
  @IsNumber()
  @Min(0)
  calories: number;

  @ApiProperty({ example: 31 })
  @IsNumber()
  @Min(0)
  proteins: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @Min(0)
  carbohydrates: number;

  @ApiProperty({ example: 3.6 })
  @IsNumber()
  @Min(0)
  fats: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fiber?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sodium?: number;

  @ApiPropertyOptional({ type: [FoodMicronutrientDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FoodMicronutrientDto)
  micronutrients?: FoodMicronutrientDto[];
}
