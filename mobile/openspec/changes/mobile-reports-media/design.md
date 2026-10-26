# Diseño Técnico: Creación de Reportes y Multimedia (Sprint 4)

## 1. Flujo de Captura y Carga de Evidencia (Pipeline S3)

```
[Usuario Presiona Enviar]
         │
         ▼
[Validación de Formulario en Cliente] ──(Error)──▶ [Mostrar Alertas en Campos]
         │ (Válido)
         ▼
¿Hay fotos adjuntas?
   ├── SÍ ──▶ [Compresión con expo-image-manipulator (< 1MB)]
   │             │
   │             ▼
   │          [POST /api/uploads/presigned-url] ──▶ { uploadUrl, key }
   │             │
   │             ▼
   │          [HTTP PUT uploadUrl con Buffer de Imagen]
   │             │
   │             ▼
   │          [Recolectar Keys de S3 generadas]
   └── NO  ──────┤
                 │
                 ▼
     [POST /api/reports con payload completo]
                 │
                 ▼
     [Respuesta 201 Created con reportId]
                 │
                 ▼
     [Pantalla de Confirmación y Redirección]
```

---

## 2. Decisiones Arquitectónicas Locales

### ADR-MOB-008: Carga Directa a S3 y Preservación de Memoria Lambda
- **Contexto**: El backend Lambda tiene límites de payload (6 MB) y el procesamiento de imágenes en Node.js aumenta el consumo de memoria y costos innecesariamente (ADR-009).
- **Decisión**: La aplicación móvil solicita URLs pre-firmadas e interactúa directamente con el bucket de Amazon S3 mediante peticiones PUT binarias.
- **Consecuencias**: Menor latencia, cero saturación de memoria en backend y soporte para reintentos individuales por foto.

---

## 3. Permisos en `app.json`

Se declaran los permisos de hardware para cámara y galería en `app.json`:
```json
{
  "expo": {
    "plugins": [
      [
        "expo-image-picker",
        {
          "photosPermission": "Permite seleccionar fotos para adjuntar como evidencia de incidentes.",
          "cameraPermission": "Permite tomar fotografías in-situ para reportar incidentes."
        }
      ]
    ]
  }
}
```

---

## 4. Estrategia de Pruebas y Validación

1. **Pruebas Unitarias (Jest)**:
   - Esquema de validación del formulario de reporte (longitud de textos, límites de 3 fotos).
   - Servicio de subida a S3 con Axios simulando progreso y respuestas 200 de AWS S3.
2. **Pruebas de Componentes (RNTL)**:
   - Renderizado de `CreateReportScreen` con mock de `expo-image-picker`.
   - Interacción de selección de categoría y renderizado de miniaturas.
3. **Validación Estática y de Empaquetado**:
   - `npx tsc --noEmit`
   - `npm run lint`
   - `npx expo export --platform android`
