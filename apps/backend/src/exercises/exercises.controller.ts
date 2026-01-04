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
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ExercisesService } from './exercises.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Exercícios')
@Controller('exercises')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo exercício' })
  @ApiResponse({ status: 201, description: 'Exercício criado' })
  create(@Request() req: any, @Body() createExerciseDto: CreateExerciseDto) {
    return this.exercisesService.create(req.user.userId, createExerciseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os exercícios' })
  @ApiQuery({ name: 'muscleGroup', required: false })
  @ApiResponse({ status: 200, description: 'Lista de exercícios' })
  findAll(@Request() req: any, @Query('muscleGroup') muscleGroup?: string) {
    return this.exercisesService.findAll(req.user.userId, muscleGroup);
  }

  @Get('muscle-groups')
  @ApiOperation({ summary: 'Listar grupos musculares' })
  @ApiResponse({ status: 200, description: 'Lista de grupos musculares' })
  getMuscleGroups(@Request() req: any) {
    return this.exercisesService.getMuscleGroups(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter um exercício específico' })
  @ApiResponse({ status: 200, description: 'Exercício encontrado' })
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.exercisesService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um exercício' })
  @ApiResponse({ status: 200, description: 'Exercício atualizado' })
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateExerciseDto: UpdateExerciseDto,
  ) {
    return this.exercisesService.update(id, req.user.userId, updateExerciseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir um exercício' })
  @ApiResponse({ status: 200, description: 'Exercício excluído' })
  remove(@Request() req: any, @Param('id') id: string) {
    return this.exercisesService.remove(id, req.user.userId);
  }
}
