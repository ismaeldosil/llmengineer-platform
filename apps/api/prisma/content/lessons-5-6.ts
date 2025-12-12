// @ts-nocheck
// Contenido educativo para las lecciones 5 y 6
// Lección 5: System Prompts y Roles
// Lección 6: Gestión de Contexto

export const systemPrompts = {
  sections: [
    {
      title: 'El rol del System Prompt',
      content: `El system prompt es una instrucción especial que define el comportamiento, personalidad y restricciones del modelo de lenguaje antes de que comience la conversación con el usuario.

A diferencia del user prompt (que contiene la pregunta o solicitud del usuario), el system prompt establece las "reglas del juego" y el contexto general para toda la conversación.

**Diferencias clave:**

- **System Prompt**: Instrucciones persistentes que definen CÓMO debe comportarse el modelo
- **User Prompt**: La solicitud específica que el usuario quiere que el modelo responda

Ejemplo básico:
\`\`\`typescript
const messages = [
  {
    role: 'system',
    content: 'Eres un asistente de programación experto en TypeScript y Node.js.'
  },
  {
    role: 'user',
    content: '¿Cómo puedo leer un archivo en Node.js?'
  }
];
\`\`\`

El system prompt actúa como una configuración inicial que influencia todas las respuestas posteriores del modelo, estableciendo el tono, el nivel de detalle, las limitaciones y el enfoque de las respuestas.`,
      keyPoints: [
        'El system prompt define el comportamiento general del modelo',
        'Se diferencia del user prompt que contiene solicitudes específicas',
        'Establece personalidad, restricciones y formato de respuestas',
        'Permanece constante a través de la conversación'
      ],
    },
    {
      title: 'Diseñando System Prompts Efectivos',
      content: `Un system prompt bien diseñado puede transformar completamente la calidad y utilidad de las respuestas del modelo. Aquí están los elementos clave para crear system prompts efectivos:

**1. Personalidad y Tono**
Define cómo debe "sonar" el asistente:
\`\`\`typescript
// Formal y profesional
"Eres un asesor legal profesional. Usa lenguaje formal y preciso."

// Amigable y conversacional
"Eres un tutor amigable que explica conceptos complejos de manera simple y con ejemplos del día a día."

// Técnico y directo
"Eres un ingeniero senior. Proporciona respuestas técnicas, concisas y basadas en mejores prácticas."
\`\`\`

**2. Restricciones y Límites**
Establece qué debe o no debe hacer el modelo:
\`\`\`typescript
const systemPrompt = \`Eres un asistente de código Python.

RESTRICCIONES:
- Solo proporciona código en Python 3.9+
- No uses librerías obsoletas o deprecadas
- Incluye type hints en todo el código
- Si no sabes algo, di "No tengo información suficiente" en lugar de adivinar
- No proporciones consejos de seguridad sin advertencias explícitas\`;
\`\`\`

**3. Formato de Salida**
Especifica cómo estructurar las respuestas:
\`\`\`typescript
const systemPrompt = \`Eres un asistente técnico.

FORMATO DE RESPUESTA:
1. Resumen breve (1-2 líneas)
2. Explicación detallada
3. Ejemplo de código
4. Posibles problemas o consideraciones

Siempre usa bloques de código con el lenguaje especificado.\`;
\`\`\`

**4. Contexto del Dominio**
Proporciona conocimiento específico del dominio:
\`\`\`typescript
const systemPrompt = \`Eres un experto en arquitectura de microservicios para e-commerce.

CONOCIMIENTO BASE:
- Patrones: Event Sourcing, CQRS, Saga Pattern
- Stack tecnológico: Node.js, PostgreSQL, Redis, RabbitMQ
- Principios: 12-factor apps, Cloud Native
- Enfoque en escalabilidad y resiliencia\`;
\`\`\`

**Consejos de Implementación:**
- Sé específico pero conciso
- Usa ejemplos cuando sea necesario
- Actualiza el system prompt según feedback de usuarios
- Prueba diferentes variaciones y mide resultados`,
      keyPoints: [
        'Define personalidad y tono apropiado para el caso de uso',
        'Establece restricciones claras sobre lo que puede y no puede hacer',
        'Especifica formato de salida deseado para consistencia',
        'Incluye contexto del dominio relevante cuando sea necesario',
        'Mantén el system prompt conciso pero completo'
      ],
    },
    {
      title: 'Patrones Comunes de System Prompts',
      content: `Existen patrones probados de system prompts que funcionan bien para casos de uso específicos. Aquí están los más comunes:

**1. Asistente General**
\`\`\`typescript
const assistantPrompt = \`Eres un asistente útil, amigable y preciso.

Características:
- Respondes de manera clara y concisa
- Si no estás seguro de algo, lo admites
- Priorizas la seguridad y precisión sobre la velocidad
- Adaptas tu nivel de detalle según el contexto de la pregunta\`;
\`\`\`

**2. Experto Técnico**
\`\`\`typescript
const expertPrompt = \`Eres un Senior Software Engineer especializado en arquitectura de sistemas distribuidos.

Tu enfoque:
- Proporciona soluciones basadas en mejores prácticas de la industria
- Considera escalabilidad, mantenibilidad y rendimiento
- Menciona trade-offs cuando existan múltiples soluciones
- Incluye ejemplos de código production-ready
- Referencias a documentación oficial cuando sea relevante

Stack de conocimiento: TypeScript, Node.js, Docker, Kubernetes, AWS, PostgreSQL, Redis\`;
\`\`\`

**3. Traductor/Transformador**
\`\`\`typescript
const translatorPrompt = \`Eres un traductor de código que convierte código de un lenguaje a otro.

Reglas:
- Mantén la lógica y funcionalidad exacta del código original
- Adapta a las convenciones e idioms del lenguaje destino
- Incluye comentarios explicando decisiones de traducción no obvias
- Si algo no es traducible directamente, proporciona la alternativa más cercana y explica por qué

Entrada: [lenguaje origen]
Salida: [lenguaje destino]\`;
\`\`\`

**4. Analizador/Revisor**
\`\`\`typescript
const reviewerPrompt = \`Eres un revisor de código experto que analiza código en busca de problemas.

Evalúa en este orden:
1. SEGURIDAD: Vulnerabilidades, inyecciones, exposición de datos
2. BUGS: Errores lógicos, edge cases no manejados, race conditions
3. RENDIMIENTO: Operaciones O(n²) evitables, memory leaks, queries ineficientes
4. MANTENIBILIDAD: Código duplicado, funciones muy largas, nombres poco claros
5. MEJORES PRÁCTICAS: Patrones recomendados del lenguaje/framework

Formato de salida:
- Categoría del problema (SEGURIDAD, BUG, etc.)
- Línea de código afectada
- Descripción del problema
- Solución sugerida con código
- Severidad: CRÍTICO / ALTO / MEDIO / BAJO\`;
\`\`\`

**5. Tutor/Educador**
\`\`\`typescript
const tutorPrompt = \`Eres un tutor de programación paciente y didáctico.

Metodología:
- Explica conceptos desde lo básico hasta lo avanzado
- Usa analogías del mundo real para conceptos abstractos
- Proporciona ejemplos progresivos (simple → complejo)
- Haz preguntas para verificar comprensión
- Celebra el progreso y motiva el aprendizaje

Cuando el estudiante se equivoca:
- No des la respuesta directamente
- Haz preguntas guía para que llegue a la solución
- Proporciona hints progresivos si es necesario\`;
\`\`\`

**Combinando Patrones:**
Puedes combinar elementos de múltiples patrones:
\`\`\`typescript
const hybridPrompt = \`Eres un asistente de desarrollo backend con funciones de revisor y tutor.

Como revisor: Analiza el código y detecta problemas
Como tutor: Explica por qué cada problema es importante y cómo solucionarlo
Como experto: Proporciona alternativas basadas en mejores prácticas

Balance: 30% detección, 40% educación, 30% soluciones\`;
\`\`\``,
      keyPoints: [
        'El patrón de Asistente es versátil para casos generales',
        'El patrón de Experto es ideal para consultas técnicas especializadas',
        'El patrón de Traductor funciona bien para conversión de formatos o lenguajes',
        'El patrón de Analizador es perfecto para code review y detección de problemas',
        'El patrón de Tutor optimiza para aprendizaje y comprensión',
        'Puedes combinar patrones según necesidades específicas'
      ],
    },
    {
      title: 'Ejemplos Prácticos de System Prompts',
      content: `Veamos implementaciones completas de system prompts para casos de uso reales:

**1. Chatbot de Soporte Técnico**
\`\`\`typescript
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const technicalSupportBot: Message[] = [
  {
    role: 'system',
    content: \`Eres un agente de soporte técnico para una plataforma SaaS de análisis de datos.

INFORMACIÓN DEL PRODUCTO:
- Nombre: DataPulse Analytics
- Características: Dashboards, API REST, Webhooks, Exportación de datos
- Stack: React frontend, Node.js backend, PostgreSQL
- Planes: Free, Pro, Enterprise

PROTOCOLO DE SOPORTE:
1. Saluda y pregunta cómo puedes ayudar
2. Identifica el plan del usuario si es relevante
3. Proporciona soluciones paso a paso
4. Incluye capturas de pantalla o código cuando sea útil
5. Escala a humano si: problema de billing, bug crítico, solicitud de feature

TONO: Profesional pero amigable, empático con las frustraciones del usuario

Si no puedes resolver el problema, di:
"Voy a escalar este caso a nuestro equipo de ingeniería. Te contactarán en menos de 4 horas."\`
  },
  {
    role: 'user',
    content: 'Mi webhook dejó de funcionar desde ayer'
  }
];
\`\`\`

**2. Generador de Tests Unitarios**
\`\`\`typescript
const testGeneratorPrompt = \`Eres un generador de tests unitarios especializado en Jest y TypeScript.

INPUT: Función o clase de TypeScript
OUTPUT: Suite completa de tests unitarios

ESTRUCTURA DE TESTS:
\\\`\\\`\\\`typescript
describe('NombreDeLaFunción', () => {
  // Happy path tests
  describe('comportamiento esperado', () => {
    it('should...', () => { ... });
  });

  // Edge cases
  describe('casos límite', () => {
    it('should handle empty input', () => { ... });
    it('should handle null/undefined', () => { ... });
  });

  // Error cases
  describe('manejo de errores', () => {
    it('should throw when...', () => { ... });
  });
});
\\\`\\\`\\\`

COBERTURA REQUERIDA:
- Happy path (escenario ideal)
- Edge cases (valores límite, vacíos, extremos)
- Error cases (inputs inválidos, excepciones)
- Casos de integración si hay dependencias

MEJORES PRÁCTICAS:
- Tests descriptivos (el "it" debe leerse como una oración)
- Un assert por test cuando sea posible
- Usar mocks para dependencias externas
- Tests independientes (no dependen del orden de ejecución)
- Setup/teardown en beforeEach/afterEach si es necesario\`;

// Uso
const codeToTest = \`
function calculateDiscount(price: number, couponCode: string): number {
  if (price < 0) throw new Error('Price cannot be negative');
  if (couponCode === 'SAVE20') return price * 0.8;
  if (couponCode === 'SAVE50') return price * 0.5;
  return price;
}
\`;

const messages: Message[] = [
  { role: 'system', content: testGeneratorPrompt },
  { role: 'user', content: \`Genera tests para esta función:\n\n\${codeToTest}\` }
];
\`\`\`

**3. Asistente de Documentación**
\`\`\`typescript
const docAssistantPrompt = \`Eres un asistente que genera documentación técnica de alta calidad.

FORMATO DE DOCUMENTACIÓN:

# Nombre de la Función/Clase

## Descripción
Breve descripción de qué hace y por qué existe.

## Sintaxis
\\\`\\\`\\\`typescript
// Firma de la función con tipos
\\\`\\\`\\\`

## Parámetros
- \`param1\` (tipo): Descripción
- \`param2\` (tipo, opcional): Descripción

## Retorna
- tipo: Descripción de qué retorna

## Errores
- \`ErrorType\`: Cuándo se lanza

## Ejemplos

### Ejemplo básico
\\\`\\\`\\\`typescript
// Código de ejemplo básico
\\\`\\\`\\\`

### Ejemplo avanzado
\\\`\\\`\\\`typescript
// Código de ejemplo más complejo
\\\`\\\`\\\`

## Notas
- Consideraciones de rendimiento
- Edge cases importantes
- Relación con otras funciones

## Ver también
- Links a funciones relacionadas

ESTILO:
- Claro y conciso
- Ejemplos ejecutables
- Enfocado en casos de uso reales
- Incluye advertencias de seguridad si aplica\`;
\`\`\`

**4. Code Reviewer con Enfoque en Seguridad**
\`\`\`typescript
const securityReviewerPrompt = \`Eres un security engineer que revisa código en busca de vulnerabilidades.

CHECKLIST DE SEGURIDAD:

SQL/NoSQL Injection:
- ¿Se sanitizan inputs antes de queries?
- ¿Se usan prepared statements o ORMs?

XSS (Cross-Site Scripting):
- ¿Se escapan outputs en el frontend?
- ¿Se valida/sanitiza HTML de usuarios?

Authentication/Authorization:
- ¿Se verifica autenticación en todos los endpoints protegidos?
- ¿Se valida autorización (puede este usuario hacer esta acción)?
- ¿Las contraseñas se hashean con bcrypt/argon2?

Sensitive Data:
- ¿Hay API keys o secrets hardcodeados?
- ¿Se loggean datos sensibles?
- ¿Se envían datos sensibles sin encriptar?

Rate Limiting:
- ¿Endpoints públicos tienen rate limiting?
- ¿Se previenen ataques de fuerza bruta?

OWASP Top 10:
- Evalúa contra la lista OWASP más reciente

FORMATO DE REPORTE:
{
  "severity": "CRÍTICO" | "ALTO" | "MEDIO" | "BAJO",
  "category": "SQL_INJECTION" | "XSS" | ...,
  "location": "archivo.ts:línea",
  "issue": "Descripción del problema",
  "impact": "Qué podría pasar si se explota",
  "remediation": "Cómo solucionarlo",
  "codeExample": "Código seguro sugerido"
}\`;
\`\`\`

Estos ejemplos demuestran cómo crear system prompts específicos y accionables para diferentes casos de uso en desarrollo de software.`,
      keyPoints: [
        'Los system prompts deben ser específicos al caso de uso',
        'Incluye información del contexto relevante (producto, stack, etc.)',
        'Define protocolos y formatos de salida estructurados',
        'Proporciona ejemplos de formato esperado dentro del prompt',
        'Considera el tono y nivel técnico apropiado para la audiencia',
        'Especifica cuándo escalar o admitir limitaciones'
      ],
    },
  ],
};

