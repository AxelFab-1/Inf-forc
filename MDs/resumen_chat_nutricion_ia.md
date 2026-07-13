# 🥗 Resumen: Chat de Nutrición con IA — Infinity Force

> Documentación de todo lo implementado para la funcionalidad de asistente de nutrición con IA (Google Gemini).

---

## 🎯 ¿Qué hace esta funcionalidad?

Un chat flotante dentro de la sección de Nutrición donde el usuario puede:
- Escribir mensajes y preguntar sobre su alimentación o progreso
- Subir o tomar una foto de su comida para que la IA estime los macronutrientes (calorías, proteínas, carbohidratos, grasas)
- Recibir respuestas personalizadas, porque la IA conoce automáticamente el perfil biométrico del usuario y sus últimos entrenamientos
- El historial de la conversación queda guardado en MongoDB, así que persiste aunque se cierre la app o pase el tiempo

---

## 🔑 Requisito externo: Google AI Studio

- Se generó una API Key gratuita en [aistudio.google.com](https://aistudio.google.com/apikey)
- El modelo usado es **`gemini-flash-latest`** (un alias que Google mantiene siempre apuntando a la versión estable más reciente de Gemini Flash, evitando que se rompa cuando descontinúen versiones específicas)
- Nota: se probaron antes `gemini-2.0-flash` y `gemini-2.5-flash`, pero ambos ya fueron descontinuados por Google para cuentas nuevas (error 404). `gemini-flash-latest` es la opción recomendada a futuro por la misma razón.

---

## 🏗️ Backend (Spring Boot)

### Archivos nuevos creados

| Archivo | Ubicación | Para qué sirve |
|---|---|---|
| `MensajeChatNutricion.java` | `model/` | Define la estructura de cada mensaje del chat. Se guarda en la colección MongoDB **`chat_nutricion`**. Campos: `id`, `clienteId`, `rol` ("usuario" o "modelo"), `contenido`, `tuvoImagen` (boolean), `fecha` |
| `MensajeChatNutricionRepository.java` | `repository/` | Dos métodos: `findByClienteIdOrderByFechaAsc` (historial completo para mostrar en pantalla) y `findTop20ByClienteIdOrderByFechaDesc` (últimos 20 en orden inverso para armar contexto de la IA) |
| `ChatNutricionService.java` | `service/` | **El corazón de la funcionalidad.** Arma el contexto (perfil biométrico + últimos 5 entrenamientos + últimos 20 mensajes), construye la petición multi-turno a Gemini (con o sin imagen), guarda tanto el mensaje del usuario como la respuesta de la IA en Mongo |
| `ChatNutricionController.java` | `controller/` | Expone los endpoints al frontend: `GET /api/chat-nutricion/historial` (trae la conversación completa) y `POST /api/chat-nutricion/enviar` (recibe `texto` y/o `imagen` como `multipart/form-data`) |
| `GeminiVisionService.java` | `service/` | **Sigue activo y en uso.** Lo usa `NutricionController` en el endpoint `/api/nutricion/analizar-imagen` para análisis de imagen standalone (fuera del chat). Devuelve un `JsonNode` con estructura JSON de macros |
| `AnalisisNutricionalDTO.java` | `dto/` | Estructura de datos para la respuesta del análisis de imagen standalone (endpoint `/api/nutricion/analizar-imagen`) |

### Archivos modificados

| Archivo | Qué se modificó |
|---|---|
| `NutricionController.java` | Se inyectó `GeminiVisionService` y se agregó el endpoint `POST /api/nutricion/analizar-imagen` que recibe una imagen como `MultipartFile`, la pasa a `GeminiVisionService` y devuelve los macros en JSON |

### Configuración agregada

En `application.properties` (base — se carga en todos los perfiles, incluyendo local y prod):
```properties
google.gemini.api-key=<API_KEY_REAL_HARDCODEADA>
google.gemini.model=gemini-flash-latest
```

⚠️ **Pendiente para producción**: la API key quedó directamente en `application.properties` (el archivo base que se carga SIEMPRE), no solo en el perfil local. Esto significa que está activa también en producción con Railway. Antes del despliegue definitivo, moverla a variable de entorno real (`${GEMINI_API_KEY}`) en Railway.

### Dependencia agregada al `pom.xml`

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webflux</artifactId>
</dependency>
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
</dependency>
```
`webflux` permite usar `WebClient` para llamar a la API de Gemini. `jackson-databind` (aunque ya venía indirectamente por otra librería) se agregó explícitamente porque el compilador la necesitaba en modo "compile", no solo "runtime".

---

## 💻 Frontend (Angular)

### Archivos modificados

| Archivo | Ubicación | Qué se le agregó |
|---|---|---|
| `nutricion.ts` (servicio) | `services/` | Métodos `getHistorialChat()` y `enviarMensajeChat(texto, archivo)` que llaman a los endpoints nuevos del backend. También se importa `obtenerCabecerasArchivo` para el envío de FormData |
| `nutricion.ts` (componente) | `pages/nutricion/` | El componente ahora implementa `AfterViewChecked` (además de `OnInit`) para el scroll automático. Nuevas propiedades: `mensajes[]`, `textoInput`, `enviandoMensaje`, `archivoSeleccionado`, `previewImagenSeleccionada`, `cargandoHistorial`, `mostrarChat`. Nuevos métodos: `cargarHistorialChat()`, `enviarMensaje()`, `onImagenSeleccionada()`, `quitarImagenSeleccionada()`, `toggleChat()`, `onEnterInput()`, `scrollAlFinal()`. Se usa `@ViewChild('chatScroll')` para el scroll |
| `nutricion.html` | `pages/nutricion/` | Se agregó el botón flotante (`chat-fab`) y el panel deslizante del chat (`chat-overlay` / `chat-panel`), con burbujas de mensaje diferenciadas por color según quién habla |
| `nutricion.css` | `pages/nutricion/` | Estilos del chat (burbujas, indicador de "escribiendo...", input con botón de cámara) + estilos responsive para que la página se vea bien en celular |
| `auth-headers.ts` | `shared/utils/` | Se agregó `obtenerCabecerasArchivo()`, una variante que **no fuerza** `Content-Type: application/json`, necesaria para poder subir imágenes (FormData) sin romper el envío |

### Cómo funciona el flujo visual

1. El usuario ve un botón circular dorado flotando abajo a la derecha en toda la sección de Nutrición
2. Al tocarlo, se despliega un panel de chat (a pantalla completa en celular, como ventana flotante en escritorio)
3. Puede escribir texto y/o adjuntar una foto (con el ícono de cámara, que en celular abre la cámara directamente)
4. Al seleccionar una imagen, se muestra una **preview** de la foto antes de enviar (con botón para quitarla)
5. El mensaje del usuario aparece en pantalla **inmediatamente** (UI optimista) sin esperar la respuesta del backend
6. Mientras la IA responde, se ve un indicador de "escribiendo..." (3 puntitos animados)
7. El chat acepta **Enter** para enviar (Shift+Enter no envía, para permitir saltos de línea)
8. El scroll baja automáticamente al último mensaje cada vez que llega uno nuevo (`AfterViewChecked`)
9. La conversación se guarda automáticamente en MongoDB; si recarga la página, el historial sigue ahí

---

## 🧠 Cómo la IA "conoce" al usuario

Cada vez que se envía un mensaje, el backend arma automáticamente (sin que el usuario tenga que escribirlo) un contexto con:

**Perfil biométrico** (desde `Usuario.historialBiometrico`):
- Nombre, peso, estatura, IMC, objetivo (Volumen/Definición/Mantenimiento), nivel de actividad, calorías y macros recomendados

**Entrenamientos recientes** (desde `SesionEntrenamiento`, últimas 5 sesiones):
- Fecha, nombre del día, ejercicios realizados con el peso y repeticiones de la **última serie** de cada ejercicio

Este contexto se inyecta como un **turno ficticio usuario/modelo** al inicio del array `contents` que se manda a Gemini (la IA responde "Entendido, tengo el contexto..."), y luego se agrega el historial real de la conversación. Esto respeta el formato multi-turno de la API de Gemini sin usar `system_instruction` (que no está disponible en todos los modelos del tier gratuito).

**Instrucciones de formato al modelo**: el prompt de sistema le indica explícitamente a Gemini que **no use Markdown** (sin asteriscos, sin `#`, sin `---`), ya que el frontend muestra el texto plano sin renderizador de Markdown. El modelo debe responder como si escribiera por WhatsApp.

---

## ⚠️ Pendientes / cosas a tener en cuenta como equipo

1. **Seguridad de credenciales**: la API key de Gemini, la contraseña de MongoDB Atlas, y el secreto JWT siguen hardcodeados en archivos `.properties` que están siendo trackeados por Git. Antes de que el proyecto crezca más, conviene:
   - Rotar la contraseña de Atlas y el secreto JWT
   - Mover todo a variables de entorno (`${VARIABLE}`) y configurarlas como secrets en Railway
   - Agregar los `.properties` con credenciales reales al `.gitignore`

2. **Velocidad de respuesta**: el chat tarda unos segundos en responder porque manda bastante contexto (perfil + entrenamientos + hasta 20 mensajes de historial) y el modelo `gemini-flash-latest` tiene razonamiento interno activado. Si en el futuro se vuelve muy lento, hay dos ajustes posibles sin rehacer nada: cambiar a `gemini-flash-lite-latest` (más rápido) o reducir cuántos mensajes de historial se mandan como contexto.

3. **Límites del tier gratuito**: Gemini gratis tiene límites de peticiones por minuto/día. Si el chat se usa mucho (varios compañeros probando a la vez), es posible toparse con el error 429 (Too Many Requests). No es un bug, es esperado en el tier gratuito.

4. **Costo si escala**: todo esto funciona gratis para desarrollo/demo universitaria. Si el proyecto se usara con usuarios reales de forma constante, valdría la pena revisar el pricing de pago de Gemini.
