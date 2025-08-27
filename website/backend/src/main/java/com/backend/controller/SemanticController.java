package com.backend.controller;

import com.backend.dto.WordDetailsDTO;
import com.backend.dto.NestedWordDetailsDTO;
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
            String translation = semanticService.getTranslation(word);
            return ResponseEntity.ok(new TranslationResponse(word, translation));
        } catch (WordNotFoundException e) {
            log.warn("Tradução não encontrada para palavra: {}", word);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Erro ao buscar tradução para '{}': {}", word, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/word-details/{word}")
    public ResponseEntity<WordDetailsDTO> getWordDetails(@PathVariable String word) {
        try {
            WordDetailsDTO wordDetails = semanticService.getWordDetails(word);
            return ResponseEntity.ok(wordDetails);
        } catch (WordNotFoundException e) {
            log.warn("Detalhes não encontrados para palavra: {}", word);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Erro ao buscar detalhes para '{}': {}", word, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/nested-details/{word}")
    public ResponseEntity<NestedWordDetailsDTO> getNestedWordDetails(@PathVariable String word) {
        try {
            NestedWordDetailsDTO nestedDetails = semanticService.getNestedWordDetails(word);
            return ResponseEntity.ok(nestedDetails);
        } catch (WordNotFoundException e) {
            log.warn("Detalhes aninhados não encontrados para palavra: {}", word);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Erro ao buscar detalhes aninhados para '{}': {}", word, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // NOVA FUNCIONALIDADE: Rede Semântica de Palavras
    @GetMapping("/semantic-network/{word}")
    public ResponseEntity<SemanticNetworkDTO> getSemanticNetwork(@PathVariable String word) {
        try {
            SemanticNetworkDTO semanticNetwork = semanticService.getSemanticNetwork(word);
            return ResponseEntity.ok(semanticNetwork);
        } catch (WordNotFoundException e) {
            log.warn("Rede semântica não encontrada para palavra: {}", word);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Erro ao buscar rede semântica para '{}': {}", word, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // Classes internas para respostas
    public static record DefinitionResponse(String word, String definition) {}
    public static record TranslationResponse(String word, String translation) {}

    // DTO para Rede Semântica
    public static record SemanticNetworkDTO(
        String word,
        String etymology,
        String wordFamily,
        java.util.List<RelatedWord> synonyms,
        java.util.List<RelatedWord> antonyms,
        java.util.List<RelatedWord> relatedWords,
        java.util.List<String> cognates,
        WordOrigin origin,
        java.util.List<LanguageConnection> connections
    ) {}

    public static record RelatedWord(String word, String relation, Double similarity) {}
    public static record WordOrigin(String language, String originalForm, String meaning) {}
    public static record LanguageConnection(String language, String form, String meaning) {}
}