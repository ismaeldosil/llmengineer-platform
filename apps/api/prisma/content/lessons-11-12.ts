// @ts-nocheck
export const ragFundamentals = {
  sections: [
    {
      title: '¿Qué es RAG?',
      content: `**RAG (Retrieval Augmented Generation)** es una técnica que combina la generación de texto de los LLMs con la recuperación de información de fuentes externas. Esta arquitectura resuelve uno de los problemas más críticos de los modelos de lenguaje: la **limitación de conocimiento**.

**El Problema de Conocimiento Limitado**

Los LLMs tienen conocimiento congelado en el tiempo de su entrenamiento. Si entrenas GPT-4 en 2023, no conocerá eventos de 2024. Además, no tienen acceso a:
- Documentación interna de tu empresa
- Bases de datos privadas
- Información actualizada en tiempo real
- Contexto específico de tu dominio

**Arquitectura Básica de RAG**

El pipeline RAG consta de dos fases principales:

1. **Fase de Indexación** (offline):
   - Recopilar documentos de diversas fuentes
   - Dividir documentos en chunks (fragmentos)
   - Generar embeddings vectoriales para cada chunk
   - Almacenar embeddings en una base de datos vectorial

2. **Fase de Recuperación** (online):
   - Convertir la pregunta del usuario en embedding
   - Buscar los chunks más similares (top-k)
   - Construir un prompt con contexto recuperado
   - Generar respuesta usando el LLM

**Casos de Uso Reales**

RAG es fundamental en aplicaciones modernas:

- **Chatbots empresariales**: Consultas sobre políticas internas, procedimientos, documentación técnica
- **Asistentes de código**: GitHub Copilot usa RAG para recuperar código relevante del repositorio
- **Atención al cliente**: Respuestas basadas en historial de tickets, FAQs, y manuales de producto
- **Análisis legal**: Búsqueda de precedentes y documentos legales específicos
- **Investigación académica**: Recuperación de papers relevantes para responder preguntas científicas

**Ventajas de RAG**

✅ Actualización sin reentrenamiento: Agrega nuevos documentos sin cambiar el modelo
✅ Citación y verificabilidad: Puedes mostrar las fuentes de la información
✅ Reducción de alucinaciones: El modelo se basa en hechos recuperados
✅ Conocimiento especializado: Acceso a información de nicho o privada
✅ Costo-eficiencia: Más barato que fine-tuning para actualizar conocimiento

**Limitaciones**

⚠️ Dependencia de la calidad de recuperación: Si recuperas chunks irrelevantes, la respuesta será mala
⚠️ Latencia adicional: Cada consulta requiere búsqueda vectorial + generación
⚠️ Límite de contexto: Solo puedes incluir top-k documentos más relevantes
⚠️ Complejidad operacional: Requiere infraestructura de bases de datos vectoriales`,
      keyPoints: [
        'RAG combina recuperación de información con generación de LLMs para superar limitaciones de conocimiento',
        'Consta de dos fases: indexación offline (chunks + embeddings) y recuperación online (búsqueda + generación)',
        'Casos de uso: chatbots empresariales, asistentes de código, atención al cliente, análisis legal',
        'Ventajas: actualización sin reentrenamiento, citación de fuentes, reducción de alucinaciones',
        'Limitaciones: dependencia de calidad de recuperación, latencia adicional, límite de contexto'
      ],
    },
    {
      title: 'Embeddings y Vectores',
      content: `Los **embeddings** son la columna vertebral de RAG. Son representaciones numéricas densas que capturan el significado semántico de texto en un espacio vectorial de alta dimensión.

**¿Qué son los Embeddings?**

Un embedding es un vector de números flotantes que representa texto. Por ejemplo:

\`\`\`python
texto = "inteligencia artificial"
embedding = [0.023, -0.891, 0.445, ..., 0.234]  # Vector de 1536 dimensiones
\`\`\`

La magia está en que **textos con significados similares tienen embeddings cercanos** en el espacio vectorial. Por ejemplo:

- "gato" y "felino" → embeddings muy cercanos
- "gato" y "carbón" → embeddings muy lejanos

**Modelos de Embeddings**

Existen varios modelos de embeddings, cada uno con tradeoffs diferentes:

**OpenAI Embeddings**
- \`text-embedding-3-small\`: 1536 dimensiones, $0.02 / 1M tokens
- \`text-embedding-3-large\`: 3072 dimensiones, $0.13 / 1M tokens
- Ventaja: Alta calidad, fácil de usar
- Desventaja: Requiere API de pago, límites de rate

**Cohere Embeddings**
- \`embed-english-v3.0\`: Optimizado para inglés
- \`embed-multilingual-v3.0\`: Soporte multilenguaje
- Ventaja: Excelente para búsqueda, soporte de múltiples idiomas
- Desventaja: API de pago

**Modelos Open Source**
- \`sentence-transformers/all-MiniLM-L6-v2\`: 384 dimensiones, rápido
- \`BAAI/bge-large-en-v1.5\`: 1024 dimensiones, alta calidad
- \`intfloat/multilingual-e5-large\`: Multilenguaje
- Ventaja: Gratis, sin límites de rate, privacidad
- Desventaja: Requiere infraestructura propia, menor calidad que modelos comerciales

**Dimensionalidad**

La dimensionalidad afecta el rendimiento:
- **Más dimensiones** = Mayor capacidad de capturar matices semánticos, pero mayor costo de almacenamiento y búsqueda
- **Menos dimensiones** = Búsqueda más rápida, menor almacenamiento, pero menor precisión

**Similitud Coseno**

Para comparar embeddings, usamos **similitud coseno**, que mide el ángulo entre vectores:

\`\`\`python
import numpy as np

def cosine_similarity(vec1, vec2):
    dot_product = np.dot(vec1, vec2)
    norm1 = np.linalg.norm(vec1)
    norm2 = np.linalg.norm(vec2)
    return dot_product / (norm1 * norm2)

# Ejemplo
embedding_query = [0.1, 0.5, 0.3]
embedding_doc = [0.2, 0.4, 0.4]
similarity = cosine_similarity(embedding_query, embedding_doc)
# similarity ≈ 0.95 (muy similar)
\`\`\`

Similitud coseno varía de -1 (opuestos) a 1 (idénticos). En RAG, buscamos documentos con mayor similitud coseno a la query.

**Generación de Embeddings en Práctica**

\`\`\`python
from openai import OpenAI

client = OpenAI(api_key="tu-api-key")

def get_embedding(text: str, model="text-embedding-3-small"):
    text = text.replace("\\n", " ")
    response = client.embeddings.create(input=[text], model=model)
    return response.data[0].embedding

# Usar embeddings
query = "¿Qué es machine learning?"
docs = ["ML es un subcampo de IA", "Python es un lenguaje", "TensorFlow es una librería"]

query_emb = get_embedding(query)
doc_embs = [get_embedding(doc) for doc in docs]

# Calcular similitudes
similarities = [cosine_similarity(query_emb, doc_emb) for doc_emb in doc_embs]
# [0.89, 0.45, 0.67] → El primer doc es más relevante
\`\`\``,
      keyPoints: [
        'Embeddings son vectores numéricos que capturan significado semántico; textos similares tienen embeddings cercanos',
        'Modelos principales: OpenAI (alta calidad, API pago), Cohere (multilenguaje), open source (gratis, privado)',
        'Dimensionalidad afecta tradeoff entre precisión y rendimiento (384-3072 dimensiones típicamente)',
        'Similitud coseno mide ángulo entre vectores, usado para encontrar documentos relevantes',
        'En producción, elegir modelo según balance calidad/costo/latencia/privacidad'
      ],
    },
    {
      title: 'Bases de Datos Vectoriales',
      content: `Las **bases de datos vectoriales** son sistemas especializados en almacenar y buscar eficientemente embeddings de alta dimensión. A diferencia de bases de datos tradicionales que indexan valores exactos, las vectoriales indexan espacios continuos.

**¿Por qué bases de datos vectoriales?**

Imagina buscar entre 10 millones de documentos. Calcular similitud coseno entre tu query y todos los documentos tomaría minutos. Las DBs vectoriales usan **índices aproximados** para reducir búsquedas a milisegundos.

**Principales Bases de Datos Vectoriales**

**Pinecone** (Managed Cloud)
- **Ventajas**:
  - Completamente managed, sin infraestructura
  - Alta disponibilidad y escalabilidad automática
  - API simple y bien documentada
  - Soporte para metadata filtering
- **Desventajas**:
  - Solo cloud, no self-hosted
  - Pricing puede ser costoso a gran escala
  - Vendor lock-in
- **Uso típico**: Startups y empresas que prefieren SaaS

\`\`\`python
import pinecone

# Inicializar
pinecone.init(api_key="tu-key", environment="us-west1-gcp")
index = pinecone.Index("mi-indice")

# Insertar vectores
index.upsert(vectors=[
    ("id1", [0.1, 0.2, ...], {"text": "documento 1"}),
    ("id2", [0.3, 0.4, ...], {"text": "documento 2"})
])

# Buscar
results = index.query(vector=[0.15, 0.25, ...], top_k=5)
\`\`\`

**Weaviate** (Open Source + Cloud)
- **Ventajas**:
  - Open source, self-hosteable
  - Módulos integrados para vectorización automática
  - GraphQL API nativa
  - Soporte para búsqueda híbrida (vector + keyword)
- **Desventajas**:
  - Mayor complejidad de setup
  - Requiere más recursos de infraestructura
- **Uso típico**: Empresas que necesitan control total y privacidad

**Chroma** (Open Source, Embedding Database)
- **Ventajas**:
  - Super simple, ideal para desarrollo local
  - Almacenamiento en SQLite o DuckDB
  - Integración perfecta con LangChain
  - Sin dependencias pesadas
- **Desventajas**:
  - No optimizado para escala masiva (millones de vectores)
  - Funcionalidades limitadas comparado con Pinecone/Weaviate
- **Uso típico**: Prototipado rápido, aplicaciones pequeñas

\`\`\`python
import chromadb

client = chromadb.Client()
collection = client.create_collection("docs")

# Insertar con embeddings automáticos
collection.add(
    documents=["Este es el documento 1", "Este es el documento 2"],
    ids=["id1", "id2"]
)

# Buscar
results = collection.query(
    query_texts=["buscar algo relacionado"],
    n_results=5
)
\`\`\`

**pgvector** (PostgreSQL Extension)
- **Ventajas**:
  - Usa PostgreSQL existente, no nueva DB
  - Combina datos relacionales con vectores
  - ACID transactions, consistencia fuerte
  - Gratis y open source
- **Desventajas**:
  - Rendimiento inferior a DBs especializadas en escala masiva
  - Requiere tuning manual de PostgreSQL
- **Uso típico**: Empresas con stack PostgreSQL, datos relacionales + vectoriales

**Algoritmos de Indexación**

**HNSW (Hierarchical Navigable Small World)**
- Estructura de grafo jerárquico
- Búsqueda aproximada muy rápida (O(log n))
- Alta precisión (>95% recall)
- Usado por: Weaviate, Chroma, pgvector

**IVF (Inverted File Index)**
- Divide espacio vectorial en clusters
- Busca solo en clusters más cercanos
- Más rápido pero menor precisión que HNSW
- Usado por: Pinecone, FAISS

**Comparación de Opciones**

| DB | Tipo | Latencia (p95) | Escalabilidad | Costo | Mejor Para |
|---|---|---|---|---|---|
| Pinecone | Managed | <50ms | 1B+ vectores | $$ | SaaS, rápido deploy |
| Weaviate | Hybrid | <100ms | 100M+ vectores | $ | Control total, híbrido |
| Chroma | Local | <20ms | 10M vectores | Gratis | Desarrollo, prototipos |
| pgvector | Extension | <200ms | 10M vectores | Gratis | Stack PostgreSQL |

**Elección Práctica**

- **Prototipo/MVP**: Chroma (simplicidad)
- **Producción pequeña-mediana**: pgvector (aprovecha Postgres existente)
- **Producción a escala**: Pinecone (managed) o Weaviate (self-hosted)
- **Búsqueda híbrida**: Weaviate (soporte nativo)`,
      keyPoints: [
        'Bases de datos vectoriales indexan embeddings para búsqueda eficiente de similitud en milisegundos',
        'Pinecone: managed cloud, fácil setup, costoso; Weaviate: open source, híbrido, control total',
        'Chroma: ideal para prototipos, simple; pgvector: extensión PostgreSQL, combina relacional + vectorial',
        'Algoritmos de indexación: HNSW (alta precisión, rápido) vs IVF (más rápido, menor precisión)',
        'Elección depende de escala, presupuesto, necesidad de control, y stack tecnológico existente'
      ],
    },
    {
      title: 'Estrategias de Chunking',
      content: `El **chunking** es el proceso de dividir documentos grandes en fragmentos más pequeños para indexar en RAG. Es una de las decisiones más críticas que afecta directamente la calidad de recuperación.

**¿Por qué es importante el chunking?**

Los LLMs tienen límites de contexto. Si recuperas documentos enteros, desperdiciarás tokens en información irrelevante. Si los chunks son muy pequeños, perderás contexto. El chunking óptimo balancea:
- **Granularidad**: Capturar ideas completas sin ruido
- **Contexto**: Suficiente información para ser útil standalone
- **Límite de tokens**: Caber múltiples chunks en el prompt

**Estrategias de Chunking**

**1. Chunking por Tokens**

Divide texto cada N tokens usando el tokenizador del LLM:

\`\`\`python
import tiktoken

def chunk_by_tokens(text: str, chunk_size: int = 512, overlap: int = 50):
    encoding = tiktoken.encoding_for_model("gpt-4")
    tokens = encoding.encode(text)
    chunks = []

    for i in range(0, len(tokens), chunk_size - overlap):
        chunk_tokens = tokens[i:i + chunk_size]
        chunk_text = encoding.decode(chunk_tokens)
        chunks.append(chunk_text)

    return chunks

text = "Tu documento muy largo..."
chunks = chunk_by_tokens(text, chunk_size=512, overlap=50)
\`\`\`

**Ventajas**: Precisión exacta de tokens, control de costos
**Desventajas**: Puede cortar oraciones o ideas a la mitad

**2. Chunking por Caracteres**

Divide cada N caracteres, más simple pero menos preciso:

\`\`\`python
def chunk_by_chars(text: str, chunk_size: int = 1000, overlap: int = 200):
    chunks = []
    for i in range(0, len(text), chunk_size - overlap):
        chunks.append(text[i:i + chunk_size])
    return chunks
\`\`\`

**Ventajas**: Implementación simple, rápida
**Desventajas**: No respeta límites de tokens reales, puede cortar palabras

**3. Chunking Semántico**

Divide por unidades semánticas naturales (párrafos, oraciones, secciones):

\`\`\`python
from langchain.text_splitter import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    separators=["\\n\\n", "\\n", ". ", " ", ""]  # Prioridad de separadores
)

chunks = splitter.split_text(text)
\`\`\`

**Ventajas**: Respeta estructura natural del documento, chunks más coherentes
**Desventajas**: Chunks de tamaño variable, requiere más lógica

**4. Chunking Recursivo**

La estrategia más sofisticada: divide por separadores jerárquicos hasta alcanzar tamaño deseado.

\`\`\`python
def recursive_chunk(text: str, chunk_size: int, separators: list):
    if len(text) <= chunk_size:
        return [text]

    # Intentar dividir por el primer separador
    for separator in separators:
        if separator in text:
            parts = text.split(separator)
            chunks = []
            current_chunk = ""

            for part in parts:
                if len(current_chunk) + len(part) <= chunk_size:
                    current_chunk += part + separator
                else:
                    if current_chunk:
                        chunks.append(current_chunk)
                    current_chunk = part + separator

            if current_chunk:
                chunks.append(current_chunk)
            return chunks

    # Si no hay separadores, chunking forzado
    return [text[i:i+chunk_size] for i in range(0, len(text), chunk_size)]
\`\`\`

**Overlap (Solapamiento)**

El overlap evita perder contexto en los límites entre chunks:

\`\`\`
Chunk 1: "... context window es crucial para RAG. Los embeddings capturan..."
Chunk 2: "Los embeddings capturan significado semántico. Las bases de datos..."
         ^^^ Overlap de 50 tokens ^^^
\`\`\`

**Recomendaciones**:
- Overlap de 10-20% del chunk_size
- Evita duplicación excesiva (desperdicio de almacenamiento)
- Asegura continuidad de ideas entre chunks

**Tamaño Óptimo de Chunks**

No existe tamaño universal, depende del caso de uso:

| Tipo de Contenido | Chunk Size | Razón |
|---|---|---|
| Documentación técnica | 512-1024 tokens | Secciones completas, ejemplos de código |
| Artículos/blogs | 256-512 tokens | Párrafos coherentes |
| Conversaciones/chat | 100-200 tokens | Mensajes cortos, respuestas rápidas |
| Libros | 1000-2000 tokens | Contexto narrativo largo |
| FAQs | 50-100 tokens | Preguntas/respuestas concisas |

**Chunking Específico de Dominio**

Para código, usa separadores de sintaxis:

\`\`\`python
code_splitter = RecursiveCharacterTextSplitter.from_language(
    language="python",
    chunk_size=500,
    chunk_overlap=50
)
# Divide por clases, funciones, imports
\`\`\`

Para Markdown, respeta estructura de headers:

\`\`\`python
markdown_splitter = RecursiveCharacterTextSplitter(
    separators=["\\n## ", "\\n### ", "\\n\\n", "\\n", " "]
)
\`\`\`

**Evaluación de Chunking**

Métricas para evaluar tu estrategia:
- **Chunk coherence**: ¿Los chunks tienen sentido standalone?
- **Retrieval accuracy**: ¿Se recuperan chunks correctos para queries?
- **Context utilization**: ¿Qué % del chunk es relevante para la respuesta?`,
      keyPoints: [
        'Chunking divide documentos en fragmentos; crítico para calidad de RAG, balancea granularidad vs contexto',
        'Estrategias: por tokens (preciso), caracteres (simple), semántico (coherente), recursivo (sofisticado)',
        'Overlap de 10-20% evita pérdida de contexto en límites entre chunks',
        'Tamaño óptimo varía: 256-512 tokens para artículos, 512-1024 para docs técnicas, 100-200 para chat',
        'Chunking específico de dominio: separadores sintácticos para código, headers para Markdown'
      ],
    },
    {
      title: 'Implementando RAG Básico',
      content: `Vamos a implementar un sistema RAG completo desde cero usando LangChain, OpenAI, y Chroma. Este ejemplo es production-ready y cubre el pipeline end-to-end.

**1. Setup e Instalación**

\`\`\`bash
pip install langchain langchain-openai chromadb tiktoken pypdf
\`\`\`

**2. Carga y Procesamiento de Documentos**

\`\`\`python
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_openai import ChatOpenAI
from langchain.chains import RetrievalQA
import os

# Configurar API key
os.environ["OPENAI_API_KEY"] = "tu-api-key"

# Paso 1: Cargar documentos
def load_documents(file_path: str):
    if file_path.endswith('.pdf'):
        loader = PyPDFLoader(file_path)
    else:
        loader = TextLoader(file_path)

    documents = loader.load()
    print(f"Cargados {len(documents)} documentos")
    return documents

# Paso 2: Chunking
def chunk_documents(documents):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
        separators=["\\n\\n", "\\n", ". ", " ", ""]
    )

    chunks = text_splitter.split_documents(documents)
    print(f"Creados {len(chunks)} chunks")
    return chunks

# Cargar y procesar
docs = load_documents("tu_documento.pdf")
chunks = chunk_documents(docs)
\`\`\`

**3. Crear Vector Store**

\`\`\`python
# Paso 3: Generar embeddings y almacenar
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

vectorstore = Chroma.from_documents(
    documents=chunks,
    embedding=embeddings,
    persist_directory="./chroma_db"  # Persistencia local
)

print("Vector store creado y persistido")
\`\`\`

**4. Implementar Retrieval**

\`\`\`python
# Paso 4: Configurar retriever
retriever = vectorstore.as_retriever(
    search_type="similarity",
    search_kwargs={"k": 4}  # Top 4 chunks más relevantes
)

# Probar retrieval
query = "¿Qué es machine learning?"
docs = retriever.get_relevant_documents(query)

for i, doc in enumerate(docs):
    print(f"\\n--- Documento {i+1} ---")
    print(doc.page_content[:200])
\`\`\`

**5. Construcción de Prompt con Contexto**

\`\`\`python
from langchain.prompts import PromptTemplate

# Template personalizado
prompt_template = """Eres un asistente experto. Usa el siguiente contexto para responder la pregunta.
Si no sabes la respuesta basándote en el contexto, di "No tengo suficiente información".

Contexto:
{context}

Pregunta: {question}

Respuesta detallada:"""

PROMPT = PromptTemplate(
    template=prompt_template,
    input_variables=["context", "question"]
)
\`\`\`

**6. Chain Completo de RAG**

\`\`\`python
# Paso 5: Crear RAG chain
llm = ChatOpenAI(
    model="gpt-4",
    temperature=0  # Determinístico para respuestas factuales
)

qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",  # "stuff" pone todo el contexto en un prompt
    retriever=retriever,
    return_source_documents=True,
    chain_type_kwargs={"prompt": PROMPT}
)

# Hacer preguntas
def ask_question(question: str):
    result = qa_chain({"query": question})

    print(f"\\n**Pregunta:** {question}")
    print(f"\\n**Respuesta:** {result['result']}")
    print(f"\\n**Fuentes:** {len(result['source_documents'])} documentos")

    for i, doc in enumerate(result['source_documents']):
        print(f"  - Fuente {i+1}: {doc.metadata.get('source', 'Unknown')}")

    return result

# Ejemplo de uso
ask_question("¿Cuáles son las ventajas de usar RAG?")
\`\`\`

**7. RAG con Streaming (Respuestas en Tiempo Real)**

\`\`\`python
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler

# LLM con streaming
streaming_llm = ChatOpenAI(
    model="gpt-4",
    temperature=0,
    streaming=True,
    callbacks=[StreamingStdOutCallbackHandler()]
)

streaming_qa = RetrievalQA.from_chain_type(
    llm=streaming_llm,
    retriever=retriever,
    return_source_documents=True
)

# La respuesta se imprimirá token por token
streaming_qa({"query": "Explica embeddings en detalle"})
\`\`\`

**8. Agregar Metadata Filtering**

\`\`\`python
# Agregar metadata al indexar
chunks_with_metadata = []
for i, chunk in enumerate(chunks):
    chunk.metadata["chunk_id"] = i
    chunk.metadata["category"] = "documentation"
    chunks_with_metadata.append(chunk)

# Buscar con filtros
retriever_filtered = vectorstore.as_retriever(
    search_kwargs={
        "k": 4,
        "filter": {"category": "documentation"}
    }
)
\`\`\`

**Implementación en TypeScript (NestJS)**

\`\`\`typescript
import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import { ChromaClient } from 'chromadb';

@Injectable()
export class RagService {
  private openai: OpenAI;
  private chroma: ChromaClient;
  private collection: any;

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.chroma = new ChromaClient();
    this.initCollection();
  }

  async initCollection() {
    this.collection = await this.chroma.getOrCreateCollection({
      name: 'documents',
    });
  }

  async addDocuments(texts: string[]) {
    const embeddings = await Promise.all(
      texts.map(text => this.getEmbedding(text))
    );

    await this.collection.add({
      ids: texts.map((_, i) => \`doc_\${i}\`),
      embeddings,
      documents: texts,
    });
  }

  async query(question: string): Promise<string> {
    // 1. Generar embedding de la pregunta
    const queryEmbedding = await this.getEmbedding(question);

    // 2. Buscar documentos relevantes
    const results = await this.collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: 4,
    });

    const context = results.documents[0].join('\\n\\n');

    // 3. Generar respuesta con contexto
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Responde basándote únicamente en el contexto proporcionado.',
        },
        {
          role: 'user',
          content: \`Contexto: \${context}\\n\\nPregunta: \${question}\`,
        },
      ],
      temperature: 0,
    });

    return response.choices[0].message.content;
  }

  private async getEmbedding(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    return response.data[0].embedding;
  }
}
\`\`\``,
      keyPoints: [
        'Pipeline RAG completo: cargar docs → chunking → embeddings → vector store → retrieval → generación',
        'LangChain simplifica implementación con abstracciones: loaders, splitters, vectorstores, chains',
        'Retriever recupera top-k chunks más similares; chain combina contexto + LLM para respuesta',
        'Streaming permite respuestas en tiempo real token por token; metadata filtering refina búsqueda',
        'Implementación TypeScript/NestJS usa OpenAI API + ChromaDB para producción'
      ],
    },
    {
      title: 'Mejores Prácticas y Optimizaciones',
      content: `Implementar RAG es relativamente simple, pero hacerlo bien requiere atención a detalles críticos. Aquí están las mejores prácticas basadas en experiencia en producción.

**Errores Comunes**

**1. Chunks Demasiado Grandes o Pequeños**

❌ **Mal**: Chunks de 5000 tokens
- Problema: Desperdicias contexto con información irrelevante
- Solución: 500-1000 tokens máximo para la mayoría de casos

❌ **Mal**: Chunks de 50 tokens
- Problema: Fragmentas ideas incompletas, pierdes contexto
- Solución: Mínimo 200-300 tokens para coherencia

**2. No Incluir Metadata**

❌ **Mal**: Solo almacenar texto plano
\`\`\`python
vectorstore.add_texts(["texto sin metadata"])
\`\`\`

✅ **Bien**: Agregar metadata útil
\`\`\`python
vectorstore.add_texts(
    texts=["texto con metadata"],
    metadatas=[{
        "source": "documento.pdf",
        "page": 5,
        "section": "Introducción",
        "created_at": "2024-01-15",
        "author": "Juan Pérez"
    }]
)
\`\`\`

**3. Ignorar la Calidad de los Embeddings**

❌ **Mal**: Usar modelo de embeddings genérico para dominio técnico
- Problema: Embeddings no capturan jerga técnica específica
- Solución: Fine-tune embeddings o usa modelos domain-specific

**4. No Limpiar/Normalizar Texto**

❌ **Mal**: Indexar PDFs con texto corrupto, símbolos raros
\`\`\`python
text = "Capítulo[NULL] 1\\n\\n\\n\\n   Introducción   !!!!"  # Caracteres basura de PDF
\`\`\`

✅ **Bien**: Limpiar antes de indexar
\`\`\`python
import re

def clean_text(text: str) -> str:
    # Remover caracteres nulos y de control (ASCII 0-31 excepto tab/newline/cr)
    import string
    allowed = set(string.printable)
    text = ''.join(c for c in text if c in allowed)
    # Normalizar espacios
    text = re.sub(r'\\s+', ' ', text)
    # Remover puntuación excesiva
    text = re.sub(r'([!?.])\\1+', r'\\1', text)
    return text.strip()
\`\`\`

**5. No Validar Respuestas**

❌ **Mal**: Confiar ciegamente en respuestas del LLM
- Problema: Alucinaciones, respuestas fuera de contexto
- Solución: Implementar validación y citación

✅ **Bien**: Validar y citar fuentes
\`\`\`python
def validate_response(response: str, sources: list) -> dict:
    # Verificar que la respuesta menciona información de sources
    has_citation = any(keyword in response.lower()
                       for doc in sources
                       for keyword in doc.page_content.lower().split())

    return {
        "response": response,
        "validated": has_citation,
        "sources": [doc.metadata.get('source') for doc in sources],
        "confidence": "high" if has_citation else "low"
    }
\`\`\`

**Optimizaciones de Rendimiento**

**1. Caché de Embeddings**

Evita regenerar embeddings de queries frecuentes:

\`\`\`python
from functools import lru_cache

@lru_cache(maxsize=1000)
def get_embedding_cached(text: str):
    return openai.embeddings.create(
        model="text-embedding-3-small",
        input=text
    ).data[0].embedding
\`\`\`

**2. Batch Processing**

Procesa múltiples textos en batch para reducir llamadas a API:

\`\`\`python
def get_embeddings_batch(texts: list[str], batch_size: int = 100):
    embeddings = []
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i+batch_size]
        response = openai.embeddings.create(
            model="text-embedding-3-small",
            input=batch
        )
        embeddings.extend([d.embedding for d in response.data])
    return embeddings
\`\`\`

**3. Async Processing**

Paraleliza búsqueda vectorial y llamada al LLM:

\`\`\`python
import asyncio

async def rag_query_async(question: str):
    # Ejecutar búsqueda y preparación en paralelo
    retrieval_task = asyncio.create_task(retriever.aget_relevant_documents(question))

    # Mientras tanto, preparar otras cosas...
    docs = await retrieval_task

    # Generar respuesta
    response = await llm.agenerate([question])
    return response
\`\`\`

**4. Index Optimization**

Ajusta parámetros de índices para tu caso de uso:

\`\`\`python
# Para Chroma
vectorstore = Chroma.from_documents(
    documents=chunks,
    embedding=embeddings,
    collection_metadata={
        "hnsw:space": "cosine",
        "hnsw:M": 16,  # Conexiones por nodo (mayor = más preciso, más lento)
        "hnsw:ef_construction": 200,  # Calidad de construcción
        "hnsw:ef_search": 100  # Calidad de búsqueda
    }
)
\`\`\`

**Monitoreo y Debugging**

Implementa logging detallado:

\`\`\`python
import logging

logger = logging.getLogger(__name__)

def rag_with_logging(question: str):
    logger.info(f"Query: {question}")

    # Retrieval
    start = time.time()
    docs = retriever.get_relevant_documents(question)
    retrieval_time = time.time() - start
    logger.info(f"Retrieval: {retrieval_time:.2f}s, {len(docs)} docs")

    # Log de documentos recuperados
    for i, doc in enumerate(docs):
        logger.debug(f"Doc {i}: score={doc.metadata.get('score', 'N/A')}, "
                     f"source={doc.metadata.get('source', 'Unknown')}")

    # Generation
    start = time.time()
    response = qa_chain({"query": question})
    gen_time = time.time() - start
    logger.info(f"Generation: {gen_time:.2f}s")

    return response
\`\`\`

**Testing de RAG**

Crea casos de test con ground truth:

\`\`\`python
test_cases = [
    {
        "query": "¿Qué es RAG?",
        "expected_keywords": ["retrieval", "generation", "embeddings"],
        "expected_sources": ["rag_fundamentals.pdf"]
    },
    # Más casos...
]

def test_rag():
    for test in test_cases:
        result = qa_chain({"query": test["query"]})

        # Verificar keywords
        assert any(kw in result["result"].lower()
                   for kw in test["expected_keywords"])

        # Verificar fuentes
        sources = [doc.metadata["source"] for doc in result["source_documents"]]
        assert any(src in sources for src in test["expected_sources"])
\`\`\`

**Checklist de Producción**

✅ Chunking optimizado para tu dominio (tamaño, overlap, separadores)
✅ Metadata completo y estructurado
✅ Limpieza y normalización de texto
✅ Caché de embeddings frecuentes
✅ Batch processing de documentos grandes
✅ Validación de respuestas y citación de fuentes
✅ Logging detallado de retrieval y generation
✅ Tests automatizados con ground truth
✅ Monitoreo de latencia y costos
✅ Estrategia de actualización de índices`,
      keyPoints: [
        'Errores comunes: chunks mal dimensionados, falta de metadata, texto sin limpiar, no validar respuestas',
        'Optimizaciones: caché de embeddings, batch processing, async, ajuste de parámetros de índices',
        'Limpieza de texto crítica: remover caracteres nulos, normalizar espacios, validar encoding',
        'Monitoreo: logging detallado de retrieval/generation, tests con ground truth, métricas de latencia',
        'Checklist de producción: chunking optimizado, metadata, validación, caché, tests, monitoreo de costos'
      ],
    },
  ],
};

