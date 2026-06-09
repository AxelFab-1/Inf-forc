package com.infinityforce.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class PasswordChangeDTO {

    @NotBlank(message = "Debes ingresar tu clave actual")
    private String claveActual;

    @NotBlank(message = "La nueva clave no puede estar vacía")
    @Size(min = 8, message = "La nueva clave debe tener mínimo 8 caracteres")
    private String nuevaClave;

    public PasswordChangeDTO() {
    }

    public String getClaveActual() {
        return claveActual;
    }

    public void setClaveActual(String claveActual) {
        this.claveActual = claveActual;
    }

    public String getNuevaClave() {
        return nuevaClave;
    }

    public void setNuevaClave(String nuevaClave) {
        this.nuevaClave = nuevaClave;
    }
}