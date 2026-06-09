package com.infinityforce.backend.security;

import com.infinityforce.backend.service.JwtService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

/**
 * Filtro de autenticación JWT.
 * Se ejecuta una sola vez por petición HTTP (OncePerRequestFilter).
 *
 * Delega la validación del token a JwtService, el cual lee la clave
 * desde application.properties — sin claves hardcodeadas en este archivo.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authorizationHeader = request.getHeader("Authorization");

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            String token = authorizationHeader.substring(7);

            try {
                Claims claims = jwtService.validarToken(token);
                String userId = claims.getSubject();

                if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(userId, null, new ArrayList<>());

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    System.out.println(">>> [JwtFilter] Petición autorizada para el usuario ID: [" + userId + "]");
                }

            } catch (Exception e) {
                System.out.println(">>> [JwtFilter] Token inválido o expirado: " + e.getMessage());
                // No bloqueamos la cadena — Spring Security rechazará la petición
                // si el endpoint requiere autenticación.
            }
        }

        filterChain.doFilter(request, response);
    }
}