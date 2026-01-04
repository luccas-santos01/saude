import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFoodDto } from './dto/create-food.dto';
import { UpdateFoodDto } from './dto/update-food.dto';

@Injectable()
export class FoodsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createFoodDto: CreateFoodDto) {
    const { micronutrients, ...foodData } = createFoodDto;

    return this.prisma.food.create({
      data: {
        ...foodData,
        userId,
        foodMicronutrients: micronutrients
          ? {
              create: micronutrients.map((m) => ({
                amount: m.amount,
                micronutrientId: m.micronutrientId,
              })),
            }
          : undefined,
      },
      include: {
        foodMicronutrients: {
          include: {
            micronutrient: true,
          },
        },
      },
    });
  }

  async findAll(userId: string, search?: string) {
    return this.prisma.food.findMany({
      where: {
        userId,
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { brand: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        foodMicronutrients: {
          include: {
            micronutrient: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, userId: string) {
    const food = await this.prisma.food.findFirst({
      where: { id, userId },
      include: {
        foodMicronutrients: {
          include: {
            micronutrient: true,
          },
        },
      },
    });

    if (!food) {
      throw new NotFoundException('Alimento não encontrado');
    }

    return food;
  }

  async update(id: string, userId: string, updateFoodDto: UpdateFoodDto) {
    await this.findOne(id, userId);

    const { micronutrients, ...foodData } = updateFoodDto;

    // Atualizar micronutrientes se fornecidos
    if (micronutrients) {
      // Remover todos os micronutrientes existentes
      await this.prisma.foodMicronutrient.deleteMany({
        where: { foodId: id },
      });

      // Criar novos micronutrientes
      await this.prisma.foodMicronutrient.createMany({
        data: micronutrients.map((m) => ({
          foodId: id,
          amount: m.amount,
          micronutrientId: m.micronutrientId,
        })),
      });
    }

    return this.prisma.food.update({
      where: { id },
      data: foodData,
      include: {
        foodMicronutrients: {
          include: {
            micronutrient: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.food.delete({ where: { id } });
  }
}
