#!/bin/bash

# Script para crear GitHub Issues del MVP
# Ejecutar desde la raíz del repositorio

set -e

REPO="ismaeldosil/llmengineer-platform"

echo "Creando labels..."

# Crear labels si no existen
gh label create "epic:auth" --color "0052CC" --description "Autenticación y usuarios" --repo $REPO 2>/dev/null || true
gh label create "epic:lessons" --color "5319E7" --description "Sistema de lecciones" --repo $REPO 2>/dev/null || true
gh label create "epic:gamification" --color "FBCA04" --description "XP, niveles, badges" --repo $REPO 2>/dev/null || true
gh label create "epic:leaderboard" --color "B60205" --description "Rankings" --repo $REPO 2>/dev/null || true
gh label create "epic:profile" --color "0E8A16" --description "Perfil de usuario" --repo $REPO 2>/dev/null || true
gh label create "epic:games" --color "D93F0B" --description "Mini-juegos" --repo $REPO 2>/dev/null || true
gh label create "epic:infra" --color "006B75" --description "Infraestructura" --repo $REPO 2>/dev/null || true
gh label create "priority:high" --color "B60205" --description "Alta prioridad" --repo $REPO 2>/dev/null || true
gh label create "priority:medium" --color "FBCA04" --description "Prioridad media" --repo $REPO 2>/dev/null || true
gh label create "priority:low" --color "0E8A16" --description "Baja prioridad" --repo $REPO 2>/dev/null || true
gh label create "size:S" --color "C5DEF5" --description "Pequeño (~2h)" --repo $REPO 2>/dev/null || true
gh label create "size:M" --color "BFD4F2" --description "Mediano (~4h)" --repo $REPO 2>/dev/null || true
gh label create "size:L" --color "A2C6E9" --description "Grande (~8h)" --repo $REPO 2>/dev/null || true
gh label create "size:XL" --color "84B6E0" --description "Extra grande (~16h)" --repo $REPO 2>/dev/null || true

echo "Creando issues de Sprint 1..."

# TICKET-001
gh issue create \
  --title "TICKET-001: Sistema de registro de usuarios" \
  --label "epic:auth,priority:high,size:M" \
  --body "## Descripción
Implementar el flujo completo de registro de usuarios.

## Tareas
- [ ] Validación de email único
- [ ] Hash de password con bcrypt
- [ ] Creación de UserProgress inicial
- [ ] Respuesta con JWT token
- [ ] Tests unitarios del servicio

## Criterios de aceptación
- Usuario puede registrarse con email, password y displayName
- Password tiene mínimo 6 caracteres
- Se retorna token JWT válido
- Se crea progreso inicial con nivel 1

