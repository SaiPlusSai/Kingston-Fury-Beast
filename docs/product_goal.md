# Product Goal

## Enunciado
Para entusiastas e investigadores de IA en entornos autónomos, construiremos un
agente inteligente de Aprendizaje por Refuerzo que juegue Pacman y que, de
forma incremental, pueda adaptarse a otros juegos retro (multi-juego). El
agente debe ser reproducible en entornos estandarizados, exponer métricas de
aprendizaje en tiempo real y poder desplegarse como demo interactiva.

## Métrica(s) de éxito
- Alcanzar una puntuación media en Pacman que supere la línea base (agente
	aleatorio o heurístico) en un 50% para el Hito 2.
- Demostrar transferencia: el agente adaptado a un segundo juego debe superar
	la línea base del segundo juego en al menos un 20% en Hito 3.
- Tener panel de demostración (Streamlit/Gradio) que muestre episodios y
	métricas (recompensa acumulada, epsilon, loss) para evaluación por pares.

## Stakeholders
- Equipo del curso (Sergio Arias, Alan Flores, Kael Lopez, Christhian Coronel)
- Usuarios demo: docentes y compañeros que validen la demostración interactiva

## Horizonte temporal y Hitos (18 semanas, aproximado en sprints)
- Hito 1 (Sprints 1-2): Agente simple (reglas / Q-Learning tabular) en Pacman
	2D simplificado — pruebas y baseline.
- Hito 2 (Sprints 3-4): Implementación DQN / PPO en MsPacman (frames) y
	evaluación reproducible; panel demo parcial.
- Hito 3 (Sprints 5-6): Transferencia a un segundo juego (Pong/Breakout) y
	consolidación del pipeline de entrenamiento y despliegue (exportar ONNX/ckpt).

## Datos / Entorno y herramientas
- Entornos estandarizados: `Gymnasium`, `Arcade Learning Environment` (ALE).
- Frameworks: PyTorch, Stable-Baselines3, Gymnasium wrappers, OpenCV (si
	aplica), herramientas para vectorized envs.
- Despliegue/Demo: Docker, Streamlit/Gradio, export a ONNX/PyTorch checkpoints.

## Restricción principal y mitigación
- Restricción principal: tiempo de cómputo y recursos GPU para entrenamientos
	profundos.
- Mitigación: usar fases con representaciones simplificadas (RAM / features),
	entrenamientos en Colab/Kaggle o instancias institucionales, y guardar
	checkpoints frecuentes.

## Riesgos
- Entrenamiento inestable o costoso en tiempo; mitigación por simplificar
	representaciones y técnicas estabilizadoras (replay buffer, target nets).
- Falta de tiempo para integrar demo interactiva; mitigación: priorizar
	una demo mínima (render + métricas) antes de la integración completa.

## Criterio de aceptación
- Código y scripts para entrenar y evaluar el agente en `notebooks/` o
	`src/` con instrucciones reproducibles.
- Modelos/ checkpoints exportados y demo desplegable (local o en colab).
- Documentación mínima en `docs/` con instrucciones de reproducción y métricas.

Referencias: `docs/priorizacion_casos.md` (decisión y justificación del Caso A).
