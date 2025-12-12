export const structuredOutputs = {
  sections: [
    {
      title: '¿Por qué Outputs Estructurados?',
      content: `Cuando trabajamos con LLMs, el texto libre es útil para interfaces conversacionales, pero la mayoría de aplicaciones empresariales necesitan datos estructurados que puedan procesarse, almacenarse e integrarse con otros sistemas.

**El problema del texto libre**

Por defecto, los LLMs generan respuestas en texto natural. Si pides a un modelo extraer información de un documento, podría responder:

"La empresa XYZ reportó ingresos de $5.2 millones en el Q3 2024, un aumento del 15% comparado con el año anterior."

Para integrar esto en una base de datos o dashboard, necesitarías parsear manualmente el texto, lo cual es:
- Propenso a errores (el formato puede variar)
- Difícil de escalar (cada respuesta podría estructurarse diferente)
- Frágil ante cambios en el estilo del modelo

**La solución: JSON estructurado**

En lugar de texto libre, podemos instruir al LLM para que retorne datos en formato JSON:

\`\`\`json
{
  "empresa": "XYZ",
  "ingresos": {
    "monto": 5200000,
    "moneda": "USD",
    "periodo": "Q3 2024"
  },
  "crecimiento": {
    "porcentaje": 15,
    "periodo_comparacion": "Q3 2023"
  }
}
\`\`\`

Este formato es:
- **Predecible**: Siempre tiene la misma estructura
- **Tipado**: Puedes validar tipos de datos
- **Integrable**: Se consume directamente en código

**Casos de uso comunes**

1. **Extracción de entidades**: Extraer personas, lugares, fechas de documentos
2. **Clasificación estructurada**: Categorizar con metadatos adicionales
3. **Formularios dinámicos**: Generar configuraciones de UI
4. **Pipelines de datos**: Transformar datos no estructurados a estructurados
5. **Integración con APIs**: Generar requests válidos para otros servicios

**Beneficios arquitecturales**

- **Type Safety**: En TypeScript, puedes definir interfaces para las respuestas
- **Validación automática**: Verifica que los datos cumplan con el schema esperado
- **Testing simplificado**: Pruebas más fáciles con datos predecibles
- **Debugging mejorado**: Errores de formato son evidentes inmediatamente
- **Composabilidad**: La salida de un LLM puede ser entrada de otro proceso`,
      keyPoints: [
        'Los outputs estructurados permiten integrar LLMs con sistemas empresariales',
        'JSON es el formato más común para structured outputs',
        'Resuelve problemas de parsing, validación y type safety',
        'Esencial para pipelines de datos y automatización',
        'Permite testing y debugging más efectivos'
      ],
    },
    {
      title: 'Técnicas de Extracción Estructurada',
      content: `Existen varias técnicas para obtener outputs estructurados de LLMs, cada una con diferentes niveles de confiabilidad y complejidad.

**1. Prompting para JSON**

La técnica más básica es instruir al modelo en el prompt:

\`\`\`typescript
const prompt = \`Extrae la información del siguiente texto y retorna un JSON con este formato:
{
  "nombre": string,
  "edad": number,
  "profesion": string,
  "habilidades": string[]
}

Texto: "María González tiene 32 años y trabaja como ingeniera de software.
Domina Python, TypeScript y Go."

Retorna únicamente el JSON, sin texto adicional.\`;

const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: prompt }]
});

const data = JSON.parse(response.choices[0].message.content);
\`\`\`

**Ventajas**: Simple, no requiere features especiales
**Desventajas**: El modelo puede agregar texto antes/después del JSON, formato puede variar

**2. Few-Shot Examples**

Mejora la consistencia proporcionando ejemplos:

\`\`\`typescript
const prompt = \`Extrae información estructurada. Ejemplos:

Input: "Juan tiene 25 años, es diseñador"
Output: {"nombre": "Juan", "edad": 25, "profesion": "diseñador"}

Input: "Ana, 30, desarrolladora"
Output: {"nombre": "Ana", "edad": 30, "profesion": "desarrolladora"}

Ahora extrae:
Input: "Carlos Ruiz, 28 años, arquitecto de software"
Output:\`;
\`\`\`

**3. Regex y Post-Processing**

Para mayor robustez, extrae JSON con regex:

\`\`\`typescript
function extractJSON(text: string): any {
  // Busca el primer objeto JSON válido
  const jsonMatch = text.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/);

  if (!jsonMatch) {
    throw new Error('No se encontró JSON en la respuesta');
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    // Intenta limpiar el JSON (remover commas finales, etc)
    const cleaned = jsonMatch[0]
      .replace(/,(\s*[}\]])/g, '$1')  // Remove trailing commas
      .replace(/'/g, '"');             // Replace single quotes

    return JSON.parse(cleaned);
  }
}
\`\`\`

**4. Response Format (OpenAI)**

OpenAI soporta un parámetro \`response_format\` que fuerza JSON:

\`\`\`typescript
const response = await openai.chat.completions.create({
  model: "gpt-4-turbo",
  messages: [
    {
      role: "system",
      content: "Extrae información y retorna JSON con: nombre, edad, profesion"
    },
    {
      role: "user",
      content: "María González tiene 32 años, ingeniera de software"
    }
  ],
  response_format: { type: "json_object" }
});

// Garantizado que es JSON válido
const data = JSON.parse(response.choices[0].message.content);
\`\`\`

**Importante**: Con \`response_format: { type: "json_object" }\`, DEBES mencionar "JSON" en el prompt del sistema o usuario, de lo contrario la API retornará error.

**5. JSON Mode con Schema (Claude)**

Anthropic Claude permite especificar schemas más estrictos:

\`\`\`typescript
const message = await anthropic.messages.create({
  model: "claude-3-5-sonnet-20241022",
  messages: [{
    role: "user",
    content: "Extrae: María González, 32, ingeniera"
  }],
  tools: [{
    name: "extract_person",
    description: "Extrae información de una persona",
    input_schema: {
      type: "object",
      properties: {
        nombre: { type: "string" },
        edad: { type: "number" },
        profesion: { type: "string" }
      },
      required: ["nombre", "edad", "profesion"]
    }
  }],
  tool_choice: { type: "tool", name: "extract_person" }
});
\`\`\`

**Mejores prácticas**

1. **Sé explícito**: Describe claramente el schema esperado
2. **Usa ejemplos**: Few-shot mejora consistencia
3. **Valida siempre**: Nunca asumas que el JSON es válido
4. **Maneja errores**: Ten fallbacks para parsing failures
5. **Prefiere APIs nativas**: \`response_format\` y tool calling son más confiables`,
      keyPoints: [
        'Prompting básico es simple pero menos confiable',
        'Few-shot examples mejoran significativamente la consistencia',
        'response_format garantiza JSON válido en OpenAI',
        'Regex post-processing añade robustez a cualquier técnica',
        'Siempre valida el output incluso con formato forzado'
      ],
    },
    {
      title: 'Function Calling / Tool Use',
      content: `Function calling (OpenAI) y tool use (Anthropic) son las técnicas más robustas para obtener outputs estructurados. El LLM no genera texto libre, sino que "llama" a una función con parámetros validados.

**Conceptos fundamentales**

En lugar de pedir al LLM que retorne JSON, le proporcionas un catálogo de "herramientas" (funciones) que puede usar. El modelo decide:
1. Qué función llamar
2. Con qué parámetros
3. Basándose en el contexto de la conversación

**Ejemplo básico (OpenAI)**

\`\`\`typescript
interface PersonInfo {
  nombre: string;
  edad: number;
  profesion: string;
  habilidades: string[];
}

const tools = [
  {
    type: "function",
    function: {
      name: "guardar_persona",
      description: "Guarda información de una persona en la base de datos",
      parameters: {
        type: "object",
        properties: {
          nombre: {
            type: "string",
            description: "Nombre completo de la persona"
          },
          edad: {
            type: "number",
            description: "Edad en años"
          },
          profesion: {
            type: "string",
            description: "Profesión u ocupación actual"
          },
          habilidades: {
            type: "array",
            items: { type: "string" },
            description: "Lista de habilidades técnicas"
          }
        },
        required: ["nombre", "edad", "profesion"],
        additionalProperties: false
      }
    }
  }
];

const response = await openai.chat.completions.create({
  model: "gpt-4-turbo",
  messages: [
    {
      role: "user",
      content: "María González tiene 32 años y es ingeniera de software. Sabe Python, TypeScript y Go."
    }
  ],
  tools: tools,
  tool_choice: "auto" // o { type: "function", function: { name: "guardar_persona" } }
});

const toolCall = response.choices[0].message.tool_calls?.[0];

if (toolCall?.function.name === "guardar_persona") {
  const args: PersonInfo = JSON.parse(toolCall.function.arguments);

  // args está validado contra el schema
  console.log(args);
  // { nombre: "María González", edad: 32, profesion: "ingeniera de software",
  //   habilidades: ["Python", "TypeScript", "Go"] }

  // Ejecuta tu lógica de negocio
  await database.personas.create(args);
}
\`\`\`

**Ejemplo con Anthropic Claude**

\`\`\`typescript
const message = await anthropic.messages.create({
  model: "claude-3-5-sonnet-20241022",
  messages: [{
    role: "user",
    content: "María González tiene 32 años y es ingeniera de software. Sabe Python, TypeScript y Go."
  }],
  tools: [{
    name: "guardar_persona",
    description: "Guarda información de una persona en la base de datos",
    input_schema: {
      type: "object",
      properties: {
        nombre: { type: "string", description: "Nombre completo" },
        edad: { type: "number", description: "Edad en años" },
        profesion: { type: "string", description: "Profesión actual" },
        habilidades: {
          type: "array",
          items: { type: "string" },
          description: "Habilidades técnicas"
        }
      },
      required: ["nombre", "edad", "profesion"]
    }
  }],
  tool_choice: { type: "tool", name: "guardar_persona" }
});

const toolUse = message.content.find(block => block.type === 'tool_use');

if (toolUse && toolUse.type === 'tool_use') {
  const args = toolUse.input as PersonInfo;
  await database.personas.create(args);
}
\`\`\`

**Múltiples herramientas**

El poder real viene de definir múltiples tools:

\`\`\`typescript
const tools = [
  {
    type: "function",
    function: {
      name: "buscar_persona",
      description: "Busca una persona en la base de datos",
      parameters: {
        type: "object",
        properties: {
          nombre: { type: "string" },
          filtros: {
            type: "object",
            properties: {
              edad_min: { type: "number" },
              edad_max: { type: "number" },
              profesion: { type: "string" }
            }
          }
        },
        required: ["nombre"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "crear_persona",
      description: "Crea una nueva persona",
      parameters: { /* ... */ }
    }
  },
  {
    type: "function",
    function: {
      name: "actualizar_persona",
      description: "Actualiza información existente",
      parameters: { /* ... */ }
    }
  }
];

// El modelo elige la función correcta basándose en el intent del usuario
const response = await openai.chat.completions.create({
  model: "gpt-4-turbo",
  messages: [
    { role: "user", content: "¿Hay algún ingeniero de software llamado Carlos?" }
  ],
  tools: tools
});

// El modelo llamará a "buscar_persona" con los parámetros apropiados
\`\`\`

**Parallel Function Calling**

Algunos modelos pueden llamar múltiples funciones en paralelo:

\`\`\`typescript
const response = await openai.chat.completions.create({
  model: "gpt-4-turbo",
  messages: [
    {
      role: "user",
      content: "¿Cuál es el clima en Madrid y Barcelona?"
    }
  ],
  tools: [{ /* get_weather tool */ }],
  parallel_tool_calls: true
});

// response.choices[0].message.tool_calls tendrá múltiples llamadas
response.choices[0].message.tool_calls?.forEach(call => {
  // Procesar cada llamada
});
\`\`\`

**Ventajas clave**

1. **Validación automática**: El modelo respeta el schema
2. **Type safety**: Los parámetros están tipados
3. **Separación de concerns**: Lógica de negocio separada del prompting
4. **Mejor UX**: Puedes mostrar "loading" por herramienta
5. **Debugging**: Logs claros de qué función se llamó y con qué args

**Cuándo usar function calling**

- Cuando necesitas ejecutar acciones (APIs, DB, etc)
- Para structured data extraction crítica
- En agentes que toman decisiones
- Cuando requieres validación estricta de schema`,
      keyPoints: [
        'Function calling es la técnica más robusta para outputs estructurados',
        'El LLM elige qué función llamar basándose en el contexto',
        'Los parámetros son validados automáticamente contra el schema',
        'Soporta múltiples herramientas y llamadas en paralelo',
        'Ideal para agentic workflows y extracción crítica de datos'
      ],
    },
    {
      title: 'Validación y Fallbacks',
      content: `Incluso con function calling y JSON mode, la validación es crítica. Los modelos pueden generar datos que técnicamente cumplen el schema JSON pero son semánticamente incorrectos.

**El problema de la validación básica**

\`\`\`typescript
// JSON válido, pero datos incorrectos
{
  "edad": -5,
  "email": "not-an-email",
  "fecha_nacimiento": "2099-13-45",
  "temperatura": 99999
}
\`\`\`

JSON Schema valida tipos, pero no lógica de negocio.

**Zod: Runtime Validation**

Zod es la librería estándar para validación en TypeScript:

\`\`\`typescript
import { z } from 'zod';

// Define el schema con validaciones
const PersonSchema = z.object({
  nombre: z.string().min(1, "Nombre no puede estar vacío"),
  edad: z.number().int().min(0).max(120, "Edad debe estar entre 0-120"),
  email: z.string().email("Email inválido"),
  profesion: z.string(),
  habilidades: z.array(z.string()).optional(),
  fecha_nacimiento: z.string().date().optional(),
  salario: z.number().positive().optional()
});

type Person = z.infer<typeof PersonSchema>;

// Uso con OpenAI function calling
const response = await openai.chat.completions.create({
  model: "gpt-4-turbo",
  messages: [{ role: "user", content: "..." }],
  tools: [{
    type: "function",
    function: {
      name: "create_person",
      parameters: zodToJsonSchema(PersonSchema) // Helper para convertir
    }
  }]
});

const toolCall = response.choices[0].message.tool_calls?.[0];

if (toolCall) {
  const rawArgs = JSON.parse(toolCall.function.arguments);

  // Validación con Zod
  const result = PersonSchema.safeParse(rawArgs);

  if (result.success) {
    const person: Person = result.data;
    await createPerson(person);
  } else {
    console.error("Validación fallida:", result.error.errors);
    // Implementar fallback
  }
}
\`\`\`

**Helper: Zod to JSON Schema**

\`\`\`typescript
import { zodToJsonSchema } from 'zod-to-json-schema';

const jsonSchema = zodToJsonSchema(PersonSchema, {
  name: "PersonSchema",
  $refStrategy: "none"
});

// Ahora puedes usar jsonSchema en parameters
\`\`\`

**Estrategias de Fallback**

**1. Retry con prompt mejorado**

\`\`\`typescript
async function extractWithRetry<T>(
  schema: z.ZodSchema<T>,
  prompt: string,
  maxRetries = 3
): Promise<T> {
  let lastError: z.ZodError | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const enhancedPrompt = attempt > 0
      ? \`\${prompt}

NOTA: El intento anterior falló con estos errores:
\${lastError?.errors.map(e => \`- \${e.path.join('.')}: \${e.message}\`).join('\\n')}

Por favor corrige estos problemas.\`
      : prompt;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: enhancedPrompt }],
      response_format: { type: "json_object" }
    });

    const data = JSON.parse(response.choices[0].message.content || '{}');
    const result = schema.safeParse(data);

    if (result.success) {
      return result.data;
    }

    lastError = result.error;
  }

  throw new Error(\`Falló después de \${maxRetries} intentos: \${lastError}\`);
}
\`\`\`

**2. Valores por defecto**

\`\`\`typescript
const PersonWithDefaults = z.object({
  nombre: z.string().default("Desconocido"),
  edad: z.number().default(0),
  profesion: z.string().default("No especificado"),
  activo: z.boolean().default(true)
});

// Si faltan campos, usa defaults
const result = PersonWithDefaults.parse(incompleteData);
\`\`\`

**3. Validación parcial**

\`\`\`typescript
// Acepta subset de campos
const PartialPerson = PersonSchema.partial();

// O marca solo algunos como opcionales
const PersonUpdate = PersonSchema.pick({
  nombre: true,
  email: true
}).partial();
\`\`\`

**4. Transformaciones**

\`\`\`typescript
const PersonSchema = z.object({
  nombre: z.string().transform(s => s.trim().toLowerCase()),
  edad: z.number().or(z.string().transform(Number)), // "25" -> 25
  tags: z.string().transform(s => s.split(',').map(t => t.trim()))
});
\`\`\`

**5. Refinements (validación custom)**

\`\`\`typescript
const PersonSchema = z.object({
  fecha_nacimiento: z.string().date(),
  edad: z.number()
}).refine(
  data => {
    const birthYear = new Date(data.fecha_nacimiento).getFullYear();
    const currentYear = new Date().getFullYear();
    const calculatedAge = currentYear - birthYear;
    return Math.abs(calculatedAge - data.edad) <= 1;
  },
  { message: "Edad no coincide con fecha de nacimiento" }
);
\`\`\`

**Patrón completo de validación**

\`\`\`typescript
async function safeExtract<T>(
  schema: z.ZodSchema<T>,
  input: string
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: input }],
      response_format: { type: "json_object" }
    });

    const rawData = JSON.parse(response.choices[0].message.content || '{}');
    const validated = schema.parse(rawData);

    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map(e => e.message).join(', ')
      };
    }

    return { success: false, error: String(error) };
  }
}

// Uso
const result = await safeExtract(PersonSchema, "María, 32 años, ingeniera");

if (result.success) {
  console.log("Datos válidos:", result.data);
} else {
  console.error("Error:", result.error);
  // Implementar fallback: retry, usar defaults, pedir aclaración, etc.
}
\`\`\`

**Mejores prácticas**

1. **Valida siempre**: Incluso con function calling
2. **Usa Zod**: Runtime + compile-time type safety
3. **Implementa retries**: Con feedback de errores al modelo
4. **Logging detallado**: Registra validaciones fallidas
5. **Graceful degradation**: Usa parciales o defaults cuando sea aceptable
6. **Monitorea patrones**: Si un campo falla consistentemente, mejora el prompt`,
      keyPoints: [
        'JSON válido no garantiza datos semánticamente correctos',
        'Zod proporciona validación runtime con type safety',
        'Implementa retries con feedback de errores de validación',
        'Usa defaults y transformaciones para robustez',
        'Refinements permiten validación de lógica de negocio compleja'
      ],
    },
  ],
};

