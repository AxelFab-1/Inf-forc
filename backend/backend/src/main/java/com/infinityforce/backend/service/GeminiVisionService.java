package com.infinityforce.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.HashMap;
import java.util.List;
import java.util.Base64;
import java.util.Map;

@Service
public class GeminiVisionService {

        @Value("${google.gemini.api-key}")
        private String apiKey;

        @Value("${google.gemini.model}")
        private String model;

        private final WebClient webClient = WebClient.builder()
                        .baseUrl("https://generativelanguage.googleapis.com/v1beta")
                        .build();

        private static final String SCHEMA_PROMPT = """
                        Eres un nutricionista experto. Analiza la imagen de comida y responde
                        UNICAMENTE con un JSON valido (sin texto adicional, sin markdown, sin backticks)
                        con esta estructura exacta:
                        {
                          "alimentos": [
                            {"nombre": "string", "gramosEstimados": number, "calorias": number,
                             "proteinas": number, "carbohidratos": number, "grasas": number}
                          ],
                          "caloriasTotal": number,
                          "proteinasTotal": number,
                          "carbohidratosTotal": number,
                          "grasasTotal": number,
                          "notaConfianza": "string breve indicando si la estimacion es confiable o aproximada"
                        }
                        Si no identificas comida en la imagen, responde con alimentos vacio y explica en notaConfianza.
                        """;

        public JsonNode analizarImagen(byte[] imagenBytes, String mimeType) {
                String base64Imagen = Base64.getEncoder().encodeToString(imagenBytes);

                Map<String, Object> textPart = new HashMap<>();
                textPart.put("text", SCHEMA_PROMPT);

                Map<String, Object> inlineData = new HashMap<>();
                inlineData.put("mime_type", mimeType);
                inlineData.put("data", base64Imagen);

                Map<String, Object> imagePart = new HashMap<>();
                imagePart.put("inline_data", inlineData);

                Map<String, Object> content = new HashMap<>();
                content.put("parts", List.of(textPart, imagePart));

                Map<String, Object> generationConfig = new HashMap<>();
                generationConfig.put("response_mime_type", "application/json");

                Map<String, Object> body = new HashMap<>();
                body.put("contents", List.of(content));
                body.put("generationConfig", generationConfig);

                String response = webClient.post()
                                .uri("/models/{model}:generateContent?key={key}", model, apiKey)
                                .bodyValue(body)
                                .retrieve()
                                .bodyToMono(String.class)
                                .block();

                try {
                        ObjectMapper mapper = new ObjectMapper();
                        JsonNode root = mapper.readTree(response);
                        String jsonText = root.path("candidates").get(0)
                                        .path("content").path("parts").get(0)
                                        .path("text").asText();
                        return mapper.readTree(jsonText);
                } catch (Exception e) {
                        throw new RuntimeException("Error procesando respuesta de Gemini: " + e.getMessage(), e);
                }
        }
}