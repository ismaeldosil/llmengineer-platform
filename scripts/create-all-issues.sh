#!/bin/bash

# =============================================================================
# Script para crear GitHub Project + Issues para LLM Engineer Platform
# =============================================================================
#
# Este script crea:
# 1. Un GitHub Project (Kanban board)
# 2. Campos personalizados (Sprint, Epic, Agent, Size)
# 3. 72 issues organizados en 12 epics
# 4. Vincula cada issue al proyecto automáticamente
#
# Uso: ./scripts/create-all-issues.sh
#
# Requisitos:
# - GitHub CLI (gh) instalado y autenticado
# - jq instalado (para parsear JSON)
# - Repositorio ya creado en GitHub
# =============================================================================

# No usar set -e para permitir que el script continúe si hay errores menores

# Configuración
OWNER="ismaeldosil"
REPO="ismaeldosil/llmengineer-platform"
PROJECT_TITLE="LLM Engineer Platform"

echo "============================================"
echo "  LLM Engineer Platform"
echo "  GitHub Project + 72 Issues"
echo "============================================"
echo ""

# Verificar dependencias
command -v gh >/dev/null 2>&1 || { echo "Error: gh CLI no está instalado. Instálalo con: brew install gh"; exit 1; }
command -v jq >/dev/null 2>&1 || { echo "Error: jq no está instalado. Instálalo con: brew install jq"; exit 1; }

# Verificar autenticación
gh auth status >/dev/null 2>&1 || { echo "Error: No estás autenticado. Ejecuta: gh auth login"; exit 1; }

echo "Paso 1: Creando GitHub Project..."
echo "----------------------------------------"

# Crear el proyecto
PROJECT_URL=$(gh project create --owner "$OWNER" --title "$PROJECT_TITLE" --format json 2>/dev/null | jq -r '.url' || echo "")

if [ -z "$PROJECT_URL" ] || [ "$PROJECT_URL" == "null" ]; then
  echo "El proyecto ya existe o hubo un error. Buscando proyecto existente..."
  PROJECT_NUMBER=$(gh project list --owner "$OWNER" --format json | jq -r --arg title "$PROJECT_TITLE" '.projects[] | select(.title == $title) | .number')

  if [ -z "$PROJECT_NUMBER" ]; then
    echo "Creando proyecto nuevo..."
    gh project create --owner "$OWNER" --title "$PROJECT_TITLE"
    sleep 2
    PROJECT_NUMBER=$(gh project list --owner "$OWNER" --format json | jq -r --arg title "$PROJECT_TITLE" '.projects[] | select(.title == $title) | .number')
  fi
else
  PROJECT_NUMBER=$(gh project list --owner "$OWNER" --format json | jq -r --arg title "$PROJECT_TITLE" '.projects[] | select(.title == $title) | .number')
fi

if [ -z "$PROJECT_NUMBER" ]; then
  echo "Error: No se pudo crear o encontrar el proyecto"
  exit 1
fi

echo "✓ Proyecto creado/encontrado: #$PROJECT_NUMBER"
echo "  URL: https://github.com/users/$OWNER/projects/$PROJECT_NUMBER"
echo ""

echo "Paso 2: Configurando campos personalizados..."
echo "----------------------------------------"

# Función para crear campo single-select si no existe
create_single_select_field() {
  local field_name="$1"
  local options="$2"

  echo "  Creando campo: $field_name"
  gh project field-create "$PROJECT_NUMBER" --owner "$OWNER" \
    --name "$field_name" \
    --data-type SINGLE_SELECT \
    --single-select-options "$options" 2>/dev/null || echo "    (ya existe o error)"
}

# Crear campos personalizados
create_single_select_field "Sprint" "Sprint 1 - Core MVP,Sprint 2 - Gamificación,Sprint 3 - Polish & Games,Sprint 4 - Calidad,Backlog"
create_single_select_field "Epic" "AUTH,USERS,LESSONS,QUIZ,GAMIFICATION,LEADERBOARD,GAMES,DASHBOARD,PROFILE,INFRA,TESTING,CONTENT"
create_single_select_field "Agent" "api-developer,frontend-developer,game-developer,devops-engineer,testing-engineer"
create_single_select_field "Size" "S (~2h),M (~4h),L (~8h),XL (~16h)"

echo "✓ Campos personalizados configurados"
echo ""

echo "Paso 3: Creando labels en el repositorio..."
echo "----------------------------------------"

# Función para crear label
create_label() {
  local name="$1"
  local color="$2"
  local description="$3"
  gh label create "$name" --color "$color" --description "$description" --repo "$REPO" 2>/dev/null || true
}

# Epic labels
create_label "epic:auth" "0052CC" "Autenticación y usuarios"
create_label "epic:users" "1D76DB" "Gestión de usuarios"
create_label "epic:lessons" "5319E7" "Sistema de lecciones"
create_label "epic:quiz" "7057FF" "Sistema de quizzes"
create_label "epic:gamification" "FBCA04" "XP, niveles, badges"
create_label "epic:leaderboard" "B60205" "Rankings"
create_label "epic:games" "D93F0B" "Mini-juegos"
create_label "epic:dashboard" "0E8A16" "Dashboard principal"
create_label "epic:profile" "006B75" "Perfil de usuario"
create_label "epic:infra" "1D1D1D" "Infraestructura"
create_label "epic:testing" "BFD4F2" "Testing y QA"
create_label "epic:content" "C5DEF5" "Gestión de contenido"

# Priority labels
create_label "priority:critical" "B60205" "Crítico - Bloqueante"
create_label "priority:high" "D93F0B" "Alta prioridad"
create_label "priority:medium" "FBCA04" "Prioridad media"
create_label "priority:low" "0E8A16" "Baja prioridad"

# Size labels
create_label "size:S" "C5DEF5" "Pequeño (~2h)"
create_label "size:M" "BFD4F2" "Mediano (~4h)"
create_label "size:L" "A2C6E9" "Grande (~8h)"
create_label "size:XL" "84B6E0" "Extra grande (~16h)"

# Type labels
create_label "api" "006B75" "Backend/API"
create_label "frontend" "7057FF" "Frontend/UI"
create_label "devops" "1D1D1D" "DevOps/Infra"

# Sprint labels (para filtrado adicional)
create_label "sprint:1" "0052CC" "Sprint 1 - Core MVP"
create_label "sprint:2" "5319E7" "Sprint 2 - Gamificación"
create_label "sprint:3" "D93F0B" "Sprint 3 - Polish & Games"
create_label "sprint:4" "006B75" "Sprint 4 - Calidad"

echo "✓ Labels creados"
echo ""

echo "Paso 4: Creando issues y vinculándolos al proyecto..."
echo "----------------------------------------"

# Contadores
TOTAL_CREATED=0
TOTAL_FAILED=0

# Función para crear issue y agregarlo al proyecto
create_issue_and_add_to_project() {
  local title="$1"
  local labels="$2"
  local body="$3"
  local sprint="$4"

  echo -n "  Creando: $title... "

  # Crear el issue
  ISSUE_URL=$(gh issue create \
    --title "$title" \
    --label "$labels" \
    --body "$body" \
    --repo "$REPO" 2>&1)

  if [[ "$ISSUE_URL" == *"https://github.com"* ]]; then
    # Agregar al proyecto
    gh project item-add "$PROJECT_NUMBER" --owner "$OWNER" --url "$ISSUE_URL" 2>/dev/null || true
    echo "✓"
    ((TOTAL_CREATED++))
  else
    echo "✗ (ya existe o error)"
    ((TOTAL_FAILED++))
  fi
}

# =============================================================================
# EPIC: AUTH (8 tickets) - Sprint 1
# =============================================================================
echo ""
echo "EPIC: AUTH (8 tickets)"

create_issue_and_add_to_project \
  "AUTH-001: API de registro de usuarios" \
  "epic:auth,priority:critical,size:M,api,sprint:1" \
  "## Descripción
Implementar endpoint POST /api/auth/register para crear nuevos usuarios.

## Tareas
- [ ] DTO de validación (RegisterDto)
- [ ] Verificar email único
- [ ] Hash de password con bcrypt (10 rounds)
- [ ] Crear usuario en DB
- [ ] Crear UserProgress inicial (nivel 1, 0 XP)
- [ ] Generar JWT token
- [ ] Retornar user + accessToken

