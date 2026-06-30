package com.infinityforce.backend.repository;

import com.infinityforce.backend.model.Usuario;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface UsuarioRepository extends MongoRepository<Usuario, String> {
    
    
    Optional<Usuario> findByCodigoAccesoAndContrasena(String codigoAcceso, String contrasena);

    Optional<Usuario> findByDniOrCodigoAcceso(String dni, String codigoAcceso);

    boolean existsByDni(String dni);
    
    boolean existsByCodigoAcceso(String codigoAcceso);
}