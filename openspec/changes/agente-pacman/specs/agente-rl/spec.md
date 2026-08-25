## Purpose

Define el comportamiento observable del agente autónomo entrenado mediante aprendizaje por refuerzo, especificando cómo interactúa con los entornos de simulación y qué decisiones toma.

## ADDED Requirements

### Requirement: Inicialización del entorno
El agente MUST poder instanciar y conectarse con un entorno compatible (ej. Gymnasium) para iniciar las simulaciones.

#### Scenario: Entorno inicializado exitosamente
- **WHEN** el sistema solicita iniciar una nueva partida
- **THEN** el entorno emulado carga su estado inicial y expone las observaciones iniciales al agente

### Requirement: Toma de decisiones del agente
El agente MUST recibir las observaciones del entorno en cada paso y devolver una acción válida definida por su política de aprendizaje.

#### Scenario: Acción enviada al emulador
- **WHEN** el entorno provee un estado y espera un movimiento
- **THEN** el modelo del agente evalúa el estado y selecciona la acción correspondiente (arriba, abajo, izquierda, derecha)
