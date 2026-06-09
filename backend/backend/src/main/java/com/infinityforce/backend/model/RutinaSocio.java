package com.infinityforce.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.Map;

@Document(collection = "rutinas_socios")
public class RutinaSocio {

    @Id
    @JsonProperty("_id")
    private String id;

    private String clienteId;
    
  
    private String nombreOriginal;
    
    private String estado;
    
    private String fechaAsignacion;
    
    private List<Map<String, Object>> dias;

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

    public List<Map<String, Object>> getDias() { return dias; }
    public void setDias(List<Map<String, Object>> dias) { this.dias = dias; }
}
