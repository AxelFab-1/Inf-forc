package com.infinityforce.backend.service;

import com.infinityforce.backend.model.Producto;
import com.infinityforce.backend.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ProductoService {

    @Autowired
    private ProductoRepository productoRepository;

    public List<Producto> listarProductos() {
        return productoRepository.findAll();
    }

    public Map<String, Object> crearProducto(Producto producto) {
        Map<String, Object> respuesta = new HashMap<>();
        
        // Regla de negocio: Por defecto, un producto nuevo siempre nace "activo"
        producto.setActivo(true);
        Producto nuevoProducto = productoRepository.save(producto);
        
        respuesta.put("exito", true);
        respuesta.put("mensaje", "Producto creado exitosamente");
        respuesta.put("datos", nuevoProducto);
        
        return respuesta;
    }

    public Map<String, Object> actualizarProducto(String id, Producto productoActualizado) {
        Map<String, Object> respuesta = new HashMap<>();
        Optional<Producto> productoExistente = productoRepository.findById(id);

        if (productoExistente.isPresent()) {
            Producto p = productoExistente.get();
            
            // Actualización de campos
            p.setNombre(productoActualizado.getNombre());
            p.setCategoria(productoActualizado.getCategoria());
            p.setPrecio(productoActualizado.getPrecio());
            p.setStock(productoActualizado.getStock());
            p.setImagenUrl(productoActualizado.getImagenUrl());
            p.setActivo(productoActualizado.isActivo());

            productoRepository.save(p);

            respuesta.put("exito", true);
            respuesta.put("mensaje", "Producto actualizado correctamente");
        } else {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "Producto no encontrado");
        }
        
        return respuesta;
    }
}