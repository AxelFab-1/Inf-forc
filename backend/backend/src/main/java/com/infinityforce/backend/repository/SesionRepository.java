package com.infinityforce.backend.repository;

import com.infinityforce.backend.model.SesionEntrenamiento;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SesionRepository extends MongoRepository<SesionEntrenamiento, String> {

    /** Todas las sesiones de un cliente, para historial general. */
    List<SesionEntrenamiento> findByClienteId(String clienteId);

    /** Sesiones ordenadas de más reciente a más antigua. */
    List<SesionEntrenamiento> findByClienteIdOrderByFechaDesc(String clienteId);

    /** Cuenta total de sesiones completadas por el cliente.
     *  Usado para calcular el índice del próximo día (conteo % totalDias). */
    long countByClienteId(String clienteId);
}
