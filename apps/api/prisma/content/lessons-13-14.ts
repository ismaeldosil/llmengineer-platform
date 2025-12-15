// @ts-nocheck
export const evaluationBenchmarking = {
  sections: [
    {
      title: '¿Por qué Evaluar?',
      content: `La evaluación sistemática es fundamental para construir aplicaciones LLM confiables y escalables. Sin métricas objetivas, nos basamos únicamente en intuiciones ("vibes"), lo que resulta en optimizaciones subjetivas y dificultades para detectar regresiones.

**La importancia de la evaluación sistemática**

En el desarrollo tradicional de software, las pruebas unitarias y de integración son prácticas estándar. Con LLMs, necesitamos un enfoque similar pero adaptado a la naturaleza probabilística de estos modelos. Una evaluación sistemática nos permite:

- **Medir el progreso objetivamente**: Comparar diferentes versiones de prompts, modelos o estrategias de retrieval usando métricas cuantificables.
- **Detectar regresiones temprano**: Identificar cuándo un cambio en el sistema degrada la calidad de las respuestas.
- **Optimizar con confianza**: Tomar decisiones basadas en datos sobre qué configuraciones funcionan mejor.
- **Justificar costos**: Demostrar si un modelo más caro realmente mejora los resultados lo suficiente como para justificar el gasto adicional.

**Métricas vs Vibes**

El desarrollo basado en "vibes" ocurre cuando evaluamos outputs manualmente probando algunos ejemplos en el playground. Esto tiene limitaciones críticas:

- No es escalable: imposible probar miles de casos
- Sesgo de confirmación: tendemos a buscar ejemplos que confirman nuestras expectativas
- Inconsistencia: diferentes personas evalúan diferente
- Falta de reproducibilidad: difícil comparar resultados entre iteraciones

Las métricas cuantitativas complementan la intuición humana con datos objetivos y reproducibles.

**Mejora continua**

La evaluación no es un evento único sino un proceso continuo. Debes establecer:

1. **Datasets de evaluación**: Conjuntos de ejemplos representativos con respuestas esperadas
2. **Métricas automatizadas**: Scripts que calculen puntuaciones sin intervención manual
3. **Umbrales de aceptación**: Valores mínimos que debe alcanzar el sistema
4. **Ciclo de feedback**: Proceso para incorporar fallos detectados en producción al dataset de evaluación`,
      keyPoints: [
        'La evaluación sistemática es esencial para construir aplicaciones LLM confiables y evitar decisiones basadas solo en intuición',
        'Las métricas cuantitativas permiten comparar objetivamente diferentes versiones, detectar regresiones y optimizar con confianza',
        'El desarrollo basado en "vibes" no escala y sufre de sesgos de confirmación e inconsistencias',
        'La evaluación debe ser un proceso continuo con datasets, métricas automatizadas y umbrales de aceptación claros',
        'Incorporar fallos de producción al dataset de evaluación crea un ciclo de mejora continua',
      ],
    },
    {
      title: 'Métricas Automatizadas',
      content: `Las métricas automatizadas permiten evaluar outputs de LLMs a escala sin intervención humana constante. Existen diferentes familias de métricas, cada una con ventajas y limitaciones.

**Métricas basadas en N-gramas**

BLEU (Bilingual Evaluation Understudy) y ROUGE (Recall-Oriented Understudy for Gisting Evaluation) son métricas clásicas que comparan secuencias de palabras:

\`\`\`python
from nltk.translate.bleu_score import sentence_bleu
from rouge_score import rouge_scorer

# BLEU: mide precisión de n-gramas
reference = [['el', 'gato', 'está', 'en', 'la', 'mesa']]
candidate = ['el', 'gato', 'sobre', 'la', 'mesa']
bleu_score = sentence_bleu(reference, candidate)

# ROUGE: mide recall de n-gramas (común en resúmenes)
scorer = rouge_scorer.RougeScorer(['rouge1', 'rougeL'], use_stemmer=True)
scores = scorer.score('el gato está en la mesa',
                     'el gato sobre la mesa')
print(f"ROUGE-1: {scores['rouge1'].fmeasure}")
\`\`\`

Estas métricas son rápidas y determinísticas, pero tienen limitaciones: no capturan significado semántico y penalizan paráfrasis válidas.

**Métricas semánticas**

BERTScore usa embeddings de modelos de lenguaje para capturar similitud semántica:

\`\`\`python
from bert_score import score

references = ["El clima está soleado hoy"]
candidates = ["Hace sol en este día"]

P, R, F1 = score(candidates, references, lang='es', verbose=True)
print(f"BERTScore F1: {F1.mean():.3f}")
\`\`\`

BERTScore es más robusto a paráfrasis pero más lento y requiere una referencia ground truth.

**Perplexity**

Mide qué tan "sorprendido" está un modelo por una secuencia. Útil para modelos generativos:

\`\`\`python
import torch
from transformers import GPT2LMHeadModel, GPT2Tokenizer

model = GPT2LMHeadModel.from_pretrained('gpt2')
tokenizer = GPT2Tokenizer.from_pretrained('gpt2')

text = "The quick brown fox jumps over the lazy dog"
encodings = tokenizer(text, return_tensors='pt')

with torch.no_grad():
    outputs = model(**encodings, labels=encodings.input_ids)
    perplexity = torch.exp(outputs.loss)

print(f"Perplexity: {perplexity.item():.2f}")
\`\`\`

**Exact Match vs Fuzzy Matching**

Para respuestas factuales:

\`\`\`typescript
// Exact match
function exactMatch(prediction: string, reference: string): boolean {
  return prediction.trim().toLowerCase() === reference.trim().toLowerCase();
}

// Fuzzy matching con Levenshtein distance
import { distance } from 'fastest-levenshtein';

function fuzzyMatch(prediction: string, reference: string, threshold: number = 0.8): boolean {
  const maxLen = Math.max(prediction.length, reference.length);
  const similarity = 1 - (distance(prediction, reference) / maxLen);
  return similarity >= threshold;
}
\`\`\`

La elección de métrica depende de tu caso de uso: BLEU/ROUGE para generación, BERTScore para semántica, exact match para datos estructurados.`,
      keyPoints: [
        'BLEU y ROUGE miden similitud basada en n-gramas, son rápidas pero no capturan significado semántico',
        'BERTScore usa embeddings para medir similitud semántica, más robusto a paráfrasis pero requiere referencias',
        'Perplexity mide cuán sorprendido está un modelo por una secuencia, útil para evaluar modelos generativos',
        'Exact match funciona para respuestas factuales precisas, fuzzy matching permite tolerancia a variaciones menores',
        'La métrica apropiada depende del caso de uso: generación, semántica o extracción de datos estructurados',
      ],
    },
    {
      title: 'LLM-as-Judge',
      content: `Usar un LLM para evaluar outputs de otro LLM es una técnica poderosa cuando las métricas tradicionales son insuficientes. Permite evaluar aspectos cualitativos como relevancia, coherencia o seguimiento de instrucciones.

**Fundamentos de LLM-as-Judge**

La idea es crear prompts que pidan al LLM juzgar la calidad de una respuesta según criterios específicos:

\`\`\`python
import anthropic

client = anthropic.Anthropic()

def evaluate_response(question: str, answer: str, criteria: str) -> dict:
    prompt = f"""Evalúa la siguiente respuesta según estos criterios: {criteria}

Pregunta: {question}
Respuesta: {answer}

Proporciona:
1. Puntuación (1-5)
2. Justificación breve
3. Sugerencias de mejora

Formato JSON."""

    message = client.messages.create(
        model="claude-opus-4-5-20251101",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}]
    )

    return parse_json(message.content[0].text)
\`\`\`

**Rúbricas y criterios bien definidos**

La calidad de la evaluación depende de qué tan específicos sean tus criterios:

\`\`\`typescript
const evaluationRubric = {
  accuracy: {
    description: "La respuesta contiene información factualmente correcta",
    weight: 0.4,
    scale: {
      5: "Completamente precisa, sin errores factuales",
      4: "Mayormente precisa, errores menores",
      3: "Parcialmente precisa, algunos errores significativos",
      2: "Mayormente imprecisa",
      1: "Completamente incorrecta"
    }
  },
  relevance: {
    description: "La respuesta aborda directamente la pregunta",
    weight: 0.3,
    scale: {
      5: "Completamente relevante",
      3: "Parcialmente relevante",
      1: "No relevante"
    }
  },
  completeness: {
    description: "La respuesta cubre todos los aspectos necesarios",
    weight: 0.3,
    scale: {
      5: "Exhaustiva",
      3: "Adecuada",
      1: "Incompleta"
    }
  }
};
\`\`\`

**Bias en evaluación automática**

Los LLMs como jueces tienen sesgos conocidos:

- **Position bias**: Prefieren respuestas en ciertas posiciones
- **Length bias**: Favorecen respuestas más largas
- **Self-preference bias**: Prefieren outputs de su mismo modelo
- **Verbosity bias**: Confunden detalle con calidad

Mitigaciones:

\`\`\`python
def evaluate_with_controls(answer_a: str, answer_b: str) -> dict:
    # Evaluar en ambas posiciones para controlar position bias
    score_ab = judge_llm(answer_a, answer_b)
    score_ba = judge_llm(answer_b, answer_a)

    # Normalizar por longitud
    length_a = len(answer_a.split())
    length_b = len(answer_b.split())

    # Combinar scores
    final_score = {
        'a_wins': (score_ab['a_wins'] + score_ba['a_wins']) / 2,
        'b_wins': (score_ab['b_wins'] + score_ba['b_wins']) / 2,
        'length_normalized': adjust_for_length(score_ab, length_a, length_b)
    }

    return final_score
\`\`\`

**Mejores prácticas**

- Usa modelos fuertes como jueces (GPT-4, Claude Opus)
- Define criterios específicos y objetivos
- Valida contra evaluaciones humanas en un subset
- Usa múltiples jueces y promediar scores
- Documenta sesgos conocidos en tu contexto`,
      keyPoints: [
        'LLM-as-Judge permite evaluar aspectos cualitativos como relevancia y coherencia que métricas tradicionales no capturan',
        'Criterios específicos y rúbricas bien definidas son fundamentales para obtener evaluaciones consistentes y útiles',
        'Los LLMs tienen sesgos conocidos: position bias, length bias, self-preference y verbosity bias',
        'Mitigar sesgos requiere técnicas como evaluar en múltiples posiciones, normalizar por longitud y usar múltiples jueces',
        'Siempre valida evaluaciones automáticas contra un subset de evaluaciones humanas para asegurar correlación',
      ],
    },
    {
      title: 'Evaluación Humana',
      content: `A pesar de los avances en evaluación automatizada, la evaluación humana sigue siendo el gold standard para muchas aplicaciones LLM. Los humanos pueden juzgar aspectos sutiles que las métricas automáticas no capturan.

**Diseño de estudios de evaluación**

Un estudio de evaluación bien diseñado requiere planificación cuidadosa:

\`\`\`typescript
interface EvaluationStudy {
  objective: string;
  sampleSize: number;
  samplingStrategy: 'random' | 'stratified' | 'adversarial';
  evaluators: {
    count: number;
    expertise: 'expert' | 'non-expert' | 'target-user';
    training: string;
  };
  metrics: {
    name: string;
    scale: number;
    definition: string;
  }[];
  controlForBias: {
    randomization: boolean;
    blinding: boolean;
    counterbalancing: boolean;
  };
}

const studyDesign: EvaluationStudy = {
  objective: "Comparar calidad de respuestas entre GPT-4 y Claude",
  sampleSize: 200,
  samplingStrategy: 'stratified', // Por categoría de pregunta
  evaluators: {
    count: 3,
    expertise: 'target-user',
    training: "2 horas + ejemplos calibrados"
  },
  metrics: [
    {
      name: "Utilidad",
      scale: 5,
      definition: "¿Qué tan útil es esta respuesta para resolver el problema?"
    },
    {
      name: "Claridad",
      scale: 5,
      definition: "¿Qué tan fácil es entender la respuesta?"
    }
  ],
  controlForBias: {
    randomization: true,
    blinding: true, // Los evaluadores no saben qué modelo generó cada respuesta
    counterbalancing: true // Rotar orden de presentación
  }
};
\`\`\`

**Inter-Annotator Agreement**

Medir qué tan consistentes son los evaluadores es crucial para validar tus resultados:

\`\`\`python
from sklearn.metrics import cohen_kappa_score
import numpy as np

def calculate_agreement(annotations: dict[str, list[int]]) -> dict:
    """
    annotations: {evaluator_id: [score1, score2, ...]}
    """
    evaluators = list(annotations.values())

    # Cohen's Kappa para pares de evaluadores
    kappas = []
    evaluator_ids = list(annotations.keys())

    for i in range(len(evaluator_ids)):
        for j in range(i + 1, len(evaluator_ids)):
            kappa = cohen_kappa_score(
                evaluators[i],
                evaluators[j]
            )
            kappas.append(kappa)

    avg_kappa = np.mean(kappas)

    # Interpretación
    if avg_kappa > 0.8:
        agreement = "Excelente"
    elif avg_kappa > 0.6:
        agreement = "Bueno"
    elif avg_kappa > 0.4:
        agreement = "Moderado"
    else:
        agreement = "Pobre - revisar criterios"

    return {
        'average_kappa': avg_kappa,
        'interpretation': agreement,
        'individual_kappas': kappas
    }

# Ejemplo
annotations = {
    'evaluator_1': [5, 4, 3, 5, 2, 4],
    'evaluator_2': [5, 4, 4, 4, 2, 4],
    'evaluator_3': [4, 4, 3, 5, 3, 4]
}

result = calculate_agreement(annotations)
print(f"Acuerdo: {result['interpretation']} (κ={result['average_kappa']:.2f})")
\`\`\`

**A/B Testing en producción**

Evaluar con usuarios reales en producción proporciona señales invaluables:

\`\`\`typescript
class ABTestFramework {
  async assignVariant(userId: string, experimentId: string): Promise<'A' | 'B'> {
    // Hash consistente para mismo usuario
    const hash = await this.hashUser(userId, experimentId);
    return hash % 2 === 0 ? 'A' : 'B';
  }

  async logInteraction(
    userId: string,
    variant: 'A' | 'B',
    metrics: {
      thumbsUp?: boolean;
      thumbsDown?: boolean;
      timeToResponse: number;
      followUpQuestions: number;
      taskCompleted: boolean;
    }
  ) {
    await this.analytics.track({
      event: 'llm_interaction',
      userId,
      variant,
      ...metrics,
      timestamp: new Date()
    });
  }

  async analyzeResults(experimentId: string) {
    const results = await this.analytics.query(\`
      SELECT
        variant,
        COUNT(*) as interactions,
        AVG(CASE WHEN thumbsUp THEN 1 ELSE 0 END) as thumbs_up_rate,
        AVG(timeToResponse) as avg_response_time,
        AVG(CASE WHEN taskCompleted THEN 1 ELSE 0 END) as completion_rate
      FROM interactions
      WHERE experiment_id = '\${experimentId}'
      GROUP BY variant
    \`);

    return this.statisticalSignificance(results);
  }
}
\`\`\`

La evaluación humana es costosa pero insustituible para validar que tu sistema realmente satisface necesidades de usuarios.`,
      keyPoints: [
        'La evaluación humana es el gold standard para aspectos sutiles que métricas automáticas no capturan',
        'Un diseño de estudio riguroso incluye definir objetivos, muestreo estratificado, control de sesgos y métricas claras',
        'Inter-annotator agreement (Cohen\'s Kappa) valida la consistencia entre evaluadores y la claridad de criterios',
        'A/B testing en producción con usuarios reales proporciona señales sobre utilidad y satisfacción real',
        'Combinar evaluación humana con métricas automatizadas maximiza eficiencia y cobertura',
      ],
    },
    {
      title: 'Frameworks de Evaluación',
      content: `Los frameworks de evaluación especializados facilitan construir, ejecutar y analizar evaluaciones a escala. Proporcionan infraestructura para datasets, trazabilidad y visualización de resultados.

**LangSmith**

LangSmith de LangChain ofrece evaluación integrada con trazas completas:

\`\`\`python
from langsmith import Client
from langsmith.evaluation import evaluate

client = Client()

# Definir dataset
dataset = client.create_dataset("customer_support_qa")
client.create_examples(
    dataset_id=dataset.id,
    inputs=[
        {"question": "¿Cómo cancelo mi suscripción?"},
        {"question": "¿Cuál es la política de reembolso?"}
    ],
    outputs=[
        {"answer": "Puedes cancelar desde Configuración > Suscripción..."},
        {"answer": "Ofrecemos reembolso completo dentro de 30 días..."}
    ]
)

# Definir evaluadores
def correctness_evaluator(run, example):
    # Usar LLM-as-judge
    score = llm_judge(run.outputs["answer"], example.outputs["answer"])
    return {"key": "correctness", "score": score}

def latency_evaluator(run, example):
    return {"key": "latency", "score": run.execution_time}

# Ejecutar evaluación
results = evaluate(
    lambda inputs: your_rag_chain.invoke(inputs),
    data=dataset,
    evaluators=[correctness_evaluator, latency_evaluator],
    experiment_prefix="gpt-4-rag-v2"
)

# Resultados automáticamente en LangSmith UI
print(f"Avg correctness: {results['correctness']:.2f}")
print(f"Avg latency: {results['latency']:.0f}ms")
\`\`\`

**Weights & Biases**

W&B proporciona tracking de experimentos y visualizaciones ricas:

\`\`\`typescript
import * as wandb from '@wandb/sdk';

async function evaluateWithWandb() {
  const run = await wandb.init({
    project: 'llm-evaluation',
    config: {
      model: 'gpt-4-turbo',
      temperature: 0.7,
      prompt_version: 'v3'
    }
  });

  const results = [];

  for (const example of testSet) {
    const response = await generateResponse(example.input);
    const score = await evaluateResponse(response, example.expected);

    results.push({
      input: example.input,
      output: response,
      expected: example.expected,
      score: score
    });

    // Log métrica individual
    await wandb.log({
      'score': score,
      'input_length': example.input.length,
      'output_length': response.length
    });
  }

  // Log tabla de resultados
  await wandb.log({
    'predictions': wandb.Table({
      columns: ['input', 'output', 'expected', 'score'],
      data: results.map(r => [r.input, r.output, r.expected, r.score])
    })
  });

  // Resumen final
  const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
  await wandb.log({'avg_score': avgScore});

  await wandb.finish();
}
\`\`\`

**Braintrust**

Braintrust se especializa en evaluación de LLMs con UI intuitiva:

\`\`\`python
from braintrust import Eval

def run_evaluation():
    eval = Eval(
        "RAG Pipeline",
        data=lambda: [
            {
                "input": "¿Qué es la fotosíntesis?",
                "expected": "Proceso por el cual plantas convierten luz en energía química"
            },
            # Más ejemplos...
        ],
        task=lambda input: your_rag_pipeline(input["input"]),
        scores=[
            # Scorer automático
            lambda output, expected: {
                "accuracy": semantic_similarity(output, expected)
            },
            # Scorer personalizado
            lambda output, expected: {
                "has_citations": 1 if "[" in output else 0
            }
        ]
    )

    results = eval.run()

    # Genera URL para revisar en Braintrust UI
    print(f"View results: {results.url}")
    return results
\`\`\`

**Custom Evaluation Pipelines**

Para control total, construye tu propio pipeline:

\`\`\`typescript
class EvaluationPipeline {
  constructor(
    private dataset: Dataset,
    private model: LLM,
    private evaluators: Evaluator[]
  ) {}

  async run(): Promise<EvaluationResults> {
    const results = [];

    for (const example of this.dataset.examples) {
      const startTime = Date.now();
      const output = await this.model.generate(example.input);
      const latency = Date.now() - startTime;

      const scores = await Promise.all(
        this.evaluators.map(evaluator =>
          evaluator.evaluate(output, example.expected)
        )
      );

      results.push({
        input: example.input,
        output,
        expected: example.expected,
        scores: Object.fromEntries(scores.map(s => [s.name, s.value])),
        latency
      });
    }

    return this.generateReport(results);
  }

  private generateReport(results: any[]): EvaluationResults {
    return {
      summary: this.computeSummaryStats(results),
      details: results,
      visualizations: this.createVisualizations(results),
      timestamp: new Date()
    };
  }
}
\`\`\`

Elige el framework según tu stack tecnológico y necesidades de integración.`,
      keyPoints: [
        'LangSmith integra evaluación con trazas completas, ideal si ya usas LangChain para desarrollo',
        'Weights & Biases ofrece tracking robusto de experimentos y visualizaciones ricas para comparar versiones',
        'Braintrust se especializa en evaluación de LLMs con UI intuitiva para revisar resultados detalladamente',
        'Pipelines custom dan control total sobre evaluadores, métricas y formato de reportes',
        'La elección del framework depende de tu stack tecnológico, tamaño de equipo y necesidades de integración',
      ],
    },
    {
      title: 'Regression Testing',
      content: `El regression testing asegura que cambios en tu sistema LLM no degraden comportamientos que funcionaban correctamente. Es crítico para mantener calidad a medida que evolucionas tu aplicación.

**¿Por qué es crítico en LLMs?**

Los sistemas LLM son especialmente susceptibles a regresiones porque:

- Cambios en prompts pueden afectar comportamientos inesperados
- Actualizar modelos (ej. gpt-4 → gpt-4-turbo) puede cambiar outputs
- Modificar estrategias de retrieval afecta qué contexto ve el modelo
- Ajustar temperatura u otros parámetros tiene efectos no lineales

Una regresión puede pasar desapercibida sin testing sistemático:

\`\`\`typescript
interface RegressionTest {
  id: string;
  category: string;
  input: any;
  expectedBehavior: {
    type: 'exact_match' | 'semantic_similarity' | 'contains' | 'custom';
    value: any;
    threshold?: number;
  };
  metadata: {
    addedDate: Date;
    reason: string; // Por qué se agregó este test
    lastFailure?: Date;
  };
}

const regressionTests: RegressionTest[] = [
  {
    id: 'test_001',
    category: 'greeting',
    input: {message: '¡Hola!'},
    expectedBehavior: {
      type: 'contains',
      value: ['hola', 'buenos días', 'saludos']
    },
    metadata: {
      addedDate: new Date('2024-01-15'),
      reason: 'El modelo dejó de responder saludos apropiadamente en v2.3'
    }
  },
  {
    id: 'test_002',
    category: 'factual_qa',
    input: {message: '¿Cuál es la capital de Francia?'},
    expectedBehavior: {
      type: 'semantic_similarity',
      value: 'París',
      threshold: 0.9
    },
    metadata: {
      addedDate: new Date('2024-01-20'),
      reason: 'Respuestas factuales básicas deben ser consistentes'
    }
  }
];
\`\`\`

**Golden Datasets**

Un golden dataset es una colección curada de ejemplos representativos con outputs esperados:

\`\`\`python
import json
from pathlib import Path
from typing import List, Dict

class GoldenDataset:
    def __init__(self, path: Path):
        self.path = path
        self.examples = self._load()

    def _load(self) -> List[Dict]:
        if not self.path.exists():
            return []
        with open(self.path, 'r') as f:
            return json.load(f)

    def add_example(self, input_data: dict, expected_output: dict, metadata: dict):
        """Agregar ejemplo validado manualmente"""
        self.examples.append({
            'input': input_data,
            'expected': expected_output,
            'metadata': {
                **metadata,
                'added_at': datetime.now().isoformat()
            }
        })
        self._save()

    def add_from_production(self, interaction_id: str):
        """Promover interacción de producción a golden dataset"""
        interaction = fetch_from_db(interaction_id)

        # Requiere aprobación humana
        if not human_approved(interaction):
            raise ValueError("Interaction must be human-approved")

        self.add_example(
            input_data=interaction.input,
            expected_output=interaction.output,
            metadata={
                'source': 'production',
                'interaction_id': interaction_id,
                'approved_by': interaction.approver
            }
        )

    def _save(self):
        with open(self.path, 'w') as f:
            json.dump(self.examples, f, indent=2)

# Estrategia de construcción incremental
dataset = GoldenDataset(Path('golden_dataset.json'))

# 1. Agregar casos importantes manualmente
dataset.add_example(
    input_data={'query': 'resetear contraseña'},
    expected_output={'intent': 'password_reset', 'confidence': 0.95},
    metadata={'category': 'authentication', 'priority': 'high'}
)

# 2. Promover buenos ejemplos de producción
dataset.add_from_production('interaction_xyz_123')

# 3. Agregar casos de fallos detectados
dataset.add_example(
    input_data={'query': 'Quiero hablar con un humano'},
    expected_output={'should_escalate': True},
    metadata={'category': 'escalation', 'reason': 'Failed in v3.1'}
)
\`\`\`

**CI/CD para evaluación**

Integra evaluación en tu pipeline de CI/CD:

\`\`\`yaml
# .github/workflows/llm-evaluation.yml
name: LLM Regression Tests

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  evaluate:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Run regression tests
        env:
          OPENAI_API_KEY: \${{ secrets.OPENAI_API_KEY }}
        run: npm run eval:regression

      - name: Check for regressions
        run: |
          node scripts/check-regressions.js \
            --baseline results/baseline.json \
            --current results/current.json \
            --threshold 0.05  # 5% degradación máxima permitida

      - name: Upload results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: evaluation-results
          path: results/

      - name: Comment PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const results = require('./results/summary.json');
            const comment = generateEvaluationComment(results);
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
\`\`\`

\`\`\`typescript
// scripts/check-regressions.ts
function checkRegressions(baseline: Results, current: Results, threshold: number) {
  const regressions = [];

  for (const test of baseline.tests) {
    const currentTest = current.tests.find(t => t.id === test.id);
    if (!currentTest) {
      regressions.push({test: test.id, reason: 'Test missing in current run'});
      continue;
    }

    const scoreDelta = test.score - currentTest.score;
    if (scoreDelta > threshold) {
      regressions.push({
        test: test.id,
        baseline: test.score,
        current: currentTest.score,
        delta: scoreDelta
      });
    }
  }

  if (regressions.length > 0) {
    console.error('Regressions detected:', regressions);
    process.exit(1);
  }
}
\`\`\`

El regression testing convierte la evaluación de un proceso manual a uno automatizado y continuo.`,
      keyPoints: [
        'Los sistemas LLM son especialmente susceptibles a regresiones por cambios en prompts, modelos o parámetros',
        'Regression tests capturan comportamientos esperados con diferentes tipos de validación: exact match, similarity, contains',
        'Golden datasets son colecciones curadas de ejemplos representativos que crecen incrementalmente',
        'Integrar evaluación en CI/CD detecta regresiones antes de llegar a producción',
        'Establece umbrales de degradación aceptables y falla builds que los excedan',
      ],
    },
  ],
};

