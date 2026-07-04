package com.infinityforce.backend.dto;

import jakarta.validation.constraints.*;

public class PasswordChangeDTO {

    @NotBlank(message = "Debes ingresar tu clave actual")
    private String claveActual;

    @NotBlank(message = "La nueva clave no puede estar vacía")
    @Size(min = 8, message = "La nueva clave debe tener mínimo 8 caracteres")
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=\\S+$).{8,}$", 
             message = "La clave debe contener al menos un número, una mayúscula y una minúscula")
    private String nuevaClave;

    @NotBlank(message = "Debes confirmar la nueva clave")
    private String confirmarNuevaClave;

    public PasswordChangeDTO() {}

    public String getClaveActual() { return claveActual; }
    public void setClaveActual(String claveActual) { this.claveActual = claveActual; }

    public String getNuevaClave() { return nuevaClave; }
    public void setNuevaClave(String nuevaClave) { this.nuevaClave = nuevaClave; }

    public String getConfirmarNuevaClave() { return confirmarNuevaClave; }
    public void setConfirmarNuevaClave(String confirmarNuevaClave) { this.confirmarNuevaClave = confirmarNuevaClave; }
}