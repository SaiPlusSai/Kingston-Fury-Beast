## 1. Setup y Entorno

- [ ] 1.1 Configurar el entorno virtual y el archivo `requirements.txt`. Verificar que la instalación de paquetes se ejecuta sin errores.
- [ ] 1.2 Instalar PyTorch, Stable-Baselines3 y Gymnasium. Ejecutar un script básico con `gym.make` para verificar que el entorno de Pacman carga y devuelve observaciones correctamente.

## 2. Entrenamiento del Agente RL

- [ ] 2.1 Implementar el script base de entrenamiento (`train.py`) utilizando DQN o PPO de Stable-Baselines3 para el entorno Pacman. Verificar que el entrenamiento arranca y comienza a procesar pasos.
- [ ] 2.2 Configurar *callbacks* en SB3 para guardar checkpoints (modelos preentrenados) y reportar métricas a un log (Tensorboard o CSV). Verificar revisando que se generen los archivos del modelo en disco.

## 3. Desarrollo del Panel Interactivo Web

- [ ] 3.1 Crear la estructura base `app.py` usando Streamlit para levantar un servidor local web. Verificar ejecutando `streamlit run app.py` y comprobando que cargue exitosamente.
- [ ] 3.2 Construir el componente para leer los logs de entrenamiento y mostrar gráficas en tiempo real de recompensas. Verificar comprobando que un archivo de logs de prueba se grafica correctamente en el navegador.
- [ ] 3.3 Programar un componente que lea un checkpoint de modelo guardado, corra un episodio y muestre los *frames* del emulador en pantalla. Verificar corriendo un modelo ficticio y comprobando la actualización visual.

## 4. Flujo End-to-End y Demostración

- [ ] 4.1 Realizar una prueba completa (End-to-End): entrenar un modelo corto, cargarlo en el panel Streamlit e interactuar. Verificar que todo el sistema de demostración funciona de principio a fin.