export const errorHandling = {
  sections: [
    {
      title: 'Tipos de Errores Comunes',
      content: `Las APIs de LLMs pueden fallar de múltiples formas. Entender cada tipo de error es crucial para implementar manejo robusto.

**1. Rate Limit Errors (429)**

El error más común en producción. Ocurre cuando excedes los límites de:
- Requests por minuto (RPM)
- Tokens por minuto (TPM)
- Tokens por día (TPD)

\`\`\`typescript
// OpenAI
{
  error: {
    message: "Rate limit reached for requests",
    type: "requests",
    param: null,
    code: "rate_limit_exceeded"
  }
}

// Anthropic
{
  error: {
    type: "rate_limit_error",
    message: "Rate limit exceeded. Please retry after 20 seconds."
  }
}
\`\`\`

**Señales**: HTTP 429, headers \`Retry-After\` o \`X-RateLimit-*\`

**2. Invalid Request Errors (400)**

Errores en el formato o contenido de la request:

\`\`\`typescript
// Ejemplos comunes:
- Modelo no existe: "model 'gpt-5' does not exist"
- Parámetros inválidos: "temperature must be between 0 and 2"
- Token limit excedido: "maximum context length is 8192 tokens, you requested 10000"
- Messages mal formateados: "messages must be an array"
- JSON inválido en function calling
\`\`\`

**Importante**: Estos errores NO deben retryarse, indican un bug en tu código.

**3. Authentication Errors (401)**

API key inválida, expirada o sin permisos:

\`\`\`typescript
{
  error: {
    message: "Incorrect API key provided",
    type: "invalid_request_error",
    code: "invalid_api_key"
  }
}
\`\`\`

**Nota**: Verifica variables de entorno y rotación de keys.

**4. Timeout Errors**

La request tarda demasiado y el cliente/servidor aborta:

\`\`\`typescript
// Client-side timeout
Error: Request timed out after 60000ms

// Server-side timeout (504)
{
  error: {
    message: "The server had an error processing your request",
    type: "server_error"
  }
}
\`\`\`

**Común con**: Prompts largos, max_tokens alto, modelos lentos.

**5. Server Errors (500, 502, 503)**

Errores del lado del proveedor:

\`\`\`typescript
// 500 Internal Server Error
{
  error: {
    message: "The server had an error processing your request",
    type: "server_error"
  }
}

// 503 Service Unavailable
{
  error: {
    message: "The service is temporarily unavailable",
    type: "service_unavailable"
  }
}
\`\`\`

**Acción**: Retry con backoff, estos son transitorios.

**6. Content Filter Errors**

El input o output viola políticas de contenido:

\`\`\`typescript
// OpenAI
{
  error: {
    message: "Your request was rejected as a result of our safety system",
    type: "invalid_request_error",
    code: "content_filter"
  }
}

// Anthropic
finish_reason: "content_filtered"
\`\`\`

**7. Context Length Exceeded**

Tokens totales (input + output) exceden el límite del modelo:

\`\`\`typescript
{
  error: {
    message: "This model's maximum context length is 4096 tokens.
              However, your messages resulted in 5234 tokens.",
    type: "invalid_request_error",
    code: "context_length_exceeded"
  }
}
\`\`\`

**Solución**: Truncar contexto, usar modelos con mayor límite, streaming.

**8. Network Errors**

Problemas de conectividad:

\`\`\`typescript
// DNS failure
Error: getaddrinfo ENOTFOUND api.openai.com

// Connection timeout
Error: connect ETIMEDOUT

// Connection reset
Error: socket hang up
\`\`\`

**Clasificación para retry logic**

\`\`\`typescript
function shouldRetry(error: any): boolean {
  // Status codes que indican retry
  const retryableStatuses = [408, 429, 500, 502, 503, 504];

  if (error.response?.status && retryableStatuses.includes(error.response.status)) {
    return true;
  }

  // Network errors
  if (error.code && ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND'].includes(error.code)) {
    return true;
  }

  // OpenAI specific
  if (error.type === 'server_error' || error.code === 'rate_limit_exceeded') {
    return true;
  }

  return false;
}

function shouldNotRetry(error: any): boolean {
  const nonRetryableStatuses = [400, 401, 403, 404];

  if (error.response?.status && nonRetryableStatuses.includes(error.response.status)) {
    return true;
  }

  const nonRetryableCodes = [
    'invalid_api_key',
    'invalid_request_error',
    'context_length_exceeded',
    'content_filter'
  ];

  if (error.code && nonRetryableCodes.includes(error.code)) {
    return true;
  }

  return false;
}
\`\`\`

**Logging de errores**

\`\`\`typescript
interface ErrorLog {
  timestamp: string;
  errorType: string;
  statusCode?: number;
  message: string;
  model: string;
  tokensUsed?: number;
  retryAttempt: number;
  context: {
    userId?: string;
    requestId?: string;
    promptLength: number;
  };
}

function logError(error: any, context: any): void {
  const errorLog: ErrorLog = {
    timestamp: new Date().toISOString(),
    errorType: error.type || error.code || 'unknown',
    statusCode: error.response?.status,
    message: error.message,
    model: context.model,
    retryAttempt: context.retryAttempt,
    context: {
      requestId: context.requestId,
      promptLength: context.prompt?.length || 0
    }
  };

  // Envía a tu sistema de logging (DataDog, Sentry, etc)
  logger.error('LLM API Error', errorLog);
}
\`\`\``,
      keyPoints: [
        'Rate limits (429) son el error más común en producción',
        'Errores 4xx (excepto 429) no deben retryarse - indican bugs',
        'Errores 5xx son transitorios - siempre retry con backoff',
        'Context length y content filter requieren lógica especial',
        'Clasifica errores correctamente para implementar retry logic'
      ],
    },
    {
      title: 'Rate Limits Explicados',
      content: `Los rate limits protegen la infraestructura del proveedor y aseguran acceso justo. Entender cómo funcionan es esencial para aplicaciones en producción.

**Tipos de Rate Limits**

**1. Requests Per Minute (RPM)**

Límite de requests HTTP por minuto:

\`\`\`
Free tier:     3 RPM
Pay-as-you-go: 500 RPM (GPT-3.5), 10,000 RPM (GPT-4)
Enterprise:    Custom
\`\`\`

**Ejemplo**: Si tienes 500 RPM y haces 600 requests en un minuto, 100 fallarán con 429.

**2. Tokens Per Minute (TPM)**

Límite de tokens procesados por minuto (input + output):

\`\`\`
GPT-3.5-turbo: 90,000 TPM
GPT-4:         10,000 TPM
GPT-4-turbo:   300,000 TPM
\`\`\`

**Ejemplo**:
\`\`\`typescript
// Request 1: 500 tokens input + 500 output = 1,000 tokens
// Request 2: 800 tokens input + 200 output = 1,000 tokens
// ...
// Request 10: 1,000 tokens
// Total: 10,000 TPM - próxima request falla si excede
\`\`\`

**3. Tokens Per Day (TPD)**

Límite diario para planes con cuotas:

\`\`\`
Free tier: 40,000 TPD
Tier 1:    200,000 TPD
Tier 5:    10,000,000 TPD
\`\`\`

**Rate Limit Headers**

Los proveedores retornan headers útiles:

\`\`\`typescript
// OpenAI response headers
{
  'x-ratelimit-limit-requests': '500',
  'x-ratelimit-limit-tokens': '90000',
  'x-ratelimit-remaining-requests': '499',
  'x-ratelimit-remaining-tokens': '89500',
  'x-ratelimit-reset-requests': '120ms',
  'x-ratelimit-reset-tokens': '640ms',
  'retry-after': '20'  // Solo en 429 errors
}

// Anthropic
{
  'anthropic-ratelimit-requests-limit': '1000',
  'anthropic-ratelimit-requests-remaining': '999',
  'anthropic-ratelimit-requests-reset': '2024-01-01T00:00:00Z',
  'anthropic-ratelimit-tokens-limit': '100000',
  'anthropic-ratelimit-tokens-remaining': '99000',
  'anthropic-ratelimit-tokens-reset': '2024-01-01T00:00:00Z',
  'retry-after': '20'
}
\`\`\`

**Tracking proactivo**

\`\`\`typescript
class RateLimitTracker {
  private requestsRemaining: number = Infinity;
  private tokensRemaining: number = Infinity;
  private requestsResetAt: Date | null = null;
  private tokensResetAt: Date | null = null;

  updateFromHeaders(headers: Headers): void {
    // OpenAI
    const reqRemaining = headers.get('x-ratelimit-remaining-requests');
    const tokRemaining = headers.get('x-ratelimit-remaining-tokens');
    const reqReset = headers.get('x-ratelimit-reset-requests');
    const tokReset = headers.get('x-ratelimit-reset-tokens');

    if (reqRemaining) this.requestsRemaining = parseInt(reqRemaining);
    if (tokRemaining) this.tokensRemaining = parseInt(tokRemaining);

    if (reqReset) {
      // "120ms" -> Date
      const ms = parseInt(reqReset.replace('ms', ''));
      this.requestsResetAt = new Date(Date.now() + ms);
    }
  }

  shouldThrottle(estimatedTokens: number): boolean {
    // Si queda menos del 10%, throttle
    if (this.requestsRemaining < 10) {
      return true;
    }

    if (this.tokensRemaining < estimatedTokens * 1.2) {
      return true;
    }

    return false;
  }

  async waitIfNeeded(estimatedTokens: number): Promise<void> {
    if (this.shouldThrottle(estimatedTokens)) {
      const waitTime = this.tokensResetAt
        ? this.tokensResetAt.getTime() - Date.now()
        : 1000;

      console.log(\`Rate limit approaching, waiting \${waitTime}ms\`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

// Uso
const tracker = new RateLimitTracker();

async function makeRequest(prompt: string) {
  const estimatedTokens = estimateTokens(prompt);

  await tracker.waitIfNeeded(estimatedTokens);

  const response = await openai.chat.completions.create({...});

  tracker.updateFromHeaders(response.headers);

  return response;
}
\`\`\`

**Estrategias para manejar Rate Limits**

**1. Request Queuing**

\`\`\`typescript
class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private requestsPerMinute = 500;
  private intervalMs = 60000; // 1 minuto
  private requestCount = 0;
  private lastReset = Date.now();

  async enqueue<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    while (this.queue.length > 0) {
      // Reset counter cada minuto
      if (Date.now() - this.lastReset >= this.intervalMs) {
        this.requestCount = 0;
        this.lastReset = Date.now();
      }

      // Espera si alcanzamos el límite
      if (this.requestCount >= this.requestsPerMinute) {
        const waitTime = this.intervalMs - (Date.now() - this.lastReset);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        this.requestCount = 0;
        this.lastReset = Date.now();
      }

      const task = this.queue.shift()!;
      this.requestCount++;
      await task();

      // Pequeño delay entre requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.processing = false;
  }
}

// Uso
const queue = new RequestQueue();

async function chatCompletion(prompt: string) {
  return queue.enqueue(() =>
    openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }]
    })
  );
}
\`\`\`

**2. Token Bucket Algorithm**

Algoritmo más sofisticado que permite bursts:

\`\`\`typescript
class TokenBucket {
  private tokens: number;
  private lastRefill: number;

  constructor(
    private capacity: number,      // Max tokens
    private refillRate: number     // Tokens por segundo
  ) {
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const timePassed = (now - this.lastRefill) / 1000;
    const tokensToAdd = timePassed * this.refillRate;

    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  async consume(tokens: number = 1): Promise<void> {
    this.refill();

    while (this.tokens < tokens) {
      const waitTime = ((tokens - this.tokens) / this.refillRate) * 1000;
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.refill();
    }

    this.tokens -= tokens;
  }
}

// Uso: 500 RPM = 500/60 = 8.33 requests por segundo
const bucket = new TokenBucket(500, 8.33);

async function makeRequest() {
  await bucket.consume(1);
  return openai.chat.completions.create({...});
}
\`\`\`

**3. Batch Processing**

Agrupa múltiples requests:

\`\`\`typescript
async function batchProcess(items: string[], batchSize: number = 20) {
  const results = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);

    // Procesa batch con Promise.all pero respetando rate limits
    const batchResults = await Promise.all(
      batch.map(item => rateLimitedRequest(item))
    );

    results.push(...batchResults);

    // Pausa entre batches
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  return results;
}
\`\`\`

**Mejores prácticas**

1. **Lee los headers**: Trackea límites restantes proactivamente
2. **Implementa queues**: No confíes solo en retries
3. **Estima tokens**: Usa tiktoken para calcular antes de enviar
4. **Monitorea métricas**: Alert cuando te acerques a límites
5. **Upgrade tier**: Si llegas constantemente al límite
6. **Caché agresivamente**: Evita requests duplicadas`,
      keyPoints: [
        'Rate limits incluyen RPM (requests), TPM (tokens) y TPD (tokens diarios)',
        'Headers como x-ratelimit-remaining permiten tracking proactivo',
        'Request queuing previene exceder límites antes que ocurran',
        'Token bucket algorithm permite bursts controlados',
        'Siempre estima tokens antes de hacer requests con tiktoken'
      ],
    },
    {
      title: 'Patrones de Retry',
      content: `Implementar retries correctamente es la diferencia entre una aplicación frágil y una robusta. Los patrones de retry deben ser inteligentes, no agresivos.

**1. Exponential Backoff**

El patrón más importante. Cada retry espera exponencialmente más:

\`\`\`
Attempt 1: wait 1s
Attempt 2: wait 2s
Attempt 3: wait 4s
Attempt 4: wait 8s
Attempt 5: wait 16s
\`\`\`

**Implementación básica**:

\`\`\`typescript
async function exponentialBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 5
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // No retry si no es retryable
      if (!shouldRetry(error)) {
        throw error;
      }

      // Último intento
      if (attempt === maxRetries - 1) {
        throw lastError;
      }

      // Calcula backoff: 2^attempt * 1000ms
      const backoffMs = Math.pow(2, attempt) * 1000;

      console.log(\`Retry attempt \${attempt + 1} after \${backoffMs}ms\`);
      await sleep(backoffMs);
    }
  }

  throw lastError!;
}

// Uso
const response = await exponentialBackoff(() =>
  openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: "Hello" }]
  })
);
\`\`\`

**2. Jitter (Aleatorización)**

Sin jitter, si 1000 clientes reciben 429 al mismo tiempo, todos retryarán simultáneamente en 2s, 4s, 8s... causando thundering herd.

**Solución**: Agrega aleatoriedad:

\`\`\`typescript
function calculateBackoff(attempt: number, baseMs: number = 1000): number {
  // Exponential: 2^attempt * baseMs
  const exponential = Math.pow(2, attempt) * baseMs;

  // Full jitter: random entre 0 y exponential
  const jitter = Math.random() * exponential;

  return Math.floor(jitter);
}

// Ahora los retries están distribuidos:
// Attempt 1: random entre 0-2000ms
// Attempt 2: random entre 0-4000ms
// Attempt 3: random entre 0-8000ms
\`\`\`

**Variantes de jitter**:

\`\`\`typescript
// Full jitter (recomendado para alta concurrencia)
const fullJitter = Math.random() * exponential;

// Equal jitter (mitad fijo, mitad random)
const equalJitter = exponential / 2 + Math.random() * (exponential / 2);

// Decorrelated jitter (AWS recomienda este)
let previous = baseMs;
function decorrelatedJitter(attempt: number): number {
  const temp = Math.random() * Math.min(maxBackoff, previous * 3);
  previous = temp;
  return temp;
}
\`\`\`

**3. Respect Retry-After Header**

Cuando recibes 429, el servidor a veces indica cuándo reintentar:

\`\`\`typescript
function getRetryDelay(error: any, attempt: number): number {
  // Si hay Retry-After header, úsalo
  const retryAfter = error.response?.headers?.['retry-after'];

  if (retryAfter) {
    // Puede ser segundos o fecha HTTP
    const seconds = parseInt(retryAfter);
    if (!isNaN(seconds)) {
      return seconds * 1000;
    }

    // O fecha: "Wed, 21 Oct 2024 07:28:00 GMT"
    const date = new Date(retryAfter);
    if (!isNaN(date.getTime())) {
      return Math.max(0, date.getTime() - Date.now());
    }
  }

  // Fallback a exponential backoff con jitter
  return calculateBackoff(attempt);
}
\`\`\`

**4. Circuit Breaker**

Previene intentos cuando el servicio está claramente caído:

\`\`\`typescript
class CircuitBreaker {
  private failures = 0;
  private lastFailTime: number = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private threshold: number = 5,        // Fallos antes de abrir
    private timeout: number = 60000,      // Tiempo antes de retry (ms)
    private successThreshold: number = 2  // Éxitos para cerrar
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      // Chequea si podemos intentar half-open
      if (Date.now() - this.lastFailTime >= this.timeout) {
        this.state = 'HALF_OPEN';
        console.log('Circuit breaker entering HALF_OPEN state');
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();

      // Éxito
      if (this.state === 'HALF_OPEN') {
        this.failures = 0;
        this.state = 'CLOSED';
        console.log('Circuit breaker CLOSED');
      }

      return result;
    } catch (error) {
      this.failures++;
      this.lastFailTime = Date.now();

      if (this.failures >= this.threshold) {
        this.state = 'OPEN';
        console.log(\`Circuit breaker OPEN after \${this.failures} failures\`);
      }

      throw error;
    }
  }

  reset(): void {
    this.failures = 0;
    this.state = 'CLOSED';
  }
}

// Uso
const breaker = new CircuitBreaker(5, 60000);

async function makeRequest() {
  return breaker.execute(() =>
    openai.chat.completions.create({...})
  );
}
\`\`\`

**5. Timeout con Retry**

Combina timeouts con retry logic:

\`\`\`typescript
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    )
  ]);
}

async function retryWithTimeout<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    timeoutMs?: number;
    baseBackoffMs?: number;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    timeoutMs = 30000,
    baseBackoffMs = 1000
  } = options;

  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await withTimeout(fn(), timeoutMs);
    } catch (error: any) {
      lastError = error;

      if (attempt === maxRetries - 1 || !shouldRetry(error)) {
        throw error;
      }

      const backoff = calculateBackoff(attempt, baseBackoffMs);
      console.log(\`Timeout/error on attempt \${attempt + 1}, retrying in \${backoff}ms\`);
      await sleep(backoff);
    }
  }

  throw lastError!;
}
\`\`\`

**6. Retry Budget**

Limita retries globalmente para evitar sobrecarga:

\`\`\`typescript
class RetryBudget {
  private retries = 0;
  private requests = 0;
  private windowStart = Date.now();

  constructor(
    private maxRetryRatio: number = 0.1,  // Max 10% de requests pueden ser retries
    private windowMs: number = 60000       // Ventana de 1 minuto
  ) {}

  canRetry(): boolean {
    this.resetIfNeeded();

    const retryRatio = this.requests === 0
      ? 0
      : this.retries / this.requests;

    return retryRatio < this.maxRetryRatio;
  }

  recordRequest(): void {
    this.resetIfNeeded();
    this.requests++;
  }

  recordRetry(): void {
    this.resetIfNeeded();
    this.retries++;
  }

  private resetIfNeeded(): void {
    if (Date.now() - this.windowStart >= this.windowMs) {
      this.retries = 0;
      this.requests = 0;
      this.windowStart = Date.now();
    }
  }
}

const budget = new RetryBudget();

async function makeRequestWithBudget() {
  budget.recordRequest();

  try {
    return await openai.chat.completions.create({...});
  } catch (error) {
    if (shouldRetry(error) && budget.canRetry()) {
      budget.recordRetry();
      // Retry logic...
    }
    throw error;
  }
}
\`\`\`

**Mejores prácticas**

1. **Siempre usa jitter**: Previene thundering herd
2. **Respeta Retry-After**: El servidor sabe cuándo está listo
3. **Limita max retries**: No infinitos (3-5 es razonable)
4. **Implementa circuit breaker**: Para fallos persistentes
5. **Cap el backoff máximo**: Ej. 60s max
6. **Loggea intentos**: Para debugging y alertas
7. **No retries para 4xx**: Excepto 429`,
      keyPoints: [
        'Exponential backoff es el patrón fundamental de retry',
        'Jitter previene thundering herd al aleatorizar delays',
        'Circuit breaker evita sobrecarga cuando el servicio está caído',
        'Respeta Retry-After header cuando está presente',
        'Retry budget limita retries globalmente para evitar cascade failures'
      ],
    },
    {
      title: 'Implementación Robusta',
      content: `Combinando todos los patrones anteriores, aquí está una implementación production-ready para llamadas LLM robustas.

**Implementación completa con todos los patrones**

\`\`\`typescript
import OpenAI from 'openai';

// ===== Configuración =====
interface RetryConfig {
  maxRetries: number;
  baseBackoffMs: number;
  maxBackoffMs: number;
  timeoutMs: number;
  jitterType: 'full' | 'equal' | 'decorrelated';
}

const DEFAULT_CONFIG: RetryConfig = {
  maxRetries: 5,
  baseBackoffMs: 1000,
  maxBackoffMs: 60000,
  timeoutMs: 120000,
  jitterType: 'full'
};

// ===== Utilidades =====
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function shouldRetry(error: any): boolean {
  // Rate limits - siempre retry
  if (error?.status === 429) return true;

  // Server errors - retry
  if (error?.status && error.status >= 500) return true;

  // Network errors
  const networkErrors = ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNREFUSED'];
  if (error?.code && networkErrors.includes(error.code)) return true;

  // Timeout errors
  if (error?.message?.includes('timeout')) return true;

  // OpenAI specific
  if (error?.type === 'server_error') return true;

  return false;
}

function calculateBackoff(
  attempt: number,
  config: RetryConfig
): number {
  const exponential = Math.pow(2, attempt) * config.baseBackoffMs;
  const capped = Math.min(exponential, config.maxBackoffMs);

  switch (config.jitterType) {
    case 'full':
      return Math.floor(Math.random() * capped);
    case 'equal':
      return Math.floor(capped / 2 + Math.random() * (capped / 2));
    case 'decorrelated':
      // Simplified decorrelated jitter
      return Math.floor(Math.random() * capped);
    default:
      return capped;
  }
}

function getRetryAfterMs(error: any): number | null {
  const retryAfter =
    error?.response?.headers?.['retry-after'] ||
    error?.headers?.['retry-after'];

  if (!retryAfter) return null;

  // Segundos
  const seconds = parseInt(retryAfter);
  if (!isNaN(seconds)) {
    return seconds * 1000;
  }

  // Fecha HTTP
  const date = new Date(retryAfter);
  if (!isNaN(date.getTime())) {
    return Math.max(0, date.getTime() - Date.now());
  }

  return null;
}

// ===== Circuit Breaker =====
class CircuitBreaker {
  private failures = 0;
  private lastFailTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private threshold = 5,
    private timeoutMs = 60000
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailTime >= this.timeoutMs) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN - service likely down');
      }
    }

    try {
      const result = await fn();

      if (this.state === 'HALF_OPEN') {
        this.failures = 0;
        this.state = 'CLOSED';
      }

      return result;
    } catch (error) {
      this.failures++;
      this.lastFailTime = Date.now();

      if (this.failures >= this.threshold) {
        this.state = 'OPEN';
      }

      throw error;
    }
  }
}

// ===== Rate Limit Tracker =====
class RateLimitTracker {
  private requestsRemaining = Infinity;
  private tokensRemaining = Infinity;

  update(headers: any): void {
    const reqRemaining = headers?.['x-ratelimit-remaining-requests'];
    const tokRemaining = headers?.['x-ratelimit-remaining-tokens'];

    if (reqRemaining) this.requestsRemaining = parseInt(reqRemaining);
    if (tokRemaining) this.tokensRemaining = parseInt(tokRemaining);
  }

  shouldThrottle(estimatedTokens: number = 1000): boolean {
    return this.requestsRemaining < 5 || this.tokensRemaining < estimatedTokens;
  }
}

// ===== Función principal de retry =====
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < finalConfig.maxRetries; attempt++) {
    try {
      // Timeout wrapper
      const result = await Promise.race([
        fn(),
        new Promise<T>((_, reject) =>
          setTimeout(
            () => reject(new Error(\`Request timeout after \${finalConfig.timeoutMs}ms\`)),
            finalConfig.timeoutMs
          )
        )
      ]);

      // Éxito
      if (attempt > 0) {
        console.log(\`Request succeeded on attempt \${attempt + 1}\`);
      }

      return result;

    } catch (error: any) {
      lastError = error;

      // No retry si error no es retryable
      if (!shouldRetry(error)) {
        console.error(\`Non-retryable error: \${error.message}\`);
        throw error;
      }

      // Último intento
      if (attempt === finalConfig.maxRetries - 1) {
        console.error(\`Max retries reached (\${finalConfig.maxRetries})\`);
        throw error;
      }

      // Calcula delay
      const retryAfter = getRetryAfterMs(error);
      const backoff = retryAfter ?? calculateBackoff(attempt, finalConfig);

      console.warn(
        \`Attempt \${attempt + 1} failed: \${error.message}. \` +
        \`Retrying in \${backoff}ms... (status: \${error.status || 'N/A'})\`
      );

      await sleep(backoff);
    }
  }

  throw lastError!;
}

// ===== Cliente LLM robusto =====
class RobustLLMClient {
  private openai: OpenAI;
  private breaker: CircuitBreaker;
  private rateLimitTracker: RateLimitTracker;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
    this.breaker = new CircuitBreaker(5, 60000);
    this.rateLimitTracker = new RateLimitTracker();
  }

  async chat(
    params: OpenAI.Chat.ChatCompletionCreateParams,
    retryConfig?: Partial<RetryConfig>
  ): Promise<OpenAI.Chat.ChatCompletionResponse> {
    // Estima tokens (simplificado)
    const estimatedTokens = JSON.stringify(params.messages).length / 4;

    // Throttle si necesario
    if (this.rateLimitTracker.shouldThrottle(estimatedTokens)) {
      console.log('Rate limit approaching, waiting 2s...');
      await sleep(2000);
    }

    // Ejecuta con circuit breaker y retry
    return this.breaker.execute(() =>
      retryWithBackoff(async () => {
        const response = await this.openai.chat.completions.create(params);

        // Actualiza rate limits
        this.rateLimitTracker.update((response as any).headers);

        return response;
      }, retryConfig)
    );
  }

  async chatStream(
    params: OpenAI.Chat.ChatCompletionCreateParams,
    onChunk: (chunk: string) => void,
    retryConfig?: Partial<RetryConfig>
  ): Promise<void> {
    return this.breaker.execute(() =>
      retryWithBackoff(async () => {
        const stream = await this.openai.chat.completions.create({
          ...params,
          stream: true
        });

        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) onChunk(content);
        }
      }, retryConfig)
    );
  }
}

// ===== Uso =====
async function main() {
  const client = new RobustLLMClient(process.env.OPENAI_API_KEY!);

  try {
    // Request simple
    const response = await client.chat({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'user', content: '¿Qué es LLM Engineering?' }
      ]
    });

    console.log(response.choices[0].message.content);

    // Streaming
    await client.chatStream(
      {
        model: 'gpt-4-turbo',
        messages: [
          { role: 'user', content: 'Explica exponential backoff' }
        ]
      },
      (chunk) => process.stdout.write(chunk)
    );

    // Con config custom
    const customResponse = await client.chat(
      {
        model: 'gpt-4-turbo',
        messages: [{ role: 'user', content: 'Hello' }]
      },
      {
        maxRetries: 3,
        baseBackoffMs: 500,
        jitterType: 'equal'
      }
    );

  } catch (error: any) {
    console.error('Final error:', error.message);

    // Logging para monitoring
    if (error.status === 429) {
      console.error('ALERT: Rate limit exhausted');
    } else if (error.status >= 500) {
      console.error('ALERT: OpenAI service issues');
    } else {
      console.error('ALERT: Unhandled error type');
    }
  }
}
\`\`\`

**Mejoras adicionales para producción**

\`\`\`typescript
// 1. Métricas y observabilidad
import { Counter, Histogram } from 'prom-client';

const requestCounter = new Counter({
  name: 'llm_requests_total',
  labelNames: ['model', 'status', 'attempt']
});

const latencyHistogram = new Histogram({
  name: 'llm_request_duration_seconds',
  labelNames: ['model']
});

// 2. Structured logging
import winston from 'winston';

const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

// 3. Distributed tracing
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('llm-client');

// 4. Request deduplication
class RequestCache {
  private cache = new Map<string, Promise<any>>();

  async getOrFetch<T>(
    key: string,
    fn: () => Promise<T>,
    ttlMs = 60000
  ): Promise<T> {
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    const promise = fn().finally(() => {
      setTimeout(() => this.cache.delete(key), ttlMs);
    });

    this.cache.set(key, promise);
    return promise;
  }
}
\`\`\`

**Testing**

\`\`\`typescript
import { describe, it, expect, vi } from 'vitest';

describe('RobustLLMClient', () => {
  it('should retry on 429 errors', async () => {
    const mockCreate = vi.fn()
      .mockRejectedValueOnce({ status: 429 })
      .mockRejectedValueOnce({ status: 429 })
      .mockResolvedValueOnce({ choices: [{ message: { content: 'Success' } }] });

    // Mock OpenAI client
    const client = new RobustLLMClient('test-key');
    client['openai'].chat.completions.create = mockCreate;

    const response = await client.chat({
      model: 'gpt-4',
      messages: [{ role: 'user', content: 'test' }]
    });

    expect(mockCreate).toHaveBeenCalledTimes(3);
    expect(response.choices[0].message.content).toBe('Success');
  });

  it('should open circuit breaker after threshold', async () => {
    const client = new RobustLLMClient('test-key');
    const mockCreate = vi.fn().mockRejectedValue({ status: 500 });
    client['openai'].chat.completions.create = mockCreate;

    // Intenta 5 veces para abrir el circuit
    for (let i = 0; i < 5; i++) {
      try {
        await client.chat({
          model: 'gpt-4',
          messages: [{ role: 'user', content: 'test' }]
        }, { maxRetries: 1 });
      } catch {}
    }

    // Siguiente request debería fallar inmediatamente
    await expect(client.chat({
      model: 'gpt-4',
      messages: [{ role: 'user', content: 'test' }]
    })).rejects.toThrow('Circuit breaker is OPEN');
  });
});
\`\`\`

**Monitoreo en producción**

1. **Alertas clave**:
   - Rate limit > 80%
   - Retry rate > 10%
   - Circuit breaker abierto > 1 min
   - Latencia p95 > 10s

2. **Dashboards**:
   - Requests por modelo
   - Tasa de errores por tipo
   - Distribución de retries
   - Tokens consumidos

3. **Logs estructurados**:
   - Cada retry con attempt number
   - Rate limit headers en cada response
   - Circuit breaker state changes
   - Token usage por request`,
      keyPoints: [
        'Combina exponential backoff, jitter, circuit breaker y rate limiting',
        'RobustLLMClient encapsula toda la lógica de retry y error handling',
        'Soporta streaming con la misma robustez que requests normales',
        'Implementa métricas, logging y tracing para observabilidad',
        'Testing exhaustivo asegura que retry logic funciona correctamente'
      ],
    },
  ],
};
