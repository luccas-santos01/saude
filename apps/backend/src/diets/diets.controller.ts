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
import { DietsService } from './diets.service';
import { CreateDietDto } from './dto/create-diet.dto';
import { UpdateDietDto } from './dto/update-diet.dto';
import { AddMealToDietDto } from './dto/add-meal-to-diet.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Dietas')
@Controller('diets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DietsController {
  constructor(private readonly dietsService: DietsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova dieta' })
  @ApiResponse({ status: 201, description: 'Dieta criada' })
  create(@Request() req: any, @Body() createDietDto: CreateDietDto) {
    return this.dietsService.create(req.user.userId, createDietDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as dietas' })
  @ApiResponse({ status: 200, description: 'Lista de dietas' })
  findAll(@Request() req: any) {
    return this.dietsService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter uma dieta específica' })
  @ApiResponse({ status: 200, description: 'Dieta encontrada' })
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.dietsService.findOne(id, req.user.userId);
  }

  @Get(':id/nutrition')
  @ApiOperation({ summary: 'Calcular totais nutricionais de uma dieta' })
  @ApiResponse({ status: 200, description: 'Totais nutricionais' })
  calculateNutrition(@Request() req: any, @Param('id') id: string) {
    return this.dietsService.calculateNutrition(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma dieta' })
  @ApiResponse({ status: 200, description: 'Dieta atualizada' })
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateDietDto: UpdateDietDto,
  ) {
    return this.dietsService.update(id, req.user.userId, updateDietDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir uma dieta' })
  @ApiResponse({ status: 200, description: 'Dieta excluída' })
  remove(@Request() req: any, @Param('id') id: string) {
    return this.dietsService.remove(id, req.user.userId);
  }

  @Post(':id/meals')
  @ApiOperation({ summary: 'Adicionar refeição a uma dieta' })
  @ApiResponse({ status: 201, description: 'Refeição adicionada' })
  addMeal(
    @Request() req: any,
    @Param('id') id: string,
    @Body() addMealDto: AddMealToDietDto,
  ) {
    return this.dietsService.addMeal(id, req.user.userId, addMealDto);
  }

  @Delete(':id/meals/:dietMealId')
  @ApiOperation({ summary: 'Remover refeição de uma dieta' })
  @ApiResponse({ status: 200, description: 'Refeição removida' })
  removeMeal(
    @Request() req: any,
    @Param('id') id: string,
    @Param('dietMealId') dietMealId: string,
  ) {
    return this.dietsService.removeMeal(id, dietMealId, req.user.userId);
  }
}
