# Diseño Técnico: Push, Offline y Perfil (Sprint 7)

## 1. Arquitectura de Sincronización Offline y Notificaciones

```
[Estado de Red: NetInfo Event Listener]
         │
         ├──▶ (Offline) ──▶ [Capturar Reporte ──▶ Cifrar AES ──▶ Guardar en AsyncStorage]
         │
         └──▶ (Online)  ──▶ [Leer Cola de Borradores ──▶ Subir Fotos ──▶ POST /api/reports]
                                │
                                └──▶ [Éxito: Purgar Borrador ──▶ Toast Notificación Local]

[expo-notifications Handler]
         │
         ├── (Foreground) ──▶ Banner In-App / Toast flotante
         └── (Background / Killed) ──▶ Notificación OS ──(Tap)──▶ Deep Link: /reports/:id
```

---

## 2. Decisiones Arquitectónicas Locales

### ADR-MOB-011: Cifrado Local de Borradores Sensibles
- **Contexto**: Un dispositivo extraviado no debe exponer descripciones ni coordenadas geográficas de reportes sin enviar (RNF-MOB-013).
- **Decisión**: Los borradores offline almacenados en `AsyncStorage` se cifran usando una clave simétrica derivada protegida en `expo-secure-store`.

---

## 3. Plugins en `app.json`

Se declara el plugin de notificaciones con icono y sonido personalizado:
```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#3B82F6",
          "sounds": ["./assets/alert.wav"]
        }
      ]
    ]
  }
}
```

---

## 4. Estrategia de Pruebas y Validación

1. **Pruebas Unitarias (Jest)**:
   - Servicio offline con mock de `NetInfo` y `AsyncStorage` verificando la cola FIFO de reintentos.
   - Manejador de deep links de `expo-notifications`.
2. **Pruebas de Componentes (RNTL)**:
   - Renderizado de `ProfileScreen` y edición de campos de texto.
   - Despacho de logout y limpieza de estado.
3. **Validación Estática y de Empaquetado**:
   - `npx tsc --noEmit`
   - `npm run lint`
   - `npx expo export --platform android`
