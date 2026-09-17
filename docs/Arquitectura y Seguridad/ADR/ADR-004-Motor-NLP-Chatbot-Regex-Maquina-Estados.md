# ADR-004 — Motor NLP del Chatbot mediante Expresiones Regulares y Maquina de Estados

## Estado
**Aceptado**

## Contexto
Para el chatbot de emergencias urbanas de HALO v2, se evaluaron mecanismos de comprension de lenguaje natural para 6 intenciones criticas: intent_greeting, intent_help, intent_faq, intent_status, intent_create e intent_unknown.

## Problema
Como procesar las intenciones y dirigir el dialogo de reporte de forma rapida, economica, deterministica y sin dependencias externas costosas o impredecibles?

## Decisión
Implementar un motor de clasificacion lexico basado en Expresiones Regulares + Coincidencia de Palabras Clave para la clasificacion de intenciones, complementado por una Maquina de Estados Finitos Persistida en DynamoDB (ChatSessionsTable con TTL de 30 min) para los flujos multi-paso de reporte.

## Justificación técnica
1. Determinismo y Seguridad en Emergencias: En situaciones de estres ciudadano, las respuestas sobre contactos de auxilio o estado de reportes no pueden sufrir alucinaciones tipicas de los LLMs.\n2. Latencia Practicamente Nula: La evaluacion de patrones regex en Node.js toma menos de 2 milisegundos, comparado con 1.5 a 4 segundos de una llamada a una API de LLM comercial.\n3. Costo Cero de Licencias/Tokens: Elimina dependencia de OpenAI/Anthropic/AWS Lex, blindando el presupuesto del proyecto.\n4. Maquina de Estados Robusta: Almacenar el borrador del reporte (IDLE -> ASK_CATEGORY -> ASK_DESCRIPTION -> ASK_LOCATION -> ASK_PHOTO -> CONFIRM) con TTL de 30 minutos permite que el usuario responda a su ritmo y limpia sesiones huerfanas automaticamente.

## Alternativas consideradas
- Alternativa 1: LLM externo (OpenAI GPT-4o o Gemini API) con Function Calling. Descartada por costo recurrente en dolares, latencia alta (2-4s), riesgo de prompt injection y dependencia de conectividad con terceros en emergencias.\n- Alternativa 2: AWS Lex v2. Descartada para Fase 1 por costo por solicitud de texto (.004 por request), configuracion compleja en CloudFormation y sobrecarga innecesaria para un set acotado de 6 intenciones.

## Consecuencias positivas
- Sistema 100% auditable, reproducible y testeable con suites unitarias deterministicas.\n- Independencia total de APIs externas de IA generativa.\n- Gestion transparente de sesiones conversacionales mediante DynamoDB TTL.

## Consecuencias negativas
- Frases de usuarios con redacciones muy inusuales o faltas ortograficas graves pueden caer en intent_unknown.\n- Mayor esfuerzo manual para ampliar el catalogo de frases de entrenamiento por regex.

## Riesgos
- Frustracion del usuario ante fallbacks repetitivos si no se reconoce su mensaje.

## Mitigaciones
- Al detectar intent_unknown, mostrar botones de opcion rapida (Quick Replies) con las categorias y acciones mas comunes.\n- Disenar la interfaz para migrar en Fase 2 a un modelo embedding ligero o AWS Lex si la precision decae del 85%.

## Componentes afectados
src/websocket/intentDetector.js, src/websocket/stateMachine.js, ChatSessionsTable, ChatFaqsTable.
