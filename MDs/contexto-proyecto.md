Contexto del Proyecto: Infinity Force (Gym App)

Stack Tecnológico Actual:

Frontend: Angular.

Backend: Java con Spring Boot.

Base de Datos: MongoDB.

Modelo de Datos Principal (Colecciones en MongoDB):

usuarios: Almacena clientes y administradores con su DNI, código de acceso, contraseña, rol, estado de membresía y asistencias.

ejercicios: Catálogo maestro de ejercicios con campos como nombre, grupoMuscular, subGrupo, tipo (Compuesto/Aislado), categoría (Máquina/Peso libre), series y repeticiones por defecto.

plantillas_rutinas: Modelos predefinidos (ej. Upper/Lower) o plantillas vacías para rutinas personalizadas. Contienen arreglos de "días" que referencian los IDs de los ejercicios.

rutinas_socios: Las rutinas asignadas específicamente a cada usuario, vinculadas por su clienteId.

Estado Actual del Desarrollo:

Se cuenta con interfaces para el Dashboard, Entrenar (Selección de Rutinas y Nutrición), Catálogo y Comunidad.

Seguridad: JWT (JSON Web Tokens) ya está implementado para la autenticación y protección de rutas.

Flujo existente para que el cliente elija rutinas predeterminadas o arme personalizadas agregando ejercicios desde el catálogo mediante un modal.

Deuda Técnica Identificada: El backend sufre del antipatrón "Fat Controller" (Controlador Gordo). La lógica de negocio está dentro de los controladores (ej. UsuarioController) y faltan las capas de Servicio (@Service).

Nuevos Requerimientos a Implementar:

Filtros en el modal del catálogo de ejercicios (por músculo, tipo, categoría).

Soporte multimedia (URLs de imágenes/videos) para los ejercicios.

Desglose visual de los ejercicios al seleccionar una rutina predeterminada.

Secuencia de entrenamiento (rastrear qué día le toca hacer al usuario según su historial).

Monitoreo en vivo (tracking de series, repeticiones y pesos) durante la sesión de entrenamiento.