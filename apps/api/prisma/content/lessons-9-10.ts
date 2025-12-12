export const streamingResponses = {
  sections: [
    {
      title: '¿Por qué Streaming?',
      content: `El streaming de respuestas es una técnica fundamental en aplicaciones modernas de LLM que mejora significativamente la experiencia del usuario. En lugar de esperar a que el modelo genere toda la respuesta antes de mostrarla, el streaming permite visualizar tokens a medida que se generan.

La métrica más importante es el **Time-to-First-Token (TTFT)**: el tiempo entre enviar un prompt y recibir el primer token de respuesta. Para prompts largos, esto puede ser de varios segundos. Con streaming, el usuario comienza a ver resultados inmediatamente, reduciendo la percepción de latencia.

Comparación de experiencias:

**Sin streaming:**
- Usuario envía pregunta → Espera completa (5-30s) → Respuesta aparece completa
- Sensación de aplicación "congelada"
- No hay feedback durante la generación
- Abandono de usuarios en esperas largas

**Con streaming:**
- Usuario envía pregunta → Primeros tokens en 0.5-2s → Tokens aparecen progresivamente
- Sensación de "pensamiento en vivo"
- Usuario puede comenzar a leer mientras se genera
- Mayor percepción de velocidad

El streaming es especialmente crítico en:
- Interfaces de chat (ChatGPT, Claude, etc.)
- Generación de contenido largo (artículos, código)
- Aplicaciones móviles con conexiones lentas
- Casos donde la latencia percibida es crítica para UX`,
      keyPoints: [
        'Time-to-First-Token (TTFT) es la métrica clave de UX en LLMs',
        'Streaming reduce la latencia percibida, no la latencia real',
        'Los usuarios prefieren ver progreso incremental vs esperar respuesta completa',
        'Crítico para generaciones largas y conexiones lentas',
      ],
    },
    {
      title: 'Server-Sent Events (SSE)',
      content: `Server-Sent Events es el protocolo estándar para streaming de LLMs. Es una tecnología web que permite al servidor enviar actualizaciones automáticas al cliente sobre HTTP.

**Características de SSE:**

1. **Conexión unidireccional**: Solo servidor → cliente (suficiente para LLMs)
2. **Basado en HTTP**: No requiere protocolos especiales como WebSockets
3. **Reconexión automática**: El navegador reconecta automáticamente si se pierde la conexión
4. **Event IDs**: Permite reanudar desde el último evento recibido

**Formato de datos SSE:**

Cada evento SSE se envía en formato de texto plano con campos específicos:

\`\`\`
data: {"token": "Hola", "type": "content"}

data: {"token": " mundo", "type": "content"}

data: {"type": "done", "metadata": {"tokens": 245}}

\`\`\`

Reglas del formato:
- Cada línea comienza con un campo: \`data:\`, \`event:\`, \`id:\`, \`retry:\`
- Los eventos se separan con una línea en blanco doble (\`\\n\\n\`)
- El campo \`data:\` puede repetirse para datos multilínea

**Ejemplo completo de stream SSE:**

\`\`\`
event: start
data: {"model": "gpt-4", "timestamp": 1234567890}

data: {"choices":[{"delta":{"content":"La"}}]}

data: {"choices":[{"delta":{"content":" inteligencia"}}]}

data: {"choices":[{"delta":{"content":" artificial"}}]}

event: done
data: {"usage": {"prompt_tokens": 10, "completion_tokens": 3}}

\`\`\`

**Headers HTTP necesarios:**

\`\`\`typescript
{
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  'Connection': 'keep-alive',
  'X-Accel-Buffering': 'no' // Deshabilitar buffering en nginx
}
\`\`\`

SSE es soportado nativamente por todos los navegadores modernos y es la opción preferida sobre WebSockets para streaming unidireccional por su simplicidad y confiabilidad.`,
      keyPoints: [
        'SSE es el estándar para streaming de LLMs, más simple que WebSockets',
        'Formato basado en texto con campos data:, event:, id:',
        'Eventos separados por doble salto de línea (\\n\\n)',
        'Requiere headers específicos: text/event-stream, no-cache, keep-alive',
      ],
    },
    {
      title: 'Implementación Frontend',
      content: `El frontend debe manejar el stream SSE, parsear los chunks y actualizar la UI reactivamente. Hay dos enfoques principales: EventSource API y Fetch API.

**Opción 1: EventSource API (más simple)**

\`\`\`typescript
const eventSource = new EventSource('/api/chat/stream?prompt=Hola');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.choices?.[0]?.delta?.content) {
    const token = data.choices[0].delta.content;
    appendToUI(token); // Agregar token a la UI
  }
};

eventSource.addEventListener('done', (event) => {
  const metadata = JSON.parse(event.data);
  console.log('Completado:', metadata);
  eventSource.close();
});

eventSource.onerror = (error) => {
  console.error('Stream error:', error);
  eventSource.close();
};
\`\`\`

**Limitación de EventSource**: Solo soporta GET requests, no permite enviar headers custom (problemático para autenticación).

**Opción 2: Fetch API con ReadableStream (más flexible)**

\`\`\`typescript
async function streamChat(prompt: string, apiKey: string) {
  const response = await fetch('/api/chat/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${apiKey}\`
    },
    body: JSON.stringify({ prompt })
  });

  if (!response.ok) {
    throw new Error(\`HTTP error! status: \${response.status}\`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    // Decodificar chunk binario a texto
    buffer += decoder.decode(value, { stream: true });

    // Procesar eventos completos (separados por \\n\\n)
    const events = buffer.split('\\n\\n');
    buffer = events.pop() || ''; // Guardar evento incompleto

    for (const event of events) {
      if (!event.trim()) continue;

      // Extraer datos del evento
      const lines = event.split('\\n');
      const dataLines = lines.filter(l => l.startsWith('data: '));

      for (const line of dataLines) {
        const jsonStr = line.substring(6); // Remover 'data: '

        try {
          const data = JSON.parse(jsonStr);

          if (data.choices?.[0]?.delta?.content) {
            appendToUI(data.choices[0].delta.content);
          }

          if (data.type === 'done') {
            console.log('Stream completado');
          }
        } catch (e) {
          console.error('Error parsing JSON:', e);
        }
      }
    }
  }
}
\`\`\`

**Implementación con React (hook personalizado):**

\`\`\`typescript
import { useState, useCallback } from 'react';

function useStreamingChat() {
  const [content, setContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendMessage = useCallback(async (prompt: string) => {
    setIsStreaming(true);
    setContent('');
    setError(null);

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\\n\\n');
        buffer = events.pop() || '';

        for (const event of events) {
          if (!event.trim()) continue;

          const dataLine = event.split('\\n').find(l => l.startsWith('data: '));
          if (!dataLine) continue;

          const data = JSON.parse(dataLine.substring(6));

          if (data.choices?.[0]?.delta?.content) {
            setContent(prev => prev + data.choices[0].delta.content);
          }
        }
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsStreaming(false);
    }
  }, []);

  return { content, isStreaming, error, sendMessage };
}

// Uso en componente:
function ChatComponent() {
  const { content, isStreaming, sendMessage } = useStreamingChat();

  return (
    <div>
      <div className="message">{content}</div>
      {isStreaming && <div className="cursor-blink">▊</div>}
      <button onClick={() => sendMessage('Explica quantum computing')}>
        Enviar
      </button>
    </div>
  );
}
\`\`\`

**Manejo de errores y reconexión:**

\`\`\`typescript
async function streamWithRetry(prompt: string, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      await streamChat(prompt);
      return; // Éxito
    } catch (error) {
      console.error(\`Intento \${attempt + 1} falló:\`, error);

      if (attempt < maxRetries - 1) {
        // Esperar con backoff exponencial
        await new Promise(resolve =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      } else {
        throw error; // Falló todos los intentos
      }
    }
  }
}
\`\`\``,
      keyPoints: [
        'EventSource API: simple pero limitado a GET requests',
        'Fetch + ReadableStream: más flexible, soporta POST y headers custom',
        'Parsear eventos SSE requiere manejar buffer y eventos incompletos',
        'Implementar manejo de errores y reconexión con backoff exponencial',
      ],
    },
    {
      title: 'Implementación Backend',
      content: `El backend debe crear un stream SSE compatible que envíe tokens del LLM progresivamente al cliente.

**Implementación con Node.js (Express):**

\`\`\`typescript
import express from 'express';
import OpenAI from 'openai';

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/api/chat/stream', async (req, res) => {
  const { prompt } = req.body;

  // Configurar headers SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Nginx

  try {
    // Crear stream con OpenAI
    const stream = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      stream: true, // ¡Habilitar streaming!
    });

    // Evento inicial
    res.write(\`event: start\\n\`);
    res.write(\`data: \${JSON.stringify({ timestamp: Date.now() })}\\n\\n\`);

    // Iterar sobre chunks del stream
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;

      if (content) {
        // Enviar token como evento SSE
        res.write(\`data: \${JSON.stringify(chunk)}\\n\\n\`);
      }

      // Verificar si el cliente cerró la conexión
      if (req.closed) {
        console.log('Cliente desconectado');
        break;
      }
    }

    // Evento final
    res.write(\`event: done\\n\`);
    res.write(\`data: \${JSON.stringify({ completed: true })}\\n\\n\`);
    res.end();

  } catch (error) {
    console.error('Stream error:', error);
    res.write(\`event: error\\n\`);
    res.write(\`data: \${JSON.stringify({ error: error.message })}\\n\\n\`);
    res.end();
  }
});
\`\`\`

**Implementación con Next.js App Router:**

\`\`\`typescript
// app/api/chat/stream/route.ts
import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    stream: true,
  });

  // Convertir OpenAI stream a ReadableStream web standard
  const stream = OpenAIStream(response);

  // Retornar como streaming response
  return new StreamingTextResponse(stream);
}
\`\`\`

**Implementación manual de Stream con TransformStream:**

\`\`\`typescript
export async function POST(req: Request) {
  const { prompt } = await req.json();

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const openaiStream = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          stream: true,
        });

        for await (const chunk of openaiStream) {
          const content = chunk.choices[0]?.delta?.content;

          if (content) {
            // Formatear como SSE
            const sseData = \`data: \${JSON.stringify(chunk)}\\n\\n\`;
            controller.enqueue(encoder.encode(sseData));
          }
        }

        // Evento final
        const doneData = \`event: done\\ndata: {"completed": true}\\n\\n\`;
        controller.enqueue(encoder.encode(doneData));
        controller.close();

      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
\`\`\`

**WebSockets como alternativa:**

WebSockets ofrece comunicación bidireccional, útil cuando necesitas enviar señales al servidor durante la generación (ej: cancelar stream).

\`\`\`typescript
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
  ws.on('message', async (message) => {
    const { prompt } = JSON.parse(message.toString());

    const stream = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;

      if (content) {
        ws.send(JSON.stringify({ type: 'token', content }));
      }

      // Permitir cancelación
      if (ws.readyState !== ws.OPEN) break;
    }

    ws.send(JSON.stringify({ type: 'done' }));
  });
});
\`\`\`

**Ventajas de WebSockets:**
- Comunicación bidireccional (cancelar generación, enviar feedback)
- Menos overhead de headers
- Mejor para chat multiturno persistente

**Desventajas:**
- Más complejo de implementar
- Requiere servidor con soporte WebSocket
- No funciona bien con algunos proxies/load balancers
- No reconexión automática como SSE

**Recomendación**: Usar SSE por defecto, WebSockets solo si necesitas comunicación bidireccional activa.`,
      keyPoints: [
        'Backend debe configurar headers SSE correctamente (text/event-stream, no-cache)',
        'OpenAI SDK soporta streaming nativo con stream: true',
        'Frameworks modernos (Next.js, Vercel AI SDK) simplifican implementación',
        'WebSockets es alternativa para casos bidireccionales (cancelación, feedback)',
      ],
    },
  ],
};

