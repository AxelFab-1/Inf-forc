package com.infinityforce.backend.repository;

import com.infinityforce.backend.model.Asistencia;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;


public interface AsistenciaRepository extends MongoRepository<Asistencia, String> {

    Optional<Asistencia> findByClienteIdAndAnioAndMes(String clienteId, int anio, int mes);


    List<Asistencia> findByClienteIdAndAnio(String clienteId, int anio);
}
