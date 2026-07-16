package com.infinityforce.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Document(collection = "usuarios")
public class Usuario {

    @Id
    private String id;

    @NotBlank(message = "Los nombres son obligatorios")
    @Size(min = 2, max = 50)
    @Pattern(regexp = "^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$", message = "Los nombres solo pueden contener letras")
    private String nombres;

    @NotBlank(message = "Los apellidos son obligatorios")
    @Size(min = 2, max = 50)
    @Pattern(regexp = "^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$", message = "Los apellidos solo pueden contener letras")
    private String apellidos;

    @NotBlank(message = "El DNI es obligatorio")
    @Size(min = 8, max = 8, message = "El DNI debe tener 8 dígitos")
    @Pattern(regexp = "\\d+", message = "El DNI debe ser numérico")
    @Field("DNI")
    private String dni;

    @NotBlank(message = "El código de acceso es obligatorio")
    @Pattern(regexp = "^\\d{5}$", message = "El código debe ser de 5 dígitos")
    @Field("codigoAcceso")
    private String codigoAcceso;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 8, max = 64)
    @Field("contrasena")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String contrasena;

    @NotBlank(message = "La sede es obligatoria")
    private String sede;

    @Pattern(regexp = "^(cliente|administrador)$", message = "Rol inválido")
    private String rol;

    private String fechaCreacion;
    
    @Min(0)
    private Integer totalAsistencias;
    
    @Pattern(regexp = "^(Activa|Inactiva|Suspendida)$", message = "Estado inválido")
    private String estadoMembresia;

    private String perfilImagenUrl;


    
    @Pattern(regexp = "^(M|F)$", message = "Sexo debe ser M o F")
    private String sexo;
    
    @Past(message = "La fecha de nacimiento no puede ser una fecha futura")
    private Date fechaNacimiento;
    
    @Positive @Min(50) @Max(250)
    private Double estaturaCm;

    @Valid
    private List<RegistroBiometrico> historialBiometrico = new ArrayList<>();

    public static class RegistroBiometrico {
        
        private Date fechaRegistro;
        
        @Positive @Min(30)
        private Double pesoKg;
        
        @Pattern(regexp = "^(Volumen|Definicion|Mantenimiento)$", message = "Objetivo no reconocido")
        private String objetivo;
        
        @Pattern(regexp = "^(Sedentario|Ligero|Moderado|Intenso)$", message = "Nivel de actividad inválido")
        private String nivelActividad;
        
        @Positive private Double imcCalculado;
        @Positive private Double caloriasRecomendadas;
        @Positive private Double proteinasG;
        @Positive private Double carbohidratosG;
        @Positive private Double grasasG;

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

    public String getPerfilImagenUrl() { return perfilImagenUrl; }
    public void setPerfilImagenUrl(String perfilImagenUrl) { this.perfilImagenUrl = perfilImagenUrl; }

    public String getSexo() { return sexo; }
    public void setSexo(String sexo) { this.sexo = sexo; }

    public Date getFechaNacimiento() { return fechaNacimiento; }
    public void setFechaNacimiento(Date fechaNacimiento) { this.fechaNacimiento = fechaNacimiento; }

    public Double getEstaturaCm() { return estaturaCm; }
    public void setEstaturaCm(Double estaturaCm) { this.estaturaCm = estaturaCm; }

    public List<RegistroBiometrico> getHistorialBiometrico() { return historialBiometrico; }
    public void setHistorialBiometrico(List<RegistroBiometrico> historialBiometrico) { this.historialBiometrico = historialBiometrico; }
}
