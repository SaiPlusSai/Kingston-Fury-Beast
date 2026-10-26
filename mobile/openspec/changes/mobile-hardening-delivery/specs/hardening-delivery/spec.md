## Purpose

Especificar los criterios de validación no funcional, auditoría de seguridad, accesibilidad WCAG AA y empaquetado de producción para la entrega final de HALO Mobile.

## ADDED Requirements

### Requirement: RNF-MOB-PERF - Rendimiento y Tamaño de Bundle

La app móvil SHALL iniciar en frío en menos de 4 segundos en dispositivos de gama media, mantener 60 FPS en el scroll de reportes y emitir un paquete instalable APK menor a 50MB.

#### Scenario: Validación de cold start y empaquetado
- **WHEN** la aplicación compilada en release se ejecuta en un dispositivo Android de gama media
- **THEN** la pantalla principal se renderiza completamente en menos de 4 segundos y el tamaño total del APK no supera los 50MB

### Requirement: RNF-MOB-SEC - Blindaje de Seguridad y Cero PII

La app móvil SHALL garantizar que ningún token, clave sensible o dato identificable del ciudadano sea expuesto en almacenamiento inseguro o registrado en logs locales.

#### Scenario: Verificación de persistencia cifrada
- **WHEN** se audita el almacenamiento físico del dispositivo tras una sesión completa
- **THEN** los tokens JWT residen exclusivamente en SecureStore y los logs de consola están deshabilitados o sanitizados

### Requirement: RNF-MOB-A11Y - Accesibilidad Universal (WCAG AA)

La app móvil SHALL ser completamente operable mediante lectores de pantalla y mantener un contraste visual mínimo de 4.5:1.

#### Scenario: Lectura de elementos con TalkBack / VoiceOver
- **WHEN** un usuario con lector de pantalla navega por los formularios y botones de la aplicación
- **THEN** cada elemento interactivo emite una etiqueta descriptiva y un rol accesible claro
