Bug reportado: $ARGUMENTS

## Instrucciones

1. **Investiga el bug** en el codebase:
   - Busca archivos relacionados con la descripción
   - Identifica la causa raíz probable
   - Determina el alcance del fix

2. **Determina el tipo de agente** según dónde está el bug:
   - Error en API/backend → `api-developer`
   - Error en UI/frontend → `frontend-developer`
   - Error en juegos → `game-developer`
   - Error de infra/deploy → `devops-engineer`
   - Error en tests → `testing-engineer`

3. **Determina el epic** según el área afectada:
   - Si es de auth → `epic:auth`
   - Si es de lecciones → `epic:lessons`
   - Si no encaja en ninguno → `epic:infra`

4. **Crea el ticket de bug** con prioridad alta:
   ```bash
   gh issue create \
     --repo ismaeldosil/llmengineer-platform \
     --title "BUG-[NNN]: [Descripción corta del bug]" \
     --label "epic:[epic],priority:high,size:S,bug,[tipo]" \
     --body "## Bug
   [Descripción del problema]

   ## Pasos para Reproducir
   1. [Paso 1]
   2. [Paso 2]
   3. [Resultado inesperado]

   ## Comportamiento Esperado
   [Qué debería pasar]

   ## Causa Probable
   [Tu análisis de la causa]

   ## Archivos Afectados
   - [archivo1]
   - [archivo2]

   ## Agente
   \`[tipo-agente]\`"
   ```

5. **Spawner subagente** para arreglar el bug:
   - Lee el prompt del agente correspondiente
   - Pásale el contexto del bug y los archivos afectados
   - Instruye que haga el fix y verifique

6. **Después del fix**:
   - Verifica que compila y pasa tests
   - Commit: `fix([epic]): [descripción] (#número)`
   - Cierra el issue con comentario del fix

## Ejemplo

Usuario: "el login no funciona, dice 401 aunque el password es correcto"

Investigación:
- Revisar apps/api/src/auth/auth.service.ts
- Verificar comparación de passwords con bcrypt
- Revisar apps/web/src/services/api.ts

Ticket: BUG-001: Login retorna 401 con credenciales válidas
Epic: auth
Agente: api-developer
Labels: epic:auth,priority:high,size:S,bug,api
