package com.infinityforce.backend.repository;

import com.infinityforce.backend.model.RutinaSocio;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RutinaSocioRepository extends MongoRepository<RutinaSocio, String> {
    
    List<RutinaSocio> findByClienteId(String clienteId);

    List<RutinaSocio> findByClienteIdAndEstado(String clienteId, String estado);
}