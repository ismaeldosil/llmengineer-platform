/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
// 10 semanas, 2 lecciones por semana = 20 lecciones total
// Semanas 1-5 (Lecciones 1-10): Fundamentos
import { introToLlms, apiBasics } from './content/lessons-1-2';
import { promptEngineeringBasics, temperatureAndSampling } from './content/lessons-3-4';
import { systemPrompts, contextManagement } from './content/lessons-5-6';
import { structuredOutputs, errorHandling } from './content/lessons-7-8';
import { streamingResponses, costOptimization } from './content/lessons-9-10';
// Semanas 6-10 (Lecciones 11-20): Avanzado
import { ragFundamentals, ragAdvanced } from './content/lessons-11-12';
import { evaluationBenchmarking, agentsFundamentals } from './content/lessons-13-14';
import { agentsAdvanced, securityGuardrails } from './content/lessons-15-16';
import { finetuningAdaptation, productionMlops } from './content/lessons-17-18';
import { multimodalModels, localModelsEdge } from './content/lessons-19-20';

const prisma = new PrismaClient();

// Map slug to content (all 20 lessons, 10 weeks x 2)
const lessonContentMap: Record<string, { sections: unknown[]; quiz?: unknown }> = {
  // Semana 1: Fundamentos
  'intro-to-llms': introToLlms,
  'api-basics': apiBasics,
  // Semana 2: Prompting Básico
  'prompt-engineering-basics': promptEngineeringBasics,
  'temperature-and-sampling': temperatureAndSampling,
  // Semana 3: Contexto y System Prompts
  'system-prompts': systemPrompts,
  'context-management': contextManagement,
  // Semana 4: Outputs y Errores
  'structured-outputs': structuredOutputs,
  'error-handling': errorHandling,
  // Semana 5: Producción Básica
  'streaming-responses': streamingResponses,
  'cost-optimization': costOptimization,
  // Semana 6: RAG
  'rag-fundamentals': ragFundamentals,
  'rag-advanced': ragAdvanced,
  // Semana 7: Evaluación y Agentes Básicos
  'evaluation-benchmarking': evaluationBenchmarking,
  'agents-fundamentals': agentsFundamentals,
  // Semana 8: Agentes Avanzados y Seguridad
  'agents-advanced': agentsAdvanced,
  'security-guardrails': securityGuardrails,
  // Semana 9: Fine-tuning y MLOps
  'finetuning-adaptation': finetuningAdaptation,
  'production-mlops': productionMlops,
  // Semana 10: Modelos Especializados
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
