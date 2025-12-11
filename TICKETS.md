# Sistema Completo de Tickets - LLM Engineer Platform

> Total: 72 tickets organizados en 12 epics

---

## Índice de Epics

| Epic | Tickets | Descripción |
|------|---------|-------------|
| AUTH | 8 | Autenticación y sesiones |
| USERS | 6 | Gestión de usuarios |
| LESSONS | 14 | Sistema de lecciones |
| QUIZ | 6 | Sistema de quizzes |
| GAMIFICATION | 12 | XP, niveles, badges, streaks |
| LEADERBOARD | 5 | Rankings y competencia |
| GAMES | 10 | Mini-juegos educativos |
| DASHBOARD | 4 | Pantalla principal |
| PROFILE | 5 | Perfil de usuario |
| INFRA | 8 | Infraestructura y DevOps |
| TESTING | 6 | Tests y calidad |
| CONTENT | 4 | Gestión de contenido |

---

# EPIC: AUTH (Autenticación)

## AUTH-001: API de registro de usuarios
**Labels:** `epic:auth`, `priority:critical`, `size:M`, `api`

### Descripción
Implementar endpoint POST /api/auth/register para crear nuevos usuarios.

### Tareas
- [ ] DTO de validación (RegisterDto)
- [ ] Verificar email único
- [ ] Hash de password con bcrypt (10 rounds)
- [ ] Crear usuario en DB
- [ ] Crear UserProgress inicial (nivel 1, 0 XP)
- [ ] Generar JWT token
- [ ] Retornar user + accessToken

### Criterios de Aceptación
- [ ] Email debe ser válido y único
- [ ] Password mínimo 6 caracteres
- [ ] displayName entre 2-50 caracteres
- [ ] Token JWT válido por 7 días
- [ ] UserProgress creado con valores iniciales

### Tests Requeridos
```typescript
describe('AuthService.register', () => {
  it('should create user with hashed password')
  it('should return JWT token')
  it('should create initial progress')
  it('should reject duplicate email')
  it('should validate password length')
})
```

### Agente: `api-developer`

---

## AUTH-002: API de login
**Labels:** `epic:auth`, `priority:critical`, `size:S`, `api`

### Descripción
Implementar endpoint POST /api/auth/login para autenticar usuarios.

### Tareas
- [ ] DTO de validación (LoginDto)
- [ ] Buscar usuario por email
- [ ] Comparar password con bcrypt
- [ ] Generar JWT token
- [ ] Actualizar lastActiveAt

### Criterios de Aceptación
- [ ] Login exitoso retorna user + accessToken
- [ ] Credenciales inválidas retornan 401
- [ ] Respuesta no incluye password

### Agente: `api-developer`

---

## AUTH-003: JWT Strategy y Guards
**Labels:** `epic:auth`, `priority:critical`, `size:M`, `api`

### Descripción
Implementar estrategia JWT de Passport y guards de autenticación.

### Tareas
- [ ] Configurar JwtModule con secret desde env
- [ ] Implementar JwtStrategy
- [ ] Crear JwtAuthGuard
- [ ] Crear decorador @CurrentUser()
- [ ] Manejar token expirado (401)

### Criterios de Aceptación
- [ ] Rutas protegidas requieren Bearer token
- [ ] Token inválido retorna 401
- [ ] @CurrentUser() extrae usuario del request

### Agente: `api-developer`

---

## AUTH-004: Pantalla de Login
**Labels:** `epic:auth`, `priority:critical`, `size:M`, `frontend`

### Descripción
Crear UI de login con validaciones y manejo de errores.

### Tareas
- [ ] Formulario con email y password
- [ ] Validación client-side en tiempo real
- [ ] Mostrar/ocultar password
- [ ] Botón de submit con loading state
- [ ] Integración con useLoginMutation
- [ ] Guardar token en Redux
- [ ] Redirect a /dashboard en éxito
- [ ] Mostrar errores de API

