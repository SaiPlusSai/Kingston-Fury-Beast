# Propuesta: Hardening, Pruebas E2E, Accesibilidad y Preparación para Entrega (Sprint 8)

## 1. Alcance del Sprint

Este cambio aborda la fase final de consolidación, pruebas de integración, auditoría de seguridad y empaquetado de producción de **HALO Mobile**, cubriendo la tarea **T-6.4** del plan maestro y la totalidad de los requerimientos no funcionales **RNF-MOB-001** a **RNF-MOB-023**.

### Componentes Incluidos
- **Aseguramiento de Calidad y Cobertura de Pruebas**:
  - Suite completa de pruebas unitarias y de componentes con Jest y React Native Testing Library alcanzando ≥ 80% de cobertura.
  - Pruebas de integración simulando los flujos completos de login, reporte con foto y chat.
- **Auditoría de Seguridad y Privacidad**:
  - Verificación de no persistencia de PII en logs o almacenamiento inseguro (RNF-MOB-015).
  - Implementación de SSL/TLS pinning para el dominio de API Gateway en producción (RNF-MOB-014).
  - Auditoría de exclusión de secretos y claves privadas en el repositorio.
- **Accesibilidad y UX**:
  - Verificación de ratios de contraste ≥ 4.5:1 (WCAG AA).
  - Etiquetas `accessibilityLabel` y roles accesibles en todos los botones e inputs interactivos (RNF-MOB-016).
  - Compatibilidad con Dynamic Type / escalado de fuente del sistema (RNF-MOB-018).
- **Optimización de Rendimiento y Empaquetado**:
  - Generación de build preview / release mediante EAS Build (`eas build --platform android --profile preview`).
  - Validación de tamaño de APK inferior a 50MB (RNF-MOB-005).
  - Verificación en al menos dos dispositivos físicos o emuladores reales (T-6.4).

---

## 2. Dependencias y Módulos a Incorporar

| Módulo / Paquete | Versión Compatible (Expo SDK 51) | Propósito |
|---|---|---|
| `jest` / `jest-expo` | `~51.0.0` | Suite de pruebas unitarias y mocks nativos |
| `@testing-library/react-native` | `^12.5.0` | Pruebas de interacción y accesibilidad de componentes |

---

## 3. Trazabilidad con el Plan Maestro (OpenSpec Raíz)

Este cambio concluye el ciclo de vida de la aplicación móvil de HALO v2, validando el cumplimiento del criterio de aceptación de la tarea `T-6.4` y cerrando las brechas documentadas en `docs/declaracion_ia_evidencia_humana.md`.
