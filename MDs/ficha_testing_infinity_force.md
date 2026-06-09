# FICHA DE TESTING — INFINITY FORCE GYM APP
---

| Campo | Detalle |
|---|---|
| **Proyecto** | Infinity Force — Gym Management Application |
| **Versión del Sistema** | v0.1 — Sprint de Deuda Técnica (Junio 2026) |
| **Fecha de Elaboración** | 04 de junio de 2026 |
| **Elaborado por** | Equipo de Desarrollo Infinity Force |
| **Tipo de Prueba** | Pruebas Funcionales · Pruebas de Seguridad · Pruebas de Integración |
| **Entorno de Prueba** | Local — Backend: `http://localhost:8090` · Frontend: `http://localhost:4200` |
| **Base de Datos** | MongoDB local — Base: `InfBD` |
| **Stack** | Angular 17+ · Spring Boot 4.0 · MongoDB 7.x |
| **Herramienta de prueba API** | Postman / cURL |

---

## CONVENCIONES DE ESTADO

| Símbolo | Estado |
|---|---|
| ✅ PASS | El caso de prueba pasa correctamente |
| ❌ FAIL | El caso de prueba falla |
| ⚠️ PARCIAL | Funciona con condiciones o limitaciones |
| 🔲 PENDIENTE | No ejecutado aún |

---

## MÓDULO 1 — AUTENTICACIÓN (Login)

> **Ruta Frontend:** `/` (pantalla raíz)  
> **Endpoint Backend:** `POST http://localhost:8090/api/login`  
> **Archivo:** `login.ts` · `UsuarioController.java` · `UsuarioService.java`

| ID | Caso de Prueba | Datos de Entrada | Pasos | Resultado Esperado | Resultado Real | Estado |
|---|---|---|---|---|---|---|
| **TC-01** | Login con credenciales válidas de cliente | `codigo: "12345"` · `contrasena: "12345678"` | 1. Ingresar código y contraseña 2. Presionar "Iniciar sesión" | HTTP 200. Redirección a `/dashboard`. Token JWT guardado en `localStorage` bajo la clave `jwt_token` | — | 🔲 PENDIENTE |
| **TC-02** | Login con credenciales válidas de administrador | `codigo: "ADMIN1"` · `contrasena: "admin123"` | 1. Ingresar datos de admin 2. Presionar "Iniciar sesión" | HTTP 200. Redirección a `/admin-dashboard`. Token contiene `rol: "administrador"` | — | 🔲 PENDIENTE |
| **TC-03** | Login con contraseña incorrecta | `codigo: "12345"` · `contrasena: "INCORRECTA"` | 1. Ingresar código correcto y contraseña errónea 2. Presionar "Iniciar sesión" | HTTP 401. Mensaje de error: *"Código de acceso o contraseña incorrectos."* Campo contraseña se limpia | — | 🔲 PENDIENTE |
| **TC-04** | Login con código inexistente | `codigo: "99999"` · `contrasena: "cualquiera"` | 1. Ingresar código no registrado 2. Presionar "Iniciar sesión" | HTTP 401. Mensaje de error visible en pantalla | — | 🔲 PENDIENTE |
| **TC-05** | Login con campos vacíos | Sin datos | 1. No ingresar ningún dato 2. Presionar "Iniciar sesión" | Validación frontend: *"Por favor, completa ambos campos."* Sin llamada al backend | — | 🔲 PENDIENTE |
| **TC-06** | Redirección automática si ya hay sesión activa | Token válido en localStorage | 1. Ir a la raíz `/` con token ya presente | Redirección inmediata a `/dashboard` o `/admin-dashboard` según rol. No muestra login | — | 🔲 PENDIENTE |
| **TC-07** | Visibilidad de contraseña | — | 1. Escribir contraseña 2. Presionar ícono de ojo | El campo alterna entre `type="password"` y `type="text"` | — | 🔲 PENDIENTE |

---

## MÓDULO 2 — SEGURIDAD Y CONTROL DE ACCESO

> **Archivo:** `auth-guard.ts` · `JwtAuthenticationFilter.java` · `SecurityConfig.java`

