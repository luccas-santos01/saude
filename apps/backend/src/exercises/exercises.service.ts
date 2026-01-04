import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';

@Injectable()
export class ExercisesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createExerciseDto: CreateExerciseDto) {
    return this.prisma.exercise.create({
      data: {
        ...createExerciseDto,
        userId,
      },
    });
  }

  async findAll(userId: string, muscleGroup?: string) {
    return this.prisma.exercise.findMany({
      where: {
        userId,
        ...(muscleGroup && { muscleGroup }),
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, userId: string) {
    const exercise = await this.prisma.exercise.findFirst({
      where: { id, userId },
    });

    if (!exercise) {
      throw new NotFoundException('Exercício não encontrado');
    }

    return exercise;
  }

  async update(id: string, userId: string, updateExerciseDto: UpdateExerciseDto) {
    await this.findOne(id, userId);

    return this.prisma.exercise.update({
      where: { id },
      data: updateExerciseDto,
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.exercise.delete({ where: { id } });
  }

  async getMuscleGroups(userId: string) {
    const exercises = await this.prisma.exercise.findMany({
      where: { userId },
      select: { muscleGroup: true },
      distinct: ['muscleGroup'],
    });

    return exercises
      .map((e) => e.muscleGroup)
      .filter((g): g is string => g !== null);
  }
}
