import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTrainingDto } from './dto/create-training.dto';
import { UpdateTrainingDto } from './dto/update-training.dto';
import { AddExerciseToTrainingDto } from './dto/add-exercise-to-training.dto';
import { CreateSessionDto } from './dto/create-session.dto';

@Injectable()
export class TrainingsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createTrainingDto: CreateTrainingDto) {
    const { exercises, ...trainingData } = createTrainingDto;

    return this.prisma.training.create({
      data: {
        ...trainingData,
        userId,
        trainingExercises: exercises
          ? {
              create: exercises.map((e, index) => ({
                exerciseId: e.exerciseId,
                sets: e.sets,
                reps: e.reps,
                restSeconds: e.restSeconds,
                weight: e.weight,
                notes: e.notes,
                order: index,
              })),
            }
          : undefined,
      },
      include: {
        trainingExercises: {
          include: {
            exercise: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.training.findMany({
      where: { userId },
      include: {
        trainingExercises: {
          include: {
            exercise: true,
          },
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { trainingSessions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const training = await this.prisma.training.findFirst({
      where: { id, userId },
      include: {
        trainingExercises: {
          include: {
            exercise: true,
          },
          orderBy: { order: 'asc' },
        },
        trainingSessions: {
          orderBy: { date: 'desc' },
          take: 10,
          include: {
            sessionExercises: true,
          },
        },
      },
    });

    if (!training) {
      throw new NotFoundException('Treino não encontrado');
    }

    return training;
  }

  async update(id: string, userId: string, updateTrainingDto: UpdateTrainingDto) {
    await this.findOne(id, userId);

    const { exercises, ...trainingData } = updateTrainingDto;

    return this.prisma.training.update({
      where: { id },
      data: trainingData,
      include: {
        trainingExercises: {
          include: {
            exercise: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.training.delete({ where: { id } });
  }

  async addExercise(trainingId: string, userId: string, addExerciseDto: AddExerciseToTrainingDto) {
    await this.findOne(trainingId, userId);

    // Obter a última ordem
    const lastExercise = await this.prisma.trainingExercise.findFirst({
      where: { trainingId },
      orderBy: { order: 'desc' },
    });

    return this.prisma.trainingExercise.create({
      data: {
        trainingId,
        exerciseId: addExerciseDto.exerciseId,
        sets: addExerciseDto.sets,
        reps: addExerciseDto.reps,
        restSeconds: addExerciseDto.restSeconds,
        weight: addExerciseDto.weight,
        notes: addExerciseDto.notes,
        order: (lastExercise?.order ?? -1) + 1,
      },
      include: {
        exercise: true,
      },
    });
  }

  async removeExercise(trainingId: string, trainingExerciseId: string, userId: string) {
    await this.findOne(trainingId, userId);

    return this.prisma.trainingExercise.delete({
      where: { id: trainingExerciseId },
    });
  }

  async updateExercise(
    trainingId: string,
    trainingExerciseId: string,
    userId: string,
    data: Partial<AddExerciseToTrainingDto>,
  ) {
    await this.findOne(trainingId, userId);

    return this.prisma.trainingExercise.update({
      where: { id: trainingExerciseId },
      data,
      include: {
        exercise: true,
      },
    });
  }

  // Sessões de treino
  async createSession(trainingId: string, userId: string, createSessionDto: CreateSessionDto) {
    const training = await this.findOne(trainingId, userId);

    return this.prisma.trainingSession.create({
      data: {
        trainingId,
        userId,
        date: createSessionDto.date ? new Date(createSessionDto.date) : new Date(),
        duration: createSessionDto.duration,
        notes: createSessionDto.notes,
        completed: createSessionDto.completed ?? false,
        sessionExercises: {
          create: createSessionDto.exercises?.map((e) => ({
            exerciseName: e.exerciseName,
            sets: e.sets,
            reps: e.reps,
            weight: e.weight,
            notes: e.notes,
            completed: e.completed ?? false,
          })) ?? training.trainingExercises.map((te) => ({
            exerciseName: te.exercise.name,
            sets: te.sets,
            reps: te.reps,
            weight: te.weight,
            completed: false,
          })),
        },
      },
      include: {
        sessionExercises: true,
        training: true,
      },
    });
  }

  async getSessions(userId: string, limit = 20) {
    return this.prisma.trainingSession.findMany({
      where: { userId },
      include: {
        training: true,
        sessionExercises: true,
      },
      orderBy: { date: 'desc' },
      take: limit,
    });
  }

  async getSession(sessionId: string, userId: string) {
    const session = await this.prisma.trainingSession.findFirst({
      where: { id: sessionId, userId },
      include: {
        training: true,
        sessionExercises: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Sessão não encontrada');
    }

    return session;
  }

  async updateSession(sessionId: string, userId: string, data: Partial<CreateSessionDto>) {
    await this.getSession(sessionId, userId);

    return this.prisma.trainingSession.update({
      where: { id: sessionId },
      data: {
        duration: data.duration,
        notes: data.notes,
        completed: data.completed,
      },
      include: {
        sessionExercises: true,
      },
    });
  }

  async deleteSession(sessionId: string, userId: string) {
    await this.getSession(sessionId, userId);
    return this.prisma.trainingSession.delete({ where: { id: sessionId } });
  }
}
