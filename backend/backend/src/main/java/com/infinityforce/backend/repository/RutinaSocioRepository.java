package com.infinityforce.backend.repository;

import com.infinityforce.backend.model.RutinaSocio;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;


public interface RutinaSocioRepository extends MongoRepository<RutinaSocio, String> {
    
    List<RutinaSocio> findByClienteId(String clienteId);

    List<RutinaSocio> findByClienteIdAndEstado(String clienteId, String estado);
}
