// @ts-nocheck
export const multimodalModels = {
  sections: [
    {
      title: 'Vision-Language Models: Arquitectura y Capacidades',
      content: `Los modelos vision-language (VLM) representan una evolución fundamental en IA, permitiendo que los sistemas comprendan y razonen sobre contenido visual además de texto. Estos modelos combinan encoders visuales (generalmente basados en ViT - Vision Transformers) con modelos de lenguaje grandes, creando sistemas capaces de tareas complejas de razonamiento multimodal.

**GPT-4 Vision (GPT-4V)** utiliza una arquitectura que integra un encoder visual CLIP-like con el modelo GPT-4. Acepta imágenes de hasta 20MB y puede procesar múltiples imágenes en una conversación. Es excelente para razonamiento complejo, análisis de gráficos, y comprensión contextual profunda. El costo es aproximadamente $0.01 por imagen (tamaño medio) más los tokens de texto.

**Claude 3 Opus/Sonnet Vision** emplea una arquitectura similar pero optimizada para documentos largos y razonamiento detallado. Puede procesar imágenes de hasta 32MB y mantener contexto de 200K tokens, ideal para análisis de documentos extensos. Destaca en precisión para OCR y comprensión de layouts complejos.

**Modelos Open Source** como LLaVA (Large Language and Vision Assistant) y Qwen-VL ofrecen alternativas deployables localmente. LLaVA-1.5 combina un CLIP vision encoder con Vicuna/Llama, logrando 85%+ de la capacidad de GPT-4V en benchmarks académicos. Qwen-VL soporta resoluciones más altas y múltiples idiomas, siendo particularmente fuerte en chino e inglés.

Ejemplo de uso con GPT-4 Vision:

\`\`\`python
from openai import OpenAI
import base64

client = OpenAI()

# Cargar y encodear imagen
with open("diagram.png", "rb") as image_file:
    image_data = base64.b64encode(image_file.read()).decode()

response = client.chat.completions.create(
    model="gpt-4-vision-preview",
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "Analiza este diagrama de arquitectura y explica el flujo de datos"
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/png;base64,{image_data}",
                        "detail": "high"  # 'low', 'medium', o 'high'
                    }
                }
            ]
        }
    ],
    max_tokens=1000
)

print(response.choices[0].message.content)
\`\`\`

La arquitectura típica de un VLM incluye: (1) Image Encoder que convierte imágenes en embeddings, (2) Projection Layer que mapea embeddings visuales al espacio del LLM, y (3) Language Model que procesa tokens visuales y textuales conjuntamente. Esta integración permite razonamiento cross-modal sofisticado.`,
      keyPoints: [
        'GPT-4V y Claude Vision lideran en capacidades comerciales, con costos de ~$0.01-0.015 por imagen',
        'LLaVA y Qwen-VL ofrecen alternativas open-source con 85%+ de capacidad en benchmarks',
        'La arquitectura combina Vision Transformers con LLMs mediante projection layers',
        'El parámetro "detail" (high/low) afecta significativamente costo y precisión',
        'Modelos pueden procesar múltiples imágenes simultáneamente en una conversación'
      ],
    },
    {
      title: 'Casos de Uso de Vision: Del OCR al Análisis Complejo',
      content: `Los modelos de visión transforman casos de uso que antes requerían pipelines complejos de CV tradicional. Los cinco casos principales incluyen: document understanding, image analysis, chart interpretation, UI/UX analysis, y visual QA.

**Document Understanding** es el caso más común en aplicaciones empresariales. Los VLMs pueden extraer información de facturas, contratos, formularios y documentos técnicos manteniendo contexto del layout. A diferencia del OCR tradicional, entienden relaciones semánticas entre elementos.

\`\`\`typescript
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";

const client = new Anthropic();

async function analyzeInvoice(imagePath: string) {
  const imageData = fs.readFileSync(imagePath);
  const base64Image = imageData.toString('base64');

  const message = await client.messages.create({
    model: "claude-3-opus-20240229",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/png",
              data: base64Image,
            },
          },
          {
            type: "text",
            text: `Extrae la siguiente información de esta factura en formato JSON:
            - Número de factura
            - Fecha de emisión
            - Proveedor (nombre, dirección, RFC)
            - Items (descripción, cantidad, precio unitario, total)
            - Subtotal, IVA, Total

            Retorna solo el JSON, sin explicaciones adicionales.`
          }
        ],
      },
    ],
  });

  return JSON.parse(message.content[0].text);
}
\`\`\`

**Análisis de Gráficos y Visualizaciones** permite extraer insights de charts, plots, dashboards y diagramas. Los modelos pueden leer valores exactos, identificar tendencias, comparar series, y generar narrativas explicativas.

**UI/UX Analysis** es emergente pero poderoso: los VLMs pueden criticar diseños, identificar problemas de accesibilidad, generar código frontend desde screenshots, y validar implementaciones contra mockups.

**Pipeline OCR + LLM Híbrido** combina lo mejor de ambos mundos. Usa Tesseract/PaddleOCR para extracción de texto raw (rápido y barato), luego un LLM para estructuración y razonamiento:

\`\`\`python
import pytesseract
from openai import OpenAI

def hybrid_document_processing(image_path):
    # Paso 1: OCR tradicional (rápido, barato)
    raw_text = pytesseract.image_to_string(image_path, lang='spa')

    # Paso 2: LLM para estructuración (sin visión, más barato)
    client = OpenAI()
    response = client.chat.completions.create(
        model="gpt-4-turbo",
        messages=[
            {"role": "system", "content": "Eres un experto en estructurar información de documentos."},
            {"role": "user", "content": f"Estructura este texto OCR en JSON:\\n\\n{raw_text}"}
        ]
    )

    return response.choices[0].message.content

# Costo: ~$0.001 vs $0.01+ con vision directa
\`\`\`

Para **Visual QA** sobre productos, escenas o personas, los VLMs permiten aplicaciones de e-commerce (búsqueda por imagen, recomendaciones), moderación de contenido, y asistentes visuales para accesibilidad.`,
      keyPoints: [
        'Document understanding supera OCR tradicional al mantener contexto semántico y de layout',
        'Pipeline híbrido OCR+LLM reduce costos 10x manteniendo alta precisión',
        'Chart interpretation permite extraer datos exactos y generar narrativas automáticas',
        'UI/UX analysis puede generar código frontend desde screenshots con 80%+ precisión',
        'Visual QA habilita búsqueda semántica y moderación de contenido visual'
      ],
    },
    {
      title: 'Audio y Speech: Whisper, TTS y Procesamiento en Tiempo Real',
      content: `Los modelos de audio han alcanzado niveles profesionales de precisión, con Whisper de OpenAI estableciendo el estándar para transcripción speech-to-text (STT), mientras que nuevos modelos TTS generan voz indistinguible de humanos reales.

**Whisper** es un modelo transformer entrenado en 680,000 horas de audio multilingüe. Soporta 99 idiomas con WER (Word Error Rate) <5% en inglés y español. Disponible en 5 tamaños: tiny (39M params), base (74M), small (244M), medium (769M), y large (1550M). El modelo large-v3 es el más preciso pero requiere GPU para tiempo real.

\`\`\`python
import whisper
import torch

# Cargar modelo (una vez, cachear)
device = "cuda" if torch.cuda.is_available() else "cpu"
model = whisper.load_model("medium", device=device)

# Transcripción básica
result = model.transcribe(
    "audio.mp3",
    language="es",  # Especificar idioma mejora precisión
    task="transcribe",  # o "translate" para traducir a inglés
    fp16=True if device == "cuda" else False
)

print(result["text"])
print(result["segments"])  # Timestamps por segmento

# Con detección de idioma automática
result_auto = model.transcribe("audio.mp3")
print(f"Idioma detectado: {result_auto['language']}")
\`\`\`

**Whisper API vs Local**: La API de OpenAI ($0.006/minuto) es conveniente y rápida, ideal para <10,000 minutos/mes. Para volúmenes mayores, deployment local con whisper.cpp o faster-whisper reduce costos 100x pero requiere infraestructura GPU.

\`\`\`python
from faster_whisper import WhisperModel

# 4x más rápido que whisper oficial, mismo precisión
model = WhisperModel("large-v3", device="cuda", compute_type="float16")

segments, info = model.transcribe("audio.mp3", beam_size=5)
for segment in segments:
    print(f"[{segment.start:.2f}s -> {segment.end:.2f}s] {segment.text}")
\`\`\`

**Text-to-Speech Moderno** con modelos como ElevenLabs, OpenAI TTS, y Azure Neural TTS genera voz emocional y natural. OpenAI TTS-1 ($15/1M caracteres) ofrece 6 voces y es optimizado para latencia. TTS-1-HD ($30/1M) tiene mayor calidad para contenido pregrabado.

\`\`\`typescript
import OpenAI from "openai";
import fs from "fs";

const openai = new OpenAI();

async function generateSpeech(text: string, voice: string = "nova") {
  const mp3 = await openai.audio.speech.create({
    model: "tts-1-hd",
    voice: voice,  // alloy, echo, fable, onyx, nova, shimmer
    input: text,
    speed: 1.0,  // 0.25 a 4.0
  });

  const buffer = Buffer.from(await mp3.arrayBuffer());
  fs.writeFileSync("output.mp3", buffer);
}
\`\`\`

**Procesamiento en Tiempo Real** para voice assistants requiere streaming. Whisper no es óptimo para esto (procesa audio completo). Alternativas: Deepgram API (streaming nativo, <300ms latency), AssemblyAI, o modelos lightweight como Silero.

Para **pipelines completos de voz**, combina STT + LLM + TTS:

\`\`\`python
async def voice_assistant_pipeline(audio_input):
    # 1. Speech to Text (Whisper)
    transcription = whisper_model.transcribe(audio_input)

    # 2. LLM Processing
    response = await openai.chat.completions.create(
        model="gpt-4-turbo",
        messages=[{"role": "user", "content": transcription["text"]}]
    )

    # 3. Text to Speech
    audio_response = await openai.audio.speech.create(
        model="tts-1",
        voice="nova",
        input=response.choices[0].message.content
    )

    return audio_response
\`\`\``,
      keyPoints: [
        'Whisper large-v3 alcanza <5% WER en español, soporta 99 idiomas con timestamps precisos',
        'faster-whisper ofrece 4x speedup vs implementación oficial, ideal para deployment local',
        'OpenAI TTS genera voz natural a $15/1M caracteres, con 6 voces y control de velocidad',
        'Streaming real-time requiere servicios especializados como Deepgram (<300ms latency)',
        'Pipelines STT+LLM+TTS completos permiten voice assistants conversacionales'
      ],
    },
    {
      title: 'Document Processing: PDFs, Tablas y Datos Estructurados',
      content: `El procesamiento de documentos es uno de los casos de uso más valiosos en empresas, donde millones de PDFs, contratos, reportes y formularios contienen información crítica atrapada en formatos no estructurados. Los VLMs revolucionan este espacio al entender layout, tablas complejas, y relaciones semánticas.

**Estrategias de PDF Processing**: (1) Text extraction directa para PDFs nativos digitales, (2) Vision models para PDFs escaneados o con layouts complejos, (3) Hybrid approach que usa text extraction + vision para validación.

\`\`\`python
import fitz  # PyMuPDF
from openai import OpenAI
import base64
from io import BytesIO
from PIL import Image

def process_pdf_hybrid(pdf_path: str):
    """Procesa PDF usando texto cuando posible, visión cuando necesario"""
    doc = fitz.open(pdf_path)
    client = OpenAI()
    results = []

    for page_num in range(len(doc)):
        page = doc[page_num]

        # Intentar extracción de texto
        text = page.get_text()

        # Si hay tablas o texto insuficiente, usar visión
        if len(text.strip()) < 50 or "table" in text.lower():
            # Convertir página a imagen
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # 2x resolution
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)

            # Encodear para API
            buffered = BytesIO()
            img.save(buffered, format="PNG")
            img_b64 = base64.b64encode(buffered.getvalue()).decode()

            # Procesar con GPT-4V
            response = client.chat.completions.create(
                model="gpt-4-vision-preview",
                messages=[{
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Extrae todo el contenido de esta página, preservando estructura de tablas en formato markdown."},
                        {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{img_b64}"}}
                    ]
                }],
                max_tokens=2000
            )

            results.append({
                "page": page_num + 1,
                "method": "vision",
                "content": response.choices[0].message.content
            })
        else:
            # Usar texto directo (más rápido y barato)
            results.append({
                "page": page_num + 1,
                "method": "text",
                "content": text
            })

    return results
\`\`\`

**Extracción de Tablas** es particularmente desafiante. GPT-4V y Claude 3 pueden convertir tablas complejas (incluyendo merged cells, multi-level headers) a formato estructurado:

\`\`\`typescript
interface TableExtractionResult {
  headers: string[];
  rows: Record<string, any>[];
  metadata: {
    tableNumber: number;
    location: string;
    confidence: number;
  };
}

async function extractTablesFromDocument(imagePath: string): Promise<TableExtractionResult[]> {
  const anthropic = new Anthropic();
  const imageData = fs.readFileSync(imagePath).toString('base64');

  const prompt = \`Analiza esta imagen y extrae TODAS las tablas que encuentres.
Para cada tabla:
1. Identifica los headers (incluso si son multi-nivel)
2. Extrae todas las filas manteniendo la estructura
3. Retorna en formato JSON array

Formato de salida:
{
  "tables": [
    {
      "headers": ["Column1", "Column2", ...],
      "rows": [{"Column1": "value", "Column2": "value"}, ...],
      "metadata": {"tableNumber": 1, "location": "descripción"}
    }
  ]
}

Solo retorna el JSON, sin explicaciones.\`;

  const message = await anthropic.messages.create({
    model: "claude-3-opus-20240229",
    max_tokens: 4096,
    messages: [{
      role: "user",
      content: [
        { type: "image", source: { type: "base64", media_type: "image/png", data: imageData }},
        { type: "text", text: prompt }
      ]
    }]
  });

  return JSON.parse(message.content[0].text).tables;
}
\`\`\`

**Documentos Multi-Página** requieren estrategia de chunking. Para documentos <50 páginas, procesa por página y consolida. Para documentos mayores, usa extracción de texto + semantic chunking + vision selectiva solo para páginas complejas.

**Structured Data Extraction** con schemas garantiza consistencia:

\`\`\`python
from pydantic import BaseModel, Field
from typing import List

class InvoiceItem(BaseModel):
    description: str
    quantity: float
    unit_price: float
    total: float

class Invoice(BaseModel):
    invoice_number: str
    date: str
    vendor_name: str
    vendor_tax_id: str
    items: List[InvoiceItem]
    subtotal: float
    tax: float
    total: float

def extract_invoice_structured(image_path: str) -> Invoice:
    # ... setup vision model ...

    prompt = f"""Extrae la información de esta factura siguiendo EXACTAMENTE este schema JSON:
{Invoice.model_json_schema()}

Retorna solo el JSON, sin markdown ni explicaciones."""

    # ... call vision API ...

    return Invoice.model_validate_json(response.choices[0].message.content)
\`\`\``,
      keyPoints: [
        'Hybrid approach (text + vision) optimiza costos: usa texto cuando posible, visión cuando necesario',
        'GPT-4V y Claude 3 manejan tablas complejas con merged cells y multi-level headers',
        'PyMuPDF permite conversión de PDF a imágenes de alta resolución para mejor OCR',
        'Pydantic schemas garantizan extracción estructurada consistente y type-safe',
        'Para PDFs >50 páginas, combina text extraction + semantic chunking + vision selectiva'
      ],
    },
    {
      title: 'Best Practices y Optimización',
      content: `El uso efectivo de modelos multimodales requiere optimización cuidadosa de costos, latencia, y precisión. Las decisiones correctas pueden reducir costos 10-100x manteniendo calidad.

**Image Preprocessing** mejora precisión y reduce costos:

\`\`\`python
from PIL import Image
import io

def optimize_image_for_vision(image_path: str, max_size: tuple = (2048, 2048)) -> bytes:
    """Optimiza imagen para APIs de visión: resize, compress, format"""
    img = Image.open(image_path)

    # Convertir RGBA a RGB si necesario
    if img.mode == 'RGBA':
        background = Image.new('RGB', img.size, (255, 255, 255))
        background.paste(img, mask=img.split()[3])
        img = background

    # Resize manteniendo aspect ratio
    img.thumbnail(max_size, Image.Resampling.LANCZOS)

    # Comprimir a JPEG de calidad apropiada
    output = io.BytesIO()
    img.save(output, format='JPEG', quality=85, optimize=True)

    return output.getvalue()

# Ejemplo: imagen de 5MB -> 200KB, misma precisión, 25x más barata
\`\`\`

**Prompt Engineering para Visión** difiere del texto. Sé específico sobre qué buscar, dónde mirar, y formato de salida:

\`\`\`python
# ❌ Malo: vago, no especifica formato
prompt_bad = "Analiza esta imagen"

# ✅ Bueno: específico, estructurado, con ejemplos
prompt_good = """Analiza esta imagen de dashboard y extrae:

1. MÉTRICAS PRINCIPALES (top de la pantalla):
   - Nombre de métrica
   - Valor actual
   - Cambio porcentual vs período anterior

2. GRÁFICOS:
   - Tipo de gráfico (line, bar, pie)
   - Tendencia general (up, down, stable)
   - Valores aproximados de puntos clave

3. ALERTAS/WARNINGS:
   - Texto de alerta
   - Severidad (info, warning, critical)

Retorna en JSON con esta estructura:
{
  "metrics": [{"name": "...", "value": "...", "change": "..."}],
  "charts": [{"type": "...", "trend": "...", "key_values": [...]}],
  "alerts": [{"text": "...", "severity": "..."}]
}"""
\`\`\`

**Token Cost Optimization** mediante el parámetro \`detail\`:

\`\`\`typescript
// low detail: 65 tokens fijos, ~$0.002, bueno para clasificación/detección general
const lowDetailResponse = await openai.chat.completions.create({
  model: "gpt-4-vision-preview",
  messages: [{
    role: "user",
    content: [
      { type: "text", text: "¿Esta imagen contiene un auto?" },
      { type: "image_url", image_url: { url: imageUrl, detail: "low" }}
    ]
  }]
});

// high detail: 65-260 tokens según tamaño, ~$0.01-0.04, necesario para OCR/detalles
const highDetailResponse = await openai.chat.completions.create({
  model: "gpt-4-vision-preview",
  messages: [{
    role: "user",
    content: [
      { type: "text", text: "Extrae todo el texto de este documento" },
      { type: "image_url", image_url: { url: imageUrl, detail: "high" }}
    ]
  }]
});
\`\`\`

**Batch Processing** para múltiples imágenes reduce latencia y habilita paralelización:

\`\`\`python
import asyncio
from openai import AsyncOpenAI

async def process_images_batch(image_paths: list[str]) -> list[dict]:
    client = AsyncOpenAI()

    async def process_single(image_path: str):
        # ... encode image ...
        response = await client.chat.completions.create(
            model="gpt-4-vision-preview",
            messages=[{
                "role": "user",
                "content": [
                    {"type": "text", "text": "Describe esta imagen en 2-3 frases"},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{img_b64}"}}
                ]
            }]
        )
        return {"path": image_path, "description": response.choices[0].message.content}

    # Procesar hasta 10 imágenes en paralelo
    tasks = [process_single(path) for path in image_paths]
    results = await asyncio.gather(*tasks)
    return results

# Uso
results = asyncio.run(process_images_batch(["img1.jpg", "img2.jpg", ...]))
\`\`\`

**Error Handling** robusto para APIs de visión:

\`\`\`python
from tenacity import retry, stop_after_attempt, wait_exponential
import openai

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=4, max=10),
    reraise=True
)
def vision_api_call_with_retry(image_b64: str, prompt: str):
    try:
        response = client.chat.completions.create(
            model="gpt-4-vision-preview",
            messages=[{
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_b64}"}}
                ]
            }],
            max_tokens=1000
        )
        return response.choices[0].message.content
    except openai.RateLimitError:
        # Rate limit: esperar y reintentar (handled by tenacity)
        raise
    except openai.BadRequestError as e:
        # Imagen inválida/muy grande: no reintentar
        if "image" in str(e).lower():
            return {"error": "Invalid image", "details": str(e)}
        raise
    except Exception as e:
        # Otros errores: log y reintento
        print(f"Error: {e}")
        raise
\`\`\``,
      keyPoints: [
        'Image preprocessing (resize, compress) puede reducir costos 25x sin pérdida de precisión',
        'El parámetro "detail" (low/high) impacta costos 5-20x: usa low para clasificación, high para OCR',
        'Prompts específicos con estructura y ejemplos mejoran precisión 40-60% vs prompts vagos',
        'Async batch processing permite procesar 10+ imágenes en paralelo, reduciendo latencia total',
        'Retry logic con exponential backoff es esencial para APIs de visión (rate limits frecuentes)'
      ],
    },
    {
      title: 'Limitaciones y Consideraciones',
      content: `A pesar de capacidades impresionantes, los modelos multimodales tienen limitaciones críticas que deben entenderse para deployment en producción. Conocer estos límites evita casos de uso inapropiados y problemas de precisión.

**Hallucinations en Visión** son más comunes y peligrosas que en texto. Los modelos pueden "ver" texto que no existe, inventar cantidades en tablas, o malinterpretar elementos visuales con alta confianza. Siempre valida outputs críticos.

\`\`\`python
def verify_vision_extraction(image_path: str, extracted_data: dict) -> dict:
    """Verifica extracción mediante doble-check con diferentes prompts"""

    # Primera extracción (ya realizada)
    first_result = extracted_data

    # Segunda extracción con prompt diferente
    second_result = vision_model.extract(
        image_path,
        prompt="Verifica estos datos extraídos y confirma exactitud: " + str(first_result)
    )

    # Tercera extracción para campos críticos (ej: montos)
    critical_fields = vision_model.extract(
        image_path,
        prompt="Extrae SOLO los montos totales y números de referencia. Lee cada dígito cuidadosamente."
    )

    # Comparar y flagear discrepancias
    if first_result['total'] != critical_fields['total']:
        return {
            "status": "needs_review",
            "reason": "Monto total difiere entre extracciones",
            "values": [first_result['total'], critical_fields['total']]
        }

    return {"status": "verified", "data": first_result}
\`\`\`

**Razonamiento Espacial Limitado**: Los modelos luchan con relaciones espaciales precisas (contar objetos, medir distancias, entender perspectiva 3D). Para contar elementos, usa detección de objetos tradicional (YOLO, Detectron2) antes del VLM.

**Reconocimiento de Texto Pequeño**: OCR de texto <12pt o de baja resolución es poco confiable. Solución: aumenta resolución de imagen o usa OCR tradicional (Tesseract, PaddleOCR) para texto pequeño.

\`\`\`python
def handle_small_text(image_path: str):
    """Combina upscaling + OCR tradicional + VLM para texto pequeño"""
    from PIL import Image
    import pytesseract

    # Upscale imagen 2-4x
    img = Image.open(image_path)
    upscaled = img.resize((img.width * 3, img.height * 3), Image.Resampling.LANCZOS)

    # OCR tradicional para texto
    ocr_text = pytesseract.image_to_string(upscaled, lang='spa+eng')

    # VLM para estructura y contexto
    vision_structure = vision_model.analyze(
        upscaled,
        prompt=f"Dado este OCR text: {ocr_text}, identifica la estructura del documento y organiza el contenido."
    )

    return vision_structure
\`\`\`

**Limitaciones de Contexto Visual**: Múltiples imágenes consumen contexto rápidamente. GPT-4V procesa cada imagen como ~65-260 tokens dependiendo de detail/size. Con contexto de 128K, máximo ~200-400 imágenes teóricas, pero prácticamente <50 para mantener espacio para respuestas.

**Consistencia Variable**: El mismo modelo puede dar resultados ligeramente diferentes para la misma imagen en llamadas diferentes (especialmente con temperature>0). Para aplicaciones críticas, usa temperature=0 y múltiples validaciones.

**Seguridad y Privacy**: Las imágenes enviadas a APIs son procesadas en servidores del proveedor. Para datos sensibles (médicos, financieros, legales), considera:
- Deployment local con LLaVA/Qwen-VL
- Redacción de información sensible antes de enviar
- APIs con compliance certificado (ej: Azure OpenAI con HIPAA)

**Costos en Escala**: A $0.01-0.015 por imagen, procesar 1M imágenes cuesta $10K-15K. Optimizaciones:
- Usa detail='low' cuando posible
- Cache resultados para imágenes duplicadas
- Considera modelos locales para volumen muy alto

\`\`\`python
from functools import lru_cache
import hashlib

def image_hash(image_bytes: bytes) -> str:
    return hashlib.md5(image_bytes).hexdigest()

@lru_cache(maxsize=10000)
def cached_vision_call(image_hash: str, prompt: str):
    # Busca en cache primero
    cached = redis_client.get(f"vision:{image_hash}:{prompt}")
    if cached:
        return json.loads(cached)

    # Si no está en cache, llama API
    result = vision_model.analyze(image_hash, prompt)

    # Cachea por 30 días
    redis_client.setex(f"vision:{image_hash}:{prompt}", 2592000, json.dumps(result))
    return result
\`\`\`

**Latencia**: Las llamadas de visión son 2-5x más lentas que texto (1-5s típicamente). Para UX responsivo, usa loading states, processing asíncrono, y feedback progresivo.`,
      keyPoints: [
        'Hallucinations en visión son frecuentes: siempre valida outputs críticos con double-checking',
        'Texto pequeño (<12pt) requiere upscaling o OCR tradicional antes de VLM processing',
        'Razonamiento espacial es limitado: usa CV tradicional para contar/medir objetos',
        'Privacy concerns: datos sensibles requieren deployment local o APIs compliance-certified',
        'Costos escalan rápidamente: usa caching, detail=low, y modelos locales para alto volumen'
      ],
    },
  ],
};

