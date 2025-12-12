// @ts-nocheck
export const finetuningAdaptation = {
  sections: [
    {
      title: '¿Cuándo Fine-tunear?',
      content: `El **fine-tuning** no siempre es la mejor solución. Antes de invertir tiempo y recursos, es crucial evaluar si otras técnicas pueden resolver tu problema de manera más eficiente.

## Framework de Decisión

**Prompt Engineering** debe ser tu primera opción. Si puedes lograr el comportamiento deseado con few-shot examples y buenas instrucciones, no necesitas fine-tuning. Es gratis, rápido de iterar y no requiere infraestructura adicional.

**RAG (Retrieval-Augmented Generation)** es ideal cuando necesitas conocimiento actualizado o específico de dominio que no está en el modelo base. Por ejemplo, documentación interna, catálogos de productos, o información que cambia frecuentemente. RAG te permite actualizar el conocimiento sin re-entrenar.

**Fine-tuning** es la mejor opción cuando:
- Necesitas un estilo de respuesta muy específico y consistente (tono, formato, estructura)
- Quieres reducir latencia eliminando ejemplos del prompt (menos tokens)
- Necesitas que el modelo aprenda patrones complejos que no caben en el contexto
- Requieres mejor rendimiento en tareas específicas de dominio

## Análisis Costo-Beneficio

El fine-tuning tiene costos directos (GPU time, datos de entrenamiento) e indirectos (mantenimiento, versionado). Un fine-tune de GPT-3.5 en OpenAI cuesta ~$8 por millón de tokens de entrenamiento, pero puede reducir costos de inferencia al necesitar prompts más cortos.

\`\`\`python
# Ejemplo: Cálculo de ROI del fine-tuning
base_prompt_tokens = 500  # Prompt con ejemplos
finetuned_prompt_tokens = 50  # Prompt simple post fine-tune
calls_per_month = 1_000_000

# Ahorro mensual
token_savings = (base_prompt_tokens - finetuned_prompt_tokens) * calls_per_month
cost_savings = token_savings * 0.0005 / 1000  # $0.50 per 1M tokens GPT-3.5

# Costo one-time de fine-tuning
training_tokens = 10_000_000
training_cost = training_tokens * 0.008 / 1_000_000

breakeven_months = training_cost / cost_savings
print(f"Breakeven en {breakeven_months:.1f} meses")
\`\`\`

**Regla de oro**: Si puedes resolver el problema con prompt engineering en 1 día, hazlo. Si necesitas 2+ semanas de iteración en prompts, considera fine-tuning.`,
      keyPoints: [
        'Prompt engineering primero, fine-tuning cuando otros métodos fallan',
        'RAG para conocimiento actualizado, fine-tuning para comportamiento consistente',
        'Fine-tuning reduce costos a largo plazo si tienes alto volumen de llamadas',
        'Calcular ROI considerando costos de entrenamiento vs ahorro en inferencia',
        'Fine-tuning es mejor para aprender patrones complejos y estilos específicos',
      ],
    },
    {
      title: 'Técnicas de Fine-tuning',
      content: `El fine-tuning moderno ha evolucionado más allá del entrenamiento completo. Las técnicas de **Parameter-Efficient Fine-Tuning (PEFT)** permiten adaptar modelos grandes con recursos limitados.

## Full Fine-tuning

Actualiza todos los parámetros del modelo. Ofrece máxima flexibilidad pero requiere más recursos. Solo viable para modelos pequeños (<7B parámetros) o con presupuesto GPU significativo.

\`\`\`python
from transformers import AutoModelForCausalLM, TrainingArguments, Trainer

model = AutoModelForCausalLM.from_pretrained("mistralai/Mistral-7B-v0.1")

training_args = TrainingArguments(
    output_dir="./full-finetune",
    per_device_train_batch_size=1,
    gradient_accumulation_steps=16,
    learning_rate=2e-5,
    num_train_epochs=3,
    fp16=True,  # Mixed precision
)
\`\`\`

## LoRA (Low-Rank Adaptation)

LoRA congela el modelo base y entrena matrices de bajo rango que se suman a las capas de atención. Reduce parámetros entrenables en 90-99%, permitiendo fine-tuning en GPUs consumer.

\`\`\`python
from peft import LoraConfig, get_peft_model

lora_config = LoraConfig(
    r=8,  # Rank de las matrices LoRA
    lora_alpha=32,  # Scaling factor
    target_modules=["q_proj", "v_proj"],  # Qué capas modificar
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM"
)

model = get_peft_model(model, lora_config)
model.print_trainable_parameters()  # ~0.5% del modelo original
\`\`\`

## QLoRA (Quantized LoRA)

Cuantiza el modelo base a 4-bit mientras entrena adaptadores LoRA en 16-bit. Permite fine-tunear modelos de 70B en una GPU de 24GB.

\`\`\`python
from transformers import BitsAndBytesConfig

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_use_double_quant=True,
    bnb_4bit_compute_dtype=torch.bfloat16
)

model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-70b-hf",
    quantization_config=bnb_config,
    device_map="auto"
)
\`\`\`

## DoRA (Weight-Decomposed LoRA)

Mejora sobre LoRA que descompone los pesos en magnitud y dirección, logrando rendimiento cercano a full fine-tuning con la eficiencia de LoRA. Especialmente efectivo para tareas que requieren cambios significativos en el comportamiento del modelo.

**Comparativa de recursos** para Llama-2-7B:
- Full FT: 28GB VRAM, 120 min/epoch
- LoRA: 12GB VRAM, 45 min/epoch
- QLoRA: 6GB VRAM, 60 min/epoch`,
      keyPoints: [
        'PEFT reduce recursos necesarios hasta 99% vs full fine-tuning',
        'LoRA es el estándar para fine-tuning eficiente, r=8-64 según complejidad',
        'QLoRA permite fine-tunear modelos 70B+ en hardware consumer',
        'DoRA ofrece mejor rendimiento que LoRA con similar eficiencia',
        'Elegir técnica según disponibilidad de recursos y complejidad de la tarea',
      ],
    },
    {
      title: 'Preparación de Datasets',
      content: `La calidad del dataset es más importante que la cantidad. **1,000 ejemplos bien curados superan a 100,000 ejemplos ruidosos.**

## Formatos de Datos

**Instruction Format** - Para tareas específicas con instrucciones claras:

\`\`\`json
{
  "instruction": "Clasifica el sentimiento del siguiente review",
  "input": "El producto llegó roto y el servicio al cliente no respondió",
  "output": "Negativo - Problemas con el producto y atención al cliente"
}
\`\`\`

**Chat Format** - Para conversaciones multi-turno:

\`\`\`json
{
  "messages": [
    {"role": "system", "content": "Eres un asistente técnico experto en Python"},
    {"role": "user", "content": "¿Cómo manejo excepciones en async/await?"},
    {"role": "assistant", "content": "En Python async/await, usas try/except normalmente..."}
  ]
}
\`\`\`

**Completion Format** - Para continuación de texto:

\`\`\`json
{
  "prompt": "Genera un endpoint FastAPI para crear usuarios:\n\n",
  "completion": "@app.post(\"/users/\")\nasync def create_user(user: UserCreate):\n    return await db.users.insert_one(user.dict())"
}
\`\`\`

## Calidad de Datos

**Criterios de calidad esenciales**:
1. **Consistencia**: Mismo formato, estilo y nivel de detalle
2. **Diversidad**: Cubrir casos edge, diferentes formulaciones, variedad de contextos
3. **Corrección**: Outputs factualmente correctos y alineados con el comportamiento deseado
4. **Balance**: Distribución equitativa de categorías/tipos de ejemplos

\`\`\`python
# Script de validación de dataset
import json
from collections import Counter

def validate_dataset(file_path):
    with open(file_path) as f:
        data = [json.loads(line) for line in f]

    # Verificar longitudes
    lengths = [len(item['output']) for item in data]
    print(f"Output length - Mean: {np.mean(lengths):.0f}, Std: {np.std(lengths):.0f}")

    # Detectar duplicados
    outputs = [item['output'] for item in data]
    duplicates = len(outputs) - len(set(outputs))
    print(f"Duplicados: {duplicates} ({duplicates/len(outputs)*100:.1f}%)")

    # Balance de categorías
    if 'category' in data[0]:
        categories = Counter(item['category'] for item in data)
        print(f"Balance: {dict(categories)}")
\`\`\`

## Data Augmentation y Datos Sintéticos

Cuando no tienes suficientes datos reales, genera sintéticos usando modelos más potentes:

\`\`\`typescript
// Generar datos sintéticos con GPT-4
async function generateSyntheticData(topic: string, count: number) {
  const examples = [];

  for (let i = 0; i < count; i++) {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "system",
        content: "Genera ejemplos de entrenamiento diversos y realistas"
      }, {
        role: "user",
        content: \`Genera 1 ejemplo de \${topic} con input y output ideal\`
      }],
      temperature: 0.9  // Alta diversidad
    });

    examples.push(JSON.parse(response.choices[0].message.content));
  }

  return examples;
}
\`\`\`

**Recomendación**: Empieza con 500-1000 ejemplos de alta calidad. Itera según resultados de evaluación.`,
      keyPoints: [
        'Calidad sobre cantidad: 1,000 ejemplos curados > 100,000 ruidosos',
        'Usar formato apropiado: instruction para tareas, chat para conversaciones',
        'Validar consistencia, diversidad, corrección y balance del dataset',
        'Datos sintéticos con GPT-4 pueden complementar datos reales limitados',
        'Empezar pequeño (500-1K ejemplos) e iterar según métricas',
      ],
    },
    {
      title: 'Proceso de Training',
      content: `El proceso de fine-tuning requiere configuración cuidadosa de hiperparámetros y técnicas de optimización para lograr convergencia estable.

## Hiperparámetros Clave

**Learning Rate**: El parámetro más crítico. Demasiado alto causa divergencia, demasiado bajo resulta en entrenamiento lento.

\`\`\`python
from transformers import TrainingArguments

# Para LoRA: learning rates más altos funcionan bien
lora_training_args = TrainingArguments(
    learning_rate=1e-4,  # 10x más alto que full fine-tuning
    lr_scheduler_type="cosine",  # Decae suavemente
    warmup_ratio=0.03,  # 3% de steps para warm-up
    num_train_epochs=3,
)

# Para full fine-tuning: más conservador
full_training_args = TrainingArguments(
    learning_rate=2e-5,
    lr_scheduler_type="linear",
    warmup_steps=100,
    num_train_epochs=2,  # Menos epochs para evitar overfitting
)
\`\`\`

## Learning Rate Scheduling

El **cosine schedule** con warmup es el más efectivo para LLMs:

\`\`\`python
import math

def cosine_schedule_with_warmup(step, total_steps, warmup_steps, max_lr, min_lr=0):
    if step < warmup_steps:
        return max_lr * step / warmup_steps

    progress = (step - warmup_steps) / (total_steps - warmup_steps)
    return min_lr + (max_lr - min_lr) * 0.5 * (1 + math.cos(math.pi * progress))
\`\`\`

## Gradient Accumulation

Permite simular batch sizes grandes acumulando gradientes antes de actualizar:

\`\`\`python
# Equivalente a batch_size=32 con solo 8GB VRAM
training_args = TrainingArguments(
    per_device_train_batch_size=2,  # Lo que cabe en memoria
    gradient_accumulation_steps=16,  # 2 * 16 = 32 effective batch size
    gradient_checkpointing=True,  # Reduce memoria ~30%
)
\`\`\`

## Mixed Precision Training

Usa **bfloat16** si tu GPU lo soporta (A100, H100), sino **float16**:

\`\`\`python
training_args = TrainingArguments(
    bf16=True,  # Mejor rango numérico que fp16
    bf16_full_eval=True,
    # Alternativa para GPUs más antiguas:
    # fp16=True,
    # fp16_opt_level="O2",
)
\`\`\`

## Monitoreo durante Training

\`\`\`python
from transformers import TrainerCallback

class MonitoringCallback(TrainerCallback):
    def on_log(self, args, state, control, logs=None, **kwargs):
        if logs:
            print(f"Step {state.global_step}")
            print(f"  Loss: {logs.get('loss', 0):.4f}")
            print(f"  LR: {logs.get('learning_rate', 0):.2e}")

            # Alertar si hay problemas
            if logs.get('loss', 0) > 10:
                print("⚠️  WARNING: Loss muy alta, posible divergencia")

            if 'grad_norm' in logs and logs['grad_norm'] > 100:
                print("⚠️  WARNING: Gradient norm muy alto")

trainer = Trainer(
    model=model,
    args=training_args,
    callbacks=[MonitoringCallback()]
)
\`\`\`

**Señales de buen entrenamiento**:
- Loss decrece consistentemente sin oscilaciones grandes
- Gradient norm estable (típicamente < 1.0)
- Learning rate decae suavemente
- Validation loss mejora junto con training loss`,
      keyPoints: [
        'Learning rate: 1e-4 para LoRA, 2e-5 para full fine-tuning',
        'Cosine schedule con warmup es el más efectivo para LLMs',
        'Gradient accumulation permite batch sizes grandes con memoria limitada',
        'Mixed precision (bf16/fp16) reduce memoria y acelera entrenamiento',
        'Monitorear loss, gradient norm y learning rate durante training',
      ],
    },
    {
      title: 'Evaluación Post Fine-tuning',
      content: `La evaluación rigurosa determina si el fine-tuning fue exitoso y vale la pena desplegar.

## Métricas de Evaluación

**Para tareas de clasificación**:

\`\`\`python
from sklearn.metrics import classification_report, confusion_matrix
import numpy as np

def evaluate_classification(model, test_data):
    predictions = []
    labels = []

    for item in test_data:
        pred = model.generate(item['input'])
        predictions.append(pred)
        labels.append(item['output'])

    # Métricas detalladas
    print(classification_report(labels, predictions))

    # Matriz de confusión
    cm = confusion_matrix(labels, predictions)
    print(f"Confusion Matrix:\n{cm}")

    # Accuracy por categoría
    per_class_acc = cm.diagonal() / cm.sum(axis=1)
    print(f"Per-class accuracy: {per_class_acc}")
\`\`\`

**Para generación de texto**:

\`\`\`python
from rouge_score import rouge_scorer
from bert_score import score as bert_score

def evaluate_generation(predictions, references):
    # ROUGE para overlap de n-gramas
    scorer = rouge_scorer.RougeScorer(['rouge1', 'rouge2', 'rougeL'])
    rouge_scores = [scorer.score(pred, ref) for pred, ref in zip(predictions, references)]

    avg_rouge1 = np.mean([s['rouge1'].fmeasure for s in rouge_scores])
    avg_rougeL = np.mean([s['rougeL'].fmeasure for s in rouge_scores])

    # BERTScore para similitud semántica
    P, R, F1 = bert_score(predictions, references, lang='es')

    return {
        'rouge1': avg_rouge1,
        'rougeL': avg_rougeL,
        'bertscore_f1': F1.mean().item()
    }
\`\`\`

## Detección de Overfitting

**Señales de overfitting**:
- Training loss continúa bajando pero validation loss se estanca o sube
- Modelo memoriza ejemplos de entrenamiento (verbatim outputs)
- Rendimiento excelente en train set, pobre en test set

\`\`\`python
# Graficar curvas de aprendizaje
import matplotlib.pyplot as plt

def plot_training_curves(train_losses, val_losses):
    plt.figure(figsize=(10, 6))
    plt.plot(train_losses, label='Training Loss')
    plt.plot(val_losses, label='Validation Loss')
    plt.xlabel('Epoch')
    plt.ylabel('Loss')
    plt.legend()

    # Detectar divergencia
    if len(val_losses) > 3:
        recent_trend = np.polyfit(range(len(val_losses[-3:])), val_losses[-3:], 1)[0]
        if recent_trend > 0:
            plt.title('⚠️  WARNING: Validation loss aumentando (overfitting)')
        else:
            plt.title('✓ Training saludable')

    plt.savefig('training_curves.png')
\`\`\`

**Soluciones al overfitting**:
- Reducir epochs (2-3 suele ser suficiente)
- Aumentar dropout en LoRA config
- Regularización: weight decay 0.01-0.1
- Más datos de entrenamiento

## A/B Testing vs Modelo Base

Comparar sistemáticamente con el modelo base en casos reales:

\`\`\`typescript
// Sistema de A/B testing
interface EvaluationResult {
  modelVersion: 'base' | 'finetuned';
  latency: number;
  outputQuality: number;  // 1-5 escala
  taskSuccess: boolean;
}

async function runABTest(prompts: string[], sampleSize: number) {
  const results: EvaluationResult[] = [];

  for (let i = 0; i < sampleSize; i++) {
    const prompt = prompts[i % prompts.length];
    const useFinetune = Math.random() < 0.5;

    const model = useFinetune ? finetunedModel : baseModel;
    const startTime = Date.now();
    const output = await model.generate(prompt);
    const latency = Date.now() - startTime;

    results.push({
      modelVersion: useFinetune ? 'finetuned' : 'base',
      latency,
      outputQuality: await evaluateQuality(output),
      taskSuccess: await checkTaskSuccess(output, prompt)
    });
  }

  // Análisis estadístico
  const baseResults = results.filter(r => r.modelVersion === 'base');
  const ftResults = results.filter(r => r.modelVersion === 'finetuned');

  console.log('Base Model:', {
    avgLatency: mean(baseResults.map(r => r.latency)),
    avgQuality: mean(baseResults.map(r => r.outputQuality)),
    successRate: baseResults.filter(r => r.taskSuccess).length / baseResults.length
  });

  console.log('Finetuned Model:', {
    avgLatency: mean(ftResults.map(r => r.latency)),
    avgQuality: mean(ftResults.map(r => r.outputQuality)),
    successRate: ftResults.filter(r => r.taskSuccess).length / ftResults.length
  });
}
\`\`\`

**Criterios de éxito**: El modelo fine-tuned debe superar al base en al menos 10-15% en la métrica objetivo para justificar la complejidad adicional.`,
      keyPoints: [
        'Usar métricas apropiadas: accuracy/F1 para clasificación, ROUGE/BERTScore para generación',
        'Monitorear train vs validation loss para detectar overfitting temprano',
        'A/B testing contra modelo base con métricas de negocio, no solo técnicas',
        'Fine-tuning exitoso debe mejorar 10-15% sobre baseline para justificar complejidad',
        'Evaluar en casos edge y distribución real, no solo test set curado',
      ],
    },
    {
      title: 'Plataformas de Fine-tuning',
      content: `Diferentes plataformas ofrecen trade-offs entre facilidad de uso, costo y flexibilidad.

## OpenAI Fine-tuning

La opción más simple para GPT-3.5/4. No requiere infraestructura propia.

\`\`\`python
import openai

# Subir dataset
file = openai.File.create(
    file=open("training_data.jsonl", "rb"),
    purpose='fine-tune'
)

# Iniciar fine-tuning
job = openai.FineTuningJob.create(
    training_file=file.id,
    model="gpt-3.5-turbo",
    hyperparameters={
        "n_epochs": 3,
        "batch_size": 1,
        "learning_rate_multiplier": 0.1
    }
)

# Monitorear progreso
events = openai.FineTuningJob.list_events(id=job.id, limit=10)
for event in events.data:
    print(f"{event.created_at}: {event.message}")

# Usar modelo fine-tuned
completion = openai.ChatCompletion.create(
    model=job.fine_tuned_model,
    messages=[{"role": "user", "content": "Test prompt"}]
)
\`\`\`

**Costos**: ~$8/1M tokens training, inferencia 2x precio del modelo base.

## Together AI

Plataforma especializada en fine-tuning con soporte para modelos open-source.

\`\`\`typescript
import Together from 'together-ai';

const together = new Together({ apiKey: process.env.TOGETHER_API_KEY });

// Iniciar fine-tune job
const fineTune = await together.fineTuning.create({
  model: 'mistralai/Mistral-7B-v0.1',
  training_file: 'file-abc123',
  n_epochs: 3,
  learning_rate: 1e-4,
  lora_config: {
    r: 16,
    lora_alpha: 32,
    target_modules: ['q_proj', 'v_proj', 'k_proj', 'o_proj']
  }
});

// Obtener status
const status = await together.fineTuning.retrieve(fineTune.id);
console.log(\`Status: \${status.status}, Progress: \${status.progress}%\`);

// Inferencia
const response = await together.chat.completions.create({
  model: status.fine_tuned_model,
  messages: [{ role: 'user', content: 'Test' }]
});
\`\`\`

**Ventajas**: Modelos open-source, LoRA nativo, precios competitivos, control de hiperparámetros.

## Hugging Face AutoTrain

Entrenamiento automatizado con minimal configuration:

\`\`\`python
from autotrain import AutoTrain

# Configuración simple
trainer = AutoTrain(
    project_name="my-finetuned-model",
    task="text-generation",
    base_model="meta-llama/Llama-2-7b-hf",
    data_path="./training_data",
    hub_model_id="myorg/my-finetuned-llama"
)

# AutoTrain selecciona hiperparámetros óptimos
trainer.train()

# Deploy directo a Hugging Face Hub
trainer.push_to_hub()
\`\`\`

**Ventajas**: Zero config, integración con HF ecosystem, gratis con tus propios recursos.

## AWS SageMaker

Para empresas que necesitan fine-tuning a escala con compliance estricto:

\`\`\`python
import sagemaker
from sagemaker.huggingface import HuggingFace

# Configurar training job
huggingface_estimator = HuggingFace(
    entry_point='train.py',
    instance_type='ml.g5.12xlarge',  # 4x A10G GPUs
    instance_count=1,
    transformers_version='4.36',
    pytorch_version='2.1',
    py_version='py310',
    hyperparameters={
        'model_name': 'mistralai/Mistral-7B-v0.1',
        'num_train_epochs': 3,
        'per_device_train_batch_size': 2,
        'learning_rate': 1e-4,
    }
)

# Iniciar training
huggingface_estimator.fit({'train': 's3://bucket/training-data'})

# Deploy endpoint
predictor = huggingface_estimator.deploy(
    initial_instance_count=1,
    instance_type='ml.g5.2xlarge'
)
\`\`\`

**Ventajas**: Control total, VPC privado, compliance (HIPAA, SOC2), integración AWS.

## Comparativa de Plataformas

| Plataforma | Facilidad | Costo | Modelos | Control | Mejor para |
|------------|-----------|-------|---------|---------|------------|
| OpenAI | ⭐⭐⭐⭐⭐ | Alto | GPT-3.5/4 | Bajo | Prototipado rápido |
| Together AI | ⭐⭐⭐⭐ | Medio | Open-source | Medio | Producción open-source |
| HF AutoTrain | ⭐⭐⭐⭐ | Bajo | Todos HF | Medio | Experimentación |
| SageMaker | ⭐⭐⭐ | Alto | Cualquiera | Alto | Enterprise compliance |`,
      keyPoints: [
        'OpenAI fine-tuning es la opción más simple pero más costosa',
        'Together AI ofrece balance entre facilidad y control para modelos open-source',
        'Hugging Face AutoTrain es ideal para experimentación con mínima configuración',
        'SageMaker para casos enterprise con requisitos de compliance y seguridad',
        'Elegir plataforma según trade-off entre facilidad, costo y control requerido',
      ],
    },
  ],
};

