package com.infinityforce.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

@Document(collection = "rutinas_socios")
public class RutinaSocio {

    @Id
    @JsonProperty("_id")
    private String id;

    private String clienteId;
    
    @NotBlank(message = "El nombre de la rutina no puede estar vacío")
    private String nombreOriginal;
    
    private String estado;
    
    private String fechaAsignacion;
    
    @NotEmpty(message = "La rutina debe contener al menos un día de entrenamiento")
    @Valid
    private List<DiaRutina> dias;

    public RutinaSocio() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getClienteId() { return clienteId; }
    public void setClienteId(String clienteId) { this.clienteId = clienteId; }
    public String getNombreOriginal() { return nombreOriginal; }
    public void setNombreOriginal(String nombreOriginal) { this.nombreOriginal = nombreOriginal; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public String getFechaAsignacion() { return fechaAsignacion; }
    public void setFechaAsignacion(String fechaAsignacion) { this.fechaAsignacion = fechaAsignacion; }
    public List<DiaRutina> getDias() { return dias; }
    public void setDias(List<DiaRutina> dias) { this.dias = dias; }


    public static class DiaRutina {
        @NotBlank(message = "El nombre del día es obligatorio")
        private String nombreDia;

        @Valid
        private List<EjercicioRutina> ejerciciosBase;

        public String getNombreDia() { return nombreDia; }
        public void setNombreDia(String nombreDia) { this.nombreDia = nombreDia; }
        public List<EjercicioRutina> getEjerciciosBase() { return ejerciciosBase; }
        public void setEjerciciosBase(List<EjercicioRutina> ejerciciosBase) { this.ejerciciosBase = ejerciciosBase; }
    }

    public static class EjercicioRutina {
        @NotBlank(message = "El ID del ejercicio es obligatorio")
        private String ejercicioId;

        @NotBlank(message = "El nombre del ejercicio es obligatorio")
        private String nombre;

        public String getEjercicioId() { return ejercicioId; }
        public void setEjercicioId(String ejercicioId) { this.ejercicioId = ejercicioId; }
        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }
    }
}