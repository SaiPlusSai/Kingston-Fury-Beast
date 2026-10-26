# Diseño Técnico: Autenticación, Sesión y Navegación (Sprint 2)

## 1. Arquitectura de Navegación

La navegación sigue el patrón jerárquico estándar de React Navigation v6 con navegación condicional basada en estado de autenticación:

```
NavigationContainer
└── RootNavigator
    ├── (isLoading: true) ────────▶ SplashScreen (animación logo + verificación token)
    ├── (isAuthenticated: false) ──▶ AuthStack (NativeStackNavigator)
    │                                ├── LoginScreen
    │                                ├── RegisterScreen
    │                                └── VerifyEmailScreen
    └── (isAuthenticated: true) ───▶ MainTabs (BottomTabNavigator)
                                     ├── HomeTab ─────────▶ HomeScreen (Placeholder tipado)
                                     ├── MyReportsTab ────▶ MyReportsScreen (Placeholder tipado)
                                     ├── CreateReportTab ─▶ CreateReportScreen (Placeholder tipado)
                                     ├── ChatTab ─────────▶ ChatScreen (Placeholder tipado)
                                     └── ProfileTab ──────▶ ProfileScreen (Placeholder con Logout)
```

---

## 2. Decisiones Arquitectónicas Locales

### ADR-MOB-004: Almacenamiento Cifrado de Tokens con Expo SecureStore
- **Contexto**: Los tokens JWT (`accessToken`, `refreshToken`) no deben ser almacenados en texto plano ni en `AsyncStorage` debido a vulnerabilidades de extracción en dispositivos comprometidos (RNF-MOB-011).
- **Decisión**: Usar exclusivamente `expo-secure-store`, que delega en el Keychain de iOS y en EncryptedSharedPreferences (Android Keystore).
- **Consecuencias**: Acceso asíncrono seguro; requiere mock estandarizado en suite de pruebas de Jest.

### ADR-MOB-005: Interceptor de Axios para Renovación Transparente de Tokens
- **Contexto**: Los `accessToken` emitidos por Cognito tienen un tiempo de vida corto (1 hora). Las peticiones del usuario no deben fallar por expiración.
- **Decisión**: Implementar una cola de peticiones fallidas en el interceptor de Axios. Ante una respuesta 401, se pausa el flujo, se solicita un nuevo par de tokens a `POST /api/auth/refresh` y se reintentan las peticiones pendientes con el nuevo token.

---

## 3. Plugins de Expo y Permisos en `app.json`

Para este sprint, no se requieren permisos de hardware invasivos (como cámara o GPS fino). Sin embargo, se configura el soporte nativo para `expo-secure-store` y el renderizado optimizado de `react-native-screens`:
```json
{
  "expo": {
    "plugins": [
      [
        "expo-secure-store",
        {
          "faceIDPermission": "Permite acceder a tus credenciales de forma segura."
        }
      ]
    ]
  }
}
```

---

## 4. Estrategia de Pruebas y Validación

1. **Pruebas Unitarias (Jest)**:
   - Validadores de formularios (expresiones regulares de email y contraseña).
   - Servicio de almacenamiento de autenticación con mock de `expo-secure-store`.
   - Interceptor de Axios simulando respuestas 401 y refresh exitoso.
2. **Pruebas de Componentes (React Native Testing Library)**:
   - Renderizado de `LoginScreen` y emisión de eventos con `fireEvent.changeText` y `fireEvent.press`.
   - Validación visual de errores en línea al enviar formulario vacío.
3. **Validación Estática y de Empaquetado**:
   - `npx tsc --noEmit`
   - `npm run lint`
   - `npx expo export --platform android`
