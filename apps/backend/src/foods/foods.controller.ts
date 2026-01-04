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
import { FoodsService } from './foods.service';
import { CreateFoodDto } from './dto/create-food.dto';
import { UpdateFoodDto } from './dto/update-food.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Alimentos')
@Controller('foods')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FoodsController {
  constructor(private readonly foodsService: FoodsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo alimento' })
  @ApiResponse({ status: 201, description: 'Alimento criado' })
  create(@Request() req: any, @Body() createFoodDto: CreateFoodDto) {
    return this.foodsService.create(req.user.userId, createFoodDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os alimentos' })
  @ApiQuery({ name: 'search', required: false })
  @ApiResponse({ status: 200, description: 'Lista de alimentos' })
  findAll(@Request() req: any, @Query('search') search?: string) {
    return this.foodsService.findAll(req.user.userId, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter um alimento específico' })
  @ApiResponse({ status: 200, description: 'Alimento encontrado' })
  @ApiResponse({ status: 404, description: 'Alimento não encontrado' })
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.foodsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um alimento' })
  @ApiResponse({ status: 200, description: 'Alimento atualizado' })
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateFoodDto: UpdateFoodDto,
  ) {
    return this.foodsService.update(id, req.user.userId, updateFoodDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir um alimento' })
  @ApiResponse({ status: 200, description: 'Alimento excluído' })
  remove(@Request() req: any, @Param('id') id: string) {
    return this.foodsService.remove(id, req.user.userId);
  }
}
