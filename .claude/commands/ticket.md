Crea un nuevo ticket para: $ARGUMENTS

## Instrucciones

1. **Analiza la descripción** proporcionada por el usuario

2. **Determina los metadatos del ticket**:

   ### Epic (elige uno)
   - `auth` - Autenticación, login, registro, JWT
   - `users` - Usuarios, perfil, progreso
   - `lessons` - Lecciones, contenido, completions
   - `quiz` - Quizzes, preguntas, evaluación
   - `gamification` - XP, niveles, badges, streaks
   - `leaderboard` - Rankings, posiciones
   - `games` - Mini-juegos (Token Tetris, Prompt Golf, etc.)
   - `dashboard` - Pantalla principal
   - `profile` - Perfil de usuario
   - `infra` - Infraestructura, Docker, CI/CD
   - `testing` - Tests, coverage
   - `content` - Gestión de contenido, loaders

   ### Prioridad
   - `critical` - Bloqueante, debe hacerse ya
   - `high` - Importante, próximo en la cola
   - `medium` - Normal, puede esperar
   - `low` - Nice to have

   ### Size (estimación)
   - `S` - ~2 horas
   - `M` - ~4 horas
   - `L` - ~8 horas
   - `XL` - ~16 horas

   ### Agente
   - `api-developer` - Backend, APIs, base de datos
   - `frontend-developer` - UI, pantallas, componentes
   - `game-developer` - Juegos, mecánicas, animaciones
   - `devops-engineer` - Docker, CI/CD, deploys
   - `testing-engineer` - Tests, QA

   ### Sprint
   - `1` - Core MVP (auth, lessons básicas)
   - `2` - Gamificación (XP, badges, streaks)
   - `3` - Polish & Games
   - `4` - Testing & QA
   - `backlog` - Sin asignar

3. **Genera el siguiente número de ticket** consultando los issues existentes del epic

4. **Crea el body del ticket** con este formato:
   ```markdown
   ## Descripción
   [Descripción clara y concisa de qué hacer]

   ## Tareas
   - [ ] Tarea específica 1
   - [ ] Tarea específica 2
   - [ ] Tarea específica 3

   ## Criterios de Aceptación
   - [ ] Criterio verificable 1
   - [ ] Criterio verificable 2

   ## Notas Técnicas
   [Detalles de implementación si aplica]

   ## Agente
   `[tipo-agente]`
   ```

5. **Crea el issue en GitHub**:
   ```bash
   gh issue create \
     --repo ismaeldosil/llmengineer-platform \
     --title "[EPIC]-[NNN]: [Título descriptivo]" \
     --label "epic:[epic],priority:[priority],size:[size],sprint:[sprint],[tipo]" \
     --body "[body generado]"
   ```

6. **Muestra el ticket creado** y pregunta al usuario:
   - "Ticket creado: [URL]. ¿Quieres que comience a trabajar en él ahora?"

## Ejemplo

Usuario: "agregar validación de fortaleza de password en el registro"

→ Epic: auth
→ Prioridad: medium
→ Size: S
→ Agente: frontend-developer (es validación UI)
→ Sprint: 1

Título: AUTH-009: Validación de fortaleza de password en registro
Labels: epic:auth,priority:medium,size:S,sprint:1,frontend
