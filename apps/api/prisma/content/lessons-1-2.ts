// @ts-nocheck
export const introToLlms = {
  sections: [
    {
      title: '¿Qué es un LLM?',
      content: `Un **Large Language Model (LLM)** o Modelo de Lenguaje Grande es un tipo de modelo de inteligencia artificial entrenado en grandes cantidades de texto para comprender y generar lenguaje natural de manera coherente y contextualmente relevante.

Los LLMs se basan en la **arquitectura Transformer**, introducida en el paper "Attention is All You Need" (2017). Esta arquitectura revolucionó el procesamiento de lenguaje natural al introducir el mecanismo de atención, que permite al modelo enfocarse en diferentes partes del texto de entrada de manera simultánea.

**Pre-entrenamiento**: Los LLMs pasan por dos fases principales:

1. **Pre-training**: El modelo se entrena en enormes corpus de texto (libros, artículos, código, páginas web) usando objetivos auto-supervisados como predecir la siguiente palabra. Esta fase puede tomar semanas o meses en clusters de GPUs/TPUs.

2. **Fine-tuning**: El modelo se ajusta para tareas específicas usando técnicas como:
   - **Supervised Fine-Tuning (SFT)**: Entrenamiento con ejemplos etiquetados
   - **Reinforcement Learning from Human Feedback (RLHF)**: Alineación con preferencias humanas
   - **Instruction Tuning**: Seguimiento de instrucciones específicas

La arquitectura Transformer consta de capas apiladas de:
- **Multi-Head Attention**: Permite al modelo atender a diferentes posiciones del contexto
- **Feed-Forward Networks**: Procesa la información de manera no lineal
- **Layer Normalization**: Estabiliza el entrenamiento
- **Residual Connections**: Facilita el flujo de gradientes

Los modelos actuales como GPT-4 o Claude pueden tener cientos de miles de millones de parámetros, lo que les permite capturar patrones lingüísticos extremadamente complejos.`,
      keyPoints: [
        'Los LLMs son modelos de IA entrenados en grandes cantidades de texto para comprender y generar lenguaje',
        'Se basan en la arquitectura Transformer con mecanismos de atención que procesan contexto de manera eficiente',
        'El pre-entrenamiento auto-supervisado seguido de fine-tuning permite crear modelos versátiles y especializados',
        'Los componentes clave incluyen multi-head attention, feed-forward networks y normalización de capas'
      ],
    },
    {
      title: 'Cómo funcionan los LLMs',
      content: `Para entender cómo funcionan los LLMs, debemos comprender varios conceptos fundamentales:

**Tokenización**

Los LLMs no procesan texto directamente, sino que lo convierten en **tokens**. Un token puede ser una palabra completa, parte de una palabra, o incluso un solo carácter. Los tokenizadores modernos como BPE (Byte Pair Encoding) o SentencePiece dividen el texto de manera eficiente.

Ejemplo de tokenización:
\`\`\`
Texto: "LLM Engineering es increíble"
Tokens: ["LL", "M", " Engineering", " es", " incre", "íble"]
Token IDs: [2837, 44, 17943, 1658, 43829, 28394]
\`\`\`

**Embeddings**

Cada token se convierte en un **vector de embedding** de alta dimensión (típicamente 768-12,288 dimensiones). Estos vectores capturan el significado semántico del token. Palabras similares tienen embeddings cercanos en el espacio vectorial.

\`\`\`python
# Ejemplo conceptual
token_id = 2837  # "LL"
embedding = embedding_matrix[token_id]  # Vector de 4096 dimensiones
# embedding = [0.123, -0.456, 0.789, ..., 0.234]
\`\`\`

**Mecanismo de Atención**

El corazón de los Transformers es el mecanismo de **atención**, que permite al modelo determinar qué partes del contexto son más relevantes para cada token.

Para cada token, el modelo calcula:
- **Query (Q)**: "¿Qué estoy buscando?"
- **Key (K)**: "¿Qué información tengo?"
- **Value (V)**: "¿Qué información proporciono?"

La atención se calcula como:
\`\`\`
Attention(Q, K, V) = softmax(Q·K^T / √d_k) · V
\`\`\`

**Generación de Texto**

Los LLMs generan texto de manera **auto-regresiva**:

1. Procesan el prompt de entrada
2. Predicen la probabilidad del siguiente token
3. Seleccionan un token (usando sampling, greedy, o beam search)
4. Añaden el token a la secuencia
5. Repiten el proceso hasta alcanzar un token de fin o límite de tokens

\`\`\`javascript
// Ejemplo simplificado del proceso de generación
async function generateText(prompt, maxTokens) {
  let tokens = tokenize(prompt);

  for (let i = 0; i < maxTokens; i++) {
    const probabilities = await model.predict(tokens);
    const nextToken = sample(probabilities);

    if (nextToken === END_TOKEN) break;

    tokens.push(nextToken);
  }

  return detokenize(tokens);
}
\`\`\`

**Contexto y Ventana de Contexto**

Los modelos tienen una **ventana de contexto** limitada (por ejemplo, 8K, 32K, 128K, o incluso 200K tokens). Todo lo que el modelo "ve" debe caber en esta ventana, incluyendo el prompt y la respuesta generada.`,
      keyPoints: [
        'La tokenización convierte texto en unidades procesables (tokens) que se mapean a IDs numéricos',
        'Los embeddings transforman tokens en vectores de alta dimensión que capturan significado semántico',
        'El mecanismo de atención permite al modelo enfocarse en partes relevantes del contexto usando queries, keys y values',
        'La generación es auto-regresiva: el modelo predice un token a la vez basándose en todos los tokens anteriores',
        'La ventana de contexto limita cuánta información puede procesar el modelo simultáneamente'
      ],
    },
    {
      title: 'Modelos Populares',
      content: `El ecosistema de LLMs ha crecido enormemente, con diferentes modelos optimizados para diversos casos de uso. Aquí los más relevantes para desarrolladores:

**GPT-4 y GPT-4 Turbo (OpenAI)**

- **Capacidades**: Modelo más avanzado de OpenAI, excelente en razonamiento complejo, código, y análisis
- **Ventana de contexto**: 8K-128K tokens dependiendo de la variante
- **Casos de uso**: Aplicaciones que requieren máxima calidad, razonamiento multi-paso, generación de código complejo
- **Limitaciones**: Costo más alto, latencia mayor que modelos más pequeños

\`\`\`typescript
// Ejemplo de uso con OpenAI API
const response = await openai.chat.completions.create({
  model: "gpt-4-turbo-preview",
  messages: [
    { role: "system", content: "Eres un asistente experto en código." },
    { role: "user", content: "Explica async/await en JavaScript" }
  ],
  max_tokens: 500
});
\`\`\`

**Claude (Anthropic)**

- **Claude 3.5 Sonnet**: Balance óptimo entre velocidad y capacidad
- **Claude 3 Opus**: Máximo rendimiento en tareas complejas
- **Claude 3 Haiku**: Rápido y económico para tareas simples
- **Ventana de contexto**: Hasta 200K tokens
- **Fortalezas**: Excelente en seguir instrucciones, análisis de documentos largos, código limpio
- **Filosofía**: Enfoque en seguridad y valores constitucionales AI

**Llama (Meta)**

- **Llama 3 y 3.1**: Modelos open-source de alta calidad
- **Tamaños**: 8B, 70B, 405B parámetros
- **Ventaja**: Puede ejecutarse localmente o en infraestructura propia
- **Casos de uso**: Proyectos que requieren control total, privacidad de datos, o fine-tuning personalizado

\`\`\`python
# Ejemplo con Llama usando transformers
from transformers import AutoModelForCausalLM, AutoTokenizer

model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-3-8b")
tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-3-8b")

inputs = tokenizer("¿Qué es un closure en JavaScript?", return_tensors="pt")
outputs = model.generate(**inputs, max_length=200)
response = tokenizer.decode(outputs[0])
\`\`\`

**Mistral (Mistral AI)**

- **Mistral 7B**: Modelo pequeño pero potente, open-source
- **Mixtral 8x7B**: Mixture of Experts, excelente rendimiento/costo
- **Mistral Large**: Competidor directo de GPT-4
- **Fortaleza**: Eficiencia excepcional, buena relación rendimiento/tamaño

**Gemini (Google)**

- **Gemini Pro**: Modelo multimodal (texto, imágenes, video)
- **Gemini Ultra**: Máximo rendimiento
- **Ventaja**: Integración nativa con ecosistema Google, capacidades multimodales

**¿Cuál elegir?**

| Criterio | Recomendación |
|----------|---------------|
| Máxima calidad | GPT-4, Claude 3 Opus |
| Balance calidad/velocidad | Claude 3.5 Sonnet, GPT-4 Turbo |
| Velocidad/economía | Claude 3 Haiku, GPT-3.5 Turbo |
| Open-source | Llama 3, Mistral |
| Contexto largo | Claude (200K), Gemini Pro (1M+) |
| Multimodal | GPT-4 Vision, Gemini Pro |

**Diferencias Clave**:

- **Estilo de respuesta**: Claude tiende a ser más conversacional, GPT-4 más directo
- **Seguridad**: Claude tiene más restricciones por diseño, GPT-4 usa moderación activa
- **Costo**: Varía significativamente; modelos open-source son gratuitos pero requieren infraestructura
- **Latencia**: Modelos más pequeños (Haiku, GPT-3.5) son más rápidos`,
      keyPoints: [
        'GPT-4 y Claude 3 Opus ofrecen la máxima calidad para tareas complejas con mayor costo',
        'Modelos como Claude 3.5 Sonnet y GPT-4 Turbo balancean rendimiento y velocidad eficientemente',
        'Llama 3 y Mistral son alternativas open-source que permiten control total y ejecución local',
        'La elección del modelo depende de requisitos específicos: calidad, velocidad, costo, privacidad y multimodalidad',
        'Claude destaca en contextos largos (200K tokens) mientras Gemini ofrece capacidades multimodales avanzadas'
      ],
    },
    {
      title: 'Aplicaciones Prácticas',
      content: `Los LLMs han habilitado una nueva generación de aplicaciones. Aquí las arquitecturas más comunes que debes conocer como LLM Engineer:

**1. Chatbots Conversacionales**

La aplicación más directa: interfaces de chat que mantienen contexto y responden preguntas.

\`\`\`typescript
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

class Chatbot {
  private conversationHistory: Message[] = [];

  constructor(systemPrompt: string) {
    this.conversationHistory.push({
      role: 'system',
      content: systemPrompt
    });
  }

  async chat(userMessage: string): Promise<string> {
    this.conversationHistory.push({
      role: 'user',
      content: userMessage
    });

    const response = await callLLM({
      messages: this.conversationHistory,
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000
    });

    this.conversationHistory.push({
      role: 'assistant',
      content: response.content
    });

    return response.content;
  }
}

// Uso
const bot = new Chatbot("Eres un asistente experto en TypeScript.");
await bot.chat("¿Qué son los generics?");
await bot.chat("Dame un ejemplo práctico");  // Mantiene contexto
\`\`\`

**2. Code Assistants (Asistentes de Código)**

LLMs especializados en generar, explicar y refactorizar código. GitHub Copilot y Cursor son ejemplos populares.

**Casos de uso**:
- Autocompletado inteligente
- Generación de tests
- Documentación automática
- Refactorización de código
- Explicación de código legacy

\`\`\`typescript
async function generateTests(sourceCode: string): Promise<string> {
  const prompt = \`Genera tests unitarios completos para el siguiente código:

\${sourceCode}

Usa Jest y incluye casos edge, happy path y manejo de errores.\`;

  const response = await callLLM({
    messages: [{ role: 'user', content: prompt }],
    model: 'gpt-4-turbo-preview'
  });

  return response.content;
}
\`\`\`

**3. RAG (Retrieval-Augmented Generation)**

Arquitectura que combina búsqueda de información con generación de LLMs para responder preguntas basadas en documentos específicos.

**Flujo de RAG**:

1. **Indexación** (offline):
   - Divide documentos en chunks
   - Genera embeddings para cada chunk
   - Almacena en base de datos vectorial (Pinecone, Weaviate, Chroma)

2. **Recuperación** (runtime):
   - Usuario hace una pregunta
   - Genera embedding de la pregunta
   - Busca chunks más similares (similarity search)

3. **Generación**:
   - Inserta chunks relevantes en el prompt
   - LLM genera respuesta basada en contexto proporcionado

\`\`\`typescript
async function ragQuery(question: string): Promise<string> {
  // 1. Generar embedding de la pregunta
  const questionEmbedding = await generateEmbedding(question);

  // 2. Buscar documentos relevantes
  const relevantDocs = await vectorDB.similaritySearch(
    questionEmbedding,
    topK: 5
  );

  // 3. Construir prompt con contexto
  const context = relevantDocs.map(doc => doc.content).join('\n\n');
  const prompt = \`Usa el siguiente contexto para responder la pregunta.

Contexto:
\${context}

Pregunta: \${question}

Respuesta basada únicamente en el contexto:\`;

  // 4. Generar respuesta
  const response = await callLLM({
    messages: [{ role: 'user', content: prompt }],
    model: 'claude-3-5-sonnet-20241022'
  });

  return response.content;
}
\`\`\`

**4. Agents (Agentes Autónomos)**

LLMs que pueden usar herramientas, tomar decisiones y ejecutar acciones multi-paso para completar objetivos complejos.

**Características**:
- **Planning**: Descomponen tareas en pasos
- **Tool Use**: Llaman APIs, ejecutan código, acceden a bases de datos
- **Memory**: Mantienen estado entre interacciones
- **Reflection**: Evalúan sus propias respuestas

\`\`\`typescript
interface Tool {
  name: string;
  description: string;
  execute: (params: any) => Promise<any>;
}

const tools: Tool[] = [
  {
    name: 'search_database',
    description: 'Busca información en la base de datos de productos',
    execute: async (query: string) => {
      return await db.products.search(query);
    }
  },
  {
    name: 'calculate',
    description: 'Realiza cálculos matemáticos',
    execute: async (expression: string) => {
      return eval(expression);  // Usar librería segura en producción
    }
  }
];

async function runAgent(task: string): Promise<string> {
  let currentTask = task;
  let iterations = 0;
  const maxIterations = 10;

  while (iterations < maxIterations) {
    const response = await callLLM({
      messages: [
        {
          role: 'system',
          content: \`Eres un agente que puede usar herramientas. Herramientas disponibles:
\${tools.map(t => \`- \${t.name}: \${t.description}\`).join('\n')}

Para usar una herramienta, responde con: TOOL: nombre_herramienta(parámetros)
Cuando completes la tarea, responde con: DONE: respuesta final\`
        },
        { role: 'user', content: currentTask }
      ]
    });

    if (response.content.startsWith('DONE:')) {
      return response.content.substring(5).trim();
    }

    if (response.content.startsWith('TOOL:')) {
      // Parsear y ejecutar herramienta
      const [toolName, params] = parseToolCall(response.content);
      const tool = tools.find(t => t.name === toolName);
      const result = await tool?.execute(params);
      currentTask = \`Resultado de \${toolName}: \${result}\nContinúa con la tarea original.\`;
    }

    iterations++;
  }

  return "Tarea no completada en el límite de iteraciones";
}
\`\`\`

**Otros Casos de Uso Emergentes**:

- **Generación de contenido**: Marketing, emails, documentación
- **Análisis de sentimiento**: Procesamiento de feedback y reseñas
- **Traducción y localización**: Traducción contextual de alta calidad
- **Clasificación y extracción**: Categorización de tickets, extracción de entidades
- **Moderación de contenido**: Detección de contenido inapropiado
- **Personalización**: Recomendaciones basadas en preferencias del usuario

La clave para usar LLMs efectivamente es elegir la arquitectura correcta para tu caso de uso y combinar diferentes técnicas cuando sea necesario.`,
      keyPoints: [
        'Los chatbots conversacionales mantienen historial de mensajes para contexto continuo y respuestas coherentes',
        'RAG combina búsqueda vectorial con LLMs para responder preguntas basadas en documentos específicos sin reentrenamiento',
        'Los agentes autónomos pueden planificar, usar herramientas y ejecutar tareas multi-paso de manera independiente',
        'Los code assistants especializados mejoran productividad en generación, testing y documentación de código',
        'La elección de arquitectura (chatbot, RAG, agent) depende de los requisitos específicos de tu aplicación'
      ],
    },
  ],
};