export const costOptimization = {
  sections: [
    {
      title: 'Entendiendo los Costos',
      content: `Los LLMs cobran por tokens procesados, no por requests. Entender el modelo de pricing es fundamental para optimizar costos.

**Estructura de costos:**

Los proveedores cobran separadamente por:
1. **Input tokens** (prompt): Tokens que envías al modelo
2. **Output tokens** (completion): Tokens que el modelo genera

Los output tokens son típicamente 2-3x más caros que input tokens.

**Tabla de precios (Enero 2025):**

\`\`\`
GPT-4 Turbo:
  Input:  $10.00 / 1M tokens
  Output: $30.00 / 1M tokens

GPT-3.5 Turbo:
  Input:  $0.50 / 1M tokens
  Output: $1.50 / 1M tokens

Claude 3 Opus:
  Input:  $15.00 / 1M tokens
  Output: $75.00 / 1M tokens

Claude 3 Sonnet:
  Input:  $3.00 / 1M tokens
  Output: $15.00 / 1M tokens

Claude 3 Haiku:
  Input:  $0.25 / 1M tokens
  Output: $1.25 / 1M tokens
\`\`\`

**Cálculo de costos por request:**

\`\`\`typescript
interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
}

interface ModelPricing {
  inputPer1M: number;  // USD
  outputPer1M: number; // USD
}

const GPT4_TURBO: ModelPricing = {
  inputPer1M: 10.00,
  outputPer1M: 30.00,
};

function calculateCost(usage: TokenUsage, pricing: ModelPricing): number {
  const inputCost = (usage.promptTokens / 1_000_000) * pricing.inputPer1M;
  const outputCost = (usage.completionTokens / 1_000_000) * pricing.outputPer1M;
  return inputCost + outputCost;
}

// Ejemplo: Generar un artículo
const articleUsage = {
  promptTokens: 500,   // Instrucciones + contexto
  completionTokens: 2000, // Artículo generado
};

const cost = calculateCost(articleUsage, GPT4_TURBO);
console.log(\`Costo: $\${cost.toFixed(4)}\`);
// Output: Costo: $0.0650

// Desglose:
// Input:  (500 / 1M) * $10 = $0.0050
// Output: (2000 / 1M) * $30 = $0.0600
// Total: $0.0650
\`\`\`

**Factores que impactan costos:**

1. **Longitud del prompt**: Cada mensaje previo en conversaciones cuenta
2. **System prompts**: Si envías el mismo system prompt en cada request
3. **Few-shot examples**: Ejemplos en el prompt aumentan tokens
4. **Función de llamadas**: Definiciones de funciones/tools agregan tokens
5. **Modelo elegido**: GPT-4 vs GPT-3.5 es diferencia de 20x en precio
6. **Longitud de respuesta**: Controlar con max_tokens

**Ejemplo real - Chat con historial:**

\`\`\`typescript
const conversation = [
  { role: 'system', content: 'Eres un asistente experto en programación.' }, // 8 tokens
  { role: 'user', content: 'Cómo implemento un binary search en Python?' },  // 12 tokens
  { role: 'assistant', content: 'Aquí está la implementación...' },            // 150 tokens
  { role: 'user', content: 'Cómo optimizo esto para listas grandes?' },       // 10 tokens
];

// Total input tokens: 8 + 12 + 150 + 10 = 180 tokens
// Cada nuevo mensaje en la conversación acumula todo el historial previo
\`\`\`

**Costos mensuales proyectados:**

\`\`\`typescript
function projectMonthlyCost(
  requestsPerDay: number,
  avgPromptTokens: number,
  avgCompletionTokens: number,
  pricing: ModelPricing
): number {
  const usage = {
    promptTokens: avgPromptTokens,
    completionTokens: avgCompletionTokens,
  };

  const costPerRequest = calculateCost(usage, pricing);
  const dailyCost = costPerRequest * requestsPerDay;
  const monthlyCost = dailyCost * 30;

  return monthlyCost;
}

// Ejemplo: Startup con chatbot
const monthlyCost = projectMonthlyCost(
  10000,  // 10k requests/día
  500,    // 500 tokens promedio de entrada
  300,    // 300 tokens promedio de salida
  GPT4_TURBO
);

console.log(\`Costo mensual estimado: $\${monthlyCost.toFixed(2)}\`);
// Output: Costo mensual estimado: $3,600.00

// Desglose:
// Por request: $0.012
// Por día: $120
// Por mes: $3,600
\`\`\`

Este modelo de costos hace que la optimización sea crítica a escala.`,
      keyPoints: [
        'Los LLMs cobran por tokens, no por requests: input y output separadamente',
        'Output tokens cuestan 2-3x más que input tokens',
        'Modelos premium (GPT-4, Claude Opus) pueden ser 20-50x más caros que básicos',
        'Conversaciones con historial acumulan tokens rápidamente',
      ],
    },
    {
      title: 'Estrategias de Reducción de Costos',
      content: `Existen múltiples estrategias para reducir costos sin sacrificar calidad. La clave es aplicar la técnica correcta al caso de uso correcto.

**1. Usar el modelo más pequeño que funcione**

No todos los casos requieren GPT-4. Establece una jerarquía de modelos:

\`\`\`typescript
enum TaskComplexity {
  SIMPLE = 'simple',       // Clasificación, extracción simple
  MODERATE = 'moderate',   // Summarización, Q&A
  COMPLEX = 'complex',     // Razonamiento, código complejo
}

function selectModel(complexity: TaskComplexity): string {
  const modelMap = {
    [TaskComplexity.SIMPLE]: 'gpt-3.5-turbo',    // $0.002 / request
    [TaskComplexity.MODERATE]: 'gpt-4-turbo',    // $0.010 / request
    [TaskComplexity.COMPLEX]: 'gpt-4',           // $0.060 / request
  };

  return modelMap[complexity];
}

// Ejemplo: Clasificar sentimiento (tarea simple)
const model = selectModel(TaskComplexity.SIMPLE);
// Ahorro: 30x vs usar GPT-4 por defecto
\`\`\`

**2. Prompt Caching**

Muchos providers ahora soportan caching de prefijos de prompts. Anthropic Claude tiene "prompt caching" que cachea hasta 5 minutos.

\`\`\`typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Definir contexto grande que se reutiliza
const systemContext = \`
Eres un asistente legal experto. Aquí está el código civil completo:
[10,000 tokens de texto legal]
\`;

async function askLegalQuestion(question: string) {
  const response = await client.messages.create({
    model: 'claude-3-sonnet-20240229',
    max_tokens: 1024,
    system: [
      {
        type: 'text',
        text: systemContext,
        cache_control: { type: 'ephemeral' }, // ¡Cachear esto!
      }
    ],
    messages: [{ role: 'user', content: question }],
  });

  return response;
}

// Primera llamada: Paga por 10,000 tokens de contexto
await askLegalQuestion('¿Qué dice el artículo 123?');

// Llamadas siguientes (dentro de 5 min): Solo paga por la pregunta
await askLegalQuestion('¿Y el artículo 456?');
// Ahorro: ~90% en tokens de entrada
\`\`\`

**3. Batching de Requests**

Combinar múltiples tareas en un solo request reduce overhead.

\`\`\`typescript
// ❌ MAL: 100 requests separados
async function classifyEmails(emails: string[]) {
  const results = [];

  for (const email of emails) {
    const result = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Clasifica emails como spam o no spam.' },
        { role: 'user', content: email }
      ],
    });
    results.push(result);
  }

  return results;
}
// Costo: 100 requests × overhead de system prompt

// ✅ BIEN: 1 request con batch
async function classifyEmailsBatch(emails: string[]) {
  const batchPrompt = emails.map((email, i) =>
    \`Email \${i + 1}: \${email}\`
  ).join('\\n\\n');

  const result = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: 'Clasifica cada email como spam o no spam. Formato: "Email N: [spam/no spam]"'
      },
      { role: 'user', content: batchPrompt }
    ],
  });

  return parseResults(result.choices[0].message.content);
}
// Ahorro: ~50% (1 system prompt vs 100)
\`\`\`

**4. Truncar historial de conversaciones**

En chats largos, limita el historial enviado.

\`\`\`typescript
function truncateHistory(
  messages: Message[],
  maxTokens: number = 2000
): Message[] {
  let totalTokens = 0;
  const result = [];

  // Iterar desde el mensaje más reciente
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    const tokens = estimateTokens(message.content);

    if (totalTokens + tokens > maxTokens) {
      break; // Excede límite
    }

    result.unshift(message);
    totalTokens += tokens;
  }

  // Siempre incluir system prompt
  if (messages[0].role === 'system') {
    result.unshift(messages[0]);
  }

  return result;
}

// Uso
const fullHistory = [...conversationMessages]; // 50 mensajes
const truncated = truncateHistory(fullHistory, 2000); // Solo últimos ~10
// Ahorro: ~80% en tokens de entrada
\`\`\`

**5. Summarization de historial**

Para conversaciones muy largas, resume mensajes antiguos.

\`\`\`typescript
async function summarizeAndTruncate(messages: Message[]): Promise<Message[]> {
  if (messages.length < 10) return messages;

  // Mensajes a resumir (excluyendo últimos 5)
  const toSummarize = messages.slice(0, -5);

  // Generar resumen
  const summary = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo', // Modelo barato para summarizar
    messages: [
      {
        role: 'system',
        content: 'Resume la conversación manteniendo puntos clave.'
      },
      { role: 'user', content: JSON.stringify(toSummarize) }
    ],
    max_tokens: 200, // Resumen corto
  });

  // Reemplazar mensajes antiguos con resumen
  return [
    messages[0], // System prompt
    { role: 'assistant', content: summary.choices[0].message.content },
    ...messages.slice(-5), // Últimos 5 mensajes completos
  ];
}
\`\`\`

**6. Response Streaming para cancelación temprana**

Con streaming, el usuario puede detener generación innecesaria.

\`\`\`typescript
// Usuario obtiene respuesta suficiente antes de completar
// Puede cancelar, ahorrando tokens de output no necesarios
\`\`\`

**Comparación de ahorro:**

\`\`\`
Estrategia               | Ahorro típico | Complejidad
------------------------|---------------|-------------
Modelo más pequeño      | 20-50x        | Baja
Prompt caching          | 70-90%        | Media
Batching                | 30-50%        | Baja
Truncar historial       | 60-80%        | Baja
Summarizar historial    | 70-85%        | Media
Streaming + cancelación | 10-30%        | Media
\`\`\``,
      keyPoints: [
        'Usar el modelo más pequeño suficiente puede ahorrar 20-50x en costos',
        'Prompt caching ahorra 70-90% en contextos reutilizados (Claude)',
        'Batching reduce overhead de system prompts repetidos',
        'Truncar o resumir historial de chat previene crecimiento exponencial de tokens',
      ],
    },
    {
      title: 'Optimización de Prompts',
      content: `Los prompts optimizados logran los mismos resultados con menos tokens. Cada palabra cuenta.

**1. Eliminar redundancia**

\`\`\`typescript
// ❌ MAL: Verboso (45 tokens)
const verbosePrompt = \`
Por favor, analiza cuidadosamente el siguiente texto y proporciona un resumen
detallado que capture las ideas principales y los puntos clave mencionados en
el contenido. Asegúrate de ser conciso pero completo en tu análisis.

Texto: \${text}
\`;

// ✅ BIEN: Conciso (8 tokens)
const concisePrompt = \`Resume los puntos clave: \${text}\`;

// Ahorro: 82% tokens
\`\`\`

**2. Usar formatos estructurados**

JSON o YAML son más compactos que lenguaje natural para outputs estructurados.

\`\`\`typescript
// ❌ MAL: Output en lenguaje natural
const prompt1 = \`
Extrae información del email y descríbela en oraciones completas:
- De quién es el email
- Cuál es el asunto
- Si es urgente o no
- Un resumen del contenido

Email: \${email}
\`;
// Output esperado: "El email es de Juan Pérez. El asunto es..."
// ~50 tokens de output

// ✅ BIEN: Output JSON estructurado
const prompt2 = \`
Extrae info como JSON:
{
  "from": "",
  "subject": "",
  "urgent": boolean,
  "summary": ""
}

Email: \${email}
\`;
// Output esperado: {"from":"Juan Pérez","subject":"...",...}
// ~30 tokens de output

// Ahorro: 40% en tokens de output
\`\`\`

**3. Few-shot selectivo**

Incluir solo ejemplos necesarios, no todos los casos edge.

\`\`\`typescript
// ❌ MAL: 5 ejemplos (200 tokens)
const promptWithMany = \`
Clasifica sentimiento. Ejemplos:

"Me encantó la película" → positivo
"Fue terrible" → negativo
"Estuvo bien" → neutral
"Increíble experiencia" → positivo
"No me gustó para nada" → negativo

Texto: \${text}
\`;

// ✅ BIEN: 2 ejemplos suficientes (80 tokens)
const promptWithFew = \`
Clasifica sentimiento:

"Me encantó" → positivo
"Fue terrible" → negativo

Texto: \${text}
\`;

// Ahorro: 60% tokens
\`\`\`

**4. Usar parámetros del modelo en vez de instrucciones**

\`\`\`typescript
// ❌ MAL: Instruir en el prompt
const response1 = await openai.chat.completions.create({
  messages: [
    {
      role: 'user',
      content: 'Responde en máximo 50 palabras: ' + question
    }
  ],
});
// Costo: tokens del prompt + posible exceso

// ✅ BIEN: Usar max_tokens
const response2 = await openai.chat.completions.create({
  messages: [{ role: 'user', content: question }],
  max_tokens: 70, // ~50 palabras
});
// Costo: menos tokens en prompt, límite garantizado
\`\`\`

**5. Reutilizar system prompts (no repetir en user)**

\`\`\`typescript
// ❌ MAL: Instrucciones en cada mensaje user
await openai.chat.completions.create({
  messages: [
    {
      role: 'user',
      content: 'Eres un experto en Python. Responde concisamente. ' + question1
    }
  ],
});
await openai.chat.completions.create({
  messages: [
    {
      role: 'user',
      content: 'Eres un experto en Python. Responde concisamente. ' + question2
    }
  ],
});
// Repite "Eres un experto..." en cada request

// ✅ BIEN: System prompt reutilizable
const systemPrompt = {
  role: 'system',
  content: 'Eres un experto en Python. Responde concisamente.'
};

await openai.chat.completions.create({
  messages: [systemPrompt, { role: 'user', content: question1 }],
});
await openai.chat.completions.create({
  messages: [systemPrompt, { role: 'user', content: question2 }],
});
// Con caching, el system prompt se paga una sola vez
\`\`\`

**6. Comprimir contexto con embeddings**

Para contexto muy grande, usa embeddings para filtrar solo lo relevante.

\`\`\`typescript
// Tienes 100 documentos (50k tokens totales)
// Quieres responder pregunta con contexto relevante

async function answerWithRAG(question: string, documents: string[]) {
  // 1. Generar embeddings de documentos (costo bajo, una vez)
  const docEmbeddings = await Promise.all(
    documents.map(doc => openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: doc,
    }))
  );

  // 2. Generar embedding de pregunta
  const questionEmbedding = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: question,
  });

  // 3. Encontrar top 3 documentos más relevantes (cosine similarity)
  const topDocs = findTopK(questionEmbedding, docEmbeddings, 3);
  // Solo 3 docs = ~1,500 tokens vs 50k tokens

  // 4. Generar respuesta con contexto reducido
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [
      { role: 'system', content: 'Responde basado en el contexto.' },
      { role: 'user', content: \`Contexto: \${topDocs.join('\\n')}\\n\\nPregunta: \${question}\` }
    ],
  });

  return response.choices[0].message.content;
}

// Ahorro: 97% tokens de contexto (1.5k vs 50k)
// Costo embeddings: $0.00002 (insignificante)
\`\`\`

**Medición de impacto:**

\`\`\`typescript
function comparePrompts(prompt1: string, prompt2: string, output1: string, output2: string) {
  const inputSavings = 1 - (countTokens(prompt2) / countTokens(prompt1));
  const outputSavings = 1 - (countTokens(output2) / countTokens(output1));
  const totalSavings = (inputSavings + outputSavings) / 2;

  console.log(\`Ahorro input: \${(inputSavings * 100).toFixed(1)}%\`);
  console.log(\`Ahorro output: \${(outputSavings * 100).toFixed(1)}%\`);
  console.log(\`Ahorro total: \${(totalSavings * 100).toFixed(1)}%\`);
}
\`\`\``,
      keyPoints: [
        'Eliminar redundancia puede reducir prompts 50-80% sin perder efectividad',
        'Outputs estructurados (JSON) son más compactos que lenguaje natural',
        'Usar parámetros del modelo (max_tokens) en vez de instrucciones en prompt',
        'RAG con embeddings reduce contexto 90-97% manteniendo relevancia',
      ],
    },
    {
      title: 'Monitoreo y Presupuestos',
      content: `Sin monitoreo, los costos pueden escalar descontroladamente. Implementa observabilidad desde día uno.

**1. Tracking básico de uso**

\`\`\`typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface UsageLog {
  timestamp: Date;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
  userId?: string;
  endpoint: string;
}

async function logUsage(usage: UsageLog) {
  await prisma.llmUsage.create({
    data: usage,
  });
}

// Wrapper para llamadas OpenAI
async function trackOpenAICall<T>(
  modelName: string,
  endpoint: string,
  callFn: () => Promise<T>,
  userId?: string
): Promise<T> {
  const startTime = Date.now();

  try {
    const response = await callFn();

    // Extraer uso de tokens
    const usage = (response as any).usage;

    if (usage) {
      const cost = calculateCost(
        {
          promptTokens: usage.prompt_tokens,
          completionTokens: usage.completion_tokens
        },
        PRICING[modelName]
      );

      await logUsage({
        timestamp: new Date(),
        model: modelName,
        promptTokens: usage.prompt_tokens,
        completionTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens,
        cost,
        userId,
        endpoint,
      });
    }

    return response;
  } catch (error) {
    console.error('OpenAI call failed:', error);
    throw error;
  }
}

// Uso
const response = await trackOpenAICall(
  'gpt-4-turbo',
  '/api/chat',
  () => openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [{ role: 'user', content: 'Hola' }],
  }),
  req.userId
);
\`\`\`

**2. Dashboard de costos en tiempo real**

\`\`\`typescript
// API endpoint para métricas
app.get('/api/metrics/llm-costs', async (req, res) => {
  const { startDate, endDate, groupBy = 'day' } = req.query;

  // Costos por período
  const costsByPeriod = await prisma.llmUsage.groupBy({
    by: ['model'],
    where: {
      timestamp: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    },
    _sum: {
      cost: true,
      promptTokens: true,
      completionTokens: true,
    },
    _count: {
      _all: true,
    },
  });

  // Top usuarios por costo
  const topUsers = await prisma.llmUsage.groupBy({
    by: ['userId'],
    where: {
      timestamp: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    },
    _sum: {
      cost: true,
    },
    orderBy: {
      _sum: {
        cost: 'desc',
      },
    },
    take: 10,
  });

  // Costos por endpoint
  const costsByEndpoint = await prisma.llmUsage.groupBy({
    by: ['endpoint'],
    _sum: {
      cost: true,
    },
  });

  res.json({
    costsByPeriod,
    topUsers,
    costsByEndpoint,
    totalCost: costsByPeriod.reduce((sum, item) => sum + (item._sum.cost || 0), 0),
  });
});
\`\`\`

**3. Alertas de presupuesto**

\`\`\`typescript
interface BudgetConfig {
  dailyLimit: number;    // USD
  monthlyLimit: number;  // USD
  alertThreshold: number; // 0.8 = 80%
}

const BUDGET: BudgetConfig = {
  dailyLimit: 100,
  monthlyLimit: 2000,
  alertThreshold: 0.8,
};

async function checkBudget(): Promise<boolean> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Costo del día
  const dailyCost = await prisma.llmUsage.aggregate({
    where: {
      timestamp: { gte: today },
    },
    _sum: {
      cost: true,
    },
  });

  const dailySpent = dailyCost._sum.cost || 0;

  if (dailySpent >= BUDGET.dailyLimit) {
    await sendAlert('CRITICAL', \`Límite diario alcanzado: $\${dailySpent}\`);
    return false; // Bloquear requests
  }

  if (dailySpent >= BUDGET.dailyLimit * BUDGET.alertThreshold) {
    await sendAlert('WARNING', \`80% del límite diario: $\${dailySpent}\`);
  }

  return true; // Permitir request
}

// Middleware de presupuesto
app.use('/api/llm/*', async (req, res, next) => {
  const withinBudget = await checkBudget();

  if (!withinBudget) {
    return res.status(429).json({
      error: 'Budget limit exceeded',
      message: 'Daily LLM budget has been reached. Try again tomorrow.',
    });
  }

  next();
});
\`\`\`

**4. Rate limiting por usuario**

\`\`\`typescript
import rateLimit from 'express-rate-limit';

// Límite de tokens por usuario
const TOKEN_LIMITS = {
  free: 10_000,      // 10k tokens/día
  pro: 100_000,      // 100k tokens/día
  enterprise: -1,    // Ilimitado
};

async function checkUserTokenLimit(userId: string, tier: string): Promise<boolean> {
  const limit = TOKEN_LIMITS[tier];
  if (limit === -1) return true;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const usage = await prisma.llmUsage.aggregate({
    where: {
      userId,
      timestamp: { gte: today },
    },
    _sum: {
      totalTokens: true,
    },
  });

  const tokensUsed = usage._sum.totalTokens || 0;
  return tokensUsed < limit;
}

app.post('/api/chat', async (req, res) => {
  const { userId, tier } = req.user;

  const canProceed = await checkUserTokenLimit(userId, tier);

  if (!canProceed) {
    return res.status(429).json({
      error: 'Token limit exceeded',
      message: \`You've reached your daily limit of \${TOKEN_LIMITS[tier]} tokens.\`,
    });
  }

  // Procesar request...
});
\`\`\`

**5. Herramientas de monitoreo profesionales**

Servicios especializados para LLM observability:

\`\`\`typescript
// LangSmith (LangChain)
import { LangChainTracer } from 'langchain/callbacks';

const tracer = new LangChainTracer({
  projectName: 'mi-proyecto',
  apiKey: process.env.LANGSMITH_API_KEY,
});

await chain.call(
  { input: 'Pregunta' },
  { callbacks: [tracer] }
);
// Auto-trackea tokens, latencia, errores, costos

// Helicone (OpenAI proxy)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://oai.hconeai.com/v1',
  defaultHeaders: {
    'Helicone-Auth': \`Bearer \${process.env.HELICONE_API_KEY}\`,
  },
});
// Todas las llamadas se logean automáticamente en dashboard

// LangFuse (open source)
import { Langfuse } from 'langfuse';

const langfuse = new Langfuse({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY,
  secretKey: process.env.LANGFUSE_SECRET_KEY,
});

const trace = langfuse.trace({ name: 'chat-completion' });
// Trackea costos, performance, user feedback
\`\`\`

**6. Reportes automatizados**

\`\`\`typescript
import cron from 'node-cron';

// Reporte diario a las 9 AM
cron.schedule('0 9 * * *', async () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const endOfYesterday = new Date(yesterday);
  endOfYesterday.setHours(23, 59, 59, 999);

  const report = await prisma.llmUsage.aggregate({
    where: {
      timestamp: {
        gte: yesterday,
        lte: endOfYesterday,
      },
    },
    _sum: {
      cost: true,
      totalTokens: true,
    },
    _count: {
      _all: true,
    },
  });

  const emailContent = \`
    Reporte diario LLM - \${yesterday.toDateString()}

    Requests totales: \${report._count._all}
    Tokens procesados: \${report._sum.totalTokens?.toLocaleString()}
    Costo total: $\${report._sum.cost?.toFixed(2)}

    Promedio por request: $\${(report._sum.cost! / report._count._all).toFixed(4)}
  \`;

  await sendEmail('team@company.com', 'Reporte LLM Diario', emailContent);
});
\`\`\`

Sin monitoreo, un bug puede gastar miles de dólares antes de detectarlo. Implementa tracking desde el inicio.`,
      keyPoints: [
        'Loggear todas las llamadas LLM con tokens, costos y metadata',
        'Implementar alertas automáticas al alcanzar 80% del presupuesto',
        'Rate limiting por usuario basado en tiers de servicio',
        'Usar herramientas especializadas (LangSmith, Helicone, LangFuse) para observability',
      ],
    },
  ],
};
