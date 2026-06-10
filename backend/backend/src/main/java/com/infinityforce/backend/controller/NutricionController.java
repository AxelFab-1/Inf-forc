package com.infinityforce.backend.controller;

import com.infinityforce.backend.service.NutricionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/nutricion")
@CrossOrigin(origins = "*")
public class NutricionController {

    @Autowired
    private NutricionService nutricionService;

    /**
     * GET /api/nutricion/perfil
     * Devuelve los datos biométricos del usuario autenticado.
     */
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

    /**
     * POST /api/nutricion/registrar
     * Primera vez: recibe todos los datos biométricos.
     * Actualización: recibe solo pesoKg, nivelActividad y objetivo.
     * En ambos casos calcula y hace push al historial.
     */
    @PostMapping("/registrar")
    public ResponseEntity<Map<String, Object>> registrarBiometrico(
            @RequestBody Map<String, Object> datos,
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
}