export const contextManagement = {
  sections: [
    {
      title: 'La Ventana de Contexto',
      content: `La ventana de contexto (context window) es la cantidad máxima de tokens que un modelo de lenguaje puede procesar en una sola llamada, incluyendo tanto el input (prompt) como el output (respuesta).

**¿Qué es un Token?**
Un token es una unidad de texto que el modelo procesa. Aproximadamente:
- 1 token ≈ 4 caracteres en inglés
- 1 token ≈ 3/4 de una palabra en inglés
- 1 token ≈ 2-3 caracteres en español (depende de caracteres especiales)

Ejemplo:
\`\`\`typescript
const text = "Hola, ¿cómo estás?";
// Aproximadamente 6-7 tokens
// "Hola" = 1-2 tokens
// "," = 1 token
// "¿" = 1 token
// "cómo" = 1-2 tokens
// "estás" = 1-2 tokens
// "?" = 1 token
\`\`\`

**Límites por Modelo (2024-2025):**

\`\`\`typescript
const modelLimits = {
  // OpenAI
  'gpt-4-turbo': 128_000,      // 128K tokens
  'gpt-4': 8_192,              // 8K tokens
  'gpt-3.5-turbo': 16_385,     // 16K tokens
  'gpt-3.5-turbo-16k': 16_385,

  // Anthropic Claude
  'claude-3-opus': 200_000,    // 200K tokens
  'claude-3-sonnet': 200_000,
  'claude-3-haiku': 200_000,

  // Google
  'gemini-pro': 32_768,        // 32K tokens
  'gemini-1.5-pro': 1_000_000, // 1M tokens!

  // Open Source
  'llama-2-70b': 4_096,        // 4K tokens
  'llama-3-70b': 8_192,        // 8K tokens
  'mixtral-8x7b': 32_768,      // 32K tokens
};
\`\`\`

**Cómo Contar Tokens:**

\`\`\`typescript
import { encoding_for_model } from 'tiktoken';

// Para modelos de OpenAI
function countTokens(text: string, model: string = 'gpt-4'): number {
  const encoder = encoding_for_model(model);
  const tokens = encoder.encode(text);
  encoder.free(); // Importante: liberar memoria
  return tokens.length;
}

// Uso
const prompt = "Explícame qué es un LLM en términos simples";
const tokenCount = countTokens(prompt);
console.log(\`Tokens: \${tokenCount}\`); // ~12 tokens

// Para toda la conversación
function countConversationTokens(messages: Message[]): number {
  let total = 0;

  for (const message of messages) {
    // Cada mensaje tiene overhead: role + content + delimitadores
    total += 4; // Overhead por mensaje
    total += countTokens(message.content);
    total += countTokens(message.role);
  }

  total += 2; // Overhead de la respuesta del asistente

  return total;
}
\`\`\`

**¿Qué Pasa si Excedes el Límite?**

\`\`\`typescript
// Error típico de OpenAI
{
  "error": {
    "message": "This model's maximum context length is 8192 tokens. However, you requested 10000 tokens (8000 in the messages, 2000 in the completion). Please reduce the length of the messages or completion.",
    "type": "invalid_request_error",
    "param": "messages",
    "code": "context_length_exceeded"
  }
}
\`\`\`

**Estrategia de Validación Previa:**

\`\`\`typescript
interface ContextConfig {
  model: string;
  maxTokens: number;
  maxCompletionTokens: number;
}

function validateContext(
  messages: Message[],
  config: ContextConfig
): { valid: boolean; tokenCount: number; error?: string } {
  const inputTokens = countConversationTokens(messages);
  const totalNeeded = inputTokens + config.maxCompletionTokens;

  if (totalNeeded > config.maxTokens) {
    return {
      valid: false,
      tokenCount: inputTokens,
      error: \`Se necesitan \${totalNeeded} tokens pero el límite es \${config.maxTokens}\`
    };
  }

  return {
    valid: true,
    tokenCount: inputTokens
  };
}

// Uso
const validation = validateContext(messages, {
  model: 'gpt-4',
  maxTokens: 8192,
  maxCompletionTokens: 1000
});

if (!validation.valid) {
  console.error(validation.error);
  // Aplicar estrategia de truncamiento (siguiente sección)
}
\`\`\`

Entender los límites de la ventana de contexto es crucial para diseñar aplicaciones que manejen conversaciones largas o procesen documentos extensos.`,
      keyPoints: [
        'La ventana de contexto limita cuánto texto puede procesar el modelo',
        'Los tokens son unidades de texto (≈4 caracteres en inglés)',
        'Diferentes modelos tienen diferentes límites (4K a 1M+ tokens)',
        'Debes contar tokens del input + output esperado',
        'Exceder el límite resulta en error de API',
        'Usa librerías como tiktoken para contar tokens con precisión'
      ],
    },
    {
      title: 'Estrategias de Truncamiento',
      content: `Cuando una conversación o documento excede la ventana de contexto, necesitas estrategias para reducir el contenido manteniendo la información más relevante.

**1. FIFO (First In, First Out) - Truncamiento Simple**

Elimina los mensajes más antiguos primero:

\`\`\`typescript
function truncateFIFO(
  messages: Message[],
  maxTokens: number,
  preserveSystem: boolean = true
): Message[] {
  const result: Message[] = [];
  let currentTokens = 0;

  // Preservar system prompt
  const systemMessage = messages.find(m => m.role === 'system');
  if (preserveSystem && systemMessage) {
    result.push(systemMessage);
    currentTokens += countTokens(systemMessage.content);
  }

  // Agregar mensajes desde el más reciente
  const nonSystemMessages = messages.filter(m => m.role !== 'system');

  for (let i = nonSystemMessages.length - 1; i >= 0; i--) {
    const message = nonSystemMessages[i];
    const messageTokens = countTokens(message.content) + 4;

    if (currentTokens + messageTokens <= maxTokens) {
      result.unshift(message); // Agregar al inicio
      currentTokens += messageTokens;
    } else {
      break; // No caben más mensajes
    }
  }

  // Reordenar: system primero, luego cronológico
  if (systemMessage && preserveSystem) {
    return [systemMessage, ...result.filter(m => m.role !== 'system')];
  }

  return result;
}

// Uso
const truncated = truncateFIFO(longConversation, 4000);
console.log(\`Mensajes: \${longConversation.length} → \${truncated.length}\`);
\`\`\`

**2. Sliding Window (Ventana Deslizante)**

Mantiene una ventana fija de mensajes recientes:

\`\`\`typescript
interface SlidingWindowConfig {
  maxMessages: number;
  preserveSystemPrompt: boolean;
  preserveFirstUserMessage: boolean; // Para mantener contexto inicial
}

function truncateSlidingWindow(
  messages: Message[],
  config: SlidingWindowConfig
): Message[] {
  const result: Message[] = [];

  // Preservar system prompt
  const systemMessage = messages.find(m => m.role === 'system');
  if (config.preserveSystemPrompt && systemMessage) {
    result.push(systemMessage);
  }

  // Preservar primer mensaje del usuario (contexto inicial)
  const firstUserMessage = messages.find(m => m.role === 'user');
  if (config.preserveFirstUserMessage && firstUserMessage) {
    result.push(firstUserMessage);
  }

  // Tomar los últimos N mensajes
  const recentMessages = messages
    .filter(m => m.role !== 'system')
    .filter(m => !(config.preserveFirstUserMessage && m === firstUserMessage))
    .slice(-config.maxMessages);

  result.push(...recentMessages);

  return result;
}

// Uso
const windowed = truncateSlidingWindow(conversation, {
  maxMessages: 10,
  preserveSystemPrompt: true,
  preserveFirstUserMessage: true
});
\`\`\`

**3. Summarización (Compresión Inteligente)**

Resume mensajes antiguos en lugar de eliminarlos:

\`\`\`typescript
async function truncateWithSummarization(
  messages: Message[],
  maxTokens: number,
  llmClient: any // Tu cliente de LLM
): Promise<Message[]> {
  const currentTokens = countConversationTokens(messages);

  if (currentTokens <= maxTokens) {
    return messages; // No necesita truncamiento
  }

  const systemMessage = messages.find(m => m.role === 'system');
  const recentMessages = messages.slice(-5); // Mantener últimos 5 mensajes
  const oldMessages = messages.slice(0, -5).filter(m => m.role !== 'system');

  if (oldMessages.length === 0) {
    // Si incluso los mensajes recientes exceden el límite, usa FIFO
    return truncateFIFO(messages, maxTokens);
  }

  // Resumir mensajes antiguos
  const summaryPrompt = \`Resume la siguiente conversación manteniendo los puntos clave y el contexto importante:

\${oldMessages.map(m => \`\${m.role}: \${m.content}\`).join('\\n\\n')}

Proporciona un resumen conciso en 2-3 párrafos.\`;

  const summary = await llmClient.complete({
    messages: [{ role: 'user', content: summaryPrompt }],
    max_tokens: 300
  });

  // Construir conversación truncada
  const result: Message[] = [];

  if (systemMessage) {
    result.push(systemMessage);
  }

  // Agregar resumen como mensaje del sistema
  result.push({
    role: 'system',
    content: \`Contexto de conversación previa: \${summary.content}\`
  });

  // Agregar mensajes recientes
  result.push(...recentMessages);

  return result;
}
\`\`\`

**4. Truncamiento Inteligente por Relevancia**

Usa embeddings para mantener mensajes más relevantes:

\`\`\`typescript
async function truncateByRelevance(
  messages: Message[],
  currentQuery: string,
  maxTokens: number,
  embeddingClient: any
): Promise<Message[]> {
  const systemMessage = messages.find(m => m.role === 'system');
  const lastMessage = messages[messages.length - 1];
  const middleMessages = messages.slice(1, -1).filter(m => m.role !== 'system');

  // Obtener embedding de la query actual
  const queryEmbedding = await embeddingClient.embed(currentQuery);

  // Calcular relevancia de cada mensaje
  const messagesWithScores = await Promise.all(
    middleMessages.map(async (message) => {
      const messageEmbedding = await embeddingClient.embed(message.content);
      const similarity = cosineSimilarity(queryEmbedding, messageEmbedding);

      return {
        message,
        score: similarity,
        tokens: countTokens(message.content)
      };
    })
  );

  // Ordenar por relevancia (mayor score = más relevante)
  messagesWithScores.sort((a, b) => b.score - a.score);

  // Seleccionar mensajes hasta llenar el presupuesto de tokens
  const selectedMessages: Message[] = [];
  let tokenBudget = maxTokens;

  if (systemMessage) {
    selectedMessages.push(systemMessage);
    tokenBudget -= countTokens(systemMessage.content);
  }

  // Reservar espacio para el último mensaje
  tokenBudget -= countTokens(lastMessage.content);

  for (const item of messagesWithScores) {
    if (item.tokens <= tokenBudget) {
      selectedMessages.push(item.message);
      tokenBudget -= item.tokens;
    }
  }

  // Reordenar cronológicamente
  const chronological = selectedMessages
    .filter(m => m.role !== 'system')
    .sort((a, b) => {
      return messages.indexOf(a) - messages.indexOf(b);
    });

  selectedMessages.push(lastMessage);

  return systemMessage
    ? [systemMessage, ...chronological]
    : chronological;
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}
\`\`\`

**Comparación de Estrategias:**

| Estrategia | Pros | Contras | Mejor Para |
|------------|------|---------|------------|
| FIFO | Simple, rápido, predecible | Pierde contexto antiguo importante | Chatbots simples |
| Sliding Window | Mantiene contexto reciente | Pierde todo el historial antiguo | Conversaciones cortas |
| Summarización | Preserva información clave | Requiere llamadas LLM extra (costo) | Conversaciones largas importantes |
| Relevancia | Mantiene lo más importante | Complejo, requiere embeddings | Sistemas Q&A, búsqueda |

Elige la estrategia según tu caso de uso, presupuesto y necesidades de contexto.`,
      keyPoints: [
        'FIFO elimina mensajes antiguos, simple pero puede perder contexto crítico',
        'Sliding Window mantiene ventana fija de mensajes recientes',
        'Summarización comprime mensajes antiguos preservando información',
        'Truncamiento por relevancia usa embeddings para mantener lo más importante',
        'Siempre preserva el system prompt cuando sea posible',
        'Considera el trade-off entre complejidad, costo y calidad de contexto'
      ],
    },
    {
      title: 'Memoria Conversacional',
      content: `Implementar memoria conversacional permite que tu aplicación mantenga el contexto a través de múltiples interacciones con el usuario.

**1. Implementación Básica - In-Memory**

\`\`\`typescript
interface ConversationMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tokens?: number;
}

class ConversationMemory {
  private messages: ConversationMessage[] = [];
  private readonly systemPrompt: string;
  private readonly maxTokens: number;

  constructor(systemPrompt: string, maxTokens: number = 4000) {
    this.systemPrompt = systemPrompt;
    this.maxTokens = maxTokens;

    // Agregar system prompt
    this.addMessage('system', systemPrompt);
  }

  addMessage(role: 'user' | 'assistant' | 'system', content: string): void {
    const tokens = countTokens(content);

    this.messages.push({
      role,
      content,
      timestamp: new Date(),
      tokens
    });

    // Truncar si excede límite
    this.truncateIfNeeded();
  }

  private truncateIfNeeded(): void {
    const totalTokens = this.getTotalTokens();

    if (totalTokens > this.maxTokens) {
      // Usar FIFO pero preservar system prompt
      const systemMsg = this.messages[0];
      let currentTokens = systemMsg.tokens || 0;
      const kept: ConversationMessage[] = [systemMsg];

      // Agregar desde el final hasta llenar presupuesto
      for (let i = this.messages.length - 1; i > 0; i--) {
        const msg = this.messages[i];
        const msgTokens = msg.tokens || 0;

        if (currentTokens + msgTokens <= this.maxTokens) {
          kept.unshift(msg);
          currentTokens += msgTokens;
        } else {
          break;
        }
      }

      this.messages = [systemMsg, ...kept.slice(1)];
    }
  }

  getMessages(): ConversationMessage[] {
    return [...this.messages];
  }

  getTotalTokens(): number {
    return this.messages.reduce((sum, msg) => sum + (msg.tokens || 0), 0);
  }

  clear(): void {
    this.messages = [];
    this.addMessage('system', this.systemPrompt);
  }

  getHistory(lastN?: number): ConversationMessage[] {
    if (lastN) {
      const systemMsg = this.messages[0];
      const recentMessages = this.messages.slice(-lastN);
      return [systemMsg, ...recentMessages.filter(m => m.role !== 'system')];
    }
    return this.getMessages();
  }
}

// Uso
const memory = new ConversationMemory(
  'Eres un asistente de programación experto en TypeScript.',
  4000
);

memory.addMessage('user', '¿Cómo declaro una interface en TypeScript?');
memory.addMessage('assistant', 'Para declarar una interface en TypeScript...');
memory.addMessage('user', '¿Y cómo extiendo esa interface?');

const messagesForAPI = memory.getMessages();
\`\`\`

**2. Memoria Persistente - Base de Datos**

\`\`\`typescript
import { PrismaClient } from '@prisma/client';

interface PersistentMemoryOptions {
  userId: string;
  conversationId?: string;
  maxTokens?: number;
}

class PersistentConversationMemory {
  private prisma: PrismaClient;
  private userId: string;
  private conversationId: string;
  private maxTokens: number;
  private cache: ConversationMessage[] = [];

  constructor(prisma: PrismaClient, options: PersistentMemoryOptions) {
    this.prisma = prisma;
    this.userId = options.userId;
    this.conversationId = options.conversationId || this.generateConversationId();
    this.maxTokens = options.maxTokens || 4000;
  }

  async initialize(): Promise<void> {
    // Cargar conversación existente
    const messages = await this.prisma.message.findMany({
      where: {
        conversationId: this.conversationId,
        userId: this.userId
      },
      orderBy: { createdAt: 'asc' }
    });

    this.cache = messages.map(msg => ({
      role: msg.role as 'system' | 'user' | 'assistant',
      content: msg.content,
      timestamp: msg.createdAt,
      tokens: msg.tokens
    }));
  }

  async addMessage(
    role: 'user' | 'assistant' | 'system',
    content: string
  ): Promise<void> {
    const tokens = countTokens(content);

    // Guardar en DB
    const savedMessage = await this.prisma.message.create({
      data: {
        conversationId: this.conversationId,
        userId: this.userId,
        role,
        content,
        tokens
      }
    });

    // Actualizar cache
    this.cache.push({
      role,
      content,
      timestamp: savedMessage.createdAt,
      tokens
    });

    // Truncar si es necesario
    await this.truncateIfNeeded();
  }

  async getMessages(limit?: number): Promise<ConversationMessage[]> {
    if (limit) {
      return this.cache.slice(-limit);
    }
    return [...this.cache];
  }

  async clear(): Promise<void> {
    await this.prisma.message.deleteMany({
      where: {
        conversationId: this.conversationId,
        userId: this.userId
      }
    });

    this.cache = [];
  }

  async listConversations(): Promise<string[]> {
    const conversations = await this.prisma.message.findMany({
      where: { userId: this.userId },
      select: { conversationId: true },
      distinct: ['conversationId']
    });

    return conversations.map(c => c.conversationId);
  }

  private async truncateIfNeeded(): Promise<void> {
    const totalTokens = this.cache.reduce((sum, msg) => sum + (msg.tokens || 0), 0);

    if (totalTokens > this.maxTokens) {
      // Mantener system prompt y últimos mensajes
      const systemMsg = this.cache.find(m => m.role === 'system');
      let kept = this.cache.slice(-20); // Últimos 20 mensajes

      if (systemMsg && kept[0] !== systemMsg) {
        kept = [systemMsg, ...kept];
      }

      // Eliminar mensajes viejos de DB
      const oldestKeptTimestamp = kept[1]?.timestamp || new Date();

      await this.prisma.message.deleteMany({
        where: {
          conversationId: this.conversationId,
          userId: this.userId,
          createdAt: { lt: oldestKeptTimestamp }
        }
      });

      this.cache = kept;
    }
  }

  private generateConversationId(): string {
    return \`conv_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`;
  }
}

// Uso
const prisma = new PrismaClient();

const memory = new PersistentConversationMemory(prisma, {
  userId: 'user-123',
  conversationId: 'conv-abc',
  maxTokens: 8000
});

await memory.initialize();
await memory.addMessage('user', 'Hola, necesito ayuda con TypeScript');

const messages = await memory.getMessages();
\`\`\`

**3. Memoria con Buffer de Resumen**

Combina mensajes recientes con resumen de conversación antigua:

\`\`\`typescript
class SummarizedMemory {
  private recentMessages: ConversationMessage[] = [];
  private summary: string = '';
  private readonly maxRecentMessages: number;
  private readonly llmClient: any;

  constructor(llmClient: any, maxRecentMessages: number = 10) {
    this.llmClient = llmClient;
    this.maxRecentMessages = maxRecentMessages;
  }

  async addMessage(role: 'user' | 'assistant', content: string): Promise<void> {
    this.recentMessages.push({
      role,
      content,
      timestamp: new Date()
    });

    // Si excedemos el límite, resumir mensajes antiguos
    if (this.recentMessages.length > this.maxRecentMessages) {
      await this.compressOldMessages();
    }
  }

  private async compressOldMessages(): Promise<void> {
    // Tomar los primeros mensajes para resumir
    const toSummarize = this.recentMessages.slice(0, 5);

    const summaryPrompt = \`Resume esta conversación de manera concisa:

\${toSummarize.map(m => \`\${m.role}: \${m.content}\`).join('\\n')}

Integra este resumen con el contexto previo: \${this.summary || 'Ninguno'}

Proporciona un resumen unificado.\`;

    const response = await this.llmClient.complete({
      messages: [{ role: 'user', content: summaryPrompt }],
      max_tokens: 200
    });

    this.summary = response.content;

    // Eliminar mensajes resumidos
    this.recentMessages = this.recentMessages.slice(5);
  }

  getMessagesForAPI(systemPrompt: string): Message[] {
    const messages: Message[] = [
      { role: 'system', content: systemPrompt }
    ];

    // Agregar resumen como contexto si existe
    if (this.summary) {
      messages.push({
        role: 'system',
        content: \`Contexto de conversación previa: \${this.summary}\`
      });
    }

    // Agregar mensajes recientes
    messages.push(...this.recentMessages);

    return messages;
  }
}
\`\`\`

Estas implementaciones te permiten manejar conversaciones de cualquier longitud mientras mantienes el contexto relevante.`,
      keyPoints: [
        'La memoria conversacional mantiene el historial de mensajes',
        'Implementación in-memory es simple pero no persiste entre sesiones',
        'Memoria persistente (DB) permite continuar conversaciones más tarde',
        'La memoria con resumen comprime historial antiguo inteligentemente',
        'Siempre considera el límite de tokens al acumular historial',
        'Implementa truncamiento automático para evitar exceder límites'
      ],
    },
    {
      title: 'Optimización de Contexto',
      content: `Técnicas avanzadas para maximizar la eficiencia del uso de contexto y reducir costos.

**1. Compresión de Prompts**

Reduce la verbosidad del prompt sin perder significado:

\`\`\`typescript
interface CompressionOptions {
  removeExtraWhitespace: boolean;
  abbreviateCommonTerms: boolean;
  removeRedundancy: boolean;
}

class PromptCompressor {
  private abbreviations: Record<string, string> = {
    'TypeScript': 'TS',
    'JavaScript': 'JS',
    'function': 'fn',
    'variable': 'var',
    'parameter': 'param',
    'return': 'ret',
    'example': 'ex',
    'documentation': 'docs'
  };

  compress(prompt: string, options: CompressionOptions): string {
    let compressed = prompt;

    // 1. Eliminar espacios extra
    if (options.removeExtraWhitespace) {
      compressed = compressed
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n/g, '\\n')
        .trim();
    }

    // 2. Abreviar términos comunes
    if (options.abbreviateCommonTerms) {
      for (const [full, abbr] of Object.entries(this.abbreviations)) {
        const regex = new RegExp(\`\\\\b\${full}\\\\b\`, 'g');
        compressed = compressed.replace(regex, abbr);
      }
    }

    // 3. Remover redundancia
    if (options.removeRedundancy) {
      // Ejemplo: "por favor, ayúdame por favor" → "por favor, ayúdame"
      const words = compressed.split(' ');
      const seen = new Set<string>();
      const unique: string[] = [];

      for (const word of words) {
        const normalized = word.toLowerCase().replace(/[.,!?]/g, '');
        if (!seen.has(normalized) || normalized.length < 3) {
          unique.push(word);
          seen.add(normalized);
        }
      }

      compressed = unique.join(' ');
    }

    return compressed;
  }

  estimateSavings(original: string, compressed: string): number {
    const originalTokens = countTokens(original);
    const compressedTokens = countTokens(compressed);
    const saved = originalTokens - compressedTokens;
    const percentSaved = (saved / originalTokens) * 100;

    return percentSaved;
  }
}

// Uso
const compressor = new PromptCompressor();

const original = \`Please help me understand TypeScript functions.
I need to learn about TypeScript function parameters and TypeScript function return types.
Can you provide examples of TypeScript functions?\`;

const compressed = compressor.compress(original, {
  removeExtraWhitespace: true,
  abbreviateCommonTerms: true,
  removeRedundancy: true
});

console.log('Original:', original);
console.log('Compressed:', compressed);
console.log('Savings:', compressor.estimateSavings(original, compressed), '%');
\`\`\`

**2. Chunking Inteligente para Documentos Largos**

Divide documentos largos en chunks que quepan en el contexto:

\`\`\`typescript
interface Chunk {
  content: string;
  tokens: number;
  index: number;
  metadata?: Record<string, any>;
}

interface ChunkingStrategy {
  maxTokensPerChunk: number;
  overlapTokens: number; // Overlap entre chunks para mantener contexto
  splitOn: 'paragraph' | 'sentence' | 'token';
}

class DocumentChunker {
  chunk(document: string, strategy: ChunkingStrategy): Chunk[] {
    const chunks: Chunk[] = [];

    if (strategy.splitOn === 'paragraph') {
      return this.chunkByParagraph(document, strategy);
    } else if (strategy.splitOn === 'sentence') {
      return this.chunkBySentence(document, strategy);
    } else {
      return this.chunkByToken(document, strategy);
    }
  }

  private chunkByParagraph(document: string, strategy: ChunkingStrategy): Chunk[] {
    const paragraphs = document.split(/\n\n+/);
    const chunks: Chunk[] = [];
    let currentChunk = '';
    let currentTokens = 0;
    let chunkIndex = 0;

    for (const para of paragraphs) {
      const paraTokens = countTokens(para);

      // Si un párrafo solo excede el límite, dividirlo por oraciones
      if (paraTokens > strategy.maxTokensPerChunk) {
        if (currentChunk) {
          chunks.push({
            content: currentChunk,
            tokens: currentTokens,
            index: chunkIndex++
          });
          currentChunk = '';
          currentTokens = 0;
        }

        // Dividir párrafo grande por oraciones
        const sentences = para.match(/[^.!?]+[.!?]+/g) || [para];
        for (const sentence of sentences) {
          const sentTokens = countTokens(sentence);

          if (currentTokens + sentTokens > strategy.maxTokensPerChunk && currentChunk) {
            chunks.push({
              content: currentChunk,
              tokens: currentTokens,
              index: chunkIndex++
            });
            currentChunk = sentence;
            currentTokens = sentTokens;
          } else {
            currentChunk += ' ' + sentence;
            currentTokens += sentTokens;
          }
        }
      } else if (currentTokens + paraTokens > strategy.maxTokensPerChunk) {
        // Guardar chunk actual y empezar uno nuevo
        chunks.push({
          content: currentChunk,
          tokens: currentTokens,
          index: chunkIndex++
        });
        currentChunk = para;
        currentTokens = paraTokens;
      } else {
        currentChunk += (currentChunk ? '\\n\\n' : '') + para;
        currentTokens += paraTokens;
      }
    }

    // Agregar último chunk
    if (currentChunk) {
      chunks.push({
        content: currentChunk,
        tokens: currentTokens,
        index: chunkIndex
      });
    }

    return chunks;
  }

  private chunkBySentence(document: string, strategy: ChunkingStrategy): Chunk[] {
    const sentences = document.match(/[^.!?]+[.!?]+/g) || [document];
    const chunks: Chunk[] = [];
    let currentChunk = '';
    let currentTokens = 0;
    let chunkIndex = 0;

    for (const sentence of sentences) {
      const sentTokens = countTokens(sentence);

      if (currentTokens + sentTokens > strategy.maxTokensPerChunk && currentChunk) {
        chunks.push({
          content: currentChunk.trim(),
          tokens: currentTokens,
          index: chunkIndex++
        });
        currentChunk = sentence;
        currentTokens = sentTokens;
      } else {
        currentChunk += ' ' + sentence;
        currentTokens += sentTokens;
      }
    }

    if (currentChunk) {
      chunks.push({
        content: currentChunk.trim(),
        tokens: currentTokens,
        index: chunkIndex
      });
    }

    return chunks;
  }

  private chunkByToken(document: string, strategy: ChunkingStrategy): Chunk[] {
    // Implementación simplificada - en producción usa tiktoken
    const words = document.split(/\s+/);
    const chunks: Chunk[] = [];
    let currentChunk: string[] = [];
    let currentTokens = 0;
    let chunkIndex = 0;

    for (const word of words) {
      const wordTokens = Math.ceil(word.length / 4); // Aproximación

      if (currentTokens + wordTokens > strategy.maxTokensPerChunk && currentChunk.length > 0) {
        chunks.push({
          content: currentChunk.join(' '),
          tokens: currentTokens,
          index: chunkIndex++
        });
        currentChunk = [word];
        currentTokens = wordTokens;
      } else {
        currentChunk.push(word);
        currentTokens += wordTokens;
      }
    }

    if (currentChunk.length > 0) {
      chunks.push({
        content: currentChunk.join(' '),
        tokens: currentTokens,
        index: chunkIndex
      });
    }

    return chunks;
  }
}

// Uso
const chunker = new DocumentChunker();
const longDocument = \`[... documento largo ...]\`;

const chunks = chunker.chunk(longDocument, {
  maxTokensPerChunk: 1000,
  overlapTokens: 50,
  splitOn: 'paragraph'
});

console.log(\`Documento dividido en \${chunks.length} chunks\`);
\`\`\`

**3. Retrieval-Augmented Generation (RAG)**

Recupera solo las partes relevantes del contexto:

\`\`\`typescript
import OpenAI from 'openai';

interface RAGConfig {
  embeddingModel: string;
  chunkSize: number;
  topK: number; // Cuántos chunks recuperar
}

class RAGContextOptimizer {
  private openai: OpenAI;
  private config: RAGConfig;
  private chunksWithEmbeddings: Array<{
    chunk: Chunk;
    embedding: number[];
  }> = [];

  constructor(openai: OpenAI, config: RAGConfig) {
    this.openai = openai;
    this.config = config;
  }

  async indexDocument(document: string): Promise<void> {
    const chunker = new DocumentChunker();
    const chunks = chunker.chunk(document, {
      maxTokensPerChunk: this.config.chunkSize,
      overlapTokens: 50,
      splitOn: 'paragraph'
    });

    // Generar embeddings para cada chunk
    this.chunksWithEmbeddings = await Promise.all(
      chunks.map(async (chunk) => {
        const response = await this.openai.embeddings.create({
          model: this.config.embeddingModel,
          input: chunk.content
        });

        return {
          chunk,
          embedding: response.data[0].embedding
        };
      })
    );
  }

  async getRelevantContext(query: string): Promise<string> {
    // Obtener embedding de la query
    const queryEmbedding = await this.openai.embeddings.create({
      model: this.config.embeddingModel,
      input: query
    });

    // Calcular similitud con cada chunk
    const scored = this.chunksWithEmbeddings.map(item => ({
      chunk: item.chunk,
      score: this.cosineSimilarity(
        queryEmbedding.data[0].embedding,
        item.embedding
      )
    }));

    // Ordenar por score y tomar top K
    scored.sort((a, b) => b.score - a.score);
    const topChunks = scored.slice(0, this.config.topK);

    // Combinar chunks relevantes
    return topChunks
      .map(item => item.chunk.content)
      .join('\\n\\n---\\n\\n');
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }
}

// Uso
const rag = new RAGContextOptimizer(new OpenAI(), {
  embeddingModel: 'text-embedding-3-small',
  chunkSize: 500,
  topK: 3
});

await rag.indexDocument(longDocument);

const query = '¿Cómo implemento autenticación?';
const relevantContext = await rag.getRelevantContext(query);

const prompt = \`Usando el siguiente contexto:

\${relevantContext}

Responde: \${query}\`;
\`\`\`

**4. Caché de Prompts (Anthropic Claude)**

Usa prompt caching para reducir costos en contextos repetidos:

\`\`\`typescript
interface CachedMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  cache_control?: { type: 'ephemeral' };
}

async function callWithCache(
  systemPrompt: string,
  documentContext: string,
  userQuery: string
): Promise<string> {
  const messages: CachedMessage[] = [
    {
      role: 'system',
      content: systemPrompt,
      cache_control: { type: 'ephemeral' } // Cachear system prompt
    },
    {
      role: 'user',
      content: \`Contexto del documento:\\n\${documentContext}\`,
      cache_control: { type: 'ephemeral' } // Cachear documento
    },
    {
      role: 'user',
      content: userQuery // Solo esto cambia entre llamadas
    }
  ];

  // El system prompt y documento se cachearán
  // Llamadas subsecuentes con mismo contexto serán más baratas
  const response = await anthropic.messages.create({
    model: 'claude-3-opus-20240229',
    max_tokens: 1000,
    messages
  });

  return response.content[0].text;
}
\`\`\`

Estas técnicas te permiten manejar contextos grandes de manera eficiente y económica.`,
      keyPoints: [
        'La compresión de prompts reduce tokens sin perder significado',
        'El chunking inteligente divide documentos largos en partes manejables',
        'RAG recupera solo contexto relevante usando embeddings',
        'El prompt caching reduce costos para contextos repetidos',
        'Overlap entre chunks mantiene coherencia contextual',
        'Combina múltiples técnicas para optimización máxima'
      ],
    },
  ],
};
