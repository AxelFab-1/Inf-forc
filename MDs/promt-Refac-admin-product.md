Actúa como un Arquitecto de Software Senior y experto en Angular, Spring Boot y CSS/Bootstrap.

Vamos a refactorizar el panel administrativo de "Infinity Force" para crear una arquitectura escalable. Actualmente, el componente 'admin-dashboard' tiene mezclada la lógica de crear usuarios y crear productos. Vamos a separar esto implementando el patrón "Master-Detail".

NOTAS IMPORTANTES SOBRE EL FRONTEND: 
1. En este proyecto de Angular NO usamos Angular Services ni HttpClient. Todas las llamadas al backend se hacen mediante peticiones 'fetch' nativas de JavaScript directamente en el archivo .ts.
2. Estructura de carpetas: Las pantallas (rutas) viven en `src/app/pages/` y los componentes reutilizables viven en `src/app/shared/`.

Por favor, genérame el código exacto y las instrucciones paso a paso cumpliendo estas 3 tareas:

TAREA 1: NAVEGACIÓN, RUTAS HIJAS Y GUARDS (LAYOUT ADMIN)
- Crea un componente `admin-header` exclusivo para el administrador y colócalo en la carpeta `shared/`.
- Este Header debe tener enlaces para navegar entre "Usuarios" e "Inventario".
- Escribe el código exacto de configuración para `app.routes.ts`. Implementa rutas hijas (children) para que las pantallas cambien dinámicamente debajo del `admin-header`. 
- Asegúrate de incluir en el código de las rutas la protección mediante el Guard de administrador para toda esta sección.

TAREA 2: PANTALLA INVENTARIO (NUEVO COMPONENTE EN 'pages' - MASTER-DETAIL CON TARJETAS)
- Crea el componente `inventario` dentro de `pages/` y MUEVE toda la lógica de productos que actualmente está en `admin-dashboard` hacia aquí.
- Aplica el patrón Master-Detail: Formulario CRUD en un panel lateral (Crear/Editar/Limpiar/Eliminar) y una zona "Master" ocupando el resto.
- Zona Master: Input de búsqueda y filtros por categoría arriba. Debajo, muestra los productos en una Cuadrícula de Tarjetas (Card Grid) con imagen, nombre, precio y estado.
- Lógica: Implementa los `fetch` para GET, POST (crear), PUT (editar nombre, categoría, precio, imagenUrl) y DELETE (con `confirm()` nativo).

TAREA 3: REFACTORIZACIÓN DE ADMIN-DASHBOARD (SOLO USUARIOS EN 'pages' - MASTER-DETAIL CON LISTA)
- Limpia el `admin-dashboard` (ubicado en `pages/`) eliminando todo rastro de los productos. Esta pantalla será EXCLUSIVA para Usuarios.
- Aplica el patrón Master-Detail: Panel lateral para el formulario y zona Master para la lista de usuarios.
- Zona Master: Muestra los usuarios en una Lista o Tabla moderna. Solo visualizar: Nombres, Apellidos, Código de Acceso y Estado de Membresía.
- Formulario Lateral (Crear): Mantén todos los inputs actuales (Nombres, Apellidos, DNI, Código de Acceso, Sede y Rol).
- Formulario Lateral (Editar): Al hacer clic en un usuario, pasa a modo edición. REGLA ESTRICTA: Solo se puede modificar "Nombres" y "Apellidos". Los campos de DNI, Código, Sede y Rol deben quedar bloqueados (`[disabled]="true"`).
- Lógica: Ajusta los `fetch` para GET, POST y agrega el PUT respetando las reglas de edición.