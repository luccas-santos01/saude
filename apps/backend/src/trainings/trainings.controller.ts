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
import { TrainingsService } from './trainings.service';
import { CreateTrainingDto } from './dto/create-training.dto';
import { UpdateTrainingDto } from './dto/update-training.dto';
import { AddExerciseToTrainingDto } from './dto/add-exercise-to-training.dto';
import { CreateSessionDto } from './dto/create-session.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Treinos')
@Controller('trainings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TrainingsController {
  constructor(private readonly trainingsService: TrainingsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo treino' })
  @ApiResponse({ status: 201, description: 'Treino criado' })
  create(@Request() req: any, @Body() createTrainingDto: CreateTrainingDto) {
    return this.trainingsService.create(req.user.userId, createTrainingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os treinos' })
  @ApiResponse({ status: 200, description: 'Lista de treinos' })
  findAll(@Request() req: any) {
    return this.trainingsService.findAll(req.user.userId);
  }

  @Get('sessions')
  @ApiOperation({ summary: 'Listar sessões de treino' })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Lista de sessões' })
  getSessions(@Request() req: any, @Query('limit') limit?: string) {
    return this.trainingsService.getSessions(req.user.userId, limit ? parseInt(limit) : 20);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter um treino específico' })
  @ApiResponse({ status: 200, description: 'Treino encontrado' })
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.trainingsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um treino' })
  @ApiResponse({ status: 200, description: 'Treino atualizado' })
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateTrainingDto: UpdateTrainingDto,
  ) {
    return this.trainingsService.update(id, req.user.userId, updateTrainingDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir um treino' })
  @ApiResponse({ status: 200, description: 'Treino excluído' })
  remove(@Request() req: any, @Param('id') id: string) {
    return this.trainingsService.remove(id, req.user.userId);
  }

  @Post(':id/exercises')
  @ApiOperation({ summary: 'Adicionar exercício ao treino' })
  @ApiResponse({ status: 201, description: 'Exercício adicionado' })
  addExercise(
    @Request() req: any,
    @Param('id') id: string,
    @Body() addExerciseDto: AddExerciseToTrainingDto,
  ) {
    return this.trainingsService.addExercise(id, req.user.userId, addExerciseDto);
  }

  @Patch(':id/exercises/:exerciseId')
  @ApiOperation({ summary: 'Atualizar exercício do treino' })
  @ApiResponse({ status: 200, description: 'Exercício atualizado' })
  updateExercise(
    @Request() req: any,
    @Param('id') id: string,
    @Param('exerciseId') exerciseId: string,
    @Body() data: Partial<AddExerciseToTrainingDto>,
  ) {
    return this.trainingsService.updateExercise(id, exerciseId, req.user.userId, data);
  }

  @Delete(':id/exercises/:exerciseId')
  @ApiOperation({ summary: 'Remover exercício do treino' })
  @ApiResponse({ status: 200, description: 'Exercício removido' })
  removeExercise(
    @Request() req: any,
    @Param('id') id: string,
    @Param('exerciseId') exerciseId: string,
  ) {
    return this.trainingsService.removeExercise(id, exerciseId, req.user.userId);
  }

  @Post(':id/sessions')
  @ApiOperation({ summary: 'Registrar sessão de treino' })
  @ApiResponse({ status: 201, description: 'Sessão registrada' })
  createSession(
    @Request() req: any,
    @Param('id') id: string,
    @Body() createSessionDto: CreateSessionDto,
  ) {
    return this.trainingsService.createSession(id, req.user.userId, createSessionDto);
  }

  @Get('sessions/:sessionId')
  @ApiOperation({ summary: 'Obter uma sessão específica' })
  @ApiResponse({ status: 200, description: 'Sessão encontrada' })
  getSession(@Request() req: any, @Param('sessionId') sessionId: string) {
    return this.trainingsService.getSession(sessionId, req.user.userId);
  }

  @Patch('sessions/:sessionId')
  @ApiOperation({ summary: 'Atualizar sessão de treino' })
  @ApiResponse({ status: 200, description: 'Sessão atualizada' })
  updateSession(
    @Request() req: any,
    @Param('sessionId') sessionId: string,
    @Body() data: Partial<CreateSessionDto>,
  ) {
    return this.trainingsService.updateSession(sessionId, req.user.userId, data);
  }

  @Delete('sessions/:sessionId')
  @ApiOperation({ summary: 'Excluir sessão de treino' })
  @ApiResponse({ status: 200, description: 'Sessão excluída' })
  deleteSession(@Request() req: any, @Param('sessionId') sessionId: string) {
    return this.trainingsService.deleteSession(sessionId, req.user.userId);
  }
}
