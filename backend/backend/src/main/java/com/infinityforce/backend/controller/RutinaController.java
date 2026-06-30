package com.infinityforce.backend.controller;

import com.infinityforce.backend.model.RutinaSocio;
import com.infinityforce.backend.service.RutinaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Controlador HTTP para el recurso de Rutinas (plantillas y rutinas de socios).
 * Responsabilidad única: despachar peticiones HTTP y delegar a RutinaService.
 */
@RestController
@RequestMapping("/api")
public class RutinaController {

    @Autowired
    private RutinaService rutinaService;

    @GetMapping("/plantillas")
    public ResponseEntity<Map<String, Object>> getPlantillas() {
        Map<String, Object> respuesta = new HashMap<>();
        try {
            respuesta.put("exito", true);
            respuesta.put("datos", rutinaService.obtenerPlantillas());
            return ResponseEntity.ok(respuesta);
        } catch (Exception e) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "Error al obtener las plantillas.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(respuesta);
        }
    }

    @PostMapping("/rutinas-socios")
    public ResponseEntity<Map<String, Object>> guardarRutinaSocio(@RequestBody RutinaSocio nuevaRutina) {
        Map<String, Object> respuesta = rutinaService.guardarRutinaSocio(nuevaRutina);

        if (Boolean.TRUE.equals(respuesta.get("exito"))) {
            return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(respuesta);
    }

    /**
     * Devuelve la rutina activa del socio autenticado.
     * El clienteId se extrae del JWT via Principal — el socio solo puede ver su propia rutina.
     */
    @GetMapping("/rutinas-socios/mi-rutina")
    public ResponseEntity<Map<String, Object>> getMiRutina(Principal principal) {
        Map<String, Object> respuesta = new HashMap<>();

        if (principal == null) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "No autorizado.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(respuesta);
        }

        String clienteId = principal.getName();
        Optional<RutinaSocio> rutinaOpt = rutinaService.obtenerRutinaActivaPorCliente(clienteId);

        if (rutinaOpt.isEmpty()) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "No tienes una rutina activa asignada.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(respuesta);
        }

        respuesta.put("exito", true);
        respuesta.put("datos", rutinaOpt.get());
        return ResponseEntity.ok(respuesta);
    }
}