import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddMealToDietDto {
  @ApiProperty({ example: 'meal-uuid-here' })
  @IsString()
  mealId: string;

  @ApiPropertyOptional({ example: 1, description: '0-6 (Domingo-Sábado), null = todos os dias' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek?: number;
}
