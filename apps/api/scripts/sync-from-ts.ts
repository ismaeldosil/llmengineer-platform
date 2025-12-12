// @ts-nocheck
import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import { introToLlms, apiBasics } from '../prisma/content/lessons-1-2';
import { promptEngineeringBasics, temperatureAndSampling } from '../prisma/content/lessons-3-4';
import { systemPrompts, contextManagement } from '../prisma/content/lessons-5-6';
import { structuredOutputs, errorHandling } from '../prisma/content/lessons-7-8';
import { streamingResponses, costOptimization } from '../prisma/content/lessons-9-10';
import { ragFundamentals, ragAdvanced } from '../prisma/content/lessons-11-12';
import { evaluationBenchmarking, agentsFundamentals } from '../prisma/content/lessons-13-14';
import { agentsAdvanced, securityGuardrails } from '../prisma/content/lessons-15-16';
import { finetuningAdaptation, productionMlops } from '../prisma/content/lessons-17-18';
import { multimodalModels, localModelsEdge } from '../prisma/content/lessons-19-20';

const prisma = new PrismaClient();

const lessonsMap: Record<string, { sections: any[] }> = {
  // Semana 1-2: Fundamentos
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
  // Semana 3-8: Contenido Avanzado
  'rag-fundamentals': ragFundamentals,
  'rag-advanced': ragAdvanced,
  'evaluation-benchmarking': evaluationBenchmarking,
  'agents-fundamentals': agentsFundamentals,
  'agents-advanced': agentsAdvanced,
  'security-guardrails': securityGuardrails,
  'finetuning-adaptation': finetuningAdaptation,
  'production-mlops': productionMlops,
  'multimodal-models': multimodalModels,
  'local-models-edge': localModelsEdge,
};

async function main() {
  console.log('Syncing lesson content from TypeScript files...\n');

  for (const [slug, content] of Object.entries(lessonsMap)) {
    if (!content || !content.sections) {
      console.log('Warning: No sections for:', slug);
      continue;
    }

    try {
      await prisma.lesson.update({
        where: { slug },
        data: {
          sections: JSON.parse(JSON.stringify(content.sections)),
        }
      });
      console.log('Updated:', slug, '- sections:', content.sections.length);
    } catch (err) {
      console.error('Error updating', slug, ':', err.message);
    }
  }

  console.log('\nDone!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
