/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Fixing week 8 and 9 structure...\n');

  // Primero, mover finetuning y production-mlops a semana 9
  // Pero hay un conflicto porque semana 8 ya tiene 4 lecciones

  // Paso 1: Mover temporalmente a semana 99 para evitar conflictos
  console.log('Paso 1: Moviendo lecciones temporalmente...');

  await prisma.lesson.update({
    where: { slug: 'finetuning-adaptation' },
    data: { week: 99, order: 1 },
  });
  console.log('  ✓ finetuning-adaptation → Week 99');

  await prisma.lesson.update({
    where: { slug: 'production-mlops' },
    data: { week: 99, order: 2 },
  });
  console.log('  ✓ production-mlops → Week 99');

  // Paso 2: Ahora mover a semana 9
  console.log('\nPaso 2: Moviendo a semana 9...');

  await prisma.lesson.update({
    where: { slug: 'finetuning-adaptation' },
    data: { week: 9, order: 1 },
  });
  console.log('  ✅ finetuning-adaptation → Week 9, Order 1');

  await prisma.lesson.update({
    where: { slug: 'production-mlops' },
    data: { week: 9, order: 2 },
  });
  console.log('  ✅ production-mlops → Week 9, Order 2');

  // Verificar estructura final
  console.log('\n📊 Final structure verification:');
  const lessons = await prisma.lesson.findMany({
    select: { slug: true, title: true, week: true, order: true },
    orderBy: [{ week: 'asc' }, { order: 'asc' }],
  });

  const byWeek: Record<number, string[]> = {};
  for (const lesson of lessons) {
    if (!byWeek[lesson.week]) byWeek[lesson.week] = [];
    byWeek[lesson.week].push(`${lesson.order}. ${lesson.title}`);
  }

  for (const [week, weekLessons] of Object.entries(byWeek)) {
    console.log(`\nSemana ${week} (${weekLessons.length} lecciones):`);
    weekLessons.forEach((l) => console.log(`  ${l}`));
  }

  console.log('\n✨ Week structure fix completed!');
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
