package com.backend.service;

import com.backend.dto.WordDetailsDTO;
import com.backend.dto.MeaningDTO;
import com.backend.dto.DefinitionDTO;
import com.backend.dto.NestedWordDetailsDTO;
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

    public NestedWordDetailsDTO getWordDetailsWithNesting(String word) {
        log.info("🔍 Buscando detalhes com aninhamento para palavra: {}", word);

        try {
            // 1. Buscar detalhes da palavra principal
            WordDetailsDTO mainWordDetails = getWordDetails(word);

            // 2. Encontrar o primeiro sinônimo da primeira definição
            String firstSynonym = findFirstSynonym(mainWordDetails);

            WordDetailsDTO nestedSynonymDetails = null;
            if (firstSynonym != null && !firstSynonym.isEmpty()) {
                log.info("🔗 Buscando detalhes do primeiro sinônimo: {}", firstSynonym);
                try {
                    nestedSynonymDetails = getWordDetails(firstSynonym);
                    log.info("✅ Detalhes do sinônimo '{}' encontrados", firstSynonym);
                } catch (Exception e) {
                    log.warn("⚠️ Não foi possível obter detalhes do sinônimo '{}': {}", firstSynonym, e.getMessage());
                }
            } else {
                log.info("ℹ️ Nenhum sinônimo encontrado para aninhamento");
            }

            return new NestedWordDetailsDTO(mainWordDetails, nestedSynonymDetails);

        } catch (Exception e) {
            log.error("❌ Erro ao buscar palavra com aninhamento '{}': {}", word, e.getMessage());
            throw new WordNotFoundException("Palavra '" + word + "' não encontrada no dicionário");
        }
    }

    private String findFirstSynonym(WordDetailsDTO wordDetails) {
        if (wordDetails.meanings() != null && !wordDetails.meanings().isEmpty()) {
            // Pegar a primeira meaning (primeiro significado)
            MeaningDTO firstMeaning = wordDetails.meanings().get(0);

            if (firstMeaning.synonyms() != null && !firstMeaning.synonyms().isEmpty()) {
                // Retornar o primeiro sinônimo
                return firstMeaning.synonyms().get(0);
            }
        }
        return null;
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
                JsonNode responseData = jsonResponse.path("responseData");
                String translatedText = responseData.path("translatedText").asText();

                if (!translatedText.isEmpty()) {
                    log.debug("✅ Tradução encontrada: {}", translatedText);
                    return translatedText;
                }
            }

            log.warn("⚠️ Nenhuma tradução encontrada para: {}", word);
            return null;

        } catch (Exception e) {
            log.error("❌ Erro ao buscar tradução para '{}': {}", word, e.getMessage());
            return null;
        }
    }

    public String getTranslation(String word) {
        return fetchTranslation(word);
    }

    public NestedWordDetailsDTO getNestedWordDetails(String word) {
        return getWordDetailsWithNesting(word);
    }

    // NOVA FUNCIONALIDADE: Rede Semântica de Palavras
    public com.backend.controller.SemanticController.SemanticNetworkDTO getSemanticNetwork(String word) {
        log.info("🕸️ Construindo rede semântica para palavra: {}", word);

        try {
            // 1. Buscar detalhes básicos da palavra
            WordDetailsDTO wordDetails = getWordDetails(word);

            // 2. Construir dados da rede semântica
            return buildSemanticNetwork(word, wordDetails);

        } catch (Exception e) {
            log.error("❌ Erro ao construir rede semântica para '{}': {}", word, e.getMessage());
            throw new WordNotFoundException("Não foi possível construir rede semântica para: " + word);
        }
    }

    private com.backend.controller.SemanticController.SemanticNetworkDTO buildSemanticNetwork(String word, WordDetailsDTO wordDetails) {
        // Etimologia simulada (em uma implementação real, isso viria de APIs especializadas)
        String etymology = generateEtymology(word);
        String wordFamily = generateWordFamily(word);

        // Coletar sinônimos de todos os significados
        List<com.backend.controller.SemanticController.RelatedWord> synonyms = new ArrayList<>();
        List<com.backend.controller.SemanticController.RelatedWord> relatedWords = new ArrayList<>();

        if (wordDetails.meanings() != null) {
            for (MeaningDTO meaning : wordDetails.meanings()) {
                if (meaning.synonyms() != null) {
                    for (String synonym : meaning.synonyms()) {
                        synonyms.add(new com.backend.controller.SemanticController.RelatedWord(
                            synonym, "synonym", 0.9
                        ));
                    }
                }
            }
        }

        // Gerar antônimos baseados em padrões comuns
        List<com.backend.controller.SemanticController.RelatedWord> antonyms = generateAntonyms(word);

        // Gerar cognatos (palavras relacionadas em outras línguas)
        List<String> cognates = generateCognates(word);

        // Origem da palavra
        com.backend.controller.SemanticController.WordOrigin origin = generateWordOrigin(word);

        // Conexões linguísticas
        List<com.backend.controller.SemanticController.LanguageConnection> connections = generateLanguageConnections(word);

        // Adicionar palavras relacionadas semanticamente
        relatedWords.addAll(generateSemanticRelations(word));

        return new com.backend.controller.SemanticController.SemanticNetworkDTO(
            word,
            etymology,
            wordFamily,
            synonyms,
            antonyms,
            relatedWords,
            cognates,
            origin,
            connections
        );
    }

    private String generateEtymology(String word) {
        // Simulação de etimologia baseada em padrões comuns
        // Em uma implementação real, isso consultaria bases de dados etimológicas
        switch (word.toLowerCase()) {
            case "happy":
                return "Do inglês médio 'hap' (sorte, fortuna) + sufixo '-y'. Relacionado ao nórdico antigo 'happ' (sorte).";
            case "computer":
                return "Do latim 'computare' (calcular, contar). Primeiro usado em inglês no século XVII para 'pessoa que calcula'.";
            case "telephone":
                return "Do grego 'tele' (distante) + 'phone' (som, voz). Criado por Alexander Graham Bell em 1876.";
            case "democracy":
                return "Do grego 'demokratia': 'demos' (povo) + 'kratos' (poder, governo).";
            default:
                return String.format("A palavra '%s' tem origens complexas e evoluiu através de várias transformações linguísticas.", word);
        }
    }

    private String generateWordFamily(String word) {
        // Família de palavras baseada em morfologia
        switch (word.toLowerCase()) {
            case "happy":
                return "happiness, happily, unhappy, unhappiness";
            case "computer":
                return "compute, computation, computational, computing";
            case "telephone":
                return "telephonic, telephony, telephonist";
            case "democracy":
                return "democratic, democratize, democratization";
            default:
                return "Família de palavras relacionadas morfologicamente";
        }
    }

    private List<com.backend.controller.SemanticController.RelatedWord> generateAntonyms(String word) {
        List<com.backend.controller.SemanticController.RelatedWord> antonyms = new ArrayList<>();

        // Antônimos baseados em padrões comuns
        switch (word.toLowerCase()) {
            case "happy":
                antonyms.add(new com.backend.controller.SemanticController.RelatedWord("sad", "antonym", 0.95));
                antonyms.add(new com.backend.controller.SemanticController.RelatedWord("unhappy", "antonym", 0.90));
                break;
            case "big":
                antonyms.add(new com.backend.controller.SemanticController.RelatedWord("small", "antonym", 0.95));
                antonyms.add(new com.backend.controller.SemanticController.RelatedWord("little", "antonym", 0.90));
                break;
            case "hot":
                antonyms.add(new com.backend.controller.SemanticController.RelatedWord("cold", "antonym", 0.95));
                antonyms.add(new com.backend.controller.SemanticController.RelatedWord("cool", "antonym", 0.85));
                break;
        }

        return antonyms;
    }

    private List<String> generateCognates(String word) {
        List<String> cognates = new ArrayList<>();

        // Cognatos em diferentes línguas
        switch (word.toLowerCase()) {
            case "computer":
                cognates.add("computador (Portuguese)");
                cognates.add("ordinateur (French)");
                cognates.add("computadora (Spanish)");
                break;
            case "telephone":
                cognates.add("teléfono (Spanish)");
                cognates.add("téléphone (French)");
                cognates.add("telefone (Portuguese)");
                break;
            case "democracy":
                cognates.add("democracia (Spanish/Portuguese)");
                cognates.add("démocratie (French)");
                cognates.add("demokratie (German)");
                break;
        }

        return cognates;
    }

    private com.backend.controller.SemanticController.WordOrigin generateWordOrigin(String word) {
        // Origem linguística da palavra
        switch (word.toLowerCase()) {
            case "happy":
                return new com.backend.controller.SemanticController.WordOrigin("Old Norse", "happ", "luck, fortune");
            case "computer":
                return new com.backend.controller.SemanticController.WordOrigin("Latin", "computare", "to calculate");
            case "telephone":
                return new com.backend.controller.SemanticController.WordOrigin("Greek", "tele + phone", "distant voice");
            default:
                return new com.backend.controller.SemanticController.WordOrigin("Unknown", word, "Origin uncertain");
        }
    }

    private List<com.backend.controller.SemanticController.LanguageConnection> generateLanguageConnections(String word) {
        List<com.backend.controller.SemanticController.LanguageConnection> connections = new ArrayList<>();

        // Conexões com outras línguas
        switch (word.toLowerCase()) {
            case "computer":
                connections.add(new com.backend.controller.SemanticController.LanguageConnection("Portuguese", "computador", "máquina de calcular"));
                connections.add(new com.backend.controller.SemanticController.LanguageConnection("French", "ordinateur", "machine à calculer"));
                connections.add(new com.backend.controller.SemanticController.LanguageConnection("German", "computer", "rechner"));
                break;
            case "happy":
                connections.add(new com.backend.controller.SemanticController.LanguageConnection("Portuguese", "feliz", "alegre"));
                connections.add(new com.backend.controller.SemanticController.LanguageConnection("Spanish", "feliz", "alegre"));
                connections.add(new com.backend.controller.SemanticController.LanguageConnection("French", "heureux", "content"));
                break;
        }

        return connections;
    }

    private List<com.backend.controller.SemanticController.RelatedWord> generateSemanticRelations(String word) {
        List<com.backend.controller.SemanticController.RelatedWord> relations = new ArrayList<>();

        // Relações semânticas baseadas em domínios
        switch (word.toLowerCase()) {
            case "computer":
                relations.add(new com.backend.controller.SemanticController.RelatedWord("technology", "domain", 0.85));
                relations.add(new com.backend.controller.SemanticController.RelatedWord("software", "related", 0.80));
                relations.add(new com.backend.controller.SemanticController.RelatedWord("digital", "related", 0.75));
                break;
            case "happy":
                relations.add(new com.backend.controller.SemanticController.RelatedWord("emotion", "domain", 0.90));
                relations.add(new com.backend.controller.SemanticController.RelatedWord("joy", "related", 0.85));
                relations.add(new com.backend.controller.SemanticController.RelatedWord("positive", "related", 0.80));
                break;
        }

        return relations;
    }
}