export const agentsFundamentals = {
  sections: [
    {
      title: '¿Qué son los Agentes LLM?',
      content: `Los agentes LLM son sistemas que pueden razonar sobre tareas complejas, planificar pasos de acción, usar herramientas y ejecutar esos planes de manera autónoma. A diferencia de simples cadenas de prompts, los agentes pueden adaptarse dinámicamente basándose en resultados intermedios.

**Definición y arquitectura**

Un agente LLM típico consta de varios componentes:

\`\`\`typescript
interface Agent {
  llm: LanguageModel;              // El cerebro del agente
  tools: Tool[];                    // Herramientas disponibles
  memory: ConversationMemory;       // Contexto e historia
  planner: TaskPlanner;             // Estrategia de descomposición
  executor: ActionExecutor;         // Ejecuta acciones planificadas
  controller: ExecutionController;  // Decide cuándo parar
}

interface Tool {
  name: string;
  description: string;
  parameters: JSONSchema;
  execute: (params: any) => Promise<any>;
}
\`\`\`

El ciclo de ejecución básico:

1. **Recibir tarea**: El usuario da un objetivo de alto nivel
2. **Razonar**: El LLM decide qué hacer basándose en tarea, herramientas disponibles y contexto
3. **Actuar**: Ejecuta la acción seleccionada (llamar una herramienta, generar respuesta, etc.)
4. **Observar**: Recibe resultado de la acción
5. **Repetir**: Vuelve al paso 2 hasta completar la tarea o alcanzar límite de iteraciones

**El patrón ReAct**

ReAct (Reasoning + Acting) es uno de los patrones más efectivos para agentes:

\`\`\`python
def react_agent(task: str, tools: list[Tool], max_iterations: int = 10):
    """
    Implementación básica de ReAct
    """
    history = [f"Task: {task}"]

    for i in range(max_iterations):
        # Thought: El agente razona sobre qué hacer
        prompt = f"""
{chr(10).join(history)}

Tienes acceso a estas herramientas:
{format_tools(tools)}

Thought: ¿Qué debo hacer ahora?
Action: [nombre_herramienta]
Action Input: [parámetros JSON]
"""

        response = llm.generate(prompt)
        thought = extract_thought(response)
        action = extract_action(response)
        action_input = extract_action_input(response)

        history.append(f"Thought: {thought}")
        history.append(f"Action: {action}")
        history.append(f"Action Input: {action_input}")

        # Ejecutar acción
        if action == "Final Answer":
            return action_input

        tool = find_tool(tools, action)
        observation = tool.execute(action_input)

        history.append(f"Observation: {observation}")

    return "Max iterations reached"
\`\`\`

**Agents vs Chains**

| Aspecto | Chains | Agents |
|---------|--------|--------|
| **Flujo** | Predefinido y estático | Dinámico y adaptable |
| **Decisiones** | Hardcoded | El LLM decide en runtime |
| **Complejidad** | Mejor para tareas simples | Maneja tareas complejas |
| **Predictibilidad** | Alta | Menor (puede tomar caminos inesperados) |
| **Costo** | Menor (menos llamadas LLM) | Mayor (múltiples llamadas) |
| **Casos de uso** | RAG simple, clasificación | Research, automatización multi-paso |

**Cuándo usar agentes**

Los agentes son apropiados cuando:

- La tarea requiere múltiples pasos que dependen de resultados anteriores
- No conoces de antemano todos los pasos necesarios
- Necesitas acceder a múltiples fuentes de información o APIs
- La tarea requiere razonamiento adaptativo

Ejemplo: "Investiga las últimas tendencias en IA y crea un reporte comparativo" requiere un agente porque necesita decidir qué buscar, evaluar resultados, buscar más información si es insuficiente, y sintetizar hallazgos.

**Limitaciones de agentes**

- **Costos**: Múltiples llamadas al LLM aumentan costos significativamente
- **Latencia**: Cada ciclo thought→action→observation agrega latencia
- **Fiabilidad**: Más pasos = más puntos de fallo potenciales
- **Debugging**: Comportamiento no determinístico dificulta debugging
- **Control**: El agente puede tomar acciones no anticipadas`,
      keyPoints: [
        'Los agentes LLM razonan, planifican y ejecutan tareas complejas de manera autónoma usando herramientas disponibles',
        'El patrón ReAct (Reasoning + Acting) alterna entre pensar qué hacer y ejecutar acciones basándose en observaciones',
        'Los agentes se diferencian de chains en que el flujo es dinámico y el LLM decide en runtime qué hacer',
        'Son apropiados para tareas multi-paso con dependencias entre pasos o cuando los pasos no se conocen de antemano',
        'Tienen trade-offs importantes: mayor costo, latencia y complejidad de debugging vs mayor flexibilidad y capacidad',
      ],
    },
    {
      title: 'Function Calling',
      content: `Function calling (o tool use) permite que los LLMs invoquen funciones externas de manera estructurada. Es el mecanismo fundamental que habilita a los agentes para interactuar con el mundo exterior.

**OpenAI Function Calling**

OpenAI introdujo function calling como una forma nativa de que los modelos puedan solicitar llamadas a funciones:

\`\`\`typescript
import OpenAI from 'openai';

const openai = new OpenAI();

// Definir funciones disponibles
const tools = [
  {
    type: "function",
    function: {
      name: "get_weather",
      description: "Obtiene el clima actual para una ubicación",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: "Ciudad y país, ej. 'Madrid, España'"
          },
          unit: {
            type: "string",
            enum: ["celsius", "fahrenheit"],
            description: "Unidad de temperatura"
          }
        },
        required: ["location"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "search_database",
      description: "Busca información en la base de datos de productos",
      parameters: {
        type: "object",
        properties: {
          query: {type: "string", description: "Término de búsqueda"},
          category: {type: "string", description: "Categoría de producto"},
          max_results: {type: "number", default: 10}
        },
        required: ["query"]
      }
    }
  }
];

async function runAgent(userMessage: string) {
  const messages = [{role: "user", content: userMessage}];

  while (true) {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: messages,
      tools: tools,
      tool_choice: "auto" // El modelo decide si usar herramientas
    });

    const message = response.choices[0].message;
    messages.push(message);

    // Si el modelo quiere llamar a una función
    if (message.tool_calls) {
      for (const toolCall of message.tool_calls) {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);

        console.log(\`Calling: \${functionName}(\${JSON.stringify(functionArgs)})\`);

        // Ejecutar la función
        const result = await executeTool(functionName, functionArgs);

        // Agregar resultado a la conversación
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(result)
        });
      }
    } else {
      // El modelo generó una respuesta final
      return message.content;
    }
  }
}

// Ejecutar
const result = await runAgent(
  "¿Qué clima hace en Barcelona y recomiéndame productos apropiados?"
);
\`\`\`

**Anthropic Tool Use**

Anthropic usa un enfoque similar pero con algunas diferencias:

\`\`\`python
import anthropic
import json

client = anthropic.Anthropic()

tools = [
    {
        "name": "get_stock_price",
        "description": "Obtiene el precio actual de una acción",
        "input_schema": {
            "type": "object",
            "properties": {
                "ticker": {
                    "type": "string",
                    "description": "Símbolo bursátil, ej. 'AAPL' para Apple"
                }
            },
            "required": ["ticker"]
        }
    },
    {
        "name": "calculate_percentage_change",
        "description": "Calcula el cambio porcentual entre dos valores",
        "input_schema": {
            "type": "object",
            "properties": {
                "old_value": {"type": "number"},
                "new_value": {"type": "number"}
            },
            "required": ["old_value", "new_value"]
        }
    }
]

def process_tool_call(tool_name: str, tool_input: dict):
    if tool_name == "get_stock_price":
        return get_stock_price_from_api(tool_input["ticker"])
    elif tool_name == "calculate_percentage_change":
        old = tool_input["old_value"]
        new = tool_input["new_value"]
        return ((new - old) / old) * 100
    else:
        return f"Unknown tool: {tool_name}"

def run_agent_with_tools(user_message: str):
    messages = [{"role": "user", "content": user_message}]

    while True:
        response = client.messages.create(
            model="claude-opus-4-5-20251101",
            max_tokens=4096,
            tools=tools,
            messages=messages
        )

        print(f"Stop reason: {response.stop_reason}")

        # Si Claude quiere usar una herramienta
        if response.stop_reason == "tool_use":
            # Agregar respuesta de Claude
            messages.append({"role": "assistant", "content": response.content})

            # Procesar cada tool use
            tool_results = []
            for block in response.content:
                if block.type == "tool_use":
                    tool_name = block.name
                    tool_input = block.input

                    print(f"Using tool: {tool_name}")
                    print(f"Input: {tool_input}")

                    result = process_tool_call(tool_name, tool_input)

                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": str(result)
                    })

            # Enviar resultados a Claude
            messages.append({"role": "user", "content": tool_results})
        else:
            # Claude generó respuesta final
            final_response = next(
                (block.text for block in response.content if hasattr(block, "text")),
                None
            )
            return final_response

result = run_agent_with_tools(
    "¿Cuál es el precio de AAPL y cómo ha cambiado desde ayer que estaba en $180?"
)
print(result)
\`\`\`

**Diseño de Tool Schemas**

Schemas bien diseñados son críticos para que el modelo use herramientas correctamente:

\`\`\`typescript
// ❌ Schema vago
{
  name: "search",
  description: "Busca cosas",
  parameters: {
    type: "object",
    properties: {
      query: {type: "string"}
    }
  }
}

// ✅ Schema específico y descriptivo
{
  name: "search_technical_documentation",
  description: "Busca en documentación técnica de la API. Usa esto cuando el usuario pregunta sobre endpoints, parámetros o comportamiento de la API. NO uses esto para preguntas generales.",
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Término de búsqueda. Sé específico. Ejemplo: 'POST /users endpoint' o 'autenticación OAuth'"
      },
      section: {
        type: "string",
        enum: ["authentication", "endpoints", "webhooks", "errors"],
        description: "Sección de la documentación donde buscar"
      },
      max_results: {
        type: "number",
        description: "Número máximo de resultados a retornar",
        default: 5,
        minimum: 1,
        maximum: 20
      }
    },
    required: ["query"]
  }
}
\`\`\`

**Validación de inputs**

Siempre valida inputs antes de ejecutar herramientas:

\`\`\`typescript
import { z } from 'zod';

const GetWeatherSchema = z.object({
  location: z.string().min(1),
  unit: z.enum(['celsius', 'fahrenheit']).default('celsius')
});

async function executeTool(name: string, args: unknown) {
  if (name === 'get_weather') {
    try {
      const validated = GetWeatherSchema.parse(args);
      return await getWeather(validated.location, validated.unit);
    } catch (error) {
      return {
        error: "Invalid parameters",
        details: error.errors
      };
    }
  }

  throw new Error(\`Unknown tool: \${name}\`);
}
\`\`\`

Function calling transforma LLMs de generadores de texto a sistemas que pueden ejecutar acciones en el mundo real.`,
      keyPoints: [
        'Function calling permite que LLMs soliciten llamadas a funciones de manera estructurada usando schemas JSON',
        'OpenAI y Anthropic tienen implementaciones similares pero con diferencias en formato de mensajes y stop reasons',
        'Schemas bien diseñados con descripciones claras y específicas son críticos para uso correcto de herramientas',
        'Siempre valida inputs de herramientas antes de ejecutarlas para prevenir errores y vulnerabilidades',
        'El loop agent típico: usuario → LLM decide herramienta → ejecuta → LLM procesa resultado → repite hasta respuesta final',
      ],
    },
    {
      title: 'Herramientas Comunes',
      content: `Los agentes se vuelven verdaderamente poderosos cuando tienen acceso a herramientas útiles. Aquí exploramos las categorías más comunes y cómo implementarlas.

**Web Search**

Permite al agente buscar información actualizada en internet:

\`\`\`python
import requests
from typing import List, Dict

class WebSearchTool:
    def __init__(self, api_key: str, engine: str = "google"):
        self.api_key = api_key
        self.engine = engine

    def search(self, query: str, num_results: int = 5) -> List[Dict]:
        """
        Busca en la web y retorna resultados estructurados
        """
        if self.engine == "google":
            url = "https://www.googleapis.com/customsearch/v1"
            params = {
                "key": self.api_key,
                "q": query,
                "num": num_results
            }
        elif self.engine == "brave":
            url = "https://api.search.brave.com/res/v1/web/search"
            params = {"q": query, "count": num_results}

        response = requests.get(url, params=params)
        response.raise_for_status()

        results = []
        for item in response.json().get("items", [])[:num_results]:
            results.append({
                "title": item.get("title"),
                "snippet": item.get("snippet"),
                "url": item.get("link")
            })

        return results

    def to_tool_definition(self):
        return {
            "name": "web_search",
            "description": "Busca información actual en internet. Útil para preguntas sobre eventos recientes, noticias o información que cambia frecuentemente.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Consulta de búsqueda. Sé específico."
                    },
                    "num_results": {
                        "type": "number",
                        "description": "Número de resultados a retornar",
                        "default": 5
                    }
                },
                "required": ["query"]
            }
        }

# Uso
search_tool = WebSearchTool(api_key="your-key")
results = search_tool.search("latest developments in quantum computing 2024")
\`\`\`

**Code Execution**

Permite ejecutar código de manera segura (Python, JavaScript, etc.):

\`\`\`typescript
import { VM } from 'vm2';
import { PythonShell } from 'python-shell';

class CodeExecutionTool {
  async executePython(code: string, timeout: number = 5000): Promise<any> {
    try {
      const options = {
        mode: 'text' as const,
        pythonOptions: ['-u'],
        scriptPath: '/tmp',
        args: []
      };

      // Escribir código a archivo temporal
      const fs = require('fs');
      const tempFile = \`/tmp/exec_\${Date.now()}.py\`;
      fs.writeFileSync(tempFile, code);

      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Execution timeout'));
        }, timeout);

        PythonShell.run(tempFile, options, (err, results) => {
          clearTimeout(timeoutId);
          fs.unlinkSync(tempFile);

          if (err) reject(err);
          else resolve(results?.join('\n'));
        });
      });
    } catch (error) {
      return { error: error.message };
    }
  }

  async executeJavaScript(code: string, timeout: number = 5000): Promise<any> {
    const vm = new VM({
      timeout: timeout,
      sandbox: {
        console: {
          log: (...args) => args.join(' ')
        }
      }
    });

    try {
      const result = vm.run(code);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  toToolDefinition() {
    return {
      name: "execute_code",
      description: "Ejecuta código Python o JavaScript de manera segura. Útil para cálculos, análisis de datos o transformaciones complejas.",
      parameters: {
        type: "object",
        properties: {
          language: {
            type: "string",
            enum: ["python", "javascript"],
            description: "Lenguaje de programación"
          },
          code: {
            type: "string",
            description: "Código a ejecutar"
          }
        },
        required: ["language", "code"]
      }
    };
  }
}
\`\`\`

**Database Queries**

Permite consultar bases de datos de manera segura:

\`\`\`typescript
import { PrismaClient } from '@prisma/client';

class DatabaseTool {
  private prisma: PrismaClient;
  private allowedTables: Set<string>;

  constructor(allowedTables: string[]) {
    this.prisma = new PrismaClient();
    this.allowedTables = new Set(allowedTables);
  }

  async query(
    table: string,
    operation: 'findMany' | 'findFirst' | 'count',
    filters?: any
  ): Promise<any> {
    // Validar que la tabla está permitida
    if (!this.allowedTables.has(table)) {
      throw new Error(\`Table \${table} not allowed\`);
    }

    // Solo permitir operaciones de lectura
    if (!['findMany', 'findFirst', 'count'].includes(operation)) {
      throw new Error(\`Operation \${operation} not allowed\`);
    }

    try {
      const result = await (this.prisma as any)[table][operation](filters);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  toToolDefinition() {
    return {
      name: "query_database",
      description: \`Consulta la base de datos. Tablas disponibles: \${Array.from(this.allowedTables).join(', ')}. SOLO operaciones de lectura.\`,
      parameters: {
        type: "object",
        properties: {
          table: {
            type: "string",
            enum: Array.from(this.allowedTables),
            description: "Tabla a consultar"
          },
          operation: {
            type: "string",
            enum: ["findMany", "findFirst", "count"],
            description: "Tipo de consulta"
          },
          filters: {
            type: "object",
            description: "Filtros para la consulta (formato Prisma)"
          }
        },
        required: ["table", "operation"]
      }
    };
  }
}

// Uso
const dbTool = new DatabaseTool(['users', 'products', 'orders']);
const users = await dbTool.query('users', 'findMany', {
  where: { status: 'active' },
  take: 10
});
\`\`\`

**API Calls**

Permite llamar a APIs externas:

\`\`\`python
import requests
from typing import Dict, Any, Optional

class APICallTool:
    def __init__(self, base_url: str, auth_token: Optional[str] = None):
        self.base_url = base_url
        self.auth_token = auth_token

    def call(
        self,
        endpoint: str,
        method: str = "GET",
        params: Optional[Dict] = None,
        body: Optional[Dict] = None
    ) -> Any:
        """
        Realiza llamada HTTP a API
        """
        url = f"{self.base_url}/{endpoint.lstrip('/')}"

        headers = {}
        if self.auth_token:
            headers["Authorization"] = f"Bearer {self.auth_token}"

        # Solo permitir métodos seguros por defecto
        if method not in ["GET", "POST"]:
            raise ValueError(f"Method {method} not allowed")

        try:
            response = requests.request(
                method=method,
                url=url,
                params=params,
                json=body,
                headers=headers,
                timeout=10
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"error": str(e)}

    def to_tool_definition(self):
        return {
            "name": "call_api",
            "description": f"Realiza llamadas a la API en {self.base_url}. Útil para obtener datos externos o realizar acciones en sistemas remotos.",
            "parameters": {
                "type": "object",
                "properties": {
                    "endpoint": {
                        "type": "string",
                        "description": "Endpoint de la API (ej. '/users/123')"
                    },
                    "method": {
                        "type": "string",
                        "enum": ["GET", "POST"],
                        "default": "GET"
                    },
                    "params": {
                        "type": "object",
                        "description": "Query parameters"
                    },
                    "body": {
                        "type": "object",
                        "description": "Request body (para POST)"
                    }
                },
                "required": ["endpoint"]
            }
        }

# Uso
api_tool = APICallTool("https://api.example.com", auth_token="token")
data = api_tool.call("/weather", params={"city": "Madrid"})
\`\`\`

**Consideraciones de seguridad**

- Siempre validar y sanitizar inputs
- Usar sandboxing para ejecución de código
- Limitar operaciones permitidas (ej. solo lectura en DB)
- Implementar rate limiting y timeouts
- Registrar todas las llamadas a herramientas para auditoría`,
      keyPoints: [
        'Web search permite acceder a información actualizada y externa al conocimiento base del modelo',
        'Code execution habilita cálculos complejos y análisis de datos, pero requiere sandboxing robusto',
        'Database tools deben limitarse a operaciones de lectura y validar tablas/queries permitidas',
        'API calls expanden capacidades del agente pero necesitan autenticación segura y manejo de errores',
        'Todas las herramientas requieren validación estricta de inputs, timeouts y logging para seguridad y debugging',
      ],
    },
    {
      title: 'Frameworks de Agentes',
      content: `Los frameworks de agentes proporcionan abstracciones y utilidades para construir agentes robustos sin implementar todo desde cero. Cada framework tiene diferentes filosofías y casos de uso ideales.

**LangChain Agents**

LangChain ofrece una de las bibliotecas más completas para construir agentes:

\`\`\`python
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain_openai import ChatOpenAI
from langchain.tools import Tool
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_community.tools import DuckDuckGoSearchRun

# Definir herramientas
search = DuckDuckGoSearchRun()

def calculator(expression: str) -> str:
    """Evalúa expresiones matemáticas"""
    try:
        return str(eval(expression))
    except Exception as e:
        return f"Error: {e}"

tools = [
    Tool(
        name="Search",
        func=search.run,
        description="Busca información en internet. Útil para preguntas sobre eventos actuales o información general."
    ),
    Tool(
        name="Calculator",
        func=calculator,
        description="Evalúa expresiones matemáticas. Input debe ser una expresión Python válida."
    )
]

# Crear prompt template
prompt = ChatPromptTemplate.from_messages([
    ("system", "Eres un asistente útil que puede buscar información y hacer cálculos."),
    ("human", "{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad"),
])

# Crear agente
llm = ChatOpenAI(model="gpt-4-turbo", temperature=0)
agent = create_openai_tools_agent(llm, tools, prompt)

# Crear executor
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,
    max_iterations=10,
    handle_parsing_errors=True
)

# Ejecutar
result = agent_executor.invoke({
    "input": "¿Cuál es la población de Tokio y cuánto es eso multiplicado por 3?"
})

print(result["output"])
\`\`\`

LangChain también soporta diferentes tipos de agentes:

\`\`\`python
from langchain.agents import AgentType, initialize_agent

# ReAct agent (Reasoning + Acting)
react_agent = initialize_agent(
    tools=tools,
    llm=llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True
)

# Conversational agent (mantiene memoria)
from langchain.memory import ConversationBufferMemory

memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)

conversational_agent = initialize_agent(
    tools=tools,
    llm=llm,
    agent=AgentType.CHAT_CONVERSATIONAL_REACT_DESCRIPTION,
    memory=memory,
    verbose=True
)

# Structured chat agent (mejor para múltiples inputs)
structured_agent = initialize_agent(
    tools=tools,
    llm=llm,
    agent=AgentType.STRUCTURED_CHAT_ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True
)
\`\`\`

**LlamaIndex Agents**

LlamaIndex se enfoca en agentes para trabajar con datos y documentos:

\`\`\`typescript
import { OpenAI } from 'llamaindex';
import { OpenAIAgent, QueryEngineTool } from 'llamaindex';

// Crear query engines para diferentes fuentes de datos
const salesEngine = await createQueryEngine('./sales_data');
const customerEngine = await createQueryEngine('./customer_data');
const productEngine = await createQueryEngine('./product_catalog');

// Convertir a herramientas
const tools = [
  new QueryEngineTool({
    queryEngine: salesEngine,
    metadata: {
      name: 'sales_data',
      description: 'Contiene datos de ventas mensuales, revenue y tendencias. Usa esto para preguntas sobre performance de ventas.'
    }
  }),
  new QueryEngineTool({
    queryEngine: customerEngine,
    metadata: {
      name: 'customer_data',
      description: 'Información de clientes, feedback y satisfaction scores.'
    }
  }),
  new QueryEngineTool({
    queryEngine: productEngine,
    metadata: {
      name: 'product_catalog',
      description: 'Catálogo de productos con especificaciones, precios y disponibilidad.'
    }
  })
];

// Crear agente
const llm = new OpenAI({ model: 'gpt-4-turbo', temperature: 0 });

const agent = new OpenAIAgent({
  tools,
  llm,
  systemPrompt: 'Eres un analista de negocio que ayuda a responder preguntas sobre ventas, clientes y productos.'
});

// Usar agente
const response = await agent.chat({
  message: '¿Cuáles fueron los productos más vendidos el mes pasado y qué feedback han recibido?'
});

console.log(response.response);
\`\`\`

**Claude SDK (Anthropic)**

El SDK oficial de Anthropic para construir agentes:

\`\`\`typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

interface Tool {
  name: string;
  description: string;
  input_schema: object;
  execute: (input: any) => Promise<any>;
}

class ClaudeAgent {
  private tools: Tool[];
  private messages: any[];

  constructor(tools: Tool[]) {
    this.tools = tools;
    this.messages = [];
  }

  async run(userMessage: string, maxIterations: number = 10): Promise<string> {
    this.messages.push({
      role: 'user',
      content: userMessage
    });

    for (let i = 0; i < maxIterations; i++) {
      const response = await client.messages.create({
        model: 'claude-opus-4-5-20251101',
        max_tokens: 4096,
        tools: this.tools.map(t => ({
          name: t.name,
          description: t.description,
          input_schema: t.input_schema
        })),
        messages: this.messages
      });

      // Agregar respuesta de Claude
      this.messages.push({
        role: 'assistant',
        content: response.content
      });

      // Si Claude quiere usar herramientas
      if (response.stop_reason === 'tool_use') {
        const toolResults = [];

        for (const block of response.content) {
          if (block.type === 'tool_use') {
            const tool = this.tools.find(t => t.name === block.name);
            if (!tool) {
              toolResults.push({
                type: 'tool_result',
                tool_use_id: block.id,
                content: JSON.stringify({ error: 'Tool not found' })
              });
              continue;
            }

            try {
              const result = await tool.execute(block.input);
              toolResults.push({
                type: 'tool_result',
                tool_use_id: block.id,
                content: JSON.stringify(result)
              });
            } catch (error) {
              toolResults.push({
                type: 'tool_result',
                tool_use_id: block.id,
                content: JSON.stringify({ error: error.message }),
                is_error: true
              });
            }
          }
        }

        this.messages.push({
          role: 'user',
          content: toolResults
        });
      } else {
        // Respuesta final
        const textBlock = response.content.find(b => b.type === 'text');
        return textBlock ? textBlock.text : 'No response';
      }
    }

    return 'Max iterations reached';
  }
}

// Uso
const tools: Tool[] = [
  {
    name: 'get_user_info',
    description: 'Obtiene información de un usuario',
    input_schema: {
      type: 'object',
      properties: {
        user_id: { type: 'string' }
      },
      required: ['user_id']
    },
    execute: async (input) => {
      return await fetchUserFromDB(input.user_id);
    }
  }
];

const agent = new ClaudeAgent(tools);
const result = await agent.run('Muéstrame la información del usuario user_123');
\`\`\`

**Comparación de frameworks**

| Framework | Mejor para | Pros | Contras |
|-----------|-----------|------|---------|
| **LangChain** | Aplicaciones complejas, múltiples integraciones | Ecosistema grande, muchas herramientas pre-built | Puede ser complejo, documentación a veces desactualizada |
| **LlamaIndex** | RAG avanzado, trabajo con documentos | Excelente para data, query engines sofisticados | Menos general que LangChain |
| **Claude SDK** | Control fino, aplicaciones production-grade | Directo, bien documentado, TypeScript nativo | Menos abstracciones, más código manual |

Elige según tu stack, complejidad y qué tan importante es el control vs conveniencia.`,
      keyPoints: [
        'LangChain ofrece el ecosistema más completo con múltiples tipos de agentes (ReAct, conversational, structured)',
        'LlamaIndex se especializa en agentes para trabajar con datos y documentos usando query engines',
        'Claude SDK proporciona control fino y es ideal para aplicaciones production-grade con TypeScript',
        'Cada framework tiene trade-offs entre conveniencia/abstracciones y control/flexibilidad',
        'La elección depende de tu caso de uso: complejidad, tipo de datos, stack tecnológico y experiencia del equipo',
      ],
    },
    {
      title: 'Manejo de Estado',
      content: `El manejo de estado es crucial en agentes porque necesitan mantener contexto a través de múltiples pasos de razonamiento y ejecución. Un estado bien gestionado permite agentes más coherentes y eficientes.

**Conversation Memory**

La memoria conversacional mantiene el historial de interacciones:

\`\`\`python
from typing import List, Dict
from collections import deque

class ConversationMemory:
    def __init__(self, max_messages: int = 10):
        self.messages: deque = deque(maxlen=max_messages)
        self.max_messages = max_messages

    def add_user_message(self, content: str):
        self.messages.append({
            "role": "user",
            "content": content,
            "timestamp": datetime.now().isoformat()
        })

    def add_assistant_message(self, content: str):
        self.messages.append({
            "role": "assistant",
            "content": content,
            "timestamp": datetime.now().isoformat()
        })

    def add_tool_result(self, tool_name: str, result: any):
        self.messages.append({
            "role": "tool",
            "tool_name": tool_name,
            "content": str(result),
            "timestamp": datetime.now().isoformat()
        })

    def get_messages(self) -> List[Dict]:
        return list(self.messages)

    def get_summary(self, llm) -> str:
        """
        Si la conversación es muy larga, genera un resumen
        """
        if len(self.messages) < self.max_messages:
            return None

        conversation_text = "\n".join([
            f"{msg['role']}: {msg['content']}"
            for msg in self.messages
        ])

        summary_prompt = f"""Resume la siguiente conversación en 2-3 oraciones, capturando los puntos clave:

{conversation_text}

Resumen:"""

        summary = llm.generate(summary_prompt)
        return summary

    def clear(self):
        self.messages.clear()

# Uso con sliding window
class SlidingWindowMemory(ConversationMemory):
    def __init__(self, max_messages: int = 10, summary_threshold: int = 8):
        super().__init__(max_messages)
        self.summary_threshold = summary_threshold
        self.summary = None

    def add_user_message(self, content: str):
        # Si nos acercamos al límite, crear resumen
        if len(self.messages) >= self.summary_threshold and not self.summary:
            self.summary = self.get_summary(llm)
            # Mantener solo los mensajes más recientes
            recent = list(self.messages)[-3:]
            self.messages.clear()
            self.messages.extend(recent)

        super().add_user_message(content)

    def get_context(self) -> str:
        """Retorna contexto completo: resumen + mensajes recientes"""
        parts = []
        if self.summary:
            parts.append(f"Resumen de conversación previa: {self.summary}")
        parts.extend([
            f"{msg['role']}: {msg['content']}"
            for msg in self.messages
        ])
        return "\n".join(parts)
\`\`\`

**Execution State**

El estado de ejecución rastrea el progreso actual del agente:

\`\`\`typescript
interface ExecutionState {
  taskId: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  currentStep: number;
  totalSteps: number;
  plan: string[];
  executedActions: Action[];
  intermediateResults: Map<string, any>;
  startTime: Date;
  lastUpdateTime: Date;
}

interface Action {
  step: number;
  type: 'tool_call' | 'thought' | 'answer';
  toolName?: string;
  input?: any;
  output?: any;
  error?: string;
  timestamp: Date;
}

class AgentExecutionState {
  private state: ExecutionState;

  constructor(taskId: string) {
    this.state = {
      taskId,
      status: 'running',
      currentStep: 0,
      totalSteps: 0,
      plan: [],
      executedActions: [],
      intermediateResults: new Map(),
      startTime: new Date(),
      lastUpdateTime: new Date()
    };
  }

  setPlan(steps: string[]) {
    this.state.plan = steps;
    this.state.totalSteps = steps.length;
    this.updateTimestamp();
  }

  addAction(action: Omit<Action, 'timestamp'>) {
    this.state.executedActions.push({
      ...action,
      timestamp: new Date()
    });
    this.state.currentStep = action.step;
    this.updateTimestamp();
  }

  saveIntermediateResult(key: string, value: any) {
    this.state.intermediateResults.set(key, value);
    this.updateTimestamp();
  }

  getIntermediateResult(key: string): any {
    return this.state.intermediateResults.get(key);
  }

  markCompleted() {
    this.state.status = 'completed';
    this.updateTimestamp();
  }

  markFailed(error: string) {
    this.state.status = 'failed';
    this.state.executedActions[this.state.executedActions.length - 1].error = error;
    this.updateTimestamp();
  }

  getProgress(): number {
    if (this.state.totalSteps === 0) return 0;
    return this.state.currentStep / this.state.totalSteps;
  }

  serialize(): string {
    return JSON.stringify({
      ...this.state,
      intermediateResults: Array.from(this.state.intermediateResults.entries())
    });
  }

  static deserialize(data: string): AgentExecutionState {
    const parsed = JSON.parse(data);
    const instance = new AgentExecutionState(parsed.taskId);
    instance.state = {
      ...parsed,
      intermediateResults: new Map(parsed.intermediateResults),
      startTime: new Date(parsed.startTime),
      lastUpdateTime: new Date(parsed.lastUpdateTime)
    };
    return instance;
  }

  private updateTimestamp() {
    this.state.lastUpdateTime = new Date();
  }
}
\`\`\`

**Checkpointing**

Checkpointing permite pausar y reanudar agentes, crítico para tareas largas:

\`\`\`python
import json
import redis
from typing import Optional

class CheckpointManager:
    def __init__(self, redis_client: redis.Redis):
        self.redis = redis_client
        self.checkpoint_prefix = "agent_checkpoint:"

    def save_checkpoint(
        self,
        task_id: str,
        state: AgentExecutionState,
        memory: ConversationMemory
    ):
        """
        Guarda un checkpoint completo del agente
        """
        checkpoint = {
            "state": state.serialize(),
            "memory": {
                "messages": memory.get_messages(),
                "summary": getattr(memory, 'summary', None)
            },
            "timestamp": datetime.now().isoformat()
        }

        key = f"{self.checkpoint_prefix}{task_id}"
        self.redis.set(key, json.dumps(checkpoint))

        # Opcional: guardar también en DB permanente
        self.save_to_database(task_id, checkpoint)

    def load_checkpoint(self, task_id: str) -> Optional[Dict]:
        """
        Carga un checkpoint guardado
        """
        key = f"{self.checkpoint_prefix}{task_id}"
        data = self.redis.get(key)

        if not data:
            # Intentar cargar de DB permanente
            return self.load_from_database(task_id)

        return json.loads(data)

    def resume_agent(self, task_id: str, agent_class):
        """
        Reanuda un agente desde checkpoint
        """
        checkpoint = self.load_checkpoint(task_id)
        if not checkpoint:
            raise ValueError(f"No checkpoint found for task {task_id}")

        # Reconstruir estado
        state = AgentExecutionState.deserialize(checkpoint["state"])

        # Reconstruir memoria
        memory = ConversationMemory()
        for msg in checkpoint["memory"]["messages"]:
            memory.messages.append(msg)
        if checkpoint["memory"]["summary"]:
            memory.summary = checkpoint["memory"]["summary"]

        # Crear agente con estado restaurado
        agent = agent_class(state=state, memory=memory)

        return agent

    def cleanup_old_checkpoints(self, max_age_hours: int = 24):
        """
        Limpia checkpoints antiguos
        """
        pattern = f"{self.checkpoint_prefix}*"
        for key in self.redis.scan_iter(pattern):
            data = json.loads(self.redis.get(key))
            checkpoint_time = datetime.fromisoformat(data["timestamp"])
            age = datetime.now() - checkpoint_time

            if age.total_seconds() > max_age_hours * 3600:
                self.redis.delete(key)

# Uso en agente
class ResumableAgent:
    def __init__(
        self,
        task_id: str,
        checkpoint_manager: CheckpointManager,
        state: Optional[AgentExecutionState] = None,
        memory: Optional[ConversationMemory] = None
    ):
        self.task_id = task_id
        self.checkpoint_manager = checkpoint_manager
        self.state = state or AgentExecutionState(task_id)
        self.memory = memory or ConversationMemory()
        self.checkpoint_interval = 5  # Guardar cada 5 acciones

    async def run(self, task: str):
        try:
            for step in range(self.state.currentStep, len(self.state.plan)):
                # Ejecutar paso
                result = await self.execute_step(step)

                # Guardar checkpoint periódicamente
                if step % self.checkpoint_interval == 0:
                    self.checkpoint_manager.save_checkpoint(
                        self.task_id,
                        self.state,
                        self.memory
                    )

            self.state.markCompleted()
            return self.state.get_final_result()

        except Exception as e:
            # Guardar checkpoint antes de fallar
            self.checkpoint_manager.save_checkpoint(
                self.task_id,
                self.state,
                self.memory
            )
            raise
\`\`\`

El manejo robusto de estado hace que los agentes sean más confiables, debuggeables y capaces de manejar tareas largas.`,
      keyPoints: [
        'Conversation memory mantiene historial con estrategias como sliding window y summarization para gestionar contexto largo',
        'Execution state rastrea progreso actual, plan, acciones ejecutadas y resultados intermedios del agente',
        'Checkpointing permite pausar y reanudar agentes, crítico para tareas largas o recovery de fallos',
        'Usar Redis o DB para persistir checkpoints permite recuperación entre reinicios y debugging',
        'Estado bien gestionado hace agentes más confiables, debuggeables y capaces de reportar progreso en tiempo real',
      ],
    },
    {
      title: 'Error Handling en Agentes',
      content: `Los agentes son sistemas complejos con múltiples puntos de fallo potenciales. Un error handling robusto es esencial para construir agentes confiables en producción.

**Retry Strategies**

Los errores transitorios (rate limits, timeouts de red) deben manejarse con retries inteligentes:

\`\`\`typescript
interface RetryConfig {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableErrors: string[];
}

class RetryHandler {
  constructor(private config: RetryConfig) {}

  async executeWithRetry<T>(
    fn: () => Promise<T>,
    context: string
  ): Promise<T> {
    let lastError: Error;
    let delay = this.config.initialDelayMs;

    for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        // Verificar si el error es retriable
        if (!this.isRetryable(error)) {
          throw error;
        }

        // Si es el último intento, lanzar error
        if (attempt === this.config.maxAttempts) {
          console.error(\`Max retry attempts reached for \${context}\`);
          throw error;
        }

        // Log y esperar antes de reintentar
        console.warn(
          \`Attempt \${attempt} failed for \${context}: \${error.message}. \` +
          \`Retrying in \${delay}ms...\`
        );

        await this.sleep(delay);

        // Exponential backoff
        delay = Math.min(
          delay * this.config.backoffMultiplier,
          this.config.maxDelayMs
        );
      }
    }

    throw lastError;
  }

  private isRetryable(error: any): boolean {
    // Errores de rate limiting
    if (error.status === 429) return true;

    // Timeouts
    if (error.code === 'ETIMEDOUT') return true;

    // Errores de red transitorios
    if (error.code === 'ECONNRESET') return true;

    // Errores específicos de la config
    return this.config.retryableErrors.some(
      pattern => error.message?.includes(pattern)
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Uso en agente
class RobustAgent {
  private retryHandler: RetryHandler;

  constructor() {
    this.retryHandler = new RetryHandler({
      maxAttempts: 3,
      initialDelayMs: 1000,
      maxDelayMs: 10000,
      backoffMultiplier: 2,
      retryableErrors: ['rate_limit_exceeded', 'timeout']
    });
  }

  async callLLM(messages: any[]): Promise<any> {
    return this.retryHandler.executeWithRetry(
      async () => {
        return await openai.chat.completions.create({
          model: 'gpt-4-turbo',
          messages
        });
      },
      'LLM call'
    );
  }

  async executeTool(toolName: string, input: any): Promise<any> {
    return this.retryHandler.executeWithRetry(
      async () => {
        const tool = this.tools.find(t => t.name === toolName);
        return await tool.execute(input);
      },
      \`Tool: \${toolName}\`
    );
  }
}
\`\`\`

**Fallback Tools**

Cuando una herramienta falla, tener alternativas puede salvar la tarea:

\`\`\`python
from typing import List, Callable, Any, Optional

class FallbackTool:
    def __init__(
        self,
        name: str,
        primary: Callable,
        fallbacks: List[Callable],
        description: str
    ):
        self.name = name
        self.primary = primary
        self.fallbacks = fallbacks
        self.description = description

    async def execute(self, input: Any) -> Any:
        """
        Intenta ejecutar primary, si falla prueba fallbacks
        """
        errors = []

        # Intentar primary
        try:
            result = await self.primary(input)
            return {
                "success": True,
                "result": result,
                "source": "primary"
            }
        except Exception as e:
            errors.append(f"Primary failed: {str(e)}")

        # Intentar fallbacks en orden
        for i, fallback in enumerate(self.fallbacks):
            try:
                result = await fallback(input)
                return {
                    "success": True,
                    "result": result,
                    "source": f"fallback_{i}",
                    "note": f"Primary failed, used fallback {i}"
                }
            except Exception as e:
                errors.append(f"Fallback {i} failed: {str(e)}")

        # Todos fallaron
        return {
            "success": False,
            "errors": errors,
            "message": "All execution attempts failed"
        }

# Ejemplo: Search con fallbacks
async def brave_search(query: str) -> List[dict]:
    # Implementación con Brave Search API
    pass

async def duckduckgo_search(query: str) -> List[dict]:
    # Fallback a DuckDuckGo
    pass

async def bing_search(query: str) -> List[dict]:
    # Segundo fallback a Bing
    pass

search_tool = FallbackTool(
    name="web_search",
    primary=brave_search,
    fallbacks=[duckduckgo_search, bing_search],
    description="Busca en la web con múltiples providers"
)

# Uso
result = await search_tool.execute("latest AI news")
if result["success"]:
    print(f"Found results using {result['source']}")
else:
    print(f"All searches failed: {result['errors']}")
\`\`\`

**Graceful Degradation**

Cuando no puedes completar la tarea perfectamente, haz lo mejor posible:

\`\`\`typescript
class GracefulAgent {
  async handlePartialFailure(
    task: string,
    completedSteps: Action[],
    failedStep: Action,
    error: Error
  ): Promise<string> {
    // Analizar qué se logró completar
    const progress = this.analyzeProgress(completedSteps);

    // Generar respuesta parcial útil
    const partialResponse = await this.llm.generate(\`
Tarea solicitada: \${task}

Pasos completados exitosamente:
\${completedSteps.map(s => \\\`- \\\${s.type}: \\\${s.output}\\\`).join('\\n')}

Paso que falló: \${failedStep.type}
Error: \${error.message}

Genera una respuesta útil para el usuario que:
1. Explique qué se logró completar
2. Proporcione la información parcial obtenida
3. Explique qué no se pudo hacer y por qué
4. Sugiera pasos alternativos si es posible

Respuesta:
    \`);

    return partialResponse;
  }

  async executeWithGracefulDegradation(task: string): Promise<string> {
    const actions: Action[] = [];

    try {
      // Intentar plan completo
      const plan = await this.createPlan(task);

      for (const step of plan) {
        try {
          const result = await this.executeStep(step);
          actions.push({ ...step, output: result });
        } catch (error) {
          // Paso falló, pero continuamos si es posible
          console.warn(\`Step failed: \${step.type}\`, error);

          // Si el paso es crítico, usar degradación elegante
          if (step.critical) {
            return await this.handlePartialFailure(
              task,
              actions,
              step,
              error
            );
          }

          // Si no es crítico, continuar con siguiente paso
          actions.push({
            ...step,
            output: null,
            error: error.message,
            skipped: true
          });
        }
      }

      // Si llegamos aquí, tarea completada (quizás con algunos pasos opcionales fallidos)
      return this.generateFinalResponse(actions);

    } catch (error) {
      // Error catastrófico
      if (actions.length === 0) {
        throw error; // No hay información parcial útil
      }

      return await this.handlePartialFailure(task, actions, null, error);
    }
  }
}
\`\`\`

**Circuit Breaker Pattern**

Previene cascadas de fallos deshabilitando temporalmente herramientas problemáticas:

\`\`\`python
from enum import Enum
from datetime import datetime, timedelta

class CircuitState(Enum):
    CLOSED = "closed"      # Normal operation
    OPEN = "open"          # Failures detected, blocking calls
    HALF_OPEN = "half_open"  # Testing if recovered

class CircuitBreaker:
    def __init__(
        self,
        failure_threshold: int = 5,
        timeout_seconds: int = 60,
        half_open_max_calls: int = 3
    ):
        self.failure_threshold = failure_threshold
        self.timeout = timedelta(seconds=timeout_seconds)
        self.half_open_max_calls = half_open_max_calls

        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.last_failure_time = None
        self.half_open_calls = 0

    async def call(self, func: Callable, *args, **kwargs):
        if self.state == CircuitState.OPEN:
            # Verificar si es tiempo de intentar de nuevo
            if datetime.now() - self.last_failure_time > self.timeout:
                self.state = CircuitState.HALF_OPEN
                self.half_open_calls = 0
            else:
                raise Exception("Circuit breaker is OPEN")

        if self.state == CircuitState.HALF_OPEN:
            if self.half_open_calls >= self.half_open_max_calls:
                raise Exception("Circuit breaker is HALF_OPEN, max calls reached")

        try:
            result = await func(*args, **kwargs)
            self.on_success()
            return result
        except Exception as e:
            self.on_failure()
            raise e

    def on_success(self):
        if self.state == CircuitState.HALF_OPEN:
            # Recuperado exitosamente
            self.state = CircuitState.CLOSED
            self.failure_count = 0
        self.failure_count = 0

    def on_failure(self):
        self.failure_count += 1
        self.last_failure_time = datetime.now()

        if self.state == CircuitState.HALF_OPEN:
            # Aún no recuperado
            self.state = CircuitState.OPEN
        elif self.failure_count >= self.failure_threshold:
            self.state = CircuitState.OPEN

# Uso con herramientas
class ToolWithCircuitBreaker:
    def __init__(self, tool: Tool):
        self.tool = tool
        self.circuit_breaker = CircuitBreaker(
            failure_threshold=3,
            timeout_seconds=30
        )

    async def execute(self, input: Any) -> Any:
        try:
            return await self.circuit_breaker.call(
                self.tool.execute,
                input
            )
        except Exception as e:
            if "Circuit breaker is OPEN" in str(e):
                return {
                    "error": f"Tool {self.tool.name} is temporarily unavailable",
                    "suggestion": "Try again in 30 seconds or use an alternative tool"
                }
            raise
\`\`\`

Error handling robusto convierte agentes frágiles en sistemas confiables listos para producción.`,
      keyPoints: [
        'Retry strategies con exponential backoff manejan errores transitorios como rate limits y timeouts de red',
        'Fallback tools proporcionan alternativas cuando la herramienta primaria falla, aumentando robustez',
        'Graceful degradation permite completar parcialmente tareas y proporcionar información útil aunque algunos pasos fallen',
        'Circuit breaker pattern previene cascadas de fallos deshabilitando temporalmente herramientas problemáticas',
        'Error handling robusto es la diferencia entre un prototipo frágil y un sistema confiable en producción',
      ],
    },
  ],
};
