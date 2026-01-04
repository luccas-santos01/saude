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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { ProgressImagesService } from './progress-images.service';
import { CreateProgressImageDto } from './dto/create-progress-image.dto';
import { UpdateProgressImageDto } from './dto/update-progress-image.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Imagens de Progresso')
@Controller('progress-images')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProgressImagesController {
  constructor(private readonly progressImagesService: ProgressImagesService) {}

  @Post()
  @ApiOperation({ summary: 'Upload de imagem de progresso' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Imagem enviada' })
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() createDto: CreateProgressImageDto,
  ) {
    if (!file) {
      throw new BadRequestException('Arquivo é obrigatório');
    }

    const imageUrl = `uploads/${file.filename}`;
    return this.progressImagesService.create(req.user.userId, imageUrl, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as imagens' })
  @ApiQuery({ name: 'category', required: false })
  @ApiResponse({ status: 200, description: 'Lista de imagens' })
  findAll(@Request() req: any, @Query('category') category?: string) {
    return this.progressImagesService.findAll(req.user.userId, category);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Listar categorias de imagens' })
  @ApiResponse({ status: 200, description: 'Lista de categorias' })
  getCategories(@Request() req: any) {
    return this.progressImagesService.getCategories(req.user.userId);
  }

  @Get('timeline')
  @ApiOperation({ summary: 'Obter linha do tempo de imagens' })
  @ApiResponse({ status: 200, description: 'Linha do tempo' })
  getTimeline(@Request() req: any) {
    return this.progressImagesService.getTimeline(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter uma imagem específica' })
  @ApiResponse({ status: 200, description: 'Imagem encontrada' })
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.progressImagesService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar dados de uma imagem' })
  @ApiResponse({ status: 200, description: 'Imagem atualizada' })
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateProgressImageDto,
  ) {
    return this.progressImagesService.update(id, req.user.userId, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir uma imagem' })
  @ApiResponse({ status: 200, description: 'Imagem excluída' })
  remove(@Request() req: any, @Param('id') id: string) {
    return this.progressImagesService.remove(id, req.user.userId);
  }
}
