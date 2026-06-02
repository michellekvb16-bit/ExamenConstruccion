# EPN Event Manager - Examen Construcción de Software

Este proyecto es una API robusta construida con **NestJS** para la gestión de eventos con auditoría y trazabilidad. Ha sido refactorizado y estabilizado siguiendo los principios de ingeniería de software y aplicando los cuatro tipos de mantenimiento normados.

## 📋 Diagnóstico de Deuda Técnica (Fase 1)

El diseño original del CRUD presentaba las siguientes carencias estructurales que fueron identificadas y mitigadas:

1.  **Falta de Validaciones:** Los datos de entrada no eran saneados, permitiendo la persistencia de nulos o cadenas excesivamente largas (Propensidad a fallos de persistencia).
2.  **Ausencia de Trazabilidad:** No existía un sistema de logs profesional. Las acciones ocurrían sin dejar rastro auditable (Falta de observabilidad).
3.  **Bugs Críticos:** Encontrado un bug en la operación `DELETE` donde el evento no se persistía en la base de datos debido a la falta de `await` en la operación asíncrona.
4.  **Inconsistencia de Datos:** El uso de formatos de fecha locales impedía una ordenación cronológica confiable en entornos distribuidos.
5.  **Vulnerabilidades de Seguridad:** Endpoints expuestos sin ninguna restricción, permitiendo acceso no autorizado a la información de auditoría.
6.  **Falta de Pruebas:** Cobertura de pruebas nula, lo que impedía validar cambios sin riesgo de regresiones.

---

## 🛠️ Intervención Técnica (Mantenimientos)

### 1. Mantenimiento Correctivo (Refactorización y Bugs)
- **Corrección de Bugs:** Se reparó el flujo de `DELETE` asegurando la persistencia física de la acción.
- **Logs Estructurados:** Implementación de un logger profesional basado en **Winston**.
  - Niveles de severidad: `INFO`, `WARN`, `ERROR`.
  - Trazabilidad: Cada acción registra marca de tiempo en formato **ISO 8601**.
  - Salida dual: Consola colorizada para desarrollo y archivos (`logs/error.log`, `logs/combined.log`) para producción.

### 2. Mantenimiento Adaptativo (Entorno Institucional)
- **Seguridad por API-Key:** Restricción de acceso mediante el header `X-FIS-EPN-KEY`. Se implementó un `Guard` global que valida esta cabecera contra las variables de entorno.
- **Configuración Externa:** Extracción de variables críticas (Puerto, API Key, Path de DB) hacia archivos `.env` utilizando `@nestjs/config`.

### 3. Mantenimiento Perfectivo (Calidad y Documentación)
- **Pruebas Unitarias Robustas:** Suite completa con **Jest** que valida las reglas de negocio, incluyendo la correcta selección del repositorio según la acción.
- **Documentación Estandarizada:** Generación automática de especificación **OpenAPI (Swagger)**. Disponible en la ruta `/api`.
- **Ordenación Cronológica:** Refactorización del método `findAll` para consolidar y ordenar eventos de múltiples tablas usando estándares temporales.

### 4. Mantenimiento Preventivo (Programación Defensiva)
- **Sanitización Rigurosa:** Uso de `class-validator` y `class-transformer` para validación exhaustiva de tipos, longitudes y obligatoriedad.
- **Estructura Try-Catch Global:** Implementación de un `AllExceptionsFilter` que captura fallos inesperados y garantiza que el servidor no caiga, devolviendo respuestas estandarizadas.
- **Pipes Globales:** Configuración de `ValidationPipe` con `whitelist: true` para prevenir inyección de datos maliciosos no definidos en los DTOs.

---

## 🚀 Instalación y Uso

### Requisitos
- Node.js (v18+)
- npm

### Configuración
Copie el archivo de ejemplo o cree un `.env`:
```env
PORT=3000
API_KEY=epn-fis-secret-key-2024
DB_PATH=./db/events.sqlite
NODE_ENV=development
```

### Ejecutar
```bash
npm install
npm run start:dev
```

### Documentación API
Swagger UI: `http://localhost:3000/api`

---

## 🧪 Pruebas
```bash
# Ejecutar tests unitarios
npm run test

# Ver cobertura
npm run test:cov
```

---
**Autor:** Vicente Adrian Eguez Sarzosa
**Materia:** Construcción de Software - GR2
**Fecha:** 2. de junio de 2026

---

## 📄 DOCUMENTACIÓN COMPLETA PARA EL EXAMEN
Para una revisión detallada de cada punto de la rúbrica (Mantenimientos, Teoría, Diagnóstico), consulte el archivo:
👉 [EXAMEN_DOCUMENTACION.md](EXAMEN_DOCUMENTACION.md)


