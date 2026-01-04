import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMicronutrientDto } from './dto/create-micronutrient.dto';
import { UpdateMicronutrientDto } from './dto/update-micronutrient.dto';

@Injectable()
export class MicronutrientsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createMicronutrientDto: CreateMicronutrientDto) {
    const existing = await this.prisma.micronutrient.findUnique({
      where: {
        name_userId: {
          name: createMicronutrientDto.name,
          userId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Micronutriente já existe');
    }

    return this.prisma.micronutrient.create({
      data: {
        ...createMicronutrientDto,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.micronutrient.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, userId: string) {
    const micronutrient = await this.prisma.micronutrient.findFirst({
      where: { id, userId },
    });

    if (!micronutrient) {
      throw new NotFoundException('Micronutriente não encontrado');
    }

    return micronutrient;
  }

  async update(id: string, userId: string, updateMicronutrientDto: UpdateMicronutrientDto) {
    await this.findOne(id, userId);

    return this.prisma.micronutrient.update({
      where: { id },
      data: updateMicronutrientDto,
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.micronutrient.delete({ where: { id } });
  }
}
