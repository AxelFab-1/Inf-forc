package com.infinityforce.backend.service;

import com.infinityforce.backend.model.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

/**
 * Servicio centralizado para la gestión de JSON Web Tokens (JWT).
 * La clave secreta se lee desde application.properties para evitar
 * que esté hardcodeada en el código fuente.
 */
@Service
public class JwtService {

    @Value("${app.jwt.secret}")
    private String secretKeyString;

    @Value("${app.jwt.expiration}")
    private long expirationMs;

    /**
     * Construye la clave de firma HMAC-SHA256 a partir de la clave configurada.
     */
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secretKeyString.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Genera un token JWT firmado para el usuario indicado.
     *
     * @param usuario El usuario autenticado.
     * @return El token JWT como String.
     */
    public String generarToken(Usuario usuario) {
        String rol = (usuario.getRol() != null) ? usuario.getRol() : "cliente";

        return Jwts.builder()
                .setSubject(usuario.getId())
                .claim("id", usuario.getId())
                .claim("nombres", usuario.getNombres())
                .claim("codigo", usuario.getCodigoAcceso())
                .claim("rol", rol)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Valida un token JWT y devuelve sus claims si es correcto.
     * Lanza una excepción de jjwt si el token es inválido o ha expirado.
     *
     * @param token El token JWT a validar.
     * @return Los claims del token.
     */
    public Claims validarToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Extrae el ID de usuario (subject) de un token JWT ya validado.
     *
     * @param token El token JWT.
     * @return El ID del usuario como String.
     */
    public String extraerUserId(String token) {
        return validarToken(token).getSubject();
    }
}
