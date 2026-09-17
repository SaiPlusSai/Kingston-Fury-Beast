# Protocolo de Uso Transparente de IA y Evidencia de Revisión Humana (Fase 2)
## HALO v2 (Urban Shield) | Taller de Sistemas Inteligentes (SIS-352)

> **Propósito del Documento:** Blindar el cumplimiento del estándar de excelencia exigido en la rúbrica del Elemento de Competencia 1:
> *"Uso de IA: Declaración transparente de IA usada y evidencia de revisión/verificación humana"*, neutralizando completamente los antipatrones de **"Uso Opaco de IA"** y **"Efecto 'Solo Él Sabe'"**.

---

## 1. De Fase 1 a Fase 2: ¿Por qué y cómo blindamos el uso de IA?

| Dimensión | Fase 1 (Declarativa Básica - Insuficiente) | Fase 2 (Evidencia Demostrable y Blindada) |
|---|---|---|
| **Declaración** | Disclaimer genérico en el encabezado ("Hecho con IA"). | Desglose por componente: herramienta, prompt estratégico, objetivo y alcance asistido. |
| **Rol del Humano** | Receptor pasivo del texto generado. | **Auditor y Validador Activo:** Identificación explícita de alucinaciones, sesgos o malas prácticas de la IA y su corrección manual. |
| **Evidencia Verificable** | Ninguna evidencia tangible de revisión. | **Bitácora de Auditoría Humana (Audit Ledger):** Registro de cambios manuales, análisis de decisiones y justificaciones técnicas propias. |
| **Seguridad de Datos** | Promesa verbal de no subir secretos. | **Verificación automatizada y manual:** Escaneo de secretos (cero credenciales en prompts ni repositorios) y enmascaramiento de PII. |
| **Defensa Oral** | Riesgo del antipatrón *"Solo la IA sabe"*. | **Apropiación Técnica:** Cada integrante domina y puede defender la justificación de cada línea de código, ADR y diagrama. |

---

## 2. Marco Operativo de Verificación Humana (Human-in-the-Loop - HITL)

