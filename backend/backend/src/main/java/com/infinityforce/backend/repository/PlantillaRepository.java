package com.infinityforce.backend.repository;

import com.infinityforce.backend.model.Plantilla;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PlantillaRepository extends MongoRepository<Plantilla, String> {
   
}