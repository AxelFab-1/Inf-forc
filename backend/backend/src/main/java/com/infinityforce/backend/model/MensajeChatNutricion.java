package com.infinityforce.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Date;

@Document(collection = "chat_nutricion")
public class MensajeChatNutricion {

    @Id
    @JsonProperty("_id")
    private String id;

    private String clienteId;

    // "usuario" o "modelo"
    private String rol;

    private String contenido;

    private boolean tuvoImagen;

    private Date fecha;

    public MensajeChatNutricion() {
    }

    public MensajeChatNutricion(String clienteId, String rol, String contenido, boolean tuvoImagen) {
        this.clienteId = clienteId;
        this.rol = rol;
        this.contenido = contenido;
        this.tuvoImagen = tuvoImagen;
        this.fecha = new Date();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getClienteId() {
        return clienteId;
    }

    public void setClienteId(String clienteId) {
        this.clienteId = clienteId;
    }

    public String getRol() {
        return rol;
    }

    public void setRol(String rol) {
        this.rol = rol;
    }

    public String getContenido() {
        return contenido;
    }

    public void setContenido(String contenido) {
        this.contenido = contenido;
    }

    public boolean isTuvoImagen() {
        return tuvoImagen;
    }

    public void setTuvoImagen(boolean tuvoImagen) {
        this.tuvoImagen = tuvoImagen;
    }

    public Date getFecha() {
        return fecha;
    }

    public void setFecha(Date fecha) {
        this.fecha = fecha;
    }
}