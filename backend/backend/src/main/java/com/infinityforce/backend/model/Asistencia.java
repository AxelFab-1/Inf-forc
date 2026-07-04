package com.infinityforce.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "asistencias")
public class Asistencia {


    @Id
    private String id;

    private String clienteId;

    private int anio;


    private int mes;


    private List<RegistroAsistencia> registros = new ArrayList<>();

    public Asistencia() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getClienteId() { return clienteId; }
    public void setClienteId(String clienteId) { this.clienteId = clienteId; }

    public int getAnio() { return anio; }
    public void setAnio(int anio) { this.anio = anio; }

    public int getMes() { return mes; }
    public void setMes(int mes) { this.mes = mes; }

    public List<RegistroAsistencia> getRegistros() { return registros; }
    public void setRegistros(List<RegistroAsistencia> registros) { this.registros = registros; }


    public static class RegistroAsistencia {

        private int dia;


        private String sesionId;

        public RegistroAsistencia() {}

        public RegistroAsistencia(int dia, String sesionId) {
            this.dia = dia;
            this.sesionId = sesionId;
        }

        public int getDia() { return dia; }
        public void setDia(int dia) { this.dia = dia; }

        public String getSesionId() { return sesionId; }
        public void setSesionId(String sesionId) { this.sesionId = sesionId; }
    }
}
