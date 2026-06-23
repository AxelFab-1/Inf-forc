package com.infinityforce.backend.controller;

import com.infinityforce.backend.model.SesionEntrenamiento;
import com.infinityforce.backend.service.SesionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

/**
 * Controlador HTTP para las sesiones de entrenamiento.
 * Gestiona el guardado del progreso del socio y el cálculo de la secuencia de días.
 */
@RestController
@RequestMapping("/api")
public class SesionController {

    @Autowired
    private SesionService sesionService;

    /**
     * Guarda una sesión de entrenamiento completada.
     * El clienteId se extrae del JWT (Principal) para garantizar que el socio
     * solo pueda guardar sesiones en su propio nombre.
     */
    @PostMapping("/sesiones")
    public ResponseEntity<Map<String, Object>> guardarSesion(
            @RequestBody SesionEntrenamiento sesion,
            Principal principal) {

        Map<String, Object> respuesta = new HashMap<>();

        if (principal == null) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "No autorizado.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(respuesta);
        }

        // Forzar el clienteId desde el JWT, ignorando lo que venga en el body
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

    /**
     * Devuelve el historial de sesiones del socio autenticado.
     */
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

    /**
     * Calcula el índice del próximo día de entrenamiento para el socio autenticado.
     *
     * @param totalDias Número total de días en la rutina del socio (enviado por el frontend).
     */
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

    /**
     * Devuelve el detalle completo de una sesión de entrenamiento por su ID.
     * Usado por la pantalla de historial cuando el usuario hace clic en "Ver detalle".
     */
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
