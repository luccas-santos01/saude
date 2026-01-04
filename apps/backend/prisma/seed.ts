import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar usuário administrador
  const adminPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@dieta.com' },
    update: { isAdmin: true },
    create: {
      email: 'admin@dieta.com',
      password: adminPassword,
      name: 'Administrador',
      isAdmin: true,
    },
  });

  console.log(`✅ Administrador criado: ${admin.email} (senha: admin123)`);

  // Criar usuário de teste
  const hashedPassword = await bcrypt.hash('senha123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'teste@email.com' },
    update: {},
    create: {
      email: 'teste@email.com',
      password: hashedPassword,
      name: 'Usuário Teste',
    },
  });

  console.log(`✅ Usuário criado: ${user.email}`);

  // Criar micronutrientes padrão
  const micronutrients = [
    { name: 'Vitamina A', unit: 'mcg' },
    { name: 'Vitamina C', unit: 'mg' },
    { name: 'Vitamina D', unit: 'UI' },
    { name: 'Vitamina E', unit: 'mg' },
    { name: 'Vitamina K', unit: 'mcg' },
    { name: 'Vitamina B1', unit: 'mg' },
    { name: 'Vitamina B2', unit: 'mg' },
    { name: 'Vitamina B6', unit: 'mg' },
    { name: 'Vitamina B12', unit: 'mcg' },
    { name: 'Cálcio', unit: 'mg' },
    { name: 'Ferro', unit: 'mg' },
    { name: 'Magnésio', unit: 'mg' },
    { name: 'Zinco', unit: 'mg' },
    { name: 'Potássio', unit: 'mg' },
    { name: 'Selênio', unit: 'mcg' },
  ];

  for (const micro of micronutrients) {
    await prisma.micronutrient.upsert({
      where: { name_userId: { name: micro.name, userId: user.id } },
      update: {},
      create: {
        name: micro.name,
        unit: micro.unit,
        userId: user.id,
      },
    });
  }

  console.log(`✅ ${micronutrients.length} micronutrientes criados`);

  // Criar alimentos de exemplo
  const foods = [
    {
      name: 'Frango Grelhado',
      servingSize: 100,
      calories: 165,
      proteins: 31,
      carbohydrates: 0,
      fats: 3.6,
      fiber: 0,
    },
    {
      name: 'Arroz Branco Cozido',
      servingSize: 100,
      calories: 130,
      proteins: 2.7,
      carbohydrates: 28,
      fats: 0.3,
      fiber: 0.4,
    },
    {
      name: 'Feijão Carioca Cozido',
      servingSize: 100,
      calories: 76,
      proteins: 4.8,
      carbohydrates: 13.6,
      fats: 0.5,
      fiber: 8.5,
    },
    {
      name: 'Ovo Inteiro Cozido',
      servingSize: 50,
      calories: 78,
      proteins: 6.3,
      carbohydrates: 0.6,
      fats: 5.3,
      fiber: 0,
    },
    {
      name: 'Banana Prata',
      servingSize: 100,
      calories: 98,
      proteins: 1.3,
      carbohydrates: 26,
      fats: 0.1,
      fiber: 2,
    },
    {
      name: 'Batata Doce Cozida',
      servingSize: 100,
      calories: 77,
      proteins: 0.6,
      carbohydrates: 18.4,
      fats: 0.1,
      fiber: 2.2,
    },
    {
      name: 'Aveia em Flocos',
      servingSize: 30,
      calories: 117,
      proteins: 4.2,
      carbohydrates: 20,
      fats: 2.3,
      fiber: 2.8,
    },
    {
      name: 'Whey Protein',
      servingSize: 30,
      calories: 120,
      proteins: 24,
      carbohydrates: 3,
      fats: 1.5,
      fiber: 0,
    },
  ];

  for (const food of foods) {
    await prisma.food.upsert({
      where: { id: `seed-${food.name.toLowerCase().replace(/\s/g, '-')}` },
      update: {},
      create: {
        id: `seed-${food.name.toLowerCase().replace(/\s/g, '-')}`,
        ...food,
        userId: user.id,
      },
    });
  }

  console.log(`✅ ${foods.length} alimentos criados`);

  // Criar exercícios de exemplo
  const exercises = [
    { name: 'Supino Reto', muscleGroup: 'Peito', equipment: 'Barra' },
    { name: 'Supino Inclinado', muscleGroup: 'Peito', equipment: 'Halteres' },
    { name: 'Crucifixo', muscleGroup: 'Peito', equipment: 'Halteres' },
    { name: 'Tríceps Pulley', muscleGroup: 'Tríceps', equipment: 'Cabo' },
    { name: 'Tríceps Testa', muscleGroup: 'Tríceps', equipment: 'Barra' },
    { name: 'Puxada Frontal', muscleGroup: 'Costas', equipment: 'Cabo' },
    { name: 'Remada Curvada', muscleGroup: 'Costas', equipment: 'Barra' },
    { name: 'Remada Unilateral', muscleGroup: 'Costas', equipment: 'Halter' },
    { name: 'Rosca Direta', muscleGroup: 'Bíceps', equipment: 'Barra' },
    { name: 'Rosca Alternada', muscleGroup: 'Bíceps', equipment: 'Halteres' },
    { name: 'Agachamento Livre', muscleGroup: 'Pernas', equipment: 'Barra' },
    { name: 'Leg Press', muscleGroup: 'Pernas', equipment: 'Máquina' },
    { name: 'Cadeira Extensora', muscleGroup: 'Pernas', equipment: 'Máquina' },
    { name: 'Mesa Flexora', muscleGroup: 'Pernas', equipment: 'Máquina' },
    { name: 'Panturrilha em Pé', muscleGroup: 'Panturrilha', equipment: 'Máquina' },
    { name: 'Desenvolvimento', muscleGroup: 'Ombros', equipment: 'Halteres' },
    { name: 'Elevação Lateral', muscleGroup: 'Ombros', equipment: 'Halteres' },
  ];

  for (const exercise of exercises) {
    await prisma.exercise.upsert({
      where: { id: `seed-${exercise.name.toLowerCase().replace(/\s/g, '-')}` },
      update: {},
      create: {
        id: `seed-${exercise.name.toLowerCase().replace(/\s/g, '-')}`,
        ...exercise,
        userId: user.id,
      },
    });
  }

  console.log(`✅ ${exercises.length} exercícios criados`);

  console.log('🎉 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
