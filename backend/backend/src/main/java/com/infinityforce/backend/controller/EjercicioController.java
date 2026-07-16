package com.infinityforce.backend.controller;

import com.infinityforce.backend.service.EjercicioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;


import com.infinityforce.backend.model.Ejercicio;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api")
public class EjercicioController {

    @Autowired
    private EjercicioService ejercicioService;

    @GetMapping("/ejercicios")
    public ResponseEntity<Map<String, Object>> obtenerEjercicios() {
        Map<String, Object> respuesta = new HashMap<>();
        try {
            respuesta.put("exito", true);
            respuesta.put("datos", ejercicioService.obtenerTodos());
            return ResponseEntity.ok(respuesta);
        } catch (Exception e) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "Error al obtener el catálogo.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(respuesta);
        }
    }

    @PostMapping(value = "/ejercicios", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> crearEjercicio(
            @RequestPart("ejercicio") String ejercicioJson,
            @RequestPart(value = "imagen", required = false) MultipartFile imagen) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            Ejercicio ejercicio = mapper.readValue(ejercicioJson, Ejercicio.class);
            return ResponseEntity.ok(ejercicioService.crearEjercicio(ejercicio, imagen));
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("exito", false);
            error.put("mensaje", "Error procesando el ejercicio: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping(value = "/ejercicios/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> actualizarEjercicio(@PathVariable String id,
            @RequestPart("ejercicio") String ejercicioJson,
            @RequestPart(value = "imagen", required = false) MultipartFile imagen) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            Ejercicio ejercicioActualizado = mapper.readValue(ejercicioJson, Ejercicio.class);
            Map<String, Object> respuesta = ejercicioService.actualizarEjercicio(id, ejercicioActualizado, imagen);

            if (Boolean.TRUE.equals(respuesta.get("exito"))) {
                return ResponseEntity.ok(respuesta);
            } else {
                return ResponseEntity.status(404).body(respuesta);
            }
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("exito", false);
            error.put("mensaje", "Error procesando el ejercicio: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/ejercicios/{id}")
    public ResponseEntity<Map<String, Object>> eliminarEjercicio(@PathVariable String id) {
        Map<String, Object> respuesta = ejercicioService.eliminarEjercicio(id);
        if (Boolean.TRUE.equals(respuesta.get("exito"))) {
            return ResponseEntity.ok(respuesta);
        } else {
            return ResponseEntity.status(404).body(respuesta);
        }
    }
}