| ID | Caso de Prueba | Datos de Entrada | Pasos | Resultado Esperado | Resultado Real | Estado |
|---|---|---|---|---|---|---|
| **TC-08** | Acceso a ruta protegida sin token | Sin token en localStorage | 1. Navegar directamente a `/dashboard` | Redirección a `/` (login). No se muestra el dashboard | — | 🔲 PENDIENTE |
| **TC-09** | Acceso a ruta protegida con token válido | Token JWT válido en localStorage | 1. Navegar a `/dashboard` con token activo | Carga correcta del dashboard sin redirigir | — | 🔲 PENDIENTE |
| **TC-10** | Petición API sin cabecera Authorization | `GET /api/ejercicios` sin header | 1. Enviar petición sin token vía Postman | HTTP 403 o 401. No devuelve datos | — | 🔲 PENDIENTE |
| **TC-11** | Petición API con token expirado o malformado | `Authorization: Bearer TOKEN_FALSO` | 1. Enviar request con token inválido | HTTP 403. El filtro JWT impide el acceso | — | 🔲 PENDIENTE |
| **TC-12** | Acceso de cliente a ruta de administrador | Token de rol `"cliente"` | 1. Navegar manualmente a `/admin-dashboard` | Muestra alerta *"Acceso denegado"* y redirige a `/` | — | 🔲 PENDIENTE |
| **TC-13** | Endpoint `/api/login` sin token | Sin header | 1. `POST /api/login` sin Authorization | HTTP 200 (debe ser público, sin requerir token) | — | 🔲 PENDIENTE |

---

## MÓDULO 3 — PANEL ADMINISTRADOR

> **Ruta Frontend:** `/admin-dashboard`  
> **Endpoint Backend:** `POST http://localhost:8090/api/usuarios`  
> **Archivo:** `admin-dashboard.ts` · `admin-dashboard.html` · `UsuarioService.java`

| ID | Caso de Prueba | Datos de Entrada | Pasos | Resultado Esperado | Resultado Real | Estado |
|---|---|---|---|---|---|---|
| **TC-14** | Registro de nuevo usuario (cliente) con datos válidos | Nombres, apellidos, DNI (8 dígitos), código (5 dígitos), sede, rol=`cliente` | 1. Completar todos los campos 2. Presionar "Crear Usuario en el Sistema" | HTTP 201. Alerta verde: *"Usuario registrado correctamente."* Formulario se reinicia | — | 🔲 PENDIENTE |
| **TC-15** | Registro con DNI ya existente | DNI de un usuario ya registrado | 1. Ingresar DNI duplicado 2. Enviar formulario | HTTP 400. Alerta roja: *"El DNI o Código de Acceso ya está registrado."* | — | 🔲 PENDIENTE |
| **TC-16** | Registro con código de acceso duplicado | Código de acceso ya en uso | 1. Ingresar código duplicado 2. Enviar formulario | HTTP 400. Alerta roja con mensaje de duplicado | — | 🔲 PENDIENTE |
| **TC-17** | Registro con formulario incompleto | Campos requeridos vacíos | 1. Dejar campos obligatorios en blanco 2. Intentar enviar | Validación Angular bloquea el envío. El formulario marca campos en rojo | — | 🔲 PENDIENTE |
| **TC-18** | DNI con menos de 8 dígitos | `dni: "1234"` | 1. Ingresar DNI de 4 dígitos 2. Intentar enviar | Validación frontend por `pattern="[0-9]{8}"` bloquea el envío | — | 🔲 PENDIENTE |
| **TC-19** | Sincronización automática de contraseña con DNI | `dni: "12345678"` | 1. Escribir el DNI 2. Observar campo contraseña | La contraseña se autocompleta igual al DNI (método `sincronizarContrasena()`) | — | 🔲 PENDIENTE |
| **TC-20** | Cerrar sesión desde Admin Dashboard | Sesión activa de admin | 1. Presionar "Salir" | `localStorage` se limpia completamente. Redirección a `/` | — | 🔲 PENDIENTE |

---

## MÓDULO 4 — DASHBOARD DEL CLIENTE

> **Ruta Frontend:** `/dashboard`  
> **Archivo:** `dashboard.ts` · `dashboard.html`

