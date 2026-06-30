package com.infinityforce.backend.config;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;

@Configuration
public class MongoConfig {

    // @Value("${spring.data.mongodb.uri}")
    // private String mongoUri;

    @Bean
    public MongoClient mongoClient() {
        return MongoClients.create("mongodb://localhost:27017/InfBD");
        // para despliegue en la nube usar "mongodb://localhost:27017/InfBD"
        // para Local usar
        // "mongodb+srv://u23328701:tAvarAulTra00@cluster0.pckmkpd.mongodb.net/GYM_BD?retryWrites=true&w=majority"

    }

    @Bean
    public MongoTemplate mongoTemplate(MongoClient mongoClient) {
        return new MongoTemplate(mongoClient, "InfBD");
        // para despliegue en la nube usar (mongoClient, GYM_BD)
        // para Local usar (mongoClient,InfBD)
    }
}
