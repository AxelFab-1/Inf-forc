package com.infinityforce.backend.controller;

import com.infinityforce.backend.model.Producto;
import com.infinityforce.backend.repository.ProductoRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ProductoController {

    @Autowired
    private ProductoRepository productoRepository;

    // 1. OBTENER TODOS LOS PRODUCTOS
    @GetMapping("/productos")
    public ResponseEntity<Map<String, Object>> listarProductos() {
        Map<String, Object> respuesta = new HashMap<>();
        try {
            List<Producto> productos = productoRepository.findAll();
            respuesta.put("exito", true);
            respuesta.put("datos", productos);
            return ResponseEntity.ok(respuesta);
        } catch (Exception e) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "Error al obtener productos: " + e.getMessage());
            return ResponseEntity.internalServerError().body(respuesta);
        }
    }

    // 2. CREAR NUEVO PRODUCTO (Con Validación)
    @PostMapping("/productos")
    public ResponseEntity<Map<String, Object>> crearProducto(@Valid @RequestBody Producto producto, BindingResult result) {
        Map<String, Object> respuesta = new HashMap<>();

        if (result.hasErrors()) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", result.getFieldError().getDefaultMessage());
            return ResponseEntity.badRequest().body(respuesta); // Lanza el Error 400 para Angular
        }

        try {
            // Por defecto, un producto nuevo siempre nace "activo" (Disponible)
            producto.setActivo(true);
            Producto nuevoProducto = productoRepository.save(producto);
            respuesta.put("exito", true);
            respuesta.put("mensaje", "Producto creado exitosamente");
            respuesta.put("datos", nuevoProducto);
            return ResponseEntity.ok(respuesta);
        } catch (Exception e) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "Error al crear producto: " + e.getMessage());
            return ResponseEntity.internalServerError().body(respuesta);
        }
    }

    // 3. ACTUALIZAR PRODUCTO (Editar precio o cambiar estado Activo/Agotado)
    @PutMapping("/productos/{id}")
    public ResponseEntity<Map<String, Object>> actualizarProducto(@PathVariable String id, @Valid @RequestBody Producto productoActualizado, BindingResult result) {
        Map<String, Object> respuesta = new HashMap<>();

        if (result.hasErrors()) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", result.getFieldError().getDefaultMessage());
            return ResponseEntity.badRequest().body(respuesta); // Lanza el Error 400
        }

        try {
            Optional<Producto> productoExistente = productoRepository.findById(id);
            
            if (productoExistente.isPresent()) {
                Producto p = productoExistente.get();
                p.setNombre(productoActualizado.getNombre());
                p.setCategoria(productoActualizado.getCategoria());
                p.setPrecio(productoActualizado.getPrecio());
                p.setStock(productoActualizado.getStock());
                p.setImagenUrl(productoActualizado.getImagenUrl());
                p.setActivo(productoActualizado.isActivo()); // Aquí hacemos el Falso Eliminar (Soft Delete)

                productoRepository.save(p);

                respuesta.put("exito", true);
                respuesta.put("mensaje", "Producto actualizado correctamente");
                return ResponseEntity.ok(respuesta);
            } else {
                respuesta.put("exito", false);
                respuesta.put("mensaje", "Producto no encontrado");
                return ResponseEntity.status(404).body(respuesta);
            }
        } catch (Exception e) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "Error al actualizar producto: " + e.getMessage());
            return ResponseEntity.internalServerError().body(respuesta);
        }
    }
}
