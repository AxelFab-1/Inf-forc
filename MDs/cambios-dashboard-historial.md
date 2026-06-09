Actúa como un desarrollador Senior en Angular y Spring Boot.
El sistema de "existencia dual" para guardar asistencias y sesiones ya está funcionando perfectamente en el backend y el historial se muestra bien. Sin embargo, necesito aplicar unos ajustes de usabilidad en el frontend y arreglar un bug de zona horaria.

NOTA IMPORTANTE SOBRE EL FRONTEND: En este proyecto de Angular NO estamos usando Angular Services ni HttpClient. Todas las llamadas al backend se hacen mediante peticiones 'fetch' nativas de JavaScript directamente en los archivos .ts de los componentes.

Por favor, realiza estas 3 tareas en el código:

TAREA 1: LIMPIEZA DEL DASHBOARD (`dashboard.html` y `dashboard.ts`)
- Elimina cualquier rastro del botón, icono o función de "Borrar Asistencia" que exista en el componente del Dashboard.
- El ÚNICO botón de acción que debe existir debajo o junto al calendario del Dashboard es "Ver historial completo", el cual redirige a la pantalla `historial-entrenamiento`.
- Limpia el código TypeScript del Dashboard eliminando cualquier función de borrado que haya quedado huérfana.

TAREA 2: PROTECCIÓN DE BORRADO EN EL HISTORIAL (`historial-entrenamiento.html` y `historial-entrenamiento.ts`)
- Asegúrate de que el botón "Borrar Asistencia" viva EXCLUSIVAMENTE en esta pantalla y que siga la regla de estar deshabilitado hasta que se seleccione un día.
- Modifica la función de borrado para que NO ejecute la petición HTTP (fetch DELETE) inmediatamente al hacer clic.
- Implementa un paso de confirmación obligatorio usando el `confirm()` nativo de JavaScript con el mensaje: "¿Estás seguro de que deseas eliminar esta sesión de entrenamiento? Esta acción borrará tu progreso y no se puede deshacer."

TAREA 3: CORRECCIÓN DEL BUG DE ZONA HORARIA (UTC vs UTC-5)
Tenemos un bug crítico: si el usuario guarda una sesión en la noche (ej. 6 de junio a las 9 PM hora local), la base de datos o el frontend lo está registrando como el 7 de junio debido al desfase horario con UTC. 
- Revisa el controlador/servicio de Spring Boot que crea el registro en la colección 'asistencias' y asegúrate de que extraiga el 'día' forzando la zona horaria a "America/Lima" (UTC-5) al procesar la fecha.
- Revisa cómo se envía la fecha desde el `fetch` en Angular al crear la sesión, asegurándote de que no se envíe desfasada. Genérame los ajustes necesarios en Java y/o TypeScript para que siempre se respete la hora local de Perú.