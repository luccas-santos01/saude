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
import { BodyMeasurementsService } from './body-measurements.service';
import { CreateBodyMeasurementDto } from './dto/create-body-measurement.dto';
import { UpdateBodyMeasurementDto } from './dto/update-body-measurement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Medidas Corporais')
@Controller('body-measurements')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BodyMeasurementsController {
  constructor(private readonly bodyMeasurementsService: BodyMeasurementsService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar nova medida corporal' })
  @ApiResponse({ status: 201, description: 'Medida registrada' })
  create(@Request() req: any, @Body() createDto: CreateBodyMeasurementDto) {
    return this.bodyMeasurementsService.create(req.user.userId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as medidas' })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Lista de medidas' })
  findAll(@Request() req: any, @Query('limit') limit?: string) {
    return this.bodyMeasurementsService.findAll(req.user.userId, limit ? parseInt(limit) : undefined);
  }

  @Get('latest')
  @ApiOperation({ summary: 'Obter última medida registrada' })
  @ApiResponse({ status: 200, description: 'Última medida' })
  getLatest(@Request() req: any) {
    return this.bodyMeasurementsService.getLatest(req.user.userId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obter estatísticas de evolução' })
  @ApiResponse({ status: 200, description: 'Estatísticas' })
  getStats(@Request() req: any) {
    return this.bodyMeasurementsService.getStats(req.user.userId);
  }

  @Get('progress/:field')
  @ApiOperation({ summary: 'Obter progresso de uma medida específica' })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Dados de progresso' })
  getProgress(
    @Request() req: any,
    @Param('field') field: string,
    @Query('limit') limit?: string,
  ) {
    return this.bodyMeasurementsService.getProgress(
      req.user.userId,
      field,
      limit ? parseInt(limit) : 30,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter uma medida específica' })
  @ApiResponse({ status: 200, description: 'Medida encontrada' })
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.bodyMeasurementsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma medida' })
  @ApiResponse({ status: 200, description: 'Medida atualizada' })
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateBodyMeasurementDto,
  ) {
    return this.bodyMeasurementsService.update(id, req.user.userId, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir uma medida' })
  @ApiResponse({ status: 200, description: 'Medida excluída' })
  remove(@Request() req: any, @Param('id') id: string) {
    return this.bodyMeasurementsService.remove(id, req.user.userId);
  }
}