### Diseño
- Input de email con validación
- Input de password con toggle visibility
- Botón "Iniciar Sesión" azul
- Link a registro
- Fondo oscuro (#111827)

### Agente: `frontend-developer`

---

## AUTH-005: Pantalla de Registro
**Labels:** `epic:auth`, `priority:critical`, `size:M`, `frontend`

### Descripción
Crear UI de registro con validaciones completas.

### Tareas
- [ ] Formulario con displayName, email, password, confirmPassword
- [ ] Validación de passwords coincidentes
- [ ] Indicador de fortaleza de password
- [ ] Integración con useRegisterMutation
- [ ] Manejo de errores (email duplicado)
- [ ] Redirect a /dashboard en éxito

### Agente: `frontend-developer`

---

## AUTH-006: Persistencia de Sesión
**Labels:** `epic:auth`, `priority:high`, `size:M`, `frontend`

### Descripción
Persistir token y restaurar sesión al recargar la app.

### Tareas
- [ ] Guardar token en AsyncStorage/localStorage
- [ ] Verificar token al iniciar app
- [ ] Llamar a /users/me para validar sesión
- [ ] Mostrar splash/loading mientras verifica
- [ ] Limpiar storage en logout
- [ ] Manejar token expirado

### Criterios de Aceptación
- [ ] Usuario permanece logueado al refrescar
- [ ] Token inválido redirige a login
- [ ] Loading state mientras verifica

### Agente: `frontend-developer`

---

## AUTH-007: Logout y Limpieza de Sesión
**Labels:** `epic:auth`, `priority:high`, `size:S`, `frontend`

### Descripción
Implementar logout completo con limpieza de estado.

### Tareas
- [ ] Acción logout en authSlice
- [ ] Limpiar AsyncStorage
- [ ] Resetear RTK Query cache
- [ ] Redirect a pantalla inicial
- [ ] Confirmación opcional

### Agente: `frontend-developer`

---

## AUTH-008: Protección de Rutas
**Labels:** `epic:auth`, `priority:high`, `size:S`, `frontend`

### Descripción
Implementar redirección automática para rutas protegidas.

### Tareas
- [ ] HOC o layout para rutas protegidas
- [ ] Verificar isAuthenticated en Redux
- [ ] Redirect a /auth/login si no autenticado
- [ ] Redirect a /dashboard si ya autenticado (en /auth/*)

### Agente: `frontend-developer`

---

# EPIC: USERS (Usuarios)

## USERS-001: API Get Current User
**Labels:** `epic:users`, `priority:high`, `size:S`, `api`

### Descripción
Endpoint GET /api/users/me para obtener usuario actual.

### Tareas
- [ ] Proteger con JwtAuthGuard
- [ ] Retornar datos del usuario (sin password)
- [ ] Incluir fecha de creación

### Agente: `api-developer`

---

## USERS-002: API Get User Progress
**Labels:** `epic:users`, `priority:high`, `size:M`, `api`

### Descripción
Endpoint GET /api/users/me/progress para obtener progreso.

### Tareas
- [ ] Query de UserProgress
- [ ] Incluir badges ganados
- [ ] Calcular XP para siguiente nivel
- [ ] Incluir estadísticas de lecciones

### Respuesta Esperada
```json
{
  "totalXp": 1250,
  "level": 3,
  "levelTitle": "Token Tinkerer",
  "xpForNextLevel": 1500,
  "currentStreak": 5,
  "longestStreak": 12,
  "lessonsCompleted": 8,
  "badges": [...]
}
```

### Agente: `api-developer`

---

## USERS-003: API Update User Profile
**Labels:** `epic:users`, `priority:medium`, `size:S`, `api`

### Descripción
Endpoint PATCH /api/users/me para actualizar perfil.

### Tareas
- [ ] Permitir actualizar displayName
- [ ] Validar longitud de displayName
- [ ] No permitir cambiar email (v1)

### Agente: `api-developer`

---

## USERS-004: API Get User Stats
**Labels:** `epic:users`, `priority:medium`, `size:M`, `api`

### Descripción
Endpoint GET /api/users/me/stats para estadísticas detalladas.

### Tareas
- [ ] Total de tiempo de estudio
- [ ] Lecciones por semana
- [ ] Promedio de quizzes
- [ ] Historial de XP por día

### Agente: `api-developer`

---

## USERS-005: Servicio de Niveles
**Labels:** `epic:users`, `priority:high`, `size:M`, `api`

### Descripción
Implementar lógica de cálculo de niveles y títulos.

### Tareas
- [ ] Función calculateLevel(xp) - 500 XP por nivel
- [ ] Función getLevelTitle(level) - 10 títulos
- [ ] Función getXpForNextLevel(currentXp)
- [ ] Función getXpProgressPercent(currentXp)

### Niveles y Títulos
| Nivel | XP Requerido | Título |
|-------|--------------|--------|
| 1 | 0 | Prompt Curious |
| 2 | 500 | Prompt Apprentice |
| 3 | 1000 | Token Tinkerer |
| 4 | 1500 | Context Crafter |
| 5 | 2000 | Embedding Explorer |
| 6 | 2500 | RAG Rookie |
| 7 | 3000 | Vector Voyager |
| 8 | 3500 | Pipeline Pioneer |
| 9 | 4000 | Agent Architect |
| 10 | 4500 | LLM Engineer |

### Agente: `api-developer`

---

## USERS-006: Servicio de Agregar XP
**Labels:** `epic:users`, `priority:high`, `size:M`, `api`

### Descripción
Implementar método addXp con actualización de nivel.

### Tareas
- [ ] Incrementar totalXp
- [ ] Recalcular nivel
- [ ] Actualizar levelTitle si cambió
- [ ] Retornar si hubo level up
- [ ] Trigger checkBadges

### Respuesta
```typescript
interface AddXpResult {
  newTotalXp: number;
  xpAdded: number;
  leveledUp: boolean;
  newLevel?: number;
  newTitle?: string;
}
```

### Agente: `api-developer`

---

# EPIC: LESSONS (Lecciones)

## LESSONS-001: Modelo y Schema de Lesson
**Labels:** `epic:lessons`, `priority:critical`, `size:S`, `api`

### Descripción
Definir modelo Prisma para lecciones.

### Schema
```prisma
model Lesson {
  id               String   @id @default(cuid())
  slug             String   @unique
  title            String
  description      String
  week             Int
  order            Int
  difficulty       Difficulty
  xpReward         Int      @default(100)
  estimatedMinutes Int      @default(15)
  sections         Json     @default("[]")
  isPublished      Boolean  @default(false)

  completions LessonCompletion[]

  @@unique([week, order])
}
```

### Agente: `api-developer`

---

## LESSONS-002: API Listar Lecciones
**Labels:** `epic:lessons`, `priority:critical`, `size:M`, `api`

### Descripción
Endpoint GET /api/lessons para obtener todas las lecciones.

### Tareas
- [ ] Query lecciones donde isPublished = true
- [ ] Ordenar por week ASC, order ASC
- [ ] Join con completions del usuario
- [ ] Agregar campo isCompleted por lección
- [ ] Calcular progreso por semana

### Respuesta
```json
{
  "lessons": [...],
  "weekProgress": {
    "1": { "completed": 3, "total": 5 },
    "2": { "completed": 0, "total": 4 }
  }
}
```

### Agente: `api-developer`

---

## LESSONS-003: API Detalle de Lección
**Labels:** `epic:lessons`, `priority:critical`, `size:S`, `api`

### Descripción
Endpoint GET /api/lessons/:id para obtener detalle.

### Tareas
- [ ] Buscar lección por ID o slug
- [ ] Incluir todas las secciones
- [ ] Verificar si usuario la completó
- [ ] Incluir quiz si existe

### Agente: `api-developer`

---

## LESSONS-004: API Completar Lección
**Labels:** `epic:lessons`, `priority:critical`, `size:L`, `api`

### Descripción
Endpoint POST /api/lessons/:id/complete para marcar completada.

### Tareas
- [ ] Validar que lección existe
- [ ] Verificar no completada previamente
- [ ] Crear LessonCompletion
- [ ] Calcular XP (base + bonos)
- [ ] Llamar addXp del usuario
- [ ] Incrementar lessonsCompleted
- [ ] Verificar badges de completación
- [ ] Verificar si completó semana

### Request Body
```json
{
  "timeSpentSeconds": 420,
  "quizScore": 80
}
```

### Response
```json
{
  "xpEarned": 125,
  "bonuses": [
    { "type": "speed", "xp": 25 }
  ],
  "leveledUp": false,
  "newBadges": [],
  "weekCompleted": false
}
```

### Agente: `api-developer`

---

## LESSONS-005: Cálculo de XP de Lección
**Labels:** `epic:lessons`, `priority:high`, `size:M`, `api`

### Descripción
Implementar sistema de cálculo de XP con bonificaciones.

### Fórmulas
```
XP Base = lesson.xpReward (100-200)

Bonus Velocidad:
- Si tiempo < 80% estimado: +25 XP
- Si tiempo > 150% estimado: -0 XP (sin penalización)

Bonus Quiz:
- 100%: +50 XP
- 90%+: +25 XP
- 70%+: +10 XP

Bonus Racha:
- 3+ días: x1.1
- 7+ días: x1.2
- 14+ días: x1.3
- 30+ días: x1.5
```

### Agente: `api-developer`

---

## LESSONS-006: Pantalla Lista de Lecciones
**Labels:** `epic:lessons`, `priority:critical`, `size:L`, `frontend`

### Descripción
UI para ver todas las lecciones organizadas por semana.

### Tareas
- [ ] Fetch con useGetLessonsQuery
- [ ] Agrupar lecciones por semana
- [ ] Sección colapsable por semana
- [ ] Mostrar progreso de semana (3/5)
- [ ] LessonCard con estado visual
- [ ] Indicador de dificultad (color)
- [ ] Mostrar XP reward
- [ ] Navegación a detalle

### Componentes
- WeekSection (colapsable)
- LessonCard (título, desc, XP, dificultad, estado)
- ProgressIndicator (circular)

### Agente: `frontend-developer`

---

## LESSONS-007: Pantalla Detalle de Lección
**Labels:** `epic:lessons`, `priority:critical`, `size:XL`, `frontend`

### Descripción
UI para ver y completar una lección.

### Tareas
- [ ] Header con título, semana, XP
- [ ] Navegación entre secciones
- [ ] Renderizar markdown/texto
- [ ] Bloques de código con syntax highlighting
- [ ] Botón "Siguiente Sección"
- [ ] Tracker de tiempo (para XP)
- [ ] Botón "Completar Lección"
- [ ] Modal de quiz si existe
- [ ] Animación de XP ganado

### Estados
- Leyendo secciones
- Respondiendo quiz
- Completada (mostrar resumen)

### Agente: `frontend-developer`

---

## LESSONS-008: Componente CodeBlock
**Labels:** `epic:lessons`, `priority:high`, `size:M`, `frontend`

### Descripción
Componente para mostrar código con syntax highlighting.

### Tareas
- [ ] Integrar react-syntax-highlighter o similar
- [ ] Tema oscuro (github-dark o similar)
- [ ] Botón de copiar código
- [ ] Indicador de lenguaje
- [ ] Números de línea opcionales

### Props
```typescript
interface CodeBlockProps {
  code: string;
  language: 'python' | 'typescript' | 'bash' | 'json';
  showLineNumbers?: boolean;
  highlightLines?: number[];
}
```

### Agente: `frontend-developer`

---

## LESSONS-009: Sistema de Secciones de Lección
**Labels:** `epic:lessons`, `priority:high`, `size:M`, `frontend`

### Descripción
Navegación y progreso dentro de una lección.

### Tareas
- [ ] Estado local de sección actual
- [ ] Barra de progreso de secciones
- [ ] Botones prev/next
- [ ] Marcar secciones como leídas
- [ ] Scroll suave entre secciones
- [ ] Indicador de sección actual

### Agente: `frontend-developer`

---

## LESSONS-010: Animación de XP Ganado
**Labels:** `epic:lessons`, `priority:medium`, `size:M`, `frontend`

### Descripción
Animación celebratoria al completar lección.

### Tareas
- [ ] Modal/overlay de celebración
- [ ] Contador animado de XP
- [ ] Desglose de bonificaciones
- [ ] Mostrar nuevo nivel si aplica
- [ ] Confetti o partículas
- [ ] Botón "Continuar"

### Librerías sugeridas
- react-native-reanimated
- lottie-react-native (opcional)

### Agente: `frontend-developer`

---

## LESSONS-011: Carga de Contenido desde JSON
**Labels:** `epic:lessons`, `priority:high`, `size:M`, `api`

### Descripción
Cargar contenido de lecciones desde llmengineer-content.

### Tareas
- [ ] Script de sincronización
- [ ] Parsear JSON de lecciones
- [ ] Validar estructura
- [ ] Insertar/actualizar en DB
- [ ] Comando npm run content:sync

### Agente: `api-developer`

---

## LESSONS-012: API Lecciones por Semana
**Labels:** `epic:lessons`, `priority:medium`, `size:S`, `api`

### Descripción
Endpoint GET /api/lessons/week/:week para filtrar por semana.

### Agente: `api-developer`

---

## LESSONS-013: Siguiente Lección Recomendada
**Labels:** `epic:lessons`, `priority:medium`, `size:M`, `api`

### Descripción
Endpoint GET /api/lessons/next para obtener siguiente lección.

### Lógica
1. Buscar primera lección no completada
2. Ordenar por semana, luego por orden
3. Si completó todas, retornar null

### Agente: `api-developer`

---

## LESSONS-014: Widget de Próxima Lección
**Labels:** `epic:lessons`, `priority:medium`, `size:M`, `frontend`

### Descripción
Card en dashboard mostrando siguiente lección.

### Tareas
- [ ] Fetch de siguiente lección
- [ ] Card con preview
- [ ] Botón "Continuar"
- [ ] Estado vacío si completó todo

### Agente: `frontend-developer`

---

# EPIC: QUIZ (Sistema de Quizzes)

## QUIZ-001: Modelo de Quiz
**Labels:** `epic:quiz`, `priority:high`, `size:S`, `api`

### Descripción
Estructura de datos para quizzes en lecciones.

### Estructura (dentro de Lesson.sections JSON)
```json
{
  "quiz": {
    "passingScore": 70,
    "questions": [
      {
        "id": "q1",
        "type": "multiple_choice",
        "question": "¿Qué es...?",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": 2,
        "explanation": "..."
      },
      {
        "id": "q2",
        "type": "true_false",
        "question": "Los LLMs...",
        "correctAnswer": true,
        "explanation": "..."
      },
      {
        "id": "q3",
        "type": "code_completion",
        "question": "Completa el código:",
        "codeTemplate": "def hello():\n  ____",
        "correctAnswer": "print('hello')",
        "explanation": "..."
      }
    ]
  }
}
```

### Agente: `api-developer`

---

## QUIZ-002: API Evaluar Quiz
**Labels:** `epic:quiz`, `priority:high`, `size:M`, `api`

### Descripción
Endpoint POST /api/lessons/:id/quiz para evaluar respuestas.

### Request
```json
{
  "answers": {
    "q1": 2,
    "q2": true,
    "q3": "print('hello')"
  }
}
```

### Response
```json
{
  "score": 100,
  "passed": true,
  "results": [
    { "questionId": "q1", "correct": true, "explanation": "..." }
  ],
  "xpBonus": 50
}
```

### Agente: `api-developer`

---

## QUIZ-003: Componente Quiz Modal
**Labels:** `epic:quiz`, `priority:high`, `size:L`, `frontend`

### Descripción
Modal para responder quiz al final de lección.

### Tareas
- [ ] Modal fullscreen
- [ ] Progreso de preguntas (1/5)
- [ ] Renderizar según tipo de pregunta
- [ ] Navegación entre preguntas
- [ ] Botón "Enviar Respuestas"
- [ ] Pantalla de resultados
- [ ] Mostrar explicaciones

### Agente: `frontend-developer`

---

## QUIZ-004: Componente MultipleChoice
**Labels:** `epic:quiz`, `priority:high`, `size:S`, `frontend`

### Descripción
Componente para preguntas de opción múltiple.

### Props
```typescript
interface MultipleChoiceProps {
  question: string;
  options: string[];
  selectedAnswer: number | null;
  onSelect: (index: number) => void;
  disabled?: boolean;
  correctAnswer?: number; // Para mostrar resultado
}
```

### Agente: `frontend-developer`

---

## QUIZ-005: Componente TrueFalse
**Labels:** `epic:quiz`, `priority:high`, `size:S`, `frontend`

### Descripción
Componente para preguntas verdadero/falso.

### Agente: `frontend-developer`

---

## QUIZ-006: Componente CodeCompletion
**Labels:** `epic:quiz`, `priority:medium`, `size:M`, `frontend`

### Descripción
Componente para completar código.

### Tareas
- [ ] Mostrar código con blank (_____)
- [ ] Input para respuesta
- [ ] Syntax highlighting del contexto

### Agente: `frontend-developer`

---

# EPIC: GAMIFICATION (Gamificación)

## GAME-001: Sistema de Streaks - Backend
**Labels:** `epic:gamification`, `priority:critical`, `size:L`, `api`

### Descripción
Implementar sistema completo de rachas diarias.

### Tareas
- [ ] Modelo StreakLog
- [ ] Endpoint POST /api/streaks/checkin
- [ ] Verificar último check-in
- [ ] Calcular racha continua vs reset
- [ ] Calcular bonus XP por racha
- [ ] Actualizar currentStreak y longestStreak

### Lógica de Racha
```
Si último check-in fue ayer → streak + 1
Si último check-in fue hoy → ya hizo check-in
Si último check-in fue antes de ayer → streak = 1
```

### Bonus XP por Racha
| Días | Bonus |
|------|-------|
| 1-2 | 5 XP |
| 3-6 | 10 XP |
| 7-13 | 25 XP |
| 14-29 | 50 XP |
| 30+ | 100 XP |

### Agente: `api-developer`

---

## GAME-002: Sistema de Badges - Backend
**Labels:** `epic:gamification`, `priority:high`, `size:L`, `api`

### Descripción
Implementar verificación y otorgamiento de badges.

### Tareas
- [ ] Modelo Badge y UserBadge
- [ ] Seed de badges iniciales
- [ ] Función checkAndAwardBadges(userId)
- [ ] Verificar cada tipo de requisito
- [ ] No duplicar badges
- [ ] Agregar XP bonus de badge

### Tipos de Requisitos
```typescript
type BadgeRequirement =
  | { lessonsCompleted: number }
  | { streak: number }
  | { level: number }
  | { totalXp: number }
  | { weekComplete: number }
  | { perfectQuizzes: number }
  | { game: string; score: number }
```

### Agente: `api-developer`

---

## GAME-003: Seed de Badges
**Labels:** `epic:gamification`, `priority:high`, `size:M`, `api`

### Descripción
Script para insertar badges iniciales en la DB.

### Badges a Crear
```json
[
  { "slug": "first-lesson", "name": "Primer Paso", "icon": "🎯", "requirement": { "lessonsCompleted": 1 } },
  { "slug": "streak-3", "name": "En Racha", "icon": "⚡", "requirement": { "streak": 3 } },
  { "slug": "streak-7", "name": "Semana Perfecta", "icon": "🔥", "requirement": { "streak": 7 } },
  { "slug": "streak-30", "name": "Dedicación Total", "icon": "💎", "requirement": { "streak": 30 } },
  { "slug": "level-5", "name": "Embedding Explorer", "icon": "🧭", "requirement": { "level": 5 } },
  { "slug": "level-10", "name": "LLM Engineer", "icon": "🏆", "requirement": { "level": 10 } },
  { "slug": "week-1-complete", "name": "Fundamentos", "icon": "📚", "requirement": { "weekComplete": 1 } },
  { "slug": "week-4-complete", "name": "RAG Master", "icon": "🔍", "requirement": { "weekComplete": 4 } },
  { "slug": "week-8-complete", "name": "Graduado", "icon": "🎓", "requirement": { "weekComplete": 8 } },
  { "slug": "quiz-master", "name": "Cerebrito", "icon": "🧠", "requirement": { "perfectQuizzes": 10 } },
  { "slug": "speed-learner", "name": "Veloz", "icon": "⚡", "requirement": { "lessonsInDay": 5 } },
  { "slug": "xp-1000", "name": "Mil XP", "icon": "💫", "requirement": { "totalXp": 1000 } },
  { "slug": "xp-5000", "name": "5K Club", "icon": "🌟", "requirement": { "totalXp": 5000 } },
  { "slug": "game-winner", "name": "Gamer", "icon": "🎮", "requirement": { "gamesWon": 3 } },
  { "slug": "prompt-golfer", "name": "Golfista", "icon": "⛳", "requirement": { "game": "prompt-golf", "score": "par" } }
]
```

### Agente: `api-developer`

---

## GAME-004: API Get Badges
**Labels:** `epic:gamification`, `priority:high`, `size:S`, `api`

### Descripción
Endpoint GET /api/badges para obtener badges del usuario.

### Response
```json
{
  "earned": [
    { "id": "...", "name": "Primer Paso", "icon": "🎯", "earnedAt": "..." }
  ],
  "locked": [
    { "id": "...", "name": "En Racha", "icon": "⚡", "progress": 2, "target": 3 }
  ]
}
```

### Agente: `api-developer`

---

## GAME-005: Componente ProgressCard
**Labels:** `epic:gamification`, `priority:high`, `size:M`, `frontend`

### Descripción
Card principal de progreso en dashboard.

### Elementos
- Avatar con nivel
- Título de nivel
- Barra de XP con progreso
- XP actual / XP siguiente nivel
- Lecciones completadas
- Racha actual

### Agente: `frontend-developer`

---

## GAME-006: Componente StreakBanner
**Labels:** `epic:gamification`, `priority:high`, `size:M`, `frontend`

### Descripción
Banner de racha con botón de check-in.

### Tareas
- [ ] Mostrar días de racha
- [ ] Emoji según duración (⚡🔥💎)
- [ ] Botón de check-in
- [ ] Estado: ya hizo check-in hoy
- [ ] Animación de éxito
- [ ] Mostrar bonus XP ganado

### Agente: `frontend-developer`

---

## GAME-007: Animación Level Up
**Labels:** `epic:gamification`, `priority:medium`, `size:L`, `frontend`

### Descripción
Celebración al subir de nivel.

### Tareas
- [ ] Modal/overlay fullscreen
- [ ] Animación de nivel anterior → nuevo
- [ ] Mostrar nuevo título
- [ ] Efectos visuales (particles, glow)
- [ ] Sonido opcional
- [ ] Botón "Continuar"

### Agente: `frontend-developer`

---

## GAME-008: Notificación de Badge
**Labels:** `epic:gamification`, `priority:medium`, `size:M`, `frontend`

### Descripción
Toast/modal al ganar un badge.

### Tareas
- [ ] Toast animado desde arriba
- [ ] Mostrar icono y nombre del badge
- [ ] Mostrar XP bonus
- [ ] Auto-dismiss o tap to dismiss
- [ ] Cola de notificaciones si hay varios

### Agente: `frontend-developer`

---

## GAME-009: Pantalla de Badges
**Labels:** `epic:gamification`, `priority:medium`, `size:M`, `frontend`

### Descripción
Vista completa de todos los badges.

### Tareas
- [ ] Grid de badges ganados
- [ ] Grid de badges bloqueados (grayed out)
- [ ] Detalle de badge al tap
- [ ] Mostrar progreso hacia badges bloqueados
- [ ] Categorías (progreso, rachas, maestría)

### Agente: `frontend-developer`

---

## GAME-010: Sistema de Multiplicadores XP
**Labels:** `epic:gamification`, `priority:low`, `size:M`, `api`

### Descripción
Multiplicadores de XP basados en condiciones.

### Multiplicadores
- Racha 7+ días: x1.2
- Racha 30+ días: x1.5
- Fin de semana: x1.1 (opcional)
- Primera lección del día: +50 XP

### Agente: `api-developer`

---

## GAME-011: Historial de XP
**Labels:** `epic:gamification`, `priority:low`, `size:M`, `api`

### Descripción
Endpoint GET /api/users/me/xp-history para historial.

### Response
```json
{
  "history": [
    { "date": "2024-01-15", "xp": 250, "sources": ["lesson", "streak"] },
    { "date": "2024-01-14", "xp": 150, "sources": ["lesson"] }
  ],
  "totalThisWeek": 800,
  "averagePerDay": 114
}
```

### Agente: `api-developer`

---

## GAME-012: Gráfico de Actividad
**Labels:** `epic:gamification`, `priority:low`, `size:M`, `frontend`

### Descripción
Gráfico estilo GitHub de actividad.

### Tareas
- [ ] Grid de últimos 90 días
- [ ] Color por intensidad de XP
- [ ] Tooltip con detalles
- [ ] Responsive

### Agente: `frontend-developer`

---

# EPIC: LEADERBOARD (Rankings)

## LEAD-001: API Leaderboard Global
**Labels:** `epic:leaderboard`, `priority:high`, `size:M`, `api`

### Descripción
Endpoint GET /api/leaderboard?type=global para ranking total.

### Tareas
- [ ] Query ordenada por totalXp DESC
- [ ] Limite de resultados (default 50)
- [ ] Incluir displayName, level, totalXp
- [ ] Marcar si es usuario actual
- [ ] Calcular posición del usuario actual

### Response
```json
{
  "entries": [
    { "rank": 1, "userId": "...", "displayName": "Ana", "level": 8, "totalXp": 4200, "isCurrentUser": false }
  ],
  "userRank": 42,
  "totalUsers": 1250
}
```

### Agente: `api-developer`

---

## LEAD-002: API Leaderboard Semanal
**Labels:** `epic:leaderboard`, `priority:high`, `size:M`, `api`

### Descripción
Ranking de XP ganado en la semana actual.

### Tareas
- [ ] Filtrar completions por esta semana
- [ ] Sumar XP por usuario
- [ ] Ordenar y limitar
- [ ] Reset cada lunes

### Agente: `api-developer`

---

## LEAD-003: Pantalla de Leaderboard
**Labels:** `epic:leaderboard`, `priority:high`, `size:L`, `frontend`

### Descripción
UI de rankings con tabs.

### Tareas
- [ ] Tabs: Global | Semanal
- [ ] Lista de posiciones
- [ ] Top 3 destacado visualmente
- [ ] Highlight del usuario actual
- [ ] Pull to refresh
- [ ] Mostrar posición propia si no está en top

### Diseño
- Top 3 con medallas 🥇🥈🥉
- Lista con avatar, nombre, XP
- Usuario actual con borde destacado

### Agente: `frontend-developer`

---

## LEAD-004: Cambios de Posición
**Labels:** `epic:leaderboard`, `priority:low`, `size:M`, `api`

### Descripción
Calcular cambio de posición vs ayer.

### Tareas
- [ ] Guardar snapshot diario de posiciones
- [ ] Calcular delta
- [ ] Incluir en response (+3, -1, =)

### Agente: `api-developer`

---

## LEAD-005: Widget de Ranking en Dashboard
**Labels:** `epic:leaderboard`, `priority:medium`, `size:S`, `frontend`

### Descripción
Mini preview de ranking en dashboard.

### Tareas
- [ ] Mostrar top 3
- [ ] Mostrar posición del usuario
- [ ] Link a pantalla completa

### Agente: `frontend-developer`

---

# EPIC: GAMES (Mini-Juegos)

## GAMES-001: Modelo GameSession
**Labels:** `epic:games`, `priority:medium`, `size:S`, `api`

### Descripción
Modelo para registrar sesiones de juego.

### Schema
```prisma
model GameSession {
  id        String   @id @default(cuid())
  userId    String
  gameType  String   // token-tetris, prompt-golf, embedding-match
  score     Int
  xpEarned  Int
  playedAt  DateTime @default(now())

  user User @relation(...)
}
```

### Agente: `api-developer`

---

## GAMES-002: API Submit Game Score
**Labels:** `epic:games`, `priority:medium`, `size:M`, `api`

### Descripción
Endpoint POST /api/games/:type/score para guardar puntaje.

### Request
```json
{
  "score": 5000,
  "metadata": { "level": 5, "time": 120 }
}
```

### Response
```json
{
  "xpEarned": 50,
  "isHighScore": true,
  "rank": 15,
  "newBadges": []
}
```

### Agente: `api-developer`

---

## GAMES-003: API Game Leaderboard
**Labels:** `epic:games`, `priority:low`, `size:S`, `api`

### Descripción
Endpoint GET /api/games/:type/leaderboard.

### Agente: `api-developer`

---

## GAMES-004: Token Tetris - Game Logic
**Labels:** `epic:games`, `priority:medium`, `size:XL`, `frontend`

### Descripción
Implementar juego Token Tetris.

### Mecánicas
- Bloques son tokens de diferentes tamaños
- Tokens forman "palabras" al combinarse
- Completar línea = eliminar
- Palabra válida = bonus

### Tareas
- [ ] Game loop con requestAnimationFrame
- [ ] Física de caída
- [ ] Rotación de piezas
- [ ] Detección de colisiones
- [ ] Sistema de puntuación
- [ ] Levels con velocidad creciente
- [ ] Game over

### Agente: `game-developer`

---

## GAMES-005: Token Tetris - UI
**Labels:** `epic:games`, `priority:medium`, `size:L`, `frontend`

### Descripción
Interfaz de Token Tetris.

### Tareas
- [ ] Canvas/View del tablero
- [ ] Preview de siguiente pieza
- [ ] Score display
- [ ] Level display
- [ ] Controles touch/keyboard
- [ ] Pause/Resume
- [ ] Game Over screen
- [ ] Submit score

### Agente: `game-developer`

---

## GAMES-006: Prompt Golf - Backend
**Labels:** `epic:games`, `priority:medium`, `size:L`, `api`

### Descripción
Backend para evaluar prompts en Prompt Golf.

### Tareas
- [ ] Endpoint GET /api/games/prompt-golf/holes
- [ ] Endpoint POST /api/games/prompt-golf/attempt
- [ ] Contar tokens del prompt
- [ ] Llamar a LLM para evaluar output
- [ ] Comparar con target
- [ ] Calcular score (par, birdie, etc.)

### Agente: `game-developer`

---

## GAMES-007: Prompt Golf - Frontend
**Labels:** `epic:games`, `priority:medium`, `size:L`, `frontend`

### Descripción
UI del juego Prompt Golf.

### Tareas
- [ ] Selector de hole (nivel)
- [ ] Descripción del objetivo
- [ ] Input de prompt
- [ ] Contador de tokens en vivo
- [ ] Botón "Enviar"
- [ ] Visualización de resultado
- [ ] Scorecard con todos los holes
- [ ] Comparar con par

### Agente: `game-developer`

---

## GAMES-008: Embedding Match - Backend
**Labels:** `epic:games`, `priority:low`, `size:M`, `api`

### Descripción
Backend para juego de similitud semántica.

### Tareas
- [ ] Endpoint GET /api/games/embedding-match/level/:level
- [ ] Endpoint POST /api/games/embedding-match/verify
- [ ] Pre-calcular embeddings de pares
- [ ] Verificar matches correctos

### Agente: `game-developer`

---

## GAMES-009: Embedding Match - Frontend
**Labels:** `epic:games`, `priority:low`, `size:L`, `frontend`

### Descripción
UI del juego Embedding Match.

### Tareas
- [ ] Grid de cartas
- [ ] Animación de flip
- [ ] Timer countdown
- [ ] Score display
- [ ] Verificación de pares
- [ ] Feedback visual (correcto/incorrecto)
- [ ] Niveles de dificultad

### Agente: `game-developer`

---

## GAMES-010: Pantalla Hub de Juegos
**Labels:** `epic:games`, `priority:medium`, `size:M`, `frontend`

### Descripción
Pantalla de selección de mini-juegos.

### Tareas
- [ ] Grid de juegos disponibles
- [ ] Card por juego con icono, nombre, descripción
- [ ] Mostrar high score personal
- [ ] Estado bloqueado/desbloqueado
- [ ] Navegación a cada juego

### Agente: `frontend-developer`

---

# EPIC: DASHBOARD

## DASH-001: Pantalla Dashboard Principal
**Labels:** `epic:dashboard`, `priority:critical`, `size:L`, `frontend`

### Descripción
Pantalla principal post-login.

### Tareas
- [ ] Header con saludo y avatar
- [ ] StreakBanner
- [ ] ProgressCard
- [ ] Widget próxima lección
- [ ] Quick actions grid
- [ ] Pull to refresh

### Layout
```
┌─────────────────────────┐
│ Hola, [Nombre]          │
├─────────────────────────┤
│ [StreakBanner]          │
├─────────────────────────┤
│ [ProgressCard]          │
├─────────────────────────┤
│ Próxima Lección         │
│ [LessonCard]            │
├─────────────────────────┤
│ [Lessons] [Games]       │
│ [Ranking] [Profile]     │
└─────────────────────────┘
```

### Agente: `frontend-developer`

---

## DASH-002: Quick Actions Grid
**Labels:** `epic:dashboard`, `priority:high`, `size:S`, `frontend`

### Descripción
Botones de acceso rápido.

### Botones
- 📚 Lecciones → /lessons
- 🎮 Mini-juegos → /games
- 🏆 Ranking → /leaderboard
- 👤 Perfil → /profile

### Agente: `frontend-developer`

---

## DASH-003: Header con Usuario
**Labels:** `epic:dashboard`, `priority:high`, `size:S`, `frontend`

### Descripción
Header del dashboard con info del usuario.

### Elementos
- Saludo: "Hola, [displayName]"
- Subtítulo: "Continúa tu aprendizaje"
- Avatar (tap → profile)

### Agente: `frontend-developer`

---

## DASH-004: Fetch Inicial de Datos
**Labels:** `epic:dashboard`, `priority:high`, `size:M`, `frontend`

### Descripción
Cargar todos los datos necesarios al entrar.

### Datos a cargar en paralelo
- GET /users/me
- GET /users/me/progress
- GET /lessons (para próxima lección)

### Tareas
- [ ] Queries con RTK Query
- [ ] Loading state combinado
- [ ] Error handling
- [ ] Retry en error

### Agente: `frontend-developer`

---

# EPIC: PROFILE (Perfil)

## PROF-001: Pantalla de Perfil
**Labels:** `epic:profile`, `priority:high`, `size:L`, `frontend`

### Descripción
Vista del perfil del usuario.

### Secciones
1. Header: Avatar, nombre, email, nivel
2. Estadísticas: XP, lecciones, racha
3. Badges ganados (preview)
4. Badges bloqueados (preview)
5. Botón logout

### Tareas
- [ ] Fetch de progress y badges
- [ ] Avatar con inicial
- [ ] Stats en grid
- [ ] Preview de badges (mostrar 6)
- [ ] Link a ver todos los badges
- [ ] Botón logout con confirmación

### Agente: `frontend-developer`

---

## PROF-002: Editar Perfil
**Labels:** `epic:profile`, `priority:low`, `size:M`, `frontend`

### Descripción
Modal/pantalla para editar displayName.

### Tareas
- [ ] Input de displayName
- [ ] Validación
- [ ] Mutation de update
- [ ] Feedback de éxito

### Agente: `frontend-developer`

---

## PROF-003: Stats Detallados
**Labels:** `epic:profile`, `priority:low`, `size:M`, `frontend`

### Descripción
Vista expandida de estadísticas.

### Stats
- Tiempo total de estudio
- Promedio de quiz
- XP por semana (gráfico)
- Lecciones por semana
- Mejor racha
- Fecha de registro

### Agente: `frontend-developer`

---

## PROF-004: Historial de Actividad
**Labels:** `epic:profile`, `priority:low`, `size:M`, `frontend`

### Descripción
Timeline de actividad reciente.

### Eventos
- Lecciones completadas
- Badges ganados
- Niveles alcanzados
- Juegos jugados

### Agente: `frontend-developer`

---

## PROF-005: Configuraciones
**Labels:** `epic:profile`, `priority:low`, `size:S`, `frontend`

### Descripción
Pantalla de settings básicos.

### Opciones
- Notificaciones (on/off)
- Tema (dark/light) - v2
- Idioma - v2
- Sobre la app
- Cerrar sesión

### Agente: `frontend-developer`

---

# EPIC: INFRASTRUCTURE

## INFRA-001: Seed de Datos Iniciales
**Labels:** `epic:infra`, `priority:critical`, `size:L`, `api`

### Descripción
Script para popular DB con datos de desarrollo.

### Datos a crear
- Badges (15)
- Lecciones de prueba (10)
- Usuario de prueba
- Completions de ejemplo

### Comando
```bash
npm run db:seed -w @llmengineer/api
```

### Agente: `api-developer`

---

## INFRA-002: Dockerfile API
**Labels:** `epic:infra`, `priority:high`, `size:M`, `devops`

### Descripción
Dockerfile optimizado para la API.

### Tareas
- [ ] Multi-stage build
- [ ] Prisma generate
- [ ] Build de TypeScript
- [ ] Imagen de producción mínima

### Agente: `devops-engineer`

---

## INFRA-003: Docker Compose Local
**Labels:** `epic:infra`, `priority:high`, `size:M`, `devops`

### Descripción
Docker Compose para desarrollo local.

### Servicios
- postgres (con volumen)
- api (con hot reload)
- web (opcional)

### Agente: `devops-engineer`

---

## INFRA-004: GitHub Actions CI
**Labels:** `epic:infra`, `priority:high`, `size:L`, `devops`

### Descripción
Pipeline de CI para PRs.

### Jobs
1. lint-and-typecheck
2. test-api (con postgres service)
3. build
4. coverage check

### Agente: `devops-engineer`

---

## INFRA-005: Deploy Vercel (Web)
**Labels:** `epic:infra`, `priority:high`, `size:M`, `devops`

### Descripción
Configurar deploy de frontend en Vercel.

### Tareas
- [ ] vercel.json
- [ ] Variables de entorno
- [ ] Preview deployments para PRs
- [ ] Production deploy en main

### Agente: `devops-engineer`

---

## INFRA-006: Deploy Railway (API)
**Labels:** `epic:infra`, `priority:high`, `size:M`, `devops`

### Descripción
Configurar deploy de API en Railway.

### Tareas
- [ ] railway.json
- [ ] PostgreSQL addon
- [ ] Variables de entorno
- [ ] Auto deploy en main

### Agente: `devops-engineer`

---

## INFRA-007: Health Check Endpoint
**Labels:** `epic:infra`, `priority:medium`, `size:S`, `api`

### Descripción
Endpoint GET /health para monitoreo.

### Response
```json
{
  "status": "ok",
  "timestamp": "...",
  "database": "connected"
}
```

### Agente: `api-developer`

---

## INFRA-008: Rate Limiting
**Labels:** `epic:infra`, `priority:medium`, `size:M`, `api`

### Descripción
Implementar rate limiting en la API.

### Límites
- General: 100 req/min
- Auth: 10 req/min
- Games: 30 req/min

### Agente: `api-developer`

---

# EPIC: TESTING

## TEST-001: Setup Jest API
**Labels:** `epic:testing`, `priority:high`, `size:M`, `api`

### Descripción
Configurar Jest para testing de API.

### Tareas
- [ ] jest.config.js
- [ ] Test database setup
- [ ] Prisma mock utilities
- [ ] Coverage thresholds (80%)

### Agente: `testing-engineer`

---

## TEST-002: Tests Unitarios AuthService
**Labels:** `epic:testing`, `priority:high`, `size:M`, `api`

### Descripción
Tests para el servicio de autenticación.

### Tests
- register: crea usuario con hash
- register: rechaza email duplicado
- login: retorna token válido
- login: rechaza password incorrecto
- validateUser: valida token

### Agente: `testing-engineer`

---

## TEST-003: Tests Unitarios LessonsService
**Labels:** `epic:testing`, `priority:high`, `size:M`, `api`

### Descripción
Tests para el servicio de lecciones.

### Tests
- findAll: retorna lecciones ordenadas
- findAll: incluye isCompleted
- complete: otorga XP correcto
- complete: no permite duplicado
- complete: trigger badges

### Agente: `testing-engineer`

---

## TEST-004: Tests Unitarios GamificationService
**Labels:** `epic:testing`, `priority:high`, `size:L`, `api`

### Descripción
Tests para XP, niveles, streaks, badges.

### Tests
- calculateLevel: edge cases
- addXp: level up detection
- checkin: streak calculation
- checkBadges: award correct badges

### Agente: `testing-engineer`

---

## TEST-005: Tests E2E Auth Flow
**Labels:** `epic:testing`, `priority:medium`, `size:L`, `api`

### Descripción
Tests end-to-end del flujo de autenticación.

### Flujo
1. Register → recibe token
2. Login → recibe token
3. Get /users/me → datos correctos
4. Request sin token → 401

### Agente: `testing-engineer`

---

## TEST-006: Tests de Componentes Frontend
**Labels:** `epic:testing`, `priority:medium`, `size:L`, `frontend`

### Descripción
Tests de componentes React Native.

### Componentes a testear
- Button (variants, states)
- Input (validation)
- ProgressCard (renders data)
- LessonCard (renders correctly)

### Agente: `testing-engineer`

---

# EPIC: CONTENT (Gestión de Contenido)

## CONT-001: Loader de Lecciones JSON
**Labels:** `epic:content`, `priority:high`, `size:M`, `api`

### Descripción
Script para cargar lecciones desde llmengineer-content.

### Tareas
- [ ] Leer archivos JSON de lessons/
- [ ] Validar estructura
- [ ] Upsert en database
- [ ] Reportar errores de validación

### Comando
```bash
npm run content:sync -w @llmengineer/api
```

### Agente: `api-developer`

---

## CONT-002: Validador de Contenido
**Labels:** `epic:content`, `priority:medium`, `size:M`, `api`

### Descripción
Validar estructura de JSONs de contenido.

### Validaciones
- Campos requeridos presentes
- Tipos correctos
- Quiz questions válidas
- XP rewards en rangos válidos

### Agente: `api-developer`

---

## CONT-003: Loader de Badges JSON
**Labels:** `epic:content`, `priority:medium`, `size:S`, `api`

### Descripción
Cargar badges desde badges.json.

### Agente: `api-developer`

---

## CONT-004: Loader de Games Config
**Labels:** `epic:content`, `priority:low`, `size:S`, `api`

### Descripción
Cargar configuración de juegos desde JSON.

### Agente: `api-developer`

---

# Resumen de Priorización

## Sprint 1 - Core MVP (Crítico)
| Ticket | Título | Size |
|--------|--------|------|
| AUTH-001 | API Registro | M |
| AUTH-002 | API Login | S |
| AUTH-003 | JWT Strategy | M |
| AUTH-004 | Pantalla Login | M |
| AUTH-005 | Pantalla Registro | M |
| AUTH-006 | Persistencia Sesión | M |
| USERS-002 | API Get Progress | M |
| USERS-005 | Servicio Niveles | M |
| USERS-006 | Servicio AddXP | M |
| LESSONS-002 | API Listar Lecciones | M |
| LESSONS-003 | API Detalle Lección | S |
| LESSONS-004 | API Completar Lección | L |
| LESSONS-006 | Pantalla Lista Lecciones | L |
| LESSONS-007 | Pantalla Detalle Lección | XL |
| DASH-001 | Dashboard Principal | L |
| INFRA-001 | Seed Datos | L |

**Total Sprint 1:** 16 tickets

## Sprint 2 - Gamificación
| Ticket | Título | Size |
|--------|--------|------|
| GAME-001 | Sistema Streaks | L |
| GAME-002 | Sistema Badges | L |
| GAME-003 | Seed Badges | M |
| GAME-004 | API Get Badges | S |
| GAME-005 | ProgressCard | M |
| GAME-006 | StreakBanner | M |
| QUIZ-001 | Modelo Quiz | S |
| QUIZ-002 | API Evaluar Quiz | M |
| QUIZ-003 | Quiz Modal | L |
| QUIZ-004 | MultipleChoice | S |
| LEAD-001 | API Leaderboard Global | M |
| LEAD-002 | API Leaderboard Semanal | M |
| LEAD-003 | Pantalla Leaderboard | L |
| PROF-001 | Pantalla Perfil | L |

**Total Sprint 2:** 14 tickets

## Sprint 3 - Polish y Games
| Ticket | Título | Size |
|--------|--------|------|
| LESSONS-008 | CodeBlock | M |
| LESSONS-010 | Animación XP | M |
| GAME-007 | Animación Level Up | L |
| GAME-008 | Notificación Badge | M |
| GAME-009 | Pantalla Badges | M |
| GAMES-004 | Token Tetris Logic | XL |
| GAMES-005 | Token Tetris UI | L |
| GAMES-006 | Prompt Golf Backend | L |
| GAMES-007 | Prompt Golf Frontend | L |
| GAMES-010 | Hub de Juegos | M |
| INFRA-004 | GitHub Actions CI | L |
| INFRA-005 | Deploy Vercel | M |
| INFRA-006 | Deploy Railway | M |
| TEST-001 | Setup Jest | M |
| TEST-002 | Tests Auth | M |

**Total Sprint 3:** 15 tickets

## Sprint 4 - Calidad y Extras
Tickets restantes de testing, content loaders, y features secundarias.

**Total Sprint 4:** 27 tickets

---

# Crear Issues en GitHub

Ver archivo `scripts/create-all-issues.sh` para el script completo de creación.
