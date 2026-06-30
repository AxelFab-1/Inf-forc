package com.infinityforce.backend.controller;

import com.infinityforce.backend.model.Producto;
import com.infinityforce.backend.service.ProductoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ProductoController {

    @Autowired
    private ProductoService productoService;

    // 1. OBTENER TODOS LOS PRODUCTOS
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

    // 2. CREAR NUEVO PRODUCTO (Con Validación en el Controller)
    @PostMapping("/productos")
    public ResponseEntity<Map<String, Object>> crearProducto(@Valid @RequestBody Producto producto, BindingResult result) {
        Map<String, Object> respuesta = new HashMap<>();

        // El Controlador actúa como portero: si el JSON viene mal, se rechaza aquí mismo
        if (result.hasErrors()) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", result.getFieldError().getDefaultMessage());
            return ResponseEntity.badRequest().body(respuesta);
        }

        try {
            // Si pasa la validación, el Servicio hace el trabajo pesado
            respuesta = productoService.crearProducto(producto);
            return ResponseEntity.ok(respuesta);
        } catch (Exception e) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "Error al crear producto: " + e.getMessage());
            return ResponseEntity.internalServerError().body(respuesta);
        }
    }

    // 3. ACTUALIZAR PRODUCTO
    @PutMapping("/productos/{id}")
    public ResponseEntity<Map<String, Object>> actualizarProducto(@PathVariable String id, @Valid @RequestBody Producto productoActualizado, BindingResult result) {
        Map<String, Object> respuesta = new HashMap<>();

        // Validación inicial
        if (result.hasErrors()) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", result.getFieldError().getDefaultMessage());
            return ResponseEntity.badRequest().body(respuesta);
        }

        try {
            respuesta = productoService.actualizarProducto(id, productoActualizado);
            
            if (Boolean.TRUE.equals(respuesta.get("exito"))) {
                return ResponseEntity.ok(respuesta);
            } else {
                return ResponseEntity.status(404).body(respuesta);
            }
        } catch (Exception e) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "Error al actualizar producto: " + e.getMessage());
            return ResponseEntity.internalServerError().body(respuesta);
        }
    }
}