package com.infinityforce.backend.service;

import com.infinityforce.backend.model.Producto;
import com.infinityforce.backend.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

@Service
public class ProductoService {

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    public List<Producto> listarProductos() {
        return productoRepository.findAll();
    }

    public Map<String, Object> crearProducto(Producto producto, MultipartFile imagen) {
        Map<String, Object> respuesta = new HashMap<>();
        
        try {
            Map<String, Object> uploadResult = cloudinaryService.subirArchivo(imagen, "productos-infinity");
            producto.setImagenUrl((String) uploadResult.get("secure_url"));
            producto.setPublicId((String) uploadResult.get("public_id"));
            
            producto.setActivo(true);
            Producto nuevoProducto = productoRepository.save(producto);
            
            respuesta.put("exito", true);
            respuesta.put("mensaje", "Producto creado exitosamente");
            respuesta.put("datos", nuevoProducto);
        } catch (IOException e) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "Error al subir la imagen a Cloudinary: " + e.getMessage());
        }
        
        return respuesta;
    }

    public Map<String, Object> actualizarProducto(String id, Producto productoActualizado, MultipartFile imagen) {
        Map<String, Object> respuesta = new HashMap<>();
        Optional<Producto> productoExistente = productoRepository.findById(id);

        if (productoExistente.isPresent()) {
            Producto p = productoExistente.get();
            
            p.setNombre(productoActualizado.getNombre());
            p.setCategoria(productoActualizado.getCategoria());
            p.setPrecio(productoActualizado.getPrecio());
            p.setStock(productoActualizado.getStock());
            p.setActivo(productoActualizado.isActivo());
            
            try {
                if (imagen != null && !imagen.isEmpty()) {
                    if (p.getPublicId() != null) {
                        cloudinaryService.eliminarArchivo(p.getPublicId());
                    }
                    Map<String, Object> uploadResult = cloudinaryService.subirArchivo(imagen, "productos-infinity");
                    p.setImagenUrl((String) uploadResult.get("secure_url"));
                    p.setPublicId((String) uploadResult.get("public_id"));
                }
                
                productoRepository.save(p);
                respuesta.put("exito", true);
                respuesta.put("mensaje", "Producto actualizado correctamente");
            } catch (IOException e) {
                respuesta.put("exito", false);
                respuesta.put("mensaje", "Error al actualizar la imagen en Cloudinary: " + e.getMessage());
            }
        } else {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "Producto no encontrado");
        }
        
        return respuesta;
    }

    public Map<String, Object> eliminarProducto(String id) {
        Map<String, Object> respuesta = new HashMap<>();
        Optional<Producto> productoExistente = productoRepository.findById(id);

        if (productoExistente.isPresent()) {
            Producto p = productoExistente.get();
            try {
                if (p.getPublicId() != null) {
                    cloudinaryService.eliminarArchivo(p.getPublicId());
                }
                productoRepository.delete(p);
                respuesta.put("exito", true);
                respuesta.put("mensaje", "Producto eliminado correctamente");
            } catch (IOException e) {
                respuesta.put("exito", false);
                respuesta.put("mensaje", "Error al eliminar la imagen en Cloudinary: " + e.getMessage());
            }
        } else {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "Producto no encontrado");
        }
        
        return respuesta;
    }
}