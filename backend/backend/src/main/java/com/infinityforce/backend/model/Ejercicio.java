package com.infinityforce.backend.model;
    
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.fasterxml.jackson.annotation.JsonProperty;

@Document(collection = "ejercicios")
public class Ejercicio {

    @Id
    @JsonProperty("_id") 
    private String id;
    
    private String nombre;
    private String grupoMuscular;
    private String subGrupo;     
    private String tipo; 
    private String categoria;   
    private Integer series;     
    private String repeticiones; 

    // Soporte multimedia
    private String imagenUrl;    
    private String videoUrl;     

    // true = ejercicio de peso corporal (dominadas, fondos, etc.)
    // En ese caso no se requiere registrar el peso en la sesion
    private boolean pesoCorporal;
           
    public Ejercicio() {}

   

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    
    public String getGrupoMuscular() { return grupoMuscular; }
    public void setGrupoMuscular(String grupoMuscular) { this.grupoMuscular = grupoMuscular; }
    
    public String getSubGrupo() { return subGrupo; }
    public void setSubGrupo(String subGrupo) { this.subGrupo = subGrupo; }
    
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    
    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }
    
    public Integer getSeries() { return series; }
    public void setSeries(Integer series) { this.series = series; }
    
    public String getRepeticiones() { return repeticiones; }
    public void setRepeticiones(String repeticiones) { this.repeticiones = repeticiones; }

    public String getImagenUrl() { return imagenUrl; }
    public void setImagenUrl(String imagenUrl) { this.imagenUrl = imagenUrl; }

    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }

    public boolean isPesoCorporal() { return pesoCorporal; }
    public void setPesoCorporal(boolean pesoCorporal) { this.pesoCorporal = pesoCorporal; }
}