export const productionMlops = {
  sections: [
    {
      title: 'Optimización de Latencia',
      content: `La latencia es crítica en aplicaciones LLM. Los usuarios abandonan si la respuesta tarda más de 3-5 segundos.

## Streaming Responses

Enviar tokens conforme se generan mejora la **percepción de velocidad** dramáticamente:

\`\`\`typescript
import { OpenAI } from 'openai';

const openai = new OpenAI();

async function streamResponse(prompt: string) {
  const stream = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    process.stdout.write(content);  // O enviar vía WebSocket/SSE
  }
}

// Server-Sent Events para web
app.get('/api/chat', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const stream = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: req.query.messages,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    res.write(\`data: \${JSON.stringify({ content })}\n\n\`);
  }

  res.end();
});
\`\`\`

## Semantic Caching

Cachear respuestas basado en **similitud semántica** del prompt:

\`\`\`python
from sentence_transformers import SentenceTransformer
import numpy as np
import redis
import json

class SemanticCache:
    def __init__(self, similarity_threshold=0.95):
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.redis_client = redis.Redis(host='localhost', port=6379)
        self.threshold = similarity_threshold

    def get_embedding(self, text: str) -> np.ndarray:
        return self.model.encode(text)

    def get(self, prompt: str) -> str | None:
        prompt_embedding = self.get_embedding(prompt)

        # Buscar en cache
        cached_keys = self.redis_client.keys('cache:*')
        for key in cached_keys:
            cached_data = json.loads(self.redis_client.get(key))
            cached_embedding = np.array(cached_data['embedding'])

            # Calcular similitud coseno
            similarity = np.dot(prompt_embedding, cached_embedding) / (
                np.linalg.norm(prompt_embedding) * np.linalg.norm(cached_embedding)
            )

            if similarity >= self.threshold:
                print(f"Cache hit! Similarity: {similarity:.3f}")
                return cached_data['response']

        return None

    def set(self, prompt: str, response: str, ttl: int = 3600):
        embedding = self.get_embedding(prompt).tolist()
        cache_key = f"cache:{hash(prompt)}"

        self.redis_client.setex(
            cache_key,
            ttl,
            json.dumps({'embedding': embedding, 'response': response})
        )

# Uso
cache = SemanticCache()
cached = cache.get("¿Cuál es la capital de Francia?")

if cached:
    print(cached)
else:
    response = llm.generate("¿Cuál es la capital de Francia?")
    cache.set("¿Cuál es la capital de Francia?", response)
\`\`\`

## Request Batching

Agrupar múltiples requests para procesar en paralelo:

\`\`\`python
import asyncio
from collections import defaultdict
import time

class RequestBatcher:
    def __init__(self, max_batch_size=10, max_wait_ms=100):
        self.max_batch_size = max_batch_size
        self.max_wait_ms = max_wait_ms
        self.pending_requests = []
        self.processing = False

    async def add_request(self, prompt: str) -> str:
        future = asyncio.Future()
        self.pending_requests.append((prompt, future))

        if not self.processing:
            asyncio.create_task(self._process_batch())

        return await future

    async def _process_batch(self):
        self.processing = True
        await asyncio.sleep(self.max_wait_ms / 1000)

        batch = self.pending_requests[:self.max_batch_size]
        self.pending_requests = self.pending_requests[self.max_batch_size:]

        if batch:
            prompts = [req[0] for req in batch]
            futures = [req[1] for req in batch]

            # Procesar batch en paralelo
            responses = await llm.batch_generate(prompts)

            for future, response in zip(futures, responses):
                future.set_result(response)

        self.processing = False

# Uso
batcher = RequestBatcher()
response = await batcher.add_request("Generate code for...")
\`\`\`

## Edge Deployment

Desplegar modelos pequeños en edge para latencia ultra-baja:

\`\`\`typescript
// Cloudflare Workers AI
export default {
  async fetch(request: Request, env: Env) {
    const { prompt } = await request.json();

    // Modelo desplegado en edge (150+ ubicaciones globales)
    const response = await env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
      prompt,
      max_tokens: 256,
    });

    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
\`\`\`

**Resultados típicos**:
- Sin optimización: 2-4s latencia
- Con streaming: Percepción de <1s (first token in 200-500ms)
- Con semantic cache: 50-100ms para cache hits (95% reduction)
- Edge deployment: 100-300ms latencia global`,
      keyPoints: [
        'Streaming mejora percepción de velocidad aunque latencia total sea igual',
        'Semantic caching puede reducir latencia 95% para queries similares',
        'Request batching aprovecha paralelización del modelo',
        'Edge deployment reduce latencia de red desplegando globalmente',
        'Combinar técnicas: streaming + caching + batching para óptima UX',
      ],
    },
    {
      title: 'Gestión de Costos',
      content: `Los costos de LLMs pueden escalar rápidamente. Una aplicación con 1M de usuarios puede gastar $100K+/mes sin optimización.

## Token Budgeting

Limitar tokens por request y usuario:

\`\`\`typescript
interface TokenBudget {
  maxTokensPerRequest: number;
  maxTokensPerUser: number;
  resetPeriod: 'hour' | 'day' | 'month';
}

class TokenBudgetManager {
  constructor(private budget: TokenBudget, private redis: Redis) {}

  async checkAndDeduct(userId: string, estimatedTokens: number): Promise<boolean> {
    const key = \`tokens:\${userId}:\${this.getCurrentPeriod()}\`;
    const current = await this.redis.get(key) || 0;

    // Verificar límites
    if (estimatedTokens > this.budget.maxTokensPerRequest) {
      throw new Error(\`Request excede límite de \${this.budget.maxTokensPerRequest} tokens\`);
    }

    if (current + estimatedTokens > this.budget.maxTokensPerUser) {
      throw new Error(\`Usuario excedió presupuesto de \${this.budget.maxTokensPerUser} tokens\`);
    }

    // Deducir tokens
    await this.redis.incrby(key, estimatedTokens);
    await this.redis.expire(key, this.getTTL());

    return true;
  }

  getCurrentPeriod(): string {
    const now = new Date();
    if (this.budget.resetPeriod === 'hour') return now.toISOString().slice(0, 13);
    if (this.budget.resetPeriod === 'day') return now.toISOString().slice(0, 10);
    return now.toISOString().slice(0, 7);  // month
  }
}

// Uso
const budgetManager = new TokenBudgetManager({
  maxTokensPerRequest: 4000,
  maxTokensPerUser: 100000,
  resetPeriod: 'day'
}, redisClient);

await budgetManager.checkAndDeduct('user-123', 1500);
\`\`\`

## Model Routing

Enrutar requests al modelo más económico que pueda resolver la tarea:

\`\`\`python
from enum import Enum
from typing import Dict

class ModelTier(Enum):
    FAST = "gpt-3.5-turbo"  # $0.50/1M tokens
    SMART = "gpt-4-turbo"   # $10/1M tokens
    GENIUS = "gpt-4"        # $30/1M tokens

class SmartRouter:
    def __init__(self):
        self.complexity_threshold_fast = 0.3
        self.complexity_threshold_smart = 0.7

    def estimate_complexity(self, prompt: str) -> float:
        """Estimar complejidad de 0-1"""
        # Factores de complejidad
        length_score = min(len(prompt) / 2000, 1.0)

        # Keywords que indican complejidad
        complex_keywords = ['analiza', 'compara', 'evalúa', 'diseña', 'razona']
        keyword_score = sum(1 for kw in complex_keywords if kw in prompt.lower()) / len(complex_keywords)

        # Estructura del prompt
        has_examples = '###' in prompt or 'ejemplo' in prompt.lower()
        structure_score = 0.3 if has_examples else 0.0

        return (length_score * 0.4 + keyword_score * 0.4 + structure_score * 0.2)

    def route(self, prompt: str) -> ModelTier:
        complexity = self.estimate_complexity(prompt)

        if complexity < self.complexity_threshold_fast:
            return ModelTier.FAST
        elif complexity < self.complexity_threshold_smart:
            return ModelTier.SMART
        else:
            return ModelTier.GENIUS

    def generate(self, prompt: str) -> tuple[str, float]:
        model = self.route(prompt)
        print(f"Routing to {model.value}")

        response = openai.chat.completions.create(
            model=model.value,
            messages=[{"role": "user", "content": prompt}]
        )

        # Calcular costo
        tokens = response.usage.total_tokens
        cost = self.calculate_cost(model, tokens)

        return response.choices[0].message.content, cost

    def calculate_cost(self, model: ModelTier, tokens: int) -> float:
        rates = {
            ModelTier.FAST: 0.50,
            ModelTier.SMART: 10.0,
            ModelTier.GENIUS: 30.0
        }
        return (tokens / 1_000_000) * rates[model]

# Uso
router = SmartRouter()
response, cost = router.generate("¿Cuál es la capital de España?")  # -> gpt-3.5-turbo
print(f"Cost: ${cost:.4f}")
\`\`\`

## Caching Strategies

Implementar múltiples niveles de cache:

\`\`\`typescript
class MultiLevelCache {
  private l1Cache = new Map<string, string>();  // In-memory
  private l2Cache: Redis;  // Redis
  private l3Cache: SemanticCache;  // Semantic

  async get(prompt: string): Promise<string | null> {
    // L1: In-memory cache (instant)
    if (this.l1Cache.has(prompt)) {
      console.log('L1 cache hit');
      return this.l1Cache.get(prompt)!;
    }

    // L2: Redis cache (1-2ms)
    const l2Result = await this.l2Cache.get(\`exact:\${prompt}\`);
    if (l2Result) {
      console.log('L2 cache hit');
      this.l1Cache.set(prompt, l2Result);  // Promote to L1
      return l2Result;
    }

    // L3: Semantic cache (10-50ms)
    const l3Result = await this.l3Cache.get(prompt);
    if (l3Result) {
      console.log('L3 cache hit');
      this.l1Cache.set(prompt, l3Result);
      await this.l2Cache.setex(\`exact:\${prompt}\`, 3600, l3Result);
      return l3Result;
    }

    return null;
  }

  async set(prompt: string, response: string): Promise<void> {
    this.l1Cache.set(prompt, response);
    await this.l2Cache.setex(\`exact:\${prompt}\`, 3600, response);
    await this.l3Cache.set(prompt, response);

    // Evict L1 if too large
    if (this.l1Cache.size > 1000) {
      const firstKey = this.l1Cache.keys().next().value;
      this.l1Cache.delete(firstKey);
    }
  }
}
\`\`\`

## Cost Monitoring

Dashboard en tiempo real de costos:

\`\`\`python
from prometheus_client import Counter, Histogram

# Métricas
token_usage = Counter('llm_tokens_total', 'Total tokens used', ['model', 'user'])
cost_spent = Counter('llm_cost_dollars', 'Total cost in USD', ['model'])
request_tokens = Histogram('llm_request_tokens', 'Tokens per request', ['model'])

def track_usage(model: str, user: str, tokens: int, cost: float):
    token_usage.labels(model=model, user=user).inc(tokens)
    cost_spent.labels(model=model).inc(cost)
    request_tokens.labels(model=model).observe(tokens)

# Alertas cuando costo diario > threshold
async def check_daily_budget():
    daily_cost = cost_spent.labels(model='gpt-4')._value.get()
    if daily_cost > 1000:  # $1000/day
        await send_alert(f"⚠️  Daily cost exceeds $1000: ${daily_cost:.2f}")
\`\`\`

**Ahorro típico con optimizaciones**:
- Model routing: 60-70% reducción de costos
- Caching agresivo: 40-50% reducción
- Token budgeting: Evita runaway costs
- **Combinado**: 75-85% reducción total`,
      keyPoints: [
        'Token budgeting previene runaway costs limitando uso por usuario/request',
        'Model routing reduce costos 60-70% usando modelo más barato adecuado',
        'Multi-level caching: in-memory → Redis → semantic para máxima eficiencia',
        'Monitoreo en tiempo real con alertas previene gastos inesperados',
        'Combinando técnicas se logra 75-85% reducción de costos',
      ],
    },
    {
      title: 'Observabilidad',
      content: `Sin observabilidad adecuada, debuggear problemas de LLMs en producción es casi imposible.

## Distributed Tracing

Trazar requests end-to-end a través de todos los componentes:

\`\`\`typescript
import { trace, context, SpanStatusCode } from '@opentelemetry/api';
import { Resource } from '@opentelemetry/resources';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';

const provider = new NodeTracerProvider({
  resource: new Resource({ 'service.name': 'llm-service' })
});

provider.addSpanProcessor(new BatchSpanProcessor(new JaegerExporter()));
provider.register();

const tracer = trace.getTracer('llm-service');

async function generateWithTracing(prompt: string) {
  const span = tracer.startSpan('llm.generate', {
    attributes: {
      'llm.model': 'gpt-4',
      'llm.prompt_length': prompt.length,
    }
  });

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }]
    });

    span.setAttributes({
      'llm.completion_tokens': response.usage.completion_tokens,
      'llm.prompt_tokens': response.usage.prompt_tokens,
      'llm.total_tokens': response.usage.total_tokens,
      'llm.finish_reason': response.choices[0].finish_reason,
    });

    span.setStatus({ code: SpanStatusCode.OK });
    return response.choices[0].message.content;

  } catch (error) {
    span.recordException(error);
    span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
    throw error;
  } finally {
    span.end();
  }
}
\`\`\`

## Structured Logging

Logs estructurados para análisis eficiente:

\`\`\`python
import structlog
import json

# Configurar structured logging
structlog.configure(
    processors=[
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer()
    ]
)

logger = structlog.get_logger()

def generate_with_logging(prompt: str, user_id: str):
    log = logger.bind(
        user_id=user_id,
        prompt_hash=hash(prompt),
        model="gpt-4"
    )

    log.info("llm_request_started", prompt_length=len(prompt))

    try:
        start_time = time.time()
        response = openai.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}]
        )
        duration = time.time() - start_time

        log.info(
            "llm_request_completed",
            duration_ms=duration * 1000,
            prompt_tokens=response.usage.prompt_tokens,
            completion_tokens=response.usage.completion_tokens,
            total_tokens=response.usage.total_tokens,
            finish_reason=response.choices[0].finish_reason
        )

        return response.choices[0].message.content

    except Exception as e:
        log.error(
            "llm_request_failed",
            error_type=type(e).__name__,
            error_message=str(e)
        )
        raise

# Logs en formato JSON para Elasticsearch/CloudWatch
# {"event": "llm_request_completed", "duration_ms": 1234, "total_tokens": 567, ...}
\`\`\`

## Key Metrics

Métricas esenciales para monitorear:

\`\`\`python
from prometheus_client import Counter, Histogram, Gauge
import time

# Latencia
llm_latency = Histogram(
    'llm_request_duration_seconds',
    'LLM request duration',
    ['model', 'endpoint'],
    buckets=[0.1, 0.5, 1.0, 2.0, 5.0, 10.0]
)

# Throughput
llm_requests = Counter(
    'llm_requests_total',
    'Total LLM requests',
    ['model', 'status']
)

# Tokens
llm_tokens = Counter(
    'llm_tokens_total',
    'Total tokens processed',
    ['model', 'type']  # type: prompt, completion
)

# Errores
llm_errors = Counter(
    'llm_errors_total',
    'Total LLM errors',
    ['model', 'error_type']
)

# Current load
llm_concurrent_requests = Gauge(
    'llm_concurrent_requests',
    'Current concurrent LLM requests',
    ['model']
)

# Uso
class MetricsMiddleware:
    def __init__(self, model: str):
        self.model = model

    async def __call__(self, prompt: str):
        llm_concurrent_requests.labels(model=self.model).inc()

        start_time = time.time()
        try:
            response = await openai.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}]
            )

            duration = time.time() - start_time
            llm_latency.labels(model=self.model, endpoint='chat').observe(duration)
            llm_requests.labels(model=self.model, status='success').inc()

            llm_tokens.labels(model=self.model, type='prompt').inc(
                response.usage.prompt_tokens
            )
            llm_tokens.labels(model=self.model, type='completion').inc(
                response.usage.completion_tokens
            )

            return response

        except openai.RateLimitError as e:
            llm_errors.labels(model=self.model, error_type='rate_limit').inc()
            llm_requests.labels(model=self.model, status='rate_limited').inc()
            raise
        except Exception as e:
            llm_errors.labels(model=self.model, error_type=type(e).__name__).inc()
            llm_requests.labels(model=self.model, status='error').inc()
            raise
        finally:
            llm_concurrent_requests.labels(model=self.model).dec()
\`\`\`

## Plataformas de Observabilidad

**LangSmith** - By LangChain, especializado en LLM workflows:

\`\`\`typescript
import { LangSmith } from 'langsmith';

const client = new LangSmith({ apiKey: process.env.LANGSMITH_API_KEY });

// Auto-tracing de chains
const chain = new LLMChain({
  llm: new OpenAI(),
  prompt: PromptTemplate.fromTemplate("Translate {text} to {language}"),
  callbacks: [new LangSmithTracer()]
});

// Dashboards automáticos de latencia, tokens, costos
\`\`\`

**LangFuse** - Open-source alternative con self-hosting:

\`\`\`python
from langfuse import Langfuse

langfuse = Langfuse()

trace = langfuse.trace(name="chat-completion")
generation = trace.generation(
    name="gpt4-chat",
    model="gpt-4",
    input=messages,
    metadata={"user_id": user_id}
)

response = openai.chat.completions.create(...)

generation.end(output=response.choices[0].message.content)
trace.end()
\`\`\`

**Phoenix by Arize** - Para monitoring de embeddings y RAG:

\`\`\`python
import phoenix as px

# Launch Phoenix server
session = px.launch_app()

# Auto-instrumentación
from phoenix.trace.openai import OpenAIInstrumentor
OpenAIInstrumentor().instrument()

# Todos los calls de OpenAI aparecen automáticamente en Phoenix UI
\`\`\`

**Métricas críticas a monitorear**:
- P50, P95, P99 latency
- Error rate por tipo
- Tokens/segundo throughput
- Cost per request
- Cache hit rate`,
      keyPoints: [
        'Distributed tracing end-to-end para debuggear issues en producción',
        'Structured logging en JSON para queries eficientes en Elasticsearch/CloudWatch',
        'Métricas Prometheus: latency (P95), throughput, errors, tokens, costos',
        'LangSmith/LangFuse/Phoenix ofrecen observabilidad específica para LLMs',
        'Monitorear P95 latency, error rate, cost/request y cache hit rate continuamente',
      ],
    },
    {
      title: 'Reliability Patterns',
      content: `Los LLMs fallan frecuentemente: rate limits, timeouts, errores intermitentes. Los patterns de reliability son esenciales.

## Fallbacks en Cascada

Intentar múltiples estrategias en orden de preferencia:

\`\`\`typescript
class FallbackChain {
  private strategies: Array<() => Promise<string>>;

  constructor() {
    this.strategies = [
      () => this.tryCache(),
      () => this.tryPrimaryModel(),
      () => this.trySecondaryModel(),
      () => this.tryDegradedResponse(),
    ];
  }

  async execute(prompt: string): Promise<string> {
    const errors: Error[] = [];

    for (const strategy of this.strategies) {
      try {
        const result = await strategy();
        return result;
      } catch (error) {
        errors.push(error);
        console.warn(\`Strategy failed, trying next: \${error.message}\`);
      }
    }

    throw new Error(\`All strategies failed: \${errors.map(e => e.message).join(', ')}\`);
  }

  private async tryCache(): Promise<string> {
    const cached = await cache.get(prompt);
    if (!cached) throw new Error('Cache miss');
    return cached;
  }

  private async tryPrimaryModel(): Promise<string> {
    return await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      timeout: 30000,
    });
  }

  private async trySecondaryModel(): Promise<string> {
    // Modelo más rápido/barato como fallback
    return await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      timeout: 15000,
    });
  }

  private async tryDegradedResponse(): Promise<string> {
    // Respuesta genérica cuando todo falla
    return "Lo siento, estamos experimentando problemas técnicos. Por favor intenta más tarde.";
  }
}
\`\`\`

## Circuit Breaker

Prevenir cascading failures abriendo el circuito cuando hay muchos errores:

\`\`\`python
from enum import Enum
import time

class CircuitState(Enum):
    CLOSED = "closed"  # Normal operation
    OPEN = "open"      # Blocking requests
    HALF_OPEN = "half_open"  # Testing recovery

class CircuitBreaker:
    def __init__(
        self,
        failure_threshold: int = 5,
        timeout: int = 60,
        expected_exception: type = Exception
    ):
        self.failure_threshold = failure_threshold
        self.timeout = timeout
        self.expected_exception = expected_exception

        self.failure_count = 0
        self.last_failure_time = None
        self.state = CircuitState.CLOSED

    def call(self, func, *args, **kwargs):
        if self.state == CircuitState.OPEN:
            if time.time() - self.last_failure_time > self.timeout:
                self.state = CircuitState.HALF_OPEN
                print("Circuit half-open, testing...")
            else:
                raise Exception("Circuit breaker is OPEN")

        try:
            result = func(*args, **kwargs)
            self._on_success()
            return result
        except self.expected_exception as e:
            self._on_failure()
            raise

    def _on_success(self):
        self.failure_count = 0
        self.state = CircuitState.CLOSED

    def _on_failure(self):
        self.failure_count += 1
        self.last_failure_time = time.time()

        if self.failure_count >= self.failure_threshold:
            self.state = CircuitState.OPEN
            print(f"Circuit breaker OPEN after {self.failure_count} failures")

# Uso
circuit_breaker = CircuitBreaker(failure_threshold=3, timeout=30)

def call_llm(prompt):
    return circuit_breaker.call(
        openai.chat.completions.create,
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}]
    )
\`\`\`

## Retry Strategies

Reintentos inteligentes con exponential backoff y jitter:

\`\`\`python
import random
import time
from functools import wraps

def retry_with_exponential_backoff(
    max_retries: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 60.0,
    exponential_base: float = 2.0,
    jitter: bool = True,
    retryable_exceptions: tuple = (Exception,)
):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_retries + 1):
                try:
                    return func(*args, **kwargs)
                except retryable_exceptions as e:
                    if attempt == max_retries:
                        raise

                    # Calcular delay con exponential backoff
                    delay = min(base_delay * (exponential_base ** attempt), max_delay)

                    # Agregar jitter para evitar thundering herd
                    if jitter:
                        delay = delay * (0.5 + random.random())

                    print(f"Attempt {attempt + 1} failed: {e}. Retrying in {delay:.2f}s...")
                    time.sleep(delay)

        return wrapper
    return decorator

# Uso
@retry_with_exponential_backoff(
    max_retries=5,
    base_delay=1.0,
    retryable_exceptions=(openai.RateLimitError, openai.APITimeoutError)
)
def robust_llm_call(prompt: str):
    return openai.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        timeout=30
    )
\`\`\`

## Multi-Provider Redundancy

Fallback automático a proveedores alternativos:

\`\`\`typescript
interface LLMProvider {
  name: string;
  generate(prompt: string): Promise<string>;
  isHealthy(): Promise<boolean>;
}

class MultiProviderLLM {
  private providers: LLMProvider[];
  private healthCheckInterval: NodeJS.Timeout;
  private healthStatus: Map<string, boolean> = new Map();

  constructor(providers: LLMProvider[]) {
    this.providers = providers;
    this.startHealthChecks();
  }

  private startHealthChecks() {
    this.healthCheckInterval = setInterval(async () => {
      for (const provider of this.providers) {
        const healthy = await provider.isHealthy();
        this.healthStatus.set(provider.name, healthy);
      }
    }, 30000);  // Check every 30s
  }

  async generate(prompt: string): Promise<string> {
    // Ordenar providers por health y preferencia
    const sortedProviders = this.providers
      .filter(p => this.healthStatus.get(p.name) !== false)
      .sort((a, b) => {
        // Preferir healthy providers
        const aHealth = this.healthStatus.get(a.name) ? 1 : 0;
        const bHealth = this.healthStatus.get(b.name) ? 1 : 0;
        return bHealth - aHealth;
      });

    const errors: Error[] = [];

    for (const provider of sortedProviders) {
      try {
        console.log(\`Trying provider: \${provider.name}\`);
        const result = await provider.generate(prompt);
        return result;
      } catch (error) {
        console.error(\`Provider \${provider.name} failed:\`, error);
        errors.push(error);
        this.healthStatus.set(provider.name, false);
      }
    }

    throw new Error(\`All providers failed: \${errors.map(e => e.message).join(', ')}\`);
  }
}

// Uso
const multiProvider = new MultiProviderLLM([
  new OpenAIProvider(),
  new AnthropicProvider(),
  new TogetherAIProvider(),
]);

const response = await multiProvider.generate(prompt);
\`\`\`

**Reliability metrics objetivo**:
- Uptime: 99.9% (SLA)
- Error rate: <0.1%
- Successful fallback rate: >95%
- Mean time to recovery: <5 min`,
      keyPoints: [
        'Fallback chain: cache → primary model → secondary model → degraded response',
        'Circuit breaker previene cascading failures bloqueando tras threshold de errores',
        'Retry con exponential backoff + jitter para rate limits y errores transitorios',
        'Multi-provider redundancy permite failover automático entre OpenAI/Anthropic/etc',
        'Objetivo: 99.9% uptime con <0.1% error rate usando todos los patterns combinados',
      ],
    },
    {
      title: 'Versionado y Experimentación',
      content: `Los prompts y modelos evolucionan constantemente. El versionado permite iterar sin romper producción.

## Prompt Versioning

Sistema de versionado para prompts con rollback:

\`\`\`typescript
interface PromptVersion {
  id: string;
  version: number;
  template: string;
  variables: string[];
  createdAt: Date;
  performance: {
    successRate: number;
    avgLatency: number;
    avgTokens: number;
  };
}

class PromptRegistry {
  private prompts: Map<string, PromptVersion[]> = new Map();

  register(id: string, template: string, variables: string[]): PromptVersion {
    const versions = this.prompts.get(id) || [];
    const version: PromptVersion = {
      id,
      version: versions.length + 1,
      template,
      variables,
      createdAt: new Date(),
      performance: { successRate: 0, avgLatency: 0, avgTokens: 0 }
    };

    versions.push(version);
    this.prompts.set(id, versions);

    return version;
  }

  get(id: string, version?: number): PromptVersion {
    const versions = this.prompts.get(id);
    if (!versions?.length) throw new Error(\`Prompt \${id} not found\`);

    if (version) {
      const prompt = versions.find(v => v.version === version);
      if (!prompt) throw new Error(\`Version \${version} not found\`);
      return prompt;
    }

    // Return latest version by default
    return versions[versions.length - 1];
  }

  rollback(id: string, toVersion: number): void {
    const versions = this.prompts.get(id);
    if (!versions) throw new Error(\`Prompt \${id} not found\`);

    const targetVersion = versions.find(v => v.version === toVersion);
    if (!targetVersion) throw new Error(\`Version \${toVersion} not found\`);

    // Create new version with old template
    this.register(id, targetVersion.template, targetVersion.variables);
    console.log(\`Rolled back \${id} to version \${toVersion}\`);
  }

  updatePerformance(id: string, version: number, metrics: Partial<PromptVersion['performance']>): void {
    const prompt = this.get(id, version);
    prompt.performance = { ...prompt.performance, ...metrics };
  }
}

// Uso
const registry = new PromptRegistry();

registry.register(
  'summarize-article',
  'Summarize the following article in {length} words:\\n\\n{article}',
  ['length', 'article']
);

// Usar prompt versionado
const prompt = registry.get('summarize-article');
const filled = prompt.template
  .replace('{length}', '100')
  .replace('{article}', articleText);

// Rollback si la nueva versión falla
registry.rollback('summarize-article', 1);
\`\`\`

## A/B Testing de Prompts

Framework para experimentar con variantes de prompts:

\`\`\`python
from dataclasses import dataclass
from typing import Dict, List
import random
import numpy as np

@dataclass
class PromptVariant:
    name: str
    template: str
    traffic_percentage: float
    metrics: Dict[str, List[float]]

class PromptABTest:
    def __init__(self, test_name: str):
        self.test_name = test_name
        self.variants: List[PromptVariant] = []
        self.total_requests = 0

    def add_variant(self, name: str, template: str, traffic: float):
        variant = PromptVariant(
            name=name,
            template=template,
            traffic_percentage=traffic,
            metrics={
                'latency': [],
                'tokens': [],
                'success': [],
                'quality_score': []
            }
        )
        self.variants.append(variant)

    def select_variant(self) -> PromptVariant:
        """Select variant based on traffic allocation"""
        rand = random.random()
        cumulative = 0

        for variant in self.variants:
            cumulative += variant.traffic_percentage
            if rand < cumulative:
                return variant

        return self.variants[-1]

    def record_result(
        self,
        variant_name: str,
        latency: float,
        tokens: int,
        success: bool,
        quality_score: float
    ):
        variant = next(v for v in self.variants if v.name == variant_name)
        variant.metrics['latency'].append(latency)
        variant.metrics['tokens'].append(tokens)
        variant.metrics['success'].append(1 if success else 0)
        variant.metrics['quality_score'].append(quality_score)
        self.total_requests += 1

    def get_results(self) -> Dict:
        results = {}

        for variant in self.variants:
            if not variant.metrics['latency']:
                continue

            results[variant.name] = {
                'requests': len(variant.metrics['latency']),
                'success_rate': np.mean(variant.metrics['success']) * 100,
                'avg_latency': np.mean(variant.metrics['latency']),
                'avg_tokens': np.mean(variant.metrics['tokens']),
                'avg_quality': np.mean(variant.metrics['quality_score']),
                'p95_latency': np.percentile(variant.metrics['latency'], 95)
            }

        return results

    def get_winner(self, metric: str = 'quality_score') -> str:
        """Determine winning variant based on metric"""
        best_variant = None
        best_score = -float('inf')

        for variant in self.variants:
            if not variant.metrics[metric]:
                continue

            score = np.mean(variant.metrics[metric])
            if score > best_score:
                best_score = score
                best_variant = variant.name

        return best_variant

# Uso
ab_test = PromptABTest('summarization-test')

ab_test.add_variant(
    'control',
    'Summarize this article: {article}',
    traffic=0.5
)

ab_test.add_variant(
    'variant-detailed',
    'Provide a comprehensive summary of the following article, focusing on key points and implications: {article}',
    traffic=0.5
)

# En cada request
variant = ab_test.select_variant()
response = llm.generate(variant.template.format(article=article))

# Registrar resultado
ab_test.record_result(
    variant.name,
    latency=response_time,
    tokens=response.usage.total_tokens,
    success=True,
    quality_score=evaluate_quality(response.content)
)

# Después de 1000+ requests
results = ab_test.get_results()
winner = ab_test.get_winner('quality_score')
print(f"Winner: {winner}")
print(f"Results: {results}")
\`\`\`

## Feature Flags

Control granular de features con rollout gradual:

\`\`\`typescript
class FeatureFlags {
  private flags: Map<string, {
    enabled: boolean;
    rolloutPercentage: number;
    enabledUsers?: Set<string>;
  }> = new Map();

  setFlag(
    name: string,
    enabled: boolean,
    rolloutPercentage: number = 100,
    enabledUsers?: string[]
  ) {
    this.flags.set(name, {
      enabled,
      rolloutPercentage,
      enabledUsers: enabledUsers ? new Set(enabledUsers) : undefined
    });
  }

  isEnabled(name: string, userId?: string): boolean {
    const flag = this.flags.get(name);
    if (!flag) return false;

    if (!flag.enabled) return false;

    // Whitelist de usuarios específicos
    if (flag.enabledUsers && userId) {
      return flag.enabledUsers.has(userId);
    }

    // Rollout gradual basado en hash de userId
    if (userId && flag.rolloutPercentage < 100) {
      const hash = this.hashCode(userId);
      const bucket = hash % 100;
      return bucket < flag.rolloutPercentage;
    }

    return flag.rolloutPercentage === 100;
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}

// Uso
const flags = new FeatureFlags();

// Rollout gradual: 10% → 50% → 100%
flags.setFlag('new-prompt-v2', true, 10);

// En el código
async function generateResponse(userId: string, prompt: string) {
  let finalPrompt;

  if (flags.isEnabled('new-prompt-v2', userId)) {
    finalPrompt = newPromptTemplate(prompt);
  } else {
    finalPrompt = oldPromptTemplate(prompt);
  }

  return await llm.generate(finalPrompt);
}

// Incrementar gradualmente si métricas son buenas
setTimeout(() => flags.setFlag('new-prompt-v2', true, 50), 24 * 60 * 60 * 1000);
setTimeout(() => flags.setFlag('new-prompt-v2', true, 100), 48 * 60 * 60 * 1000);
\`\`\`

## Rollback Strategy

Plan de rollback automático ante degradación:

\`\`\`python
class AutoRollback:
    def __init__(self, metric_threshold: Dict[str, float]):
        self.threshold = metric_threshold
        self.monitoring_window = 300  # 5 minutes
        self.metrics_buffer = []

    def check_and_rollback(self, current_metrics: Dict[str, float]) -> bool:
        self.metrics_buffer.append({
            'timestamp': time.time(),
            'metrics': current_metrics
        })

        # Mantener solo últimos 5 minutos
        cutoff = time.time() - self.monitoring_window
        self.metrics_buffer = [
            m for m in self.metrics_buffer
            if m['timestamp'] > cutoff
        ]

        if len(self.metrics_buffer) < 10:
            return False  # No suficientes datos

        # Calcular promedios
        avg_metrics = {}
        for key in current_metrics.keys():
            values = [m['metrics'][key] for m in self.metrics_buffer]
            avg_metrics[key] = np.mean(values)

        # Verificar si alguna métrica excede threshold
        for metric, threshold in self.threshold.items():
            if avg_metrics.get(metric, 0) > threshold:
                print(f"⚠️  AUTO-ROLLBACK: {metric} = {avg_metrics[metric]:.2f} > {threshold}")
                self.execute_rollback()
                return True

        return False

    def execute_rollback(self):
        # Rollback a última versión estable
        registry.rollback('main-prompt', previous_stable_version)
        flags.setFlag('new-feature', False)

        # Alertar equipo
        send_alert("Auto-rollback executed due to metric degradation")

# Uso
rollback_manager = AutoRollback({
    'error_rate': 0.05,  # 5% máximo
    'avg_latency': 3000,  # 3s máximo
    'p95_latency': 5000   # 5s máximo
})

# En cada batch de requests
if rollback_manager.check_and_rollback(current_metrics):
    print("System rolled back automatically")
\`\`\`

**Best practices**:
- Empezar con 5-10% traffic para nuevas variantes
- A/B test mínimo 1000 requests para significancia estadística
- Rollback automático si error rate >2x baseline
- Versionar prompts en Git junto con código`,
      keyPoints: [
        'Prompt versioning permite iterar y rollback sin romper producción',
        'A/B testing de prompts con traffic splitting para optimización continua',
        'Feature flags permiten rollout gradual: 10% → 50% → 100%',
        'Auto-rollback basado en métricas previene degradación prolongada',
        'Versionar prompts en Git, mínimo 1000 requests para A/B tests significativos',
      ],
    },
    {
      title: 'Scaling en Producción',
      content: `Escalar LLMs requiere arquitectura distribuida para manejar carga variable y picos de tráfico.

## Horizontal Scaling

Múltiples instancias detrás de load balancer:

\`\`\`typescript
// Docker Compose para scaling
// docker-compose.yml
const dockerCompose = \`
version: '3.8'
services:
  llm-service:
    image: llm-service:latest
    deploy:
      replicas: 5  # 5 instancias
      resources:
        limits:
          cpus: '2'
          memory: 4G
    environment:
      - OPENAI_API_KEY=\${OPENAI_API_KEY}
      - REDIS_URL=redis://redis:6379

  nginx:
    image: nginx:latest
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - llm-service

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
\`;

// nginx.conf - Load balancing
const nginxConfig = \`
upstream llm_backend {
    least_conn;  # Route to instance with least connections

    server llm-service:8000 max_fails=3 fail_timeout=30s;
    server llm-service:8001 max_fails=3 fail_timeout=30s;
    server llm-service:8002 max_fails=3 fail_timeout=30s;
    server llm-service:8003 max_fails=3 fail_timeout=30s;
    server llm-service:8004 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;

    location /api/generate {
        proxy_pass http://llm_backend;
        proxy_timeout 60s;
        proxy_next_upstream error timeout http_502 http_503;
    }
}
\`;
\`\`\`

## Kubernetes Auto-scaling

Auto-scaling basado en CPU y métricas custom:

\`\`\`yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: llm-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: llm-service
  template:
    metadata:
      labels:
        app: llm-service
    spec:
      containers:
      - name: llm-service
        image: llm-service:latest
        resources:
          requests:
            cpu: "1000m"
            memory: "2Gi"
          limits:
            cpu: "2000m"
            memory: "4Gi"
        env:
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: llm-secrets
              key: openai-api-key

---
# hpa.yaml - Horizontal Pod Autoscaler
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: llm-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: llm-service
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Pods
    pods:
      metric:
        name: concurrent_requests
      target:
        type: AverageValue
        averageValue: "10"
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Pods
        value: 1
        periodSeconds: 60
\`\`\`

## Rate Limiting

Prevenir abuse y controlar costos:

\`\`\`python
from redis import Redis
import time

class RateLimiter:
    def __init__(self, redis_client: Redis):
        self.redis = redis_client

    def check_rate_limit(
        self,
        key: str,
        max_requests: int,
        window_seconds: int
    ) -> tuple[bool, dict]:
        """
        Sliding window rate limiter
        Returns: (allowed, info_dict)
        """
        now = time.time()
        window_start = now - window_seconds

        # Redis sorted set para sliding window
        pipe = self.redis.pipeline()

        # Limpiar requests viejos
        pipe.zremrangebyscore(key, 0, window_start)

        # Contar requests en ventana
        pipe.zcard(key)

        # Agregar request actual
        pipe.zadd(key, {str(now): now})

        # Expirar key
        pipe.expire(key, window_seconds)

        results = pipe.execute()
        request_count = results[1]

        allowed = request_count < max_requests

        return allowed, {
            'limit': max_requests,
            'remaining': max(0, max_requests - request_count - 1),
            'reset': int(now + window_seconds)
        }

# Middleware de rate limiting
class RateLimitMiddleware:
    def __init__(self):
        self.limiter = RateLimiter(redis_client)

        # Diferentes límites por tier
        self.tiers = {
            'free': {'requests': 100, 'window': 3600},      # 100/hour
            'pro': {'requests': 1000, 'window': 3600},      # 1000/hour
            'enterprise': {'requests': 10000, 'window': 3600}  # 10k/hour
        }

    async def __call__(self, request, user_id: str, tier: str):
        config = self.tiers[tier]
        key = f"rate_limit:{user_id}"

        allowed, info = self.limiter.check_rate_limit(
            key,
            config['requests'],
            config['window']
        )

        if not allowed:
            raise RateLimitExceeded(
                f"Rate limit exceeded. Limit: {info['limit']}, "
                f"Reset in {info['reset'] - time.time():.0f}s"
            )

        # Agregar headers de rate limit
        response = await process_request(request)
        response.headers['X-RateLimit-Limit'] = str(info['limit'])
        response.headers['X-RateLimit-Remaining'] = str(info['remaining'])
        response.headers['X-RateLimit-Reset'] = str(info['reset'])

        return response
\`\`\`

## Queue-Based Processing

Desacoplar requests de procesamiento para manejar spikes:

\`\`\`typescript
import Bull from 'bull';
import { Redis } from 'ioredis';

// Definir queue
const llmQueue = new Bull('llm-requests', {
  redis: { host: 'localhost', port: 6379 },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: true,
    removeOnFail: false,
  }
});

// Producer: Agregar jobs a queue
async function enqueueGeneration(userId: string, prompt: string, priority: number = 1) {
  const job = await llmQueue.add('generate', {
    userId,
    prompt,
    timestamp: Date.now()
  }, {
    priority,  // 1 = highest, 10 = lowest
  });

  return job.id;
}

// Consumer: Procesar jobs
llmQueue.process('generate', 5, async (job) => {  // 5 concurrent workers
  const { userId, prompt } = job.data;

  // Update progress
  await job.progress(10);

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    });

    await job.progress(100);

    // Store result in Redis
    await redis.setex(
      \`result:\${job.id}\`,
      3600,
      JSON.stringify(response.choices[0].message.content)
    );

    return { success: true, jobId: job.id };
  } catch (error) {
    console.error(\`Job \${job.id} failed:\`, error);
    throw error;  // Bull will retry
  }
});

// API endpoint para obtener resultado
app.get('/api/result/:jobId', async (req, res) => {
  const result = await redis.get(\`result:\${req.params.jobId}\`);

  if (result) {
    res.json({ status: 'completed', result: JSON.parse(result) });
  } else {
    const job = await llmQueue.getJob(req.params.jobId);
    const state = await job.getState();

    res.json({
      status: state,
      progress: job.progress(),
      position: await job.getPosition()
    });
  }
});

// Monitoreo de queue
llmQueue.on('completed', (job) => {
  console.log(\`Job \${job.id} completed\`);
});

llmQueue.on('failed', (job, err) => {
  console.error(\`Job \${job.id} failed:\`, err);
});

// Metrics
app.get('/api/queue/stats', async (req, res) => {
  const stats = {
    waiting: await llmQueue.getWaitingCount(),
    active: await llmQueue.getActiveCount(),
    completed: await llmQueue.getCompletedCount(),
    failed: await llmQueue.getFailedCount(),
  };

  res.json(stats);
});
\`\`\`

## Arquitectura de Referencia

\`\`\`
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│   Load Balancer (NGINX) │
└──────────┬──────────────┘
           │
     ┌─────┴─────┐
     ▼           ▼
┌─────────┐ ┌─────────┐
│ API 1   │ │ API 2   │  (Auto-scaled replicas)
└────┬────┘ └────┬────┘
     │           │
     └─────┬─────┘
           ▼
     ┌───────────┐
     │   Redis   │  (Cache + Rate Limiting)
     └───────────┘
           │
           ▼
     ┌───────────┐
     │Bull Queue │  (Async processing)
     └─────┬─────┘
           │
      ┌────┴────┐
      ▼         ▼
  ┌────────┐┌────────┐
  │Worker 1││Worker 2│  (Process LLM requests)
  └────────┘└────────┘
\`\`\`

**Capacity planning**:
- 1 worker procesa ~10-20 req/min (dependiendo de latencia LLM)
- Para 10K req/hour: ~10-15 workers
- Redis: 10GB RAM soporta ~10M cache entries`,
      keyPoints: [
        'Horizontal scaling con load balancer distribuye carga entre múltiples instancias',
        'Kubernetes HPA auto-escala basado en CPU y métricas custom (concurrent requests)',
        'Rate limiting por tier (free/pro/enterprise) previene abuse y controla costos',
        'Queue-based processing desacopla requests de procesamiento para manejar spikes',
        'Arquitectura típica: LB → API replicas → Redis → Bull Queue → Workers',
      ],
    },
  ],
};
