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
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
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

            // Log detalhado dos dados retornados
            log.info("✅ [DICTIONARY] Palavra encontrada: {}", word);
            log.info("📊 [DICTIONARY] Dados retornados: {}", wordDetails);
            log.info("🔍 [DICTIONARY] Detalhes: word={}, phonetic={}, meanings={}, translation={}",
                wordDetails.word(),
                wordDetails.phonetic(),
                wordDetails.meanings() != null ? wordDetails.meanings().size() : "null",
                wordDetails.translation());

            // Verificar se os dados estão completos antes de retornar
            if (wordDetails.word() == null || wordDetails.meanings() == null || wordDetails.meanings().isEmpty()) {
                log.warn("⚠️ [DICTIONARY] Dados incompletos para palavra: {}", word);
            }

            ResponseEntity<WordDetailsDTO> response = ResponseEntity.ok()
                .header("Content-Type", "application/json")
                .body(wordDetails);

            log.info("📤 [DICTIONARY] Enviando resposta com status: {}", response.getStatusCode());
            return response;

        } catch (WordNotFoundException e) {
            log.warn("❌ [DICTIONARY] Palavra não encontrada: {}", word);
            return ResponseEntity.notFound().build();

        } catch (Exception e) {
            log.error("❌ [DICTIONARY] Erro interno ao buscar palavra '{}': {}", word, e.getMessage());
            log.error("❌ [DICTIONARY] Stack trace:", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}