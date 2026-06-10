package com.infinityforce.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Document(collection = "usuarios")
public class Usuario {

    @Id
    private String id;

    @NotBlank(message = "Los nombres son obligatorios")
    @Pattern(regexp = "^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$", message = "Los nombres solo pueden contener letras")
    private String nombres;

    @NotBlank(message = "Los apellidos son obligatorios")
    @Pattern(regexp = "^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$", message = "Los apellidos solo pueden contener letras")
    private String apellidos;

    @NotBlank(message = "El DNI es obligatorio")
    @Size(min = 8, max = 8, message = "El DNI debe tener exactamente 8 dígitos")
    @Pattern(regexp = "\\d+", message = "El DNI solo debe contener números")
    @Field("DNI")
    private String dni;

    @Field("codigoAcceso")
    private String codigoAcceso;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    @Field("contrasena")
    private String contrasena;

    private String sede;
    private String rol;
    private String fechaCreacion;
    private Integer totalAsistencias;
    private String estadoMembresia;

    // ─── Campos biométricos estáticos ────────────────────────────────────────
    private String sexo;
    private Date fechaNacimiento;
    private Double estaturaCm;

    // ─── Historial biométrico (Bucket Pattern) ───────────────────────────────
    private List<RegistroBiometrico> historialBiometrico = new ArrayList<>();

    // ─── Clase anidada: un registro del historial ────────────────────────────
    public static class RegistroBiometrico {
        private Date fechaRegistro;
        private Double pesoKg;
        private String objetivo;       // Volumen, Definición, Mantenimiento
        private String nivelActividad; // Sedentario, Ligero, Moderado, Intenso
        private Double imcCalculado;
        private Double caloriasRecomendadas;
        private Double proteinasG;
        private Double carbohidratosG;
        private Double grasasG;

        public Date getFechaRegistro() { return fechaRegistro; }
        public void setFechaRegistro(Date fechaRegistro) { this.fechaRegistro = fechaRegistro; }

        public Double getPesoKg() { return pesoKg; }
        public void setPesoKg(Double pesoKg) { this.pesoKg = pesoKg; }

        public String getObjetivo() { return objetivo; }
        public void setObjetivo(String objetivo) { this.objetivo = objetivo; }

        public String getNivelActividad() { return nivelActividad; }
        public void setNivelActividad(String nivelActividad) { this.nivelActividad = nivelActividad; }

        public Double getImcCalculado() { return imcCalculado; }
        public void setImcCalculado(Double imcCalculado) { this.imcCalculado = imcCalculado; }

        public Double getCaloriasRecomendadas() { return caloriasRecomendadas; }
        public void setCaloriasRecomendadas(Double caloriasRecomendadas) { this.caloriasRecomendadas = caloriasRecomendadas; }

        public Double getProteinasG() { return proteinasG; }
        public void setProteinasG(Double proteinasG) { this.proteinasG = proteinasG; }

        public Double getCarbohidratosG() { return carbohidratosG; }
        public void setCarbohidratosG(Double carbohidratosG) { this.carbohidratosG = carbohidratosG; }

        public Double getGrasasG() { return grasasG; }
        public void setGrasasG(Double grasasG) { this.grasasG = grasasG; }
    }

    // ─── Getters y Setters ───────────────────────────────────────────────────

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getNombres() { return nombres; }
    public void setNombres(String nombres) { this.nombres = nombres; }

    public String getApellidos() { return apellidos; }
    public void setApellidos(String apellidos) { this.apellidos = apellidos; }

    public String getDni() { return dni; }
    public void setDni(String dni) { this.dni = dni; }

    public String getCodigoAcceso() { return codigoAcceso; }
    public void setCodigoAcceso(String codigoAcceso) { this.codigoAcceso = codigoAcceso; }

    public String getContrasena() { return contrasena; }
    public void setContrasena(String contrasena) { this.contrasena = contrasena; }

    public String getSede() { return sede; }
    public void setSede(String sede) { this.sede = sede; }

    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }

    public String getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(String fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public Integer getTotalAsistencias() { return totalAsistencias; }
    public void setTotalAsistencias(Integer totalAsistencias) { this.totalAsistencias = totalAsistencias; }

    public String getEstadoMembresia() { return estadoMembresia; }
    public void setEstadoMembresia(String estadoMembresia) { this.estadoMembresia = estadoMembresia; }

    public String getSexo() { return sexo; }
    public void setSexo(String sexo) { this.sexo = sexo; }

    public Date getFechaNacimiento() { return fechaNacimiento; }
    public void setFechaNacimiento(Date fechaNacimiento) { this.fechaNacimiento = fechaNacimiento; }

    public Double getEstaturaCm() { return estaturaCm; }
    public void setEstaturaCm(Double estaturaCm) { this.estaturaCm = estaturaCm; }

    public List<RegistroBiometrico> getHistorialBiometrico() { return historialBiometrico; }
    public void setHistorialBiometrico(List<RegistroBiometrico> historialBiometrico) { this.historialBiometrico = historialBiometrico; }
}
