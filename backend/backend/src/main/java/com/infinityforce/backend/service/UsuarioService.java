package com.infinityforce.backend.service;

import com.infinityforce.backend.model.Usuario;
import com.infinityforce.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Servicio que centraliza toda la lógica de negocio relacionada con usuarios.
 * El controlador UsuarioController solo despacha peticiones HTTP y delega aquí.
 */
@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private JwtService jwtService;

    /**
     * Autentica a un usuario y devuelve un mapa con el token JWT y los datos básicos.
     * Si las credenciales no son válidas, devuelve un mapa con exito=false.
     *
     * @param credenciales Mapa con los campos "codigo" y "contrasena".
     * @return Mapa de respuesta con el resultado del login.
     */
    public Map<String, Object> login(Map<String, String> credenciales) {
        Map<String, Object> respuesta = new HashMap<>();

        String codigo    = credenciales.get("codigo");
        String contrasena = credenciales.get("contrasena");

        System.out.println(">>> [UsuarioService] Intentando login - Código: [" + codigo + "]");

        Optional<Usuario> usuarioOpt =
                usuarioRepository.findByCodigoAccesoAndContrasena(codigo, contrasena);

        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            String token   = jwtService.generarToken(usuario);
            String rol     = (usuario.getRol() != null) ? usuario.getRol() : "cliente";

            System.out.println(">>> [UsuarioService] Login exitoso para: " + usuario.getNombres());

            respuesta.put("exito", true);
            respuesta.put("nombres", usuario.getNombres());
            respuesta.put("id", usuario.getId());
            respuesta.put("rol", rol);
            respuesta.put("token", token);
        } else {
            System.out.println(">>> [UsuarioService] Credenciales inválidas.");
            respuesta.put("exito", false);
            respuesta.put("mensaje", "Código de acceso o contraseña incorrectos.");
        }

        return respuesta;
    }

    /**
     * Registra un nuevo usuario, validando que el DNI y el código de acceso no existan.
     *
     * @param nuevoUsuario El objeto Usuario a persistir.
     * @return Mapa de respuesta con el resultado del registro.
     */
    public Map<String, Object> registrarUsuario(Usuario nuevoUsuario) {
        Map<String, Object> respuesta = new HashMap<>();

        Optional<Usuario> existeUsuario = usuarioRepository.findByDniOrCodigoAcceso(
                nuevoUsuario.getDni(), nuevoUsuario.getCodigoAcceso());

        if (existeUsuario.isPresent()) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "El DNI o Código de Acceso ya está registrado.");
            return respuesta;
        }

        nuevoUsuario.setFechaCreacion(Instant.now().toString());

        if ("cliente".equals(nuevoUsuario.getRol()) || nuevoUsuario.getRol() == null) {
            nuevoUsuario.setRol("cliente");
            nuevoUsuario.setTotalAsistencias(0);
            nuevoUsuario.setEstadoMembresia("Activa");
        }

        Usuario guardado = usuarioRepository.save(nuevoUsuario);
        System.out.println(">>> [UsuarioService] Nuevo usuario registrado: " + guardado.getNombres());

        respuesta.put("exito", true);
        respuesta.put("mensaje", "Usuario registrado correctamente.");
        respuesta.put("id", guardado.getId());

        return respuesta;
    }

    /**
     * Devuelve la lista completa de usuarios registrados.
     *
     * @return Lista de usuarios.
     */
    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    /**
     * Cambia la contraseña de un usuario autenticado, validando la contraseña actual.
     *
     * @param idUsuario  ID del usuario extraído del token JWT.
     * @param claveActual Contraseña actual proporcionada por el usuario.
     * @param nuevaClave  Nueva contraseña deseada.
     * @return Mapa de respuesta con el resultado de la operación.
     */
    public Map<String, Object> cambiarPassword(String idUsuario, String claveActual, String nuevaClave) {
        Map<String, Object> respuesta = new HashMap<>();

        Optional<Usuario> usuarioOpt = usuarioRepository.findById(idUsuario);

        if (usuarioOpt.isEmpty()) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "Usuario no encontrado en la base de datos.");
            return respuesta;
        }

        Usuario usuario = usuarioOpt.get();

        if (!usuario.getContrasena().equals(claveActual)) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "La contraseña actual es incorrecta.");
            return respuesta;
        }

        usuario.setContrasena(nuevaClave);
        usuarioRepository.save(usuario);

        respuesta.put("exito", true);
        respuesta.put("mensaje", "Tu contraseña se ha actualizado correctamente.");

        return respuesta;
    }
}