| ID | Caso de Prueba | Datos de Entrada | Pasos | Resultado Esperado | Resultado Real | Estado |
|---|---|---|---|---|---|---|
| **TC-21** | Nombre del socio visible al iniciar sesión | Token con `nombres: "Juan Pérez"` | 1. Iniciar sesión como cliente 2. Navegar a dashboard | Encabezado muestra *"¡Bienvenido, Juan Pérez!"* | — | 🔲 PENDIENTE |
| **TC-22** | Calendario muestra el mes actual | Fecha del sistema actual | 1. Abrir dashboard | Calendario muestra el mes y año correctos con los días alineados por semana (L-D) | — | 🔲 PENDIENTE |
| **TC-23** | Día actual resaltado en el calendario | — | 1. Abrir dashboard | El día de hoy aparece visualmente diferenciado (clase `dia-actual`) | — | 🔲 PENDIENTE |
| **TC-24** | Iniciar entrenamiento sin seleccionar rutina | Sin opción seleccionada en modal | 1. Abrir modal "Plan de Hoy" 2. Presionar "¡A darle!" sin seleccionar rutina | Mensaje de error: *"Por favor, selecciona una rutina para empezar."* El cronómetro NO inicia | — | 🔲 PENDIENTE |
| **TC-25** | Iniciar entrenamiento con rutina seleccionada | `rutinaSeleccionada: "Tirón (Espalda/Bíceps)"` | 1. Abrir modal 2. Seleccionar una rutina 3. Presionar "¡A darle!" | Modal se cierra. Cronómetro inicia desde `00:00:00` y avanza en tiempo real | — | 🔲 PENDIENTE |
| **TC-26** | Finalizar entrenamiento y guardar asistencia | Cronómetro activo | 1. Presionar "Finalizar y Guardar" | Cronómetro se detiene. Modal de éxito aparece con tiempo registrado. Día marcado como asistido en calendario. Datos guardados en `localStorage` | — | 🔲 PENDIENTE |
| **TC-27** | Borrar asistencia del día | Asistencia marcada | 1. Presionar "Borrar asistencia" | La marca del día desaparece del calendario. Se elimina clave del `localStorage` | — | 🔲 PENDIENTE |
| **TC-28** | Persistencia de asistencia al recargar página | Asistencia guardada previamente | 1. Marcar asistencia 2. Recargar la página | El día sigue marcado como asistido al volver a cargar | — | 🔲 PENDIENTE |

---

## MÓDULO 5 — ZONA DE ENTRENAMIENTO (Entrenar)

> **Ruta Frontend:** `/entrenar`  
> **Archivo:** `entrenar.ts` · `entrenar.html`

| ID | Caso de Prueba | Datos de Entrada | Pasos | Resultado Esperado | Resultado Real | Estado |
|---|---|---|---|---|---|---|
| **TC-29** | Visualización de la pantalla Entrenar | Sesión activa | 1. Navegar a `/entrenar` | Se muestran dos tarjetas: "Rutinas" y "Nutrición" | — | 🔲 PENDIENTE |
| **TC-30** | Navegación a Rutinas desde Entrenar | — | 1. Presionar tarjeta "Rutinas" | Redirección correcta a `/rutinas` | — | 🔲 PENDIENTE |
| **TC-31** | Navegación a Nutrición desde Entrenar | — | 1. Presionar tarjeta "Nutrición" | Redirección a `/nutricion` (ruta actualmente sin componente asignado) | — | 🔲 PENDIENTE |

---

## MÓDULO 6 — SELECCIÓN Y ARMADO DE RUTINAS

> **Ruta Frontend:** `/rutinas` y `/armar-rutina/:id`  
> **Endpoints:** `GET /api/plantillas` · `POST /api/rutinas-socios`  
> **Archivo:** `rutinas.ts` · `armar-rutina.ts`

