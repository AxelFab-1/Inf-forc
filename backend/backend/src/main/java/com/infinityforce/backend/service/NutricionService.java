package com.infinityforce.backend.service;

import com.infinityforce.backend.dto.NutricionRequestDTO;
import com.infinityforce.backend.model.Usuario;
import com.infinityforce.backend.model.Usuario.RegistroBiometrico;
import com.infinityforce.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class NutricionService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    public Map<String, Object> obtenerPerfil(String clienteId) {
        Map<String, Object> respuesta = new HashMap<>();
        Optional<Usuario> opt = usuarioRepository.findById(clienteId);

        if (opt.isEmpty()) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "Usuario no encontrado.");
            return respuesta;
        }

        Usuario u = opt.get();
        respuesta.put("exito", true);
        respuesta.put("sexo", u.getSexo());
        respuesta.put("fechaNacimiento", u.getFechaNacimiento());
        respuesta.put("estaturaCm", u.getEstaturaCm());

        List<RegistroBiometrico> historial = u.getHistorialBiometrico();
        if (historial != null && !historial.isEmpty()) {
            respuesta.put("ultimoRegistro", historial.get(historial.size() - 1));
        } else {
            respuesta.put("ultimoRegistro", null);
        }

        return respuesta;
    }

    public Map<String, Object> registrarBiometrico(String clienteId, NutricionRequestDTO datos) {
        Map<String, Object> respuesta = new HashMap<>();
        Optional<Usuario> opt = usuarioRepository.findById(clienteId);

        if (opt.isEmpty()) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "Usuario no encontrado.");
            return respuesta;
        }

        Usuario u = opt.get();

        boolean esPrimeraVez = (u.getEstaturaCm() == null || u.getFechaNacimiento() == null);

        if (esPrimeraVez) {
            u.setSexo(datos.getSexo());
            u.setEstaturaCm(datos.getEstaturaCm());

            String fechaStr = datos.getFechaNacimiento();
            if (fechaStr != null) {
                try {
                    java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM-dd");
                    u.setFechaNacimiento(sdf.parse(fechaStr));
                } catch (Exception e) {
                    respuesta.put("exito", false);
                    respuesta.put("mensaje", "Formato de fecha inválido. Use yyyy-MM-dd.");
                    return respuesta;
                }
            }
        }

        Double pesoKg        = datos.getPesoKg();
        String nivelActividad = datos.getNivelActividad();
        String objetivo       = datos.getObjetivo();

        int edadAnios = calcularEdad(u.getFechaNacimiento());

        double estaturaMt = u.getEstaturaCm() / 100.0;
        double imc = pesoKg / (estaturaMt * estaturaMt);

        double tmb;
        if ("masculino".equalsIgnoreCase(u.getSexo())) {
            tmb = (10 * pesoKg) + (6.25 * u.getEstaturaCm()) - (5 * edadAnios) + 5;
        } else {
            tmb = (10 * pesoKg) + (6.25 * u.getEstaturaCm()) - (5 * edadAnios) - 161;
        }

        double factor = switch (nivelActividad.toLowerCase()) {
            case "ligero"   -> 1.375;
            case "moderado" -> 1.55;
            case "intenso"  -> 1.725;
            default         -> 1.2; 
        };

        double caloriasMantenimiento = tmb * factor;

        double caloriasFinales = switch (objetivo.toLowerCase()) {
            case "volumen"    -> caloriasMantenimiento + 300;
            case "definición",
                 "definicion" -> caloriasMantenimiento - 300;
            default           -> caloriasMantenimiento; 
        };

        double proteinasG     = (caloriasFinales * 0.30) / 4.0;
        double carbohidratosG = (caloriasFinales * 0.45) / 4.0;
        double grasasG        = (caloriasFinales * 0.25) / 9.0;

        RegistroBiometrico registro = new RegistroBiometrico();
        registro.setFechaRegistro(new Date());
        registro.setPesoKg(round2(pesoKg));
        registro.setObjetivo(objetivo);
        registro.setNivelActividad(nivelActividad);
        registro.setImcCalculado(round2(imc));
        registro.setCaloriasRecomendadas(round2(caloriasFinales));
        registro.setProteinasG(round2(proteinasG));
        registro.setCarbohidratosG(round2(carbohidratosG));
        registro.setGrasasG(round2(grasasG));

        if (u.getHistorialBiometrico() == null) {
            u.setHistorialBiometrico(new ArrayList<>());
        }
        u.getHistorialBiometrico().add(registro);

        usuarioRepository.save(u);

        respuesta.put("exito", true);
        respuesta.put("mensaje", esPrimeraVez ? "Perfil biométrico creado." : "Registro actualizado.");
        respuesta.put("ultimoRegistro", registro);
        return respuesta;
    }

    private int calcularEdad(Date fechaNacimiento) {
        if (fechaNacimiento == null) return 25; 
        Calendar nacimiento = Calendar.getInstance();
        nacimiento.setTime(fechaNacimiento);
        Calendar hoy = Calendar.getInstance();
        int edad = hoy.get(Calendar.YEAR) - nacimiento.get(Calendar.YEAR);
        if (hoy.get(Calendar.DAY_OF_YEAR) < nacimiento.get(Calendar.DAY_OF_YEAR)) edad--;
        return edad;
    }

    private double round2(double val) {
        return Math.round(val * 100.0) / 100.0;
    }
}