package com.backend.configuration;

import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SemanticConfiguration {

    @Bean
    public Model rdfModel() {
        return ModelFactory.createDefaultModel();
    }
}