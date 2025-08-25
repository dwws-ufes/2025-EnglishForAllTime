package com.backend.controller;

import com.backend.dto.WordDetailsDTO;
import com.backend.service.SemanticService;
import com.backend.exception.WordNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dictionary")
@CrossOrigin(origins = "*")
@Slf4j
public class DictionaryController {

    @Autowired
    private SemanticService semanticService;

    @GetMapping("/{word}")
    public ResponseEntity<WordDetailsDTO> getWordDetails(@PathVariable String word) {
        if (word == null || word.trim().isEmpty()) {
            log.warn("Tentativa de busca com palavra vazia ou nula");
            return ResponseEntity.badRequest().build();
        }

        try {
            log.info("🔍 [DICTIONARY] Buscando palavra: {}", word);

            WordDetailsDTO wordDetails = semanticService.getWordDetails(word);

            log.info("✅ [DICTIONARY] Palavra encontrada: {}", word);
            return ResponseEntity.ok(wordDetails);

        } catch (WordNotFoundException e) {
            log.warn("❌ [DICTIONARY] Palavra não encontrada: {}", word);
            return ResponseEntity.notFound().build();

        } catch (Exception e) {
            log.error("❌ [DICTIONARY] Erro interno ao buscar palavra '{}': {}", word, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}