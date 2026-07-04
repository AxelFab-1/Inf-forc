package com.infinityforce.backend.dto;

import jakarta.validation.constraints.*;

public class NutricionRequestDTO {

    private String sexo;
    private String fechaNacimiento;

    @Min(value = 100, message = "La estatura mínima permitida es 100 cm")
    @Max(value = 250, message = "La estatura máxima permitida es 250 cm")
    private Double estaturaCm;

    @NotNull(message = "El peso es obligatorio")
    @Min(value = 30, message = "El peso mínimo permitido es 30 kg")
    @Max(value = 300, message = "El peso máximo permitido es 300 kg")
    private Double pesoKg;

    @NotBlank(message = "El nivel de actividad es obligatorio")
    private String nivelActividad;

    @NotBlank(message = "El objetivo es obligatorio")
    private String objetivo;

    public String getSexo() { return sexo; }
    public void setSexo(String sexo) { this.sexo = sexo; }
    public String getFechaNacimiento() { return fechaNacimiento; }
    public void setFechaNacimiento(String fechaNacimiento) { this.fechaNacimiento = fechaNacimiento; }
    public Double getEstaturaCm() { return estaturaCm; }
    public void setEstaturaCm(Double estaturaCm) { this.estaturaCm = estaturaCm; }
    public Double getPesoKg() { return pesoKg; }
    public void setPesoKg(Double pesoKg) { this.pesoKg = pesoKg; }
    public String getNivelActividad() { return nivelActividad; }
    public void setNivelActividad(String nivelActividad) { this.nivelActividad = nivelActividad; }
    public String getObjetivo() { return objetivo; }
    public void setObjetivo(String objetivo) { this.objetivo = objetivo; }
}