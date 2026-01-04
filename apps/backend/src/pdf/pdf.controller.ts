import { Controller, Get, Param, Res, UseGuards, Request } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { PdfService } from './pdf.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import * as fs from 'fs';

@ApiTags('PDF')
@Controller('pdf')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Get('diet/:id')
  @ApiOperation({ summary: 'Gerar PDF de uma dieta' })
  @ApiResponse({ status: 200, description: 'PDF gerado' })
  async generateDietPdf(
    @Request() req: any,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const filePath = await this.pdfService.generateDietPdf(id, req.user.userId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="dieta.pdf"`);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    // Limpar arquivo após envio
    fileStream.on('end', () => {
      fs.unlink(filePath, () => {});
    });
  }

  @Get('training/:id')
  @ApiOperation({ summary: 'Gerar PDF de um treino' })
  @ApiResponse({ status: 200, description: 'PDF gerado' })
  async generateTrainingPdf(
    @Request() req: any,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const filePath = await this.pdfService.generateTrainingPdf(id, req.user.userId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="treino.pdf"`);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on('end', () => {
      fs.unlink(filePath, () => {});
    });
  }

  @Get('progress')
  @ApiOperation({ summary: 'Gerar PDF de progresso' })
  @ApiResponse({ status: 200, description: 'PDF gerado' })
  async generateProgressPdf(@Request() req: any, @Res() res: Response) {
    const filePath = await this.pdfService.generateProgressPdf(req.user.userId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="progresso.pdf"`);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on('end', () => {
      fs.unlink(filePath, () => {});
    });
  }
}