export const apiBasics = {
  sections: [
    {
      title: 'Estructura de una API de LLM',
      content: `Las APIs de LLMs siguen patrones RESTful estándar pero con características específicas para el procesamiento de lenguaje. Entender su estructura es fundamental para integrarlas en tus aplicaciones.

**Endpoints Principales**

La mayoría de proveedores exponen endpoints similares:

**OpenAI API**:
\`\`\`
POST https://api.openai.com/v1/chat/completions
POST https://api.openai.com/v1/completions (legacy)
POST https://api.openai.com/v1/embeddings
POST https://api.openai.com/v1/moderations
\`\`\`

**Anthropic (Claude)**:
\`\`\`
POST https://api.anthropic.com/v1/messages
POST https://api.anthropic.com/v1/complete (legacy)
\`\`\`

**Autenticación**

Todas las APIs de LLMs requieren autenticación mediante API keys. Estas se envían en los headers de cada request.

**OpenAI**:
\`\`\`typescript
const headers = {
  'Authorization': 'Bearer sk-proj-xxxxxxxxxxxxx',
  'Content-Type': 'application/json'
};
\`\`\`

**Anthropic**:
\`\`\`typescript
const headers = {
  'x-api-key': 'sk-ant-xxxxxxxxxxxxx',
  'anthropic-version': '2023-06-01',
  'Content-Type': 'application/json'
};
\`\`\`

**Importante sobre API Keys**:
- Nunca expongas tus API keys en código del frontend
- Usa variables de entorno: \`process.env.OPENAI_API_KEY\`
- Rota las keys regularmente
- Usa diferentes keys para desarrollo y producción
- Implementa rate limiting en tu backend

**Headers Comunes**

| Header | Propósito | Ejemplo |
|--------|-----------|---------|
| Authorization | Autenticación (OpenAI) | Bearer sk-... |
| x-api-key | Autenticación (Anthropic) | sk-ant-... |
| Content-Type | Formato del body | application/json |
| anthropic-version | Versión API (Anthropic) | 2023-06-01 |

**Estructura del Request**

Un request típico incluye:

\`\`\`typescript
interface ChatRequest {
  model: string;              // Modelo a usar
  messages: Message[];        // Array de mensajes
  max_tokens?: number;        // Límite de tokens de respuesta
  temperature?: number;       // Creatividad (0-2)
  top_p?: number;            // Nucleus sampling
  stream?: boolean;          // Streaming de respuesta
  stop?: string[];           // Secuencias de parada
  // ... otros parámetros
}

// Ejemplo completo
const request = {
  model: "gpt-4-turbo-preview",
  messages: [
    { role: "system", content: "Eres un asistente útil." },
    { role: "user", content: "Hola, ¿cómo estás?" }
  ],
  max_tokens: 500,
  temperature: 0.7
};
\`\`\`

**Ejemplo de Request Completo**

\`\`\`typescript
async function callOpenAI(prompt: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${process.env.OPENAI_API_KEY}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'user', content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error(\`API Error: \${response.status} \${response.statusText}\`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
\`\`\`

**Manejo de Errores HTTP**

| Código | Significado | Acción |
|--------|-------------|--------|
| 200 | Éxito | Procesar respuesta |
| 400 | Bad Request | Revisar formato del request |
| 401 | No autorizado | Verificar API key |
| 429 | Rate limit | Implementar retry con backoff |
| 500 | Error servidor | Retry con exponential backoff |
| 503 | Servicio no disponible | Esperar y reintentar |

**Rate Limiting**

Las APIs tienen límites de:
- **RPM** (Requests Per Minute): Número de requests por minuto
- **TPM** (Tokens Per Minute): Tokens procesados por minuto
- **TPD** (Tokens Per Day): Límite diario de tokens

Ejemplo de implementación de retry con backoff:

\`\`\`typescript
async function callWithRetry(
  fn: () => Promise<any>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<any> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (error.status === 429 || error.status >= 500) {
        const delay = baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;  // No reintentar otros errores
    }
  }
  throw new Error('Max retries alcanzados');
}
\`\`\``,
      keyPoints: [
        'Las APIs de LLMs usan endpoints RESTful con autenticación mediante API keys en headers',
        'Nunca expongas API keys en frontend; usa variables de entorno y proxy desde backend',
        'Los headers principales incluyen Authorization/x-api-key, Content-Type y versión de API',
        'Implementa manejo robusto de errores con retry logic y exponential backoff para rate limits',
        'Monitorea los límites de RPM (requests), TPM (tokens) y TPD para evitar throttling'
      ],
    },
    {
      title: 'Request y Response',
      content: `Entender la estructura de requests y responses es crucial para trabajar efectivamente con APIs de LLMs.

**Messages Array: El Corazón del Request**

Los LLMs modernos usan un array de mensajes que representa la conversación completa. Cada mensaje tiene un \`role\` y \`content\`.

**Roles Disponibles**:

1. **system**: Instrucciones que configuran el comportamiento del modelo
2. **user**: Mensajes del usuario
3. **assistant**: Respuestas previas del modelo (para contexto)

\`\`\`typescript
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Ejemplo de conversación multi-turno
const messages: Message[] = [
  {
    role: 'system',
    content: 'Eres un experto en JavaScript que explica conceptos de forma concisa.'
  },
  {
    role: 'user',
    content: '¿Qué es un closure?'
  },
  {
    role: 'assistant',
    content: 'Un closure es una función que tiene acceso a variables de su scope externo, incluso después de que la función externa haya terminado de ejecutarse.'
  },
  {
    role: 'user',
    content: 'Dame un ejemplo práctico'
  }
];
\`\`\`

**System Prompt: Configurando el Comportamiento**

El mensaje \`system\` es extremadamente importante. Define:
- Personalidad y tono del asistente
- Conocimiento especializado
- Formato de respuesta esperado
- Restricciones y reglas

\`\`\`typescript
// System prompt básico
const systemPrompt = "Eres un asistente útil.";

// System prompt avanzado
const advancedSystemPrompt = \`Eres un experto senior en TypeScript con 10+ años de experiencia.

Reglas:
- Proporciona siempre ejemplos de código funcionales
- Explica los conceptos con analogías cuando sea apropiado
- Menciona edge cases y mejores prácticas
- Si algo no está claro, pide clarificación antes de responder
- Formatea código con markdown usando backticks y especificando el lenguaje

Tono: Profesional pero amigable, educativo sin ser condescendiente.\`;
\`\`\`

**User y Assistant Messages**

Para mantener contexto en conversaciones multi-turno, debes incluir mensajes previos:

\`\`\`typescript
class ConversationManager {
  private messages: Message[] = [];

  constructor(systemPrompt: string) {
    this.messages.push({ role: 'system', content: systemPrompt });
  }

  addUserMessage(content: string) {
    this.messages.push({ role: 'user', content: content });
  }

  addAssistantMessage(content: string) {
    this.messages.push({ role: 'assistant', content: content });
  }

  getMessages(): Message[] {
    return this.messages;
  }

  // Mantener solo los últimos N mensajes para no exceder límite de tokens
  truncateToLastN(n: number) {
    const systemMsg = this.messages[0];
    const recentMessages = this.messages.slice(-n);
    this.messages = [systemMsg, ...recentMessages];
  }
}
\`\`\`

**Formato de Response**

Las respuestas de las APIs tienen una estructura específica:

**OpenAI Response**:
\`\`\`typescript
interface OpenAIResponse {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: 'assistant';
      content: string;
    };
    finish_reason: 'stop' | 'length' | 'content_filter' | 'tool_calls';
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Ejemplo de response real
{
  "id": "chatcmpl-8xxxxxxxxxxx",
  "object": "chat.completion",
  "created": 1704892800,
  "model": "gpt-4-turbo-preview",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Un closure es una función que captura variables de su scope externo..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 45,
    "completion_tokens": 120,
    "total_tokens": 165
  }
}
\`\`\`

**Anthropic (Claude) Response**:
\`\`\`typescript
interface AnthropicResponse {
  id: string;
  type: 'message';
  role: 'assistant';
  content: Array<{
    type: 'text';
    text: string;
  }>;
  model: string;
  stop_reason: 'end_turn' | 'max_tokens' | 'stop_sequence';
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}
\`\`\`

**Finish Reason: ¿Por qué terminó la generación?**

| Finish Reason | Significado | Acción |
|---------------|-------------|--------|
| stop | Generación completada naturalmente | ✅ Todo bien |
| length | Alcanzó max_tokens | Aumentar max_tokens si necesitas más |
| content_filter | Contenido bloqueado por filtros | Revisar prompt |
| tool_calls | Modelo quiere usar una herramienta | Procesar tool call |

**Extrayendo la Respuesta**

\`\`\`typescript
async function extractResponse(apiResponse: any, provider: 'openai' | 'anthropic'): Promise<string> {
  if (provider === 'openai') {
    const choice = apiResponse.choices[0];

    if (choice.finish_reason === 'length') {
      console.warn('Respuesta truncada - aumenta max_tokens');
    }

    return choice.message.content;
  }

  if (provider === 'anthropic') {
    const textContent = apiResponse.content.find(c => c.type === 'text');

    if (apiResponse.stop_reason === 'max_tokens') {
      console.warn('Respuesta truncada - aumenta max_tokens');
    }

    return textContent?.text || '';
  }

  throw new Error('Proveedor no soportado');
}
\`\`\`

**Usage y Costos**

El campo \`usage\` es crítico para monitorear costos:

\`\`\`typescript
function calculateCost(usage: any, model: string): number {
  // Precios aproximados (verificar precios actuales)
  const pricing = {
    'gpt-4-turbo-preview': {
      input: 0.01 / 1000,   // $0.01 por 1K tokens
      output: 0.03 / 1000   // $0.03 por 1K tokens
    },
    'claude-3-5-sonnet-20241022': {
      input: 0.003 / 1000,
      output: 0.015 / 1000
    }
  };

  const price = pricing[model];
  if (!price) return 0;

  const inputCost = usage.prompt_tokens * price.input;
  const outputCost = usage.completion_tokens * price.output;

  return inputCost + outputCost;
}

// Ejemplo de uso
const cost = calculateCost(response.usage, 'gpt-4-turbo-preview');
console.log(\`Costo del request: $\${cost.toFixed(4)}\`);
\`\`\`

**Streaming Responses**

Para respuestas más rápidas y mejor UX, usa streaming:

\`\`\`typescript
async function streamResponse(prompt: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${process.env.OPENAI_API_KEY}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      stream: true
    })
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader!.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\\n').filter(line => line.trim() !== '');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.substring(6);
        if (data === '[DONE]') continue;

        const parsed = JSON.parse(data);
        const content = parsed.choices[0]?.delta?.content;
        if (content) {
          process.stdout.write(content);  // Mostrar en tiempo real
        }
      }
    }
  }
}
\`\`\``,
      keyPoints: [
        'El messages array con roles system/user/assistant define toda la conversación y contexto',
        'El system prompt configura comportamiento, tono y reglas del modelo de forma crítica',
        'Las responses incluyen el contenido generado, finish_reason (por qué terminó) y usage (tokens consumidos)',
        'Monitorea el campo usage para controlar costos calculando input y output tokens por modelo',
        'El streaming permite mostrar respuestas progresivamente para mejor experiencia de usuario'
      ],
    },
    {
      title: 'Parámetros Clave',
      content: `Los parámetros que envías a la API determinan el comportamiento del modelo. Dominarlos te permite controlar precisión, creatividad y costo.

**model: Seleccionando el Modelo**

El parámetro más básico pero crítico. Determina qué modelo procesará tu request.

\`\`\`typescript
// OpenAI
model: 'gpt-4-turbo-preview'      // Más capaz, más caro
model: 'gpt-4'                     // Balance
model: 'gpt-3.5-turbo'             // Rápido y económico

// Anthropic
model: 'claude-3-opus-20240229'    // Máxima capacidad
model: 'claude-3-5-sonnet-20241022' // Balance óptimo
model: 'claude-3-haiku-20240307'   // Velocidad
\`\`\`

**Selección del modelo según caso de uso**:
\`\`\`typescript
function selectModel(task: string): string {
  const taskComplexity = {
    'simple_classification': 'gpt-3.5-turbo',
    'code_generation': 'gpt-4-turbo-preview',
    'complex_reasoning': 'claude-3-opus-20240229',
    'high_volume_cheap': 'claude-3-haiku-20240307'
  };

  return taskComplexity[task] || 'gpt-4-turbo-preview';
}
\`\`\`

**max_tokens: Controlando la Longitud**

Especifica el número máximo de tokens en la respuesta. No incluye tokens del prompt.

\`\`\`typescript
// Regla aproximada: 1 token ≈ 0.75 palabras en español
// 100 tokens ≈ 75 palabras

max_tokens: 100   // Respuesta breve (párrafo corto)
max_tokens: 500   // Respuesta media (explicación moderada)
max_tokens: 2000  // Respuesta larga (artículo)
max_tokens: 4096  // Respuesta muy larga (documento)
\`\`\`

**Importante**:
- Más tokens = mayor costo y latencia
- Si la respuesta se trunca (finish_reason: "length"), aumenta max_tokens
- El total (prompt + completion) no puede exceder la ventana de contexto del modelo

\`\`\`typescript
function estimateMaxTokens(desiredWords: number): number {
  // Conversión conservadora: palabras a tokens
  return Math.ceil(desiredWords / 0.75);
}

// Ejemplo
const maxTokens = estimateMaxTokens(300);  // ~400 tokens para 300 palabras
\`\`\`

**temperature: Controlando la Creatividad**

Controla la aleatoriedad en la generación. Rango: 0 a 2 (aunque típicamente 0-1).

- **temperature = 0**: Determinístico, siempre elige el token más probable
- **temperature = 0.3-0.5**: Baja creatividad, consistente
- **temperature = 0.7-0.8**: Balance (default)
- **temperature = 1.0-2.0**: Alta creatividad, más variación

\`\`\`typescript
// Casos de uso por temperature

// Análisis de código, clasificación, extracción de datos
const analyticalRequest = {
  messages: [...],
  temperature: 0,
  // Quieres respuestas consistentes y precisas
};

// Generación de contenido creativo
const creativeRequest = {
  messages: [...],
  temperature: 0.9,
  // Quieres variedad y creatividad
};

// Chatbot general
const chatRequest = {
  messages: [...],
  temperature: 0.7,
  // Balance entre coherencia y naturalidad
};
\`\`\`

**Ejemplo práctico**:
\`\`\`typescript
async function classifyIntent(userMessage: string): Promise<string> {
  const response = await callLLM({
    messages: [
      {
        role: 'system',
        content: 'Clasifica el intent del usuario en: question, complaint, compliment, other'
      },
      { role: 'user', content: userMessage }
    ],
    temperature: 0,  // Clasificación consistente
    max_tokens: 10   // Solo necesitamos una palabra
  });

  return response.content.trim().toLowerCase();
}
\`\`\`

**top_p (Nucleus Sampling)**

Alternativa a temperature. Controla la diversidad seleccionando tokens cuya probabilidad acumulada alcance \`p\`.

- **top_p = 0.1**: Solo considera los tokens más probables
- **top_p = 0.5**: Balance
- **top_p = 0.9-1.0**: Considera más opciones

\`\`\`typescript
// Recomendación: Usa temperature O top_p, no ambos
{
  temperature: 1,    // No uses ambos
  top_p: 0.9        // Elige uno
}

// Mejor:
{
  temperature: 0.7   // Solo temperature
}
// O
{
  temperature: 1,    // Temperature en default
  top_p: 0.9        // Solo top_p
}
\`\`\`

**stop: Secuencias de Parada**

Define secuencias de texto que harán que el modelo detenga la generación.

\`\`\`typescript
// Detener en salto de línea doble
{
  messages: [...],
  stop: ["\\n\\n"]
}

// Detener en múltiples secuencias
{
  messages: [...],
  stop: ["END", "###", "\\n---\\n"]
}

// Útil para generar listas
async function generateList(prompt: string): Promise<string[]> {
  const response = await callLLM({
    messages: [
      { role: 'user', content: \`\${prompt}\\n\\nLista (una por línea):\` }
    ],
    stop: ["\\n\\n"],  // Detener en línea vacía
    max_tokens: 200
  });

  return response.content.split('\\n').filter(line => line.trim());
}
\`\`\`

**presence_penalty y frequency_penalty**

Controlan la repetición en las respuestas. Rango: -2.0 a 2.0

**presence_penalty**:
- Penaliza tokens que ya aparecieron (sin importar frecuencia)
- Positivo: Fomenta temas nuevos
- Negativo: Permite repetición

**frequency_penalty**:
- Penaliza tokens basándose en su frecuencia de aparición
- Positivo: Reduce repetición de palabras/frases
- Negativo: Permite palabras frecuentes

\`\`\`typescript
// Para reducir repetición
{
  presence_penalty: 0.6,
  frequency_penalty: 0.5
}

// Para generar código (donde repetición es normal)
{
  presence_penalty: 0,
  frequency_penalty: 0
}

// Para contenido creativo variado
async function generateCreativeContent(topic: string) {
  return await callLLM({
    messages: [
      { role: 'user', content: \`Escribe sobre \${topic}\` }
    ],
    temperature: 0.8,
    presence_penalty: 0.7,   // Explora nuevos temas
    frequency_penalty: 0.5   // Evita repetir palabras
  });
}
\`\`\`

**n: Generando Múltiples Opciones**

Genera \`n\` respuestas alternativas en una sola llamada.

\`\`\`typescript
async function generateOptions(prompt: string): Promise<string[]> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${process.env.OPENAI_API_KEY}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      n: 3,  // Generar 3 opciones
      temperature: 0.8
    })
  });

  const data = await response.json();

  // Extraer todas las opciones
  return data.choices.map(choice => choice.message.content);
}

// Uso: Generar titulares alternativos
const headlines = await generateOptions('Crea un titular para un artículo sobre IA');
// ["IA Revoluciona...", "El Futuro de la IA...", "Descubre cómo..."]
\`\`\`

**Combinando Parámetros Efectivamente**

\`\`\`typescript
// Ejemplo: Clasificador de soporte técnico
const classificationConfig = {
  model: 'gpt-3.5-turbo',  // Suficiente para clasificación
  temperature: 0,           // Consistente
  max_tokens: 50,          // Respuesta corta
};

// Ejemplo: Generador de contenido marketing
const marketingConfig = {
  model: 'gpt-4-turbo-preview',  // Mejor calidad
  temperature: 0.8,               // Creativo
  max_tokens: 500,               // Contenido sustancial
  presence_penalty: 0.6,         // Variedad de temas
  frequency_penalty: 0.3         // Reduce repetición
};

// Ejemplo: Generador de código
const codeConfig = {
  model: 'gpt-4-turbo-preview',  // Mejor en código
  temperature: 0.2,               // Preciso pero no rígido
  max_tokens: 2000,              // Código puede ser largo
  stop: ['\`\`\`\\n\\n']             // Detener después del bloque de código
};
\`\`\``,
      keyPoints: [
        'El parámetro model determina capacidad, velocidad y costo; elige según complejidad de la tarea',
        'max_tokens controla longitud de respuesta y directamente afecta costo y latencia',
        'temperature (0-2) controla creatividad: 0 para tareas determinísticas, 0.7-1.0 para contenido creativo',
        'stop sequences permiten detener generación en puntos específicos para formateo controlado',
        'presence_penalty y frequency_penalty reducen repetición en contenido generado'
      ],
    },
    {
      title: 'Tu Primera Llamada',
      content: `Ahora que entiendes la estructura y parámetros, vamos a hacer tu primera llamada a una API de LLM con ejemplos prácticos y completos.

**Setup Inicial**

Primero, configura tu entorno:

\`\`\`bash
# Instalar dependencias
npm install dotenv

# Crear archivo .env
echo "OPENAI_API_KEY=sk-proj-tu-api-key-aqui" > .env
echo "ANTHROPIC_API_KEY=sk-ant-tu-api-key-aqui" >> .env
\`\`\`

**Ejemplo 1: Llamada Básica con OpenAI**

\`\`\`typescript
// basic-openai.ts
import 'dotenv/config';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

async function callOpenAI(messages: ChatMessage[]) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${process.env.OPENAI_API_KEY}\`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo-preview',
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(\`OpenAI API Error: \${JSON.stringify(error)}\`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Uso
async function main() {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: 'Eres un asistente experto en TypeScript que proporciona explicaciones claras y concisas.',
    },
    {
      role: 'user',
      content: '¿Qué es un Promise en JavaScript y cómo se usa?',
    },
  ];

  try {
    const response = await callOpenAI(messages);
    console.log('Respuesta:', response);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
\`\`\`

**Ejemplo 2: Llamada Básica con Claude (Anthropic)**

\`\`\`typescript
// basic-claude.ts
import 'dotenv/config';

interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

async function callClaude(systemPrompt: string, messages: ClaudeMessage[]) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(\`Claude API Error: \${JSON.stringify(error)}\`);
  }

  const data = await response.json();
  return data.content[0].text;
}

// Uso
async function main() {
  const systemPrompt = 'Eres un experto en arquitectura de software que explica conceptos complejos de forma simple.';

  const messages: ClaudeMessage[] = [
    {
      role: 'user',
      content: 'Explica el patrón Repository en TypeScript con un ejemplo',
    },
  ];

  try {
    const response = await callClaude(systemPrompt, messages);
    console.log('Respuesta de Claude:', response);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
\`\`\`

**Ejemplo 3: Wrapper Unificado**

Crea un wrapper que funcione con múltiples proveedores:

\`\`\`typescript
// llm-client.ts
import 'dotenv/config';

type Provider = 'openai' | 'anthropic';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface LLMConfig {
  provider: Provider;
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

class LLMClient {
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = {
      temperature: 0.7,
      max_tokens: 1000,
      ...config,
    };
  }

  async chat(messages: Message[]): Promise<string> {
    if (this.config.provider === 'openai') {
      return this.callOpenAI(messages);
    } else if (this.config.provider === 'anthropic') {
      return this.callClaude(messages);
    }
    throw new Error(\`Proveedor no soportado: \${this.config.provider}\`);
  }

  private async callOpenAI(messages: Message[]): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${process.env.OPENAI_API_KEY}\`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model || 'gpt-4-turbo-preview',
        messages,
        temperature: this.config.temperature,
        max_tokens: this.config.max_tokens,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(\`OpenAI Error: \${data.error?.message}\`);
    }

    return data.choices[0].message.content;
  }

  private async callClaude(messages: Message[]): Promise<string> {
    const systemMessage = messages.find(m => m.role === 'system');
    const chatMessages = messages
      .filter(m => m.role !== 'system')
      .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model || 'claude-3-5-sonnet-20241022',
        max_tokens: this.config.max_tokens,
        system: systemMessage?.content || '',
        messages: chatMessages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(\`Claude Error: \${data.error?.message}\`);
    }

    return data.content[0].text;
  }
}

// Uso
async function main() {
  // Usar OpenAI
  const openaiClient = new LLMClient({
    provider: 'openai',
    temperature: 0.5,
  });

  const response1 = await openaiClient.chat([
    { role: 'system', content: 'Eres un asistente útil.' },
    { role: 'user', content: 'Explica async/await en JavaScript' },
  ]);
  console.log('OpenAI:', response1);

  // Usar Claude
  const claudeClient = new LLMClient({
    provider: 'anthropic',
    temperature: 0.7,
  });

  const response2 = await claudeClient.chat([
    { role: 'system', content: 'Eres un experto en Node.js.' },
    { role: 'user', content: '¿Cómo funciona el Event Loop?' },
  ]);
  console.log('Claude:', response2);
}

main();
\`\`\`

**Ejemplo 4: Conversación Multi-Turno**

\`\`\`typescript
// conversation.ts
import { LLMClient } from './llm-client';

class Conversation {
  private client: LLMClient;
  private messages: Message[] = [];

  constructor(client: LLMClient, systemPrompt: string) {
    this.client = client;
    this.messages.push({
      role: 'system',
      content: systemPrompt,
    });
  }

  async sendMessage(userMessage: string): Promise<string> {
    // Agregar mensaje del usuario
    this.messages.push({
      role: 'user',
      content: userMessage,
    });

    // Obtener respuesta
    const response = await this.client.chat(this.messages);

    // Guardar respuesta del asistente
    this.messages.push({
      role: 'assistant',
      content: response,
    });

    return response;
  }

  getHistory(): Message[] {
    return [...this.messages];
  }

  clear() {
    const systemMsg = this.messages[0];
    this.messages = [systemMsg];
  }
}

// Uso: Chatbot interactivo
async function runChatbot() {
  const client = new LLMClient({
    provider: 'openai',
    temperature: 0.7,
  });

  const conversation = new Conversation(
    client,
    'Eres un tutor de programación paciente y didáctico.'
  );

  // Simular conversación
  console.log('Usuario: ¿Qué es un closure?');
  const response1 = await conversation.sendMessage('¿Qué es un closure?');
  console.log('Asistente:', response1);

  console.log('\\nUsuario: Dame un ejemplo práctico');
  const response2 = await conversation.sendMessage('Dame un ejemplo práctico');
  console.log('Asistente:', response2);

  console.log('\\nUsuario: ¿Cuándo debería usarlo?');
  const response3 = await conversation.sendMessage('¿Cuándo debería usarlo?');
  console.log('Asistente:', response3);
}

runChatbot();
\`\`\`

**Ejemplo 5: Manejo de Errores Robusto**

\`\`\`typescript
// robust-call.ts
async function robustLLMCall(
  fn: () => Promise<string>,
  options = {
    maxRetries: 3,
    baseDelay: 1000,
    timeout: 30000,
  }
): Promise<string> {
  for (let attempt = 0; attempt < options.maxRetries; attempt++) {
    try {
      // Agregar timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), options.timeout);
      });

      const result = await Promise.race([fn(), timeoutPromise]);
      return result;

    } catch (error: any) {
      const isLastAttempt = attempt === options.maxRetries - 1;

      // No reintentar errores 4xx (excepto 429)
      if (error.status >= 400 && error.status < 500 && error.status !== 429) {
        throw error;
      }

      if (isLastAttempt) {
        throw new Error(\`Failed after \${options.maxRetries} attempts: \${error.message}\`);
      }

      // Exponential backoff
      const delay = options.baseDelay * Math.pow(2, attempt);
      console.log(\`Retry \${attempt + 1} after \${delay}ms...\`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error('Unexpected error in robustLLMCall');
}

// Uso
async function main() {
  const client = new LLMClient({ provider: 'openai' });

  try {
    const response = await robustLLMCall(async () => {
      return await client.chat([
        { role: 'user', content: 'Hola!' },
      ]);
    });

    console.log('Success:', response);
  } catch (error) {
    console.error('Failed after all retries:', error);
  }
}
\`\`\`

**Consejos Finales**

1. **Siempre usa variables de entorno** para API keys
2. **Implementa logging** para debugging y monitoreo
3. **Maneja errores apropiadamente** con retry logic
4. **Monitorea costos** rastreando token usage
5. **Usa tipos TypeScript** para mejor DX
6. **Implementa timeouts** para evitar requests colgados
7. **Cacha respuestas** cuando sea apropiado para ahorrar costos

\`\`\`typescript
// Bonus: Logger simple
class LLMLogger {
  log(event: string, data: any) {
    console.log(\`[\${new Date().toISOString()}] \${event}\`, {
      ...data,
      // Ocultar API keys en logs
      apiKey: data.apiKey ? '***' : undefined,
    });
  }
}

const logger = new LLMLogger();
logger.log('LLM_REQUEST', {
  provider: 'openai',
  model: 'gpt-4-turbo-preview',
  tokens: 150,
});
\`\`\`

¡Ahora estás listo para empezar a construir con LLMs!`,
      keyPoints: [
        'Configura variables de entorno para API keys y nunca las expongas en código',
        'Usa clases wrapper para abstraer diferencias entre proveedores (OpenAI, Anthropic, etc.)',
        'Implementa manejo de errores robusto con retry logic y exponential backoff',
        'Mantén historial de mensajes para conversaciones multi-turno coherentes',
        'Agrega logging, timeouts y monitoreo de costos desde el inicio'
      ],
    },
  ],
};
