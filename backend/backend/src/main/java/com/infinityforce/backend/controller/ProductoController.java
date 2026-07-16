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

import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;

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

    @PostMapping(value = "/productos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> crearProducto(
            @RequestPart("producto") String productoJson,
            @RequestPart("imagen") MultipartFile imagen) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            Producto producto = mapper.readValue(productoJson, Producto.class);
            return ResponseEntity.ok(productoService.crearProducto(producto, imagen));
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("exito", false);
            error.put("mensaje", "Error procesando el producto: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping(value = "/productos/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> actualizarProducto(@PathVariable String id,
            @RequestPart("producto") String productoJson,
            @RequestPart(value = "imagen", required = false) MultipartFile imagen) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            Producto productoActualizado = mapper.readValue(productoJson, Producto.class);
            Map<String, Object> respuesta = productoService.actualizarProducto(id, productoActualizado, imagen);

            if (Boolean.TRUE.equals(respuesta.get("exito"))) {
                return ResponseEntity.ok(respuesta);
            } else {
                return ResponseEntity.status(404).body(respuesta);
            }
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("exito", false);
            error.put("mensaje", "Error procesando el producto: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/productos/{id}")
    public ResponseEntity<Map<String, Object>> eliminarProducto(@PathVariable String id) {
        Map<String, Object> respuesta = productoService.eliminarProducto(id);
        if (Boolean.TRUE.equals(respuesta.get("exito"))) {
            return ResponseEntity.ok(respuesta);
        } else {
            return ResponseEntity.status(404).body(respuesta);
        }
    }
}