| ID | Caso de Prueba | Datos de Entrada | Pasos | Resultado Esperado | Resultado Real | Estado |
|---|---|---|---|---|---|---|
| **TC-32** | Carga de plantillas predeterminadas | Plantillas tipo `"predeterminada"` en BD | 1. Navegar a `/rutinas` | Se listan todas las plantillas predeterminadas. Botón "Predeterminadas" activo | — | 🔲 PENDIENTE |
| **TC-33** | Filtrar por plantillas personalizadas | Plantillas tipo `"personalizada"` en BD | 1. Presionar botón "Armar Personalizada" | Se muestran solo las plantillas de tipo personalizada | — | 🔲 PENDIENTE |
| **TC-34** | Seleccionar rutina predeterminada | Plantilla de tipo `"predeterminada"` | 1. Presionar "Elegir esta Rutina" | Se llama a `POST /api/rutinas-socios` con los datos de la plantilla y el `clienteId` del token. Redirección a `/dashboard` | — | 🔲 PENDIENTE |
| **TC-35** | Navegar al armador de rutina personalizada | Plantilla de tipo `"personalizada"` | 1. Presionar "Empezar a Armar" | Redirección a `/armar-rutina/{id}` con el ID de la plantilla | — | 🔲 PENDIENTE |
| **TC-36** | Carga del armador con plantilla válida | ID de plantilla existente | 1. Navegar a `/armar-rutina/{id}` | Se muestra el nombre de la plantilla y la estructura de días vacíos | — | 🔲 PENDIENTE |
| **TC-37** | Agregar ejercicio a un día de la rutina personalizada | Ejercicio del catálogo | 1. Presionar "Agregar Ejercicio" en un día 2. Modal del catálogo abre 3. Seleccionar un ejercicio 4. Ingresar series y repeticiones vía `prompt()` | El ejercicio aparece en la lista del día seleccionado con series y repeticiones | — | 🔲 PENDIENTE |
| **TC-38** | Eliminar ejercicio de un día | Ejercicio ya agregado | 1. Presionar ícono de basurero junto a un ejercicio | El ejercicio se elimina de la lista del día en tiempo real | — | 🔲 PENDIENTE |
| **TC-39** | Guardar rutina personalizada sin clienteId | Token ausente o inválido | 1. Presionar "Guardar Mi Rutina" sin sesión válida | Alerta de sesión inválida. Redirección a `/` | — | 🔲 PENDIENTE |
| **TC-40** | Guardar rutina personalizada con clienteId válido | Rutina con al menos un ejercicio | 1. Agregar ejercicios 2. Presionar "Guardar Mi Rutina" | HTTP 201. Alerta de éxito. Redirección a `/dashboard` | — | 🔲 PENDIENTE |

---

## MÓDULO 7 — CATÁLOGO DE PRODUCTOS (Tienda)

> **Ruta Frontend:** `/catalogo`  
> **Endpoint Backend:** `GET http://localhost:8090/api/productos`  
> **Archivo:** `catalogo.ts` · `catalogo.html` · `ProductoController.java`

| ID | Caso de Prueba | Datos de Entrada | Pasos | Resultado Esperado | Resultado Real | Estado |
|---|---|---|---|---|---|---|
| **TC-41** | Carga inicial del catálogo (todos los productos) | Productos en colección `catalogo` de MongoDB | 1. Navegar a `/catalogo` | Se listan todos los productos con imagen, nombre y precio en soles | — | 🔲 PENDIENTE |
| **TC-42** | Filtrar por categoría "Suplementos" | Productos con `categoria: "suplementos"` | 1. Presionar tarjeta "Suplementos" | Solo se muestran productos de esa categoría | — | 🔲 PENDIENTE |
| **TC-43** | Filtrar por categoría "Ropa" | Productos con `categoria: "ropa"` | 1. Presionar tarjeta "Ropa" | Solo se muestran productos de ropa | — | 🔲 PENDIENTE |
| **TC-44** | Filtrar por categoría "Accesorios" | Productos con `categoria: "accesorios"` | 1. Presionar tarjeta "Accesorios" | Solo se muestran productos de accesorios | — | 🔲 PENDIENTE |
| **TC-45** | Filtrar "Todos" después de filtrar por categoría | — | 1. Filtrar por Suplementos 2. Presionar "Todos" | Se muestran nuevamente todos los productos | — | 🔲 PENDIENTE |
| **TC-46** | Imagen rota de producto | `imagenUrl` con URL inválida | 1. Cargar producto con imagen fallida | Imagen de fallback: `https://placehold.co/300x140?text=Sin+Imagen` | — | 🔲 PENDIENTE |
| **TC-47** | Catálogo vacío para una categoría | Sin productos en esa categoría | 1. Filtrar por categoría sin registros | Mensaje: *"No hay productos en esta categoría."* | — | 🔲 PENDIENTE |
| **TC-48** | Error de conexión al servidor | Backend apagado | 1. Navegar a `/catalogo` con backend offline | Mensaje: *"No se pudo cargar el catálogo. Verifica que el servidor esté activo."* | — | 🔲 PENDIENTE |

---

## MÓDULO 8 — API REST (Pruebas directas con Postman)

> **Prerequisito:** Backend corriendo en `http://localhost:8090`

