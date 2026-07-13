package com.infinityforce.backend.dto;

import java.util.List;

public class AnalisisNutricionalDTO {

    private List<AlimentoDetectado> alimentos;
    private double caloriasTotal;
    private double proteinasTotal;
    private double carbohidratosTotal;
    private double grasasTotal;
    private String notaConfianza;

    public List<AlimentoDetectado> getAlimentos() {
        return alimentos;
    }

    public void setAlimentos(List<AlimentoDetectado> alimentos) {
        this.alimentos = alimentos;
    }

    public double getCaloriasTotal() {
        return caloriasTotal;
    }

    public void setCaloriasTotal(double caloriasTotal) {
        this.caloriasTotal = caloriasTotal;
    }

    public double getProteinasTotal() {
        return proteinasTotal;
    }

    public void setProteinasTotal(double proteinasTotal) {
        this.proteinasTotal = proteinasTotal;
    }

    public double getCarbohidratosTotal() {
        return carbohidratosTotal;
    }

    public void setCarbohidratosTotal(double carbohidratosTotal) {
        this.carbohidratosTotal = carbohidratosTotal;
    }

    public double getGrasasTotal() {
        return grasasTotal;
    }

    public void setGrasasTotal(double grasasTotal) {
        this.grasasTotal = grasasTotal;
    }

    public String getNotaConfianza() {
        return notaConfianza;
    }

    public void setNotaConfianza(String notaConfianza) {
        this.notaConfianza = notaConfianza;
    }

    public static class AlimentoDetectado {
        private String nombre;
        private double gramosEstimados;
        private double calorias;
        private double proteinas;
        private double carbohidratos;
        private double grasas;

        public String getNombre() {
            return nombre;
        }

        public void setNombre(String nombre) {
            this.nombre = nombre;
        }

        public double getGramosEstimados() {
            return gramosEstimados;
        }

        public void setGramosEstimados(double gramosEstimados) {
            this.gramosEstimados = gramosEstimados;
        }

        public double getCalorias() {
            return calorias;
        }

        public void setCalorias(double calorias) {
            this.calorias = calorias;
        }

        public double getProteinas() {
            return proteinas;
        }

        public void setProteinas(double proteinas) {
            this.proteinas = proteinas;
        }

        public double getCarbohidratos() {
            return carbohidratos;
        }

        public void setCarbohidratos(double carbohidratos) {
            this.carbohidratos = carbohidratos;
        }

        public double getGrasas() {
            return grasas;
        }

        public void setGrasas(double grasas) {
            this.grasas = grasas;
        }
    }
}