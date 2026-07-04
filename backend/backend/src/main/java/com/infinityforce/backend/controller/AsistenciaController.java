package com.infinityforce.backend.controller;

import com.infinityforce.backend.dto.BorrarAsistenciaDTO;
import com.infinityforce.backend.model.Asistencia;
import com.infinityforce.backend.model.SesionEntrenamiento;
import com.infinityforce.backend.repository.AsistenciaRepository;
import com.infinityforce.backend.service.SesionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/asistencias")
public class AsistenciaController {

    @Autowired
    private AsistenciaRepository asistenciaRepository;

    @Autowired
    private SesionService sesionService;

    @GetMapping("/mes-actual")
    public ResponseEntity<Map<String, Object>> getMesActual(Principal principal) {
        Map<String, Object> respuesta = new HashMap<>();

        if (principal == null) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "No autorizado.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(respuesta);
        }

        ZonedDateTime ahora = ZonedDateTime.now(ZoneId.of("America/Lima"));
        int anio = ahora.getYear();
        int mes  = ahora.getMonthValue();

        Optional<Asistencia> bucket = asistenciaRepository
                .findByClienteIdAndAnioAndMes(principal.getName(), anio, mes);

        respuesta.put("exito", true);
        respuesta.put("anio", anio);
        respuesta.put("mes", mes);
        respuesta.put("datos", bucket.orElse(null));
        return ResponseEntity.ok(respuesta);
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getPorMes(
            @RequestParam int anio,
            @RequestParam int mes,
            Principal principal) {

        Map<String, Object> respuesta = new HashMap<>();

        if (principal == null) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "No autorizado.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(respuesta);
        }

        Optional<Asistencia> bucket = asistenciaRepository
                .findByClienteIdAndAnioAndMes(principal.getName(), anio, mes);

        respuesta.put("exito", true);
        respuesta.put("anio", anio);
        respuesta.put("mes", mes);
        respuesta.put("datos", bucket.orElse(null));
        return ResponseEntity.ok(respuesta);
    }

    @GetMapping("/sesion/{sesionId}")
    public ResponseEntity<Map<String, Object>> getDetalleSesion(
            @PathVariable String sesionId,
            Principal principal) {

        Map<String, Object> respuesta = new HashMap<>();

        if (principal == null) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "No autorizado.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(respuesta);
        }

        SesionEntrenamiento sesion = sesionService.obtenerPorId(sesionId);

        if (sesion == null) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "Sesión no encontrada.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(respuesta);
        }

        if (!sesion.getClienteId().equals(principal.getName())) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "No autorizado para ver esta sesión.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(respuesta);
        }

        respuesta.put("exito", true);
        respuesta.put("datos", sesion);
        return ResponseEntity.ok(respuesta);
    }

    @DeleteMapping("/registro")
    public ResponseEntity<Map<String, Object>> borrarRegistro(
            @Valid @RequestBody BorrarAsistenciaDTO payload,
            Principal principal) {

        Map<String, Object> respuesta = new HashMap<>();

        if (principal == null) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "No autorizado.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(respuesta);
        }

        try {
            String sesionId = payload.getSesionId();
            int anio = payload.getAnio();
            int mes  = payload.getMes();
            int dia  = payload.getDia();

            SesionEntrenamiento sesion = sesionService.obtenerPorId(sesionId);
            if (sesion == null) {
                respuesta.put("exito", false);
                respuesta.put("mensaje", "Sesión no encontrada.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(respuesta);
            }
            if (!sesion.getClienteId().equals(principal.getName())) {
                respuesta.put("exito", false);
                respuesta.put("mensaje", "No autorizado para borrar esta sesión.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(respuesta);
            }

            sesionService.borrarSesion(sesionId, principal.getName(), anio, mes, dia);

            respuesta.put("exito", true);
            respuesta.put("mensaje", "Asistencia y sesión eliminadas correctamente.");
            return ResponseEntity.ok(respuesta);

        } catch (Exception e) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "Error al borrar: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(respuesta);
        }
    }
}