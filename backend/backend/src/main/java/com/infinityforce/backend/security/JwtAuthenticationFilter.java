package com.infinityforce.backend.security;

import com.infinityforce.backend.service.JwtService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

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
                String rol = claims.get("rol", String.class);

                if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                    SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + rol.toUpperCase());

                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userId,
                            null,
                            Collections.singletonList(authority));

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    System.out.println(">>> [JwtFilter] Petición autorizada para el usuario ID: [" + userId
                            + "] con Rol: [" + rol + "]");
                }

            } catch (Exception e) {
                System.out.println(">>> [JwtFilter] Token inválido o expirado: " + e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }
}