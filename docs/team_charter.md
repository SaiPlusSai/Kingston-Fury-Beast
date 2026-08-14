# Team Charter

## Integrantes, responsabilidades y disponibilidad
| Integrante | Responsabilidad inicial | Disponibilidad (ejemplo) | Restricción |
|---|---:|---|---|
| Sergio Arias | Developer | Mie, Vie 19:00-22:00 |  |
| Alan Flores | Scrum Master | Mie, Vie 19:00-22:00 |  |
| Kael Lopez | Developer | Mie, Vie 19:00-22:00 |  |
| Christhian Coronel | Developer | Mie, Vie 19:00-22:00 |  |


## Canales y tiempos de respuesta
- ClickUp: tareas, criterios de aceptación y enlaces a evidencia (24h respuesta).
- GitHub Issues/PRs: defectos técnicos, revisión de código y documentación.
- Discord: para reuniones del equipo.
- WhatsApp: coordinación rápida, no decisiones finales.
- Bloqueo crítico: etiquetar en ClickUp y notificar en el canal grupal.

## Revisión de PR
- Ningún cambio directo en `main` sin PR.
- Cada PR debe incluir: objetivo del cambio, archivos modificados, pruebas
	ejecutadas y evidencia (capturas, logs, enlaces a ClickUp).
- Al menos 1 revisor (preferible 2) que no sea autor; no aprobar PRs con tests
	rotos o con secretos.

## Manejo de bloqueos
Un bloqueo debe contener:
- Qué impide avanzar
- Desde cuándo ocurre
- Qué se intentó
- Qué ayuda se necesita
- Qué entrega está en riesgo

Ejemplo:
```
Bloqueo: acceso al dataset principal
Inicio: 2026-08-12
Impacto: no se puede validar factibilidad
Intentos: correo al responsable, buscar dataset alternativo
Siguiente acción: usar muestra pública temporal y registrar riesgo en ClickUp
```

## Reglas de integridad y uso de IA
- Se permite IA para análisis, diseño, código y documentación.
- No subir datos personales, credenciales, tokens ni información sensible a
	herramientas externas.
- Todo código generado por IA debe revisarse, entenderse y probarse antes de
	integrarlo.

## Definition of Done (DoD) inicial
Una tarea se considera terminada cuando:
- Cumple su criterio de aceptación.
- Está enlazada en ClickUp con evidencia reproducible.
- El cambio está en GitHub con commit/PR revisado.
- No incluye secretos ni datos sensibles.
- Si aplica, las pruebas pasan o se justifica su ausencia.

## Versionado y aprobación
- Este `team_charter.md` se versiona en `docs/` del repositorio.
- Cambios mayores requieren PR con aprobación de al menos 2 integrantes.

---
Fecha de versión: 2026-08-13

Aprobado por: Sergio Arias, Alan Flores, Kael Lopez, Christhian Coronel
