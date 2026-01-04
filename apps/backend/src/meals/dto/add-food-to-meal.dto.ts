import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddFoodToMealDto {
  @ApiProperty({ example: 'food-uuid-here' })
  @IsString()
  foodId: string;

  @ApiProperty({ example: 1.5, description: 'Quantidade em porções' })
  @IsNumber()
  @Min(0.1)
  quantity: number;

  @ApiPropertyOptional({ example: 'Sem tempero' })
  @IsOptional()
  @IsString()
  notes?: string;
}
