package com.infinityforce.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class BorrarAsistenciaDTO {

    @NotBlank(message = "El ID de la sesión es obligatorio")
    private String sesionId;

    @NotNull(message = "El año es obligatorio")
    @Min(value = 2020, message = "Año inválido")
    private Integer anio;

    @NotNull(message = "El mes es obligatorio")
    @Min(value = 1, message = "El mes debe ser entre 1 y 12")
    private Integer mes;

    @NotNull(message = "El día es obligatorio")
    @Min(value = 1, message = "El día debe ser válido")
    private Integer dia;

    public String getSesionId() { return sesionId; }
    public void setSesionId(String sesionId) { this.sesionId = sesionId; }
    
    public Integer getAnio() { return anio; }
    public void setAnio(Integer anio) { this.anio = anio; }
    
    public Integer getMes() { return mes; }
    public void setMes(Integer mes) { this.mes = mes; }
    
    public Integer getDia() { return dia; }
    public void setDia(Integer dia) { this.dia = dia; }
}