package com.infinityforce.backend.controller;

import com.infinityforce.backend.model.MensajeChatNutricion;
import com.infinityforce.backend.service.ChatNutricionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat-nutricion")
public class ChatNutricionController {

    @Autowired
    private ChatNutricionService chatNutricionService;

    @GetMapping("/historial")
    public ResponseEntity<Map<String, Object>> obtenerHistorial(Principal principal) {
        Map<String, Object> respuesta = new HashMap<>();

        if (principal == null) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "No autorizado.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(respuesta);
        }

        List<MensajeChatNutricion> historial = chatNutricionService.obtenerHistorial(principal.getName());

        respuesta.put("exito", true);
        respuesta.put("mensajes", historial);
        return ResponseEntity.ok(respuesta);
    }

    @PostMapping("/enviar")
    public ResponseEntity<Map<String, Object>> enviarMensaje(
            @RequestParam(value = "texto", required = false) String texto,
            @RequestParam(value = "imagen", required = false) MultipartFile imagen,
            Principal principal) {

        Map<String, Object> respuesta = new HashMap<>();

        if (principal == null) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "No autorizado.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(respuesta);
        }

        if ((texto == null || texto.isBlank()) && (imagen == null || imagen.isEmpty())) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "Debes enviar texto o una imagen.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(respuesta);
        }

        try {
            byte[] imagenBytes = null;
            String mimeType = null;

            if (imagen != null && !imagen.isEmpty()) {
                imagenBytes = imagen.getBytes();
                mimeType = imagen.getContentType();
            }

            MensajeChatNutricion respuestaIA = chatNutricionService.enviarMensaje(
                    principal.getName(), texto, imagenBytes, mimeType);

            respuesta.put("exito", true);
            respuesta.put("mensaje", respuestaIA);
            return ResponseEntity.ok(respuesta);

        } catch (IOException e) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "Error leyendo la imagen enviada.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(respuesta);

        } catch (Exception e) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "Error al procesar tu mensaje: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(respuesta);
        }
    }
}