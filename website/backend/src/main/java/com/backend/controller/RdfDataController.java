package com.backend.controller;

import com.backend.dto.VocabularyMetadataDTO;
import com.backend.exception.WordNotFoundException; // Importe a exceção
import com.backend.service.SemanticService; // Importe o novo serviço
import com.backend.service.VocabularyRdfService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/data")
@CrossOrigin(origins = "*")
public class RdfDataController {

    @Autowired
    private VocabularyRdfService vocabularyRdfService;

    // Injeção do SemanticService para gerar o RDF da palavra
    @Autowired
    private SemanticService semanticService;

    @GetMapping(value = "/vocabulary.ttl", produces = "text/turtle")
    public ResponseEntity<String> getVocabularyRdf() {
        try {
            String rdfData = vocabularyRdfService.generateVocabularyRdf();

            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_TYPE, "text/turtle; charset=utf-8");
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"vocabulary.ttl\"");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(rdfData);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * NOVO ENDPOINT
     * Gera e retorna os dados interligados de uma palavra específica em formato RDF Turtle.
     * @param word A palavra a ser pesquisada.
     * @return Um arquivo .ttl para download com os dados da palavra.
     */
    @GetMapping(value = "/word/{word}.ttl", produces = "text/turtle")
    public ResponseEntity<String> getWordRdf(@PathVariable String word) {
        try {
            String rdfData = semanticService.generateRdfForWord(word);
            String fileName = word.toLowerCase().replaceAll("[^a-z0-9]", "_") + ".ttl";

            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_TYPE, "text/turtle; charset=utf-8");
            // Usamos "attachment" para forçar o download no navegador
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(rdfData);

        } catch (WordNotFoundException e) {
            return ResponseEntity.notFound().build(); // Retorna 404 se a palavra não for encontrada
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build(); // Erro genérico
        }
    }


    @GetMapping(value = "/vocabulary/metadata", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<VocabularyMetadataDTO> getVocabularyMetadata() {
        try {
            VocabularyMetadataDTO metadata = vocabularyRdfService.getVocabularyMetadata();
            return ResponseEntity.ok(metadata);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}