package com.backend.controller;

import com.backend.service.SemanticService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/semantic")
@Slf4j
public class SemanticController {

    @Autowired
    private SemanticService semanticService;

    @GetMapping("/definition/{word}")
    public ResponseEntity<?> getDefinition(@PathVariable String word) {
        var definition = semanticService.getDefinition(word);

        if (definition.isPresent()) {
            return ResponseEntity.ok().body(new DefinitionResponse(word, definition.get()));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/translation/{word}")
    public ResponseEntity<?> getTranslation(@PathVariable String word) {
        var translation = semanticService.getTranslation(word);

        if (translation.isPresent()) {
            return ResponseEntity.ok().body(new TranslationResponse(word, translation.get()));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    public record DefinitionResponse(String word, String definition) {}
    public record TranslationResponse(String word, String translation) {}
}