package com.infinityforce.backend.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.infinityforce.backend.dto.NutricionRequestDTO;
import com.infinityforce.backend.service.GeminiVisionService;
import com.infinityforce.backend.service.NutricionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/nutricion")
public class NutricionController {

    @Autowired
    private NutricionService nutricionService;

    @Autowired
    private GeminiVisionService geminiVisionService;

    @GetMapping("/perfil")
    public ResponseEntity<Map<String, Object>> obtenerPerfil(Principal principal) {
        Map<String, Object> respuesta = new HashMap<>();

        if (principal == null) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "No autorizado.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(respuesta);
        }

        respuesta = nutricionService.obtenerPerfil(principal.getName());
        return ResponseEntity.ok(respuesta);
    }

    @PostMapping("/registrar")
    public ResponseEntity<Map<String, Object>> registrarBiometrico(
            @Valid @RequestBody NutricionRequestDTO datos,
            Principal principal) {

        Map<String, Object> respuesta = new HashMap<>();

        if (principal == null) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "No autorizado.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(respuesta);
        }

        respuesta = nutricionService.registrarBiometrico(principal.getName(), datos);

        if (Boolean.TRUE.equals(respuesta.get("exito"))) {
            return ResponseEntity.ok(respuesta);
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(respuesta);
    }

    @PostMapping("/analizar-imagen")
    public ResponseEntity<Map<String, Object>> analizarImagen(
            @RequestParam("imagen") MultipartFile imagen,
            Principal principal) {

        Map<String, Object> respuesta = new HashMap<>();

        if (principal == null) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "No autorizado.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(respuesta);
        }

        if (imagen.isEmpty()) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "No se recibió ninguna imagen.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(respuesta);
        }

        try {
            JsonNode resultado = geminiVisionService.analizarImagen(
                    imagen.getBytes(), imagen.getContentType());

            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> datosAnalisis = mapper.convertValue(resultado, Map.class);

            respuesta.put("exito", true);
            respuesta.put("datos", datosAnalisis);
            return ResponseEntity.ok(respuesta);

        } catch (IOException e) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "Error leyendo la imagen enviada.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(respuesta);

        } catch (Exception e) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "Error al analizar la imagen: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(respuesta);
        }
    }
}