## Criterios de Aceptación
- [ ] Email debe ser válido y único
- [ ] Password mínimo 6 caracteres
- [ ] displayName entre 2-50 caracteres
- [ ] Token JWT válido por 7 días
- [ ] UserProgress creado con valores iniciales

## Tests Requeridos
\`\`\`typescript
describe('AuthService.register', () => {
  it('should create user with hashed password')
  it('should return JWT token')
  it('should create initial progress')
  it('should reject duplicate email')
  it('should validate password length')
})
\`\`\`

## Agente
\`api-developer\`" \
  "Sprint 1"

create_issue_and_add_to_project \
  "AUTH-002: API de login" \
  "epic:auth,priority:critical,size:S,api,sprint:1" \
  "## Descripción
Implementar endpoint POST /api/auth/login para autenticar usuarios.

## Tareas
- [ ] DTO de validación (LoginDto)
- [ ] Buscar usuario por email
- [ ] Comparar password con bcrypt
- [ ] Generar JWT token
- [ ] Actualizar lastActiveAt

## Criterios de Aceptación
- [ ] Login exitoso retorna user + accessToken
- [ ] Credenciales inválidas retornan 401
- [ ] Respuesta no incluye password

## Agente
\`api-developer\`" \
  "Sprint 1"

create_issue_and_add_to_project \
  "AUTH-003: JWT Strategy y Guards" \
  "epic:auth,priority:critical,size:M,api,sprint:1" \
  "## Descripción
Implementar estrategia JWT de Passport y guards de autenticación.

## Tareas
- [ ] Configurar JwtModule con secret desde env
- [ ] Implementar JwtStrategy
- [ ] Crear JwtAuthGuard
- [ ] Crear decorador @CurrentUser()
- [ ] Manejar token expirado (401)

## Criterios de Aceptación
- [ ] Rutas protegidas requieren Bearer token
- [ ] Token inválido retorna 401
- [ ] @CurrentUser() extrae usuario del request

## Agente
\`api-developer\`" \
  "Sprint 1"

create_issue_and_add_to_project \
  "AUTH-004: Pantalla de Login" \
  "epic:auth,priority:critical,size:M,frontend,sprint:1" \
  "## Descripción
Crear UI de login con validaciones y manejo de errores.

## Tareas
- [ ] Formulario con email y password
- [ ] Validación client-side en tiempo real
- [ ] Mostrar/ocultar password
- [ ] Botón de submit con loading state
- [ ] Integración con useLoginMutation
- [ ] Guardar token en Redux
- [ ] Redirect a /dashboard en éxito
- [ ] Mostrar errores de API

## Diseño
- Input de email con validación
- Input de password con toggle visibility
- Botón 'Iniciar Sesión' azul (#3B82F6)
- Link a registro
- Fondo oscuro (#111827)

## Agente
\`frontend-developer\`" \
  "Sprint 1"

create_issue_and_add_to_project \
  "AUTH-005: Pantalla de Registro" \
  "epic:auth,priority:critical,size:M,frontend,sprint:1" \
  "## Descripción
Crear UI de registro con validaciones completas.

## Tareas
- [ ] Formulario con displayName, email, password, confirmPassword
- [ ] Validación de passwords coincidentes
- [ ] Indicador de fortaleza de password
- [ ] Integración con useRegisterMutation
- [ ] Manejo de errores (email duplicado)
- [ ] Redirect a /dashboard en éxito

## Agente
\`frontend-developer\`" \
  "Sprint 1"

create_issue_and_add_to_project \
  "AUTH-006: Persistencia de Sesión" \
  "epic:auth,priority:high,size:M,frontend,sprint:1" \
  "## Descripción
Persistir token y restaurar sesión al recargar la app.

## Tareas
- [ ] Guardar token en AsyncStorage/localStorage
- [ ] Verificar token al iniciar app
- [ ] Llamar a /users/me para validar sesión
- [ ] Mostrar splash/loading mientras verifica
- [ ] Limpiar storage en logout
- [ ] Manejar token expirado

## Criterios de Aceptación
- [ ] Usuario permanece logueado al refrescar
- [ ] Token inválido redirige a login
- [ ] Loading state mientras verifica

## Agente
\`frontend-developer\`" \
  "Sprint 1"

create_issue_and_add_to_project \
  "AUTH-007: Logout y Limpieza de Sesión" \
  "epic:auth,priority:high,size:S,frontend,sprint:1" \
  "## Descripción
Implementar logout completo con limpieza de estado.

## Tareas
- [ ] Acción logout en authSlice
- [ ] Limpiar AsyncStorage
- [ ] Resetear RTK Query cache
- [ ] Redirect a pantalla inicial
- [ ] Confirmación opcional

## Agente
\`frontend-developer\`" \
  "Sprint 1"

create_issue_and_add_to_project \
  "AUTH-008: Protección de Rutas" \
  "epic:auth,priority:high,size:S,frontend,sprint:1" \
  "## Descripción
Implementar redirección automática para rutas protegidas.

## Tareas
- [ ] HOC o layout para rutas protegidas
- [ ] Verificar isAuthenticated en Redux
- [ ] Redirect a /auth/login si no autenticado
- [ ] Redirect a /dashboard si ya autenticado (en /auth/*)

## Agente
\`frontend-developer\`" \
  "Sprint 1"

# =============================================================================
# EPIC: USERS (6 tickets) - Sprint 1
# =============================================================================
echo ""
echo "EPIC: USERS (6 tickets)"

create_issue_and_add_to_project \
  "USERS-001: API Get Current User" \
  "epic:users,priority:high,size:S,api,sprint:1" \
  "## Descripción
Endpoint GET /api/users/me para obtener usuario actual.

## Tareas
- [ ] Proteger con JwtAuthGuard
- [ ] Retornar datos del usuario (sin password)
- [ ] Incluir fecha de creación

## Agente
\`api-developer\`" \
  "Sprint 1"

create_issue_and_add_to_project \
  "USERS-002: API Get User Progress" \
  "epic:users,priority:high,size:M,api,sprint:1" \
  "## Descripción
Endpoint GET /api/users/me/progress para obtener progreso completo.

## Tareas
- [ ] Query de UserProgress
- [ ] Incluir badges ganados
- [ ] Calcular XP para siguiente nivel
- [ ] Incluir estadísticas de lecciones

## Response Esperado
\`\`\`json
{
  \"totalXp\": 1250,
  \"level\": 3,
  \"levelTitle\": \"Token Tinkerer\",
  \"xpForNextLevel\": 1500,
  \"currentStreak\": 5,
  \"longestStreak\": 12,
  \"lessonsCompleted\": 8,
  \"badges\": [...]
}
\`\`\`

## Agente
\`api-developer\`" \
  "Sprint 1"

create_issue_and_add_to_project \
  "USERS-003: API Update User Profile" \
  "epic:users,priority:medium,size:S,api,sprint:2" \
  "## Descripción
Endpoint PATCH /api/users/me para actualizar perfil.

## Tareas
- [ ] Permitir actualizar displayName
- [ ] Validar longitud de displayName
- [ ] No permitir cambiar email (v1)

## Agente
\`api-developer\`" \
  "Sprint 2"

create_issue_and_add_to_project \
  "USERS-004: API Get User Stats" \
  "epic:users,priority:medium,size:M,api,sprint:4" \
  "## Descripción
Endpoint GET /api/users/me/stats para estadísticas detalladas.

## Tareas
- [ ] Total de tiempo de estudio
- [ ] Lecciones por semana
- [ ] Promedio de quizzes
- [ ] Historial de XP por día

## Agente
\`api-developer\`" \
  "Sprint 4"

create_issue_and_add_to_project \
  "USERS-005: Servicio de Niveles" \
  "epic:users,priority:high,size:M,api,sprint:1" \
  "## Descripción
Implementar lógica de cálculo de niveles y títulos.

## Tareas
- [ ] Función calculateLevel(xp) - 500 XP por nivel
- [ ] Función getLevelTitle(level) - 10 títulos
- [ ] Función getXpForNextLevel(currentXp)
- [ ] Función getXpProgressPercent(currentXp)

## Niveles y Títulos
| Nivel | XP | Título |
|-------|-----|--------|
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

## Agente
\`api-developer\`" \
  "Sprint 1"

create_issue_and_add_to_project \
  "USERS-006: Servicio de Agregar XP" \
  "epic:users,priority:high,size:M,api,sprint:1" \
  "## Descripción
Implementar método addXp con actualización de nivel.

## Tareas
- [ ] Incrementar totalXp
- [ ] Recalcular nivel
- [ ] Actualizar levelTitle si cambió
- [ ] Retornar si hubo level up
- [ ] Trigger checkBadges

## Interface de Respuesta
\`\`\`typescript
interface AddXpResult {
  newTotalXp: number;
  xpAdded: number;
  leveledUp: boolean;
  newLevel?: number;
  newTitle?: string;
}
\`\`\`

## Agente
\`api-developer\`" \
  "Sprint 1"

# =============================================================================
# EPIC: LESSONS (14 tickets) - Sprints 1-2
# =============================================================================
echo ""
echo "EPIC: LESSONS (14 tickets)"

create_issue_and_add_to_project \
  "LESSONS-001: Modelo y Schema de Lesson" \
  "epic:lessons,priority:critical,size:S,api,sprint:1" \
  "## Descripción
Definir modelo Prisma para lecciones (ya existe en schema.prisma, verificar).

## Schema
\`\`\`prisma
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
  sections         Json     @default(\"[]\")
  isPublished      Boolean  @default(false)
  completions      LessonCompletion[]
  @@unique([week, order])
}
\`\`\`

## Agente
\`api-developer\`" \
  "Sprint 1"

create_issue_and_add_to_project \
  "LESSONS-002: API Listar Lecciones" \
  "epic:lessons,priority:critical,size:M,api,sprint:1" \
  "## Descripción
Endpoint GET /api/lessons para obtener todas las lecciones.

## Tareas
- [ ] Query lecciones donde isPublished = true
- [ ] Ordenar por week ASC, order ASC
- [ ] Join con completions del usuario
- [ ] Agregar campo isCompleted por lección
- [ ] Calcular progreso por semana

## Agente
\`api-developer\`" \
  "Sprint 1"

create_issue_and_add_to_project \
  "LESSONS-003: API Detalle de Lección" \
  "epic:lessons,priority:critical,size:S,api,sprint:1" \
  "## Descripción
Endpoint GET /api/lessons/:id para obtener detalle completo.

## Tareas
- [ ] Buscar lección por ID o slug
- [ ] Incluir todas las secciones
- [ ] Verificar si usuario la completó
- [ ] Incluir quiz si existe

## Agente
\`api-developer\`" \
  "Sprint 1"

create_issue_and_add_to_project \
  "LESSONS-004: API Completar Lección" \
  "epic:lessons,priority:critical,size:L,api,sprint:1" \
  "## Descripción
Endpoint POST /api/lessons/:id/complete para marcar lección como completada.

## Tareas
- [ ] Validar que lección existe
- [ ] Verificar no completada previamente (409 Conflict)
- [ ] Crear LessonCompletion
- [ ] Calcular XP (base + bonos)
- [ ] Llamar addXp del usuario
- [ ] Incrementar lessonsCompleted en progress
- [ ] Verificar badges de completación
- [ ] Verificar si completó semana entera

## Request
\`\`\`json
{
  \"timeSpentSeconds\": 420,
  \"quizScore\": 80
}
\`\`\`

## Response
\`\`\`json
{
  \"xpEarned\": 125,
  \"bonuses\": [{ \"type\": \"speed\", \"xp\": 25 }],
  \"leveledUp\": false,
  \"newBadges\": [],
  \"weekCompleted\": false
}
\`\`\`

## Agente
\`api-developer\`" \
  "Sprint 1"

create_issue_and_add_to_project \
  "LESSONS-005: Cálculo de XP de Lección" \
  "epic:lessons,priority:high,size:M,api,sprint:1" \
  "## Descripción
Implementar sistema de cálculo de XP con bonificaciones.

## Fórmulas
\`\`\`
XP Base = lesson.xpReward (100-200)

Bonus Velocidad:
- Si tiempo < 80% estimado: +25 XP
- Si tiempo > 150% estimado: -0 XP (sin penalización)

Bonus Quiz:
- 100%: +50 XP
- 90%+: +25 XP
- 70%+: +10 XP

Multiplicador Racha:
- 3+ días: x1.1
- 7+ días: x1.2
- 14+ días: x1.3
- 30+ días: x1.5
\`\`\`

## Agente
\`api-developer\`" \
  "Sprint 1"

create_issue_and_add_to_project \
  "LESSONS-006: Pantalla Lista de Lecciones" \
  "epic:lessons,priority:critical,size:L,frontend,sprint:1" \
  "## Descripción
UI para ver todas las lecciones organizadas por semana.

## Tareas
- [ ] Fetch con useGetLessonsQuery
- [ ] Agrupar lecciones por semana
- [ ] Sección colapsable por semana
- [ ] Mostrar progreso de semana (ej: 3/5)
- [ ] LessonCard con estado visual (completada/pendiente)
- [ ] Indicador de dificultad (color: verde/amarillo/rojo)
- [ ] Mostrar XP reward
- [ ] Navegación a detalle

## Componentes
- WeekSection (colapsable)
- LessonCard (título, desc, XP, dificultad, estado)
- ProgressIndicator (circular o barra)

## Agente
\`frontend-developer\`" \
  "Sprint 1"

create_issue_and_add_to_project \
  "LESSONS-007: Pantalla Detalle de Lección" \
  "epic:lessons,priority:critical,size:XL,frontend,sprint:1" \
  "## Descripción
UI para ver contenido de lección y completarla.

## Tareas
- [ ] Header con título, semana, XP
- [ ] Navegación entre secciones
- [ ] Renderizar markdown/texto de cada sección
- [ ] Bloques de código con syntax highlighting
- [ ] Botón \"Siguiente Sección\"
- [ ] Tracker de tiempo (para cálculo de XP)
- [ ] Botón \"Completar Lección\"
- [ ] Modal de quiz si existe
- [ ] Animación de XP ganado al completar

## Estados de la pantalla
1. Leyendo secciones
2. Respondiendo quiz (si existe)
3. Completada (mostrar resumen de XP)

## Agente
\`frontend-developer\`" \
  "Sprint 1"

create_issue_and_add_to_project \
  "LESSONS-008: Componente CodeBlock" \
  "epic:lessons,priority:high,size:M,frontend,sprint:2" \
  "## Descripción
Componente para mostrar código con syntax highlighting.

## Tareas
- [ ] Integrar react-syntax-highlighter o prism-react-renderer
- [ ] Tema oscuro (github-dark o similar)
- [ ] Botón de copiar código al clipboard
- [ ] Indicador de lenguaje en header
- [ ] Números de línea opcionales

## Props
\`\`\`typescript
interface CodeBlockProps {
  code: string;
  language: 'python' | 'typescript' | 'bash' | 'json';
  showLineNumbers?: boolean;
  highlightLines?: number[];
}
\`\`\`

## Agente
\`frontend-developer\`" \
  "Sprint 2"

create_issue_and_add_to_project \
  "LESSONS-009: Sistema de Secciones de Lección" \
  "epic:lessons,priority:high,size:M,frontend,sprint:2" \
  "## Descripción
Navegación y tracking de progreso dentro de una lección.

## Tareas
- [ ] Estado local de sección actual
- [ ] Barra de progreso de secciones (ej: 2/5)
- [ ] Botones prev/next
- [ ] Marcar secciones como leídas localmente
- [ ] Scroll suave entre secciones
- [ ] Indicador visual de sección actual

## Agente
\`frontend-developer\`" \
  "Sprint 2"

create_issue_and_add_to_project \
  "LESSONS-010: Animación de XP Ganado" \
  "epic:lessons,priority:medium,size:M,frontend,sprint:3" \
  "## Descripción
Animación celebratoria al completar lección.

## Tareas
- [ ] Modal/overlay de celebración
- [ ] Contador animado de XP (0 → valor final)
- [ ] Desglose de bonificaciones
- [ ] Mostrar nuevo nivel si aplica
- [ ] Confetti o partículas opcionales
- [ ] Botón \"Continuar\" para cerrar

## Librerías sugeridas
- react-native-reanimated para animaciones
- lottie-react-native para confetti (opcional)

## Agente
\`frontend-developer\`" \
  "Sprint 3"

create_issue_and_add_to_project \
  "LESSONS-011: Carga de Contenido desde JSON" \
  "epic:lessons,priority:high,size:M,api,sprint:1" \
  "## Descripción
Script para cargar lecciones desde el repo llmengineer-content.

## Tareas
- [ ] Script de sincronización (TypeScript)
- [ ] Leer archivos JSON de lessons/week-*/
- [ ] Parsear y validar estructura
- [ ] Upsert en database (crear o actualizar)
- [ ] Comando: npm run content:sync

## Agente
\`api-developer\`" \
  "Sprint 1"

create_issue_and_add_to_project \
  "LESSONS-012: API Lecciones por Semana" \
  "epic:lessons,priority:medium,size:S,api,sprint:2" \
  "## Descripción
Endpoint GET /api/lessons/week/:week para filtrar por semana.

## Agente
\`api-developer\`" \
  "Sprint 2"

create_issue_and_add_to_project \
  "LESSONS-013: Siguiente Lección Recomendada" \
  "epic:lessons,priority:medium,size:M,api,sprint:2" \
  "## Descripción
Endpoint GET /api/lessons/next para obtener la siguiente lección a completar.

## Lógica
1. Buscar primera lección no completada por el usuario
2. Ordenar por semana ASC, luego por order ASC
3. Si completó todas, retornar null con mensaje

## Agente
\`api-developer\`" \
  "Sprint 2"

create_issue_and_add_to_project \
  "LESSONS-014: Widget de Próxima Lección" \
  "epic:lessons,priority:medium,size:M,frontend,sprint:2" \
  "## Descripción
Card en dashboard mostrando la siguiente lección recomendada.

## Tareas
- [ ] Fetch de siguiente lección
- [ ] Card con preview (título, descripción, XP)
- [ ] Botón \"Continuar\" que navega a la lección
- [ ] Estado vacío si completó todo el curso

## Agente
\`frontend-developer\`" \
  "Sprint 2"

# =============================================================================
# EPIC: QUIZ (6 tickets) - Sprint 2
# =============================================================================
echo ""
echo "EPIC: QUIZ (6 tickets)"

create_issue_and_add_to_project \
  "QUIZ-001: Modelo de Quiz" \
  "epic:quiz,priority:high,size:S,api,sprint:2" \
  "## Descripción
Definir estructura de datos para quizzes embebidos en lecciones.

## Estructura (dentro de Lesson.sections JSON)
\`\`\`json
{
  \"quiz\": {
    \"passingScore\": 70,
    \"questions\": [
      {
        \"id\": \"q1\",
        \"type\": \"multiple_choice\",
        \"question\": \"¿Qué es un LLM?\",
        \"options\": [\"A\", \"B\", \"C\", \"D\"],
        \"correctAnswer\": 2,
        \"explanation\": \"Explicación de la respuesta correcta\"
      }
    ]
  }
}
\`\`\`

## Tipos de preguntas
- multiple_choice
- true_false
- code_completion

## Agente
\`api-developer\`" \
  "Sprint 2"

create_issue_and_add_to_project \
  "QUIZ-002: API Evaluar Quiz" \
  "epic:quiz,priority:high,size:M,api,sprint:2" \
  "## Descripción
Endpoint POST /api/lessons/:id/quiz para evaluar respuestas del quiz.

## Request
\`\`\`json
{
  \"answers\": {
    \"q1\": 2,
    \"q2\": true,
    \"q3\": \"print('hello')\"
  }
}
\`\`\`

## Response
\`\`\`json
{
  \"score\": 100,
  \"passed\": true,
  \"results\": [
    { \"questionId\": \"q1\", \"correct\": true, \"explanation\": \"...\" }
  ],
  \"xpBonus\": 50
}
\`\`\`

## Agente
\`api-developer\`" \
  "Sprint 2"

create_issue_and_add_to_project \
  "QUIZ-003: Componente Quiz Modal" \
  "epic:quiz,priority:high,size:L,frontend,sprint:2" \
  "## Descripción
Modal fullscreen para responder quiz al final de lección.

## Tareas
- [ ] Modal que cubre toda la pantalla
- [ ] Indicador de progreso (ej: Pregunta 1/5)
- [ ] Renderizar componente según tipo de pregunta
- [ ] Navegación entre preguntas (prev/next)
- [ ] Botón \"Enviar Respuestas\" al final
- [ ] Pantalla de resultados con score
- [ ] Mostrar explicaciones de respuestas

## Agente
\`frontend-developer\`" \
  "Sprint 2"

create_issue_and_add_to_project \
  "QUIZ-004: Componente MultipleChoice" \
  "epic:quiz,priority:high,size:S,frontend,sprint:2" \
  "## Descripción
Componente para preguntas de opción múltiple.

## Props
\`\`\`typescript
interface MultipleChoiceProps {
  question: string;
  options: string[];
  selectedAnswer: number | null;
  onSelect: (index: number) => void;
  disabled?: boolean;
  correctAnswer?: number; // Para mostrar resultado
}
\`\`\`

## Estados visuales
- Opción no seleccionada
- Opción seleccionada
- Opción correcta (verde)
- Opción incorrecta (rojo)

## Agente
\`frontend-developer\`" \
  "Sprint 2"

create_issue_and_add_to_project \
  "QUIZ-005: Componente TrueFalse" \
  "epic:quiz,priority:high,size:S,frontend,sprint:2" \
  "## Descripción
Componente para preguntas de verdadero/falso.

## Similar a MultipleChoice pero con solo 2 opciones fijas:
- Verdadero
- Falso

## Agente
\`frontend-developer\`" \
  "Sprint 2"

create_issue_and_add_to_project \
  "QUIZ-006: Componente CodeCompletion" \
  "epic:quiz,priority:medium,size:M,frontend,sprint:3" \
  "## Descripción
Componente para preguntas de completar código.

## Tareas
- [ ] Mostrar código con placeholder (_____)
- [ ] Input de texto para la respuesta
- [ ] Syntax highlighting del contexto
- [ ] Validación de respuesta

## Agente
\`frontend-developer\`" \
  "Sprint 3"

# =============================================================================
# EPIC: GAMIFICATION (12 tickets) - Sprints 1-3
# =============================================================================
echo ""
echo "EPIC: GAMIFICATION (12 tickets)"

create_issue_and_add_to_project \
  "GAME-001: Sistema de Streaks - Backend" \
  "epic:gamification,priority:critical,size:L,api,sprint:1" \
  "## Descripción
Implementar sistema completo de rachas diarias.

## Tareas
- [ ] Modelo StreakLog (ya existe en schema)
- [ ] Endpoint POST /api/streaks/checkin
- [ ] Verificar si ya hizo check-in hoy
- [ ] Calcular si racha continúa o se resetea
- [ ] Calcular bonus XP según duración de racha
- [ ] Actualizar currentStreak y longestStreak

## Lógica de Racha
\`\`\`
Si último check-in fue ayer → streak + 1
Si último check-in fue hoy → retornar \"ya hizo check-in\"
Si último check-in fue antes de ayer → streak = 1 (reset)
\`\`\`

## Bonus XP por Racha
| Días | Bonus |
|------|-------|
| 1-2 | 5 XP |
| 3-6 | 10 XP |
| 7-13 | 25 XP |
| 14-29 | 50 XP |
| 30+ | 100 XP |

## Agente
\`api-developer\`" \
  "Sprint 1"

create_issue_and_add_to_project \
  "GAME-002: Sistema de Badges - Backend" \
  "epic:gamification,priority:high,size:L,api,sprint:2" \
  "## Descripción
Implementar verificación y otorgamiento automático de badges.

## Tareas
- [ ] Modelo Badge y UserBadge (ya existen en schema)
- [ ] Función checkAndAwardBadges(userId)
- [ ] Verificar cada tipo de requisito
- [ ] No otorgar badges duplicados
- [ ] Agregar XP bonus cuando se gana badge

## Tipos de Requisitos
\`\`\`typescript
type BadgeRequirement =
  | { lessonsCompleted: number }
  | { streak: number }
  | { level: number }
  | { totalXp: number }
  | { weekComplete: number }
  | { perfectQuizzes: number }
  | { game: string; score: number }
\`\`\`

## Agente
\`api-developer\`" \
  "Sprint 2"

create_issue_and_add_to_project \
  "GAME-003: Seed de Badges" \
  "epic:gamification,priority:high,size:M,api,sprint:2" \
  "## Descripción
Script para insertar los 15 badges iniciales en la DB.

## Badges a Crear
- first-lesson: Primer Paso (1 lección)
- streak-3: En Racha (3 días)
- streak-7: Semana Perfecta (7 días)
- streak-30: Dedicación Total (30 días)
- level-5: Embedding Explorer (nivel 5)
- level-10: LLM Engineer (nivel 10)
- week-1-complete: Fundamentos (semana 1)
- week-4-complete: RAG Master (semana 4)
- week-8-complete: Graduado (semana 8)
- quiz-master: Cerebrito (10 quizzes perfectos)
- speed-learner: Veloz (5 lecciones en un día)
- xp-1000: Mil XP
- xp-5000: 5K Club
- game-winner: Gamer (3 juegos ganados)
- prompt-golfer: Golfista (par en Prompt Golf)

## Agente
\`api-developer\`" \
  "Sprint 2"

create_issue_and_add_to_project \
  "GAME-004: API Get Badges" \
  "epic:gamification,priority:high,size:S,api,sprint:2" \
  "## Descripción
Endpoint GET /api/badges para obtener badges del usuario.

## Response
\`\`\`json
{
  \"earned\": [
    { \"id\": \"...\", \"name\": \"Primer Paso\", \"icon\": \"🎯\", \"earnedAt\": \"2024-01-15\" }
  ],
  \"locked\": [
    { \"id\": \"...\", \"name\": \"En Racha\", \"icon\": \"⚡\", \"progress\": 2, \"target\": 3 }
  ]
}
\`\`\`

## Agente
\`api-developer\`" \
  "Sprint 2"

create_issue_and_add_to_project \
  "GAME-005: Componente ProgressCard" \
  "epic:gamification,priority:high,size:M,frontend,sprint:2" \
  "## Descripción
Card principal de progreso para mostrar en dashboard.

## Elementos
- Avatar circular con número de nivel
- Título de nivel actual
- Barra de progreso de XP
- Texto: \"X / Y XP para nivel Z\"
- Estadísticas: lecciones completadas, racha actual

## Agente
\`frontend-developer\`" \
  "Sprint 2"

create_issue_and_add_to_project \
  "GAME-006: Componente StreakBanner" \
  "epic:gamification,priority:high,size:M,frontend,sprint:2" \
  "## Descripción
Banner de racha con botón de check-in diario.

## Tareas
- [ ] Mostrar días de racha actual
- [ ] Emoji según duración (⚡ <7, 🔥 7-29, 💎 30+)
- [ ] Botón de check-in
- [ ] Estado visual si ya hizo check-in hoy
- [ ] Animación de éxito al hacer check-in
- [ ] Mostrar bonus XP ganado

## Agente
\`frontend-developer\`" \
  "Sprint 2"

create_issue_and_add_to_project \
  "GAME-007: Animación Level Up" \
  "epic:gamification,priority:medium,size:L,frontend,sprint:3" \
  "## Descripción
Celebración visual al subir de nivel.

## Tareas
- [ ] Modal/overlay fullscreen
- [ ] Animación de nivel anterior → nuevo
- [ ] Mostrar nuevo título del nivel
- [ ] Efectos visuales (particles, glow, etc.)
- [ ] Botón \"Continuar\" para cerrar

## Agente
\`frontend-developer\`" \
  "Sprint 3"

create_issue_and_add_to_project \
  "GAME-008: Notificación de Badge" \
  "epic:gamification,priority:medium,size:M,frontend,sprint:3" \
  "## Descripción
Toast/modal al ganar un badge nuevo.

## Tareas
- [ ] Toast animado desde arriba
- [ ] Mostrar icono emoji y nombre del badge
- [ ] Mostrar XP bonus ganado
- [ ] Auto-dismiss después de 4 segundos
- [ ] Cola de notificaciones si gana varios badges

## Agente
\`frontend-developer\`" \
  "Sprint 3"

create_issue_and_add_to_project \
  "GAME-009: Pantalla de Badges" \
  "epic:gamification,priority:medium,size:M,frontend,sprint:3" \
  "## Descripción
Vista completa de todos los badges disponibles.

## Tareas
- [ ] Grid de badges ganados (colores normales)
- [ ] Grid de badges bloqueados (grayed out)
- [ ] Modal de detalle al tocar badge
- [ ] Mostrar progreso hacia badges bloqueados
- [ ] Filtros por categoría (progreso, rachas, maestría)

## Agente
\`frontend-developer\`" \
  "Sprint 3"

create_issue_and_add_to_project \
  "GAME-010: Sistema de Multiplicadores XP" \
  "epic:gamification,priority:low,size:M,api,sprint:4" \
  "## Descripción
Multiplicadores de XP basados en condiciones especiales.

## Multiplicadores
- Racha 7+ días: x1.2
- Racha 30+ días: x1.5
- Primera lección del día: +50 XP bonus

## Agente
\`api-developer\`" \
  "Sprint 4"

create_issue_and_add_to_project \
  "GAME-011: Historial de XP" \
  "epic:gamification,priority:low,size:M,api,sprint:4" \
  "## Descripción
Endpoint GET /api/users/me/xp-history para ver historial de XP ganado.

## Response
\`\`\`json
{
  \"history\": [
    { \"date\": \"2024-01-15\", \"xp\": 250, \"sources\": [\"lesson\", \"streak\"] }
  ],
  \"totalThisWeek\": 800,
  \"averagePerDay\": 114
}
\`\`\`

## Agente
\`api-developer\`" \
  "Sprint 4"

create_issue_and_add_to_project \
  "GAME-012: Gráfico de Actividad" \
  "epic:gamification,priority:low,size:M,frontend,sprint:4" \
  "## Descripción
Gráfico estilo GitHub de actividad de los últimos 90 días.

## Tareas
- [ ] Grid de cuadrados (7 columnas x ~13 filas)
- [ ] Color por intensidad de XP ganado ese día
- [ ] Tooltip con detalles al hover/tap
- [ ] Responsive para diferentes tamaños

## Agente
\`frontend-developer\`" \
  "Sprint 4"

# =============================================================================
# EPIC: LEADERBOARD (5 tickets) - Sprint 2
# =============================================================================
echo ""
echo "EPIC: LEADERBOARD (5 tickets)"

create_issue_and_add_to_project \
  "LEAD-001: API Leaderboard Global" \
  "epic:leaderboard,priority:high,size:M,api,sprint:2" \
  "## Descripción
Endpoint GET /api/leaderboard?type=global para ranking total por XP.

## Tareas
- [ ] Query ordenada por totalXp DESC
- [ ] Límite de resultados (default 50)
- [ ] Incluir displayName, level, totalXp
- [ ] Marcar si es usuario actual (isCurrentUser)
- [ ] Calcular posición del usuario actual aunque no esté en top

## Response
\`\`\`json
{
  \"entries\": [
    { \"rank\": 1, \"userId\": \"...\", \"displayName\": \"Ana\", \"level\": 8, \"totalXp\": 4200, \"isCurrentUser\": false }
  ],
  \"userRank\": 42,
  \"totalUsers\": 1250
}
\`\`\`

## Agente
\`api-developer\`" \
  "Sprint 2"

create_issue_and_add_to_project \
  "LEAD-002: API Leaderboard Semanal" \
  "epic:leaderboard,priority:high,size:M,api,sprint:2" \
  "## Descripción
Ranking de XP ganado en la semana actual.

## Tareas
- [ ] Filtrar lesson completions por esta semana (lunes a domingo)
- [ ] Sumar XP ganado por usuario
- [ ] Ordenar y limitar resultados
- [ ] Reset automático cada lunes

## Agente
\`api-developer\`" \
  "Sprint 2"

create_issue_and_add_to_project \
  "LEAD-003: Pantalla de Leaderboard" \
  "epic:leaderboard,priority:high,size:L,frontend,sprint:2" \
  "## Descripción
UI de rankings con tabs para global y semanal.

## Tareas
- [ ] Tabs: Global | Semanal
- [ ] Lista de posiciones con scroll
- [ ] Top 3 destacado visualmente (🥇🥈🥉)
- [ ] Highlight del usuario actual con borde especial
- [ ] Pull to refresh
- [ ] Si usuario no está en top, mostrar su posición abajo

## Agente
\`frontend-developer\`" \
  "Sprint 2"

create_issue_and_add_to_project \
  "LEAD-004: Cambios de Posición" \
  "epic:leaderboard,priority:low,size:M,api,sprint:4" \
  "## Descripción
Calcular y mostrar cambio de posición respecto al día anterior.

## Tareas
- [ ] Guardar snapshot diario de posiciones
- [ ] Calcular delta (subió, bajó, igual)
- [ ] Incluir en response: +3, -1, =

## Agente
\`api-developer\`" \
  "Sprint 4"

create_issue_and_add_to_project \
  "LEAD-005: Widget de Ranking en Dashboard" \
  "epic:leaderboard,priority:medium,size:S,frontend,sprint:2" \
  "## Descripción
Mini preview del ranking en el dashboard.

## Tareas
- [ ] Mostrar top 3 con medallas
- [ ] Mostrar posición del usuario actual
- [ ] Link/botón a pantalla completa

## Agente
\`frontend-developer\`" \
  "Sprint 2"

# =============================================================================
# EPIC: GAMES (10 tickets) - Sprint 3
# =============================================================================
echo ""
echo "EPIC: GAMES (10 tickets)"

create_issue_and_add_to_project \
  "GAMES-001: Modelo GameSession" \
  "epic:games,priority:medium,size:S,api,sprint:3" \
  "## Descripción
Modelo Prisma para registrar sesiones de juego y scores.

## Schema
\`\`\`prisma
model GameSession {
  id        String   @id @default(cuid())
  userId    String
  gameType  String   // token-tetris, prompt-golf, embedding-match
  score     Int
  xpEarned  Int
  metadata  Json?    // datos adicionales del juego
  playedAt  DateTime @default(now())
  user      User     @relation(...)
}
\`\`\`

## Agente
\`api-developer\`" \
  "Sprint 3"

create_issue_and_add_to_project \
  "GAMES-002: API Submit Game Score" \
  "epic:games,priority:medium,size:M,api,sprint:3" \
  "## Descripción
Endpoint POST /api/games/:type/score para guardar puntaje.

## Request
\`\`\`json
{
  \"score\": 5000,
  \"metadata\": { \"level\": 5, \"time\": 120 }
}
\`\`\`

## Response
\`\`\`json
{
  \"xpEarned\": 50,
  \"isHighScore\": true,
  \"rank\": 15,
  \"newBadges\": []
}
\`\`\`

## Agente
\`api-developer\`" \
  "Sprint 3"

create_issue_and_add_to_project \
  "GAMES-003: API Game Leaderboard" \
  "epic:games,priority:low,size:S,api,sprint:3" \
  "## Descripción
Endpoint GET /api/games/:type/leaderboard para ranking por juego.

## Agente
\`api-developer\`" \
  "Sprint 3"

create_issue_and_add_to_project \
  "GAMES-004: Token Tetris - Game Logic" \
  "epic:games,priority:medium,size:XL,frontend,sprint:3" \
  "## Descripción
Implementar la lógica del juego Token Tetris.

## Mecánicas
- Los bloques son tokens de diferentes tamaños (1-4 caracteres)
- Los tokens pueden formar \"palabras\" al combinarse horizontalmente
- Completar una línea = eliminar
- Palabra válida = bonus de puntos

## Tareas
- [ ] Game loop con requestAnimationFrame
- [ ] Física de caída de bloques
- [ ] Rotación de piezas
- [ ] Detección de colisiones
- [ ] Sistema de puntuación
- [ ] Niveles con velocidad creciente
- [ ] Detección de Game Over

## Agente
\`game-developer\`" \
  "Sprint 3"

create_issue_and_add_to_project \
  "GAMES-005: Token Tetris - UI" \
  "epic:games,priority:medium,size:L,frontend,sprint:3" \
  "## Descripción
Interfaz visual de Token Tetris.

## Tareas
- [ ] Canvas o View del tablero de juego
- [ ] Preview de siguiente pieza
- [ ] Score display actualizado
- [ ] Level display
- [ ] Controles touch (swipe) y keyboard
- [ ] Botón Pause/Resume
- [ ] Pantalla de Game Over
- [ ] Botón para submit score

## Agente
\`game-developer\`" \
  "Sprint 3"

create_issue_and_add_to_project \
  "GAMES-006: Prompt Golf - Backend" \
  "epic:games,priority:medium,size:L,api,sprint:3" \
  "## Descripción
Backend para evaluar prompts en el juego Prompt Golf.

## Tareas
- [ ] Endpoint GET /api/games/prompt-golf/holes (lista de niveles)
- [ ] Endpoint POST /api/games/prompt-golf/attempt (evaluar intento)
- [ ] Contar tokens del prompt enviado
- [ ] Llamar a LLM para generar output
- [ ] Comparar output con target esperado
- [ ] Calcular score (par, birdie, bogey, etc.)

## Agente
\`game-developer\`" \
  "Sprint 3"

create_issue_and_add_to_project \
  "GAMES-007: Prompt Golf - Frontend" \
  "epic:games,priority:medium,size:L,frontend,sprint:3" \
  "## Descripción
UI del juego Prompt Golf.

## Tareas
- [ ] Selector de hole (nivel)
- [ ] Mostrar descripción del objetivo
- [ ] Input de prompt multilínea
- [ ] Contador de tokens en vivo mientras escribe
- [ ] Botón \"Enviar\"
- [ ] Visualización del resultado del LLM
- [ ] Scorecard con todos los holes
- [ ] Comparar con par

## Agente
\`game-developer\`" \
  "Sprint 3"

create_issue_and_add_to_project \
  "GAMES-008: Embedding Match - Backend" \
  "epic:games,priority:low,size:M,api,sprint:4" \
  "## Descripción
Backend para juego de similitud semántica.

## Tareas
- [ ] Endpoint GET /api/games/embedding-match/level/:level
- [ ] Endpoint POST /api/games/embedding-match/verify
- [ ] Pre-calcular embeddings de pares de frases
- [ ] Verificar matches correctos

## Agente
\`game-developer\`" \
  "Sprint 4"

create_issue_and_add_to_project \
  "GAMES-009: Embedding Match - Frontend" \
  "epic:games,priority:low,size:L,frontend,sprint:4" \
  "## Descripción
UI del juego Embedding Match (memory de similitud semántica).

## Tareas
- [ ] Grid de cartas (4x4 o similar)
- [ ] Animación de flip al seleccionar
- [ ] Timer countdown
- [ ] Score display
- [ ] Verificación de pares semánticamente similares
- [ ] Feedback visual (correcto verde, incorrecto rojo)
- [ ] Niveles de dificultad

## Agente
\`game-developer\`" \
  "Sprint 4"

create_issue_and_add_to_project \
  "GAMES-010: Pantalla Hub de Juegos" \
  "epic:games,priority:medium,size:M,frontend,sprint:3" \
  "## Descripción
Pantalla de selección de mini-juegos disponibles.

## Tareas
- [ ] Grid de juegos disponibles
- [ ] Card por juego con icono, nombre, descripción
- [ ] Mostrar high score personal
- [ ] Estado bloqueado/desbloqueado (si aplica)
- [ ] Navegación a cada juego

## Agente
\`frontend-developer\`" \
  "Sprint 3"

# =============================================================================
# EPIC: DASHBOARD (4 tickets) - Sprint 1
# =============================================================================
echo ""
echo "EPIC: DASHBOARD (4 tickets)"

create_issue_and_add_to_project \
  "DASH-001: Pantalla Dashboard Principal" \
  "epic:dashboard,priority:critical,size:L,frontend,sprint:1" \
  "## Descripción
Pantalla principal que ve el usuario después de login.

## Tareas
- [ ] Header con saludo personalizado y avatar
- [ ] StreakBanner (check-in y racha)
- [ ] ProgressCard (nivel, XP, stats)
- [ ] Widget de próxima lección
- [ ] Grid de acciones rápidas
- [ ] Pull to refresh

## Layout
\`\`\`
┌─────────────────────────┐
│ Hola, [Nombre]     [👤]  │
├─────────────────────────┤
│ [StreakBanner]          │
├─────────────────────────┤
│ [ProgressCard]          │
├─────────────────────────┤
│ Próxima Lección         │
│ [LessonCard]            │
├─────────────────────────┤
│ [📚] [🎮] [🏆] [👤]     │
└─────────────────────────┘
\`\`\`

## Agente
\`frontend-developer\`" \
  "Sprint 1"

create_issue_and_add_to_project \
  "DASH-002: Quick Actions Grid" \
  "epic:dashboard,priority:high,size:S,frontend,sprint:1" \
  "## Descripción
Botones de acceso rápido a secciones principales.

## Botones
- 📚 Lecciones → /lessons
- 🎮 Mini-juegos → /games
- 🏆 Ranking → /leaderboard
- 👤 Perfil → /profile

## Agente
\`frontend-developer\`" \
  "Sprint 1"

create_issue_and_add_to_project \
  "DASH-003: Header con Usuario" \
  "epic:dashboard,priority:high,size:S,frontend,sprint:1" \
  "## Descripción
Header del dashboard con información del usuario.

## Elementos
- Saludo: \"Hola, [displayName]\"
- Subtítulo: \"Continúa tu aprendizaje\"
- Avatar circular (tap navega a profile)

## Agente
\`frontend-developer\`" \
  "Sprint 1"

create_issue_and_add_to_project \
  "DASH-004: Fetch Inicial de Datos" \
  "epic:dashboard,priority:high,size:M,frontend,sprint:1" \
  "## Descripción
Cargar todos los datos necesarios al entrar al dashboard.

## Datos a cargar en paralelo
- GET /users/me (info del usuario)
- GET /users/me/progress (XP, nivel, racha)
- GET /lessons/next (próxima lección)

## Tareas
- [ ] Queries paralelas con RTK Query
- [ ] Loading state combinado (skeleton)
- [ ] Error handling con retry
- [ ] Refresh en pull-to-refresh

## Agente
\`frontend-developer\`" \
  "Sprint 1"

# =============================================================================
# EPIC: PROFILE (5 tickets) - Sprint 2-4
# =============================================================================
echo ""
echo "EPIC: PROFILE (5 tickets)"

create_issue_and_add_to_project \
  "PROF-001: Pantalla de Perfil" \
  "epic:profile,priority:high,size:L,frontend,sprint:2" \
  "## Descripción
Vista completa del perfil del usuario.

## Secciones
1. Header: Avatar grande, nombre, email, badge de nivel
2. Estadísticas: XP total, lecciones, mejor racha
3. Badges ganados (preview de 6)
4. Badges bloqueados (preview de 6)
5. Botón de logout

## Tareas
- [ ] Fetch de progress y badges
- [ ] Avatar con inicial del nombre
- [ ] Stats en grid de 3 columnas
- [ ] Preview de badges (mostrar 6 de cada tipo)
- [ ] Link \"Ver todos\" a pantalla de badges
- [ ] Botón logout con modal de confirmación

## Agente
\`frontend-developer\`" \
  "Sprint 2"

create_issue_and_add_to_project \
  "PROF-002: Editar Perfil" \
  "epic:profile,priority:low,size:M,frontend,sprint:4" \
  "## Descripción
Modal o pantalla para editar displayName.

## Tareas
- [ ] Input de displayName con valor actual
- [ ] Validación (2-50 caracteres)
- [ ] Mutation PATCH /users/me
- [ ] Feedback de éxito/error

## Agente
\`frontend-developer\`" \
  "Sprint 4"

create_issue_and_add_to_project \
  "PROF-003: Stats Detallados" \
  "epic:profile,priority:low,size:M,frontend,sprint:4" \
  "## Descripción
Vista expandida de estadísticas del usuario.

## Stats a mostrar
- Tiempo total de estudio
- Promedio de score en quizzes
- XP ganado por semana (gráfico simple)
- Lecciones completadas por semana
- Mejor racha histórica
- Fecha de registro

## Agente
\`frontend-developer\`" \
  "Sprint 4"

create_issue_and_add_to_project \
  "PROF-004: Historial de Actividad" \
  "epic:profile,priority:low,size:M,frontend,sprint:4" \
  "## Descripción
Timeline de actividad reciente del usuario.

## Eventos a mostrar
- Lecciones completadas
- Badges ganados
- Niveles alcanzados
- Juegos jugados (con score)

## Agente
\`frontend-developer\`" \
  "Sprint 4"

create_issue_and_add_to_project \
  "PROF-005: Configuraciones" \
  "epic:profile,priority:low,size:S,frontend,sprint:4" \
  "## Descripción
Pantalla de settings básicos de la app.

## Opciones
- Notificaciones (on/off) - v2
- Tema (dark/light) - v2
- Idioma - v2
- Sobre la app (versión)
- Cerrar sesión

## Agente
\`frontend-developer\`" \
  "Sprint 4"

# =============================================================================
# EPIC: INFRA (8 tickets) - Sprints 1-3
# =============================================================================
echo ""
echo "EPIC: INFRA (8 tickets)"

create_issue_and_add_to_project \
  "INFRA-001: Seed de Datos Iniciales" \
  "epic:infra,priority:critical,size:L,api,sprint:1" \
  "## Descripción
Script para popular la DB con datos de desarrollo/testing.

## Datos a crear
- Badges (15 badges)
- Lecciones de prueba (10 lecciones de semana 1-2)
- Usuario de prueba (test@example.com / password123)
- Algunos completions de ejemplo

## Comando
\`\`\`bash
npm run db:seed -w @llmengineer/api
\`\`\`

## Agente
\`api-developer\`" \
  "Sprint 1"

create_issue_and_add_to_project \
  "INFRA-002: Dockerfile API" \
  "epic:infra,priority:high,size:M,devops,sprint:3" \
  "## Descripción
Dockerfile optimizado para la API en producción.

## Tareas
- [ ] Multi-stage build (builder + runner)
- [ ] npm ci para instalación determinística
- [ ] Prisma generate en build
- [ ] Build de TypeScript
- [ ] Imagen final mínima (node:20-alpine)

## Agente
\`devops-engineer\`" \
  "Sprint 3"

create_issue_and_add_to_project \
  "INFRA-003: Docker Compose Local" \
  "epic:infra,priority:high,size:M,devops,sprint:1" \
  "## Descripción
Docker Compose para desarrollo local completo.

## Servicios
- postgres:15-alpine con volumen persistente
- api con hot reload (volume mount)
- web con hot reload (opcional)

## Ya existe docker-compose.yml, verificar y ajustar.

## Agente
\`devops-engineer\`" \
  "Sprint 1"

create_issue_and_add_to_project \
  "INFRA-004: GitHub Actions CI" \
  "epic:infra,priority:high,size:L,devops,sprint:3" \
  "## Descripción
Pipeline de CI completo para PRs y main.

## Jobs
1. lint-and-typecheck
2. test-api (con postgres service container)
3. build (todos los packages)
4. coverage check (mínimo 80%)

## Ya existe .github/workflows/ci.yml, verificar y ajustar.

## Agente
\`devops-engineer\`" \
  "Sprint 3"

create_issue_and_add_to_project \
  "INFRA-005: Deploy Vercel (Web)" \
  "epic:infra,priority:high,size:M,devops,sprint:3" \
  "## Descripción
Configurar deploy del frontend en Vercel.

## Tareas
- [ ] Crear vercel.json con configuración
- [ ] Configurar variables de entorno (EXPO_PUBLIC_API_URL)
- [ ] Preview deployments automáticos para PRs
- [ ] Production deploy en merge a main

## Agente
\`devops-engineer\`" \
  "Sprint 3"

create_issue_and_add_to_project \
  "INFRA-006: Deploy Railway (API)" \
  "epic:infra,priority:high,size:M,devops,sprint:3" \
  "## Descripción
Configurar deploy de la API en Railway.

## Tareas
- [ ] Crear railway.json o configurar via UI
- [ ] Agregar PostgreSQL addon
- [ ] Configurar variables de entorno
- [ ] Auto deploy en merge a main
- [ ] Health check endpoint

## Agente
\`devops-engineer\`" \
  "Sprint 3"

create_issue_and_add_to_project \
  "INFRA-007: Health Check Endpoint" \
  "epic:infra,priority:medium,size:S,api,sprint:3" \
  "## Descripción
Endpoint GET /health para monitoreo de la API.

## Response
\`\`\`json
{
  \"status\": \"ok\",
  \"timestamp\": \"2024-01-15T10:30:00Z\",
  \"database\": \"connected\",
  \"version\": \"1.0.0\"
}
\`\`\`

## Agente
\`api-developer\`" \
  "Sprint 3"

create_issue_and_add_to_project \
  "INFRA-008: Rate Limiting" \
  "epic:infra,priority:medium,size:M,api,sprint:4" \
  "## Descripción
Implementar rate limiting en la API para prevenir abuso.

## Límites sugeridos
- General: 100 requests/minuto
- Auth endpoints: 10 requests/minuto
- Game submissions: 30 requests/minuto

## Librería sugerida
@nestjs/throttler

## Agente
\`api-developer\`" \
  "Sprint 4"

# =============================================================================
# EPIC: TESTING (6 tickets) - Sprints 3-4
# =============================================================================
echo ""
echo "EPIC: TESTING (6 tickets)"

create_issue_and_add_to_project \
  "TEST-001: Setup Jest API" \
  "epic:testing,priority:high,size:M,api,sprint:3" \
  "## Descripción
Configurar Jest para testing de la API.

## Tareas
- [ ] jest.config.js con TypeScript support
- [ ] Setup de test database (SQLite o Postgres de prueba)
- [ ] Utilities para mock de Prisma
- [ ] Coverage thresholds (mínimo 80%)
- [ ] Scripts npm run test y npm run test:cov

## Agente
\`testing-engineer\`" \
  "Sprint 3"

create_issue_and_add_to_project \
  "TEST-002: Tests Unitarios AuthService" \
  "epic:testing,priority:high,size:M,api,sprint:3" \
  "## Descripción
Tests unitarios para el servicio de autenticación.

## Tests a implementar
- register: crea usuario con password hasheado
- register: rechaza email duplicado (ConflictException)
- login: retorna token válido con credenciales correctas
- login: rechaza password incorrecto (UnauthorizedException)
- validateUser: retorna usuario si token válido

## Agente
\`testing-engineer\`" \
  "Sprint 3"

create_issue_and_add_to_project \
  "TEST-003: Tests Unitarios LessonsService" \
  "epic:testing,priority:high,size:M,api,sprint:3" \
  "## Descripción
Tests unitarios para el servicio de lecciones.

## Tests a implementar
- findAll: retorna lecciones ordenadas por week/order
- findAll: incluye isCompleted correctamente
- complete: otorga XP base correcto
- complete: rechaza completar lección ya completada
- complete: dispara verificación de badges

## Agente
\`testing-engineer\`" \
  "Sprint 3"

create_issue_and_add_to_project \
  "TEST-004: Tests Unitarios GamificationService" \
  "epic:testing,priority:high,size:L,api,sprint:4" \
  "## Descripción
Tests para servicios de gamificación (XP, niveles, streaks, badges).

## Tests a implementar
- calculateLevel: edge cases (0 XP, exactamente 500, 499, etc.)
- addXp: detecta level up correctamente
- checkin: calcula streak continua si check-in ayer
- checkin: resetea streak si más de 1 día sin check-in
- checkBadges: otorga badges correctos según requisitos

## Agente
\`testing-engineer\`" \
  "Sprint 4"

create_issue_and_add_to_project \
  "TEST-005: Tests E2E Auth Flow" \
  "epic:testing,priority:medium,size:L,api,sprint:4" \
  "## Descripción
Tests end-to-end del flujo completo de autenticación.

## Flujo a testear
1. POST /auth/register → recibe user + token
2. POST /auth/login → recibe user + token
3. GET /users/me con token → datos correctos
4. GET /users/me sin token → 401 Unauthorized
5. GET /users/me con token expirado → 401

## Agente
\`testing-engineer\`" \
  "Sprint 4"

create_issue_and_add_to_project \
  "TEST-006: Tests de Componentes Frontend" \
  "epic:testing,priority:medium,size:L,frontend,sprint:4" \
  "## Descripción
Tests de componentes React Native con Jest + React Native Testing Library.

## Componentes a testear
- Button: renderiza variantes correctamente, llama onPress
- Input: muestra label/error, llama onChange
- ProgressCard: renderiza datos de progreso
- LessonCard: renderiza info de lección correctamente

## Agente
\`testing-engineer\`" \
  "Sprint 4"

# =============================================================================
# EPIC: CONTENT (4 tickets) - Sprints 1-4
# =============================================================================
echo ""
echo "EPIC: CONTENT (4 tickets)"

create_issue_and_add_to_project \
  "CONT-001: Loader de Lecciones JSON" \
  "epic:content,priority:high,size:M,api,sprint:1" \
  "## Descripción
Script para cargar lecciones desde el repo llmengineer-content.

## Tareas
- [ ] Leer archivos JSON de lessons/week-*/
- [ ] Validar estructura de cada JSON
- [ ] Upsert en database (crear o actualizar)
- [ ] Reportar errores de validación
- [ ] Comando: npm run content:sync

## Agente
\`api-developer\`" \
  "Sprint 1"

create_issue_and_add_to_project \
  "CONT-002: Validador de Contenido" \
  "epic:content,priority:medium,size:M,api,sprint:2" \
  "## Descripción
Validar estructura de archivos JSON de contenido antes de cargar.

## Validaciones
- Campos requeridos presentes (slug, title, description, week, order)
- Tipos de datos correctos
- Quiz questions tienen estructura válida
- XP rewards están en rangos válidos (50-500)
- Difficulty es uno de: beginner, intermediate, advanced

## Agente
\`api-developer\`" \
  "Sprint 2"

create_issue_and_add_to_project \
  "CONT-003: Loader de Badges JSON" \
  "epic:content,priority:medium,size:S,api,sprint:2" \
  "## Descripción
Script para cargar badges desde badges/badges.json.

## Tareas
- [ ] Leer badges.json del repo de contenido
- [ ] Validar estructura
- [ ] Upsert badges en database

## Agente
\`api-developer\`" \
  "Sprint 2"

create_issue_and_add_to_project \
  "CONT-004: Loader de Games Config" \
  "epic:content,priority:low,size:S,api,sprint:4" \
  "## Descripción
Cargar configuración de juegos desde JSON.

## Archivos
- games/token-tetris/config.json
- games/prompt-golf/config.json
- games/embedding-match/config.json

## Agente
\`api-developer\`" \
  "Sprint 4"

# =============================================================================
# RESUMEN FINAL
# =============================================================================
echo ""
echo "============================================"
echo "  ¡COMPLETADO!"
echo "============================================"
echo ""
echo "Issues creados: $TOTAL_CREATED"
echo "Issues fallidos/existentes: $TOTAL_FAILED"
echo ""
echo "Resumen por Epic:"
echo "  - AUTH: 8 tickets"
echo "  - USERS: 6 tickets"
echo "  - LESSONS: 14 tickets"
echo "  - QUIZ: 6 tickets"
echo "  - GAMIFICATION: 12 tickets"
echo "  - LEADERBOARD: 5 tickets"
echo "  - GAMES: 10 tickets"
echo "  - DASHBOARD: 4 tickets"
echo "  - PROFILE: 5 tickets"
echo "  - INFRA: 8 tickets"
echo "  - TESTING: 6 tickets"
echo "  - CONTENT: 4 tickets"
echo "  ─────────────────"
echo "  TOTAL: 72 tickets"
echo ""
echo "Ver proyecto Kanban en:"
echo "  https://github.com/users/$OWNER/projects/$PROJECT_NUMBER"
echo ""
echo "Ver issues en:"
echo "  https://github.com/$REPO/issues"
echo ""
echo "Próximos pasos:"
echo "  1. Revisar el proyecto en GitHub"
echo "  2. Configurar las vistas del board (Board view)"
echo "  3. Organizar por Sprint usando el campo personalizado"
echo "  4. Asignar issues a desarrolladores"
