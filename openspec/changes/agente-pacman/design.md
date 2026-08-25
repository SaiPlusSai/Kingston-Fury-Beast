## Context

El proyecto requiere la creación de un sistema de aprendizaje automático que controle a un agente en el juego Pacman. Dado el tiempo limitado de un semestre académico, la eficiencia en el entrenamiento y la capacidad de visualización son prioritarias. Ver `proposal.md` para la motivación general del proyecto.

## Goals / Non-Goals

**Goals:**
- Proveer una arquitectura de entrenamiento modular con `Gymnasium`.
- Implementar un agente inicial utilizando un algoritmo de RL robusto (PPO o DQN).
- Construir un panel web que permita inspeccionar visualmente el comportamiento del modelo y sus métricas.

**Non-Goals:**
- Entrenar un modelo de generalidad artificial (AGI) capaz de dominar múltiples juegos simultáneamente en esta fase inicial (eso se abordará posteriormente con Transfer Learning).
- Desarrollar un emulador de Pacman nativo desde cero.

## Decisions

- **Librería de Aprendizaje por Refuerzo:** Se utilizará `Stable-Baselines3` (SB3) sobre PyTorch.
  *Rationale*: SB3 ofrece implementaciones estables y probadas de algoritmos de estado del arte. La alternativa de escribir algoritmos desde cero consumiría tiempo excesivo, mientras que frameworks como RLlib resultan complejos para este alcance.
- **Gestión de Entornos:** `Gymnasium` (Farama Foundation) y `Arcade Learning Environment` (ALE).
  *Rationale*: Son el estándar industrial y académico, asegurando amplia documentación.
- **Panel Web Interactivo:** Se desarrollará usando `Streamlit`.
  *Rationale*: Streamlit permite levantar un servidor web interactivo usando únicamente Python y facilita la actualización de métricas en componentes integrados.
- **Representación de Estados:** Se priorizará entrenar con estados extraídos de RAM o vectores simplificados durante la Fase 1.
  *Rationale*: Entrenar usando imágenes crudas (píxeles y Redes Neuronales Convolucionales) es intensivo en GPU. Simplificar el estado mitiga los riesgos de tiempo computacional mencionados en el charter del equipo.

## Risks / Trade-offs

- **[Risk] Tiempos de entrenamiento inviables en CPU local** → *Mitigación*: Diseñar scripts que permitan exportar y cargar *checkpoints*, y correr el entrenamiento pesado en plataformas cloud (Google Colab / Azure) utilizando entornos vectorizados (`SubprocVecEnv`).
- **[Risk] Latencia en la visualización en tiempo real con Streamlit** → *Mitigación*: Renderizar el juego a menor cantidad de frames por segundo (FPS) en la UI, o generar un archivo de video temporal al final de un episodio en lugar de un stream frame-a-frame constante.
