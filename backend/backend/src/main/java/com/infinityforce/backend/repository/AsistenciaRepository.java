package com.infinityforce.backend.repository;

import com.infinityforce.backend.model.Asistencia;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio para la colección 'asistencias'.
 * Usa el Bucket Pattern: un documento por cliente por mes.
 */
@Repository
public interface AsistenciaRepository extends MongoRepository<Asistencia, String> {

    /**
     * Busca el bucket de asistencias de un cliente para un mes y año específicos.
     * Usado por el dashboard para pintar el calendario del mes actual.
     *
     * @param clienteId ID del socio.
     * @param anio      Año (ej: 2026).
     * @param mes       Mes en formato 1-12 (ej: 6 para junio).
     * @return Optional con el bucket mensual, o empty si no ha entrenado ese mes.
     */
    Optional<Asistencia> findByClienteIdAndAnioAndMes(String clienteId, int anio, int mes);

    /**
     * Devuelve todos los buckets de un cliente en un año.
     * Útil para construir vistas anuales o estadísticas.
     *
     * @param clienteId ID del socio.
     * @param anio      Año a consultar.
     * @return Lista de buckets mensuales del año.
     */
    List<Asistencia> findByClienteIdAndAnio(String clienteId, int anio);
}
