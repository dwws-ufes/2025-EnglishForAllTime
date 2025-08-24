package com.backend.controller;

import com.backend.dto.WordDetailsDTO;
import com.backend.service.SemanticService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/dictionary")
@CrossOrigin(origins = "*")
public class DictionaryController {

    @Autowired
    private SemanticService semanticService;

    @GetMapping("/{word}")
    public ResponseEntity<WordDetailsDTO> getWordDetails(@PathVariable String word) {
        if (word == null || word.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        try {
            Optional<String> definition = semanticService.getDefinition(word);
            Optional<String> translation = semanticService.getTranslation(word);

            String definitionText = definition.orElse("Definição não encontrada");
            String translationText = translation.orElse("Tradução não encontrada");

            WordDetailsDTO wordDetails = new WordDetailsDTO(word, definitionText, translationText);

            return ResponseEntity.ok(wordDetails);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}