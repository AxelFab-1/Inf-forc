package com.infinityforce.backend.service;

import com.infinityforce.backend.model.Ejercicio;
import com.infinityforce.backend.repository.EjercicioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EjercicioService {

    @Autowired
    private EjercicioRepository ejercicioRepository;

    /**
     * @return 
     */
    public List<Ejercicio> obtenerTodos() {
        return ejercicioRepository.findAll();
    }
}
