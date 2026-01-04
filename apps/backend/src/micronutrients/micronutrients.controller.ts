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
import { MicronutrientsService } from './micronutrients.service';
import { CreateMicronutrientDto } from './dto/create-micronutrient.dto';
import { UpdateMicronutrientDto } from './dto/update-micronutrient.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Micronutrientes')
@Controller('micronutrients')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MicronutrientsController {
  constructor(private readonly micronutrientsService: MicronutrientsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo micronutriente' })
  @ApiResponse({ status: 201, description: 'Micronutriente criado' })
  create(@Request() req: any, @Body() createMicronutrientDto: CreateMicronutrientDto) {
    return this.micronutrientsService.create(req.user.userId, createMicronutrientDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os micronutrientes' })
  @ApiResponse({ status: 200, description: 'Lista de micronutrientes' })
  findAll(@Request() req: any) {
    return this.micronutrientsService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter um micronutriente específico' })
  @ApiResponse({ status: 200, description: 'Micronutriente encontrado' })
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.micronutrientsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um micronutriente' })
  @ApiResponse({ status: 200, description: 'Micronutriente atualizado' })
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateMicronutrientDto: UpdateMicronutrientDto,
  ) {
    return this.micronutrientsService.update(id, req.user.userId, updateMicronutrientDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir um micronutriente' })
  @ApiResponse({ status: 200, description: 'Micronutriente excluído' })
  remove(@Request() req: any, @Param('id') id: string) {
    return this.micronutrientsService.remove(id, req.user.userId);
  }
}
