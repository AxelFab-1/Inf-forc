1. Validaciones Síncronas en el Frontend (Angular Reactive Forms)
Aseguramos la integridad de los datos desde el navegador antes de que siquiera toquen la red.

Archivos clave: usuarios.ts, inventario.ts, nutricion.ts, login.ts y sesion-entrenamiento.ts.

La lógica implementada: Utilizamos FormGroup y FormBuilder de Angular. A cada campo crítico le aplicamos reglas estrictas de la clase Validators (ej. Validators.required, Validators.pattern('^[0-9]+$') para el DNI y código, limites de min y max en pesos y repeticiones).

La explicación técnica: Esta es la "Defensa en Primera Línea". Cuando el usuario intenta enviar un formulario incompleto o mal tipeado, ejecutamos un this.formulario.markAllAsTouched(). Esto frena la petición HTTP en seco y le avisa al usuario visualmente qué campos están mal. El beneficio: Le ahorramos ancho de banda y procesamiento innecesario a nuestro servidor en Spring Boot.

2. Refactorización en Spring Boot (Backend Centralizado)
Limpiamos la capa de controladores para aplicar un manejo de excepciones global y profesional.

Archivos modificados: UsuarioController.java y ProductoController.java.

El cambio exacto: Eliminamos el parámetro BindingResult result y todos los bloques if (result.hasErrors()) de los métodos POST y PUT (como registrarUsuario, crearProducto, etc.).

La explicación técnica (Defensa en Segunda Línea): Si alguien intenta saltarse el frontend (ej. usando Postman), Spring Boot frena los datos inválidos gracias a la anotación @Valid. Al quitar el BindingResult, Spring lanza automáticamente una excepción. Nuestro componente @RestControllerAdvice (el GlobalExceptionHandler) atrapa esa excepción "en el aire" y devuelve un JSON estandarizado con el mensaje exacto del error. Esto dejó los controladores limpios y sin código duplicado (DRY - Don't Repeat Yourself).

3. Conexión de Errores Asíncronos (Angular consume al Backend)
Conectamos la capa de servicios de Angular para que "escuche" los errores JSON de Spring Boot cuando el frontend no puede prever el fallo.

El cambio general: Modificamos los bloques error: (err) => { ... } dentro de los métodos subscribe() de las peticiones HTTP.

Archivos modificados: * login.ts: Ya no hay mensajes "quemados"; lee si la contraseña o el usuario falló directamente del backend (err.error?.mensaje).

armar-rutina.ts y rutinas.ts: Reemplazamos los errores silenciosos o de consola por alerts que extraen el mensaje limpio del servidor.

historial-entrenamiento.ts: Rellenamos el bloque de error vacío para que el sistema avise si el backend rechaza borrar una asistencia.

Corrección de BUG Crítico (sesion-entrenamiento.ts): En el método guardarYSalir(), si el servidor fallaba, el código forzaba un router.navigate(['/dashboard']). Lo corregimos quitando la redirección; ahora lanza un alert con el motivo exacto y mantiene al usuario en la pantalla para que no pierda su progreso de entrenamiento.

4. Limpieza de Repositorios (Spring Boot)
Reglas de Clean Code básicas.

Archivos modificados: AsistenciaRepository.java y RutinaSocioRepository.java.

La lógica: Borramos los comentarios JavaDoc vacíos (/ @param ... */) en Asistencias, y eliminamos la anotación @Repository redundante en Rutinas (Spring ya deduce que es un repositorio porque hereda de MongoRepository).