import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProgressImagesService } from './progress-images.service';
import { ProgressImagesController } from './progress-images.controller';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';

@Module({
  imports: [
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        storage: diskStorage({
          destination: configService.get('UPLOAD_PATH') || './uploads',
          filename: (req, file, callback) => {
            const uniqueName = `${uuid()}${extname(file.originalname)}`;
            callback(null, uniqueName);
          },
        }),
        limits: {
          fileSize: configService.get('MAX_FILE_SIZE') || 5242880, // 5MB
        },
        fileFilter: (req, file, callback) => {
          if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
            callback(new Error('Apenas imagens são permitidas'), false);
          }
          callback(null, true);
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ProgressImagesController],
  providers: [ProgressImagesService],
  exports: [ProgressImagesService],
})
export class ProgressImagesModule {}
