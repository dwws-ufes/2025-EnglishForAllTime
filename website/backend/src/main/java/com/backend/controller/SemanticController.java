package com.backend.controller;

import com.backend.dto.EnhancedWordDetailsDTO;
import com.backend.dto.WordDetailsDTO;
import com.backend.service.EnhancedSemanticService;
import com.backend.service.SemanticService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/words")
@Slf4j
public class SemanticController {

    private final EnhancedSemanticService enhancedSemanticService;
    private final SemanticService semanticService; // Manter para endpoint alternativo

    public SemanticController(EnhancedSemanticService enhancedSemanticService,
                              SemanticService semanticService) {
        this.enhancedSemanticService = enhancedSemanticService;
        this.semanticService = semanticService;
    }

    @GetMapping("/{word}")
    public ResponseEntity<EnhancedWordDetailsDTO> getWordDetails(@PathVariable String word) {
        log.info("🔍 Buscando palavra (enhanced): {}", word);
        EnhancedWordDetailsDTO enhanced = enhancedSemanticService.getEnhancedWordDetails(word);
        return ResponseEntity.ok(enhanced);
    }

    // Endpoint alternativo para dados apenas tradicionais (opcional)
    @GetMapping("/{word}/traditional")
    public ResponseEntity<WordDetailsDTO> getTraditionalWordDetails(@PathVariable String word) {
        log.info("🔍 Buscando palavra (tradicional): {}", word);
        WordDetailsDTO traditional = semanticService.getWordDetails(word);
        return ResponseEntity.ok(traditional);
    }
}