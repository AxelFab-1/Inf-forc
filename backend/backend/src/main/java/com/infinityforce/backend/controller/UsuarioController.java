package com.infinityforce.backend.controller;

import com.infinityforce.backend.dto.PasswordChangeDTO;
import com.infinityforce.backend.model.Usuario;
import com.infinityforce.backend.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult; 
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
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
    public ResponseEntity<Map<String, Object>> registrarUsuario(@Valid @RequestBody Usuario nuevoUsuario, BindingResult result) {
        Map<String, Object> respuesta = new HashMap<>();

        if (result.hasErrors()) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", result.getFieldError().getDefaultMessage());
            return ResponseEntity.badRequest().body(respuesta); 
        }

        respuesta = usuarioService.registrarUsuario(nuevoUsuario);

        if (Boolean.TRUE.equals(respuesta.get("exito"))) {
            return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(respuesta);
    }

    @GetMapping("/usuarios")
    public ResponseEntity<Map<String, Object>> listarUsuarios() {

        Map<String, Object> respuesta = new HashMap<>();
        try {
            respuesta.put("exito", true);
            respuesta.put("datos", usuarioService.listarUsuarios());
            return ResponseEntity.ok(respuesta);
        } catch (Exception e) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "Error al obtener la lista de usuarios.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(respuesta);
        }
    }

    @PutMapping("/usuarios/cambiar-password")
    public ResponseEntity<Map<String, Object>> cambiarPassword(
            @Valid @RequestBody PasswordChangeDTO dto,
            Principal principal) {

        Map<String, Object> respuesta = new HashMap<>();

        if (principal == null) {
            respuesta.put("exito", false);
            respuesta.put("mensaje", "No estás autorizado para realizar esta acción.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(respuesta);
        }

        respuesta = usuarioService.cambiarPassword(
                principal.getName(),
                dto.getClaveActual(),
                dto.getNuevaClave());

        if (Boolean.TRUE.equals(respuesta.get("exito"))) {
            return ResponseEntity.ok(respuesta);
        }

        String mensaje = (String) respuesta.get("mensaje");
        HttpStatus status = (mensaje != null && mensaje.contains("no encontrado"))
                ? HttpStatus.NOT_FOUND
                : HttpStatus.UNAUTHORIZED;

        return ResponseEntity.status(status).body(respuesta);
    }
}