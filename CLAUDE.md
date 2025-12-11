# LLM Engineer Platform - Instrucciones para Claude

## Proyecto
Plataforma gamificada de aprendizaje para LLM Engineering. Los usuarios aprenden a construir aplicaciones con LLMs en 8 semanas mediante lecciones, quizzes y mini-juegos.

## Stack Tecnológico

### Backend (apps/api)
- **NestJS 10.x** - Framework Node.js
- **Prisma** - ORM con PostgreSQL
- **JWT** - Autenticación con Passport
- **Swagger** - Documentación API en /api/docs

### Frontend (apps/web)
- **React Native + Expo 50.x** - Para web y móvil
- **Expo Router** - Navegación file-based
- **Redux Toolkit + RTK Query** - Estado y cache
- **React Native Reanimated** - Animaciones

### Packages Compartidos
- **packages/shared** - Tipos TypeScript y constantes
- **packages/ui** - Componentes UI base

## Estructura del Proyecto

```
llmengineer-platform/
├── apps/
│   ├── api/                    # Backend NestJS
│   │   ├── prisma/schema.prisma
│   │   └── src/
│   │       ├── auth/           # JWT, guards, login/register
│   │       ├── users/          # Usuarios y progreso
│   │       ├── lessons/        # Lecciones y completions
│   │       ├── badges/         # Sistema de insignias
│   │       ├── leaderboard/    # Rankings
│   │       ├── streaks/        # Rachas diarias
│   │       └── prisma/         # PrismaService
│   │
│   └── web/                    # Frontend Expo
│       ├── app/                # Rutas (Expo Router)
│       └── src/
│           ├── components/     # Componentes UI
│           ├── services/api.ts # RTK Query
│           └── store/          # Redux slices
│
├── packages/
│   ├── shared/src/
│   │   ├── types/              # User, Lesson, Badge, etc.
│   │   └── constants/          # XP_REWARDS, LEVEL_TITLES
│   └── ui/src/                 # Button, Input, Card, etc.
```

## Gestión de Tickets

### GitHub Issues
Los tickets están en GitHub con labels estructurados:
- **Epic**: `epic:auth`, `epic:lessons`, `epic:gamification`, etc.
- **Prioridad**: `priority:critical`, `priority:high`, `priority:medium`, `priority:low`
- **Size**: `size:S`, `size:M`, `size:L`, `size:XL`
- **Sprint**: `sprint:1`, `sprint:2`, `sprint:3`, `sprint:4`
- **Tipo**: `api`, `frontend`, `devops`

### Formato de Ticket
Cada ticket incluye en el body:
```markdown
## Descripción
[qué hacer]

## Tareas
- [ ] tarea 1
- [ ] tarea 2

## Criterios de Aceptación
- [ ] criterio 1

## Agente
`api-developer` | `frontend-developer` | `game-developer` | `devops-engineer` | `testing-engineer`
```

### Comandos de GitHub
```bash
# Listar tickets de un sprint
gh issue list --repo ismaeldosil/llmengineer-platform --label "sprint:1" --state open --json number,title,labels,body

# Cerrar ticket con comentario
gh issue close [número] --comment "Implementado en commit abc123"

# Crear ticket
gh issue create --title "EPIC-XXX: título" --label "epic:auth,priority:high,size:M,sprint:1" --body "..."
```

## Tipos de Agentes

### 1. api-developer
**Especialización**: Backend NestJS, Prisma, REST APIs
**Archivos**: `apps/api/src/`, `apps/api/prisma/`
**Tareas típicas**: Endpoints, servicios, DTOs, migraciones

### 2. frontend-developer
**Especialización**: React Native, Expo, Redux
**Archivos**: `apps/web/app/`, `apps/web/src/`
**Tareas típicas**: Pantallas, componentes, integración API

### 3. game-developer
**Especialización**: Lógica de juegos, animaciones
**Archivos**: `apps/web/app/games/`, `apps/web/src/components/games/`
**Tareas típicas**: Token Tetris, Prompt Golf, Embedding Match

### 4. devops-engineer
**Especialización**: Docker, CI/CD, deploys
**Archivos**: `docker-compose.yml`, `.github/workflows/`, `Dockerfile`
**Tareas típicas**: Pipelines, configuración, infraestructura

### 5. testing-engineer
**Especialización**: Jest, tests unitarios y E2E
**Archivos**: `*.spec.ts`, `*.test.ts`
**Tareas típicas**: Tests unitarios, coverage, E2E

## Convenciones de Código

### Commits (Conventional Commits)
```
feat: agregar endpoint de registro
fix: corregir validación de email
chore: actualizar dependencias
test: agregar tests de AuthService
docs: actualizar README
```

### Branches
```
feat/AUTH-001-registro-usuarios
fix/LESSONS-003-completar-leccion
chore/INFRA-002-dockerfile
```

### Pull Requests
- Título descriptivo
- Referenciar issue: `Closes #XX`
- Descripción de cambios
- Screenshots si hay UI

## Comandos Útiles

### Desarrollo
```bash
npm run dev              # Todos los servicios
npm run dev:api          # Solo API (localhost:3001)
npm run dev:web          # Solo Web (localhost:8081)
```

### Base de Datos
```bash
npm run db:generate -w @llmengineer/api   # Generar cliente Prisma
npm run db:push -w @llmengineer/api       # Push schema a DB
npm run db:studio -w @llmengineer/api     # Abrir Prisma Studio
```

### Testing
```bash
npm run test -w @llmengineer/api          # Tests unitarios
npm run test:cov -w @llmengineer/api      # Con coverage
npm run lint                               # ESLint
npm run typecheck                          # TypeScript check
```

## Flujo de Trabajo con Agentes

1. **Recibir ticket** del sprint o crear nuevo
2. **Identificar agente** según el tipo de trabajo
3. **Implementar** siguiendo patrones del proyecto
4. **Verificar** con lint/tests
5. **Commit** con conventional commit y referencia a issue
6. **Cerrar ticket** en GitHub

## Comandos Slash Disponibles

- `/sprint [n]` - Trabajar en sprint n
- `/ticket [descripción]` - Crear nuevo ticket con routing
- `/bug [descripción]` - Reportar y arreglar bug
- `/status` - Ver estado del sprint actual
