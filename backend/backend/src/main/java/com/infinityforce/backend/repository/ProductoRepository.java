package com.infinityforce.backend.repository;

import com.infinityforce.backend.model.Producto;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ProductoRepository extends MongoRepository<Producto, String> {
   
}