| ID | Endpoint | Método | Body / Headers | Resultado Esperado | Estado |
|---|---|---|---|---|---|
| **TC-49** | `/api/login` | POST | `{"codigo":"X","contrasena":"Y"}` | `{"exito":true,"token":"...","rol":"..."}` con HTTP 200 | 🔲 PENDIENTE |
| **TC-50** | `/api/usuarios` | POST | JSON de usuario + Bearer token | `{"exito":true,"id":"..."}` con HTTP 201 | 🔲 PENDIENTE |
| **TC-51** | `/api/usuarios` | GET | Bearer token válido | `{"exito":true,"datos":[...]}` con HTTP 200 | 🔲 PENDIENTE |
| **TC-52** | `/api/ejercicios` | GET | Bearer token válido | `{"exito":true,"datos":[...]}` con lista de ejercicios | 🔲 PENDIENTE |
| **TC-53** | `/api/plantillas` | GET | Bearer token válido | `{"exito":true,"datos":[...]}` con plantillas y sus días | 🔲 PENDIENTE |
| **TC-54** | `/api/rutinas-socios` | POST | JSON de rutina + Bearer token | `{"exito":true,"id":"..."}` con HTTP 201 | 🔲 PENDIENTE |
| **TC-55** | `/api/rutinas-socios` | POST | Sin campo `clienteId` | `{"exito":false,"mensaje":"Falta el ID del cliente."}` con HTTP 400 | 🔲 PENDIENTE |
| **TC-56** | `/api/productos` | GET | Bearer token válido | `{"exito":true,"datos":[...]}` con lista de productos | 🔲 PENDIENTE |
| **TC-57** | `/api/usuarios/cambiar-password` | PUT | `{"claveActual":"X","nuevaClave":"Y"}` + Bearer token | `{"exito":true,"mensaje":"Tu contraseña se ha actualizado correctamente."}` | 🔲 PENDIENTE |
| **TC-58** | Cualquier endpoint `/api/**` | GET/POST | Sin header `Authorization` | HTTP 403 — Acceso denegado por JwtAuthenticationFilter | 🔲 PENDIENTE |

---

## RESUMEN DE COBERTURA

| Módulo | Total Casos | Ejecutados | PASS | FAIL | Cobertura |
|---|---|---|---|---|---|
| 1. Autenticación | 7 | 0 | 0 | 0 | 🔲 0% |
| 2. Seguridad y Control de Acceso | 6 | 0 | 0 | 0 | 🔲 0% |
| 3. Panel Administrador | 7 | 0 | 0 | 0 | 🔲 0% |
| 4. Dashboard del Cliente | 8 | 0 | 0 | 0 | 🔲 0% |
| 5. Zona de Entrenamiento | 3 | 0 | 0 | 0 | 🔲 0% |
| 6. Selección y Armado de Rutinas | 9 | 0 | 0 | 0 | 🔲 0% |
| 7. Catálogo de Productos | 8 | 0 | 0 | 0 | 🔲 0% |
| 8. API REST (Postman) | 10 | 0 | 0 | 0 | 🔲 0% |
| **TOTAL** | **58** | **0** | **0** | **0** | **🔲 0%** |

---

## NOTAS Y OBSERVACIONES

| # | Observación |
|---|---|
| 1 | La asistencia del usuario se almacena en `localStorage` (cliente) y no en MongoDB. Ante un cambio de dispositivo o limpieza del navegador, se pierde el historial. |
| 2 | La selección de rutina en el modal del Dashboard es estática (hardcodeada con 4 opciones fijas). No refleja la rutina real asignada al socio. |
| 3 | La ruta `/nutricion` existe como enlace en la pantalla "Entrenar" pero no tiene componente ni ruta declarada en `app.routes.ts`. Generará error 404. |
| 4 | El control de acceso al Admin Dashboard se realiza únicamente en el frontend (decodificando el JWT en el cliente). El backend no verifica el rol en ningún endpoint. |
| 5 | El `AuthGuard` solo verifica la **existencia** del token en `localStorage`, no su validez ni expiración. Un token expirado aún da acceso a las rutas protegidas. |

---

## PRERREQUISITOS PARA EJECUTAR LAS PRUEBAS

1. **Backend:** Ejecutar `mvn spring-boot:run` desde `backend/backend/`
2. **Frontend:** Ejecutar `npm run dev` o `ng serve` desde `frontend/`
3. **Base de datos:** MongoDB corriendo en `localhost:27017` con la base `InfBD`
4. **Datos de prueba:** Debe existir al menos un usuario de tipo `cliente`, uno de tipo `administrador`, ejercicios en la colección `ejercicios`, plantillas en `plantillas_rutinas` y productos en la colección `catalogo`
5. **Herramienta API:** Postman, Insomnia o cURL para los casos TC-49 al TC-58
