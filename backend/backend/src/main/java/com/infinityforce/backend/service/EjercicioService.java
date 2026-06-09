package com.infinityforce.backend.service;

import com.infinityforce.backend.model.Ejercicio;
import com.infinityforce.backend.repository.EjercicioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Servicio que centraliza la lógica del catálogo de ejercicios.
 * Preparado para soportar filtros avanzados en el siguiente paso del roadmap.
 */
@Service
public class EjercicioService {

    @Autowired
    private EjercicioRepository ejercicioRepository;

    /**
     * Devuelve el catálogo completo de ejercicios.
     *
     * @return Lista con todos los ejercicios registrados.
     */
    public List<Ejercicio> obtenerTodos() {
        return ejercicioRepository.findAll();
    }
}
