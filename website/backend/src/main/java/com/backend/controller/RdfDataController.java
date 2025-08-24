package com.backend.controller;

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