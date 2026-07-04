package com.infinityforce.backend.controller;

import com.infinityforce.backend.service.EjercicioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;


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
}
