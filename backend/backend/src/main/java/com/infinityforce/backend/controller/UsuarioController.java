package com.infinityforce.backend.controller;

import com.infinityforce.backend.dto.PasswordChangeDTO;
import com.infinityforce.backend.dto.UsuarioUpdateDTO;
import com.infinityforce.backend.model.Usuario;
import com.infinityforce.backend.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> credenciales) {
        Map<String, Object> respuesta = usuarioService.login(credenciales);
        if (Boolean.TRUE.equals(respuesta.get("exito"))) {
            return ResponseEntity.ok(respuesta);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(respuesta);
    }

    @PostMapping("/usuarios")
    public ResponseEntity<Map<String, Object>> registrarUsuario(@Valid @RequestBody Usuario nuevoUsuario) {
        Map<String, Object> respuesta = usuarioService.registrarUsuario(nuevoUsuario);
        if (Boolean.TRUE.equals(respuesta.get("exito"))) {
            return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(respuesta);
    }

    @GetMapping("/usuarios")
    public ResponseEntity<Map<String, Object>> listarUsuarios() {
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("exito", true);
        respuesta.put("datos", usuarioService.listarUsuarios());
        return ResponseEntity.ok(respuesta);
    }

    @PutMapping("/usuarios/cambiar-password")
    public ResponseEntity<Map<String, Object>> cambiarPassword(
            @Valid @RequestBody PasswordChangeDTO dto, 
            Principal principal) {

        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("exito", false, "mensaje", "No autorizado."));
        }

        Map<String, Object> respuesta = usuarioService.cambiarPassword(principal.getName(), dto);
        if (Boolean.TRUE.equals(respuesta.get("exito"))) {
            return ResponseEntity.ok(respuesta);
        }
        
        String mensaje = (String) respuesta.get("mensaje");
        HttpStatus status = (mensaje != null && mensaje.contains("no encontrado")) 
                            ? HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(respuesta);
    }

    @PutMapping("/usuarios/{id}")
    public ResponseEntity<Map<String, Object>> actualizarUsuario(
            @PathVariable String id,
            @Valid @RequestBody UsuarioUpdateDTO datosActualizados) { 

        Map<String, Object> respuesta = usuarioService.actualizarUsuario(id, datosActualizados);
        if (Boolean.TRUE.equals(respuesta.get("exito"))) {
            return ResponseEntity.ok(respuesta);
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(respuesta);
    }

    @GetMapping("/usuarios/me")
    public ResponseEntity<Map<String, Object>> obtenerMiPerfil(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("exito", false, "mensaje", "No autorizado."));
        }
        Map<String, Object> respuesta = usuarioService.obtenerPerfil(principal.getName());
        if (Boolean.TRUE.equals(respuesta.get("exito"))) {
            return ResponseEntity.ok(respuesta);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(respuesta);
    }

    @PostMapping(value = "/usuarios/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> subirAvatar(
            Principal principal,
            @RequestPart("imagen") MultipartFile imagen) {
        
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("exito", false, "mensaje", "No autorizado."));
        }

        Map<String, Object> respuesta = usuarioService.subirAvatar(principal.getName(), imagen);
        if (Boolean.TRUE.equals(respuesta.get("exito"))) {
            return ResponseEntity.ok(respuesta);
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(respuesta);
    }
}