package com.infinityforce.backend.repository;

import com.infinityforce.backend.model.Plantilla;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlantillaRepository extends MongoRepository<Plantilla, String> {
   
}