export const ragAdvanced = {
  sections: [
    {
      title: 'Hybrid Search: Vector + BM25',
      content: `**Hybrid Search** combina búsqueda vectorial (semántica) con búsqueda keyword (léxica) para lograr mejor recall y precisión. Cada método tiene fortalezas complementarias.

**Limitaciones de Búsqueda Puramente Vectorial**

La búsqueda vectorial falla en ciertos casos:
- **Nombres propios exactos**: "GPT-4" vs "GPT-3" son muy similares vectorialmente, pero diferentes
- **IDs y códigos**: "ERROR-404" vs "ERROR-500" requieren match exacto
- **Acrónimos**: "RAG" puede confundirse con vectores de "retrieval" genérico
- **Números específicos**: "2023" vs "2024" son casi idénticos vectorialmente

**BM25: Búsqueda Léxica**

**BM25 (Best Match 25)** es un algoritmo de ranking basado en frecuencia de términos:

La fórmula considera:
- **Term Frequency (TF)**: Cuántas veces aparece el término en el documento
- **Inverse Document Frequency (IDF)**: Qué tan raro es el término en todo el corpus
- **Document Length Normalization**: Penaliza documentos muy largos

\`\`\`python
from rank_bm25 import BM25Okapi

# Corpus de ejemplo
corpus = [
    "RAG combina retrieval con generation",
    "GPT-4 es un modelo de lenguaje avanzado",
    "BM25 es un algoritmo de búsqueda keyword"
]

# Tokenizar
tokenized_corpus = [doc.split() for doc in corpus]

# Crear índice BM25
bm25 = BM25Okapi(tokenized_corpus)

# Buscar
query = "GPT-4 modelo"
tokenized_query = query.split()
scores = bm25.get_scores(tokenized_query)

# Resultado: [0.0, 1.89, 0.0] → Segundo documento es más relevante
\`\`\`

**Combinando Vector + BM25**

\`\`\`python
from langchain.retrievers import EnsembleRetriever
from langchain_community.retrievers import BM25Retriever

# Retriever vectorial
vector_retriever = vectorstore.as_retriever(search_kwargs={"k": 10})

# Retriever BM25
bm25_retriever = BM25Retriever.from_documents(documents)
bm25_retriever.k = 10

# Ensemble: combina ambos
ensemble_retriever = EnsembleRetriever(
    retrievers=[vector_retriever, bm25_retriever],
    weights=[0.5, 0.5]  # Peso igual para ambos
)

# Buscar con híbrido
results = ensemble_retriever.get_relevant_documents("GPT-4 modelo avanzado")
\`\`\`

**Reciprocal Rank Fusion (RRF)**

RRF es el método estándar para combinar rankings de múltiples sistemas:

\`\`\`
RRF_score(doc) = Σ 1 / (k + rank_i(doc))
\`\`\`

Donde:
- \`k\` es constante (típicamente 60)
- \`rank_i(doc)\` es la posición del doc en el ranking i

**Ejemplo**:
\`\`\`
Vector ranking:     [doc_A, doc_B, doc_C]
BM25 ranking:       [doc_C, doc_A, doc_D]

RRF scores:
doc_A = 1/(60+1) + 1/(60+2) = 0.0164 + 0.0161 = 0.0325
doc_B = 1/(60+2) + 0         = 0.0161
doc_C = 1/(60+3) + 1/(60+1) = 0.0159 + 0.0164 = 0.0323
doc_D = 0        + 1/(60+3) = 0.0159

Final ranking: [doc_A, doc_C, doc_B, doc_D]
\`\`\`

**Implementación de RRF**

\`\`\`python
def reciprocal_rank_fusion(rankings: list[list], k: int = 60):
    """
    rankings: Lista de rankings, cada uno es lista de doc_ids ordenados
    """
    doc_scores = {}

    for ranking in rankings:
        for rank, doc_id in enumerate(ranking, start=1):
            if doc_id not in doc_scores:
                doc_scores[doc_id] = 0
            doc_scores[doc_id] += 1 / (k + rank)

    # Ordenar por score descendente
    sorted_docs = sorted(doc_scores.items(), key=lambda x: x[1], reverse=True)
    return [doc_id for doc_id, score in sorted_docs]

# Uso
vector_results = ["doc1", "doc2", "doc3"]
bm25_results = ["doc3", "doc1", "doc4"]
final_ranking = reciprocal_rank_fusion([vector_results, bm25_results])
# ['doc1', 'doc3', 'doc2', 'doc4']
\`\`\`

**¿Cuándo Usar Cada Método?**

| Método | Casos de Uso | Ventajas | Desventajas |
|---|---|---|---|
| Solo Vector | Búsqueda semántica, sinónimos, paráfrasis | Entiende significado | Falla en matches exactos |
| Solo BM25 | IDs, códigos, nombres propios, números | Match exacto, rápido | No entiende semántica |
| Híbrido (Vector+BM25) | Casos generales, producción | Mejor recall y precisión | Mayor complejidad |

**Ajuste de Pesos**

Los pesos óptimos dependen de tu caso de uso:

\`\`\`python
# Más peso a semántica (70% vector, 30% BM25)
ensemble_retriever = EnsembleRetriever(
    retrievers=[vector_retriever, bm25_retriever],
    weights=[0.7, 0.3]
)

# Más peso a keyword (30% vector, 70% BM25)
ensemble_retriever = EnsembleRetriever(
    retrievers=[vector_retriever, bm25_retriever],
    weights=[0.3, 0.7]
)
\`\`\`

**Evaluación**: Testa con queries reales y ajusta pesos según métricas.

**Hybrid Search en Weaviate**

Weaviate soporta búsqueda híbrida nativa:

\`\`\`python
import weaviate

client = weaviate.Client("http://localhost:8080")

result = client.query.get("Document", ["content", "metadata"]) \\
    .with_hybrid(
        query="GPT-4 modelo",
        alpha=0.5  # 0 = solo BM25, 1 = solo vector, 0.5 = híbrido
    ) \\
    .with_limit(5) \\
    .do()
\`\`\`

**Mejores Prácticas**

✅ Usa híbrido como default en producción (mejor cobertura)
✅ Ajusta pesos según tipo de queries (más vector para preguntas conceptuales, más BM25 para búsquedas factuales)
✅ Implementa RRF para combinar rankings de manera robusta
✅ Mide recall@k y precision@k para evaluar mejora sobre búsqueda simple
✅ Considera latencia: híbrido es ~1.5-2x más lento que vector solo`,
      keyPoints: [
        'Hybrid search combina búsqueda vectorial (semántica) con BM25 (keyword) para mejor recall y precisión',
        'Vector falla en nombres propios, IDs, números; BM25 falla en sinónimos y paráfrasis',
        'Reciprocal Rank Fusion (RRF) combina rankings con fórmula 1/(k+rank); estándar en industria',
        'Weaviate y otros vector DBs soportan híbrido nativo; ajusta parámetro alpha (0=BM25, 1=vector)',
        'Usar híbrido como default en producción; ajustar pesos según tipo de queries y métricas'
      ],
    },
    {
      title: 'Re-ranking: Refinando Resultados',
      content: `**Re-ranking** es una segunda etapa de ranking que refina los resultados de la búsqueda inicial. En lugar de retornar directamente los top-k de la búsqueda vectorial, pasas los candidatos por un modelo más sofisticado para reordenarlos.

**¿Por qué Re-ranking?**

La búsqueda vectorial usa **bi-encoders**: encodean query y documentos por separado, luego calculan similitud. Esto es rápido pero pierde información de interacción query-documento.

El re-ranking usa **cross-encoders**: procesan query y documento juntos, capturando interacciones finas. Mucho más preciso pero más lento.

**Pipeline típico**:
1. Búsqueda vectorial: Recupera top-100 candidatos (~50ms)
2. Re-ranking: Reordena top-100 a top-10 (~200ms)
3. LLM: Genera respuesta con top-10 (~2s)

**Bi-encoders vs Cross-encoders**

**Bi-encoder** (usado en búsqueda vectorial):
\`\`\`
Query    → Encoder → [0.1, 0.5, ...]  \\
                                       → Cosine Similarity → Score
Document → Encoder → [0.2, 0.4, ...]  /
\`\`\`

- Velocidad: Muy rápido (embeddings pre-computados)
- Precisión: Buena pero pierde matices
- Uso: Primera etapa de retrieval

**Cross-encoder** (usado en re-ranking):
\`\`\`
[Query, Document] → Encoder → Relevance Score (0-1)
\`\`\`

- Velocidad: Lento (procesa cada par query-doc)
- Precisión: Excelente (entiende relación query-doc)
- Uso: Segunda etapa de re-ranking

**Implementación con Sentence Transformers**

\`\`\`python
from sentence_transformers import CrossEncoder

# Cargar cross-encoder
reranker = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')

def rerank_documents(query: str, documents: list[str], top_k: int = 5):
    # Crear pares [query, doc]
    pairs = [[query, doc] for doc in documents]

    # Predecir relevancia scores
    scores = reranker.predict(pairs)

    # Ordenar por score descendente
    ranked_indices = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)

    # Retornar top-k
    return [documents[i] for i in ranked_indices[:top_k]]

# Uso
query = "¿Qué es machine learning?"
candidates = retriever.get_relevant_documents(query)  # top-100
reranked = rerank_documents(query, [doc.page_content for doc in candidates], top_k=5)
\`\`\`

**Cohere Rerank**

Cohere ofrece un endpoint de reranking API muy potente:

\`\`\`python
import cohere

co = cohere.Client("tu-api-key")

def rerank_with_cohere(query: str, documents: list[str], top_k: int = 5):
    response = co.rerank(
        model="rerank-english-v3.0",
        query=query,
        documents=documents,
        top_n=top_k
    )

    # Retornar documentos reordenados
    return [documents[result.index] for result in response.results]

# Uso
candidates = ["doc1", "doc2", "doc3", ..., "doc100"]
reranked = rerank_with_cohere(query, candidates, top_k=5)
\`\`\`

**Modelos de Reranking**

| Modelo | Tamaño | Latencia (100 docs) | Calidad | Costo |
|---|---|---|---|---|
| cross-encoder/ms-marco-TinyBERT-L-2-v2 | 17MB | ~100ms | ⭐⭐⭐ | Gratis |
| cross-encoder/ms-marco-MiniLM-L-6-v2 | 90MB | ~200ms | ⭐⭐⭐⭐ | Gratis |
| cohere/rerank-english-v3.0 | API | ~150ms | ⭐⭐⭐⭐⭐ | $2/1000 reqs |
| BAAI/bge-reranker-large | 560MB | ~500ms | ⭐⭐⭐⭐⭐ | Gratis |

**RAG Pipeline Completo con Reranking**

\`\`\`python
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import CohereRerank

# Retriever base (vector search)
base_retriever = vectorstore.as_retriever(search_kwargs={"k": 100})

# Compresor con reranking
compressor = CohereRerank(
    cohere_api_key="tu-key",
    model="rerank-english-v3.0",
    top_n=5
)

# Retriever con reranking
compression_retriever = ContextualCompressionRetriever(
    base_compressor=compressor,
    base_retriever=base_retriever
)

# Usar en RAG chain
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    retriever=compression_retriever  # ← Con reranking
)

result = qa_chain({"query": "¿Qué es RAG?"})
\`\`\`

**Tradeoffs: Latencia vs Precisión**

Re-ranking agrega latencia pero mejora calidad:

**Sin Reranking**:
- Latencia: ~50ms (solo vector search)
- Recall@5: 70%
- Total query time: ~2s

**Con Reranking**:
- Latencia: ~50ms (vector) + ~200ms (rerank) = ~250ms
- Recall@5: 85-90%
- Total query time: ~2.2s

**¿Vale la pena?** Depende:
- ✅ Usar reranking si: Precisión es crítica (legal, médico, financiero)
- ❌ Evitar si: Necesitas latencia ultra-baja (<100ms total)

**Optimizaciones de Reranking**

**1. Rerank solo top-k relevantes**
\`\`\`python
# En lugar de rerank 100 docs, rerank solo 20-30
base_retriever = vectorstore.as_retriever(search_kwargs={"k": 30})  # Menos docs
compressor = CohereRerank(top_n=5)
\`\`\`

**2. Caché de reranking**
\`\`\`python
from functools import lru_cache

@lru_cache(maxsize=1000)
def rerank_cached(query: str, docs_tuple: tuple):
    docs = list(docs_tuple)
    return rerank_with_cohere(query, docs)

# Convertir lista a tupla para caché
docs_tuple = tuple(documents)
reranked = rerank_cached(query, docs_tuple)
\`\`\`

**3. Batch reranking**
\`\`\`python
# Rerank múltiples queries en paralelo
queries = ["query1", "query2", "query3"]
all_candidates = [retrieve(q) for q in queries]

# Batch request a Cohere
results = co.rerank_batch(
    model="rerank-english-v3.0",
    queries=queries,
    documents_lists=all_candidates
)
\`\`\`

**Métricas de Evaluación**

Compara retrieval con y sin reranking:

\`\`\`python
from sklearn.metrics import ndcg_score

def evaluate_reranking(queries, ground_truth):
    results = {
        "without_reranking": [],
        "with_reranking": []
    }

    for query, relevant_docs in zip(queries, ground_truth):
        # Sin reranking
        base_results = base_retriever.get_relevant_documents(query)

        # Con reranking
        reranked_results = compression_retriever.get_relevant_documents(query)

        # Calcular NDCG@5
        results["without_reranking"].append(ndcg_score([relevant_docs], [base_results]))
        results["with_reranking"].append(ndcg_score([relevant_docs], [reranked_results]))

    print(f"NDCG sin reranking: {np.mean(results['without_reranking']):.3f}")
    print(f"NDCG con reranking: {np.mean(results['with_reranking']):.3f}")
\`\`\`

**Cuándo Usar Reranking**

✅ Casos críticos donde precisión > latencia (legal, médico, compliance)
✅ Cuando tienes presupuesto para APIs (Cohere) o compute (self-hosted)
✅ Si retrieval base tiene alto recall pero bajo precisión
✅ Queries complejas con múltiples conceptos

❌ Latencia crítica (<100ms total)
❌ Queries simples con match keyword exacto
❌ Presupuesto limitado (reranking API puede ser costoso)`,
      keyPoints: [
        'Re-ranking refina resultados de búsqueda inicial con cross-encoders (query+doc juntos) vs bi-encoders (separados)',
        'Pipeline típico: retrieval top-100 (~50ms) → rerank top-10 (~200ms) → LLM genera (~2s)',
        'Cohere Rerank API: alta calidad, $2/1000 reqs; modelos open source: gratis pero requieren infra',
        'Tradeoff latencia vs precisión: reranking mejora recall@5 de 70% a 85-90% pero suma ~200ms',
        'Usar reranking en casos críticos (legal, médico); evitar si latencia ultra-baja es prioritaria'
      ],
    },
    {
      title: 'Query Expansion & Transformation',
      content: `Las técnicas de **Query Expansion** y **Query Transformation** mejoran la recuperación al reformular o expandir la pregunta original antes de buscar en la base de datos vectorial.

**El Problema: Queries Subóptimas**

Los usuarios a menudo hacen preguntas vagas, ambiguas, o que no matchean bien con cómo está escrita la documentación:

- Usuario: "cómo funciona?"
- Sistema: ¿Cómo funciona qué? → Mala recuperación

- Usuario: "setup de proyecto"
- Docs usan: "configuración inicial" → Miss semántico

**HyDE: Hypothetical Document Embeddings**

HyDE genera un **documento hipotético** que respondería la pregunta, luego busca con ese documento en lugar de la query original.

**Intuición**: Es más fácil encontrar documentos similares a un documento que a una pregunta.

\`\`\`python
from langchain.chains import HypotheticalDocumentEmbedder
from langchain_openai import OpenAI, OpenAIEmbeddings

# LLM para generar documento hipotético
llm = OpenAI(temperature=0.7)

# Embeddings base
base_embeddings = OpenAIEmbeddings()

# HyDE embeddings
hyde_embeddings = HypotheticalDocumentEmbedder.from_llm(
    llm=llm,
    base_embeddings=base_embeddings,
    prompt_key="web_search"  # Template para generar docs
)

# Usar en vectorstore
vectorstore = Chroma.from_documents(
    documents=docs,
    embedding=hyde_embeddings  # ← Usa HyDE
)

# Ahora las búsquedas automáticamente usan HyDE
results = vectorstore.similarity_search("¿Qué es RAG?")
\`\`\`

**Ejemplo de HyDE en acción**:
\`\`\`
Query original: "¿Qué es RAG?"

Documento hipotético generado:
"RAG (Retrieval Augmented Generation) es una técnica que combina
la recuperación de información con modelos generativos. Funciona
recuperando documentos relevantes de una base de datos vectorial
y luego usando esos documentos como contexto para generar
respuestas más precisas y basadas en hechos..."

→ Búsqueda con este documento hipotético matchea mejor con docs reales
\`\`\`

**Query Decomposition**

Divide queries complejas en sub-queries más simples:

\`\`\`python
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate

# Template para descomponer query
decompose_template = """Divide la siguiente pregunta compleja en 2-3 preguntas más simples:

Pregunta: {question}

Preguntas simples (una por línea):"""

decompose_prompt = PromptTemplate(
    template=decompose_template,
    input_variables=["question"]
)

decompose_chain = LLMChain(llm=llm, prompt=decompose_prompt)

# Descomponer
complex_query = "¿Cuáles son las ventajas de RAG comparado con fine-tuning y cuándo debería usar cada uno?"

subqueries = decompose_chain.run(complex_query).strip().split("\\n")
# ["¿Cuáles son las ventajas de RAG?",
#  "¿Cuáles son las ventajas de fine-tuning?",
#  "¿Cuándo usar RAG vs fine-tuning?"]

# Buscar para cada subquery
all_results = []
for subquery in subqueries:
    results = vectorstore.similarity_search(subquery, k=3)
    all_results.extend(results)

# Deduplicar y usar los mejores documentos
unique_docs = list({doc.page_content: doc for doc in all_results}.values())
\`\`\`

**Multi-Query Retrieval**

Genera múltiples variaciones de la query original para capturar diferentes perspectivas:

\`\`\`python
from langchain.retrievers.multi_query import MultiQueryRetriever

# Retriever base
base_retriever = vectorstore.as_retriever()

# Multi-query retriever
multi_query_retriever = MultiQueryRetriever.from_llm(
    retriever=base_retriever,
    llm=llm
)

# Internamente genera 3-5 variaciones de la query
# Query original: "¿Qué es RAG?"
# Variaciones generadas:
# - "Explica RAG en machine learning"
# - "Cómo funciona Retrieval Augmented Generation"
# - "Definición de RAG en NLP"
# - "Qué significa RAG en contexto de LLMs"

results = multi_query_retriever.get_relevant_documents("¿Qué es RAG?")
# Retorna docs únicos de todas las variaciones
\`\`\`

**Step-Back Prompting**

Genera una pregunta más general (step back) antes de la específica:

\`\`\`python
stepback_template = """Genera una pregunta más general que ayude a responder esta pregunta específica:

Pregunta específica: {question}

Pregunta general:"""

def stepback_retrieval(question: str):
    # Generar pregunta general
    general_q = llm.predict(stepback_template.format(question=question))

    # Buscar para pregunta general (contexto amplio)
    general_docs = vectorstore.similarity_search(general_q, k=3)

    # Buscar para pregunta específica
    specific_docs = vectorstore.similarity_search(question, k=3)

    # Combinar: contexto general + específico
    return general_docs + specific_docs

# Ejemplo
question = "¿Cómo optimizar índices HNSW en Weaviate para latencia sub-100ms?"
# Step-back: "¿Cómo funcionan los índices HNSW en bases de datos vectoriales?"
# → Recupera contexto general sobre HNSW + docs específicos de optimización
\`\`\`

**Query Rewriting**

Reescribe la query en un formato más efectivo para búsqueda:

\`\`\`python
rewrite_template = """Reescribe esta pregunta para que sea más efectiva en búsqueda semántica.
Incluye términos técnicos relevantes y reformula de manera clara.

Pregunta original: {question}

Pregunta optimizada:"""

def rewrite_query(question: str):
    return llm.predict(rewrite_template.format(question=question))

# Ejemplo
original = "cómo hacer que vaya más rápido"
rewritten = rewrite_query(original)
# "¿Cómo optimizar el rendimiento y reducir la latencia del sistema?"
\`\`\`

**Implementación Completa: Multi-Strategy Retrieval**

\`\`\`typescript
import { OpenAI } from 'openai';
import { ChromaClient } from 'chromadb';

class AdvancedRetriever {
  private openai: OpenAI;
  private chroma: ChromaClient;
  private collection: any;

  async queryWithStrategies(
    question: string,
    strategies: ('direct' | 'hyde' | 'multi' | 'stepback')[]
  ): Promise<string[]> {
    const allDocs = new Set<string>();

    for (const strategy of strategies) {
      let docs: string[] = [];

      switch (strategy) {
        case 'direct':
          docs = await this.directSearch(question);
          break;
        case 'hyde':
          docs = await this.hydeSearch(question);
          break;
        case 'multi':
          docs = await this.multiQuerySearch(question);
          break;
        case 'stepback':
          docs = await this.stepbackSearch(question);
          break;
      }

      docs.forEach(doc => allDocs.add(doc));
    }

    return Array.from(allDocs);
  }

  private async hydeSearch(question: string): Promise<string[]> {
    // Generar documento hipotético
    const hypotheticalDoc = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Genera un documento que respondería esta pregunta.',
        },
        { role: 'user', content: question },
      ],
    });

    const doc = hypotheticalDoc.choices[0].message.content;

    // Buscar con documento hipotético
    const embedding = await this.getEmbedding(doc);
    const results = await this.collection.query({
      queryEmbeddings: [embedding],
      nResults: 5,
    });

    return results.documents[0];
  }

  private async multiQuerySearch(question: string): Promise<string[]> {
    // Generar variaciones
    const variations = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Genera 3 variaciones de esta pregunta.',
        },
        { role: 'user', content: question },
      ],
    });

    const queries = variations.choices[0].message.content.split('\\n');

    // Buscar para cada variación
    const allResults = await Promise.all(
      queries.map(async q => {
        const emb = await this.getEmbedding(q);
        const res = await this.collection.query({
          queryEmbeddings: [emb],
          nResults: 3,
        });
        return res.documents[0];
      })
    );

    return allResults.flat();
  }
}
\`\`\`

**Comparación de Técnicas**

| Técnica | Mejor Para | Latencia | Mejora Recall |
|---|---|---|---|
| HyDE | Queries conceptuales | +1s (1 LLM call) | +15-20% |
| Query Decomposition | Preguntas multi-parte | +1s | +10-15% |
| Multi-Query | Queries ambiguas | +1s | +20-25% |
| Step-Back | Preguntas técnicas específicas | +500ms | +10-15% |
| Query Rewriting | Queries mal formuladas | +500ms | +5-10% |

**Mejores Prácticas**

✅ Combina múltiples estrategias para queries complejas
✅ Usa HyDE para preguntas conceptuales donde la semántica es clave
✅ Implementa multi-query como default (mejor recall con latencia tolerable)
✅ Cachea queries expandidas para usuarios frecuentes
✅ Mide impacto en latencia vs mejora en calidad antes de deploy`,
      keyPoints: [
        'Query expansion mejora recuperación reformulando queries antes de búsqueda vectorial',
        'HyDE genera documento hipotético que respondería la query; busca con ese doc (mejor match semántico)',
        'Query decomposition divide queries complejas en sub-queries; multi-query genera variaciones',
        'Step-back prompting genera pregunta general + específica para contexto amplio + detallado',
        'Tradeoff: +500ms-1s latencia pero +10-25% recall; combinar estrategias para queries complejas'
      ],
    },
    {
      title: 'Evaluación de RAG: Métricas y Frameworks',
      content: `Evaluar sistemas RAG es crítico pero complejo. No puedes solo medir precisión de clasificación. Necesitas evaluar tanto la **calidad de recuperación** como la **calidad de generación**.

**Componentes a Evaluar**

Un sistema RAG tiene dos etapas críticas:
1. **Retrieval**: ¿Se recuperaron los documentos correctos?
2. **Generation**: ¿La respuesta es precisa, fiel al contexto, y útil?

**Métricas de Retrieval**

**1. Recall@k**
¿Qué proporción de documentos relevantes están en los top-k resultados?

\`\`\`python
def recall_at_k(retrieved_docs: list, relevant_docs: list, k: int = 5):
    top_k = retrieved_docs[:k]
    relevant_retrieved = len(set(top_k) & set(relevant_docs))
    return relevant_retrieved / len(relevant_docs)

# Ejemplo
retrieved = ["doc1", "doc2", "doc3", "doc4", "doc5"]
relevant = ["doc2", "doc5", "doc7"]
recall = recall_at_k(retrieved, relevant, k=5)
# 2/3 = 0.667 (recuperó 2 de 3 relevantes)
\`\`\`

**2. Precision@k**
¿Qué proporción de los top-k resultados son relevantes?

\`\`\`python
def precision_at_k(retrieved_docs: list, relevant_docs: list, k: int = 5):
    top_k = retrieved_docs[:k]
    relevant_retrieved = len(set(top_k) & set(relevant_docs))
    return relevant_retrieved / k

# precision = 2/5 = 0.4 (2 de 5 recuperados son relevantes)
\`\`\`

**3. MRR (Mean Reciprocal Rank)**
Posición promedio del primer documento relevante:

\`\`\`python
def mrr(retrieved_docs: list, relevant_docs: list):
    for i, doc in enumerate(retrieved_docs, start=1):
        if doc in relevant_docs:
            return 1 / i
    return 0

# Si primer relevante está en posición 3: MRR = 1/3 = 0.333
\`\`\`

**4. NDCG (Normalized Discounted Cumulative Gain)**
Considera tanto relevancia como posición (penaliza relevantes en posiciones bajas):

\`\`\`python
from sklearn.metrics import ndcg_score

# Relevancia real (0 o 1)
true_relevance = [1, 0, 1, 0, 0]  # doc1 y doc3 son relevantes

# Scores predichos (por tu sistema)
predicted_scores = [0.9, 0.7, 0.85, 0.6, 0.5]

ndcg = ndcg_score([true_relevance], [predicted_scores])
# Valor entre 0-1, más alto es mejor
\`\`\`

**Métricas de Generation**

**1. Faithfulness (Fidelidad)**
¿La respuesta está basada en el contexto recuperado sin alucinar?

\`\`\`python
faithfulness_prompt = """Evalúa si la respuesta está completamente basada en el contexto.
Responde solo: "Fiel" o "Infiel"

Contexto: {context}

Respuesta: {answer}

Evaluación:"""

def evaluate_faithfulness(context: str, answer: str):
    evaluation = llm.predict(faithfulness_prompt.format(
        context=context,
        answer=answer
    ))
    return 1.0 if "Fiel" in evaluation else 0.0
\`\`\`

**2. Answer Relevance (Relevancia de Respuesta)**
¿La respuesta realmente responde la pregunta del usuario?

\`\`\`python
relevance_prompt = """Evalúa si la respuesta responde directamente la pregunta.
Puntaje de 1-5 donde 5 es perfectamente relevante.

Pregunta: {question}

Respuesta: {answer}

Puntaje:"""

def evaluate_relevance(question: str, answer: str):
    score = llm.predict(relevance_prompt.format(
        question=question,
        answer=answer
    ))
    return int(score.strip()) / 5.0  # Normalizar a 0-1
\`\`\`

**3. Context Relevance (Relevancia de Contexto)**
¿Los chunks recuperados son relevantes para la pregunta?

\`\`\`python
context_relevance_prompt = """¿Este contexto es útil para responder la pregunta?
Responde con puntaje 1-5.

Pregunta: {question}

Contexto: {context}

Puntaje:"""

def evaluate_context_relevance(question: str, context: str):
    score = llm.predict(context_relevance_prompt.format(
        question=question,
        context=context
    ))
    return int(score.strip()) / 5.0
\`\`\`

**RAGAS Framework**

**RAGAS** (Retrieval Augmented Generation Assessment) es el framework estándar para evaluar RAG:

\`\`\`bash
pip install ragas
\`\`\`

\`\`\`python
from ragas import evaluate
from ragas.metrics import (
    faithfulness,
    answer_relevancy,
    context_relevancy,
    context_recall,
)
from datasets import Dataset

# Preparar dataset de evaluación
data = {
    "question": ["¿Qué es RAG?", "¿Cómo funcionan embeddings?"],
    "answer": ["RAG combina retrieval con generation...", "Embeddings son vectores..."],
    "contexts": [
        ["RAG es una técnica...", "Los embeddings se usan..."],
        ["Vectores numéricos...", "Similitud coseno..."]
    ],
    "ground_truths": [
        "RAG combina recuperación con generación de LLMs",
        "Embeddings son representaciones vectoriales de texto"
    ]
}

dataset = Dataset.from_dict(data)

# Evaluar
result = evaluate(
    dataset,
    metrics=[
        faithfulness,
        answer_relevancy,
        context_relevancy,
        context_recall,
    ],
)

print(result)
# {
#   'faithfulness': 0.92,
#   'answer_relevancy': 0.87,
#   'context_relevancy': 0.89,
#   'context_recall': 0.85
# }
\`\`\`

**Creación de Dataset de Evaluación**

Necesitas crear un dataset con queries, ground truth, y documentos relevantes:

\`\`\`python
evaluation_dataset = [
    {
        "query": "¿Qué es RAG?",
        "ground_truth": "RAG combina retrieval de información con generación de LLMs para responder preguntas con contexto actualizado",
        "relevant_docs": ["doc_101", "doc_203"],
        "context": "...",  # Contexto esperado
    },
    # 50-100 ejemplos mínimo
]

# Puedes generar sintéticamente con LLM
def generate_eval_dataset(documents: list):
    dataset = []
    for doc in documents[:100]:  # Sample
        # Generar pregunta sobre el doc
        question = llm.predict(f"Genera una pregunta sobre: {doc.page_content}")

        # Generar respuesta ground truth
        answer = llm.predict(f"Responde: {question}\\nContexto: {doc.page_content}")

        dataset.append({
            "query": question,
            "ground_truth": answer,
            "relevant_docs": [doc.metadata["id"]],
        })

    return dataset
\`\`\`

**Métricas End-to-End**

Evalúa el sistema completo:

\`\`\`python
def evaluate_rag_system(test_queries: list, qa_chain):
    results = {
        "faithfulness": [],
        "relevance": [],
        "retrieval_recall": [],
    }

    for query_data in test_queries:
        # Ejecutar RAG
        result = qa_chain({
            "query": query_data["query"]
        })

        # Evaluar retrieval
        retrieved_ids = [doc.metadata["id"] for doc in result["source_documents"]]
        recall = recall_at_k(retrieved_ids, query_data["relevant_docs"], k=5)
        results["retrieval_recall"].append(recall)

        # Evaluar generation
        context = "\\n".join([doc.page_content for doc in result["source_documents"]])
        faithfulness_score = evaluate_faithfulness(context, result["result"])
        results["faithfulness"].append(faithfulness_score)

        relevance_score = evaluate_relevance(query_data["query"], result["result"])
        results["relevance"].append(relevance_score)

    # Promedios
    return {
        metric: np.mean(scores)
        for metric, scores in results.items()
    }

# Correr evaluación
metrics = evaluate_rag_system(evaluation_dataset, qa_chain)
print(f"Retrieval Recall@5: {metrics['retrieval_recall']:.2%}")
print(f"Faithfulness: {metrics['faithfulness']:.2%}")
print(f"Answer Relevance: {metrics['relevance']:.2%}")
\`\`\`

**A/B Testing de RAG**

Compara dos configuraciones:

\`\`\`python
# Configuración A: chunk_size=500
rag_a = build_rag(chunk_size=500)

# Configuración B: chunk_size=1000
rag_b = build_rag(chunk_size=1000)

# Evaluar ambas
metrics_a = evaluate_rag_system(test_queries, rag_a)
metrics_b = evaluate_rag_system(test_queries, rag_b)

# Comparar
print("Config A (chunk=500):", metrics_a)
print("Config B (chunk=1000):", metrics_b)

# Decidir ganador
if metrics_b["faithfulness"] > metrics_a["faithfulness"]:
    print("Config B gana en faithfulness")
\`\`\`

**Mejores Prácticas**

✅ Crea dataset de evaluación de 50-100 queries representativas
✅ Usa RAGAS para métricas estándar (faithfulness, relevance, recall)
✅ Evalúa retrieval Y generation por separado (debugging más fácil)
✅ A/B test cambios en chunking, embeddings, prompts antes de deploy
✅ Monitorea métricas en producción con feedback de usuarios
✅ Actualiza dataset de evaluación con queries reales problemáticas`,
      keyPoints: [
        'Evaluar RAG requiere métricas de retrieval (recall@k, precision, NDCG) y generation (faithfulness, relevance)',
        'RAGAS framework estándar para evaluación automática con LLM-as-Judge',
        'Dataset de evaluación necesita queries, ground truth, documentos relevantes; 50-100 ejemplos mínimo',
        'Evaluar retrieval y generation por separado para debugging eficiente',
        'A/B testing de configuraciones (chunk size, embeddings, prompts) antes de deploy a producción'
      ],
    },
    {
      title: 'RAG en Producción: Optimización y Monitoreo',
      content: `Llevar RAG a producción requiere optimizaciones de rendimiento, escalabilidad, y observabilidad robusta. Aquí están las mejores prácticas de ingeniería.

**Optimización de Pipelines**

**1. Embedding Caching**

Cachea embeddings de documentos y queries frecuentes:

\`\`\`python
import redis
import pickle

class EmbeddingCache:
    def __init__(self):
        self.redis = redis.Redis(host='localhost', port=6379, db=0)
        self.ttl = 86400  # 24 horas

    def get_embedding(self, text: str, model: str):
        key = f"emb:{model}:{hash(text)}"
        cached = self.redis.get(key)

        if cached:
            return pickle.loads(cached)

        # Generar embedding
        embedding = generate_embedding(text, model)

        # Cachear
        self.redis.setex(key, self.ttl, pickle.dumps(embedding))
        return embedding

cache = EmbeddingCache()

# Uso
embedding = cache.get_embedding("query text", "text-embedding-3-small")
# Segunda llamada con mismo texto → cache hit (1-2ms vs 50-100ms)
\`\`\`

**2. Batch Processing**

Procesa embeddings en batch para reducir overhead:

\`\`\`python
async def index_documents_batch(documents: list[str], batch_size: int = 100):
    embeddings = []

    for i in range(0, len(documents), batch_size):
        batch = documents[i:i+batch_size]

        # Generar embeddings en paralelo
        batch_embeddings = await asyncio.gather(*[
            get_embedding_async(doc) for doc in batch
        ])

        embeddings.extend(batch_embeddings)

        # Insertar batch en vectorstore
        vectorstore.add_embeddings(
            texts=batch,
            embeddings=batch_embeddings
        )

        print(f"Processed {i+len(batch)}/{len(documents)}")

    return embeddings
\`\`\`

**3. Incremental Indexing**

Actualiza índice sin rebuilds completos:

\`\`\`python
class IncrementalVectorStore:
    def __init__(self, vectorstore):
        self.vectorstore = vectorstore
        self.indexed_ids = set()

    def add_new_documents(self, documents: list):
        # Filtrar documentos ya indexados
        new_docs = [
            doc for doc in documents
            if doc.metadata["id"] not in self.indexed_ids
        ]

        if not new_docs:
            return

        # Indexar solo nuevos
        self.vectorstore.add_documents(new_docs)

        # Actualizar tracking
        self.indexed_ids.update(doc.metadata["id"] for doc in new_docs)

        print(f"Indexed {len(new_docs)} new documents")

    def update_document(self, doc_id: str, new_content: str):
        # Eliminar viejo
        self.vectorstore.delete([doc_id])

        # Agregar actualizado
        self.vectorstore.add_documents([Document(
            page_content=new_content,
            metadata={"id": doc_id}
        )])
\`\`\`

**Scaling RAG**

**Arquitectura Distribuida**

\`\`\`
┌─────────────┐
│   Load      │
│  Balancer   │
└─────┬───────┘
      │
      ├───────────────┬───────────────┐
      │               │               │
┌─────▼─────┐  ┌─────▼─────┐  ┌─────▼─────┐
│ RAG API 1 │  │ RAG API 2 │  │ RAG API 3 │
└─────┬─────┘  └─────┬─────┘  └─────┬─────┘
      │               │               │
      └───────────────┴───────────────┘
                      │
            ┌─────────▼──────────┐
            │ Vector DB Cluster  │
            │  (Weaviate/Pinecone)│
            └────────────────────┘
\`\`\`

**Implementación NestJS**

\`\`\`typescript
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class RagService {
  constructor(
    @InjectQueue('rag-processing') private ragQueue: Queue,
  ) {}

  async queryAsync(question: string): Promise<string> {
    // Agregar a cola para procesamiento asíncrono
    const job = await this.ragQueue.add('query', {
      question,
      timestamp: Date.now(),
    });

    // Retornar job ID para polling
    return job.id;
  }

  async getJobResult(jobId: string) {
    const job = await this.ragQueue.getJob(jobId);

    if (!job) {
      throw new Error('Job not found');
    }

    if (await job.isCompleted()) {
      return {
        status: 'completed',
        result: job.returnvalue,
      };
    }

    if (await job.isFailed()) {
      return {
        status: 'failed',
        error: job.failedReason,
      };
    }

    return {
      status: 'processing',
    };
  }
}

// Worker
@Processor('rag-processing')
export class RagProcessor {
  @Process('query')
  async processQuery(job: Job) {
    const { question } = job.data;

    // Ejecutar RAG
    const result = await this.ragService.query(question);

    return result;
  }
}
\`\`\`

**Monitoreo y Observabilidad**

**1. Métricas Clave**

\`\`\`python
from prometheus_client import Counter, Histogram, Gauge
import time

# Contadores
rag_requests_total = Counter('rag_requests_total', 'Total RAG requests')
rag_requests_failed = Counter('rag_requests_failed', 'Failed RAG requests')

# Histogramas (latencia)
retrieval_latency = Histogram('retrieval_latency_seconds', 'Retrieval latency')
generation_latency = Histogram('generation_latency_seconds', 'Generation latency')
total_latency = Histogram('rag_total_latency_seconds', 'Total RAG latency')

# Gauges (estado actual)
active_requests = Gauge('rag_active_requests', 'Currently active requests')

def monitored_rag_query(question: str):
    rag_requests_total.inc()
    active_requests.inc()

    start = time.time()

    try:
        # Retrieval
        retrieval_start = time.time()
        docs = retriever.get_relevant_documents(question)
        retrieval_latency.observe(time.time() - retrieval_start)

        # Generation
        gen_start = time.time()
        response = llm.generate(docs, question)
        generation_latency.observe(time.time() - gen_start)

        total_latency.observe(time.time() - start)

        return response

    except Exception as e:
        rag_requests_failed.inc()
        raise
    finally:
        active_requests.dec()
\`\`\`

**2. Logging Estructurado**

\`\`\`python
import logging
import json

logger = logging.getLogger(__name__)

def rag_query_with_logging(question: str, user_id: str):
    request_id = str(uuid.uuid4())

    logger.info(json.dumps({
        "event": "rag_query_start",
        "request_id": request_id,
        "user_id": user_id,
        "question_length": len(question),
        "timestamp": datetime.utcnow().isoformat()
    }))

    # Retrieval
    docs = retriever.get_relevant_documents(question)

    logger.info(json.dumps({
        "event": "retrieval_complete",
        "request_id": request_id,
        "num_docs": len(docs),
        "doc_ids": [doc.metadata["id"] for doc in docs]
    }))

    # Generation
    response = llm.generate(docs, question)

    logger.info(json.dumps({
        "event": "rag_query_complete",
        "request_id": request_id,
        "response_length": len(response),
        "total_time": time.time() - start
    }))

    return response
\`\`\`

**3. Distributed Tracing**

\`\`\`python
from opentelemetry import trace
from opentelemetry.instrumentation.requests import RequestsInstrumentor

tracer = trace.get_tracer(__name__)

def traced_rag_query(question: str):
    with tracer.start_as_current_span("rag_query") as span:
        span.set_attribute("question.length", len(question))

        # Retrieval span
        with tracer.start_as_current_span("retrieval"):
            docs = retriever.get_relevant_documents(question)
            span.set_attribute("docs.count", len(docs))

        # Embedding span
        with tracer.start_as_current_span("embedding"):
            query_emb = get_embedding(question)

        # Generation span
        with tracer.start_as_current_span("generation"):
            response = llm.generate(docs, question)
            span.set_attribute("response.length", len(response))

        return response
\`\`\`

**Debugging de RAG**

**1. Inspección de Retrieval**

\`\`\`python
def debug_retrieval(question: str):
    # Buscar
    docs = retriever.get_relevant_documents(question)

    # Generar embedding de query
    query_emb = get_embedding(question)

    # Analizar cada documento
    for i, doc in enumerate(docs):
        doc_emb = get_embedding(doc.page_content)
        similarity = cosine_similarity([query_emb], [doc_emb])[0][0]

        print(f"\\n=== Document {i+1} ===")
        print(f"Similarity: {similarity:.3f}")
        print(f"Source: {doc.metadata.get('source', 'Unknown')}")
        print(f"Content preview: {doc.page_content[:200]}...")

        # Explicar por qué se recuperó
        common_words = set(question.lower().split()) & set(doc.page_content.lower().split())
        print(f"Common keywords: {common_words}")
\`\`\`

**2. Response Validation**

\`\`\`python
def validate_rag_response(question: str, response: str, docs: list):
    issues = []

    # Check 1: Respuesta vacía
    if not response.strip():
        issues.append("Empty response")

    # Check 2: Respuesta muy corta
    if len(response) < 50:
        issues.append("Response too short")

    # Check 3: No cita el contexto
    context_keywords = set()
    for doc in docs:
        context_keywords.update(doc.page_content.lower().split())

    response_words = set(response.lower().split())
    overlap = len(context_keywords & response_words)

    if overlap < 5:
        issues.append("Low context overlap")

    # Check 4: Frases de alucinación
    hallucination_phrases = [
        "no tengo información",
        "no puedo responder",
        "según mis conocimientos"
    ]

    if any(phrase in response.lower() for phrase in hallucination_phrases):
        issues.append("Possible hallucination indicators")

    return {
        "valid": len(issues) == 0,
        "issues": issues,
        "context_overlap": overlap
    }
\`\`\`

**Checklist de Producción**

✅ Caché de embeddings con Redis/Memcached
✅ Batch processing de indexación
✅ Índices incrementales para actualizaciones
✅ Load balancing de APIs RAG
✅ Queue system para requests asíncronos (Bull, Celery)
✅ Monitoreo con Prometheus + Grafana
✅ Logging estructurado (JSON)
✅ Distributed tracing (OpenTelemetry)
✅ Alertas de latencia y errores
✅ Debugging tools para inspeccionar retrieval`,
      keyPoints: [
        'Optimizaciones críticas: caché de embeddings (Redis), batch processing, indexación incremental',
        'Scaling: arquitectura distribuida con load balancer, workers asíncronos (Bull/Celery), vector DB cluster',
        'Monitoreo: métricas Prometheus (latencia, errores, requests activos), logging estructurado JSON',
        'Observabilidad: distributed tracing con OpenTelemetry para debug de retrieval/generation',
        'Debugging: inspección de similitud coseno, validación de respuestas, detección de alucinaciones'
      ],
    },
  ],
};
