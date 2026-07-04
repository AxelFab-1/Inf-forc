package com.infinityforce.backend.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("exito", false);
        
        String mensajeDeError = ex.getBindingResult().getFieldErrors().get(0).getDefaultMessage();
        
        respuesta.put("mensaje", mensajeDeError);
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(respuesta);
    }
}
