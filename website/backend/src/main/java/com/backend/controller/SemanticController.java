package com.backend.controller;

import com.backend.semantic.SemanticService;
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

    public record DefinitionResponse(String word, String definition) {}
}