## Agente asignado
\`api-developer\`" \
  --repo $REPO

# TICKET-002
gh issue create \
  --title "TICKET-002: Sistema de login" \
  --label "epic:auth,priority:high,size:S" \
  --body "## Descripción
Implementar autenticación de usuarios existentes.

## Tareas
- [ ] Validación de credenciales
- [ ] Comparación de password hasheado
- [ ] Generación de JWT
- [ ] Manejo de errores (401)

## Criterios de aceptación
- Login exitoso retorna user + token
- Credenciales inválidas retornan 401
- Token expira según configuración

## Agente asignado
\`api-developer\`" \
  --repo $REPO

# TICKET-003
gh issue create \
  --title "TICKET-003: Pantalla de Login (Web)" \
  --label "epic:auth,priority:high,size:M" \
  --body "## Descripción
Crear la UI de login con validaciones.

## Tareas
- [ ] Formulario con email y password
- [ ] Validación client-side
- [ ] Integración con API (RTK Query)
- [ ] Manejo de errores
- [ ] Redirect a dashboard en éxito

## Criterios de aceptación
- Formulario funcional con validaciones
- Muestra errores de API
- Guarda token en estado Redux

## Agente asignado
\`frontend-developer\`" \
  --repo $REPO

# TICKET-004
gh issue create \
  --title "TICKET-004: Pantalla de Registro (Web)" \
  --label "epic:auth,priority:high,size:M" \
  --body "## Descripción
Crear la UI de registro con validaciones.

## Tareas
- [ ] Formulario con todos los campos
- [ ] Validación de passwords coincidentes
- [ ] Indicador de fortaleza de password
- [ ] Integración con API

## Agente asignado
\`frontend-developer\`" \
  --repo $REPO

# TICKET-005
gh issue create \
  --title "TICKET-005: API de listado de lecciones" \
  --label "epic:lessons,priority:high,size:M" \
  --body "## Descripción
Endpoint para obtener todas las lecciones con estado de completado.

## Tareas
- [ ] Query de lecciones publicadas
- [ ] Join con completions del usuario
- [ ] Ordenar por semana y orden
- [ ] Agregar flag isCompleted

## Criterios de aceptación
- Retorna lecciones ordenadas
- Incluye estado de completado por usuario
- Solo retorna lecciones publicadas

## Agente asignado
\`api-developer\`" \
  --repo $REPO

# TICKET-006
gh issue create \
  --title "TICKET-006: API de completar lección" \
  --label "epic:lessons,priority:high,size:L" \
  --body "## Descripción
Endpoint para marcar una lección como completada y otorgar XP.

## Tareas
- [ ] Validar que lección existe
- [ ] Verificar no duplicado
- [ ] Crear LessonCompletion
- [ ] Incrementar lessonsCompleted
- [ ] Llamar a addXp del usuario
- [ ] Trigger verificación de badges

## Criterios de aceptación
- No permite completar dos veces
- Otorga XP correctamente
- Actualiza nivel si corresponde
- Verifica badges automáticamente

## Agente asignado
\`api-developer\`" \
  --repo $REPO

# TICKET-007
gh issue create \
  --title "TICKET-007: Pantalla de lista de lecciones" \
  --label "epic:lessons,priority:high,size:M" \
  --body "## Descripción
UI para ver todas las lecciones agrupadas por semana.

## Tareas
- [ ] Fetch de lecciones con RTK Query
- [ ] Agrupar por semana
- [ ] Mostrar estado (completada/pendiente)
- [ ] Mostrar XP y dificultad
- [ ] Navegación a detalle

## Agente asignado
\`frontend-developer\`" \
  --repo $REPO

# TICKET-008
gh issue create \
  --title "TICKET-008: Pantalla de detalle de lección" \
  --label "epic:lessons,priority:high,size:L" \
  --body "## Descripción
UI para ver y completar una lección.

## Tareas
- [ ] Mostrar contenido de secciones
- [ ] Renderizar bloques de código
- [ ] Botón de completar
- [ ] Animación de XP ganado
- [ ] Mostrar quiz si existe

## Agente asignado
\`frontend-developer\`" \
  --repo $REPO

# TICKET-009
gh issue create \
  --title "TICKET-009: Cálculo de niveles y XP" \
  --label "epic:gamification,priority:high,size:M" \
  --body "## Descripción
Implementar la lógica de cálculo de niveles basada en XP.

## Tareas
- [ ] Función calculateLevel(xp)
- [ ] Función getLevelTitle(level)
- [ ] Actualizar nivel en addXp
- [ ] Tests de edge cases

## Criterios de aceptación
- 500 XP por nivel
- 10 títulos de nivel diferentes
- Actualiza correctamente al subir

## Agente asignado
\`api-developer\`" \
  --repo $REPO

# TICKET-010
gh issue create \
  --title "TICKET-010: Sistema de rachas (Streaks)" \
  --label "epic:gamification,priority:high,size:M" \
  --body "## Descripción
Implementar check-in diario y cálculo de rachas.

## Tareas
- [ ] Endpoint POST /streaks/checkin
- [ ] Verificar check-in del día
- [ ] Calcular racha continua
- [ ] Bonus XP por racha
- [ ] Actualizar longestStreak

## Criterios de aceptación
- Solo un check-in por día
- Racha se resetea si pierde un día
- Bonus XP según duración de racha

## Agente asignado
\`api-developer\`" \
  --repo $REPO

# TICKET-023
gh issue create \
  --title "TICKET-023: Seed de datos iniciales" \
  --label "epic:infra,priority:high,size:M" \
  --body "## Descripción
Script para popular la base de datos con datos iniciales.

## Tareas
- [ ] Seed de badges
- [ ] Seed de lecciones de muestra
- [ ] Usuario de prueba
- [ ] Script npm run db:seed

## Agente asignado
\`api-developer\`" \
  --repo $REPO

echo "Sprint 1 issues creados!"
echo ""
echo "Para crear issues de Sprint 2 y 3, ejecutar:"
echo "  ./scripts/create-github-issues-sprint2.sh"
echo "  ./scripts/create-github-issues-sprint3.sh"
