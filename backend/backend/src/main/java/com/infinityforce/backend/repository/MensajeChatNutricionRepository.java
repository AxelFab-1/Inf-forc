package com.infinityforce.backend.repository;

import com.infinityforce.backend.model.MensajeChatNutricion;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface MensajeChatNutricionRepository extends MongoRepository<MensajeChatNutricion, String> {

    List<MensajeChatNutricion> findByClienteIdOrderByFechaAsc(String clienteId);

    List<MensajeChatNutricion> findTop20ByClienteIdOrderByFechaDesc(String clienteId);
}