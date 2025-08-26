package com.backend.controller;

import com.backend.dto.WordDetailsDTO;
import com.backend.service.SemanticService;
import com.backend.exception.WordNotFoundException;
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
        try {
            WordDetailsDTO wordDetails = semanticService.getWordDetails(word);

            // Extrair apenas as definições para compatibilidade
            StringBuilder definitions = new StringBuilder();
            if (wordDetails.meanings() != null) {
                wordDetails.meanings().forEach(meaning -> {
                    if (meaning.definitions() != null) {
                        meaning.definitions().forEach(def -> {
                            if (definitions.length() > 0) definitions.append("; ");
                            definitions.append(def.definition());
                        });
                    }
                });
            }

            return ResponseEntity.ok(new DefinitionResponse(word, definitions.toString()));

        } catch (WordNotFoundException e) {
            log.warn("Definição não encontrada para palavra: {}", word);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Erro ao buscar definição para '{}': {}", word, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/translation/{word}")
    public ResponseEntity<?> getTranslation(@PathVariable String word) {
        try {
            WordDetailsDTO wordDetails = semanticService.getWordDetails(word);

            if (wordDetails.translation() != null && !wordDetails.translation().isEmpty()) {
                return ResponseEntity.ok(new TranslationResponse(word, wordDetails.translation()));
            } else {
                return ResponseEntity.notFound().build();
            }

        } catch (WordNotFoundException e) {
            log.warn("Tradução não encontrada para palavra: {}", word);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Erro ao buscar tradução para '{}': {}", word, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // Endpoint unificado que retorna todos os detalhes da palavra
    @GetMapping("/word/{word}")
    public ResponseEntity<WordDetailsDTO> getWordDetails(@PathVariable String word) {
        try {
            WordDetailsDTO wordDetails = semanticService.getWordDetails(word);
            return ResponseEntity.ok(wordDetails);

        } catch (WordNotFoundException e) {
            log.warn("Palavra não encontrada: {}", word);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Erro ao buscar palavra '{}': {}", word, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    public record DefinitionResponse(String word, String definition) {}
    public record TranslationResponse(String word, String translation) {}
}