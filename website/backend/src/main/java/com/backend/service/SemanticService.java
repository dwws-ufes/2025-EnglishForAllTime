package com.backend.service;

import com.backend.dto.WordDetailsDTO;
import com.backend.dto.MeaningDTO;
import com.backend.dto.DefinitionDTO;
import com.backend.exception.WordNotFoundException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class SemanticService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${dictionary.api.url:https://api.dictionaryapi.dev/api/v2/entries/en}")
    private String dictionaryApiUrl;

    @Value("${translation.api.url:https://api.mymemory.translated.net/get}")
    private String translationApiUrl;

    public SemanticService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    public WordDetailsDTO getWordDetails(String word) {
        log.info("🔍 Buscando detalhes para palavra: {}", word);

        try {
            // 1. Buscar definições na API do dicionário
            WordDetailsDTO wordDetails = fetchWordDefinitions(word);

            // 2. Buscar tradução (opcional, não falha se der erro)
            try {
                String translation = fetchTranslation(word);
                // Como record é imutável, criamos uma nova instância com tradução
                wordDetails = new WordDetailsDTO(
                        wordDetails.word(),
                        wordDetails.phonetic(),
                        wordDetails.meanings(),
                        translation
                );
            } catch (Exception e) {
                log.warn("⚠️ Não foi possível obter tradução para '{}': {}", word, e.getMessage());
                // Continua sem tradução
            }

            log.info("✅ Detalhes encontrados para palavra: {}", word);
            return wordDetails;

        } catch (Exception e) {
            log.error("❌ Erro ao buscar palavra '{}': {}", word, e.getMessage());
            throw new WordNotFoundException("Palavra '" + word + "' não encontrada no dicionário");
        }
    }

    private WordDetailsDTO fetchWordDefinitions(String word) {
        String url = dictionaryApiUrl + "/" + word.toLowerCase().trim();

        log.debug("🌐 Consultando API: {}", url);

        try {
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode jsonArray = objectMapper.readTree(response.getBody());

                if (jsonArray.isArray() && jsonArray.size() > 0) {
                    JsonNode firstResult = jsonArray.get(0);
                    return parseWordDetails(firstResult, word);
                }
            }

            throw new WordNotFoundException("Nenhum resultado encontrado para: " + word);

        } catch (JsonProcessingException e) {
            log.error("❌ Erro ao processar JSON da API do dicionário: {}", e.getMessage());
            throw new RuntimeException("Erro ao processar resposta da API: " + e.getMessage());
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                log.warn("🔍 Palavra '{}' não encontrada na API do dicionário", word);
                throw new WordNotFoundException("Palavra '" + word + "' não encontrada no dicionário");
            }
            throw new RuntimeException("Erro na consulta à API do dicionário: " + e.getMessage());
        }
    }

    private WordDetailsDTO parseWordDetails(JsonNode wordJson, String originalWord) {
        // Word
        String word = wordJson.path("word").asText(originalWord);

        // Phonetic
        String phonetic = null;
        JsonNode phoneticsArray = wordJson.path("phonetics");
        if (phoneticsArray.isArray() && phoneticsArray.size() > 0) {
            for (JsonNode phoneticNode : phoneticsArray) {
                String phoneticText = phoneticNode.path("text").asText();
                if (!phoneticText.isEmpty()) {
                    phonetic = phoneticText;
                    break;
                }
            }
        }

        // Meanings
        List<MeaningDTO> meanings = new ArrayList<>();
        JsonNode meaningsArray = wordJson.path("meanings");
        if (meaningsArray.isArray()) {
            for (JsonNode meaningJson : meaningsArray) {
                String partOfSpeech = meaningJson.path("partOfSpeech").asText();

                // Definitions
                List<DefinitionDTO> definitions = new ArrayList<>();
                JsonNode definitionsArray = meaningJson.path("definitions");
                if (definitionsArray.isArray()) {
                    for (JsonNode defJson : definitionsArray) {
                        String definition = defJson.path("definition").asText();
                        String example = defJson.path("example").asText(null);
                        definitions.add(new DefinitionDTO(definition, example));
                    }
                }

                // Synonyms
                List<String> synonyms = new ArrayList<>();
                JsonNode synonymsArray = meaningJson.path("synonyms");
                if (synonymsArray.isArray()) {
                    for (JsonNode synonym : synonymsArray) {
                        synonyms.add(synonym.asText());
                    }
                }

                meanings.add(new MeaningDTO(partOfSpeech, definitions, synonyms));
            }
        }

        return new WordDetailsDTO(word, phonetic, meanings, null);
    }

    private String fetchTranslation(String word) {
        String url = translationApiUrl + "?q=" + word + "&langpair=en|pt";

        log.debug("🌍 Buscando tradução: {}", url);

        try {
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode jsonResponse = objectMapper.readTree(response.getBody());
                return jsonResponse.path("responseData").path("translatedText").asText();
            }

        } catch (JsonProcessingException e) {
            log.warn("⚠️ Erro ao processar JSON da tradução: {}", e.getMessage());
        } catch (Exception e) {
            log.warn("⚠️ Erro na tradução: {}", e.getMessage());
        }

        return null;
    }
}