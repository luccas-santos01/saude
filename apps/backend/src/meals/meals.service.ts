import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMealDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';
import { AddFoodToMealDto } from './dto/add-food-to-meal.dto';

@Injectable()
export class MealsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createMealDto: CreateMealDto) {
    const { foods, ...mealData } = createMealDto;
    
    return this.prisma.meal.create({
      data: {
        ...mealData,
        userId,
        mealFoods: foods && foods.length > 0 ? {
          create: foods.map(f => ({
            foodId: f.foodId,
            quantity: f.quantity,
          })),
        } : undefined,
      },
      include: {
        mealFoods: {
          include: {
            food: true,
          },
        },
      },
    });
  }

  async findAll(userId: string) {
    const meals = await this.prisma.meal.findMany({
      where: { userId },
      include: {
        mealFoods: {
          include: {
            food: {
              include: {
                foodMicronutrients: {
                  include: {
                    micronutrient: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { order: 'asc' },
    });

    // Calcular totais nutricionais para cada refeição
    return meals.map(meal => {
      let totalCalories = 0;
      let totalProteins = 0;
      let totalCarbohydrates = 0;
      let totalFats = 0;

      for (const mealFood of meal.mealFoods) {
        const food = mealFood.food;
        // A quantidade é em gramas, os valores nutricionais são por 100g (servingSize)
        const multiplier = mealFood.quantity / (food.servingSize || 100);
        
        totalCalories += food.calories * multiplier;
        totalProteins += food.proteins * multiplier;
        totalCarbohydrates += food.carbohydrates * multiplier;
        totalFats += food.fats * multiplier;
      }

      return {
        ...meal,
        totalCalories: Math.round(totalCalories * 10) / 10,
        totalProteins: Math.round(totalProteins * 10) / 10,
        totalCarbohydrates: Math.round(totalCarbohydrates * 10) / 10,
        totalFats: Math.round(totalFats * 10) / 10,
      };
    });
  }

  async findOne(id: string, userId: string) {
    const meal = await this.prisma.meal.findFirst({
      where: { id, userId },
      include: {
        mealFoods: {
          include: {
            food: {
              include: {
                foodMicronutrients: {
                  include: {
                    micronutrient: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!meal) {
      throw new NotFoundException('Refeição não encontrada');
    }

    return meal;
  }

  async update(id: string, userId: string, updateMealDto: UpdateMealDto) {
    await this.findOne(id, userId);

    return this.prisma.meal.update({
      where: { id },
      data: updateMealDto,
      include: {
        mealFoods: {
          include: {
            food: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.meal.delete({ where: { id } });
  }

  async addFood(mealId: string, userId: string, addFoodDto: AddFoodToMealDto) {
    await this.findOne(mealId, userId);

    return this.prisma.mealFood.create({
      data: {
        mealId,
        foodId: addFoodDto.foodId,
        quantity: addFoodDto.quantity,
        notes: addFoodDto.notes,
      },
      include: {
        food: true,
      },
    });
  }

  async removeFood(mealId: string, mealFoodId: string, userId: string) {
    await this.findOne(mealId, userId);

    return this.prisma.mealFood.delete({
      where: { id: mealFoodId },
    });
  }

  async updateFood(mealId: string, mealFoodId: string, userId: string, quantity: number, notes?: string) {
    await this.findOne(mealId, userId);

    return this.prisma.mealFood.update({
      where: { id: mealFoodId },
      data: { quantity, notes },
      include: {
        food: true,
      },
    });
  }

  // Calcular totais nutricionais de uma refeição
  async calculateNutrition(id: string, userId: string) {
    const meal = await this.findOne(id, userId);

    let totalCalories = 0;
    let totalProteins = 0;
    let totalCarbs = 0;
    let totalFats = 0;
    let totalFiber = 0;
    const micronutrients: { [key: string]: { name: string; amount: number; unit: string } } = {};

    for (const mealFood of meal.mealFoods) {
      const food = mealFood.food;
      // A quantidade é em gramas, os valores nutricionais são por servingSize (geralmente 100g)
      const multiplier = mealFood.quantity / (food.servingSize || 100);

      totalCalories += food.calories * multiplier;
      totalProteins += food.proteins * multiplier;
      totalCarbs += food.carbohydrates * multiplier;
      totalFats += food.fats * multiplier;
      totalFiber += (food.fiber || 0) * multiplier;

      // Micronutrientes
      for (const fm of food.foodMicronutrients) {
        const key = fm.micronutrient.name;
        if (!micronutrients[key]) {
          micronutrients[key] = {
            name: fm.micronutrient.name,
            amount: 0,
            unit: fm.micronutrient.unit,
          };
        }
        micronutrients[key].amount += fm.amount * multiplier;
      }
    }

    return {
      meal,
      totals: {
        calories: Math.round(totalCalories * 10) / 10,
        proteins: Math.round(totalProteins * 10) / 10,
        carbohydrates: Math.round(totalCarbs * 10) / 10,
        fats: Math.round(totalFats * 10) / 10,
        fiber: Math.round(totalFiber * 10) / 10,
        micronutrients: Object.values(micronutrients).map((m) => ({
          ...m,
          amount: Math.round(m.amount * 10) / 10,
        })),
      },
    };
  }
}
