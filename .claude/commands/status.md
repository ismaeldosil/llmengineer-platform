Muestra el estado actual del desarrollo del proyecto LLM Engineer Platform.

## Instrucciones

1. **Fetch todos los issues** del repositorio:
   ```bash
   gh issue list --repo ismaeldosil/llmengineer-platform --state all --json number,title,labels,state --limit 200
   ```

2. **Agrupa y cuenta por estado**:
   - **Abiertos** (state: OPEN)
   - **Cerrados** (state: CLOSED)

3. **Agrupa por Sprint**:
   - Sprint 1: Filtra por label `sprint:1`
   - Sprint 2: Filtra por label `sprint:2`
   - Sprint 3: Filtra por label `sprint:3`
   - Sprint 4: Filtra por label `sprint:4`

4. **Agrupa por Epic** (solo abiertos):
   - auth, users, lessons, quiz, gamification, leaderboard, games, dashboard, profile, infra, testing, content

5. **Muestra resumen formateado**:

   ```
   ## Estado del Proyecto: LLM Engineer Platform

   ### Resumen General
   - Total tickets: XX
   - Completados: XX (XX%)
   - Pendientes: XX

   ### Por Sprint
   | Sprint | Total | Completados | Pendientes | Progreso |
   |--------|-------|-------------|------------|----------|
   | 1      | XX    | XX          | XX         | ██████░░ XX% |
   | 2      | XX    | XX          | XX         | ████░░░░ XX% |
   | 3      | XX    | XX          | XX         | ██░░░░░░ XX% |
   | 4      | XX    | XX          | XX         | ░░░░░░░░ XX% |

   ### Tickets Pendientes (Próximos a trabajar)

   #### Sprint 1 - Prioridad Alta
   - #XX: [Título] (epic:auth, api-developer)
   - #XX: [Título] (epic:lessons, frontend-developer)

   #### Sprint 1 - Prioridad Media
   - #XX: [Título] ...

   ### Por Epic (Pendientes)
   | Epic         | Pendientes |
   |--------------|------------|
   | auth         | X          |
   | lessons      | X          |
   | gamification | X          |
   ...
   ```

6. **Sugerencia de siguiente acción**:
   - Si hay tickets críticos pendientes, sugerir trabajar en ellos
   - Si sprint actual está casi completo, sugerir pasar al siguiente
   - Mostrar comando para comenzar: `/sprint [n]`

## Notas
- Los porcentajes se calculan sobre el total de cada sprint
- Priorizar mostrar tickets críticos y de alta prioridad primero
- Incluir el tipo de agente asignado para cada ticket pendiente
