package com.backend.controller;

import com.backend.dto.SemanticResource;
import com.backend.service.LinkedDataService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/linked-data")
@Slf4j
public class LinkedDataController {

    private final LinkedDataService linkedDataService;

    public LinkedDataController(LinkedDataService linkedDataService) {
        this.linkedDataService = linkedDataService;
    }

    @GetMapping(value = "/vocabulary/{word}", produces = "application/rdf+xml")
    public ResponseEntity<String> getWordAsRDF(@PathVariable String word) {
        log.info("📄 Gerando RDF para palavra: {}", word);

        String rdf = """
            <?xml version="1.0"?>
            <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
                     xmlns:vocab="http://localhost:8080/vocab#"
                     xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">
                <vocab:Word rdf:about="http://localhost:8080/vocab/word/%s">
                    <rdfs:label>%s</rdfs:label>
                    <vocab:hasDefinition>Vocabulary entry for the word %s</vocab:hasDefinition>
                    <vocab:language>en</vocab:language>
                </vocab:Word>
            </rdf:RDF>
            """.formatted(word, word, word);

        return ResponseEntity.ok(rdf);
    }

    @GetMapping(value = "/vocabulary", produces = "text/turtle")
    public ResponseEntity<String> getVocabularyAsTurtle() {
        log.info("🐢 Gerando vocabulário em Turtle");

        String turtle = """
            @prefix vocab: <http://localhost:8080/vocab#> .
            @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
            @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

            vocab:DictionaryApp a vocab:Application ;
                rdfs:label "Enhanced Dictionary Application" ;
                vocab:hasVersion "1.0" ;
                vocab:providesVocabulary vocab:Word ;
                vocab:supportsSemanticWeb true .

            vocab:Word a rdfs:Class ;
                rdfs:label "Word" ;
                rdfs:comment "A word in the dictionary with semantic data" .
            """;

        return ResponseEntity.ok(turtle);
    }

    @GetMapping("/dbpedia/{word}")
    public ResponseEntity<List<SemanticResource>> getDBpediaData(@PathVariable String word) {
        List<SemanticResource> resources = linkedDataService.fetchFromDBpedia(word);
        return ResponseEntity.ok(resources);
    }
}