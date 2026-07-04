package com.infinityforce.backend.repository;

import com.infinityforce.backend.model.SesionEntrenamiento;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;


public interface SesionRepository extends MongoRepository<SesionEntrenamiento, String> {

    List<SesionEntrenamiento> findByClienteId(String clienteId);

    List<SesionEntrenamiento> findByClienteIdOrderByFechaDesc(String clienteId);

    long countByClienteId(String clienteId);
}
