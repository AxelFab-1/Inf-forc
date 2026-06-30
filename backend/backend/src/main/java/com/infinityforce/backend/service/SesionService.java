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

/**
 * Servicio que gestiona las sesiones de entrenamiento completadas.
 * Responsable de persistir el progreso del socio y calcular la secuencia de días.
 *
 * Implementa arquitectura de "existencia dual":
 *   1. Guarda el detalle completo en 'sesiones_entrenamiento'.
 *   2. Registra el día en el bucket mensual de 'asistencias' (Bucket Pattern).
 */
@Service
public class SesionService {

    @Autowired
    private SesionRepository sesionRepository;

    @Autowired
    private AsistenciaRepository asistenciaRepository;

    /**
     * Persiste una sesión de entrenamiento y registra la asistencia en el bucket mensual.
     *
     * Flujo:
     *  1. Guarda la sesión completa → obtiene sesionId.
     *  2. Calcula el año, mes y día a partir del campo fecha de la sesión.
     *  3. Hace upsert en la colección 'asistencias' (crea el bucket si no existe).
     *
     * @param sesion Objeto con todos los datos de la sesión (clienteId se fija en el controlador).
     * @return La sesión guardada con su ID generado por MongoDB.
     */
    public SesionEntrenamiento guardarSesion(SesionEntrenamiento sesion) {
        // Paso 1: persistir la sesión completa
        SesionEntrenamiento guardada = sesionRepository.save(sesion);

        // Paso 2: extraer año, mes y día usando la zona horaria de Perú (UTC-5)
        // IMPORTANTE: si se usara UTC, una sesión guardada a las 9 PM hora Lima
        // (= 2 AM UTC del día siguiente) quedaría registrada en el día equivocado.
        try {
            String fechaIso = guardada.getFecha(); // Ej: "2026-06-06T18:30:00Z"
            ZonedDateTime fechaZdt = Instant.parse(fechaIso)
                    .atZone(java.time.ZoneId.of("America/Lima"));
            int anio = fechaZdt.getYear();
            int mes  = fechaZdt.getMonthValue(); // 1-12
            int dia  = fechaZdt.getDayOfMonth(); // 1-31

            // Paso 3: ID determinístico del bucket mensual
            String clienteId  = guardada.getClienteId();
            String bucketId   = "ast_" + clienteId + "_" + anio + "_" + mes;

            // Buscar el bucket existente o crear uno nuevo
            Optional<Asistencia> optBucket = asistenciaRepository.findById(bucketId);
            Asistencia bucket = optBucket.orElseGet(() -> {
                Asistencia nuevo = new Asistencia();
                nuevo.setId(bucketId);
                nuevo.setClienteId(clienteId);
                nuevo.setAnio(anio);
                nuevo.setMes(mes);
                return nuevo;
            });

            // Agregar el registro del día (evitar duplicados del mismo día)
            boolean yaExiste = bucket.getRegistros().stream()
                    .anyMatch(r -> r.getDia() == dia);

            if (!yaExiste) {
                bucket.getRegistros().add(new Asistencia.RegistroAsistencia(dia, guardada.getId()));
                asistenciaRepository.save(bucket);
            }

        } catch (Exception e) {
            // Si falla el registro de asistencia, logueamos pero no rompemos el flujo principal
            System.err.println("[SesionService] No se pudo registrar asistencia: " + e.getMessage());
        }

        return guardada;
    }

    /**
     * Devuelve el historial de sesiones de un cliente, ordenado de más reciente a más antiguo.
     *
     * @param clienteId ID del socio.
     * @return Lista de sesiones completadas.
     */
    public List<SesionEntrenamiento> obtenerHistorial(String clienteId) {
        return sesionRepository.findByClienteIdOrderByFechaDesc(clienteId);
    }

    /**
     * Calcula el índice del próximo día de entrenamiento para un socio.
     * La lógica rota cíclicamente: si la rutina tiene 4 días y el socio completó 6 sesiones,
     * el próximo índice es 6 % 4 = 2 (Día 3).
     *
     * @param clienteId ID del socio.
     * @param totalDias Número total de días que tiene la rutina activa del socio.
     * @return Índice (0-based) del próximo día a entrenar.
     */
    public int calcularIndiceDiaSiguiente(String clienteId, int totalDias) {
        if (totalDias <= 0) return 0;
        long sesionesCompletadas = sesionRepository.countByClienteId(clienteId);
        return (int) (sesionesCompletadas % totalDias);
    }

    /**
     * Busca una sesión de entrenamiento por su ID.
     *
     * @param sesionId ID de la sesión.
     * @return La sesión o null si no existe.
     */
    public SesionEntrenamiento obtenerPorId(String sesionId) {
        return sesionRepository.findById(sesionId).orElse(null);
    }

    /**
     * Elimina una sesión de entrenamiento y su registro de asistencia del bucket mensual.
     * Esto garantiza que el calendario del dashboard se mantenga sincronizado.
     *
     * @param sesionId  ID de la sesión a eliminar.
     * @param clienteId ID del socio (para localizar el bucket correcto).
     * @param anio      Año del bucket.
     * @param mes       Mes del bucket (1-12).
     * @param dia       Día a eliminar del bucket.
     */
    public void borrarSesion(String sesionId, String clienteId, int anio, int mes, int dia) {
        // Eliminar la sesión de entrenamiento completa
        sesionRepository.deleteById(sesionId);

        // Eliminar el registro del día en el bucket de asistencias
        String bucketId = "ast_" + clienteId + "_" + anio + "_" + mes;
        asistenciaRepository.findById(bucketId).ifPresent(bucket -> {
            bucket.getRegistros().removeIf(r -> r.getDia() == dia);
            asistenciaRepository.save(bucket);
        });
    }
}
