export const promptEngineeringBasics = {
  sections: [
    {
      title: '¿Qué es Prompt Engineering?',
      content: `Prompt Engineering es el arte y la ciencia de diseñar instrucciones efectivas para modelos de lenguaje. Un prompt bien diseñado puede ser la diferencia entre obtener una respuesta genérica y obtener exactamente lo que necesitas para tu aplicación.

El impacto de un buen prompt engineering es significativo:
- **Calidad de respuesta**: Un prompt bien estructurado puede mejorar dramáticamente la precisión y relevancia de las respuestas
- **Reducción de costos**: Prompts efectivos requieren menos iteraciones, ahorrando tokens y dinero
- **Consistencia**: Prompts bien diseñados producen resultados más predecibles y confiables
- **Menos post-procesamiento**: Respuestas mejor formateadas desde el inicio

En el desarrollo de aplicaciones con LLMs, el prompt engineering es tan importante como escribir código limpio. Un prompt mal diseñado puede hacer que incluso el modelo más avanzado produzca resultados mediocres.`,
      keyPoints: [
        'Prompt Engineering es diseñar instrucciones efectivas para LLMs',
        'Impacta directamente en calidad, costos y consistencia de respuestas',
        'Es una habilidad crítica para desarrollar aplicaciones con IA',
        'Requiere iteración y experimentación, no es una ciencia exacta',
      ],
    },
    {
      title: 'Anatomía de un Buen Prompt',
      content: `Un prompt efectivo tiene varios componentes clave que trabajan juntos para guiar al modelo hacia la respuesta deseada:

**1. Contexto claro**
Proporciona información de fondo relevante. El modelo necesita entender el escenario para dar respuestas apropiadas.

**2. Instrucción específica**
Sé explícito sobre qué quieres que haga el modelo. Evita ambigüedades.

**3. Formato de salida esperado**
Especifica cómo quieres recibir la respuesta (JSON, lista, párrafo, etc.).

**4. Ejemplos cuando sea necesario**
Mostrar ejemplos de entrada/salida ayuda al modelo a entender tus expectativas.

**5. Restricciones y límites**
Define qué NO debe hacer o qué límites debe respetar (longitud, tono, etc.).

Ejemplo de prompt bien estructurado:

\`\`\`
Contexto: Eres un asistente de e-commerce analizando reseñas de productos.

Tarea: Analiza la siguiente reseña y extrae información estructurada.

Formato de salida:
{
  "sentimiento": "positivo | neutral | negativo",
  "aspectos_destacados": ["aspecto1", "aspecto2"],
  "puntuacion_estimada": 1-5
}

Reseña: "El producto llegó rápido pero la calidad no es la esperada..."
\`\`\``,
      keyPoints: [
        'Incluye contexto relevante para enmarcar la tarea',
        'Usa instrucciones específicas y sin ambigüedad',
        'Especifica el formato exacto de salida que necesitas',
        'Agrega ejemplos para clarificar expectativas complejas',
        'Define restricciones explícitas cuando sea necesario',
      ],
    },
    {
      title: 'Técnicas Básicas de Prompting',
      content: `Existen varias técnicas fundamentales que todo desarrollador debe conocer:

**Zero-shot Prompting**
Pedir al modelo que realice una tarea sin ejemplos previos, confiando en su conocimiento pre-entrenado.

\`\`\`typescript
const prompt = "Traduce al francés: Hello, how are you?";
// El modelo infiere la tarea directamente
\`\`\`

**Few-shot Prompting**
Proporcionar algunos ejemplos de entrada/salida antes de la tarea real. Muy efectivo para tareas específicas.

\`\`\`typescript
const prompt = \`Clasifica el sentimiento de cada texto:

Texto: "Me encantó este producto"
Sentimiento: positivo

Texto: "No funciona como esperaba"
Sentimiento: negativo

Texto: "El servicio al cliente fue excepcional"
Sentimiento:\`;
\`\`\`

**Chain-of-Thought (CoT)**
Pedir al modelo que "piense en voz alta" y muestre su razonamiento paso a paso. Mejora dramáticamente el rendimiento en tareas de razonamiento.

\`\`\`typescript
const prompt = \`Resuelve este problema paso a paso:

Una tienda tiene 45 manzanas. Vende 12 en la mañana y 18 en la tarde.
Luego recibe un envío de 30 manzanas. ¿Cuántas manzanas tiene ahora?

Piensa paso a paso:\`;
\`\`\`

**Role Prompting**
Asignar un rol específico al modelo para mejorar la calidad y tono de las respuestas.

\`\`\`typescript
const prompt = \`Eres un ingeniero de software senior con 10 años de experiencia
en TypeScript y Node.js. Revisa el siguiente código y sugiere mejoras...\`;
\`\`\``,
      keyPoints: [
        'Zero-shot: directo, sin ejemplos, para tareas simples',
        'Few-shot: incluye 2-5 ejemplos para mejorar precisión',
        'Chain-of-Thought: pide razonamiento paso a paso para problemas complejos',
        'Role prompting: asigna un rol para mejorar calidad y tono',
        'Combina técnicas según la complejidad de la tarea',
      ],
    },
    {
      title: 'Errores Comunes y Cómo Evitarlos',
      content: `Incluso desarrolladores experimentados cometen estos errores al trabajar con prompts:

**❌ Error 1: Prompts demasiado vagos**
\`\`\`typescript
// Malo
const prompt = "Háblame sobre base de datos";

// Bueno
const prompt = "Explica las diferencias entre bases de datos SQL y NoSQL,
enfocándote en casos de uso para aplicaciones web modernas.
Incluye ejemplos de cuándo usar cada una.";
\`\`\`

**❌ Error 2: Falta de contexto**
\`\`\`typescript
// Malo
const prompt = "¿Es este código correcto?";

// Bueno
const prompt = \`Contexto: Estoy desarrollando una API REST con Express.js
y TypeScript para un sistema de autenticación.

Revisa este middleware y verifica si maneja correctamente los errores:
[código aquí]
\`;
\`\`\`

**❌ Error 3: No especificar formato de salida**
\`\`\`typescript
// Malo
const prompt = "Dame información sobre este usuario";

// Bueno
const prompt = \`Extrae la información del usuario y devuélvela en este formato JSON:
{
  "nombre": string,
  "email": string,
  "rol": "admin" | "user",
  "activo": boolean
}
\`;
\`\`\`

**❌ Error 4: Instrucciones contradictorias**
\`\`\`typescript
// Malo
const prompt = "Sé muy detallado pero conciso. Explica todo pero que sea breve.";

// Bueno
const prompt = "Proporciona una explicación concisa de máximo 3 párrafos,
incluyendo solo los conceptos más importantes.";
\`\`\`

**❌ Error 5: Asumir conocimiento no proporcionado**
\`\`\`typescript
// Malo (asume que el modelo sabe qué producto)
const prompt = "Genera un email promocional para el producto";

// Bueno
const prompt = \`Genera un email promocional para nuestro nuevo producto:
- Nombre: SmartWatch Pro X
- Precio: $299
- Características principales: GPS, monitor cardíaco, 7 días batería
- Público objetivo: deportistas y personas activas
\`;
\`\`\`

**Mejores prácticas:**
1. Itera y prueba tus prompts con diferentes inputs
2. Versiona tus prompts como código
3. Usa variables de template para reutilización
4. Mide y compara resultados objetivamente
5. Documenta qué funciona y qué no para tu caso de uso`,
      keyPoints: [
        'Evita prompts vagos: sé específico sobre qué necesitas',
        'Siempre proporciona contexto suficiente para la tarea',
        'Especifica explícitamente el formato de salida esperado',
        'Asegúrate de que las instrucciones sean consistentes, no contradictorias',
        'No asumas conocimiento: proporciona toda la información necesaria',
        'Itera y versiona tus prompts como lo harías con código',
      ],
    },
  ],
};

