## Why

Para la materia de Taller de Sistemas Inteligentes, necesitamos desarrollar un proyecto que aplique Aprendizaje Automático en entornos simulados. Este cambio implementará un Agente Autónomo capaz de aprender a jugar Pacman utilizando Aprendizaje por Refuerzo (Reinforcement Learning), con el fin de tener un sistema modular que luego pueda adaptarse a otros juegos, y que provea un panel interactivo para monitorear sus decisiones en tiempo real.

## What Changes

- Integración de los entornos emulados (Gymnasium / Arcade Learning Environment) para Pacman.
- Implementación de un modelo de Aprendizaje por Refuerzo (Q-Learning / DQN / PPO) utilizando PyTorch y Stable-Baselines3.
- Creación de un panel web interactivo (Streamlit o Gradio) para visualizar las partidas en tiempo real y las métricas de entrenamiento (recompensas, loss, exploración).

## Capabilities

### New Capabilities
- `agente-rl`: Definición de la arquitectura del agente de Reinforcement Learning, sus recompensas y políticas de aprendizaje para el entorno de Pacman.
- `panel-interactivo`: Interfaz web para visualizar las métricas del modelo en tiempo real y el renderizado del entorno de juego.

### Modified Capabilities

## Impact

- **Código:** Creación de nuevos scripts de entrenamiento, evaluación e inferencia.
- **Dependencias:** Se agregarán bibliotecas pesadas de machine learning y simulación como `torch`, `stable-baselines3`, `gymnasium` y `streamlit`.
- **Sistemas:** El entrenamiento requerirá aceleración por GPU (Nube / Colab), por lo que se diseñarán scripts para guardar y cargar checkpoints (modelos preentrenados).
