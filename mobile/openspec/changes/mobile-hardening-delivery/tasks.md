# Tareas de Implementación: Hardening y Entrega (Sprint 8)

Todas las tareas corresponden al Sprint 8 y se encuentran en estado planificado (`- [ ]`), pendientes de aprobación para su implementación.

---

## Fase 1: Automatización de Pruebas y Cobertura

- [ ] **T-MOB-8.1:** Configurar Jest y React Native Testing Library en `mobile/` con los mocks estandarizados de hardware (SecureStore, Location, NetInfo, Notifications).
  - **Verificación:** `npm test` ejecuta la suite de pruebas sin fallos de importación de módulos nativos.

- [ ] **T-MOB-8.2:** Escribir pruebas unitarias y de integración alcanzando una cobertura mayor al 80% en componentes de autenticación, reportes y offline.
  - **Verificación:** El reporte de cobertura de Jest (`coverage/lcov-report`) muestra ≥ 80% de líneas y funciones cubiertas.

## Fase 2: Hardening de Seguridad y Accesibilidad

- [ ] **T-MOB-8.3:** Ejecutar auditoría de accesibilidad WCAG AA verificando ratios de contraste (4.5:1) y etiquetas de accesibilidad en todas las vistas interactivas.
  - **Verificación:** `npm run lint` pasa sin advertencias de accesibilidad y las pruebas de RNTL validan `getByA11yLabel`.

- [ ] **T-MOB-8.4:** Auditar el código móvil para verificar la ausencia de PII en logs, almacenamiento no seguro o mensajes de error al usuario.
  - **Verificación:** Escaneo de linter y revisión de patrones en `mobile/src/`.

## Fase 3: Build de Producción y Verificación Runtime

- [ ] **T-MOB-8.5:** Configurar `eas.json` y compilar el paquete APK para Android mediante EAS Build (`eas build --platform android --profile preview`).
  - **Verificación:** Build completado en la consola de EAS con URL de descarga de APK generado (peso < 50MB).

- [ ] **T-MOB-8.6:** Ejecutar y registrar las pruebas de aceptación en al menos 2 dispositivos físicos reales, documentando capturas y logs de rendimiento.
  - **Verificación:** Registro de pruebas en `docs/declaracion_ia_evidencia_humana.md` con evidencia de ejecución satisfactoria.
