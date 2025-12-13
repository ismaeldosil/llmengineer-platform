/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
import { introToLlms, apiBasics } from './content/lessons-1-2';
import { promptEngineeringBasics, temperatureAndSampling } from './content/lessons-3-4';
import { systemPrompts, contextManagement } from './content/lessons-5-6';
import { structuredOutputs, errorHandling } from './content/lessons-7-8';
import { streamingResponses, costOptimization } from './content/lessons-9-10';

const prisma = new PrismaClient();

// Map slug to content
const lessonContentMap: Record<string, { sections: unknown[]; quiz?: unknown }> = {
  'intro-to-llms': introToLlms,
  'api-basics': apiBasics,
  'prompt-engineering-basics': promptEngineeringBasics,
  'temperature-and-sampling': temperatureAndSampling,
  'system-prompts': systemPrompts,
  'context-management': contextManagement,
  'structured-outputs': structuredOutputs,
  'error-handling': errorHandling,
  'streaming-responses': streamingResponses,
  'cost-optimization': costOptimization,
};

async function main() {
  console.log('🚀 Loading full lesson content to database...\n');

  for (const [slug, content] of Object.entries(lessonContentMap)) {
    try {
      const lesson = await prisma.lesson.findUnique({
        where: { slug },
      });

      if (!lesson) {
        console.log(`⚠️  Lesson not found: ${slug}`);
        continue;
      }

      await prisma.lesson.update({
        where: { slug },
        data: {
          sections: content.sections as any,
          quiz: content.quiz as any || null,
        },
      });

      const sectionCount = content.sections?.length || 0;
      const hasQuiz = content.quiz ? '✓' : '✗';
      console.log(`✅ ${slug}: ${sectionCount} sections, quiz: ${hasQuiz}`);
    } catch (error) {
      console.error(`❌ Error updating ${slug}:`, error);
    }
  }

  console.log('\n✨ Content loading completed!');
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
