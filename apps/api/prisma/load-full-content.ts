/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
// Weeks 1-5 (Lessons 1-10)
import { introToLlms, apiBasics } from './content/lessons-1-2';
import { promptEngineeringBasics, temperatureAndSampling } from './content/lessons-3-4';
import { systemPrompts, contextManagement } from './content/lessons-5-6';
import { structuredOutputs, errorHandling } from './content/lessons-7-8';
import { streamingResponses, costOptimization } from './content/lessons-9-10';
// Weeks 6-9 (Lessons 11-20)
import { ragFundamentals, ragAdvanced } from './content/lessons-11-12';
import { evaluationBenchmarking, agentsFundamentals } from './content/lessons-13-14';
import { agentsAdvanced, securityGuardrails } from './content/lessons-15-16';
import { finetuningAdaptation, productionMlops } from './content/lessons-17-18';
import { multimodalModels, localModelsEdge } from './content/lessons-19-20';

const prisma = new PrismaClient();

// Map slug to content (all 20 lessons)
const lessonContentMap: Record<string, { sections: unknown[]; quiz?: unknown }> = {
  // Week 1
  'intro-to-llms': introToLlms,
  'api-basics': apiBasics,
  // Week 2
  'prompt-engineering-basics': promptEngineeringBasics,
  'temperature-and-sampling': temperatureAndSampling,
  // Week 3
  'system-prompts': systemPrompts,
  'context-management': contextManagement,
  // Week 4
  'structured-outputs': structuredOutputs,
  'error-handling': errorHandling,
  // Week 5
  'streaming-responses': streamingResponses,
  'cost-optimization': costOptimization,
  // Week 6
  'rag-fundamentals': ragFundamentals,
  'rag-advanced': ragAdvanced,
  // Week 7
  'evaluation-benchmarking': evaluationBenchmarking,
  'agents-fundamentals': agentsFundamentals,
  // Week 8
  'agents-advanced': agentsAdvanced,
  'security-guardrails': securityGuardrails,
  'finetuning-adaptation': finetuningAdaptation,
  'production-mlops': productionMlops,
  // Week 9
  'multimodal-models': multimodalModels,
  'local-models-edge': localModelsEdge,
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
