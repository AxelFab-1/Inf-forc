package com.infinityforce.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

/**
 * Documento MongoDB que implementa el Bucket Pattern para asistencias.
 * Colección: asistencias
 *
 * Un solo documento agrupa TODOS los días entrenados por un socio en un mes concreto.
 * El _id tiene el formato: ast_{clienteId}_{año}_{mes}
 * Esto permite hacer un fetch ultrarrápido del calendario mensual con una sola consulta.
 */
@Document(collection = "asistencias")
public class Asistencia {

    /**
     * ID único con formato determinístico: "ast_{clienteId}_{año}_{mes}".
     * Ejemplo: "ast_user123_2026_6"
     * Usar un ID predecible permite hacer upsert directo sin búsqueda previa.
     */
    @Id
    private String id;

    /** ID del socio dueño de este bucket mensual. */
    private String clienteId;

    /** Año del bucket (ej: 2026). */
    private int anio;

    /**
     * Mes del bucket (1-12, NO 0-based).
     * Se usa 1-based para mayor legibilidad en la base de datos.
     */
    private int mes;

    /**
     * Lista de registros de asistencia del mes.
     * Cada registro indica el día (1-31) y el ID de la sesión de entrenamiento.
     * Se guarda el sesionId para poder navegar al detalle desde el historial.
     */
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

    // ─── Clase interna: un registro de asistencia ────────────────────────────

    /**
     * Registro individual de asistencia dentro del bucket mensual.
     * No es un @Document separado — es un subdocumento embebido.
     */
    public static class RegistroAsistencia {

        /** Día del mes (1-31). */
        private int dia;

        /**
         * ID de la sesión de entrenamiento asociada a este día.
         * Permite recuperar todos los detalles del entrenamiento con un segundo fetch.
         */
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
