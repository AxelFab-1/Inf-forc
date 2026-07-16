package com.infinityforce.backend.service;

import com.infinityforce.backend.model.Ejercicio;
import com.infinityforce.backend.repository.EjercicioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class EjercicioService {

    @Autowired
    private EjercicioRepository ejercicioRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    public List<Ejercicio> obtenerTodos() {
        return ejercicioRepository.findAll();
    }

    public Map<String, Object> crearEjercicio(Ejercicio ejercicio, MultipartFile imagen) {
        Map<String, Object> respuesta = new HashMap<>();
        
        try {
            if (imagen != null && !imagen.isEmpty()) {
                Map<String, Object> uploadResult = cloudinaryService.subirArchivo(imagen, "ejercicios-infinity");
                ejercicio.setImagenUrl((String) uploadResult.get("secure_url"));
                ejercicio.setPublicId((String) uploadResult.get("public_id"));
            }
            
            Ejercicio nuevoEjercicio = ejercicioRepository.save(ejercicio);
            
            respuesta.put("exito", true);
            respuesta.put("mensaje", "Ejercicio creado exitosamente");
            respuesta.put("datos", nuevoEjercicio);
        } catch (IOException e) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "Error al subir el GIF a Cloudinary");
        }
        
        return respuesta;
    }

    public Map<String, Object> actualizarEjercicio(String id, Ejercicio ejercicioActualizado, MultipartFile imagen) {
        Map<String, Object> respuesta = new HashMap<>();
        Optional<Ejercicio> ejercicioExistente = ejercicioRepository.findById(id);

        if (ejercicioExistente.isPresent()) {
            Ejercicio e = ejercicioExistente.get();
            
            e.setNombre(ejercicioActualizado.getNombre());
            e.setGrupoMuscular(ejercicioActualizado.getGrupoMuscular());
            e.setSubGrupo(ejercicioActualizado.getSubGrupo());
            e.setTipo(ejercicioActualizado.getTipo());
            e.setCategoria(ejercicioActualizado.getCategoria());
            e.setSeries(ejercicioActualizado.getSeries());
            e.setRepeticiones(ejercicioActualizado.getRepeticiones());
            e.setPesoCorporal(ejercicioActualizado.isPesoCorporal());
            e.setVideoUrl(ejercicioActualizado.getVideoUrl());
            
            try {
                if (imagen != null && !imagen.isEmpty()) {
                    if (e.getPublicId() != null) {
                        cloudinaryService.eliminarArchivo(e.getPublicId());
                    }
                    Map<String, Object> uploadResult = cloudinaryService.subirArchivo(imagen, "ejercicios-infinity");
                    e.setImagenUrl((String) uploadResult.get("secure_url"));
                    e.setPublicId((String) uploadResult.get("public_id"));
                }
                
                ejercicioRepository.save(e);
                respuesta.put("exito", true);
                respuesta.put("mensaje", "Ejercicio actualizado correctamente");
            } catch (IOException ex) {
                respuesta.put("exito", false);
                respuesta.put("mensaje", "Error al actualizar el GIF en Cloudinary");
            }
        } else {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "Ejercicio no encontrado");
        }
        
        return respuesta;
    }

    public Map<String, Object> eliminarEjercicio(String id) {
        Map<String, Object> respuesta = new HashMap<>();
        Optional<Ejercicio> ejercicioExistente = ejercicioRepository.findById(id);

        if (ejercicioExistente.isPresent()) {
            Ejercicio e = ejercicioExistente.get();
            try {
                if (e.getPublicId() != null) {
                    cloudinaryService.eliminarArchivo(e.getPublicId());
                }
                ejercicioRepository.delete(e);
                respuesta.put("exito", true);
                respuesta.put("mensaje", "Ejercicio eliminado correctamente");
            } catch (IOException ex) {
                respuesta.put("exito", false);
                respuesta.put("mensaje", "Error al eliminar el GIF en Cloudinary");
            }
        } else {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "Ejercicio no encontrado");
        }
        
        return respuesta;
    }
}
