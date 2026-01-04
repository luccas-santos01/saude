import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { MealsService } from './meals.service';
import { CreateMealDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';
import { AddFoodToMealDto } from './dto/add-food-to-meal.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Refeições')
@Controller('meals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MealsController {
  constructor(private readonly mealsService: MealsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova refeição' })
  @ApiResponse({ status: 201, description: 'Refeição criada' })
  create(@Request() req: any, @Body() createMealDto: CreateMealDto) {
    return this.mealsService.create(req.user.userId, createMealDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as refeições' })
  @ApiResponse({ status: 200, description: 'Lista de refeições' })
  findAll(@Request() req: any) {
    return this.mealsService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter uma refeição específica' })
  @ApiResponse({ status: 200, description: 'Refeição encontrada' })
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.mealsService.findOne(id, req.user.userId);
  }

  @Get(':id/nutrition')
  @ApiOperation({ summary: 'Calcular totais nutricionais de uma refeição' })
  @ApiResponse({ status: 200, description: 'Totais nutricionais' })
  calculateNutrition(@Request() req: any, @Param('id') id: string) {
    return this.mealsService.calculateNutrition(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma refeição' })
  @ApiResponse({ status: 200, description: 'Refeição atualizada' })
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateMealDto: UpdateMealDto,
  ) {
    return this.mealsService.update(id, req.user.userId, updateMealDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir uma refeição' })
  @ApiResponse({ status: 200, description: 'Refeição excluída' })
  remove(@Request() req: any, @Param('id') id: string) {
    return this.mealsService.remove(id, req.user.userId);
  }

  @Post(':id/foods')
  @ApiOperation({ summary: 'Adicionar alimento a uma refeição' })
  @ApiResponse({ status: 201, description: 'Alimento adicionado' })
  addFood(
    @Request() req: any,
    @Param('id') id: string,
    @Body() addFoodDto: AddFoodToMealDto,
  ) {
    return this.mealsService.addFood(id, req.user.userId, addFoodDto);
  }

  @Delete(':id/foods/:mealFoodId')
  @ApiOperation({ summary: 'Remover alimento de uma refeição' })
  @ApiResponse({ status: 200, description: 'Alimento removido' })
  removeFood(
    @Request() req: any,
    @Param('id') id: string,
    @Param('mealFoodId') mealFoodId: string,
  ) {
    return this.mealsService.removeFood(id, mealFoodId, req.user.userId);
  }
}
