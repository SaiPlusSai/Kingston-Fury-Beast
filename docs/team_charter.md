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

**Ejemplo de reporte de bloqueo (Caso Pacman):**
```text
Impedimento: Errores de instalación de Gymnasium con ALE en Windows.
Inició: Hace 2 días.
Consecuencia: Retrasa el Hito 1 (entrenamiento del agente base).
Acciones previas: Intenté reinstalar conda y hacer downgrade de Python, pero el error persiste.
Siguiente paso: Pedí ayuda por WhatsApp a Christhian para revisar si podemos empaquetar el entorno en Docker para evitar esto.
```

## Reglas de integridad y uso de IA
- **Herramientas permitidas:** Fomentamos el uso de asistentes como ChatGPT, Claude o GitHub Copilot para acelerar el desarrollo, depurar modelos o pulir documentación.
- **Privacidad:** Está totalmente prohibido compartir credenciales, URLs de bases de datos o datos sensibles en los prompts de la IA.
- **Revisión obligatoria:** Copiar y pegar a ciegas es inaceptable. Todo bloque generado por IA debe ser analizado, comprendido y probado localmente por el autor antes de subirlo al repo.
- **Responsabilidad:** El dueño de la tarea en ClickUp es el responsable final de que el código funcione y sea explicable, sin importar si lo escribió a mano o con asistencia de IA.

## Definition of Done inicial
Para considerar que una tarea pasó de "En progreso" a "Completada", verificamos que:
1. Satisface las condiciones y criterios de aceptación definidos en ClickUp.
2. Existe un enlace en la tarea apuntando directamente al Pull Request o commit en GitHub.
3. El código fue revisado, aprobado y fusionado en GitHub sin exponer datos sensibles.
4. Si la tarea implica entrenamiento, el modelo corre sin errores locales.
5. Si se utilizó IA intensivamente para la tarea, se declaró su uso en la revisión.
