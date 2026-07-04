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


@Service
public class RutinaService {

    @Autowired
    private PlantillaRepository plantillaRepository;

    @Autowired
    private RutinaSocioRepository rutinaSocioRepository;

    /**
     * @return 
     */
    public List<Plantilla> obtenerPlantillas() {
        return plantillaRepository.findAll();
    }

    /**
     * @param nuevaRutina
     * @return 
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
     * @param clienteId 
     * @return
     */
    public List<RutinaSocio> obtenerRutinasPorCliente(String clienteId) {
        return rutinaSocioRepository.findByClienteId(clienteId);
    }

    /**
     * @param clienteId 
     * @return 
     */
    public Optional<RutinaSocio> obtenerRutinaActivaPorCliente(String clienteId) {
        List<RutinaSocio> activas = rutinaSocioRepository.findByClienteIdAndEstado(clienteId, "activa");

        if (activas.isEmpty()) {
            return Optional.empty();
        }

        return activas.stream()
                .max(Comparator.comparing(
                        r -> r.getFechaAsignacion() != null ? r.getFechaAsignacion() : ""
                ));
    }
}
