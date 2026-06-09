# 🏋️ Infinity Force — Informe de Arquitectura de Software

> **Rol:** Arquitecto de Software Senior | Stack: Angular · Spring Boot · MongoDB  
> **Fecha de análisis:** 03 de junio de 2026  
> **Base analizada:** Workspace completo (`backend/` + `frontend/`) + `contexto-proyecto.md`

---

## 1. 🔴 ANÁLISIS DE DEUDA TÉCNICA Y FALLOS

### 1.1 Antipatrón "Fat Controller" — Diagnóstico por archivo

| Archivo | Severidad | Problema detectado |
|---|---|---|
| [`UsuarioController.java`](file:///c:/Users/DREP/Downloads/Infinity%20Force%203-06/backend/backend/src/main/java/com/infinityforce/backend/controller/UsuarioController.java) | 🔴 **Crítica** | Contiene lógica de negocio completa: generación de JWT, validación de duplicados de DNI/código, asignación de rol/estado/asistencias, cambio de contraseña — **todo en el controlador** |
| [`EjercicioController.java`](file:///c:/Users/DREP/Downloads/Infinity%20Force%203-06/backend/backend/src/main/java/com/infinityforce/backend/controller/EjercicioController.java) | 🟡 **Media** | Simple por ahora, pero en cuanto se agreguen filtros por músculo/tipo/categoría, la lógica de filtrado caerá aquí si no se actúa |
| [`RutinaController.java`](file:///c:/Users/DREP/Downloads/Infinity%20Force%203-06/backend/backend/src/main/java/com/infinityforce/backend/controller/RutinaController.java) | 🟡 **Media** | Validación de `clienteId` y gestión de estado incrustada directamente; escalará a crítico con la secuencia de entrenamiento |

**Actualmente no existe ningún `@Service`** en el proyecto. La capa de servicios (`service/`) está completamente ausente.

---

### 1.2 Auditoría de Seguridad JWT

#### ✅ Lo que SÍ está bien:
- Uso de `jjwt` (librería estándar de la industria) en versión `0.11.5`
- Token firmado con `HMAC-SHA256` — correcto para un sistema monolítico
- Filtro `JwtAuthenticationFilter` implementado como `OncePerRequestFilter` — patrón correcto
- El endpoint `/api/login` es el único que está en `permitAll()` — bien configurado
- Token con expiración de 24 horas (`86400000 ms`)

#### 🔴 Vulnerabilidades y malas prácticas detectadas:

**Vulnerabilidad #1 — Clave secreta hardcodeada en DOS lugares**
```java
// UsuarioController.java (línea 32)
private final String SECRET_KEY_STRING = "EstaEsUnaClaveSecretaMuyLargaParaInfinityForceGym2026!@#";

// JwtAuthenticationFilter.java (línea 21) — misma clave duplicada
private final String SECRET_KEY_STRING = "EstaEsUnaClaveSecretaMuyLargaParaInfinityForceGym2026!@#";
```
> **Riesgo:** Si la clave cambia en un lugar y no en el otro, toda la autenticación colapsa. Si el repo es público (GitHub), la clave queda expuesta. **Debe estar en `application.properties` o variables de entorno.**

**Vulnerabilidad #2 — Contraseñas en texto plano**
```java
// UsuarioController.java (línea 43)
Optional<Usuario> usuarioOpt = usuarioRepository.findByCodigoAccesoAndContrasena(codigo, contrasena);

// (línea 145) — comparación directa
if (!usuario.getContrasena().equals(dto.getClaveActual())) {
```
> **Riesgo Crítico:** Las contraseñas se almacenan y comparan en texto plano en MongoDB. Si la base de datos es comprometida, todas las credenciales quedan expuestas de inmediato. **Se debe usar BCrypt.**

**Vulnerabilidad #3 — CORS abierto a `*` en producción**
```java
// SecurityConfig.java (línea 23)
config.setAllowedOrigins(List.of("*"));
```
> **Riesgo:** En producción, cualquier dominio externo puede hacer peticiones autenticadas. Debe restringirse al dominio del frontend.

**Vulnerabilidad #4 — Sin capa de Servicio para JWT**
La generación del token vive en el controlador. Si en el futuro se necesita generar un token desde otro flujo (ej. refresh token, OAuth), habría que duplicar código.

---

## 2. 🟠 ANÁLISIS DE BRECHAS (GAP ANALYSIS)

### Requerimiento 1 — Filtros en el modal del catálogo de ejercicios

| Estado | Detalle |
|---|---|
| **Frontend** | ❌ Falta | El modal en [`armar-rutina.html`](file:///c:/Users/DREP/Downloads/Infinity%20Force%203-06/frontend/src/app/pages/armar-rutina/armar-rutina.html) (líneas 59-88) lista todos los ejercicios sin ningún filtro. No hay chips, dropdowns ni lógica de filtrado en el `.ts` |
| **Backend** | ❌ Falta | [`EjercicioRepository`](file:///c:/Users/DREP/Downloads/Infinity%20Force%203-06/backend/backend/src/main/java/com/infinityforce/backend/repository/EjercicioRepository.java) no tiene métodos de query. El endpoint solo hace `findAll()` sin soporte de query params |

**Archivos a crear:**
- `EjercicioService.java` (backend) — lógica de filtrado
- Métodos en `EjercicioRepository`: `findByGrupoMuscular()`, `findByTipo()`, `findByCategoria()`

**Archivos a modificar:**
- [`EjercicioController.java`](file:///c:/Users/DREP/Downloads/Infinity%20Force%203-06/backend/backend/src/main/java/com/infinityforce/backend/controller/EjercicioController.java) — aceptar `@RequestParam` opcionales
- [`armar-rutina.ts`](file:///c:/Users/DREP/Downloads/Infinity%20Force%203-06/frontend/src/app/pages/armar-rutina/armar-rutina.ts) — lógica de filtrado local o llamada filtrada a API
- [`armar-rutina.html`](file:///c:/Users/DREP/Downloads/Infinity%20Force%203-06/frontend/src/app/pages/armar-rutina/armar-rutina.html) — chips/pills de filtro dentro del modal

---

### Requerimiento 2 — Soporte multimedia (imágenes/videos)

| Estado | Detalle |
|---|---|
| **Backend** | ❌ Falta | El modelo [`Ejercicio.java`](file:///c:/Users/DREP/Downloads/Infinity%20Force%203-06/backend/backend/src/main/java/com/infinityforce/backend/model/Ejercicio.java) no tiene campos `imagenUrl` ni `videoUrl` |
| **Frontend** | ❌ Falta | Las tarjetas de ejercicio en el modal no muestran imagen ni video |

**Archivos a modificar:**
- [`Ejercicio.java`](file:///c:/Users/DREP/Downloads/Infinity%20Force%203-06/backend/backend/src/main/java/com/infinityforce/backend/model/Ejercicio.java) — agregar `String imagenUrl`, `String videoUrl`
- [`armar-rutina.html`](file:///c:/Users/DREP/Downloads/Infinity%20Force%203-06/frontend/src/app/pages/armar-rutina/armar-rutina.html) — mostrar imagen/thumbnail en tarjeta del modal

---

### Requerimiento 3 — Desglose visual de rutinas predeterminadas

| Estado | Detalle |
|---|---|
| **Frontend** | ❌ Falta | En [`rutinas.html`](file:///c:/Users/DREP/Downloads/Infinity%20Force%203-06/frontend/src/app/pages/rutinas/rutinas.html) las plantillas se muestran como tarjetas simples (nombre + descripción). No hay expansión/acordeón para ver los días y ejercicios antes de elegirla |
| **Backend** | ⚠️ Funciona | Las plantillas ya incluyen el array `dias` con `ejerciciosBase`, pero los ejercicios solo guardan el `ejercicioId`, no el nombre. Se necesita **populate/join** con la colección `ejercicios` |

**Archivos a crear:**
- `PlantillaService.java` (backend) — enriquecimiento de ejercicios por ID

**Archivos a modificar:**
- [`RutinaController.java`](file:///c:/Users/DREP/Downloads/Infinity%20Force%203-06/backend/backend/src/main/java/com/infinityforce/backend/controller/RutinaController.java) — enriquecer respuesta o crear endpoint `/api/plantillas/{id}/detalle`
- [`rutinas.html`](file:///c:/Users/DREP/Downloads/Infinity%20Force%203-06/frontend/src/app/pages/rutinas/rutinas.html) — acordeón expandible por día con lista de ejercicios
- [`rutinas.ts`](file:///c:/Users/DREP/Downloads/Infinity%20Force%203-06/frontend/src/app/pages/rutinas/rutinas.ts) — lógica para expandir/colapsar días

---

### Requerimiento 4 — Secuencia de entrenamiento (qué día le toca)

| Estado | Detalle |
|---|---|
| **Backend** | ❌ Falta | No existe ningún endpoint que devuelva la rutina del socio ni calcule el "día actual" de entrenamiento. `RutinaSocioRepository` tiene `findByClienteId()` pero nadie lo consume desde el frontend |
| **Frontend** | ❌ Falta | [`dashboard.ts`](file:///c:/Users/DREP/Downloads/Infinity%20Force%203-06/frontend/src/app/pages/dashboard/dashboard.ts) no carga la rutina del usuario. El modal de entrenamiento tiene un `<select>` hardcodeado con opciones fijas (líneas 72-76 del `dashboard.html`) que no respetan la rutina guardada |

**Archivos a crear:**
- `RutinaService.java` (backend) — lógica de secuencia de días
- Nuevo endpoint: `GET /api/rutinas-socios/cliente/{clienteId}` (o por `Principal`)
- `sesion-entrenamiento/` — nuevo componente Angular para la pantalla de tracking

**Archivos a modificar:**
- [`RutinaController.java`](file:///c:/Users/DREP/Downloads/Infinity%20Force%203-06/backend/backend/src/main/java/com/infinityforce/backend/controller/RutinaController.java) — exponer rutina del socio autenticado
- [`dashboard.ts`](file:///c:/Users/DREP/Downloads/Infinity%20Force%203-06/frontend/src/app/pages/dashboard/dashboard.ts) — cargar rutina real del usuario vía JWT `sub` claim
- [`dashboard.html`](file:///c:/Users/DREP/Downloads/Infinity%20Force%203-06/frontend/src/app/pages/dashboard/dashboard.html) — reemplazar `<select>` estático por los días reales de la rutina

---

### Requerimiento 5 — Monitoreo en vivo (tracking de series, reps y pesos)

| Estado | Detalle |
|---|---|
| **Backend** | ❌ Falta | No existe modelo ni colección para sesiones de entrenamiento (`sesiones_entrenamiento`) |
| **Frontend** | ❌ Falta | El dashboard tiene un cronómetro básico (funcional) pero **no trackea series individuales, pesos ni repeticiones**. El modal solo pide el nombre de la rutina genérica |

**Archivos a crear:**
- `SesionEntrenamiento.java` (modelo) — estructura para tracking por serie
- `SesionRepository.java`
- `SesionService.java`
- Endpoint: `POST /api/sesiones` — guardar sesión completada
- Componente Angular: `sesion-entrenamiento/` — UI de tracking en vivo (cronómetro + sets)

**Archivos a modificar:**
- [`dashboard.ts`](file:///c:/Users/DREP/Downloads/Infinity%20Force%203-06/frontend/src/app/pages/dashboard/dashboard.ts) + [`dashboard.html`](file:///c:/Users/DREP/Downloads/Infinity%20Force%203-06/frontend/src/app/pages/dashboard/dashboard.html) — iniciar sesión de tracking en lugar de solo cronómetro
- [`app.routes.ts`](file:///c:/Users/DREP/Downloads/Infinity%20Force%203-06/frontend/src/app/app.routes.ts) — nueva ruta `/sesion-entrenamiento`

---

### Resumen de brechas — Tabla completa

| Requerimiento | Archivos nuevos (BE) | Archivos nuevos (FE) | Archivos a modificar |
|---|---|---|---|
| Filtros modal | `EjercicioService` | — | `EjercicioController`, `EjercicioRepository`, `armar-rutina.ts/.html` |
| Multimedia | — | — | `Ejercicio.java`, `armar-rutina.html` |
| Desglose visual | `PlantillaService` | — | `RutinaController`, `rutinas.html/.ts` |
| Secuencia | `RutinaService` | `sesion-entrenamiento/` | `RutinaController`, `dashboard.ts/.html`, `app.routes.ts` |
| Monitoreo en vivo | `SesionEntrenamiento`, `SesionRepository`, `SesionService` | `sesion-entrenamiento/` | `dashboard.ts/.html`, `app.routes.ts` |

---

## 3. 🔵 ESTRATEGIA DE REFACTORIZACIÓN (Fat Controller → Service Layer)

> **Principio guía:** Cada paso debe dejar el sistema en estado verde y funcional. Nunca se rompe la integración Angular ↔ Spring Boot ni el flujo JWT en ningún momento.

### Paso 1 — Crear la infraestructura del paquete `service/`

Crear el directorio `src/main/java/com/infinityforce/backend/service/`. **No tocar nada todavía.**

```
backend/
  ├── controller/   ← sin cambios aún
  ├── model/
  ├── repository/
  ├── security/
  ├── dto/
  └── service/      ← NUEVO (vacío por ahora)
```

---

### Paso 2 — Extraer `UsuarioService` (el más crítico)

Crear `UsuarioService.java` con `@Service` y mover la lógica en este orden:

1. **Mover primero** → método `login()`: generación del JWT, búsqueda por credenciales, construcción del mapa de respuesta
2. **Mover segundo** → método `registrarUsuario()`: validación de duplicados DNI/código, asignación de defaults
3. **Mover tercero** → método `cambiarPassword()`: búsqueda por ID, validación de contraseña actual

**Regla de oro:** El controlador solo debe:
```java
@PostMapping("/login")
public ResponseEntity<Map<String,Object>> login(@RequestBody Map<String,String> creds) {
    return ResponseEntity.ok(usuarioService.login(creds));
}
```

> ⚠️ **No cambiar las URLs de los endpoints ni los nombres de los campos JSON.** Angular seguirá funcionando sin modificaciones.

---

### Paso 3 — Extraer `JwtService` (eliminar duplicación de clave)

Crear `JwtService.java` con `@Service` (o `@Component`):

```java
@Service
public class JwtService {
    @Value("${app.jwt.secret}")  // ← desde application.properties
    private String secretKey;

    public String generarToken(Usuario usuario) { ... }
    public Claims validarToken(String token) { ... }
}
```

Mover el `SECRET_KEY_STRING` a `application.properties`:
```properties
app.jwt.secret=EstaEsUnaClaveSecretaMuyLargaParaInfinityForceGym2026!@#
```

Luego `UsuarioController` y `JwtAuthenticationFilter` **inyectan `JwtService`** en lugar de duplicar la clave. Angular no se ve afectado en absoluto.

---

### Paso 4 — Extraer `EjercicioService` y `RutinaService`

Una vez estabilizado el paso anterior:
- `EjercicioService`: contiene `obtenerTodos()`, `filtrarPor(grupoMuscular, tipo, categoria)`
- `RutinaService`: contiene `guardarRutinaSocio()`, `obtenerRutinaActivaPorCliente(clienteId)`, `calcularDiaActual(rutina, historialSesiones)`

Los controladores se reducen a despachar request y delegar.

---

### Paso 5 — Crear `SesionService` para los nuevos requerimientos

Ya con la arquitectura limpia, crear:
- `SesionService`: `iniciarSesion()`, `registrarSet(sesionId, ejercicioId, series, reps, peso)`, `finalizarSesion()`

Este servicio interactúa con la colección `sesiones_entrenamiento` (nueva) sin contaminar ningún controlador existente.

---

### Árbol final de la capa de servicios

```
service/
  ├── UsuarioService.java      (extraído del controlador)
  ├── JwtService.java          (centraliza JWT, inyectable)
  ├── EjercicioService.java    (filtros + multimedia)
  ├── RutinaService.java       (plantillas + secuencia)
  └── SesionService.java       (nuevo — monitoreo en vivo)
```

---

## 4. 🟢 RUTA DE ACCIÓN RECOMENDADA — Roadmap de 5 Pasos

> Ordenados por **prioridad lógica** (dependencias primero, valor al usuario de atrás hacia adelante).

---

### ⭐ Paso 1 — Refactorización de Backend (base estructural)
**Prioridad:** Antes de todo lo demás  
**Qué hacer:**
- Crear paquete `service/`
- Extraer `JwtService` con `@Value` desde `application.properties`
- Extraer `UsuarioService`, `EjercicioService`, `RutinaService`
- Agregar hashing BCrypt a contraseñas (sin romper login — migración gradual)

**Por qué primero:** Todo el trabajo nuevo (filtros, sesiones, secuencia) se construirá sobre esta arquitectura. Si se implementan features nuevas sobre el antipatrón, la deuda se multiplica.

---

### ⭐ Paso 2 — Multimedia + Filtros del catálogo de ejercicios
**Prioridad:** Alta (prerequisito para desglose visual y monitoreo)  
**Qué hacer:**
- Agregar `imagenUrl` y `videoUrl` al modelo `Ejercicio.java`
- Implementar `EjercicioService.filtrarPor()` y endpoint con `@RequestParam`
- Actualizar el modal de `armar-rutina` con chips de filtro (músculo/tipo/categoría)
- Mostrar imagen/thumbnail en cada tarjeta del catálogo dentro del modal

**Por qué segundo:** Los datos de ejercicios enriquecidos son necesarios para el desglose visual (paso 3) y para la pantalla de monitoreo (paso 5).

---

### ⭐ Paso 3 — Desglose visual de rutinas predeterminadas
**Prioridad:** Media-Alta (mejora UX del flujo de selección)  
**Qué hacer:**
- Backend: enriquecer respuesta de `GET /api/plantillas` haciendo join con ejercicios (via `EjercicioService`)
- Frontend: acordeón expandible en `rutinas.html` — un bloque por día con la lista de ejercicios y sus imágenes

**Por qué tercero:** Depende de los datos multimedia del paso 2. Bloquea el siguiente paso porque el usuario debe poder ver su rutina antes de iniciar secuencia.

---

### ⭐ Paso 4 — Secuencia de entrenamiento (qué día le toca)
**Prioridad:** Media (flujo inteligente del dashboard)  
**Qué hacer:**
- Backend: endpoint `GET /api/rutinas-socios/mi-rutina` autenticado por JWT `Principal`
- Backend: `RutinaService.calcularDiaActual()` — basado en el historial de sesiones completadas
- Frontend: dashboard carga la rutina real del socio y muestra dinámicamente el "Día X" en el modal de entrenamiento (reemplaza el `<select>` hardcodeado)

**Por qué cuarto:** Depende de que la rutina esté guardada correctamente (flujos de paso 3) y sienta la base del paso 5.

---

### ⭐ Paso 5 — Monitoreo en vivo (tracking de series, reps y pesos)
**Prioridad:** Media (feature principal de valor diferencial)  
**Qué hacer:**
- Backend: nuevo modelo `SesionEntrenamiento` + `SesionService` + endpoint `POST /api/sesiones`
- Frontend: nueva pantalla `/sesion-entrenamiento` con UI de tracking:
  - Lista de ejercicios del día actual (del paso 4)
  - Por cada ejercicio: filas de sets con input de peso + reps completadas
  - Cronómetro integrado (ya existe en dashboard, se reutiliza)
  - Botón "Finalizar Sesión" → persiste en MongoDB y actualiza historial

**Por qué quinto:** Es el feature más complejo y depende de todos los anteriores (datos de ejercicios, rutina del socio, secuencia de días). Construirlo último garantiza que todos sus inputs están correctos.

---

## Diagrama de dependencias del Roadmap

```
[Paso 1: Refactorización BE] ──────────────────────────────┐
         │                                                  │
         ▼                                                  │
[Paso 2: Multimedia + Filtros] ──────────────────────────┐  │
         │                                               │  │
         ▼                                               │  │
[Paso 3: Desglose Visual] ──────────────────────────────┐│  │
         │                                              ││  │
         ▼                                              ││  │
[Paso 4: Secuencia de Entrenamiento] ───────────────────┘│  │
         │                                               │  │
         ▼                                               ▼  ▼
[Paso 5: Monitoreo en Vivo] ←──── (usa todo lo anterior) ───┘
```

---

> **Nota final:** Cuando estés listo para ejecutar cualquiera de estos pasos, puedo generar el código completo de cada archivo con su respectiva explicación. Se recomienda empezar por el **Paso 1** y hacer un commit limpio antes de continuar con el siguiente.
