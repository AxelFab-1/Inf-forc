package com.infinityforce.backend.controller;

import com.infinityforce.backend.model.Asistencia;
import com.infinityforce.backend.model.SesionEntrenamiento;
import com.infinityforce.backend.repository.AsistenciaRepository;
import com.infinityforce.backend.service.SesionService;
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

/**
 * Controlador HTTP para la colección 'asistencias'.
 * Expone endpoints para que el dashboard y el historial lean los días entrenados.
 *
 * Endpoints:
 *   GET  /api/asistencias/mes-actual          → bucket del mes actual (para el dashboard)
 *   GET  /api/asistencias?anio=&mes=          → bucket de un mes específico (para el historial)
 *   GET  /api/asistencias/sesion/{sesionId}   → detalle completo de una sesión
 *   DELETE /api/asistencias/registro          → borra un registro del bucket y su sesión
 */
@RestController
@RequestMapping("/api/asistencias")
public class AsistenciaController {

    @Autowired
    private AsistenciaRepository asistenciaRepository;

    @Autowired
    private SesionService sesionService;

    /**
     * Devuelve el bucket de asistencias del mes actual para el socio autenticado.
     * Usado por el dashboard para pintar el calendario del mes en curso.
     */
    @GetMapping("/mes-actual")
    public ResponseEntity<Map<String, Object>> getMesActual(Principal principal) {
        Map<String, Object> respuesta = new HashMap<>();

        if (principal == null) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "No autorizado.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(respuesta);
        }

        // Usar zona horaria de Perú (UTC-5) para que el "mes actual"
        // coincida con lo que el usuario ve en su reloj, no con UTC.
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

    /**
     * Devuelve el bucket de asistencias de un mes específico para el socio autenticado.
     * Usado por la pantalla de historial para navegar entre meses.
     *
     * @param anio Año a consultar (ej: 2026).
     * @param mes  Mes a consultar en formato 1-12 (ej: 6 para junio).
     */
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

    /**
     * Devuelve el detalle completo de una sesión de entrenamiento por su ID.
     * Usado por la pantalla de historial cuando el usuario hace clic en "Ver detalle".
     *
     * @param sesionId ID de la sesión a recuperar.
     */
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

        // Verificar que la sesión pertenece al socio autenticado
        if (!sesion.getClienteId().equals(principal.getName())) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "No autorizado para ver esta sesión.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(respuesta);
        }

        respuesta.put("exito", true);
        respuesta.put("datos", sesion);
        return ResponseEntity.ok(respuesta);
    }

    /**
     * Elimina un registro de asistencia y su sesión de entrenamiento asociada.
     * Requiere que el frontend envíe en el body: sesionId, anio, mes, dia.
     *
     * @param payload Map con los campos: sesionId (String), anio (int), mes (int), dia (int).
     */
    @DeleteMapping("/registro")
    public ResponseEntity<Map<String, Object>> borrarRegistro(
            @RequestBody Map<String, Object> payload,
            Principal principal) {

        Map<String, Object> respuesta = new HashMap<>();

        if (principal == null) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "No autorizado.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(respuesta);
        }

        try {
            String sesionId  = (String) payload.get("sesionId");
            int anio = ((Number) payload.get("anio")).intValue();
            int mes  = ((Number) payload.get("mes")).intValue();
            int dia  = ((Number) payload.get("dia")).intValue();

            // Verificar que la sesión pertenece al socio antes de borrar
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
