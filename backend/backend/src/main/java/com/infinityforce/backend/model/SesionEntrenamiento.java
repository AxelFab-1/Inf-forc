package com.infinityforce.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.Map;

/**
 * Documento MongoDB que representa una sesión de entrenamiento completada.
 * Colección: sesiones_entrenamiento
 *
 * Cada sesión pertenece a un socio, está asociada a un día de su rutina
 * y almacena los ejercicios realizados con sus series, repeticiones y pesos.
 */
@Document(collection = "sesiones_entrenamiento")
public class SesionEntrenamiento {

    @Id
    @JsonProperty("_id")
    private String id;

    /** ID del socio que realizó la sesión. */
    private String clienteId;

    /** ID del documento en rutinas_socios que se usó. */
    private String rutinaId;

    /** Nombre descriptivo del día (ej: "Día 1 — Empuje"). */
    private String nombreDia;

    /** Índice (0-based) del día dentro del array dias de la rutina. */
    private int indiceDia;

    /** Timestamp ISO del inicio de la sesión. */
    private String fecha;

    /** Duración total de la sesión en segundos. */
    private int duracionSegundos;

    /**
     * Lista de ejercicios realizados en la sesión.
     * Cada elemento tiene la estructura:
     * {
     *   ejercicioId: String,
     *   nombre: String,
     *   pesoCorporal: boolean,
     *   series: [ { numeroSerie: int, repeticiones: int, pesoKg: double } ]
     * }
     * Si el usuario omitió un ejercicio (sin series registradas),
     * ese ejercicio NO se incluye en esta lista.
     */
    private List<Map<String, Object>> ejerciciosRealizados;

    public SesionEntrenamiento() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getClienteId() { return clienteId; }
    public void setClienteId(String clienteId) { this.clienteId = clienteId; }

    public String getRutinaId() { return rutinaId; }
    public void setRutinaId(String rutinaId) { this.rutinaId = rutinaId; }

    public String getNombreDia() { return nombreDia; }
    public void setNombreDia(String nombreDia) { this.nombreDia = nombreDia; }

    public int getIndiceDia() { return indiceDia; }
    public void setIndiceDia(int indiceDia) { this.indiceDia = indiceDia; }

    public String getFecha() { return fecha; }
    public void setFecha(String fecha) { this.fecha = fecha; }

    public int getDuracionSegundos() { return duracionSegundos; }
    public void setDuracionSegundos(int duracionSegundos) { this.duracionSegundos = duracionSegundos; }

    public List<Map<String, Object>> getEjerciciosRealizados() { return ejerciciosRealizados; }
    public void setEjerciciosRealizados(List<Map<String, Object>> ejerciciosRealizados) {
        this.ejerciciosRealizados = ejerciciosRealizados;
    }
}
