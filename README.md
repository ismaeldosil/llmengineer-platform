# LLM Engineer Platform

[![CI](https://github.com/ismaeldosil/llmengineer-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/ismaeldosil/llmengineer-platform/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/badge/coverage-90%25+-brightgreen)](https://github.com/ismaeldosil/llmengineer-platform)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.x-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Expo](https://img.shields.io/badge/Expo-50.x-000020?logo=expo&logoColor=white)](https://expo.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Code Style](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io/)

Plataforma gamificada de aprendizaje para LLM Engineering - Aprende a construir aplicaciones con LLMs en 8 semanas.

## Stack Tecnológico

### Frontend (apps/web)
- **React Native + Expo** - Para web y futuro soporte móvil
- **Expo Router** - Navegación file-based
- **Redux Toolkit + RTK Query** - Estado y cache de datos
- **React Native Reanimated** - Animaciones

### Backend (apps/api)
- **NestJS** - Framework de Node.js
- **Prisma** - ORM con PostgreSQL
- **JWT** - Autenticación
- **Swagger** - Documentación de API

### Packages Compartidos
- **@llmengineer/shared** - Tipos y constantes
- **@llmengineer/ui** - Componentes reutilizables

## Requisitos

- Node.js 20+
- npm 10+
- PostgreSQL 15+
- Docker (opcional, para desarrollo local)

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/ismaeldosil/llmengineer-platform.git
cd llmengineer-platform
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
# API
cp apps/api/.env.example apps/api/.env
# Editar apps/api/.env con tus valores
```

### 4. Configurar la base de datos

**Opción A: Docker (recomendado)**
```bash
docker-compose up -d postgres
```

**Opción B: PostgreSQL local**
```bash
# Crear base de datos manualmente
createdb llmengineer
```

### 5. Ejecutar migraciones

```bash
npm run db:push -w @llmengineer/api
```

### 6. Iniciar en desarrollo

```bash
# Todos los servicios
npm run dev

# O individualmente:
npm run dev:api    # Solo API (http://localhost:3001)
npm run dev:web    # Solo Web (http://localhost:8081)
```

## Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia todos los servicios
npm run dev:web          # Solo frontend
npm run dev:api          # Solo backend

# Build
npm run build            # Build de todos los packages

# Testing
npm run test             # Tests de todos los packages
npm run test:cov         # Tests con coverage

# Base de datos (API)
npm run db:generate -w @llmengineer/api  # Genera cliente Prisma
npm run db:migrate -w @llmengineer/api   # Ejecuta migraciones
npm run db:push -w @llmengineer/api      # Push schema a DB
npm run db:studio -w @llmengineer/api    # Abre Prisma Studio

# Contenido (sync lecciones)
cd apps/api && npx ts-node scripts/sync-from-ts.ts  # Sync desde TypeScript

# Linting
npm run lint             # ESLint
npm run typecheck        # TypeScript check
```

## Estructura del Proyecto

```
llmengineer-platform/
├── apps/
│   ├── api/                 # Backend NestJS
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── content/     # Contenido de lecciones (TypeScript)
│   │   ├── scripts/         # Scripts de sincronización
│   │   └── src/
│   │       ├── auth/        # Autenticación
│   │       ├── users/       # Usuarios y progreso
│   │       ├── lessons/     # Lecciones
│   │       ├── badges/      # Sistema de insignias
│   │       ├── leaderboard/ # Ranking
│   │       └── streaks/     # Sistema de rachas
│   │
│   └── web/                 # Frontend Expo
│       ├── app/             # Rutas (Expo Router)
│       └── src/
│           ├── components/  # Componentes UI
│           ├── features/    # Features por dominio
│           ├── services/    # API client (RTK Query)
│           └── store/       # Redux store
│
├── packages/
│   ├── shared/              # Tipos compartidos
│   └── ui/                  # Componentes UI base
│
├── docker-compose.yml       # Docker para desarrollo
└── package.json             # Monorepo config
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Usuario autenticado actual

### Users
- `GET /api/users/me` - Usuario actual
- `PATCH /api/users/me` - Actualizar perfil
- `GET /api/users/me/progress` - Progreso del usuario
- `GET /api/users/me/badges` - Insignias del usuario
- `GET /api/users/me/stats` - Estadísticas del usuario
- `GET /api/users/me/xp-history` - Historial de XP

### Lessons
- `GET /api/lessons` - Listar lecciones
- `GET /api/lessons/:id` - Detalle de lección
- `POST /api/lessons/:id/complete` - Completar lección

### Badges
- `GET /api/badges` - Todas las insignias disponibles

### Leaderboard
- `GET /api/leaderboard?type=global|weekly&limit=50&offset=0` - Ranking

### Streaks
- `POST /api/streaks/checkin` - Check-in diario

## Documentación de API

Con el servidor corriendo, visita:
- Swagger UI: http://localhost:3001/api/docs

## Desarrollo con Docker

```bash
# Levantar todos los servicios
docker-compose up

# Solo base de datos
docker-compose up -d postgres

# Rebuild
docker-compose up --build
```

## Testing

```bash
# Tests unitarios
npm run test -w @llmengineer/api

# Tests con coverage
npm run test:cov -w @llmengineer/api

# Tests e2e
npm run test:e2e -w @llmengineer/api
```

## Deployment

### Frontend (Vercel)
1. Conectar repositorio a Vercel
2. Configurar root directory: `apps/web`
3. Build command: `npm run build`

### Backend (Railway)
1. Conectar repositorio a Railway
2. Configurar variables de entorno
3. Start command: `npm run start:prod -w @llmengineer/api`

## Variables de Entorno

### API (.env)
```env
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=tu-secret-seguro
JWT_EXPIRES_IN=7d
PORT=3001
CORS_ORIGIN=http://localhost:8081
NODE_ENV=development
```

### Web
```env
EXPO_PUBLIC_API_URL=http://localhost:3001
```

## Contribuir

1. Fork el repositorio
2. Crear rama: `git checkout -b feat/mi-feature`
3. Commit: `git commit -m 'feat: agregar mi feature'`
4. Push: `git push origin feat/mi-feature`
5. Abrir Pull Request

## Licencia

MIT
