package com.infinityforce.backend.controller;

import com.infinityforce.backend.model.SesionEntrenamiento;
import com.infinityforce.backend.service.SesionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class SesionController {

    @Autowired
    private SesionService sesionService;

    @PostMapping("/sesiones")
    public ResponseEntity<Map<String, Object>> guardarSesion(
            @Valid @RequestBody SesionEntrenamiento sesion,
            Principal principal) {

        Map<String, Object> respuesta = new HashMap<>();

        if (principal == null) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "No autorizado.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(respuesta);
        }

        sesion.setClienteId(principal.getName());

        try {
            SesionEntrenamiento guardada = sesionService.guardarSesion(sesion);
            respuesta.put("exito", true);
            respuesta.put("mensaje", "Sesión guardada correctamente.");
            respuesta.put("id", guardada.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
        } catch (Exception e) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "Error al guardar la sesión: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(respuesta);
        }
    }

    @GetMapping("/sesiones/mi-historial")
    public ResponseEntity<Map<String, Object>> getMiHistorial(Principal principal) {
        Map<String, Object> respuesta = new HashMap<>();

        if (principal == null) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "No autorizado.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(respuesta);
        }

        respuesta.put("exito", true);
        respuesta.put("datos", sesionService.obtenerHistorial(principal.getName()));
        return ResponseEntity.ok(respuesta);
    }

    @GetMapping("/sesiones/siguiente-dia")
    public ResponseEntity<Map<String, Object>> getSiguienteDia(
            @RequestParam int totalDias,
            Principal principal) {

        Map<String, Object> respuesta = new HashMap<>();

        if (principal == null) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "No autorizado.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(respuesta);
        }

        int indiceDia = sesionService.calcularIndiceDiaSiguiente(principal.getName(), totalDias);
        respuesta.put("exito", true);
        respuesta.put("indiceDia", indiceDia);
        return ResponseEntity.ok(respuesta);
    }

    @GetMapping("/sesiones/{id}")
    public ResponseEntity<Map<String, Object>> getSesionPorId(
            @PathVariable String id,
            Principal principal) {

        Map<String, Object> respuesta = new HashMap<>();

        if (principal == null) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "No autorizado.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(respuesta);
        }

        var sesion = sesionService.obtenerPorId(id);
        if (sesion == null) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "Sesión no encontrada.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(respuesta);
        }

        if (!sesion.getClienteId().equals(principal.getName())) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "No autorizado.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(respuesta);
        }

        respuesta.put("exito", true);
        respuesta.put("datos", sesion);
        return ResponseEntity.ok(respuesta);
    }
}
