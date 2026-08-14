# Priorización de Casos de Proyecto - Taller de Sistemas Inteligentes

**Universidad Católica Boliviana "San Pablo"**  
**Departamento de Ingeniería de Sistemas**  
**Asignatura:** Taller de Sistemas Inteligentes (LAB_01)  
**Documento:** `priorizacion_casos.md`  

---

## 1. Propósito del Documento

El presente documento evalúa y compara tres alternativas de proyectos de Inteligencia Artificial para seleccionar el caso más viable a desarrollar durante el semestre (18 semanas). La evaluación se realiza mediante una matriz cuantificable basada en los cinco criterios definidos en la metodología de la materia: **Valor**, **Datos**, **Factibilidad**, **Riesgo** y **Despliegue**.

---

## 2. Criterios de Evaluación y Escala (1 a 5)

| Criterio | Pregunta Guía | Interpretación de la Escala (1 - 5) |
| :--- | :--- | :--- |
| **Valor** | ¿A quién ayuda y por qué importa? | **1:** Beneficio ambiguo o sin usuario definido.<br>**5:** Usuario claro, problema relevante e impacto bien delimitado. |
| **Datos / Entorno** | ¿Hay datos o entornos de aprendizaje accesibles y utilizables? | **1:** Datos inexistentes, privados o de muy difícil recolección.<br>**5:** Datos/entornos disponibles, autorizados, estandarizados y suficientes. |
| **Factibilidad** | ¿El alcance propuesto cabe realistamente en 18 semanas? | **1:** Complejidad excesiva para el tiempo disponible.<br>**5:** Alcance bien acotado, modular y ejecutable por etapas. |
| **Riesgo** | ¿Qué factores pueden impedir la ejecución del proyecto? | **1:** Alto riesgo técnico, legal, ético o de dependencia externa.<br>**5:** Riesgos bajos, controlables o con mitiga ción directa. |
| **Despliegue** | ¿Puede operarse y validarse fuera del entorno local del desarrollador? | **1:** Requiere infraestructura costosa o hardware especializado inalcanzable.<br>**5:** Ruta técnica clara de empaquetado, API o interfaz ejecutable. |

---

## 3. Descripción de los Casos Evaluados

### Caso A: Agente Autónomo para Videojuegos con Aprendizaje Incremental (Pacman & Multi-juego)
* **Descripción:** Desarrollo de un agente de Aprendizaje por Refuerzo (Reinforcement Learning - RL) capacitado en una primera etapa para jugar Pacman (alcanzando estrategias óptimas de evasión y captura), extendiendo posteriormente su arquitectura hacia el aprendizaje multijuego (*Transfer Learning* / *General Game Playing*) en entornos emulados.
* **Usuarios/Interesados:** Investigadores y desarrolladores de IA autónoma, entusiastas de la simulación y entornos interactivos.
* **Infraestructura/Entorno:** Gymnasium, OpenAI Arcade Learning Environment (ALE), PyTorch / Stable-Baselines3.

### Caso B: Agente para Gestión Inteligente de Restaurante
* **Descripción:** Agente conversacional e inteligente para la gestión operativa de un restaurante (predicción de demanda de insumos, optimización de inventario, asignación de reservas y turnos de personal).
* **Usuarios/Interesados:** Administradores y gerentes de restaurantes locales.
* **Infraestructura/Entorno:** Base de datos relacional, modelos de series de tiempo / RL estocástico, API REST.

### Caso C: Agente de Gestión de Estacionamiento con IA
* **Descripción:** Sistema de visión por computadora y gestión adaptativa para estacionamientos comerciales (detección de espacios libres mediante video, tarifas dinámicas según ocupación y control de flujo vehicular).
* **Usuarios/Interesados:** Operadores de parqueos urbanos y conductores.
* **Infraestructura/Entorno:** OpenCV, YOLO, cámaras de video, sistema embebido/servidor de inferencia.

---

## 4. Matriz de Priorización de Casos

| Caso | Valor | Datos / Entorno | Factibilidad | Riesgo | Despliegue | Puntaje Total | Decisión |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **A. Agente para Videojuegos (Pacman & Multi-juego)** | **4** | **5** | **4** | **4** | **5** | **22 / 25** | **Elegir** |
| **B. Agente de Gestión de Restaurante** | 4 | 2 | 3 | 3 | 3 | **15 / 25** | **Reserva** |
| **C. Agente de Estacionamiento con IA** | 3 | 2 | 2 | 2 | 3 | **12 / 25** | **Descartar** |

---

## 5. Justificación Detallada de la Decisión

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

## 6. Restricción Principal e Estrategia de Mitigación

* **Restricción Principal Identificada:** **Complejidad Computacional y Tiempo de Entrenamiento.**
  * *Riesgo:* Entrenar algoritmos de Deep Reinforcement Learning desde cero en entorn visuales puede requerir muchas horas de cómputo GPU y derivar en inestabilidad de convergencia.
* **Estrategia de Mitigación:**
  1. Utilizar representaciones de estado simplificadas (RAM o matrices de coordenadas extraídas) en las fases iniciales antes de pasar a cuadros de píxeles sin procesar (*raw pixels*).
  2. Implementar arquitecturas aceleradas como DQN con vectores de características o PPO paralelizado con Vectorized Environments.
  3. Aprovechar plataformas de cómputo en la nube / aceleradores gratuitos (Google Colab / Kaggle GPUs / Proxmox institucional) para los trabajos pesados de entrenamiento y guardar checkpoints intermedios de los modelos.

---

## 7. Product Goal Preliminar Asociado

De acuerdo con la anatomía recomendada en Scrum Académico:

> **Para** entusiastas e investigadores de IA en entornos autónomos, **construiremos** un agente inteligente modular basado en Aprendizaje por Refuerzo **que permite** jugar Pacman y adaptarse progresivamente a nuevos entornos de videojuegos retro, **alcanzando** un nivel de juego competitivo con trazabilidad de decisiones, métricas de recompensa en tiempo real y despliegue ejecutable.

---

## 8. Trazabilidad de Evidencia en GitHub y ClickUp

* **Ubicación en Repositorio:** `docs/priorizacion_casos.md`
* **Lista en ClickUp:** `Discovery`
* **Criterio de Aceptación:** Archivo `.md` completado con la matriz de 3 opciones, puntajes justificados, restricción principal declarada y opción seleccionada alineada al semestre.
