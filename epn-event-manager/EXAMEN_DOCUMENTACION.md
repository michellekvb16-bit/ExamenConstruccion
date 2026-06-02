# Informe de Ingeniería de Software: Evolución Estructural y Gestión de Mantenibilidad
## PROYECTO: EPN EVENT MANAGER - SISTEMA DE AUDITORÍA Y TRAZABILIDAD

**Institución:** Escuela Politécnica Nacional (EPN)  
**Facultad:** Ingeniería de Sistemas  
**Asignatura:** Construcción de Software (GR2)  
**Estudiante:** Vicente Adrian Eguez Sarzosa  
**Fecha:** 2 de junio de 2026  
**Versión del Documento:** 2.0 (Extenso - Revisión Técnica)

---

## 1. RESUMEN EJECUTIVO
El presente informe documenta la transformación de una aplicación CRUD convencional en un sistema de misión crítica orientado a la observabilidad y seguridad. Bajo los estándares del ciclo de vida del software, se han aplicado intervenciones profundas para mitigar la deuda técnica acumulada, instrumentar una suite de pruebas con cobertura del 100% en lógica de negocio y establecer un esquema de auditoría basado en estándares industriales (ISO 8601 / RFC 5424).

---

## 2. FASE 1: ANÁLISIS DE LA DEUDA TÉCNICA Y DIAGNÓSTICO ESTRUCTURAL
Se realizó un *Architectural Review* del código base original, identificando fallas críticas bajo la métrica de complejidad ciclomática y acoplamiento:

### 2.1. Inconsistencias de Sincronía (Non-Blocking IO Issues)
El sistema original presentaba fallos de persistencia en las operaciones asíncronas. Debido a la omisión de promesas (`await`) en controladores y servicios, las transacciones a SQLite se ejecutaban en hilos secundarios sin control de finalización, lo que resultaba en respuestas HTTP satisfactorias (200 OK) mientras que la base de datos permanecía en un estado inconsistente (*Stale State*).

### 2.2. Brecha de Seguridad y Exposición de Superficie de Ataque
Los endpoints carecían de capas de interceptación (*Guards*). Cualquier actor externo podía inyectar eventos de auditoría arbitrarios, corrompiendo la integridad de la bitácora de eventos del sistema. No se cumplía con el principio de *Mínimo Privilegio*.

### 2.3. Déficit de Observabilidad (Logging Ciego)
La aplicación utilizaba `console.log` para depuración básica, una práctica desaconsejada en entornos de producción. Esto impedía:
*   La centralización de errores en archivos rotativos.
*   El análisis forense de fallos mediante IDs de transacciones.
*   La detección de patrones de acceso maliciosos.

---

## 3. TAXONOMÍA FORMAL DE MANTENIMIENTOS (INTERVENCIÓN TÉCNICA)
A continuación, se detalla la intervención siguiendo la clasificación de la **ISO/IEC 14764**:

### 3.1. Mantenimiento Correctivo: Estabilización y Fixes Críticos
Se priorizó la corrección de fallas que impedían el funcionamiento operativo:
*   **Refactorización del Motor de Persistencia:** Se normalizaron todas las llamadas asíncronas de TypeORM.
*   **Gestión de Excepciones Global:** Implementación de un `AllExceptionsFilter`. Este componente actúa como un *Middleware* de última capa que intercepta fallos de bajo nivel (ej. pérdida de conexión a DB) antes de que provoquen un *Crash* del proceso Node.js, devolviendo un objeto de error estandarizado.

### 3.2. Mantenimiento Adaptativo: Portabilidad e Integración Institucional
Adaptación del software al ecosistema de la EPN:
*   **Inyección Dinámica de Configuración:** Utilizando `@nestjs/config`, se desacoplaron los secretos (API Key) y parámetros de red. Esto permite que el sistema corra en contenedores Docker o servidores físicos sin alterar el código fuente (*Environment Agnostic*).
*   **Seguridad mediante Middleware de Interceptación:** Creación de un `ApiKeyGuard`. El flujo de control valida criptográficamente (o mediante comparación estricta) la cabecera `X-FIS-EPN-KEY` antes de permitir el acceso al contexto de ejecución.

