package com.infinityforce.backend.controller;

import com.infinityforce.backend.model.Producto;
import com.infinityforce.backend.service.ProductoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ProductoController {

    @Autowired
    private ProductoService productoService;

    @GetMapping("/productos")
    public ResponseEntity<Map<String, Object>> listarProductos() {
        Map<String, Object> respuesta = new HashMap<>();
        try {
            List<Producto> productos = productoService.listarProductos();
            respuesta.put("exito", true);
            respuesta.put("datos", productos);
            return ResponseEntity.ok(respuesta);
        } catch (Exception e) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "Error al obtener productos: " + e.getMessage());
            return ResponseEntity.internalServerError().body(respuesta);
        }
    }

    @PostMapping("/productos")
    public ResponseEntity<Map<String, Object>> crearProducto(@Valid @RequestBody Producto producto) {
        return ResponseEntity.ok(productoService.crearProducto(producto));
    }

    @PutMapping("/productos/{id}")
    public ResponseEntity<Map<String, Object>> actualizarProducto(@PathVariable String id,
            @Valid @RequestBody Producto productoActualizado) {
        Map<String, Object> respuesta = productoService.actualizarProducto(id, productoActualizado);

        if (Boolean.TRUE.equals(respuesta.get("exito"))) {
            return ResponseEntity.ok(respuesta);
        } else {
            return ResponseEntity.status(404).body(respuesta);
        }
    }
}