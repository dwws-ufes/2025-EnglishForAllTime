package com.backend.service;

import com.backend.dto.WordDetailsDTO;
import com.backend.dto.EnhancedWordDetailsDTO;
import com.backend.dto.SemanticResource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class EnhancedSemanticService {

    private final SemanticService originalService;
    private final LinkedDataService linkedDataService;

    public EnhancedSemanticService(SemanticService originalService,
                                   LinkedDataService linkedDataService) {
        this.originalService = originalService;
        this.linkedDataService = linkedDataService;
    }

    public EnhancedWordDetailsDTO getEnhancedWordDetails(String word) {
        log.info("🔍 Buscando dados aprimorados para palavra: {}", word);

        // 1. Buscar dados tradicionais do dicionário
        WordDetailsDTO traditionalData = originalService.getWordDetails(word);

        // 2. Buscar dados interligados da Web Semântica
        List<SemanticResource> linkedData = linkedDataService.fetchFromDBpedia(word);

        // 3. Combinar resultados
        EnhancedWordDetailsDTO enhanced = new EnhancedWordDetailsDTO(
                traditionalData,
                linkedData
        );

        log.info("✅ Dados aprimorados obtidos para: {}", word);
        return enhanced;
    }
}