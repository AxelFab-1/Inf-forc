package com.infinityforce.backend.repository;

import com.infinityforce.backend.model.Ejercicio;
import org.springframework.data.mongodb.repository.MongoRepository;


public interface EjercicioRepository extends MongoRepository<Ejercicio, String> {
    
}
