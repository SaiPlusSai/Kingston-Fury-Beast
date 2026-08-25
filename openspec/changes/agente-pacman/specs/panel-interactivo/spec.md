## Purpose

Define los requisitos de la interfaz de usuario web que permite observar de forma interactiva las decisiones del agente de aprendizaje por refuerzo y sus métricas asociadas.

## ADDED Requirements

### Requirement: Renderizado visual del juego
El panel interactivo MUST mostrar el estado visual del emulador (los frames del juego) para que el investigador observe la partida en tiempo real.

#### Scenario: Observación de partida activa
- **WHEN** el agente está interactuando con un episodio del entorno
- **THEN** el panel web actualiza su interfaz mostrando la representación visual del juego

### Requirement: Visualización de métricas de rendimiento
El panel interactivo MUST exponer gráficos e indicadores que detallen las métricas de entrenamiento (recompensa acumulada, tasa de exploración, etc.).

#### Scenario: Actualización de panel de control
- **WHEN** ocurre el final de un episodio o paso importante
- **THEN** el panel actualiza las métricas reflejando los valores calculados en ese punto del entrenamiento
