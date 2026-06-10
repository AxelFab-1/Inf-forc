# Resumen de Implementación: Refactorización Panel Admin — Patrón Master-Detail

*Proyecto:* Infinity Force
*Módulo:* Panel Administrativo — Arquitectura Escalable
*Basado en:* `promt-Refac-admin-product.md`

---

## Objetivo
Separar el panel `admin-dashboard` (que mezclaba lógica de usuarios y productos) en componentes independientes, aplicando el patrón **Master-Detail** y una navegación por **rutas hijas de Angular**, dejando una arquitectura escalable.

---

## TAREA 1 — Navegación, Rutas Hijas y Guards

### Nuevo componente: `admin-header` (`shared/admin-header/`)
- Reemplaza la barra de navegación inline que había en `admin-dashboard.html`.
- Contiene el logo, el nombre del administrador logueado, dos botones de navegación (**Usuarios** e **Inventario**) y el botón **Salir**.
- Usa `routerLink` y `routerLinkActive` de Angular para que el botón de la sección activa se resalte automáticamente en amarillo.

### Nuevo componente contenedor: `admin-layout` (`pages/admin-layout/`)
- Componente "shell" que contiene el `<app-admin-header>` y un `<router-outlet>` donde se renderizan las vistas hijas.
- No tiene lógica propia; solo actúa como estructura de la sección admin.

### Rutas actualizadas (`app.routes.ts`)
| URL | Componente |
|---|---|
| `/admin` | Redirige a `/admin/usuarios` |
| `/admin/usuarios` | `AdminDashboard` (solo usuarios) |
| `/admin/inventario` | `Inventario` (nuevo) |

- Toda la sección `/admin` está protegida con `AuthGuard` y `expectedRole: 'administrador'`.
- La ruta vieja `/admin-dashboard` redirige automáticamente a `/admin/usuarios` para no romper bookmarks existentes.

### `AuthGuard` actualizado
- La redirección al loguearse como administrador ahora va a `/admin/usuarios` en lugar de `/admin-dashboard`.

---

## TAREA 2 — Nueva Pantalla Inventario (`pages/inventario/`)

Componente completamente nuevo que recibió **toda la lógica de productos** extraída de `admin-dashboard`.

### Patrón Master-Detail
- **Panel lateral (Detail):** Formulario de creación/edición en un panel fijo a la izquierda, con cambio dinámico de modo (`crear` / `editar`) al hacer clic en una tarjeta.
- **Zona Master:** Búsqueda por nombre + filtro por categoría en la parte superior. Resultados en una **cuadrícula de tarjetas** con imagen, nombre, precio, badge de categoría y botón de toggle de disponibilidad.

### Operaciones CRUD implementadas
| Operación | Endpoint | Descripción |
|---|---|---|
| GET | `/api/productos` | Carga inicial y recarga tras cambios |
| POST | `/api/productos` | Crear nuevo producto con validación frontend y backend |
| PUT | `/api/productos/{id}` | Editar nombre, categoría, precio e imagen |
| DELETE | `/api/productos/{id}` | Eliminar con `confirm()` nativo antes de ejecutar |
| PUT toggle | `/api/productos/{id}` | Cambiar disponibilidad (borrado lógico) |

### UX / Detalles de diseño
- Al hacer clic en una tarjeta, el panel lateral cambia a modo edición con los datos precargados.
- El botón de toggle (`Disponible` / `Agotado`) usa `stopPropagation()` para no activar el modo edición al hacer clic.
- Las tarjetas inactivas se muestran con opacidad reducida.
- La cuadrícula se adapta a cualquier ancho de pantalla con `auto-fill` en el grid.

---

## TAREA 3 — Refactorización de `admin-dashboard` (Solo Usuarios)

### Limpieza de código
- Se eliminó toda la lógica y UI de productos (`cargarProductos`, `crearProducto`, `actualizarProducto`, `toggleDisponibilidad`, variables `productos`, `nuevoProducto`, el sistema de tabs, la navbar inline, etc.).

### Patrón Master-Detail para Usuarios
- **Panel lateral (Detail):**
  - **Modo Crear:** Todos los campos: Nombres, Apellidos, DNI, Código de Acceso, Contraseña (sincronizada con DNI automáticamente), Sede y Rol.
  - **Modo Editar:** Se activa al hacer clic en un usuario de la tabla. **Regla estricta aplicada:** solo los campos `Nombres` y `Apellidos` son editables. Los campos DNI, Código de Acceso, Sede y Rol aparecen bloqueados con `[disabled]="true"` y marcados visualmente con un badge "Solo lectura".
- **Zona Master:** Tabla moderna con columnas: Nombres, Apellidos, Código de Acceso, Estado (badge verde/gris) y Rol (badge amarillo para admin). La fila del usuario seleccionado se resalta con borde dorado.

### Operaciones implementadas
| Operación | Endpoint | Descripción |
|---|---|---|
| GET | `/api/usuarios` | Carga la lista completa al iniciar |
| POST | `/api/usuarios` | Crear con validación frontend y respuesta del Spring Validator |
| PUT | `/api/usuarios/{id}` | Envía solo `nombres` y `apellidos` (los demás campos son ignorados) |
