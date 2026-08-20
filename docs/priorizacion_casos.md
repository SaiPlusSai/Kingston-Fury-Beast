# Priorización de Casos de Proyecto - Taller de Sistemas Inteligentes

## 1. Descripción de los Casos Evaluados

### Caso A: Agente Autónomo para Videojuegos con Aprendizaje Incremental (Pacman & Multi-juego)
* **Descripción:** Desarrollo de un agente de Aprendizaje por Refuerzo (Reinforcement Learning - RL) capacitado en una primera etapa para jugar Pacman (alcanzando estrategias óptimas de evasión y captura), extendiendo posteriormente su arquitectura hacia el aprendizaje multijuego (*Transfer Learning* / *General Game Playing*) en entornos emulados.
* **Usuarios/Interesados:** Investigadores y desarrolladores de IA autónoma, entusiastas de la simulación y entornos interactivos.
* **Infraestructura/Entorno:** Gymnasium, OpenAI Arcade Learning Environment (ALE), PyTorch / Stable-Baselines3, Microsoft Azure (Nube).

### Caso B: Agente para Gestión Inteligente de Restaurante
* **Descripción:** Agente conversacional e inteligente para la gestión operativa de un restaurante (predicción de demanda de insumos, optimización de inventario, asignación de reservas y turnos de personal).
* **Usuarios/Interesados:** Administradores y gerentes de restaurantes locales.
* **Infraestructura/Entorno:** Base de datos relacional, modelos de series de tiempo / RL estocástico, API REST, Microsoft Azure (Nube).

### Caso C: Agente de Gestión de Estacionamiento con IA
* **Descripción:** Sistema de visión por computadora y gestión adaptativa para estacionamientos comerciales (detección de espacios libres mediante video, tarifas dinámicas según ocupación y control de flujo vehicular).
* **Usuarios/Interesados:** Operadores de parqueos urbanos y conductores.
* **Infraestructura/Entorno:** OpenCV, YOLO, cámaras de video, sistema embebido/servidor de inferencia, Microsoft Azure (Nube).

---

## 2. Matriz de Priorización de Casos

| Caso | Valor | Datos / Entorno | Factibilidad | Riesgo | Despliegue | Puntaje Total | Decisión |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **A. Agente para Videojuegos (Pacman & Multi-juego)** | **4** | **5** | **4** | **4** | **5** | **22 / 25** | **Elegir** |
| **B. Agente de Gestión de Restaurante** | 4 | 2 | 3 | 3 | 3 | **15 / 25** | **Reserva** |
| **C. Agente de Estacionamiento con IA** | 3 | 2 | 2 | 2 | 3 | **12 / 25** | **Descartar** |

---

## 3. Justificación Detallada de la Decisión

Se selecciona el **Caso A (Agente Autónomo para Videojuegos - Pacman & Multi-juego)** como el proyecto a desarrollar durante el semestre por las siguientes razones analíticas:

1. **Disponibilidad Inmediata y Calidad de Entornos (Datos/Entorno = 5/5):**
   A diferencia de los casos B y C, que dependen de datos privados de empresas locales (historial de ventas de restaurantes o streamings de video de parqueos), el Caso A cuenta con entornos totalmente estandarizados, públicos y altamente reproducibles a través de bibliotecas como `Gymnasium` (Farama Foundation) y `Arcade Learning Environment`. Esto elimina el cuello de botella de recolección y limpieza de datos.

2. **Factibilidad Modular en 18 Semanas (Factibilidad = 4/5):**
   El Caso A permite una estrategia de desarrollo incremental por hitos claros:
   * *Hito 1 (Sprints 1-2):* Agente basado en reglas / Q-Learning tabular en Pacman 2D simplificado.
   * *Hito 2 (Sprints 3-4):* Implementación de Deep Q-Networks (DQN) / PPO en MsPacman-v4 con procesamiento de marcos visuales.
   * *Hito 3 (Sprints 5-6):* Evaluación de transferencia de conocimiento (*Transfer Learning*) o adaptación de hiperparámetros a un segundo juego retro (ej. Pong / Breakout / Space Invaders).

3. **Viabilidad de Despliegue y Demostración (Despliegue = 5/5):**
   El agente entrenado se puede empaquetar en contenedores Docker y exportar como modelo ONNX o checkpoint de PyTorch. Se puede desplegar un panel web interactivo (mediante Streamlit/Gradio o renderizado HTML5/WebGL) donde el usuario observe al agente tomar decisiones en tiempo real y consulte métricas de aprendizaje (recompensas acumuladas, loss, tasa de exploración $\epsilon$).

4. **Análisis de Opciones Descartadas:**
   * **Caso B (Restaurante):** Presenta un alto riesgo de bloqueo en la adquisición de datos reales de consumo e inventario de restaurantes locales, además de depender de reglas de negocio cambiantes.
   * **Caso C (Estacionamiento):** Depende críticamente de hardware de captura de video en tiempo real, latencia de procesamiento y dataset anotado de cámaras en ángulos específicos, lo que representa un elevado riesgo operativo y de infraestructura para el plazo académico.

---

## 4. Restricción Principal y Estrategia de Mitigación

* **Restricción Principal Identificada:** **Complejidad Computacional y Tiempo de Entrenamiento.**
  * *Riesgo:* Entrenar algoritmos de Deep Reinforcement Learning desde cero en entornos visuales puede requerir muchas horas de cómputo GPU y derivar en inestabilidad de convergencia.
* **Estrategia de Mitigación:**
  1. Utilizar representaciones de estado simplificadas (RAM o matrices de coordenadas extraídas) en las fases iniciales antes de pasar a cuadros de píxeles sin procesar (*raw pixels*).
  2. Implementar arquitecturas aceleradas como DQN con vectores de características o PPO paralelizado con Vectorized Environments.
  3. Aprovechar plataformas de cómputo en la nube / aceleradores gratuitos (Google Colab / Kaggle GPUs / Proxmox institucional) para los trabajos pesados de entrenamiento y guardar checkpoints intermedios de los modelos.
