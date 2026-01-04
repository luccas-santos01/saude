import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FoodsModule } from './foods/foods.module';
import { MealsModule } from './meals/meals.module';
import { DietsModule } from './diets/diets.module';
import { MicronutrientsModule } from './micronutrients/micronutrients.module';
import { ExercisesModule } from './exercises/exercises.module';
import { TrainingsModule } from './trainings/trainings.module';
import { BodyMeasurementsModule } from './body-measurements/body-measurements.module';
import { ProgressImagesModule } from './progress-images/progress-images.module';
import { PdfModule } from './pdf/pdf.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    FoodsModule,
    MealsModule,
    DietsModule,
    MicronutrientsModule,
    ExercisesModule,
    TrainingsModule,
    BodyMeasurementsModule,
    ProgressImagesModule,
    PdfModule,
  ],
})
export class AppModule {}
