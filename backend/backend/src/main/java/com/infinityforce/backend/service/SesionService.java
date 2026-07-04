package com.infinityforce.backend.service;

import com.infinityforce.backend.model.Asistencia;
import com.infinityforce.backend.model.SesionEntrenamiento;
import com.infinityforce.backend.repository.AsistenciaRepository;
import com.infinityforce.backend.repository.SesionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;


@Service
public class SesionService {

    @Autowired
    private SesionRepository sesionRepository;

    @Autowired
    private AsistenciaRepository asistenciaRepository;

    /**
     * @param sesion 
     * @return 
     */
    public SesionEntrenamiento guardarSesion(SesionEntrenamiento sesion) {
        SesionEntrenamiento guardada = sesionRepository.save(sesion);


        try {
            String fechaIso = guardada.getFecha(); 
            ZonedDateTime fechaZdt = Instant.parse(fechaIso)
                    .atZone(java.time.ZoneId.of("America/Lima"));
            int anio = fechaZdt.getYear();
            int mes  = fechaZdt.getMonthValue(); 
            int dia  = fechaZdt.getDayOfMonth(); 

            String clienteId  = guardada.getClienteId();
            String bucketId   = "ast_" + clienteId + "_" + anio + "_" + mes;

            Optional<Asistencia> optBucket = asistenciaRepository.findById(bucketId);
            Asistencia bucket = optBucket.orElseGet(() -> {
                Asistencia nuevo = new Asistencia();
                nuevo.setId(bucketId);
                nuevo.setClienteId(clienteId);
                nuevo.setAnio(anio);
                nuevo.setMes(mes);
                return nuevo;
            });

            boolean yaExiste = bucket.getRegistros().stream()
                    .anyMatch(r -> r.getDia() == dia);

            if (!yaExiste) {
                bucket.getRegistros().add(new Asistencia.RegistroAsistencia(dia, guardada.getId()));
                asistenciaRepository.save(bucket);
            }

        } catch (Exception e) {
            System.err.println("[SesionService] No se pudo registrar asistencia: " + e.getMessage());
        }

        return guardada;
    }

    /**
     * @param clienteId 
     * @return 
     */
    public List<SesionEntrenamiento> obtenerHistorial(String clienteId) {
        return sesionRepository.findByClienteIdOrderByFechaDesc(clienteId);
    }

    /**
     * @param clienteId 
     * @param totalDias 
     * @return 
     */
    public int calcularIndiceDiaSiguiente(String clienteId, int totalDias) {
        if (totalDias <= 0) return 0;
        long sesionesCompletadas = sesionRepository.countByClienteId(clienteId);
        return (int) (sesionesCompletadas % totalDias);
    }

    /**
     * @param sesionId 
     * @return 
     */
    public SesionEntrenamiento obtenerPorId(String sesionId) {
        return sesionRepository.findById(sesionId).orElse(null);
    }

    /**
     * @param sesionId  
     * @param clienteId 
     * @param anio     
     * @param mes      
     * @param dia       
     */
    public void borrarSesion(String sesionId, String clienteId, int anio, int mes, int dia) {
        sesionRepository.deleteById(sesionId);

        String bucketId = "ast_" + clienteId + "_" + anio + "_" + mes;
        asistenciaRepository.findById(bucketId).ifPresent(bucket -> {
            bucket.getRegistros().removeIf(r -> r.getDia() == dia);
            asistenciaRepository.save(bucket);
        });
    }
}
