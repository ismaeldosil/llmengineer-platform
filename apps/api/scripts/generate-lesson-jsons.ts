// Script to convert TypeScript lesson content to JSON files
import * as fs from 'fs';
import * as path from 'path';

// Import lesson content from TypeScript files
import { promptEngineeringBasics, temperatureAndSampling } from '../prisma/content/lessons-3-4';
import { systemPrompts, contextManagement } from '../prisma/content/lessons-5-6';
import { structuredOutputs, errorHandling } from '../prisma/content/lessons-7-8';
import { streamingResponses, costOptimization } from '../prisma/content/lessons-9-10';

interface LessonConfig {
  slug: string;
  title: string;
  description: string;
  week: number;
  order: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  xpReward: number;
  estimatedMinutes: number;
  tags: string[];
  prerequisites: string[];
  sections: any;
  quiz: any;
  resources: any[];
}

const lessonsConfig: LessonConfig[] = [
  {
    slug: 'prompt-engineering-basics',
    title: 'Fundamentos de Prompt Engineering',
    description: 'Aprende las técnicas esenciales para diseñar prompts efectivos que maximicen la calidad de las respuestas de los LLMs.',
    week: 2,
    order: 1,
    difficulty: 'beginner',
    xpReward: 150,
    estimatedMinutes: 30,
    tags: ['prompt-engineering', 'técnicas', 'fundamentos'],
    prerequisites: ['intro-to-llms', 'api-basics'],
    sections: promptEngineeringBasics.sections,
    quiz: {
      passingScore: 70,
      questions: [
        {
          id: 'q1',
          type: 'multiple_choice',
          question: '¿Cuál es el principal beneficio del Few-shot prompting?',
          options: [
            'Es más rápido que Zero-shot',
            'Proporciona ejemplos que guían al modelo hacia el formato deseado',
            'Usa menos tokens',
            'Solo funciona con GPT-4'
          ],
          correctAnswer: 1,
          explanation: 'Few-shot prompting muestra ejemplos de entrada/salida que ayudan al modelo a entender exactamente qué formato y tipo de respuesta se espera.'
        },
        {
          id: 'q2',
          type: 'multiple_choice',
          question: '¿Qué técnica pide al modelo que muestre su razonamiento paso a paso?',
          options: [
            'Zero-shot prompting',
            'Few-shot prompting',
            'Chain-of-Thought (CoT)',
            'Role prompting'
          ],
          correctAnswer: 2,
          explanation: 'Chain-of-Thought (CoT) prompting pide al modelo que "piense en voz alta" y muestre su razonamiento paso a paso, mejorando el rendimiento en tareas de razonamiento.'
        },
        {
          id: 'q3',
          type: 'true_false',
          question: 'Un buen prompt debe incluir contexto claro, instrucción específica y formato de salida esperado.',
          correctAnswer: true,
          explanation: 'Estos tres elementos son fundamentales para obtener respuestas precisas y útiles del modelo.'
        }
      ]
    },
    resources: [
      { title: 'Prompt Engineering Guide', url: 'https://www.promptingguide.ai/', type: 'guide' },
      { title: 'OpenAI Best Practices', url: 'https://platform.openai.com/docs/guides/prompt-engineering', type: 'documentation' }
    ]
  },
  {
    slug: 'temperature-and-sampling',
    title: 'Temperature y Estrategias de Sampling',
    description: 'Domina los parámetros de generación para controlar la creatividad y consistencia de las respuestas.',
    week: 2,
    order: 2,
    difficulty: 'intermediate',
    xpReward: 175,
    estimatedMinutes: 25,
    tags: ['temperature', 'sampling', 'parámetros'],
    prerequisites: ['prompt-engineering-basics'],
    sections: temperatureAndSampling.sections,
    quiz: {
      passingScore: 70,
      questions: [
        {
          id: 'q1',
          type: 'multiple_choice',
          question: '¿Qué sucede cuando aumentas el valor de temperature?',
          options: [
            'Las respuestas son más determinísticas',
            'Las respuestas son más creativas y variadas',
            'El modelo es más rápido',
            'Se usan menos tokens'
          ],
          correctAnswer: 1,
          explanation: 'Temperature más alta hace que la distribución de probabilidades sea más uniforme, resultando en respuestas más variadas y creativas.'
        },
        {
          id: 'q2',
          type: 'multiple_choice',
          question: '¿Qué valor de temperature es recomendable para generación de código?',
          options: [
            '1.5 - muy creativo',
            '1.0 - balanceado',
            '0.0-0.3 - determinístico',
            '2.0 - máxima variedad'
          ],
          correctAnswer: 2,
          explanation: 'Para código se recomienda temperature baja (0.0-0.3) para obtener respuestas consistentes y predecibles.'
        },
        {
          id: 'q3',
          type: 'true_false',
          question: 'Top-p sampling limita la selección a tokens cuya probabilidad acumulada no exceda el valor p.',
          correctAnswer: true,
          explanation: 'Top-p (nucleus sampling) selecciona del conjunto mínimo de tokens cuyas probabilidades suman al menos p.'
        }
      ]
    },
    resources: [
      { title: 'Understanding Temperature', url: 'https://docs.anthropic.com/claude/docs/temperature', type: 'documentation' }
    ]
  },
  {
    slug: 'system-prompts',
    title: 'System Prompts y Roles',
    description: 'Aprende a configurar el comportamiento del modelo usando system prompts efectivos.',
    week: 3,
    order: 1,
    difficulty: 'intermediate',
    xpReward: 175,
    estimatedMinutes: 30,
    tags: ['system-prompt', 'roles', 'configuración'],
    prerequisites: ['temperature-and-sampling'],
    sections: systemPrompts.sections,
    quiz: {
      passingScore: 70,
      questions: [
        {
          id: 'q1',
          type: 'multiple_choice',
          question: '¿Cuál es el propósito principal de un system prompt?',
          options: [
            'Hacer preguntas al modelo',
            'Definir el comportamiento, rol y restricciones del asistente',
            'Aumentar la velocidad de respuesta',
            'Reducir costos de API'
          ],
          correctAnswer: 1,
          explanation: 'El system prompt establece el contexto, personalidad, y reglas que el modelo debe seguir durante toda la conversación.'
        },
        {
          id: 'q2',
          type: 'true_false',
          question: 'Los system prompts se procesan una sola vez y no consumen tokens en cada mensaje.',
          correctAnswer: false,
          explanation: 'Los system prompts se envían con cada request y consumen tokens cada vez, por lo que deben ser concisos pero efectivos.'
        }
      ]
    },
    resources: [
      { title: 'Anthropic System Prompts', url: 'https://docs.anthropic.com/claude/docs/system-prompts', type: 'documentation' }
    ]
  },
  {
    slug: 'context-management',
    title: 'Gestión de Contexto',
    description: 'Estrategias para manejar conversaciones largas y optimizar el uso de la ventana de contexto.',
    week: 3,
    order: 2,
    difficulty: 'intermediate',
    xpReward: 200,
    estimatedMinutes: 35,
    tags: ['contexto', 'memoria', 'conversaciones'],
    prerequisites: ['system-prompts'],
    sections: contextManagement.sections,
    quiz: {
      passingScore: 70,
      questions: [
        {
          id: 'q1',
          type: 'multiple_choice',
          question: '¿Qué estrategia es más efectiva para conversaciones muy largas?',
          options: [
            'Enviar todo el historial siempre',
            'Usar resúmenes del contexto anterior',
            'Ignorar mensajes antiguos',
            'Aumentar max_tokens'
          ],
          correctAnswer: 1,
          explanation: 'Resumir el contexto anterior permite mantener información relevante sin exceder la ventana de contexto.'
        },
        {
          id: 'q2',
          type: 'true_false',
          question: 'La ventana de contexto incluye tanto el prompt como la respuesta generada.',
          correctAnswer: true,
          explanation: 'El límite de contexto aplica a todo: system prompt, historial de mensajes, y la respuesta que genera el modelo.'
        }
      ]
    },
    resources: []
  },
  {
    slug: 'structured-outputs',
    title: 'Outputs Estructurados',
    description: 'Aprende a obtener respuestas en formatos estructurados como JSON usando function calling y validación.',
    week: 4,
    order: 1,
    difficulty: 'intermediate',
    xpReward: 200,
    estimatedMinutes: 40,
    tags: ['json', 'function-calling', 'validación'],
    prerequisites: ['context-management'],
    sections: structuredOutputs.sections,
    quiz: {
      passingScore: 70,
      questions: [
        {
          id: 'q1',
          type: 'multiple_choice',
          question: '¿Cuál es la ventaja principal de function calling sobre pedir JSON en el prompt?',
          options: [
            'Es más rápido',
            'Garantiza estructura válida y facilita el parsing',
            'Usa menos tokens',
            'Funciona sin API key'
          ],
          correctAnswer: 1,
          explanation: 'Function calling proporciona respuestas estructuradas garantizadas que son más fáciles de parsear y validar.'
        },
        {
          id: 'q2',
          type: 'true_false',
          question: 'Siempre debes validar las respuestas JSON del modelo antes de usarlas.',
          correctAnswer: true,
          explanation: 'Los modelos pueden generar JSON malformado ocasionalmente. Siempre valida con try/catch o librerías como Zod.'
        }
      ]
    },
    resources: [
      { title: 'OpenAI Function Calling', url: 'https://platform.openai.com/docs/guides/function-calling', type: 'documentation' },
      { title: 'Zod Validation', url: 'https://zod.dev/', type: 'library' }
    ]
  },
  {
    slug: 'error-handling',
    title: 'Manejo de Errores y Resiliencia',
    description: 'Implementa estrategias robustas para manejar errores, rate limits y fallos de API.',
    week: 4,
    order: 2,
    difficulty: 'intermediate',
    xpReward: 200,
    estimatedMinutes: 35,
    tags: ['errores', 'retry', 'resiliencia'],
    prerequisites: ['structured-outputs'],
    sections: errorHandling.sections,
    quiz: {
      passingScore: 70,
      questions: [
        {
          id: 'q1',
          type: 'multiple_choice',
          question: '¿Qué estrategia de retry es más recomendable para rate limits?',
          options: [
            'Retry inmediato',
            'Retry fijo cada 1 segundo',
            'Exponential backoff con jitter',
            'No hacer retry'
          ],
          correctAnswer: 2,
          explanation: 'Exponential backoff con jitter evita thundering herd y da tiempo al servicio para recuperarse.'
        },
        {
          id: 'q2',
          type: 'true_false',
          question: 'El error 429 indica que has excedido el rate limit de la API.',
          correctAnswer: true,
          explanation: 'HTTP 429 Too Many Requests indica que debes esperar antes de hacer más peticiones.'
        }
      ]
    },
    resources: []
  },
  {
    slug: 'streaming-responses',
    title: 'Streaming de Respuestas',
    description: 'Implementa streaming para mostrar respuestas en tiempo real y mejorar la experiencia de usuario.',
    week: 5,
    order: 1,
    difficulty: 'advanced',
    xpReward: 225,
    estimatedMinutes: 40,
    tags: ['streaming', 'sse', 'tiempo-real'],
    prerequisites: ['error-handling'],
    sections: streamingResponses.sections,
    quiz: {
      passingScore: 70,
      questions: [
        {
          id: 'q1',
          type: 'multiple_choice',
          question: '¿Qué tecnología se usa comúnmente para streaming de LLMs?',
          options: [
            'WebSockets bidireccionales',
            'Server-Sent Events (SSE)',
            'Long polling',
            'GraphQL subscriptions'
          ],
          correctAnswer: 1,
          explanation: 'SSE es ideal para streaming de LLMs porque es unidireccional (servidor a cliente) y nativo de HTTP.'
        },
        {
          id: 'q2',
          type: 'true_false',
          question: 'El streaming mejora el tiempo percibido de respuesta aunque el tiempo total sea similar.',
          correctAnswer: true,
          explanation: 'Ver tokens aparecer progresivamente da sensación de respuesta inmediata, mejorando la UX.'
        }
      ]
    },
    resources: [
      { title: 'Anthropic Streaming', url: 'https://docs.anthropic.com/claude/reference/streaming', type: 'documentation' }
    ]
  },
  {
    slug: 'cost-optimization',
    title: 'Optimización de Costos',
    description: 'Estrategias para reducir costos de API manteniendo la calidad de las respuestas.',
    week: 5,
    order: 2,
    difficulty: 'advanced',
    xpReward: 225,
    estimatedMinutes: 35,
    tags: ['costos', 'optimización', 'tokens'],
    prerequisites: ['streaming-responses'],
    sections: costOptimization.sections,
    quiz: {
      passingScore: 70,
      questions: [
        {
          id: 'q1',
          type: 'multiple_choice',
          question: '¿Cuál es la estrategia más efectiva para reducir costos de API?',
          options: [
            'Usar siempre el modelo más pequeño',
            'Combinar caching, prompts eficientes y selección inteligente de modelos',
            'Limitar max_tokens a 100',
            'Hacer menos requests'
          ],
          correctAnswer: 1,
          explanation: 'Una estrategia integral que combine múltiples técnicas es más efectiva que optimizar un solo aspecto.'
        },
        {
          id: 'q2',
          type: 'true_false',
          question: 'Los tokens de entrada y salida tienen el mismo costo en la mayoría de APIs.',
          correctAnswer: false,
          explanation: 'Generalmente los tokens de salida son más costosos que los de entrada. Optimiza ambos pero prioriza outputs.'
        }
      ]
    },
    resources: [
      { title: 'OpenAI Pricing', url: 'https://openai.com/pricing', type: 'pricing' },
      { title: 'Anthropic Pricing', url: 'https://www.anthropic.com/pricing', type: 'pricing' }
    ]
  }
];

const CONTENT_PATH = path.resolve(__dirname, '../../../../llmengineer-content/lessons');

async function generateLessonJsons() {
  console.log('Generating lesson JSON files...\n');

  for (const lesson of lessonsConfig) {
    const weekDir = path.join(CONTENT_PATH, `week-${lesson.week}`);

    // Create week directory if it doesn't exist
    if (!fs.existsSync(weekDir)) {
      fs.mkdirSync(weekDir, { recursive: true });
      console.log(`Created directory: week-${lesson.week}`);
    }

    const fileName = `${String(lesson.order).padStart(2, '0')}-${lesson.slug}.json`;
    const filePath = path.join(weekDir, fileName);

    const jsonContent = JSON.stringify(lesson, null, 2);
    fs.writeFileSync(filePath, jsonContent);

    console.log(`✓ Generated: week-${lesson.week}/${fileName}`);
  }

  console.log(`\n✓ Generated ${lessonsConfig.length} lesson files`);
}

generateLessonJsons().catch(console.error);
