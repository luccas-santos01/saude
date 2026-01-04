import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBodyMeasurementDto } from './dto/create-body-measurement.dto';
import { UpdateBodyMeasurementDto } from './dto/update-body-measurement.dto';

@Injectable()
export class BodyMeasurementsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createDto: CreateBodyMeasurementDto) {
    return this.prisma.bodyMeasurement.create({
      data: {
        ...createDto,
        date: createDto.date ? new Date(createDto.date) : new Date(),
        userId,
      },
    });
  }

  async findAll(userId: string, limit?: number) {
    return this.prisma.bodyMeasurement.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: limit,
    });
  }

  async findOne(id: string, userId: string) {
    const measurement = await this.prisma.bodyMeasurement.findFirst({
      where: { id, userId },
    });

    if (!measurement) {
      throw new NotFoundException('Medida não encontrada');
    }

    return measurement;
  }

  async update(id: string, userId: string, updateDto: UpdateBodyMeasurementDto) {
    await this.findOne(id, userId);

    return this.prisma.bodyMeasurement.update({
      where: { id },
      data: {
        ...updateDto,
        date: updateDto.date ? new Date(updateDto.date) : undefined,
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.bodyMeasurement.delete({ where: { id } });
  }

  async getLatest(userId: string) {
    return this.prisma.bodyMeasurement.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
    });
  }

  async getProgress(userId: string, field: string, limit = 30) {
    const measurements = await this.prisma.bodyMeasurement.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
      take: limit,
      select: {
        date: true,
        [field]: true,
      },
    });

    return measurements.map((m) => ({
      date: m.date,
      value: (m as any)[field],
    }));
  }

  async getStats(userId: string) {
    const latest = await this.getLatest(userId);
    const oldest = await this.prisma.bodyMeasurement.findFirst({
      where: { userId },
      orderBy: { date: 'asc' },
    });

    if (!latest || !oldest) {
      return null;
    }

    return {
      latest,
      oldest,
      changes: {
        weight: latest.weight && oldest.weight ? latest.weight - oldest.weight : null,
        bodyFat: latest.bodyFat && oldest.bodyFat ? latest.bodyFat - oldest.bodyFat : null,
        muscleMass: latest.muscleMass && oldest.muscleMass ? latest.muscleMass - oldest.muscleMass : null,
      },
      periodDays: Math.floor(
        (latest.date.getTime() - oldest.date.getTime()) / (1000 * 60 * 60 * 24),
      ),
    };
  }
}
