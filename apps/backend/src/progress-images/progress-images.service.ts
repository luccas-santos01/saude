import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProgressImageDto } from './dto/create-progress-image.dto';
import { UpdateProgressImageDto } from './dto/update-progress-image.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ProgressImagesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, imageUrl: string, createDto: CreateProgressImageDto) {
    return this.prisma.progressImage.create({
      data: {
        imageUrl,
        date: createDto.date ? new Date(createDto.date) : new Date(),
        category: createDto.category,
        description: createDto.description,
        userId,
      },
    });
  }

  async findAll(userId: string, category?: string) {
    return this.prisma.progressImage.findMany({
      where: {
        userId,
        ...(category && { category }),
      },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const image = await this.prisma.progressImage.findFirst({
      where: { id, userId },
    });

    if (!image) {
      throw new NotFoundException('Imagem não encontrada');
    }

    return image;
  }

  async update(id: string, userId: string, updateDto: UpdateProgressImageDto) {
    await this.findOne(id, userId);

    return this.prisma.progressImage.update({
      where: { id },
      data: {
        ...updateDto,
        date: updateDto.date ? new Date(updateDto.date) : undefined,
      },
    });
  }

  async remove(id: string, userId: string) {
    const image = await this.findOne(id, userId);

    // Remover arquivo físico
    try {
      const filePath = path.join(process.cwd(), image.imageUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Erro ao remover arquivo:', error);
    }

    return this.prisma.progressImage.delete({ where: { id } });
  }

  async getCategories(userId: string) {
    const images = await this.prisma.progressImage.findMany({
      where: { userId },
      select: { category: true },
      distinct: ['category'],
    });

    return images
      .map((i) => i.category)
      .filter((c): c is string => c !== null);
  }

  async getTimeline(userId: string) {
    const images = await this.prisma.progressImage.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
    });

    // Agrupar por mês
    const grouped: { [key: string]: typeof images } = {};
    for (const image of images) {
      const key = `${image.date.getFullYear()}-${String(image.date.getMonth() + 1).padStart(2, '0')}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(image);
    }

    return Object.entries(grouped).map(([month, images]) => ({
      month,
      images,
    }));
  }
}
