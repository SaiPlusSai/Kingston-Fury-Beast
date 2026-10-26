# Diseño Técnico: Hardening, Pruebas y Entrega (Sprint 8)

## 1. Pipeline de Integración y Entrega Continua Móvil

```
[Código Fuente en mobile/]
         │
         ├── Tier 1: Static Check ──▶ [npx tsc --noEmit && npm run lint]
         │
         ├── Tier 2: Bundle Check ──▶ [npx expo export --platform android]
         │
         ├── Tier 3: Test Suite ────▶ [npm test -- --coverage (Jest + RNTL ≥ 80%)]
         │
         ├── Tier 4: Native Build ──▶ [eas build --platform android --profile preview]
         │                                       │
         │                                       ▼
         │                                 [Descarga de APK]
         │                                       │
         └── Tier 5: Runtime Testing ────────────┴──▶ [Pruebas en 2 Dispositivos Físicos]
```

---

## 2. Decisiones Arquitectónicas Locales

### ADR-MOB-012: Compilación de Producción mediante EAS Build Cloud
- **Contexto**: El entorno local de desarrollo carece de Android SDK y utiliza Java 25 (incompatible con Gradle 8.6). Instalar y configurar Android Studio localmente con emuladores pesados excede la capacidad de disco de la máquina local.
- **Decisión**: Utilizar Expo Application Services (EAS Build) en la nube para la compilación de binarios instalables (APK / AAB) y verificación en hardware real.
- **Consecuencias**: Compilaciones reproducibles en servidores aislados de Expo sin requerir Android SDK en local.

---

## 3. Estrategia de Pruebas y Validación

1. **Pruebas de Cobertura (Jest)**:
   - Cobertura global de líneas y ramas superior al 80%.
2. **Pruebas de Accesibilidad**:
   - Validación automática de `accessibilityLabel` con reglas de `eslint-plugin-react-native-a11y`.
3. **Validación de Tamaño**:
   - Inspección del tamaño del APK generado garantizando un peso < 50MB.
