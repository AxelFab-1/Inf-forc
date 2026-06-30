Actúa como un Arquitecto de Software Senior y experto en Java Spring Boot, MongoDB y Angular. 

Estamos a punto de modernizar la forma en que guardamos las sesiones de entrenamiento en el proyecto "Infinity Force". 
Vamos a implementar una arquitectura de "existencia dual" combinando el Patrón de Cubeta (Bucket Pattern) y Referencias Extendidas.

La idea es tener dos colecciones en MongoDB:
1. 'asistencias': Guardará un documento por mes/usuario (Bucket Pattern). Contendrá el año, mes y un arreglo de objetos con el 'dia' y el 'sesionId'.
2. 'sesiones_entrenamiento': Guardará los detalles pesados de la sesión (ejercicios, series, pesos, repeticiones) usando el 'sesionId'.

NOTA IMPORTANTE SOBRE EL FRONTEND: En este proyecto de Angular NO estamos usando Angular Services ni HttpClient. Todas las llamadas al backend se hacen mediante peticiones 'fetch' nativas de JavaScript directamente en los archivos .ts de los componentes.

Nuestra interfaz se dividirá en dos partes:
A. El Dashboard: Solo mostrará el mes actual pintado y un botón para "Ver historial completo".
B. Pantalla Historial: Un componente nuevo donde el usuario podrá navegar entre meses (con flechas), ver los días entrenados, seleccionar un día específico y usar botones de acción ("Ver detalle" y "Borrar Asistencia").

Antes de escribir código a ciegas, necesito que realices estas 4 tareas:

TAREA 1: ANÁLISIS DE IMPACTO Y LÓGICA OCULTA
Escanea mi espacio de trabajo actual. 
- Dime si hay alguna lógica, dependencia, o endpoint que se vaya a romper con este cambio. 
- Verifica si ya tenemos configurado el manejo de transacciones (@Transactional) en MongoDB para evitar escrituras huérfanas al guardar o borrar en ambas colecciones al mismo tiempo.

TAREA 2: GENERACIÓN DE MODELOS (SPRING BOOT)
Genérame el código Java exacto para las clases @Document de Spring Boot usando esta estructura JSON como referencia:
Colección 1 (asistencias): { "_id": "ast_user123_2026_06", "clienteId": "user123", "anio": 2026, "mes": 6, "registros": [ { "dia": 2, "sesionId": "ses_001" } ] }
Colección 2 (sesiones_entrenamiento): { "_id": "ses_003", "clienteId": "user123", "fecha": "2026-06-06T18:30:00Z", "rutinaNombre": "Día 2 - Lower Body", "duracionMinutos": 65, "ejercicios": [ { "ejercicioId": "ej_01", "nombre": "Hack Squat", "categoria": "Máquina", "series": [ { "numero": 1, "reps": 12, "pesoKg": 80, "completada": true } ] } ] }

TAREA 3: MODERNIZACIÓN DEL DASHBOARD (ANGULAR)
Genérame los fragmentos de código para `dashboard.ts` y `dashboard.html`:
- El `fetch` GET para traer la cubeta de asistencias solo del mes actual.
- La lógica del `[ngClass]` para pintar los días entrenados.
- El botón de redirección hacia la nueva pantalla de historial.

TAREA 4: LÓGICA DE LA NUEVA PANTALLA DE HISTORIAL (ANGULAR)
Dame la estructura base para el nuevo componente `historial-entrenamiento`:
- Funciones para navegar entre meses (cambiar el mes y hacer un nuevo `fetch` a la colección 'asistencias').
- La lógica de selección: Si el usuario hace clic en un día que tiene asistencia, ese día pasa a ser el "día seleccionado".
- Estado de los botones: El botón "Ver detalle" (y el de borrar) debe estar [disabled] por defecto. Solo se habilita si hay un "día seleccionado".
- Al presionar "Ver detalle", el sistema debe tomar el 'sesionId' del día seleccionado y hacer el `fetch` a la colección 'sesiones_entrenamiento' para extraer la información.