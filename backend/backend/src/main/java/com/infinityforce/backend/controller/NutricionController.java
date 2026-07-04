package com.infinityforce.backend.controller;

import com.infinityforce.backend.dto.NutricionRequestDTO;
import com.infinityforce.backend.service.NutricionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/nutricion")
public class NutricionController {

    @Autowired
    private NutricionService nutricionService;

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
}