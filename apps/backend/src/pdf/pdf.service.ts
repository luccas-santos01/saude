import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuid } from 'uuid';
import { DietsService } from '../diets/diets.service';
import { TrainingsService } from '../trainings/trainings.service';
import { BodyMeasurementsService } from '../body-measurements/body-measurements.service';

@Injectable()
export class PdfService {
  private outputPath: string;

  constructor(
    private configService: ConfigService,
    private dietsService: DietsService,
    private trainingsService: TrainingsService,
    private bodyMeasurementsService: BodyMeasurementsService,
  ) {
    this.outputPath = this.configService.get('PDF_OUTPUT_PATH') || './generated-pdfs';
    if (!fs.existsSync(this.outputPath)) {
      fs.mkdirSync(this.outputPath, { recursive: true });
    }
  }

  private async generatePdf(html: string, filename: string): Promise<string> {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const filePath = path.join(this.outputPath, filename);
      await page.pdf({
        path: filePath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
      });

      return filePath;
    } finally {
      await browser.close();
    }
  }

  async generateDietPdf(dietId: string, userId: string): Promise<string> {
    const nutrition = await this.dietsService.calculateNutrition(dietId, userId);
    const diet = await this.dietsService.findOne(dietId, userId);

    const html = this.getDietTemplate(diet, nutrition);
    const filename = `dieta-${uuid()}.pdf`;

    return this.generatePdf(html, filename);
  }

  async generateTrainingPdf(trainingId: string, userId: string): Promise<string> {
    const training = await this.trainingsService.findOne(trainingId, userId);

    const html = this.getTrainingTemplate(training);
    const filename = `treino-${uuid()}.pdf`;

    return this.generatePdf(html, filename);
  }

  async generateProgressPdf(userId: string): Promise<string> {
    const stats = await this.bodyMeasurementsService.getStats(userId);
    const measurements = await this.bodyMeasurementsService.findAll(userId, 30);

    const html = this.getProgressTemplate(stats, measurements);
    const filename = `progresso-${uuid()}.pdf`;

    return this.generatePdf(html, filename);
  }

  private getBaseStyles(): string {
    return `
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-size: 12px;
          line-height: 1.5;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #4f46e5;
        }
        .header h1 {
          color: #4f46e5;
          font-size: 24px;
          margin-bottom: 5px;
        }
        .header p {
          color: #666;
          font-size: 14px;
        }
        .section {
          margin-bottom: 25px;
        }
        .section-title {
          font-size: 16px;
          font-weight: bold;
          color: #4f46e5;
          margin-bottom: 15px;
          padding-bottom: 5px;
          border-bottom: 1px solid #e5e7eb;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
        }
        th, td {
          padding: 10px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        th {
          background-color: #f3f4f6;
          font-weight: 600;
          color: #374151;
        }
        .card {
          background: #f9fafb;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 15px;
        }
        .card-title {
          font-weight: 600;
          margin-bottom: 10px;
          color: #1f2937;
        }
        .macros {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
        }
        .macro-item {
          text-align: center;
          padding: 15px;
          background: white;
          border-radius: 8px;
          min-width: 100px;
          margin: 5px;
        }
        .macro-value {
          font-size: 20px;
          font-weight: bold;
          color: #4f46e5;
        }
        .macro-label {
          font-size: 11px;
          color: #666;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #666;
          font-size: 10px;
        }
        .time-badge {
          display: inline-block;
          background: #e0e7ff;
          color: #4f46e5;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          margin-right: 10px;
        }
      </style>
    `;
  }

  private getDietTemplate(diet: any, nutrition: any): string {
    const mealsHtml = diet.dietMeals
      .map(
        (dm: any) => `
        <div class="card">
          <div class="card-title">
            ${dm.meal.time ? `<span class="time-badge">${dm.meal.time}</span>` : ''}
            ${dm.meal.name}
          </div>
          <table>
            <thead>
              <tr>
                <th>Alimento</th>
                <th>Porção</th>
                <th>Cal</th>
                <th>Prot</th>
                <th>Carb</th>
                <th>Gord</th>
              </tr>
            </thead>
            <tbody>
              ${dm.meal.mealFoods
                .map(
                  (mf: any) => `
                <tr>
                  <td>${mf.food.name}</td>
                  <td>${mf.quantity}x ${mf.food.servingSize}${mf.food.servingUnit}</td>
                  <td>${Math.round(mf.food.calories * mf.quantity)}</td>
                  <td>${Math.round(mf.food.proteins * mf.quantity)}g</td>
                  <td>${Math.round(mf.food.carbohydrates * mf.quantity)}g</td>
                  <td>${Math.round(mf.food.fats * mf.quantity)}g</td>
                </tr>
              `,
                )
                .join('')}
            </tbody>
          </table>
        </div>
      `,
      )
      .join('');

    const micronutrientsHtml =
      nutrition.totals.micronutrients.length > 0
        ? `
      <div class="section">
        <h2 class="section-title">Micronutrientes</h2>
        <table>
          <thead>
            <tr>
              <th>Nutriente</th>
              <th>Quantidade</th>
            </tr>
          </thead>
          <tbody>
            ${nutrition.totals.micronutrients
              .map(
                (m: any) => `
              <tr>
                <td>${m.name}</td>
                <td>${m.amount} ${m.unit}</td>
              </tr>
            `,
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `
        : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        ${this.getBaseStyles()}
      </head>
      <body>
        <div class="header">
          <h1>${diet.name}</h1>
          <p>${diet.description || 'Dieta personalizada'}</p>
        </div>

        <div class="section">
          <h2 class="section-title">Resumo Nutricional Diário</h2>
          <div class="macros">
            <div class="macro-item">
              <div class="macro-value">${nutrition.totals.calories}</div>
              <div class="macro-label">Calorias</div>
            </div>
            <div class="macro-item">
              <div class="macro-value">${nutrition.totals.proteins}g</div>
              <div class="macro-label">Proteínas</div>
            </div>
            <div class="macro-item">
              <div class="macro-value">${nutrition.totals.carbohydrates}g</div>
              <div class="macro-label">Carboidratos</div>
            </div>
            <div class="macro-item">
              <div class="macro-value">${nutrition.totals.fats}g</div>
              <div class="macro-label">Gorduras</div>
            </div>
            <div class="macro-item">
              <div class="macro-value">${nutrition.totals.fiber}g</div>
              <div class="macro-label">Fibras</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">Refeições</h2>
          ${mealsHtml}
        </div>

        ${micronutrientsHtml}

        <div class="footer">
          <p>Gerado em ${new Date().toLocaleDateString('pt-BR')} • Sistema de Dietas e Treinos</p>
        </div>
      </body>
      </html>
    `;
  }

  private getTrainingTemplate(training: any): string {
    const exercisesHtml = training.trainingExercises
      .map(
        (te: any, index: number) => `
        <tr>
          <td>${index + 1}</td>
          <td>
            <strong>${te.exercise.name}</strong>
            ${te.exercise.muscleGroup ? `<br><small style="color: #666">${te.exercise.muscleGroup}</small>` : ''}
          </td>
          <td>${te.sets}</td>
          <td>${te.reps}</td>
          <td>${te.weight ? `${te.weight}kg` : '-'}</td>
          <td>${te.restSeconds ? `${te.restSeconds}s` : '-'}</td>
          <td>${te.notes || '-'}</td>
        </tr>
      `,
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        ${this.getBaseStyles()}
      </head>
      <body>
        <div class="header">
          <h1>${training.name}</h1>
          <p>${training.description || 'Ficha de treino personalizada'}</p>
          ${training.duration ? `<p>Duração estimada: ${training.duration} minutos</p>` : ''}
        </div>

        <div class="section">
          <h2 class="section-title">Exercícios</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Exercício</th>
                <th>Séries</th>
                <th>Reps</th>
                <th>Carga</th>
                <th>Descanso</th>
                <th>Obs</th>
              </tr>
            </thead>
            <tbody>
              ${exercisesHtml}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2 class="section-title">Anotações do Treino</h2>
          <div class="card">
            <table style="border: none;">
              <tr><td style="border: none; padding: 20px;">Data: ___/___/______</td></tr>
              <tr><td style="border: none; padding: 20px;">Duração real: _______ minutos</td></tr>
              <tr><td style="border: none; padding: 20px;">Observações: _________________________________</td></tr>
            </table>
          </div>
        </div>

        <div class="footer">
          <p>Gerado em ${new Date().toLocaleDateString('pt-BR')} • Sistema de Dietas e Treinos</p>
        </div>
      </body>
      </html>
    `;
  }

  private getProgressTemplate(stats: any, measurements: any[]): string {
    const measurementsHtml = measurements
      .slice(0, 10)
      .map(
        (m: any) => `
        <tr>
          <td>${new Date(m.date).toLocaleDateString('pt-BR')}</td>
          <td>${m.weight ? `${m.weight}kg` : '-'}</td>
          <td>${m.bodyFat ? `${m.bodyFat}%` : '-'}</td>
          <td>${m.muscleMass ? `${m.muscleMass}kg` : '-'}</td>
          <td>${m.chest ? `${m.chest}cm` : '-'}</td>
          <td>${m.waist ? `${m.waist}cm` : '-'}</td>
          <td>${m.rightArm ? `${m.rightArm}cm` : '-'}</td>
        </tr>
      `,
      )
      .join('');

    const changesHtml = stats
      ? `
      <div class="section">
        <h2 class="section-title">Evolução no Período (${stats.periodDays} dias)</h2>
        <div class="macros">
          ${
            stats.changes.weight !== null
              ? `
            <div class="macro-item">
              <div class="macro-value" style="color: ${stats.changes.weight < 0 ? '#16a34a' : '#dc2626'}">
                ${stats.changes.weight > 0 ? '+' : ''}${stats.changes.weight.toFixed(1)}kg
              </div>
              <div class="macro-label">Peso</div>
            </div>
          `
              : ''
          }
          ${
            stats.changes.bodyFat !== null
              ? `
            <div class="macro-item">
              <div class="macro-value" style="color: ${stats.changes.bodyFat < 0 ? '#16a34a' : '#dc2626'}">
                ${stats.changes.bodyFat > 0 ? '+' : ''}${stats.changes.bodyFat.toFixed(1)}%
              </div>
              <div class="macro-label">Gordura</div>
            </div>
          `
              : ''
          }
          ${
            stats.changes.muscleMass !== null
              ? `
            <div class="macro-item">
              <div class="macro-value" style="color: ${stats.changes.muscleMass > 0 ? '#16a34a' : '#dc2626'}">
                ${stats.changes.muscleMass > 0 ? '+' : ''}${stats.changes.muscleMass.toFixed(1)}kg
              </div>
              <div class="macro-label">Massa Muscular</div>
            </div>
          `
              : ''
          }
        </div>
      </div>
    `
      : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        ${this.getBaseStyles()}
      </head>
      <body>
        <div class="header">
          <h1>Relatório de Progresso</h1>
          <p>Acompanhamento de medidas corporais</p>
        </div>

        ${changesHtml}

        <div class="section">
          <h2 class="section-title">Histórico de Medidas</h2>
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Peso</th>
                <th>%Gord</th>
                <th>M.Musc</th>
                <th>Peito</th>
                <th>Cintura</th>
                <th>Braço</th>
              </tr>
            </thead>
            <tbody>
              ${measurementsHtml}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p>Gerado em ${new Date().toLocaleDateString('pt-BR')} • Sistema de Dietas e Treinos</p>
        </div>
      </body>
      </html>
    `;
  }
}