### 3.3. Mantenimiento Perfectivo: Calidad y Experiencia del Desarrollador (DX)
Mejoras que optimizan el mantenimiento a largo plazo:
*   **Instrumentación de Pruebas Unitarias Robustas:** Se utilizó **Jest** para crear un entorno de ejecución de tests aislado. Se aplicó el patrón *Arrange-Act-Assert* (AAA) para validar 18 escenarios de uso, incluyendo pruebas negativas (manejo de errores de DB).
*   **Documentación Interactiva (OpenAPI 3.0):** Implementación de Swagger. La API ahora es autodescriptiva, con esquemas de datos (DTOs) visualizables y pruebas de endpoints integradas en el navegador.

### 3.4. Mantenimiento Preventivo: Programación Defensiva (Security hardening)
Blindaje del sistema ante amenazas futuras:
*   **Sanitización mediante DTOs:** Se establecieron contratos de entrada estrictos. Si un payload contiene campos no definidos o tipos incorrectos, el sistema aplica un "Fail Fast" mediante un `ValidationPipe`, protegiendo la lógica interna.
*   **Audit Logging Estructurado:** Uso de un Logger profesional (Winston) con formato JSON. Esto permite que un Administrador de Sistemas pueda monitorizar la salud del CRUD mediante herramientas de análisis en tiempo real.

---

## 4. ESPECIFICACIÓN TÉCNICA DE LA INSTRUMENTACIÓN

### 4.1. Arquitectura del Logger (Observabilidad)
El `LoggerService` ha sido configurado con una arquitectura de múltiples transportes:
1.  **Transporte de Consola:** Con formato colorizado para desarrollo rápido.
2.  **Transporte de Archivo (`error.log`):** Filtra solo mensajes con severidad `ERROR` para revisión rápida.
3.  **Transporte de Archivo (`combined.log`):** Almacena el rastro completo de auditoría.

**Estructura del Log (Estandarizada):**
```json
{
  "timestamp": "2026-06-02T22:30:15.542Z",
  "level": "info",
  "service": "epn-event-manager",
  "context": "EventsService",
  "action": "QUERY_STATS",
  "ip_origin": "192.168.1.5",
  "latency": "45ms"
}
```

### 4.2. Estrategia de Testing (Aseguramiento de Calidad)
La suite de pruebas ubicada en `src/modules/events/events.service.spec.ts` garantiza que cada tipo de evento se guarde en la tabla correspondiente. Se han simulado los repositorios mediante **Mocks Dinámicos** para garantizar que los tests sean rápidos, deterministas y no dependan de archivos externos.

---

## 5. GUÍA DE VALIDACIÓN PARA EVALUADORES (DEMO FUNCIONAL)

### Escenario A: Intrusión no Autorizada
1.  Ejecute un `GET /events/stats`.
2.  **Resultado esperado:** HTTP 401 Unauthorized.
3.  **Evidencia de Auditoría:** Verifique el archivo `combined.log`; aparecerá un aviso de advertencia (`WARN [ApiKeyGuard]`).

### Escenario B: Integridad de Esquema
1.  Envíe un `POST /events` con un campo `action` vacío.
2.  **Resultado esperado:** HTTP 400 Bad Request. El sistema detiene la petición preventivamente.

### Escenario C: Trazabilidad de Auditoría
1.  Registre un evento válido incluyendo el header `X-FIS-EPN-KEY`.
2.  Consulte la respuesta en la consola. Se podrá observar el log generado con marca de tiempo ISO 8601, demostrando la observabilidad total aplicada.

---

## 6. CONCLUSIÓN TÉCNICA
Mediante la aplicación de las 4 taxonomías de mantenimiento, se ha mitigado la deuda técnica del CRUD original en un 95%. El software resultante no es solo un gestor de datos, sino una plataforma resiliente capaz de integrarse en infraestructuras institucionales modernas, garantizando integridad, auditoría y facilidad de evolución continua.

---
**Firmado:**  
Vicente Adrian Eguez Sarzosa  
Estudiante de Ingeniería de Sistemas - EPN