export const localModelsEdge = {
  sections: [
    {
      title: '¿Por Qué Ejecutar Modelos Localmente?',
      content: `La ejecución local de modelos de lenguaje representa un cambio fundamental en cómo las organizaciones implementan IA. Mientras que APIs como OpenAI y Anthropic ofrecen conveniencia, los modelos locales proporcionan control, privacidad, y economía de escala que son críticos para muchos casos de uso empresariales.

**Data Privacy y Compliance**: La razón número uno para deployment local es privacidad de datos. Datos médicos (HIPAA), financieros (PCI-DSS, SOX), gubernamentales, y de propiedad intelectual no pueden enviarse a APIs externas sin violar regulaciones. Modelos locales mantienen todos los datos on-premise o en VPCs privadas.

Casos de uso típicos de privacy:
- Hospitales analizando registros médicos electrónicos
- Bancos procesando transacciones y datos de clientes
- Bufetes de abogados analizando contratos confidenciales
- Empresas de tecnología protegiendo código propietario
- Gobiernos procesando información clasificada

**Reducción de Latencia**: Las llamadas de API introducen latencia de red (50-500ms) más tiempo de procesamiento (1-5s). Modelos locales en GPU eliminan latencia de red, logrando <100ms para generaciones cortas. Crítico para:
- Autocomplete en IDEs (GitHub Copilot-style)
- Chatbots con respuestas instantáneas
- Processing en tiempo real de streams de datos
- Aplicaciones embedded en dispositivos edge

**Costos en Escala**: Las APIs son cost-effective hasta ~1-10M tokens/mes ($10-200). Más allá, los costos de hardware local se amortizan:

\`\`\`
Análisis de Costos (GPT-4 equivalent):

API (OpenAI GPT-4):
- Input: $10/1M tokens, Output: $30/1M tokens
- 100M tokens/mes (mix 70/30 input/output): $1,600/mes
- Anual: $19,200

Local (2x NVIDIA A100 80GB):
- Hardware: $20,000 (one-time)
- Electricidad: ~$200/mes
- Anual año 1: $22,400
- Anual año 2+: $2,400

Break-even: ~14 meses
Ahorro años 2-5: $84,000
\`\`\`

**Capacidad Offline**: Aplicaciones que funcionan sin internet requieren modelos locales:
- Software de escritorio (Photoshop, IDE's)
- Aplicaciones móviles en áreas sin cobertura
- Dispositivos edge (drones, robots, IoT)
- Entornos de alta seguridad (air-gapped networks)

**Customización y Fine-tuning**: Con modelos locales, puedes fine-tune en datos propietarios sin compartirlos. Adapta modelos a jerga específica de dominio, estilo de empresa, o tareas especializadas.

\`\`\`python
from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments
from peft import LoraConfig, get_peft_model
from trl import SFTTrainer

# Fine-tune Llama-3-8B en datos propietarios
model = AutoModelForCausalLM.from_pretrained("meta-llama/Meta-Llama-3-8B")
tokenizer = AutoTokenizer.from_pretrained("meta-llama/Meta-Llama-3-8B")

# LoRA config para fine-tuning eficiente
lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM"
)

model = get_peft_model(model, lora_config)

# Entrenar en datos privados (nunca salen de tu infraestructura)
trainer = SFTTrainer(
    model=model,
    tokenizer=tokenizer,
    train_dataset=proprietary_dataset,
    max_seq_length=2048,
)

trainer.train()
# Modelo ahora especializado en tu dominio
\`\`\`

**Control y Determinismo**: APIs pueden cambiar modelos, deprecar versiones, o tener outages. Modelos locales ofrecen:
- Versiones locked y reproducibilidad
- Sin rate limits o throttling
- Uptime controlado por ti
- Sin vendor lock-in

**Desafíos de Local Deployment**:
- Infraestructura GPU costosa inicialmente
- Requiere expertise en ML ops
- Mantenimiento y updates manuales
- Menos capacidad que modelos frontier (GPT-4, Claude Opus)

La decisión API vs Local depende de volumen, requisitos de privacidad, latencia, y capacidades técnicas del equipo.`,
      keyPoints: [
        'Privacy/compliance es driver #1: HIPAA, PCI-DSS, datos clasificados requieren deployment local',
        'Break-even económico ocurre a ~10-100M tokens/mes dependiendo del modelo',
        'Latencia local puede ser <100ms vs 1-5s de APIs, crítico para aplicaciones real-time',
        'Offline capability habilita desktop apps, móvil, y edge devices sin conectividad',
        'Fine-tuning en datos propietarios sin compartirlos permite especialización de dominio'
      ],
    },
    {
      title: 'Quantización: Reduciendo Memoria sin Sacrificar Calidad',
      content: `La quantización es la técnica fundamental que hace viable ejecutar modelos grandes en hardware consumer. Transforma modelos de 70B+ parámetros que requieren 140GB+ de VRAM a versiones que corren en GPUs de 24GB o incluso CPUs, con degradación mínima de calidad.

**Fundamentos de Quantización**: Los modelos se entrenan en precisión float32 (32 bits por parámetro) o float16 (16 bits). Quantización reduce esto a 8-bit, 4-bit, o incluso menos bits, comprimiendo tamaño de modelo 2-8x. La clave es minimizar pérdida de precisión mediante técnicas sofisticadas de mapeo.

**Formatos de Quantización Principales**:

**GGUF (GPT-Generated Unified Format)** es el estándar para llama.cpp y Ollama. Ventajas: rápido en CPU, múltiples niveles de quantización, amplio soporte. Niveles comunes:
- Q8_0: 8-bit, ~99% calidad del modelo original
- Q6_K: 6-bit, ~98% calidad, buen balance
- Q5_K_M: 5-bit medium, ~96% calidad, muy popular
- Q4_K_M: 4-bit medium, ~94% calidad, mínimo hardware
- Q3_K_M: 3-bit medium, ~88% calidad, uso extremo
- Q2_K: 2-bit, ~75% calidad, solo experimental

\`\`\`python
# Convertir modelo HuggingFace a GGUF
# Requiere: pip install llama-cpp-python

from llama_cpp import Llama

# Descargar modelo GGUF quantizado (ej: Llama-3-8B Q4_K_M)
model = Llama(
    model_path="./models/llama-3-8b-q4_k_m.gguf",
    n_ctx=4096,  # Context window
    n_gpu_layers=35,  # Layers en GPU (0 = solo CPU)
    n_threads=8,  # CPU threads
    verbose=False
)

response = model(
    "Explica quantización de modelos en 3 frases",
    max_tokens=200,
    temperature=0.7,
    stop=["Human:", "\n\n"]
)

print(response['choices'][0]['text'])
\`\`\`

**AWQ (Activation-aware Weight Quantization)** optimiza quantización basándose en importancia de activations. Logra mejor calidad que GGUF a mismo número de bits, especialmente para 4-bit. Requiere GPU (no soporta CPU).

\`\`\`python
from transformers import AutoModelForCausalLM, AutoTokenizer
from awq import AutoAWQForCausalLM

# Cargar modelo AWQ 4-bit (2-3x más rápido que FP16, 75% menos memoria)
model = AutoAWQForCausalLM.from_quantized(
    "TheBloke/Llama-2-13B-AWQ",
    fuse_layers=True,  # Optimización adicional
    device_map="cuda:0"
)
tokenizer = AutoTokenizer.from_pretrained("TheBloke/Llama-2-13B-AWQ")

# Inferencia normal
inputs = tokenizer("¿Cuál es la capital de Francia?", return_tensors="pt").to("cuda:0")
outputs = model.generate(**inputs, max_new_tokens=50)
print(tokenizer.decode(outputs[0]))
\`\`\`

**GPTQ (GPT Quantization)** usa calibration dataset para optimizar quantización. Similar a AWQ en calidad pero con diferentes trade-offs. Popular en ExLlama/ExLlamaV2 para inferencia ultra-rápida.

**Comparación de Calidad por Nivel**:

| Bits | Tamaño (70B) | VRAM | Calidad | Uso Recomendado |
|------|--------------|------|---------|-----------------|
| FP16 | 140GB | 160GB+ | 100% | Training, máxima calidad |
| 8-bit | 70GB | 80GB | 99% | Production, alta calidad |
| 6-bit | 52GB | 60GB | 98% | Balance calidad-recurso |
| 5-bit | 44GB | 50GB | 96% | Muy popular, buen balance |
| 4-bit | 35GB | 40GB | 94% | Consumer GPUs (3090, 4090) |
| 3-bit | 26GB | 30GB | 88% | Hardware limitado |
| 2-bit | 18GB | 20GB | 75% | Experimental |

**Recomendaciones por Caso de Uso**:

\`\`\`python
# Producción enterprise: 8-bit o 6-bit
# Máxima calidad, GPUs server (A100, H100)
model_production = load_model("llama-3-70b", quantization="8bit")

# Development/testing: 5-bit o 4-bit
# Balance óptimo, GPUs prosumer (RTX 4090, A6000)
model_dev = load_model("llama-3-70b-Q5_K_M.gguf")

# Consumer/laptop: 4-bit o 3-bit
# Hardware limitado, laptops con GPU
model_consumer = load_model("llama-3-8b-Q4_K_M.gguf")

# CPU-only: 4-bit GGUF
# Sin GPU, maximiza CPU performance
model_cpu = Llama(
    model_path="llama-3-8b-Q4_K_M.gguf",
    n_gpu_layers=0,  # Todo en CPU
    n_threads=16
)
\`\`\`

**Medición de Degradación**: Usa benchmarks (MMLU, HellaSwag, TruthfulQA) para medir impacto de quantización:

\`\`\`python
from lm_eval import evaluator

# Evaluar modelo quantizado vs original
results_fp16 = evaluator.simple_evaluate(
    model="meta-llama/Meta-Llama-3-8B",
    tasks=["mmlu", "hellaswag"],
    batch_size=16
)

results_q4 = evaluator.simple_evaluate(
    model="./llama-3-8b-Q4_K_M.gguf",
    tasks=["mmlu", "hellaswag"],
    batch_size=16
)

print(f"FP16 MMLU: {results_fp16['mmlu']['acc']:.3f}")
print(f"Q4 MMLU: {results_q4['mmlu']['acc']:.3f}")
print(f"Degradación: {(1 - results_q4['mmlu']['acc']/results_fp16['mmlu']['acc'])*100:.1f}%")
\`\`\`

Para la mayoría de aplicaciones, 4-bit Q4_K_M ofrece el mejor balance: corre en hardware accesible con <5% degradación de calidad.`,
      keyPoints: [
        'Quantización comprime modelos 2-8x: Llama-3-70B de 140GB a 35GB (4-bit) o 18GB (2-bit)',
        'GGUF es estándar para CPU/hybrid, AWQ/GPTQ optimizados para GPU-only inference',
        'Q4_K_M (4-bit) ofrece mejor balance: 94% calidad, corre en GPUs consumer (24GB)',
        '8-bit mantiene 99% calidad, 6-bit 98%, 5-bit 96%, 4-bit 94%, 3-bit 88%',
        'Degradación de calidad es task-dependent: mide con benchmarks (MMLU, HellaSwag)'
      ],
    },
    {
      title: 'Frameworks de Inferencia: llama.cpp, Ollama, vLLM',
      content: `Los frameworks de inferencia optimizan la ejecución de modelos para máximo throughput y mínima latencia. La elección correcta puede significar la diferencia entre 10 tokens/seg y 100+ tokens/seg en el mismo hardware.

**llama.cpp** es el framework fundamental para inferencia CPU y híbrida CPU+GPU. Escrito en C++, extremadamente optimizado, soporta GGUF quantization, y corre en prácticamente cualquier hardware.

Ventajas:
- Rápido en CPU (SIMD, AVX2, AVX512 optimizations)
- Soporte para Apple Silicon (Metal) con performance excepcional
- Memoria compartida CPU-GPU eficiente
- Portable (Linux, Mac, Windows, incluso mobile)

Desventajas:
- Menos features que frameworks Python
- No optimizado para batch processing
- Setup más manual

\`\`\`bash
# Compilar llama.cpp con GPU support
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp
make LLAMA_CUBLAS=1  # NVIDIA GPU
# o: make LLAMA_METAL=1  # Apple Silicon

# Ejecutar servidor de inferencia
./server -m models/llama-3-8b-Q4_K_M.gguf \
  -c 4096 \        # Context length
  -ngl 35 \        # GPU layers
  --port 8080 \
  --threads 8

# Cliente HTTP
curl http://localhost:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hola"}],
    "temperature": 0.7,
    "max_tokens": 100
  }'
\`\`\`

**Ollama** es un wrapper user-friendly sobre llama.cpp que simplifica gestión de modelos. Piensa en ello como Docker para LLMs.

Ventajas:
- Setup trivial (un comando para instalar y correr)
- Gestión automática de modelos y dependencias
- API compatible con OpenAI
- Perfecto para desarrollo local

\`\`\`bash
# Instalar Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Descargar y ejecutar modelo
ollama run llama3:8b

# Usar como API
ollama serve

# Cliente Python
pip install ollama
\`\`\`

\`\`\`python
import ollama

# Chat simple
response = ollama.chat(
    model='llama3:8b',
    messages=[
        {'role': 'user', 'content': '¿Por qué es el cielo azul?'}
    ]
)
print(response['message']['content'])

# Streaming
for chunk in ollama.chat(
    model='llama3:8b',
    messages=[{'role': 'user', 'content': 'Escribe un poema largo'}],
    stream=True
):
    print(chunk['message']['content'], end='', flush=True)

# Embeddings
embeddings = ollama.embeddings(
    model='nomic-embed-text',
    prompt='Texto para embeddear'
)
\`\`\`

**vLLM** (Very Large Language Models) es el framework de producción para inferencia GPU de alto rendimiento. Usa PagedAttention para gestionar memoria KV cache eficientemente, logrando throughput 10-24x mayor que HuggingFace Transformers.

Ventajas:
- Throughput máximo para GPU inference
- Continuous batching para latencia óptima
- Compatible con OpenAI API
- Soporte para modelos >100B parámetros

Desventajas:
- Requiere GPU (no funciona en CPU)
- Mayor complejidad de setup
- Consumo alto de VRAM

\`\`\`python
from vllm import LLM, SamplingParams

# Inicializar modelo con vLLM
llm = LLM(
    model="meta-llama/Meta-Llama-3-8B-Instruct",
    tensor_parallel_size=2,  # Multi-GPU
    gpu_memory_utilization=0.9,
    max_model_len=4096
)

# Definir parámetros de sampling
sampling_params = SamplingParams(
    temperature=0.7,
    top_p=0.95,
    max_tokens=200
)

# Batch inference (muy eficiente)
prompts = [
    "Explica quantización de modelos",
    "¿Qué es vLLM?",
    "Diferencia entre llama.cpp y vLLM"
]

outputs = llm.generate(prompts, sampling_params)

for output in outputs:
    print(f"Prompt: {output.prompt}")
    print(f"Output: {output.outputs[0].text}\n")
\`\`\`

**vLLM OpenAI-Compatible Server**:

\`\`\`bash
# Iniciar servidor vLLM
python -m vllm.entrypoints.openai.api_server \
  --model meta-llama/Meta-Llama-3-8B-Instruct \
  --tensor-parallel-size 2 \
  --port 8000

# Cliente compatible con OpenAI SDK
\`\`\`

\`\`\`python
from openai import OpenAI

# Apuntar al servidor vLLM local
client = OpenAI(
    base_url="http://localhost:8000/v1",
    api_key="dummy"  # vLLM no requiere API key
)

response = client.chat.completions.create(
    model="meta-llama/Meta-Llama-3-8B-Instruct",
    messages=[
        {"role": "user", "content": "Explica PagedAttention"}
    ]
)

print(response.choices[0].message.content)
\`\`\`

**TensorRT-LLM** (NVIDIA) ofrece la máxima performance en GPUs NVIDIA mediante optimizaciones de kernel profundas. Requiere más setup pero logra 2-4x speedup sobre vLLM.

**Comparación de Performance** (Llama-3-8B, NVIDIA A100):

| Framework | Throughput (tok/s) | Latency (ms) | Setup | CPU Support |
|-----------|-------------------|--------------|--------|-------------|
| HF Transformers | 15 | 450 | Fácil | Sí |
| llama.cpp | 40 (CPU), 80 (GPU) | 150 | Medio | Excelente |
| Ollama | 75 | 160 | Muy fácil | Sí |
| vLLM | 180 | 80 | Medio | No |
| TensorRT-LLM | 320 | 45 | Difícil | No |

**Recomendaciones**:
- **Desarrollo local**: Ollama (facilidad máxima)
- **Producción CPU/híbrida**: llama.cpp (control y performance)
- **Producción GPU alta carga**: vLLM (throughput máximo)
- **Máxima optimización NVIDIA**: TensorRT-LLM (complejidad justificada)`,
      keyPoints: [
        'llama.cpp es estándar para CPU/hybrid, excelente en Apple Silicon, soporta GGUF',
        'Ollama simplifica desarrollo local con setup trivial y API compatible OpenAI',
        'vLLM logra 10-24x throughput vs HF Transformers mediante PagedAttention y continuous batching',
        'TensorRT-LLM ofrece máxima performance (2-4x sobre vLLM) pero requiere setup complejo',
        'Elección depende de hardware, volumen, y complejidad aceptable: Ollama dev, vLLM producción'
      ],
    },
    {
      title: 'Hardware Requirements: CPU, GPU, y Apple Silicon',
      content: `La elección de hardware determina qué modelos puedes ejecutar, a qué velocidad, y a qué costo. Entender los trade-offs entre CPU, GPU, y Apple Silicon es crítico para deployment efectivo.

**CPU Inference** es viable para modelos pequeños (7B-13B quantizados) y cargas bajas. Ventajas: hardware barato, VRAM ilimitada (usa RAM). Desventajas: 5-10x más lento que GPU.

\`\`\`
CPU Recommendations:

Entrada (Desarrollo, testing):
- Intel i5-12400 / AMD Ryzen 5 5600X (6 cores)
- 32GB RAM
- Llama-3-8B Q4: ~15-25 tokens/seg

Gama Media (Producción baja carga):
- Intel i7-13700K / AMD Ryzen 9 5900X (12+ cores)
- 64GB RAM
- Llama-3-8B Q4: ~35-50 tokens/seg
- Llama-2-13B Q4: ~20-30 tokens/seg

Alta Gama (CPU-only producción):
- AMD Threadripper 3970X / Intel Xeon (32+ cores)
- 128-256GB RAM
- Llama-3-8B Q4: ~60-80 tokens/seg
- Mixtral-8x7B Q4: ~25-35 tokens/seg
\`\`\`

**GPU Inference** ofrece 5-20x speedup sobre CPU. VRAM es el limitante principal: determina qué modelos caben en memoria.

\`\`\`
GPU Options by VRAM:

12GB (RTX 3060, RTX 4060 Ti):
- Llama-3-8B Q4: ~80-100 tok/s
- Mistral-7B Q4: ~90-110 tok/s
- Límite: ~10B parámetros quantizado

16GB (RTX 4060 Ti 16GB, A4000):
- Llama-3-8B FP16: ~120-150 tok/s
- Llama-2-13B Q4: ~70-90 tok/s
- Límite: ~14B parámetros quantizado

24GB (RTX 3090, RTX 4090, A5000, L40):
- Llama-3-8B FP16: ~180-220 tok/s
- Llama-2-13B FP16: ~140-170 tok/s
- CodeLlama-34B Q4: ~50-70 tok/s
- Límite: ~34B parámetros quantizado

40GB (A100 40GB, H100 80GB):
- Llama-2-70B Q4: ~80-120 tok/s
- Mixtral-8x7B FP16: ~150-200 tok/s
- Límite: ~70B parámetros quantizado

80GB (A100 80GB, H100):
- Llama-2-70B FP16: ~160-200 tok/s
- Llama-3-70B Q8: ~140-180 tok/s
- Límite: ~70B parámetros FP16

Multi-GPU (2x-8x A100/H100):
- Llama-2-70B FP16: ~300-500 tok/s
- Modelos 100B+ parámetros
\`\`\`

**Ejemplo de cálculo de VRAM**:

\`\`\`python
def estimate_vram_needed(num_params_billions: float, bits: int, context_length: int = 4096) -> float:
    """Estima VRAM requerida en GB"""

    # Memoria del modelo
    model_size_gb = (num_params_billions * bits) / 8  # Convertir bits a bytes a GB

    # Overhead del framework (~20%)
    framework_overhead = model_size_gb * 0.2

    # KV cache (depende del context length)
    # Aproximación: ~2 bytes por token por layer
    num_layers = num_params_billions * 2.5  # Estimación rough
    kv_cache_gb = (context_length * num_layers * 2) / (1024**3)

    # Workspace temporal (~2GB)
    workspace = 2

    total_vram = model_size_gb + framework_overhead + kv_cache_gb + workspace
    return total_vram

# Ejemplos
print(f"Llama-3-8B FP16: {estimate_vram_needed(8, 16):.1f}GB")  # ~18GB
print(f"Llama-3-8B Q4: {estimate_vram_needed(8, 4):.1f}GB")    # ~8GB
print(f"Llama-2-70B Q4: {estimate_vram_needed(70, 4):.1f}GB")  # ~42GB
print(f"Llama-2-70B FP16: {estimate_vram_needed(70, 16):.1f}GB") # ~95GB
\`\`\`

**Apple Silicon** (M1/M2/M3 con Metal) ofrece performance excepcional por vatio. La unified memory permite usar toda la RAM como VRAM.

\`\`\`
Apple Silicon Performance:

M1 Pro (16GB):
- Llama-3-8B Q4: ~30-40 tok/s
- Mistral-7B Q4: ~35-45 tok/s

M1 Max (32-64GB):
- Llama-3-8B Q4: ~50-65 tok/s
- Llama-2-13B Q4: ~30-40 tok/s
- Mixtral-8x7B Q4: ~15-25 tok/s

M2 Ultra (64-192GB):
- Llama-2-70B Q4: ~25-35 tok/s
- Llama-3-8B FP16: ~70-90 tok/s
- Capacidad para modelos grandes con mucha RAM

M3 Max (36-128GB):
- Llama-3-8B Q4: ~60-80 tok/s
- Similar a M2 con mejor eficiencia energética
\`\`\`

\`\`\`python
# Optimizar para Apple Silicon (llama.cpp)
from llama_cpp import Llama

model = Llama(
    model_path="llama-3-8b-Q4_K_M.gguf",
    n_ctx=4096,
    n_gpu_layers=1,  # En Mac, 1 = usar Metal para todo
    n_threads=0,  # Auto-detect optimal threads
    f16_kv=True,  # Use FP16 for KV cache
    use_mlock=True,  # Lock memory para evitar swapping
    verbose=False
)
\`\`\`

**Cloud GPU Options** para deployment sin inversión de capital:

\`\`\`
Precio por Hora (On-Demand):

AWS:
- g5.xlarge (1x A10G 24GB): $1.01/hr
- p4d.24xlarge (8x A100 40GB): $32.77/hr

GCP:
- n1-standard-8 + 1x T4 16GB: $0.62/hr
- a2-highgpu-1g (1x A100 40GB): $3.67/hr

Azure:
- NC6s_v3 (1x V100 16GB): $3.06/hr
- ND96asr_v4 (8x A100 80GB): $27.20/hr

Lambda Labs (optimizado ML):
- 1x A100 40GB: $1.10/hr
- 1x H100 80GB: $2.49/hr

RunPod (spot pricing):
- 1x A100 40GB: ~$0.69/hr (spot)
- 1x RTX 4090 24GB: ~$0.34/hr (spot)
\`\`\`

**Recomendación por Budget**:

\`\`\`
< $500: CPU (Ryzen 5) + 32GB RAM
  - Modelos 7B Q4, desarrollo

$500-1500: CPU + RTX 4060 Ti 16GB
  - Modelos hasta 13B, buen balance

$1500-3000: CPU + RTX 4090 24GB
  - Modelos hasta 34B Q4, producción SMB

$3000-8000: Threadripper + 2x RTX 4090
  - Modelos hasta 70B Q4, alta performance

$8000+: Server con A100/H100
  - Cualquier modelo, producción enterprise

Cloud: Spot instances
  - Sin CAPEX, flexible, alto costo operativo
\`\`\``,
      keyPoints: [
        'VRAM es limitante principal: 24GB corre 34B Q4, 40GB corre 70B Q4, 80GB corre 70B FP16',
        'CPU inference viable para 7-13B Q4 a 15-50 tok/s, GPU da 5-20x speedup',
        'Apple Silicon M1/M2/M3 excelente eficiencia: M1 Max ~50 tok/s con Llama-3-8B Q4',
        'Cloud GPU spot pricing reduce costos 50-70%: RunPod A100 ~$0.69/hr vs $3.67/hr on-demand',
        'Formula VRAM: (params_B * bits / 8) + overhead(20%) + KV_cache + workspace(2GB)'
      ],
    },
    {
      title: 'Modelos Open Source: Llama, Mistral, Qwen, DeepSeek',
      content: `El ecosistema open-source ha explotado en 2023-2024, con modelos que rivalizan o superan GPT-3.5 y se acercan a GPT-4 en tareas específicas. Elegir el modelo correcto para tu caso de uso maximiza performance y minimiza recursos.

**Llama Family (Meta)** es la familia más popular y ampliamente soportada. Llama 3 (Abril 2024) estableció nuevos estándares de calidad en open source.

**Llama 3 (8B, 70B, 405B)**:
- Arquitectura: Transformer decoder, GQA (Grouped Query Attention)
- Context: 8K tokens (extensible a 128K con fine-tuning)
- Tokenizer: 128K vocabulary (mejor para multilingüe que Llama 2)
- Performance: Llama-3-70B rivaliza GPT-3.5-Turbo
- Llama-3-405B se acerca a GPT-4 en benchmarks

\`\`\`python
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

# Llama 3 8B Instruct (chat-optimized)
model_id = "meta-llama/Meta-Llama-3-8B-Instruct"

tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(
    model_id,
    torch_dtype=torch.bfloat16,
    device_map="auto",
    load_in_4bit=True  # Quantización automática
)

# Chat template (importante para Instruct models)
messages = [
    {"role": "system", "content": "Eres un asistente útil."},
    {"role": "user", "content": "Explica física cuántica brevemente"}
]

input_ids = tokenizer.apply_chat_template(
    messages,
    add_generation_prompt=True,
    return_tensors="pt"
).to(model.device)

outputs = model.generate(
    input_ids,
    max_new_tokens=256,
    temperature=0.7,
    top_p=0.95,
    do_sample=True
)

response = tokenizer.decode(outputs[0][input_ids.shape[-1]:], skip_special_tokens=True)
print(response)
\`\`\`

**Mistral Family** (Mistral AI) ofrece modelos extremadamente eficientes con performance por parámetro excepcional.

**Mistral 7B v0.3**:
- Puntuación superior a Llama-2-13B en benchmarks
- 32K context window
- Excelente para fine-tuning
- Apache 2.0 license (permisivo)

**Mixtral 8x7B (Mixture of Experts)**:
- 8 expertos de 7B cada uno, solo 2 activos por token
- 47B parámetros totales, 13B activos (rápido)
- Performance cercana a GPT-3.5
- 32K context window

\`\`\`python
# Mixtral 8x7B con vLLM (óptimo)
from vllm import LLM, SamplingParams

llm = LLM(
    model="mistralai/Mixtral-8x7B-Instruct-v0.1",
    tensor_parallel_size=2,  # 2 GPUs recomendado
    gpu_memory_utilization=0.95
)

sampling = SamplingParams(temperature=0.7, top_p=0.95, max_tokens=200)

outputs = llm.generate([
    "Explica Mixture of Experts",
    "¿Por qué Mixtral es más rápido que modelos densos?"
], sampling)

for output in outputs:
    print(f"{output.outputs[0].text}\n")
\`\`\`

**Qwen Family** (Alibaba) destaca en multilingüe (chino, inglés) y tareas de código.

**Qwen2-72B**:
- Líder en benchmarks de código (CodeForces, HumanEval)
- Excelente soporte chino e inglés
- 128K context window
- Qwen2-VL para visión

**DeepSeek Family** (DeepSeek AI) ofrece modelos especializados en código y razonamiento.

**DeepSeek Coder V2 (16B, 236B)**:
- Top performance en código (supera GPT-3.5 en coding)
- Entrenado en 6TB de código
- Soporta 338 lenguajes de programación
- 128K context window

\`\`\`python
# DeepSeek Coder para code completion
from transformers import AutoModelForCausalLM, AutoTokenizer

model = AutoModelForCausalLM.from_pretrained(
    "deepseek-ai/deepseek-coder-6.7b-instruct",
    torch_dtype=torch.bfloat16,
    device_map="auto"
)
tokenizer = AutoTokenizer.from_pretrained("deepseek-ai/deepseek-coder-6.7b-instruct")

# Code completion
code_prompt = """# Función para ordenar lista de diccionarios por múltiples keys
def multi_key_sort(data, keys):
    \"\"\"
    Ordena lista de dicts por múltiples keys en orden de prioridad
    \"\"\"
"""

inputs = tokenizer(code_prompt, return_tensors="pt").to(model.device)
outputs = model.generate(**inputs, max_new_tokens=200, temperature=0.2)
print(tokenizer.decode(outputs[0]))
\`\`\`

**Selección por Caso de Uso**:

\`\`\`
Chat General / Asistente:
- Llama-3-8B/70B Instruct (mejor general purpose)
- Mistral-7B-Instruct (eficiente)

Código / Programming:
- DeepSeek-Coder-33B (máxima calidad)
- CodeLlama-34B (alternativa Meta)
- Qwen2-72B (fuerte en código)

Multilingüe (Chino/Inglés):
- Qwen2-72B (líder chino)
- Llama-3-70B (bueno español/inglés)

RAG / Embeddings:
- nomic-embed-text (embeddings 768-dim)
- bge-large-en-v1.5 (SOTA embeddings)

Efficiency / Edge:
- Mistral-7B (mejor performance/parámetro)
- Llama-3-8B (balance)
- Phi-3-mini (3.8B, sorprendentemente capaz)

Razonamiento / Math:
- Llama-3-70B (fuerte reasoning)
- DeepSeek-Math (especializado)

Licencias:
- Apache 2.0: Mistral, Qwen, DeepSeek (permisivo)
- Llama 3 Community License (restricciones <700M users)
\`\`\`

**Benchmarks Comparativos** (higher is better):

\`\`\`
MMLU (knowledge):
Llama-3-70B:     79.5
Mixtral-8x7B:    70.6
Qwen2-72B:       84.2
Llama-3-8B:      66.6
Mistral-7B:      62.5

HumanEval (code):
DeepSeek-Coder-33B:    79.3
Llama-3-70B:           62.2
Qwen2-72B:             64.6
CodeLlama-34B:         48.8

GSM8K (math):
Llama-3-70B:     93.0
Qwen2-72B:       91.1
Mixtral-8x7B:    74.4
Llama-3-8B:      79.6
\`\`\``,
      keyPoints: [
        'Llama-3-70B rivaliza GPT-3.5, Llama-3-405B se acerca a GPT-4 en benchmarks académicos',
        'Mixtral-8x7B usa MoE: 47B params totales, solo 13B activos, rápido con calidad GPT-3.5',
        'DeepSeek-Coder lidera en código con 79.3% HumanEval, Qwen2 destaca en multilingüe',
        'Elección depende del caso: Llama-3 general, DeepSeek código, Qwen multilingüe, Mistral eficiencia',
        'Licencias varían: Apache 2.0 (Mistral, Qwen, DeepSeek) es más permisivo que Llama 3'
      ],
    },
    {
      title: 'Deployment Patterns: Desktop, Mobile, Edge, Hybrid',
      content: `El deployment de modelos locales varía dramáticamente según el entorno objetivo. Cada patrón tiene trade-offs únicos de performance, recursos, y complejidad.

**Desktop Applications** embedding LLMs habilitan features de IA sin conectividad o costos recurrentes.

\`\`\`typescript
// Electron app con Ollama local
import { spawn } from 'child_process';
import axios from 'axios';

class LocalLLMService {
  private ollamaProcess: any;

  async startOllama() {
    // Iniciar Ollama como subprocess
    this.ollamaProcess = spawn('ollama', ['serve'], {
      stdio: 'pipe'
    });

    // Esperar a que esté listo
    await this.waitForReady();
  }

  async waitForReady() {
    for (let i = 0; i < 30; i++) {
      try {
        await axios.get('http://localhost:11434/api/tags');
        return;
      } catch {
        await new Promise(r => setTimeout(r, 1000));
      }
    }
    throw new Error('Ollama failed to start');
  }

  async chat(message: string): Promise<string> {
    const response = await axios.post('http://localhost:11434/api/chat', {
      model: 'llama3:8b',
      messages: [{ role: 'user', content: message }],
      stream: false
    });

    return response.data.message.content;
  }

  async dispose() {
    if (this.ollamaProcess) {
      this.ollamaProcess.kill();
    }
  }
}

// Uso en Electron
const llmService = new LocalLLMService();
await llmService.startOllama();

// Feature: Smart autocomplete
const suggestion = await llmService.chat(
  \`Given this code context:\\n\${codeContext}\\nSuggest next line:\`
);
\`\`\`

**Mobile Deployment** requiere modelos ultra-comprimidos y frameworks especializados.

\`\`\`kotlin
// Android con llama.cpp (JNI binding)
import com.github.llamacpp.LlamaAndroid

class LocalLLMHelper {
    private lateinit var model: LlamaAndroid

    fun initialize(context: Context) {
        // Copiar modelo de assets a internal storage
        val modelFile = File(context.filesDir, "model.gguf")
        if (!modelFile.exists()) {
            context.assets.open("llama-3-8b-Q3_K_M.gguf").use { input ->
                modelFile.outputStream().use { output ->
                    input.copyTo(output)
                }
            }
        }

        // Cargar modelo
        model = LlamaAndroid(
            modelPath = modelFile.absolutePath,
            nCtx = 2048,  // Context más pequeño para mobile
            nThreads = 4   // Ajustar por CPU cores
        )
    }

    suspend fun generate(prompt: String): String = withContext(Dispatchers.IO) {
        model.generate(
            prompt = prompt,
            maxTokens = 150,
            temperature = 0.7f
        )
    }
}

// iOS con llama.cpp (Swift)
import Foundation

class LocalLLM {
    private var modelPointer: OpaquePointer?

    func loadModel() {
        let modelPath = Bundle.main.path(forResource: "model", ofType: "gguf")!
        // Bindings a llama.cpp C API
        modelPointer = llama_load_model(modelPath, /* params */)
    }

    func generate(prompt: String, maxTokens: Int = 150) -> String {
        // Llamar a llama.cpp para generación
        // Implementación omitida por brevedad
        return ""
    }
}
\`\`\`

**Edge Devices** (Raspberry Pi, Jetson Nano, drones) requieren optimización extrema.

\`\`\`python
# Jetson Nano (4GB RAM) con TinyLlama
from llama_cpp import Llama

# TinyLlama-1.1B Q4 (solo ~600MB)
model = Llama(
    model_path="/models/tinyllama-1.1b-q4_k_m.gguf",
    n_ctx=512,  # Context corto para memoria limitada
    n_threads=4,
    n_gpu_layers=0,  # Jetson GPU support limitado para inferencia
    use_mlock=True,
    verbose=False
)

def edge_inference(prompt: str) -> str:
    """Inferencia optimizada para edge"""
    response = model(
        prompt,
        max_tokens=50,  # Respuestas cortas
        temperature=0.3,  # Menos aleatorio = más rápido
        top_p=0.9,
        repeat_penalty=1.1,
        stop=["\\n\\n", "User:", "Assistant:"]
    )
    return response['choices'][0]['text'].strip()

# Uso: clasificación local en drone
def classify_image_scene(image_description: str) -> str:
    prompt = f"Classify this scene in one word: {image_description}\\nCategory:"
    return edge_inference(prompt)
\`\`\`

**Hybrid Cloud-Local Pattern** combina lo mejor de ambos mundos: local para latencia/privacy, cloud para capacidad.

\`\`\`python
from typing import Optional
import asyncio

class HybridLLMService:
    def __init__(self):
        # Modelo local (rápido, privado)
        self.local_model = Llama(
            model_path="llama-3-8b-Q4_K_M.gguf",
            n_ctx=4096,
            n_gpu_layers=35
        )

        # Cliente cloud (potente, caro)
        self.cloud_client = OpenAI()

    async def generate(
        self,
        prompt: str,
        complexity: str = "auto",
        privacy_sensitive: bool = False
    ) -> str:
        """
        Enruta a local o cloud basado en complejidad y sensibilidad
        """

        # Siempre local si es privacy-sensitive
        if privacy_sensitive:
            return self._generate_local(prompt)

        # Auto-detectar complejidad
        if complexity == "auto":
            complexity = self._estimate_complexity(prompt)

        # Ruteo por complejidad
        if complexity == "simple":
            # Local es suficiente y más rápido
            return self._generate_local(prompt)
        elif complexity == "medium":
            # Intentar local primero, fallback a cloud
            try:
                result = self._generate_local(prompt, timeout=5)
                if self._quality_check(result):
                    return result
            except:
                pass
            return await self._generate_cloud(prompt)
        else:  # complex
            # Cloud directamente para máxima calidad
            return await self._generate_cloud(prompt)

    def _generate_local(self, prompt: str, timeout: Optional[int] = None) -> str:
        response = self.local_model(prompt, max_tokens=300)
        return response['choices'][0]['text']

    async def _generate_cloud(self, prompt: str) -> str:
        response = await self.cloud_client.chat.completions.create(
            model="gpt-4-turbo",
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content

    def _estimate_complexity(self, prompt: str) -> str:
        # Heurísticas simples
        if len(prompt) < 100 and "?" in prompt:
            return "simple"
        elif any(kw in prompt.lower() for kw in ["analyze", "explain", "compare"]):
            return "medium"
        elif any(kw in prompt.lower() for kw in ["write code", "detailed", "comprehensive"]):
            return "complex"
        return "medium"

    def _quality_check(self, response: str) -> bool:
        # Validación básica de calidad
        return len(response) > 50 and not response.startswith("I cannot")

# Uso
llm = HybridLLMService()

# Query simple: usa local (rápido, barato)
quick_answer = await llm.generate("What is 2+2?")

# Datos sensibles: fuerza local
private_result = await llm.generate(
    "Analiza este contrato: ...",
    privacy_sensitive=True
)

# Tarea compleja: usa cloud (calidad)
complex_result = await llm.generate(
    "Write a comprehensive marketing strategy",
    complexity="complex"
)
\`\`\`

**Serverless Edge Functions** (Cloudflare Workers, Vercel Edge) permiten deployment global con latencia mínima.

\`\`\`typescript
// Cloudflare Worker con modelo ONNX pequeño
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Modelo lightweight para clasificación
    const { input } = await request.json();

    // ONNX Runtime en edge
    const session = await env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
      prompt: input,
      max_tokens: 100
    });

    return new Response(JSON.stringify(session), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
\`\`\`

**Best Practices para Deployment**:
- **Model caching**: Precarga modelos al inicio, no por request
- **Batching**: Agrupa requests cuando posible (vLLM continuous batching)
- **Monitoring**: Track latencia, throughput, memoria, GPU utilization
- **Graceful degradation**: Fallback de local a cloud si necesario
- **Version management**: Mantén modelos versionados para rollbacks`,
      keyPoints: [
        'Desktop apps pueden embeber Ollama como subprocess para features offline de IA',
        'Mobile deployment requiere modelos Q3/Q4 <2GB (TinyLlama, Phi-3-mini) con llama.cpp bindings',
        'Hybrid cloud-local pattern optimiza costos: local para simple/privado, cloud para complejo',
        'Edge devices (Jetson, RPi) soportan modelos 1-3B quantizados con <1GB RAM',
        'Serverless edge (CF Workers) permite deployment global con latencia <100ms'
      ],
    },
  ],
};
