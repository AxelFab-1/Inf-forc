# Registro de Cambios: Implementación de Spring Validator y Módulo de Inventario

*Proyecto:* Infinity Force
*Módulo:* Seguridad, Validación de Datos y Gestión de Catálogo

## 1. Implementación de Spring Validator (Backend)
Se ha configurado la validación de datos en la capa de servidor mediante Jakarta Bean Validation para garantizar que la base de datos (MongoDB) solo reciba información consistente y segura.

### 1.1 Archivos de Modelos y DTOs Modificados (Definición de Reglas)
*   model/Usuario.java:
    *   Implementación de @Pattern en nombres y apellidos para restringir el ingreso a solo letras y espacios.
    *   Implementación de @Size(min=8, max=8) y @Pattern para asegurar el formato estricto del DNI.
*   model/Producto.java:
    *   Implementación de @NotBlank para garantizar que el nombre y la categoria no ingresen vacíos.
    *   Implementación de @Min(value = 0) en precio y stock para evitar valores negativos que corrompan el inventario.
*   dto/PasswordChangeDTO.java:
    *   Creación de este DTO exclusivo para aplicar la regla de seguridad @Size(min = 8) en la nueva contraseña.

### 1.2 Archivos de Controladores Modificados (Ejecución y Captura)
*   controller/UsuarioController.java:
    *   Modificación del método registrarUsuario inyectando @Valid y BindingResult.
    *   Modificación del método cambiarPassword con validación sobre el DTO.
    *   *Comportamiento:* Si la validación falla, el controlador interrumpe el flujo y retorna un código HTTP 400 Bad Request con el mensaje de error definido en el modelo.
*   controller/ProductoController.java:
    *   Modificación de los métodos crearProducto y actualizarProducto inyectando @Valid y BindingResult para retornar errores 400 Bad Request ante inconsistencias en el inventario.

---

## 2. Gestión de Respuestas de Validación (Frontend)
El cliente (Angular) ha sido actualizado para no realizar validaciones profundas de negocio, sino para *gestionar, interpretar y renderizar* las respuestas de error provenientes del Spring Validator en el Backend.

### 2.1 Módulo Admin Dashboard (Usuarios y Productos)
*   admin-dashboard.ts:
    *   *Captura de Errores (Fetch API):* Se actualizó la lógica en registrarUsuario() y crearProducto(). En el bloque .then(), se interceptan las respuestas donde !response.ok (específicamente errores 400).
    *   *Mapeo de Datos:* Se extrae el mensaje exacto enviado por el Spring Validator (errData.mensaje) y se asigna a la variable local this.alerta.
*   admin-dashboard.html:
    *   *UX (Validación HTML5):* Se añadieron atributos pattern, required y min en los formularios como primera capa visual.
    *   *Renderizado Dinámico:* Se incorporaron contenedores de alertas de Bootstrap (<div *ngIf="alerta">) que muestran en pantalla el texto de error devuelto por el servidor, brindando feedback inmediato al administrador.

### 2.2 Módulo Header (Cambio de Contraseña)
*   header.ts y header.html:
    *   Implementación de la misma arquitectura de captura de errores para la actualización de credenciales. Se atrapa el fallo de longitud mínima (menor a 8 caracteres) desde el DTO del backend y se renderiza en el modal interactivo del usuario.

---

## 3. Creación y Gestión de Inventario (Admin Dashboard)
Se implementó un flujo completo (CRUD) para la administración del catálogo de productos desde la vista del administrador, respetando la validación en capas.

### 3.1 Funcionalidades Desarrolladas en admin-dashboard.ts
*   *Creación de Productos (crearProducto):* Toma los datos del objeto vinculante (nuevoProducto), los envía por POST a /api/productos con el token de seguridad correspondiente, y limpia el formulario tras un registro exitoso.
*   *Listado en Tiempo Real (cargarProductos):* Función de inicialización que consume el endpoint GET para desplegar el catálogo actual en la interfaz.
*   *Actualización y Borrado Lógico (toggleDisponibilidad):* En lugar de aplicar un borrado físico, se modifica la propiedad booleana activo. Esto actualiza el estado mediante una petición PUT a /api/productos/{id}, manteniendo el registro histórico en MongoDB pero ocultándolo o deshabilitándolo lógicamente en la plataforma.

### 3.2 Interfaz de Inventario en admin-dashboard.html
*   *Formulario de Alta:* Se diseñó una interfaz tipo tarjeta que incluye inputs para nombre, selector de categorías predefinidas, precio y carga de URL para la imagen del producto.
*   *Grilla de Gestión:* Se implementó un diseño tipo lista/grid donde cada tarjeta de producto permite la edición directa del precio y cuenta con un botón interactivo (Disponible/Agotado) que dispara el borrado lógico.
