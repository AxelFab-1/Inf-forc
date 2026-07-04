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


@Service
public class JwtService {

    @Value("${app.jwt.secret}")
    private String secretKeyString;

    @Value("${app.jwt.expiration}")
    private long expirationMs;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secretKeyString.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * @param usuario 
     * @return 
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
     * @param token 
     * @return 
     */
    public Claims validarToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * @param token 
     * @return 
     */
    public String extraerUserId(String token) {
        return validarToken(token).getSubject();
    }
}
