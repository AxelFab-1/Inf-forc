package com.infinityforce.backend.service;

import com.infinityforce.backend.model.Usuario;
import com.infinityforce.backend.repository.UsuarioRepository;
import com.infinityforce.backend.dto.PasswordChangeDTO;
import com.infinityforce.backend.dto.UsuarioUpdateDTO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private JwtService jwtService;

    public Map<String, Object> login(Map<String, String> credenciales) {
        Map<String, Object> respuesta = new HashMap<>();

        String codigo = credenciales.get("codigo");
        String contrasena = credenciales.get("contrasena");

        Optional<Usuario> usuarioOpt =
                usuarioRepository.findByCodigoAccesoAndContrasena(codigo, contrasena);

        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            String token = jwtService.generarToken(usuario);
            String rol = (usuario.getRol() != null) ? usuario.getRol() : "cliente";

            respuesta.put("exito", true);
            respuesta.put("nombres", usuario.getNombres());
            respuesta.put("id", usuario.getId());
            respuesta.put("rol", rol);
            respuesta.put("token", token);
        } else {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "Código de acceso o contraseña incorrectos.");
        }

        return respuesta;
    }

    public Map<String, Object> registrarUsuario(Usuario nuevoUsuario) {
        Map<String, Object> respuesta = new HashMap<>();

        // MEJORA: 1. Validar que el DNI no sea duplicado
        if (usuarioRepository.existsByDni(nuevoUsuario.getDni())) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "El DNI ingresado ya se encuentra registrado en el sistema.");
            return respuesta;
        }

        // MEJORA: 2. Validar que el código de acceso no sea duplicado
        if (usuarioRepository.existsByCodigoAcceso(nuevoUsuario.getCodigoAcceso())) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "El código de acceso ya está en uso. Por favor, ingresa uno distinto.");
            return respuesta;
        }

        nuevoUsuario.setFechaCreacion(Instant.now().toString());

        if ("cliente".equals(nuevoUsuario.getRol()) || nuevoUsuario.getRol() == null) {
            nuevoUsuario.setRol("cliente");
            nuevoUsuario.setTotalAsistencias(0);
            nuevoUsuario.setEstadoMembresia("Activa");
        }

        Usuario guardado = usuarioRepository.save(nuevoUsuario);

        respuesta.put("exito", true);
        respuesta.put("mensaje", "Usuario registrado correctamente.");
        respuesta.put("id", guardado.getId());

        return respuesta;
    }

    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    /**
     * Cambio de contraseña utilizando el DTO para mayor seguridad y validación.
     */
    public Map<String, Object> cambiarPassword(String idUsuario, PasswordChangeDTO dto) {
        Map<String, Object> respuesta = new HashMap<>();

        // 1. Validar coincidencia de nuevas contraseñas
        if (!dto.getNuevaClave().equals(dto.getConfirmarNuevaClave())) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "La nueva contraseña y la confirmación no coinciden.");
            return respuesta;
        }

        // 2. Buscar usuario
        Optional<Usuario> usuarioOpt = usuarioRepository.findById(idUsuario);
        if (usuarioOpt.isEmpty()) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "Usuario no encontrado.");
            return respuesta;
        }

        Usuario usuario = usuarioOpt.get();

        // 3. Validar contraseña actual
        if (!usuario.getContrasena().equals(dto.getClaveActual())) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "La contraseña actual es incorrecta.");
            return respuesta;
        }

        // 4. Actualizar
        usuario.setContrasena(dto.getNuevaClave());
        usuarioRepository.save(usuario);

        respuesta.put("exito", true);
        respuesta.put("mensaje", "Tu contraseña se ha actualizado correctamente.");

        return respuesta;
    }

    public Map<String, Object> actualizarUsuario(String id, UsuarioUpdateDTO datosActualizados) {
        Map<String, Object> respuesta = new HashMap<>();
        Optional<Usuario> usuarioOpt = usuarioRepository.findById(id);

        if (usuarioOpt.isEmpty()) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "Usuario no encontrado.");
            return respuesta;
        }

        Usuario usuario = usuarioOpt.get();

        // Actualizamos solo los campos que el DTO permite
        if (datosActualizados.getNombres() != null) {
            usuario.setNombres(datosActualizados.getNombres());
        }
        if (datosActualizados.getApellidos() != null) {
            usuario.setApellidos(datosActualizados.getApellidos());
        }

        usuarioRepository.save(usuario);

        respuesta.put("exito", true);
        respuesta.put("mensaje", "Usuario actualizado correctamente.");
        return respuesta;
    }
}