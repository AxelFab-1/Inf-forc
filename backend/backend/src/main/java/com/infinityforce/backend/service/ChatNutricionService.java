package com.infinityforce.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.infinityforce.backend.model.MensajeChatNutricion;
import com.infinityforce.backend.model.SesionEntrenamiento;
import com.infinityforce.backend.model.Usuario;
import com.infinityforce.backend.repository.MensajeChatNutricionRepository;
import com.infinityforce.backend.repository.SesionRepository;
import com.infinityforce.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class ChatNutricionService {

    private final UsuarioRepository usuarioRepository;
    private final SesionRepository sesionRepository;
    private final MensajeChatNutricionRepository mensajeRepository;

    @Value("${google.gemini.api-key}")
    private String apiKey;

    @Value("${google.gemini.model}")
    private String model;

    private final WebClient webClient = WebClient.builder()
            .baseUrl("https://generativelanguage.googleapis.com/v1beta")
            .build();

    public ChatNutricionService(UsuarioRepository usuarioRepository,
            SesionRepository sesionRepository,
            MensajeChatNutricionRepository mensajeRepository) {
        this.usuarioRepository = usuarioRepository;
        this.sesionRepository = sesionRepository;
        this.mensajeRepository = mensajeRepository;
    }

    public List<MensajeChatNutricion> obtenerHistorial(String clienteId) {
        return mensajeRepository.findByClienteIdOrderByFechaAsc(clienteId);
    }

    public MensajeChatNutricion enviarMensaje(String clienteId, String textoUsuario,
            byte[] imagenBytes, String mimeType) {

        // 1. Guardar el mensaje del usuario
        String contenidoGuardado = textoUsuario != null ? textoUsuario : "";
        MensajeChatNutricion mensajeUsuario = new MensajeChatNutricion(
                clienteId, "usuario", contenidoGuardado, imagenBytes != null);
        mensajeRepository.save(mensajeUsuario);

        // 2. Armar el contexto (perfil + entrenamientos)
        String contextoPerfil = construirContextoPerfil(clienteId);
        String contextoEntrenamientos = construirContextoEntrenamientos(clienteId);

        // 3. Traer los últimos mensajes para historial conversacional
        List<MensajeChatNutricion> ultimosMensajes = mensajeRepository.findTop20ByClienteIdOrderByFechaDesc(clienteId);
        Collections.reverse(ultimosMensajes); // orden cronológico

        // 4. Armar la petición a Gemini
        List<Map<String, Object>> contents = new ArrayList<>();

        // Mensaje de sistema con el contexto (como primer "turno" del usuario)
        Map<String, Object> systemPart = new HashMap<>();
        systemPart.put("text", construirPromptSistema(contextoPerfil, contextoEntrenamientos));
        Map<String, Object> systemContent = new HashMap<>();
        systemContent.put("role", "user");
        systemContent.put("parts", List.of(systemPart));
        contents.add(systemContent);

        Map<String, Object> systemAckPart = new HashMap<>();
        systemAckPart.put("text", "Entendido, tengo el contexto de tu perfil y entrenamientos. ¿En qué te ayudo?");
        Map<String, Object> systemAckContent = new HashMap<>();
        systemAckContent.put("role", "model");
        systemAckContent.put("parts", List.of(systemAckPart));
        contents.add(systemAckContent);

        // Historial de conversación previo
        for (MensajeChatNutricion m : ultimosMensajes) {
            Map<String, Object> part = new HashMap<>();
            part.put("text", m.getContenido());
            Map<String, Object> content = new HashMap<>();
            content.put("role", m.getRol().equals("usuario") ? "user" : "model");
            content.put("parts", List.of(part));
            contents.add(content);
        }

        // Mensaje actual (con imagen si aplica)
        List<Map<String, Object>> partesActuales = new ArrayList<>();
        Map<String, Object> textoPart = new HashMap<>();
        textoPart.put("text", textoUsuario != null && !textoUsuario.isBlank()
                ? textoUsuario
                : "Analiza esta imagen de mi comida y dame los macros estimados.");
        partesActuales.add(textoPart);

        if (imagenBytes != null) {
            Map<String, Object> inlineData = new HashMap<>();
            inlineData.put("mime_type", mimeType);
            inlineData.put("data", Base64.getEncoder().encodeToString(imagenBytes));
            Map<String, Object> imagePart = new HashMap<>();
            imagePart.put("inline_data", inlineData);
            partesActuales.add(imagePart);
        }

        Map<String, Object> mensajeActual = new HashMap<>();
        mensajeActual.put("role", "user");
        mensajeActual.put("parts", partesActuales);
        contents.add(mensajeActual);

        Map<String, Object> body = new HashMap<>();
        body.put("contents", contents);

        // 5. Llamar a Gemini
        String response = webClient.post()
                .uri("/models/{model}:generateContent?key={key}", model, apiKey)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        String textoRespuesta;
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response);
            textoRespuesta = root.path("candidates").get(0)
                    .path("content").path("parts").get(0)
                    .path("text").asText();
        } catch (Exception e) {
            textoRespuesta = "Hubo un problema procesando la respuesta. Intenta de nuevo.";
        }

        // 6. Guardar y devolver la respuesta de la IA
        MensajeChatNutricion mensajeIA = new MensajeChatNutricion(
                clienteId, "modelo", textoRespuesta, false);
        return mensajeRepository.save(mensajeIA);
    }

    private String construirPromptSistema(String contextoPerfil, String contextoEntrenamientos) {
        return """
                Eres un asistente experto en fitness y nutrición dentro de una app de gimnasio.
                Tu enfoque es EXCLUSIVAMENTE nutrición, alimentación y progreso físico del usuario.
                Si te preguntan algo fuera de ese tema, redirige amablemente la conversación.

                IMPORTANTE - FORMATO DE RESPUESTA:
                Este chat NO interpreta Markdown, así que tu respuesta debe ser texto plano,
                como si estuvieras escribiendo por WhatsApp. Reglas estrictas:
                - NUNCA uses asteriscos (**texto**) para negritas
                - NUNCA uses símbolos # para títulos
                - NUNCA uses guiones o viñetas con formato Markdown (usa emojis simples
                  como 👉 o números seguidos de punto si necesitas listar algo)
                - NUNCA uses líneas separadoras como --- o ***
                - Escribe en párrafos cortos y naturales, como una conversación real
                - Si necesitas resaltar algo importante, hazlo con mayúsculas puntuales
                  o simplemente con la redacción, no con símbolos

                Aquí está el contexto actual del usuario:

                === PERFIL BIOMÉTRICO ===
                %s

                === ENTRENAMIENTOS RECIENTES ===
                %s

                Usa esta información para dar recomendaciones personalizadas y concretas.
                Si el usuario sube una foto de comida, identifica los alimentos y estima
                macros (calorías, proteínas, carbohidratos, grasas) de forma clara.
                Si la imagen no es clara, pídele que te describa qué contiene el plato.
                Sé conciso, cercano y motivador, como un entrenador personal that habla
                de forma natural, sin usar formato de documento.
                """.formatted(contextoPerfil, contextoEntrenamientos);
    }

    private String construirContextoPerfil(String clienteId) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findById(clienteId);
        if (usuarioOpt.isEmpty() || usuarioOpt.get().getHistorialBiometrico().isEmpty()) {
            return "El usuario aún no tiene un perfil biométrico registrado.";
        }

        Usuario usuario = usuarioOpt.get();
        Usuario.RegistroBiometrico ultimo = usuario.getHistorialBiometrico()
                .get(usuario.getHistorialBiometrico().size() - 1);

        return String.format("""
                Nombre: %s
                Peso actual: %.1f kg
                Estatura: %.0f cm
                IMC: %.1f
                Objetivo: %s
                Nivel de actividad: %s
                Calorías recomendadas: %.0f kcal/día
                Proteínas: %.0fg | Carbohidratos: %.0fg | Grasas: %.0fg
                """,
                usuario.getNombres(),
                ultimo.getPesoKg(),
                usuario.getEstaturaCm(),
                ultimo.getImcCalculado(),
                ultimo.getObjetivo(),
                ultimo.getNivelActividad(),
                ultimo.getCaloriasRecomendadas(),
                ultimo.getProteinasG(),
                ultimo.getCarbohidratosG(),
                ultimo.getGrasasG());
    }

    private String construirContextoEntrenamientos(String clienteId) {
        List<SesionEntrenamiento> sesiones = sesionRepository.findByClienteIdOrderByFechaDesc(clienteId);

        if (sesiones.isEmpty()) {
            return "El usuario aún no tiene entrenamientos registrados.";
        }

        StringBuilder sb = new StringBuilder();
        int limite = Math.min(sesiones.size(), 5);

        for (int i = 0; i < limite; i++) {
            SesionEntrenamiento s = sesiones.get(i);
            sb.append(String.format("- %s (%s): ", s.getFecha(), s.getNombreDia()));

            List<String> ejerciciosResumen = new ArrayList<>();
            for (SesionEntrenamiento.EjercicioRealizado ej : s.getEjerciciosRealizados()) {
                if (ej.getSeries() != null && !ej.getSeries().isEmpty()) {
                    SesionEntrenamiento.SerieRealizada ultimaSerie = ej.getSeries().get(ej.getSeries().size() - 1);
                    ejerciciosResumen.add(String.format("%s (%s kg x %s reps)",
                            ej.getNombre(),
                            ultimaSerie.getPesoKg() != null ? ultimaSerie.getPesoKg() : "peso corporal",
                            ultimaSerie.getRepeticiones()));
                }
            }
            sb.append(String.join(", ", ejerciciosResumen));
            sb.append("\n");
        }

        return sb.toString();
    }
}