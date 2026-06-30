package com.infinityforce.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.Map;

@Document(collection = "plantillas_rutinas")
public class Plantilla {

    @Id
    @JsonProperty("_id") 
    private String id;
    
    private String nombre;
    private String descripcion;
    private String tipo; 
    private List<Map<String, Object>> dias;

    public Plantilla() {}

    
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public List<Map<String, Object>> getDias() { return dias; }
    public void setDias(List<Map<String, Object>> dias) { this.dias = dias; }
}