Para todo artefacto (documentación, arquitectura, datos o código) en el que intervenga una IA generativa, el equipo ejecuta el siguiente ciclo obligatorio de 4 pasos:

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  1. Prompting   │       │   2. Auditoría  │       │ 3. Corrección y │       │ 4. Aprobación y │
│   Estratégico   │──────▶│  de Alucinación │──────▶│ Refactorización │──────▶│ Compromiso Oral │
│   (Sin PII)     │       │   y Viabilidad  │       │     Humana      │       │ (Dueño de Tarea)│
└─────────────────┘       └─────────────────┘       └─────────────────┘       └─────────────────┘
```

1. **Prompting Estratégico y Sanitizado:**
   - Prohibición absoluta de ingresar credenciales AWS, cadenas de conexión o datos sensibles de ciudadanos.
   - Formulación de requerimientos basados en estándares de la industria (OWASP, AWS Well-Architected, CRISP-ML(Q)).
2. **Auditoría Técnica de Alucinación y Complejidad:**
   - Detección de sobreingeniería sugerida por el modelo (ej. intentar meter Kubernetes o LLMs comerciales cuando no son viables).
   - Verificación contra las restricciones presupuestarias y académicas del proyecto.
3. **Corrección y Refactorización Humana:**
   - Modificación sustantiva del contenido para adaptarlo a la realidad operativa del stack (Express serverless, DynamoDB, Prophet local).
4. **Aprobación y Compromiso de Defensa:**
   - El dueño de la tarea firma la autoría y asume la responsabilidad técnica frente al docente evaluador.

---

## 3. Matriz de Evidencia de Revisión Humana por Artefacto (Registro Real)

A continuación se documentan las intervenciones humanas críticas donde el equipo detectó deficiencias o desviaciones en las propuestas de la IA y aplicó correcciones técnicas sustantivas:

| Artefacto / Módulo | Asistencia de IA Solicitada | Propuesta Inicial de la IA (Descartada/Ajustada) | Corrección e Intervención Humana (Por qué se cambió) | Responsable Humano | Commit / Evidencia |
|---|---|---|---|---|:---:|
| **ADR-001 (WebSockets)** | Alternativas para el canal en tiempo real del Chatbot. | La IA sugirió implementar un cluster de WebSockets con Socket.io en contenedores ECS/EC2 siempre encendidos. | **Corrección humana:** Se descartó por costo e incompatibilidad serverless. Se eligió **AWS API Gateway WebSocket API** con DynamoDB para conexiones activas, manteniendo costo $0 en inactividad. | Sergio Arias | `eee59ef` |
| **ADR-002 y ADR-004 (Motor NLP)** | Selección de tecnología para el entendimiento de lenguaje en el Chatbot. | La IA propuso integrar AWS Lex v2 o la API de OpenAI (GPT-4o) para clasificación semántica. | **Corrección humana:** Se rechazó por costo por token y latencia variable. Se implementó un motor determinístico basado en **Regex + Máquina de Estados Finita**, garantizando P95 < 2s y costo cero. | Alan Flores | `eee59ef` |
| **ADR-005 (Motor IA Predicción)** | Arquitectura de inferencia y entrenamiento para hotspots. | La IA sugirió entrenar redes LSTM o Transformers de series temporales en Amazon SageMaker. | **Corrección humana:** Se descartó por sobredimensionamiento y presupuesto. Se seleccionó **Prophet + ARIMA en Lambda Container Image** con inferencia batch nocturna (03:00 AM). | Christhian Coronel | `eee59ef` |
| **ADR-008 (Estrategia Auth)** | Diseño del sistema de autenticación de usuarios. | La IA planteó depender al 100% de Amazon Cognito en la nube incluso para pruebas locales. | **Corrección humana:** Kael y Sergio diseñaron una **Estrategia Dual**: Cognito en producción y adaptador local con **Bcrypt (costo 10) + JWT RSA/HMAC**, permitiendo testing offline sin conexión. | Kael Lopez | `eee59ef` |
| **Data Ecosystem & Privacidad** | Manejo de geolocalización de incidentes reportados. | La IA sugirió almacenar y procesar pares exactos de `latitude` y `longitude` directamente en el pipeline de ML. | **Corrección humana:** Kael Lopez identificó riesgo de privacidad y aplicó **Minimización de Datos (GDPR)**: conversión a celdas de cuadrícula espacial de 500m × 500m (`assign_zone`). | Kael Lopez | `82e74d3` |
| **Security by Design** | Almacenamiento de tokens en la aplicación móvil. | La IA sugirió utilizar `AsyncStorage` estándar de React Native. | **Corrección humana:** Sergio Arias vetó la sugerencia por vulnerabilidad de extracción y forzó el uso exclusivo de **Expo SecureStore** (Keychain en iOS / Keystore en Android). | Sergio Arias | `eee59ef` |

---

## 4. Estándar de Pull Request: Checklist Obligatorio de Validación Humana

Para garantizar que ningún commit ingrese a la rama principal sin verificación demostrable, todos los Pull Requests deben incluir la siguiente sección completada:

```markdown
### 🤖 Declaración de IA y Verificación Humana (Fase 2)
- [x] **Herramienta utilizada:** Antigravity (Google DeepMind)
- [x] **Propósito de la asistencia:** Estructuración de especificaciones, diagramación y boilerplate técnico.
- [x] **Verificación de Seguridad:** Confirmo que ningún prompt ni archivo incluye contraseñas, llaves AWS, tokens o PII de usuarios.
- [x] **Revisión y Refactorización:** He leído, comprendido y modificado el código/documento para adaptarlo a las reglas del proyecto.
- [x] **Capacidad de Defensa Oral:** Como autor de este PR, comprendo cada decisión técnica y estoy preparado para responder preguntas del docente en la defensa en vivo sin asistencia externa.

**Correcciones humanas aplicadas sobre la respuesta de la IA:**
- [Detallar al menos 1 corrección o decisión crítica tomada por el integrante]
```

---

## 5. Sugerencias de Mejora Continua para la Siguiente Fase (Fase 3 - Automatización)

Para elevar aún más el estándar de calidad y trazabilidad de cara a las entregas de código del Sprint 1 y 2, se recomienda implementar:

1. **GitHub Actions con Linter de Secretos y Calidad:**
   - Integrar `gitleaks` o `trufflehog` en el pipeline de CI para verificar de forma automatizada que ningún commit contenga credenciales inadvertidas generadas en snippets de IA.
2. **Registro de Prompts Críticos en el Repositorio:**
   - Mantener actualizado [`docs/primer_prompt.md`](docs/primer_prompt.md) con las instrucciones base y plantillas de diseño utilizadas por el equipo.
3. **Simulacros de Preguntas Cruzadas (Defensa "Sin Efecto Solo Él Sabe"):**
   - Realizar sesiones de 15 minutos en Discord donde un integrante pregunta a otro sobre un ADR que no escribió, asegurando que los cuatro integrantes manejen la totalidad del sistema.

---

*Fecha de formalización: 17/09/2026*  
*Aprobado por el Equipo:* Sergio Arias, Alan Flores, Kael Lopez, Christhian Coronel.
