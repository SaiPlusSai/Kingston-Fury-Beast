# Team Charter

## Integrantes y disponibilidad
| Integrante | Responsabilidad inicial | Disponibilidad | Restricción |
|---|---|---|---|
| Sergio Arias | Ingeniería + Enfoque en Valor / producto | Lun, Jue 18:00-21:00 | Trabaja hasta las 17:30 |
| Alan Flores | Ingeniería + Enfoque en Proceso / bloqueos | Mar, Jue 20:00-23:00 | No puede fines de semana |
| Kael Lopez | Ingeniería + Enfoque en Datos | Lun, Mie, Vie 19:00-21:00 | Conexión limitada en las mañanas |
| Christhian Coronel | Ingeniería + Enfoque en Modelo / IA | Mar, Mie, Vie 19:00-22:00, Sáb 15:00-22:00, Dom 10:00-17:00 | Lunes y Jueves sin disponibilidad |

## Canales y tiempos de respuesta
- **Discord:** Canal principal para nuestras sesiones de pair programming y reuniones de sincronización.
- **WhatsApp:** Medio para coordinación rápida y emergencias. Los **bloqueos** (problemas que te impiden avanzar) se avisan de inmediato por aquí para buscar ayuda, con un SLA de respuesta del equipo de máximo 4 horas.
- **GitHub (Issues y PRs):** Para discutir detalles técnicos de código, decisiones de arquitectura y documentar la resolución de bugs. Tiempo esperado de revisión de PRs: máximo 24 horas.
- **ClickUp:** Únicamente para gestión formal de tareas, registro de riesgos y adjuntar los enlaces a las evidencias (commits).

## Revisión de PR
- **Bloqueo de main:** Queda prohibido hacer commits directos a la rama `main`. Toda subida de código pasa obligatoriamente por un PR.
- **Contenido obligatorio del PR:** Todo PR debe describir claramente qué problema resuelve, qué archivos toca, y adjuntar evidencia (un pantallazo, métricas generadas o el enlace al ticket de ClickUp).
- **Aprobaciones:** Requerimos la revisión de al menos 1 integrante que no sea el autor del código. Nunca fusionaremos si las pruebas fallan o si el linter expone secretos.
- **Transparencia con IA:** Si alguna porción sustancial de código o diseño se hizo usando IA, se debe detallar en los comentarios de dicho PR.

## Manejo de bloqueos
Cualquier obstáculo que detenga el desarrollo debe documentarse respondiendo a: ¿Qué me detiene?, ¿Cuándo empezó?, ¿Qué intenté hacer para solucionarlo?, ¿Qué necesito del equipo? y ¿Qué entrega está en riesgo?

**Ejemplo de reporte de bloqueo (Caso HALO):**
```text
Impedimento: Errores de compatibilidad entre Prophet y la versión de Python en AWS Lambda.
Inició: Hace 2 días.
Consecuencia: Retrasa el Hito 2 (despliegue del modelo predictivo de hotspots).
Acciones previas: Intenté empaquetar las librerías en un layer, pero excede el límite de 250MB.
Siguiente paso: Pedí ayuda por WhatsApp a Christhian para revisar si podemos usar Container Images (Docker) en Lambda para evitar esto.
```

## Reglas de integridad y uso de IA (Fase 2 — Verificación Humana Demostrable)
- **Protocolo Oficial:** Todo el equipo se rige por el marco documentado en [`declaracion_ia_evidencia_humana.md`](declaracion_ia_evidencia_humana.md).
- **Herramientas permitidas:** Asistentes como Antigravity (Google DeepMind), Claude o GitHub Copilot para acelerar el desarrollo, depurar modelos o estructurar documentación.
- **Privacidad y Cero Secretos:** Terminantemente prohibido compartir credenciales, secretos IAM, URLs de bases de datos o PII en los prompts.
- **Revisión Obligatoria y Auditoría de Alucinaciones:** Copiar y pegar a ciegas es inaceptable. Todo bloque asistido por IA debe ser analizado, contrastado contra la arquitectura (ADRs), corregido y probado localmente por el autor antes de subirlo al repo.
- **Responsabilidad Individual y Defensa Oral:** El dueño de la tarea en ClickUp asume la autoría completa y debe estar plenamente capacitado para justificar y defender cada decisión técnica ante el docente sin asistencia externa.

## Definition of Done (DoD)
Para considerar que una tarea pasó de "En progreso" a "Completada", verificamos que:
1. Satisface las condiciones y criterios de aceptación definidos en ClickUp.
2. Existe un enlace en la tarea apuntando directamente al Pull Request o commit en GitHub.
3. El código fue revisado, aprobado y fusionado en GitHub sin exponer datos sensibles.
4. Si la tarea implica modelos predictivos (Prophet) o el chatbot, estos se ejecutan sin errores locales y devuelven predicciones/respuestas válidas.
5. **Declaración y Verificación Humana de IA (Fase 2):** Si se utilizó IA para la tarea, se completó el checklist obligatorio en el PR y se registró la intervención en la Matriz de Verificación Humana.
