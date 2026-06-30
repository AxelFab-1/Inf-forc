# Plan: Arquitectura Dual — Asistencias + Sesiones de Entrenamiento

## Resumen

Vamos a modernizar la arquitectura de datos implementando el **Bucket Pattern** para asistencias y **Referencias Extendidas** para sesiones, separando responsabilidades entre dos colecciones.

---

## TAREA 1 — Análisis de Impacto y Lógica Oculta

### ¿Qué se rompe con este cambio?

| Punto crítico | Estado actual | Impacto |
|---|---|---|
| `borrarAsistencia()` en dashboard.ts | Solo borra de **localStorage** | ✅ No se rompe, pero queda incompleta — habrá que actualizarla para que llame al backend |
| `guardarYSalir()` en sesion-entrenamiento.ts | Guarda en `sesiones_entrenamiento` + escribe en **localStorage** | ⚠️ El localStorage se reemplazará con la nueva colección `asistencias` |
| `calcularIndiceDiaSiguiente()` en SesionService | Cuenta el total de sesiones en `sesiones_entrenamiento` | ✅ No se rompe, sigue usando la misma colección |
| `GET /api/sesiones/mi-historial` | Lee todas las sesiones sin filtro de mes | ✅ No se rompe, pero el historial ahora navegará por `asistencias` primero |
| Calendario del dashboard | Lee de localStorage | ❌ Se reemplaza — ahora leerá del backend (colección `asistencias`) |

### ¿Hay @Transactional configurado?

**No.** La clase `BackendApplication.java` no tiene `@EnableTransactionManagement` y los servicios no usan `@Transactional`.

Esto significa que si la escritura en `asistencias` falla **después** de haber guardado en `sesiones_entrenamiento`, quedará una sesión huérfana.

**Decisión:** Para MongoDB en modo standalone (sin replica set) las transacciones multi-colección no están disponibles de forma nativa sin configuración adicional. La estrategia será:
1. Guardar primero en `sesiones_entrenamiento` → obtener el `sesionId`.
2. Luego hacer `upsert` en `asistencias` usando `$push` de manera atómica con MongoTemplate.
3. Si el `upsert` falla, el controlador devuelve error y el frontend puede reintentar.

---

## TAREA 2 — Nuevos Modelos Java (Backend)

### [NEW] Asistencia.java
Modelo para el Bucket Pattern. Un documento por cliente por mes.
Colección: `asistencias`
- `_id`: String con formato `ast_{clienteId}_{año}_{mes}`
- `clienteId`: String
- `anio`: int
- `mes`: int
- `registros`: List de objetos con `dia` (int) y `sesionId` (String)

### [MODIFY] SesionEntrenamiento.java
Sin cambios estructurales. Ya tiene la forma correcta.

---

## TAREA 2 — Nuevos Repositorios y Servicios (Backend)

### [NEW] AsistenciaRepository.java
- `findByClienteIdAndAnioAndMes(clienteId, año, mes)` → para el dashboard
- `findByClienteIdAndAnio(clienteId, año)` → para historial anual

### [MODIFY] SesionService.java
- `guardarSesion()` ahora también hace upsert en `asistencias`

### [NEW] AsistenciaController.java
- `GET /api/asistencias/mes-actual` → devuelve el bucket del mes actual
- `GET /api/asistencias` con params `anio` y `mes` → para navegar entre meses
- `DELETE /api/asistencias/registro/{sesionId}` → borra el registro del array Y la sesión

---

## TAREA 3 — Dashboard (Angular)

### [MODIFY] dashboard.ts
- Reemplazar lógica de localStorage por `fetch GET /api/asistencias/mes-actual`
- Nuevo array `diasEntrenados: number[]`
- `borrarAsistencia()` cambia para llamar al backend

### [MODIFY] dashboard.html
- Calendario actualizado con `ngClass` que usa `diasEntrenados`
- Botón "Ver historial completo" agregado

---

## TAREA 4 — Nueva Pantalla Historial (Angular)

### [NEW] historial-entrenamiento/ (componente completo)
- Navegación por meses con flechas
- fetch dinámico al cambiar de mes
- Selección de día entrenado → activa botones
- "Ver detalle" → fetch al backend por sesionId → modal con info
- "Borrar" → DELETE al backend y refresca

### [MODIFY] app.routes.ts
- Agregar ruta `/historial-entrenamiento`

### [MODIFY] sesion-entrenamiento.ts
- Remover escritura de localStorage (ya no es necesaria)

---

## Archivos que se crean o modifican

### Backend
| Acción | Archivo |
|---|---|
| [NEW] | `Asistencia.java` |
| [NEW] | `AsistenciaRepository.java` |
| [MODIFY] | `SesionService.java` |
| [NEW] | `AsistenciaController.java` |

### Frontend
| Acción | Archivo |
|---|---|
| [MODIFY] | `dashboard.ts` |
| [MODIFY] | `dashboard.html` |
| [NEW] | `historial-entrenamiento.ts` |
| [NEW] | `historial-entrenamiento.html` |
| [NEW] | `historial-entrenamiento.css` |
| [MODIFY] | `app.routes.ts` |
| [MODIFY] | `sesion-entrenamiento.ts` |

## Verificación
- Compilar backend con `mvn clean spring-boot:run`
- Verificar que `POST /api/sesiones` escribe en ambas colecciones
- Verificar que el dashboard carga días entrenados desde el backend
- Navegar entre meses en historial y verificar que el fetch cambia
