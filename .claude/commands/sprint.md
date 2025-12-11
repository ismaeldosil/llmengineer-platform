Trabaja en el Sprint $ARGUMENTS del proyecto LLM Engineer Platform.

## Instrucciones

1. **Fetch tickets del sprint** ejecutando:
   ```bash
   gh issue list --repo ismaeldosil/llmengineer-platform --label "sprint:$ARGUMENTS" --state open --json number,title,labels,body --limit 100
   ```

2. **Ordena los tickets por prioridad**:
   - `priority:critical` → Primero
   - `priority:high` → Segundo
   - `priority:medium` → Tercero
   - `priority:low` → Último

3. **Para cada ticket**, en orden de prioridad:

   a. **Extrae el tipo de agente** del body del ticket (busca `## Agente` seguido de backticks)

   b. **Lee el prompt del agente** desde `.claude/agents/[tipo-agente].md`

   c. **Spawner subagente** usando Task tool con:
      - `subagent_type: "general-purpose"`
      - Prompt que incluya:
        - Contenido del archivo del agente como contexto
        - Número y título del ticket
        - Body completo del ticket
        - Instrucción de implementar siguiendo patrones del proyecto

   d. **Después de que el subagente termine**:
      - Verifica que el código compila (`npm run typecheck`)
      - Haz commit con mensaje: `feat(EPIC): descripción (#número)`
      - Cierra el issue: `gh issue close [número] --comment "Implementado en commit [hash]"`

4. **Continúa con el siguiente ticket** hasta completar el sprint

## Ejemplo de spawn de subagente

```
Task(
  subagent_type="general-purpose",
  prompt="
    # Contexto del Agente
    [contenido de .claude/agents/api-developer.md]

    # Ticket a Implementar
    **Issue #5**: AUTH-001: API de registro de usuarios

    ## Descripción
    [body del ticket]

    # Instrucciones
    Implementa este ticket siguiendo los patrones del proyecto.
    El código está en /Users/admin/Projects/fun-projects/LLMEngineer/llmengineer-platform

    Al terminar, indica qué archivos creaste/modificaste.
  "
)
```

## Notas
- Si un ticket tiene dependencias de otros tickets no completados, sáltalo y continúa
- Si hay errores de compilación, intenta arreglarlos antes de continuar
- Reporta el progreso al usuario periódicamente
