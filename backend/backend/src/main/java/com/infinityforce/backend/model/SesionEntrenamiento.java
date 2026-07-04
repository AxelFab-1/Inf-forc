package com.infinityforce.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;

@Document(collection = "sesiones_entrenamiento")
public class SesionEntrenamiento {

    @Id
    @JsonProperty("_id")
    private String id;

    private String clienteId; 

    @NotBlank(message = "El ID de la rutina es obligatorio")
    private String rutinaId;

    @NotBlank(message = "El nombre del día no puede estar vacío")
    private String nombreDia;

    @Min(value = 0, message = "El índice del día no puede ser negativo")
    private int indiceDia;

    @NotBlank(message = "La fecha de sesión es obligatoria")
    private String fecha;

    @Min(value = 0, message = "La duración de la sesión no puede ser negativa")
    private int duracionSegundos;
    
    @NotEmpty(message = "La sesión debe registrar al menos un ejercicio")
    @Valid 
    private List<EjercicioRealizado> ejerciciosRealizados;

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
    public List<EjercicioRealizado> getEjerciciosRealizados() { return ejerciciosRealizados; }
    public void setEjerciciosRealizados(List<EjercicioRealizado> ejerciciosRealizados) { this.ejerciciosRealizados = ejerciciosRealizados; }


    public static class EjercicioRealizado {
        @NotBlank(message = "El ID del ejercicio es obligatorio")
        private String ejercicioId;

        @NotBlank(message = "El nombre del ejercicio es obligatorio")
        private String nombre;

        private boolean pesoCorporal;

        @NotEmpty(message = "El ejercicio debe tener al menos una serie")
        @Valid 
        private List<SerieRealizada> series;

        public String getEjercicioId() { return ejercicioId; }
        public void setEjercicioId(String ejercicioId) { this.ejercicioId = ejercicioId; }
        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }
        public boolean isPesoCorporal() { return pesoCorporal; }
        public void setPesoCorporal(boolean pesoCorporal) { this.pesoCorporal = pesoCorporal; }
        public List<SerieRealizada> getSeries() { return series; }
        public void setSeries(List<SerieRealizada> series) { this.series = series; }
    }

    public static class SerieRealizada {
        @Min(value = 1, message = "El número de serie debe ser mayor a 0")
        private int numeroSerie;

        @NotNull(message = "Las repeticiones son obligatorias")
        @Min(value = 1, message = "Debe haber al menos 1 repetición")
        private Integer repeticiones;

        @Min(value = 0, message = "El peso no puede ser negativo")
        private Double pesoKg;

        public int getNumeroSerie() { return numeroSerie; }
        public void setNumeroSerie(int numeroSerie) { this.numeroSerie = numeroSerie; }
        public Integer getRepeticiones() { return repeticiones; }
        public void setRepeticiones(Integer repeticiones) { this.repeticiones = repeticiones; }
        public Double getPesoKg() { return pesoKg; }
        public void setPesoKg(Double pesoKg) { this.pesoKg = pesoKg; }
    }
}