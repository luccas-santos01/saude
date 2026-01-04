import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDietDto } from './dto/create-diet.dto';
import { UpdateDietDto } from './dto/update-diet.dto';
import { AddMealToDietDto } from './dto/add-meal-to-diet.dto';

@Injectable()
export class DietsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createDietDto: CreateDietDto) {
    const { mealIds, days, startDate, endDate, ...dietData } = createDietDto;

    // Preparar os dietMeals baseado em days ou mealIds
    let dietMealsCreate: any[] = [];

    // Converter datas para Date objects
    const parsedStartDate = startDate ? new Date(startDate) : undefined;
    const parsedEndDate = endDate ? new Date(endDate) : undefined;

    if (days && days.length > 0) {
      // Novo formato com days
      for (const day of days) {
        for (const meal of day.meals) {
          dietMealsCreate.push({
            mealId: meal.mealId,
            dayOfWeek: day.dayOfWeek,
          });
        }
      }
    } else if (mealIds && mealIds.length > 0) {
      // Formato antigo com mealIds
      dietMealsCreate = mealIds.map((mealId) => ({
        mealId,
        dayOfWeek: null,
      }));
    }

    return this.prisma.diet.create({
      data: {
        ...dietData,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        userId,
        dietMeals: dietMealsCreate.length > 0 ? {
          create: dietMealsCreate,
        } : undefined,
      },
      include: {
        dietMeals: {
          include: {
            meal: {
              include: {
                mealFoods: {
                  include: {
                    food: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async findAll(userId: string) {
    const diets = await this.prisma.diet.findMany({
      where: { userId },
      include: {
        dietMeals: {
          include: {
            meal: {
              include: {
                mealFoods: {
                  include: {
                    food: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calcular totais nutricionais para cada refeição
    return diets.map(diet => ({
      ...diet,
      dietMeals: diet.dietMeals.map(dm => {
        const meal = dm.meal;
        const totals = meal.mealFoods.reduce(
          (acc, mf) => {
            const multiplier = mf.quantity / (mf.food.servingSize || 100);
            return {
              totalCalories: acc.totalCalories + (mf.food.calories * multiplier),
              totalProteins: acc.totalProteins + (mf.food.proteins * multiplier),
              totalCarbohydrates: acc.totalCarbohydrates + (mf.food.carbohydrates * multiplier),
              totalFats: acc.totalFats + (mf.food.fats * multiplier),
            };
          },
          { totalCalories: 0, totalProteins: 0, totalCarbohydrates: 0, totalFats: 0 }
        );

        return {
          ...dm,
          meal: {
            ...meal,
            ...totals,
          },
        };
      }),
    }));
  }

  async findOne(id: string, userId: string) {
    const diet = await this.prisma.diet.findFirst({
      where: { id, userId },
      include: {
        dietMeals: {
          include: {
            meal: {
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
            },
          },
        },
        dietDays: true,
      },
    });

    if (!diet) {
      throw new NotFoundException('Dieta não encontrada');
    }

    return diet;
  }

  async update(id: string, userId: string, updateDietDto: UpdateDietDto) {
    await this.findOne(id, userId);

    const { mealIds, ...dietData } = updateDietDto;

    return this.prisma.diet.update({
      where: { id },
      data: dietData,
      include: {
        dietMeals: {
          include: {
            meal: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.diet.delete({ where: { id } });
  }

  async addMeal(dietId: string, userId: string, addMealDto: AddMealToDietDto) {
    await this.findOne(dietId, userId);

    return this.prisma.dietMeal.create({
      data: {
        dietId,
        mealId: addMealDto.mealId,
        dayOfWeek: addMealDto.dayOfWeek,
      },
      include: {
        meal: true,
      },
    });
  }

  async removeMeal(dietId: string, dietMealId: string, userId: string) {
    await this.findOne(dietId, userId);

    return this.prisma.dietMeal.delete({
      where: { id: dietMealId },
    });
  }

  // Calcular totais nutricionais de uma dieta
  async calculateNutrition(id: string, userId: string) {
    const diet = await this.findOne(id, userId);

    let totalCalories = 0;
    let totalProteins = 0;
    let totalCarbs = 0;
    let totalFats = 0;
    let totalFiber = 0;
    const micronutrients: { [key: string]: { name: string; amount: number; unit: string } } = {};

    for (const dietMeal of diet.dietMeals) {
      for (const mealFood of dietMeal.meal.mealFoods) {
        const multiplier = mealFood.quantity;
        const food = mealFood.food;

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
    }

    const targets = {
      calories: diet.targetCalories,
      proteins: diet.targetProteins,
      carbohydrates: diet.targetCarbohydrates,
      fats: diet.targetFats,
    };

    return {
      diet: {
        id: diet.id,
        name: diet.name,
        description: diet.description,
      },
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
      targets,
      difference: {
        calories: targets.calories ? Math.round((totalCalories - targets.calories) * 10) / 10 : null,
        proteins: targets.proteins ? Math.round((totalProteins - targets.proteins) * 10) / 10 : null,
        carbohydrates: targets.carbohydrates ? Math.round((totalCarbs - targets.carbohydrates) * 10) / 10 : null,
        fats: targets.fats ? Math.round((totalFats - targets.fats) * 10) / 10 : null,
      },
    };
  }
}
