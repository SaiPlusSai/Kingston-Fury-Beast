# Estructura del Tablero ClickUp

Este documento traduce nuestro flujo de trabajo a un tablero operativo en ClickUp, definiendo las listas (columnas), los campos obligatorios y el proceso para que la evidencia quede versionada correctamente, según las reglas del equipo.

## 1. Listas del Tablero (Tipos de Trabajo)
El tablero de nuestro proyecto (HALO) está dividido en las siguientes listas. Cada tarea se crea o se mueve donde corresponde:

| Lista | Uso típico |
|---|---|
| **Discovery** | Definición de problema, usuarios, Product Goal, priorización de casos y requerimientos. |
| **Data** | Fuentes de datos, permisos, limpieza, contratos y versionado. |
| **Architecture** | Diagramas, ADR (Architecture Decision Records), decisiones técnicas y riesgos. |
| **Build / QA / Deploy** | Implementación, pruebas, empaquetado y despliegue del sistema. |
| **Risk** | Bloqueos, amenazas, mitigaciones y seguimiento. |

## 2. Campos Obligatorios
Para que una tarea se considere bien definida (y no solo una intención), debe contener obligatoriamente los siguientes campos personalizados:

*  **Sprint:** (Ej: Sprint 0, Sprint 1) Para saber en qué iteración se completó.
*  **Dueño (Responsable):** Quién o quiénes se encargan de ejecutar la tarea.
*  **Criterio de Aceptación:** Qué condición técnica u observable debe cumplirse para considerar la tarea "terminada".
*  **Enlace a Evidencia:** URL directa al archivo o commit en GitHub donde se versionó el resultado.
*  **Riesgo Asociado:** Qué problema podría impedir o afectar la ejecución de esta tarea.
*  **Estado de Bloqueo:** Para reportar rápidamente si la tarea no puede avanzar.

## 3. Estados de las Tareas (Flujo)
El progreso de las tareas se medirá moviéndolas por los siguientes estados:

1. **Pendiente:** Tarea creada y lista para ser abordada.
2. **En Curso:** Tarea siendo trabajada actualmente por el/los responsables.
3. **En Revisión:** Tarea finalizada técnicamente, esperando aprobación a través de un Pull Request en GitHub.
4. **Completada:** Tarea fusionada (merged) en la rama principal tras cumplir los criterios de aceptación y el Definition of Done.

