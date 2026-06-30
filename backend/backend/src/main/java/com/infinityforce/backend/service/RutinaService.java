package com.infinityforce.backend.service;

import com.infinityforce.backend.model.Plantilla;
import com.infinityforce.backend.model.RutinaSocio;
import com.infinityforce.backend.repository.PlantillaRepository;
import com.infinityforce.backend.repository.RutinaSocioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Servicio que centraliza la lógica de negocio de plantillas y rutinas de socios.
 * Preparado para la secuencia de entrenamiento en pasos futuros del roadmap.
 */
@Service
public class RutinaService {

    @Autowired
    private PlantillaRepository plantillaRepository;

    @Autowired
    private RutinaSocioRepository rutinaSocioRepository;

    /**
     * Devuelve todas las plantillas de rutinas disponibles.
     *
     * @return Lista de plantillas.
     */
    public List<Plantilla> obtenerPlantillas() {
        return plantillaRepository.findAll();
    }

    /**
     * Persiste una rutina asignada a un socio, validando que contenga clienteId.
     *
     * @param nuevaRutina La rutina a guardar.
     * @return Mapa de respuesta con el resultado de la operación.
     */
    public Map<String, Object> guardarRutinaSocio(RutinaSocio nuevaRutina) {
        Map<String, Object> respuesta = new HashMap<>();

        if (nuevaRutina.getClienteId() == null || nuevaRutina.getClienteId().isBlank()) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "Falta el ID del cliente.");
            return respuesta;
        }

        RutinaSocio guardada = rutinaSocioRepository.save(nuevaRutina);

        respuesta.put("exito", true);
        respuesta.put("mensaje", "Rutina guardada exitosamente en tu perfil.");
        respuesta.put("id", guardada.getId());

        return respuesta;
    }

    /**
     * Recupera las rutinas asignadas a un cliente específico.
     *
     * @param clienteId ID del cliente.
     * @return Lista de rutinas del socio.
     */
    public List<RutinaSocio> obtenerRutinasPorCliente(String clienteId) {
        return rutinaSocioRepository.findByClienteId(clienteId);
    }

    /**
     * Obtiene la rutina activa más reciente de un socio.
     * Si tiene más de una activa (caso edge), devuelve la de fecha más reciente.
     *
     * @param clienteId ID del socio.
     * @return Optional con la rutina activa, o empty si no tiene ninguna.
     */
    public Optional<RutinaSocio> obtenerRutinaActivaPorCliente(String clienteId) {
        List<RutinaSocio> activas = rutinaSocioRepository.findByClienteIdAndEstado(clienteId, "activa");

        if (activas.isEmpty()) {
            return Optional.empty();
        }

        // Si hay más de una activa, devolver la más reciente por fechaAsignacion
        return activas.stream()
                .max(Comparator.comparing(
                        r -> r.getFechaAsignacion() != null ? r.getFechaAsignacion() : ""
                ));
    }
}