export const temperatureAndSampling = {
  sections: [
    {
      title: 'Temperature: Controlando la Creatividad',
      content: `Temperature es el parámetro más importante para controlar el balance entre creatividad y determinismo en las respuestas de un LLM.

**¿Cómo funciona?**
Temperature controla la aleatoriedad en la selección de tokens. Técnicamente, modifica la distribución de probabilidad de los tokens candidatos antes de la selección.

**Rango de valores: 0 a 2**

**Temperature = 0** (Determinístico)
- Siempre selecciona el token más probable
- Respuestas consistentes y predecibles
- Ideal para: clasificación, extracción de datos, análisis, respuestas fácticas

\`\`\`typescript
const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: "¿Cuál es la capital de Francia?" }],
  temperature: 0,
});
// Siempre responderá: "París" o "La capital de Francia es París"
\`\`\`

**Temperature = 0.3-0.7** (Balanceado)
- Algo de variación pero mantiene coherencia
- Bueno para la mayoría de aplicaciones de producción
- Ideal para: chatbots, asistentes, contenido técnico

\`\`\`typescript
const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{
    role: "user",
    content: "Escribe un email profesional de seguimiento a un cliente"
  }],
  temperature: 0.5,
});
// Variará ligeramente pero mantiene tono profesional
\`\`\`

**Temperature = 1.0** (Default)
- Balance entre creatividad y coherencia
- Valor por defecto de la mayoría de APIs
- Ideal para: conversaciones generales, redacción de contenido

**Temperature = 1.5-2.0** (Muy creativo)
- Alta aleatoriedad y diversidad
- Puede producir resultados incoherentes o inesperados
- Ideal para: brainstorming, escritura creativa, generación de ideas

\`\`\`typescript
const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{
    role: "user",
    content: "Genera 5 nombres creativos para una startup de IA"
  }],
  temperature: 1.8,
});
// Producirá nombres muy diversos y creativos
\`\`\`

**Regla general:**
- Tareas fácticas y análisis → Temperature baja (0-0.3)
- Aplicaciones de producción → Temperature media (0.5-0.7)
- Generación creativa → Temperature alta (1.0-2.0)`,
      keyPoints: [
        'Temperature controla el balance creatividad vs determinismo',
        'Rango: 0 (determinístico) a 2 (muy creativo)',
        'Temperature = 0 para tareas que requieren consistencia',
        'Temperature = 0.5-0.7 para la mayoría de aplicaciones',
        'Temperature alta (1.5+) para creatividad máxima',
        'Valores muy altos pueden producir resultados incoherentes',
      ],
    },
    {
      title: 'Top-p (Nucleus Sampling): Una Alternativa Inteligente',
      content: `Top-p, también conocido como nucleus sampling, es un método alternativo para controlar la aleatoriedad que funciona de manera diferente a temperature.

**¿Cómo funciona Top-p?**
En lugar de modificar la distribución de probabilidades, top-p considera solo el conjunto más pequeño de tokens cuya probabilidad acumulada alcanza el valor p.

**Ejemplo conceptual:**
Si top_p = 0.9, el modelo considera solo los tokens que representan el 90% de probabilidad acumulada, ignorando tokens poco probables.

\`\`\`typescript
// Con top_p = 1.0 (considera todos los tokens)
Tokens candidatos: ["gato": 40%, "perro": 30%, "ave": 20%, "pez": 10%]
→ Considera todos

// Con top_p = 0.7
Tokens candidatos: ["gato": 40%, "perro": 30%, "ave": 20%, "pez": 10%]
→ Considera solo "gato" (40%) + "perro" (30%) = 70%
→ Ignora "ave" y "pez"
\`\`\`

**Valores comunes:**

\`\`\`typescript
// Top-p conservador (más predecible)
const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: "Analiza estos datos financieros" }],
  top_p: 0.1,  // Solo considera tokens muy probables
});

// Top-p balanceado (recomendado)
const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: "Escribe un artículo de blog" }],
  top_p: 0.9,  // Balance entre diversidad y coherencia
});

// Top-p máximo (considera todo)
const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: "Genera ideas creativas" }],
  top_p: 1.0,  // Sin restricciones
});
\`\`\`

**Temperature vs Top-p:**

La diferencia clave es que top-p es adaptativo:
- **Temperature**: Afecta todas las distribuciones de probabilidad por igual
- **Top-p**: Se adapta dinámicamente según la certeza del modelo

\`\`\`typescript
// Escenario 1: Respuesta obvia (¿Capital de Francia?)
// Temperature = 0.8 → Aún añade algo de aleatoriedad innecesaria
// Top-p = 0.9 → Se adapta, nota que "París" tiene ~99% probabilidad

// Escenario 2: Respuesta creativa (Nombre para startup)
// Temperature = 0.8 → Añade aleatoriedad uniforme
// Top-p = 0.9 → Se adapta, considera más opciones porque todas tienen baja probabilidad
\`\`\`

**¿Cuándo usar cada uno?**
- **Top-p**: Mejor para la mayoría de casos, especialmente cuando necesitas consistencia sin sacrificar creatividad
- **Temperature**: Cuando quieres control más directo sobre aleatoriedad

**⚠️ Importante**: La mayoría de APIs recomiendan NO usar temperature y top_p simultáneamente. Elige uno según tu caso de uso.

\`\`\`typescript
// ✅ Bueno: usa uno u otro
const response1 = await openai.chat.completions.create({
  model: "gpt-4",
  messages: messages,
  temperature: 0.7,
});

const response2 = await openai.chat.completions.create({
  model: "gpt-4",
  messages: messages,
  top_p: 0.9,
});

// ❌ Evitar: usar ambos simultáneamente
const response3 = await openai.chat.completions.create({
  model: "gpt-4",
  messages: messages,
  temperature: 0.7,
  top_p: 0.9,  // Comportamiento puede ser impredecible
});
\`\`\``,
      keyPoints: [
        'Top-p considera solo tokens hasta alcanzar probabilidad acumulada p',
        'Es adaptativo: se ajusta según la certeza del modelo',
        'Rango: 0.1 (muy conservador) a 1.0 (sin restricción)',
        'Generalmente más estable que temperature para producción',
        'No uses temperature y top_p simultáneamente',
        'Top-p = 0.9 es un buen valor por defecto para la mayoría de casos',
      ],
    },
    {
      title: 'Top-k y Otros Parámetros de Sampling',
      content: `Además de temperature y top-p, existen otros parámetros que controlan cómo el modelo genera texto:

**Top-k Sampling**
Limita la selección a los k tokens más probables.

\`\`\`typescript
// Ejemplo con diferentes valores de top-k
const response = await anthropic.messages.create({
  model: "claude-3-opus-20240229",
  max_tokens: 1024,
  top_k: 10,  // Considera solo los 10 tokens más probables
  messages: [{ role: "user", content: "Escribe una historia corta" }],
});
\`\`\`

**Diferencia entre Top-k y Top-p:**
- **Top-k**: Número fijo de tokens (ej: siempre los 10 más probables)
- **Top-p**: Número adaptativo de tokens (según probabilidad acumulada)

**Frequency Penalty**
Penaliza tokens que ya han aparecido, reduciendo repetición.

\`\`\`typescript
const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{
    role: "user",
    content: "Escribe un párrafo sobre inteligencia artificial"
  }],
  frequency_penalty: 0.5,  // Rango: -2.0 a 2.0
});

// frequency_penalty = 0: Sin penalización
// frequency_penalty = 0.5: Reduce repetición moderadamente
// frequency_penalty = 1.0: Reduce repetición significativamente
// frequency_penalty > 1.5: Evita casi toda repetición (puede afectar coherencia)
\`\`\`

**Presence Penalty**
Penaliza tokens basándose en si ya aparecieron (no cuántas veces).

\`\`\`typescript
const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{
    role: "user",
    content: "Lista 20 ideas para una aplicación móvil"
  }],
  presence_penalty: 0.6,  // Rango: -2.0 a 2.0
});

// presence_penalty = 0: Sin efecto
// presence_penalty > 0: Incentiva introducir nuevos temas
// presence_penalty < 0: Incentiva mantenerse en el tema actual
\`\`\`

**Diferencia clave:**
- **Frequency penalty**: Penaliza proporcionalmente a cuántas veces apareció
- **Presence penalty**: Penaliza por igual si apareció al menos una vez

**Max Tokens**
Controla la longitud máxima de la respuesta.

\`\`\`typescript
const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: "Explica quantum computing" }],
  max_tokens: 150,  // Limita la respuesta a ~150 tokens
});
\`\`\`

**Stop Sequences**
Define secuencias que detendrán la generación.

\`\`\`typescript
const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{
    role: "user",
    content: "Lista ingredientes para una pizza. Formato: - Ingrediente"
  }],
  stop: ["\\n\\n", "Instrucciones:"],  // Se detiene al encontrar estas secuencias
});
\`\`\`

**Ejemplo completo configurando múltiples parámetros:**

\`\`\`typescript
interface GenerationConfig {
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  max_tokens?: number;
  stop?: string[];
}

async function generateBlogPost(topic: string): Promise<string> {
  const config: GenerationConfig = {
    temperature: 0.7,           // Creatividad moderada
    frequency_penalty: 0.3,     // Evita repetición leve
    presence_penalty: 0.2,      // Incentiva variedad de temas
    max_tokens: 800,            // ~600 palabras
    stop: ["\\n---\\n", "END"], // Detiene en separadores
  };

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "Eres un escritor técnico especializado en desarrollo de software."
      },
      {
        role: "user",
        content: \`Escribe un artículo de blog sobre: \${topic}\`
      }
    ],
    ...config,
  });

  return response.choices[0].message.content;
}
\`\`\``,
      keyPoints: [
        'Top-k: limita a k tokens más probables (número fijo)',
        'Frequency penalty: penaliza repetición proporcional',
        'Presence penalty: penaliza aparición de temas ya mencionados',
        'Max tokens: controla longitud máxima de respuesta',
        'Stop sequences: define dónde detener la generación',
        'Combina parámetros cuidadosamente para evitar conflictos',
      ],
    },
    {
      title: 'Combinando Parámetros: Casos de Uso Prácticos',
      content: `La clave está en combinar parámetros según el caso de uso específico. Aquí hay configuraciones probadas para escenarios comunes:

**1. Análisis y Extracción de Datos (Determinístico)**
Objetivo: Máxima consistencia y precisión

\`\`\`typescript
const analyzeData = async (data: string) => {
  return await openai.chat.completions.create({
    model: "gpt-4",
    temperature: 0,              // Completamente determinístico
    top_p: 0.1,                  // Solo tokens muy probables
    frequency_penalty: 0,        // Sin penalización
    presence_penalty: 0,         // Sin penalización
    max_tokens: 500,
    messages: [
      {
        role: "system",
        content: "Analiza datos y devuelve JSON estructurado."
      },
      {
        role: "user",
        content: \`Analiza: \${data}\`
      }
    ],
  });
};
\`\`\`

**2. Chatbot de Soporte (Balanceado)**
Objetivo: Respuestas útiles pero consistentes

\`\`\`typescript
const supportChatbot = async (userMessage: string, history: Message[]) => {
  return await openai.chat.completions.create({
    model: "gpt-4",
    temperature: 0.5,            // Algo de variación
    frequency_penalty: 0.3,      // Evita repetir frases
    presence_penalty: 0.2,       // Incentiva explorar soluciones
    max_tokens: 300,
    messages: [
      {
        role: "system",
        content: "Eres un asistente de soporte técnico amable y profesional."
      },
      ...history,
      { role: "user", content: userMessage }
    ],
  });
};
\`\`\`

**3. Generación de Contenido Creativo**
Objetivo: Máxima creatividad y diversidad

\`\`\`typescript
const generateCreativeContent = async (prompt: string) => {
  return await openai.chat.completions.create({
    model: "gpt-4",
    temperature: 1.2,            // Alta creatividad
    top_p: 0.95,                 // Permite diversidad
    frequency_penalty: 0.8,      // Evita repetición fuerte
    presence_penalty: 0.6,       // Incentiva nuevas ideas
    max_tokens: 1000,
    messages: [
      {
        role: "system",
        content: "Eres un escritor creativo con estilo único e innovador."
      },
      { role: "user", content: prompt }
    ],
  });
};
\`\`\`

**4. Generación de Código (Semi-determinístico)**
Objetivo: Código funcional con algunas variaciones

\`\`\`typescript
const generateCode = async (spec: string, language: string) => {
  return await openai.chat.completions.create({
    model: "gpt-4",
    temperature: 0.2,            // Bajo para consistencia
    frequency_penalty: 0.1,      // Leve para evitar patrones repetitivos
    presence_penalty: 0,         // Sin penalización (código puede repetir conceptos)
    max_tokens: 800,
    stop: ["\`\`\`\\n\\n", "// END"],  // Detiene en fin de bloque
    messages: [
      {
        role: "system",
        content: \`Eres un experto en \${language}. Genera código limpio y bien documentado.\`
      },
      { role: "user", content: spec }
    ],
  });
};
\`\`\`

**5. Brainstorming e Ideación**
Objetivo: Máxima diversidad de ideas

\`\`\`typescript
const brainstormIdeas = async (topic: string, count: number = 10) => {
  return await openai.chat.completions.create({
    model: "gpt-4",
    temperature: 1.5,            // Muy alta creatividad
    presence_penalty: 1.0,       // Fuerza diversidad de temas
    frequency_penalty: 0.5,      // Evita repetir conceptos
    max_tokens: 600,
    messages: [
      {
        role: "system",
        content: "Eres un experto en pensamiento lateral e innovación."
      },
      {
        role: "user",
        content: \`Genera \${count} ideas innovadoras sobre: \${topic}\`
      }
    ],
  });
};
\`\`\`

**6. Resumen de Documentos (Conservador)**
Objetivo: Resumen fiel al original

\`\`\`typescript
const summarizeDocument = async (document: string, maxLength: number = 200) => {
  return await openai.chat.completions.create({
    model: "gpt-4",
    temperature: 0.3,            // Baja variación
    frequency_penalty: 0.2,      // Leve para evitar repetición
    presence_penalty: 0,         // No importa repetir conceptos clave
    max_tokens: maxLength,
    messages: [
      {
        role: "system",
        content: "Resume documentos extrayendo solo los puntos más importantes."
      },
      { role: "user", content: \`Resume: \${document}\` }
    ],
  });
};
\`\`\`

**Matriz de decisión rápida:**

| Caso de uso | Temperature | Top-p | Freq Penalty | Pres Penalty |
|-------------|-------------|-------|--------------|--------------|
| Análisis/Extracción | 0-0.2 | 0.1 | 0 | 0 |
| Chatbot/Asistente | 0.5-0.7 | 0.9 | 0.3 | 0.2 |
| Contenido Creativo | 1.0-1.5 | 0.95 | 0.8 | 0.6 |
| Generación Código | 0.2-0.4 | 0.8 | 0.1 | 0 |
| Brainstorming | 1.3-1.8 | 0.95 | 0.5 | 1.0 |
| Resumen Documentos | 0.3-0.5 | 0.8 | 0.2 | 0 |

**Mejores prácticas al combinar parámetros:**

\`\`\`typescript
// 1. Crea configuraciones reutilizables
const CONFIGS = {
  DETERMINISTIC: {
    temperature: 0,
    top_p: 0.1,
  },
  BALANCED: {
    temperature: 0.7,
    frequency_penalty: 0.3,
  },
  CREATIVE: {
    temperature: 1.3,
    frequency_penalty: 0.8,
    presence_penalty: 0.6,
  },
} as const;

// 2. Wrapper con defaults sensatos
async function callLLM(
  prompt: string,
  config: Partial<GenerationConfig> = {}
) {
  const defaults = CONFIGS.BALANCED;

  return await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    ...defaults,
    ...config,  // Override con configuración específica
  });
}

// 3. Logging para experimentación
async function callLLMWithLogging(
  prompt: string,
  config: GenerationConfig
) {
  console.log("Config:", JSON.stringify(config));
  const start = Date.now();

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    ...config,
  });

  console.log(\`Completed in \${Date.now() - start}ms\`);
  console.log(\`Tokens used: \${response.usage?.total_tokens}\`);

  return response;
}
\`\`\`

**⚡ Pro tip**: Siempre experimenta con tus datos reales. Estos valores son puntos de partida, ajusta según tus necesidades específicas.`,
      keyPoints: [
        'Configuración determinística: temp=0, top_p bajo para análisis',
        'Configuración balanceada: temp=0.5-0.7 para producción',
        'Configuración creativa: temp alta, penalties altos para ideas',
        'Crea configuraciones reutilizables para consistencia',
        'Siempre registra y mide el impacto de cambios en parámetros',
        'Experimenta con tus datos reales antes de producción',
      ],
    },
  ],
};
