/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Nueva estructura: 10 semanas x 2 lecciones
const weekUpdates: Record<string, { week: number; order: number }> = {
  // Semana 1: Fundamentos
  'intro-to-llms': { week: 1, order: 1 },
  'api-basics': { week: 1, order: 2 },
  // Semana 2: Prompting Básico
  'prompt-engineering-basics': { week: 2, order: 1 },
  'temperature-and-sampling': { week: 2, order: 2 },
  // Semana 3: Contexto y System Prompts
  'system-prompts': { week: 3, order: 1 },
  'context-management': { week: 3, order: 2 },
  // Semana 4: Outputs y Errores
  'structured-outputs': { week: 4, order: 1 },
  'error-handling': { week: 4, order: 2 },
  // Semana 5: Producción Básica
  'streaming-responses': { week: 5, order: 1 },
  'cost-optimization': { week: 5, order: 2 },
  // Semana 6: RAG
  'rag-fundamentals': { week: 6, order: 1 },
  'rag-advanced': { week: 6, order: 2 },
  // Semana 7: Evaluación y Agentes Básicos
  'evaluation-benchmarking': { week: 7, order: 1 },
  'agents-fundamentals': { week: 7, order: 2 },
  // Semana 8: Agentes Avanzados y Seguridad
  'agents-advanced': { week: 8, order: 1 },
  'security-guardrails': { week: 8, order: 2 },
  // Semana 9: Fine-tuning y MLOps
  'finetuning-adaptation': { week: 9, order: 1 },
  'production-mlops': { week: 9, order: 2 },
  // Semana 10: Modelos Especializados
  'multimodal-models': { week: 10, order: 1 },
  'local-models-edge': { week: 10, order: 2 },
};

async function main() {
  console.log('🔄 Updating lesson week structure to 10 weeks x 2 lessons...\n');

  for (const [slug, { week, order }] of Object.entries(weekUpdates)) {
    try {
      const lesson = await prisma.lesson.findUnique({
        where: { slug },
        select: { id: true, title: true, week: true, order: true },
      });

      if (!lesson) {
        console.log(`⚠️  Lesson not found: ${slug}`);
        continue;
      }

      if (lesson.week === week && lesson.order === order) {
        console.log(`✓ ${slug}: already correct (Week ${week}, Order ${order})`);
        continue;
      }

      await prisma.lesson.update({
        where: { slug },
        data: { week, order },
      });

      console.log(
        `✅ ${slug}: Week ${lesson.week}→${week}, Order ${lesson.order}→${order}`
      );
    } catch (error) {
      console.error(`❌ Error updating ${slug}:`, error);
    }
  }

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

  console.log('\n✨ Week structure update completed!');
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
