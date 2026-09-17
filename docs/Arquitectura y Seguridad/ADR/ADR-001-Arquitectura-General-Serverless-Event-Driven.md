# ADR-001 — Arquitectura General Serverless Event-Driven en AWS

## Estado
**Aceptado**

## Contexto
UrbanShield (HALO) es una plataforma de mision critica para la gestion y anticipacion de emergencias urbanas en ciudades intermedias y metropolitanas. El sistema experimenta patrones de trafico altamente asimetricos: trafico moderado en operaciones habituales con picos abruptos e impredecibles durante catastrofes naturales, disturbios o accidentes mayores. El presupuesto operativo debe mantenerse austero (~ -  USD/mes).

## Problema
Que paradigma de arquitectura base permite absorber picos masivos de trafico en emergencias ciudadanas sin incurrir en costos fijos elevados de infraestructura ociosa 24/7, garantizando alta disponibilidad y minimo mantenimiento operativo?

## Decisión
Adoptar una arquitectura 100% Serverless y Orientada a Eventos (Event-Driven Architecture) basada en el ecosistema gestionado de Amazon Web Services (AWS us-east-1): API Gateway, AWS Lambda, Amazon DynamoDB, Amazon S3, Amazon SNS y Amazon EventBridge.

## Justificación técnica
1. Escalabilidad Automatica Elastica: De 0 a miles de peticiones concurrentes en segundos sin aprovisionamiento manual.\n2. Modelo Pay-as-you-go: Costo cero cuando no hay incidentes ni invocaciones activas. Cumple con el target documentado de ~.34 USD/mes.\n3. Cero Administracion de Servidores: Elimina parches de SO, configuracion de balanceadores fisicos y clusters Kubernetes innecesarios.\n4. Resiliencia Nativamente Distribuida: Los servicios serverless operan en multiples zonas de disponibilidad (Multi-AZ) por defecto.

## Alternativas consideradas
- Alternativa 1: Arquitectura tradicional en Maquinas Virtuales (EC2) con balanceador ALB. Descartada por costo fijo elevado (- USD/mes minimo para redundancia basica), necesidad de administracion de parches y escalado lento.\n- Alternativa 2: Microservicios en contenedores sobre Kubernetes (EKS) o ECS Fargate. Descartada por sobre-ingenieria masiva y costo base de cluster ( USD/mes solo por el plano de control).\n- Alternativa 3: Plataforma PaaS monolitica (Render/Heroku). Descartada por falta de integracion nativa con servicios geoespaciales de AWS (Amazon Location Service) y limitaciones en WebSockets serverless.

## Consecuencias positivas
- Maxima optimizacion de costos en reposo.\n- Alta tolerancia a fallas y redundancia Multi-AZ automatica.\n- Infraestructura como Codigo (IaC) simplificada mediante Serverless Framework (serverless.yml).

## Consecuencias negativas
- Riesgo de cold start en funciones Lambda tras periodos de inactividad prolongada.\n- Limites estrictos de tiempo de ejecucion (15 minutos maximo por invocacion Lambda).\n- Acoplamiento a los SDKs y servicios de Amazon Web Services (Vendor Lock-in moderado).

## Riesgos
- Picos de costos si ocurren bucles infinitos de eventos o ataques de denegacion de servicio no mitigados en API Gateway.

## Mitigaciones
- Configurar alarmas de presupuesto en AWS CloudWatch Billing ( y  USD).\n- Implementar AWS Throttling y rate-limiting en API Gateway y WAF.

## Componentes afectados
Infraestructura global, serverless.yml, API Gateway, AWS Lambda, DynamoDB, S3, SNS.
