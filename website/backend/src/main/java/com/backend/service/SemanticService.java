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
import org.apache.jena.sparql.exec.http.QueryExecutionHTTP;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

// <<< 1. NOVOS IMPORTS DA BIBLIOTECA APACHE JENA >>>
import org.apache.jena.query.*;
import org.apache.jena.rdf.model.Literal;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;


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
        log.info("🔍 Buscando detalhes para palavra:  {}", word);

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

    // ... (outros métodos como getWordDetailsWithNesting, findFirstSynonym, etc. permanecem iguais) ...
    public NestedWordDetailsDTO getWordDetailsWithNesting(String word) {
        log.info("🔍 Buscando detalhes com aninhamento para palavra: {}", word);

        try {
            WordDetailsDTO mainWordDetails = getWordDetails(word);
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
            MeaningDTO firstMeaning = wordDetails.meanings().get(0);
            if (firstMeaning.synonyms() != null && !firstMeaning.synonyms().isEmpty()) {
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
        String word = wordJson.path("word").asText(originalWord);
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
        List<MeaningDTO> meanings = new ArrayList<>();
        JsonNode meaningsArray = wordJson.path("meanings");
        if (meaningsArray.isArray()) {
            for (JsonNode meaningJson : meaningsArray) {
                String partOfSpeech = meaningJson.path("partOfSpeech").asText();
                List<DefinitionDTO> definitions = new ArrayList<>();
                JsonNode definitionsArray = meaningJson.path("definitions");
                if (definitionsArray.isArray()) {
                    for (JsonNode defJson : definitionsArray) {
                        String definition = defJson.path("definition").asText();
                        String example = defJson.path("example").asText(null);
                        definitions.add(new DefinitionDTO(definition, example));
                    }
                }
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

        // <<< 2. SUBSTITUIÇÃO DA ETYMOLOGIA SIMULADA PELA BUSCA REAL NA DBPEDIA >>>
        // A linha antiga era: String etymology = generateEtymology(word);
        String etymology = fetchWikidataDefinition(word);

        String wordFamily = generateWordFamily(word);

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

        List<com.backend.controller.SemanticController.RelatedWord> antonyms = generateAntonyms(word);
        List<String> cognates = generateCognates(word);
        com.backend.controller.SemanticController.WordOrigin origin = generateWordOrigin(word);
        List<com.backend.controller.SemanticController.LanguageConnection> connections = generateLanguageConnections(word);
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

    // <<< 3. NOVO MÉTODO PARA CONSUMIR DADOS INTERLIGADOS DA DBPEDIA >>>
    /**
     * Busca o resumo (abstract) em inglês de um termo na DBpedia usando SPARQL.
     * Esta função cumpre o requisito de CONSUMO de dados interligados.
     * @param term A palavra a ser pesquisada.
     * @return O resumo do termo, ou uma mensagem padrão caso não seja encontrado.
     */
    private String fetchDbpediaAbstract(String term) {
        log.info("🌐 [DBpedia] Buscando abstract para o termo: {}", term);
        String formattedTerm = term.substring(0, 1).toUpperCase() + term.substring(1);
        String sparqlEndpoint = "https://dbpedia.org/sparql";

        String sparqlQuery = """
            PREFIX dbo: <http://dbpedia.org/ontology/>
            SELECT ?abstract
            WHERE {
              <http://dbpedia.org/resource/%s> dbo:abstract ?abstract .
              FILTER (lang(?abstract) = 'en')
            }
            LIMIT 1
            """.formatted(formattedTerm);

        // O try-with-resources garante que a conexão será fechada
        try (QueryExecution qExec = QueryExecutionHTTP.create()
                .endpoint(sparqlEndpoint)
                .query(sparqlQuery)
                .timeout(5000) // Timeout de 5 segundos
                .build()) {

            ResultSet results = qExec.execSelect();

            if (results.hasNext()) {
                QuerySolution soln = results.nextSolution();
                Literal abstractLiteral = soln.getLiteral("abstract");
                String abstractText = abstractLiteral.getString();
                log.info("✅ [DBpedia] Abstract encontrado para: {}", term);
                return abstractText;
            } else {
                log.warn("⚠️ [DBpedia] Nenhum abstract em inglês encontrado para: {}", term);
                return String.format("Nenhuma descrição detalhada (abstract) foi encontrada na DBpedia para '%s'. Esta pode ser uma palavra comum ou um termo técnico sem uma entrada enciclopédica própria.", term);
            }
        } catch (Exception e) {
            log.error("❌ [DBpedia] Erro ao consultar o SPARQL endpoint para '{}'. Causa do erro: ", term, e);
            return String.format("Não foi possível consultar a base de dados interligados (DBpedia) para o termo '%s' devido a um erro de conexão ou de consulta.", term);
        }
    }

    /**
     * Busca a definição de um termo no banco de dados lexical da Wikidata usando SPARQL.
     * Esta função cumpre o requisito de CONSUMO de dados interligados de forma mais apropriada.
     * @param term A palavra a ser pesquisada.
     * @return A primeira definição encontrada, ou uma mensagem padrão.
     */
    private String fetchWikidataDefinition(String term) {
        log.info("🌐 [Wikidata] Buscando definição para o termo: {}", term);
        String sparqlEndpoint = "https://query.wikidata.org/sparql";

        // Usamos LCASE para tornar a busca case-insensitive
        String sparqlQuery = """
        PREFIX dct: <http://purl.org/dc/terms/>
        PREFIX wikibase: <http://wikiba.se/ontology#>
        PREFIX ontolex: <http://www.w3.org/ns/lemon/ontolex#>
        PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
        PREFIX wd: <http://www.wikidata.org/entity/>

        SELECT ?definition WHERE {
          ?lexeme dct:language wd:Q1860;
                  wikibase:lemma ?lemma;
                  ontolex:sense ?sense.
          ?sense skos:definition ?definition.
          FILTER(LANG(?definition) = "en")
          FILTER(LCASE(STR(?lemma)) = LCASE("%s"))
        }
        LIMIT 1
        """.formatted(term);

        try (QueryExecution qExec = QueryExecutionHTTP.create()
                .endpoint(sparqlEndpoint)
                .query(sparqlQuery)
                .httpHeader("Accept", "application/sparql-results+json")
                .httpHeader("User-Agent", "EnglishForAllTimeApp/1.0 (https://github.com/user/project)")
                .timeout(8000) // Aumentando um pouco o timeout para a Wikidata
                .build()) {

            ResultSet results = qExec.execSelect();

            if (results.hasNext()) {
                QuerySolution soln = results.nextSolution();
                Literal definitionLiteral = soln.getLiteral("definition");
                String definitionText = definitionLiteral.getString();
                log.info("✅ [Wikidata] Definição encontrada para: {}", term);
                return "Definição da Wikidata: " + definitionText; // Adicionando um prefixo para clareza
            } else {
                log.warn("⚠️ [Wikidata] Nenhuma definição encontrada para: {}", term);
                return String.format("Nenhuma definição foi encontrada na base de dados lexical da Wikidata para '%s'.", term);
            }
        } catch (Exception e) {
            log.error("❌ [Wikidata] Erro ao consultar o SPARQL endpoint para '{}'. Causa do erro: ", term, e);
            return String.format("Não foi possível consultar a base de dados interligados (Wikidata) para o termo '%s'.", term);
        }
    }

    // <<< 4. MÉTODO generateEtymology FOI REMOVIDO >>>
    // Ele não é mais necessário, pois foi substituído pela busca real na DBpedia.

    // ... (O restante dos métodos `generate...` e `generateRdfForWord` permanecem iguais) ...
    private String generateWordFamily(String word) {
        switch (word.toLowerCase()) {
            case "happy": return "happiness, happily, unhappy, unhappiness";
            case "computer": return "compute, computation, computational, computing";
            case "telephone": return "telephonic, telephony, telephonist";
            case "democracy": return "democratic, democratize, democratization";
            default: return "Família de palavras relacionadas morfologicamente";
        }
    }
    private List<com.backend.controller.SemanticController.RelatedWord> generateAntonyms(String word) {
        List<com.backend.controller.SemanticController.RelatedWord> antonyms = new ArrayList<>();
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
        switch (word.toLowerCase()) {
            case "happy": return new com.backend.controller.SemanticController.WordOrigin("Old Norse", "happ", "luck, fortune");
            case "computer": return new com.backend.controller.SemanticController.WordOrigin("Latin", "computare", "to calculate");
            case "telephone": return new com.backend.controller.SemanticController.WordOrigin("Greek", "tele + phone", "distant voice");
            default: return new com.backend.controller.SemanticController.WordOrigin("Unknown", word, "Origin uncertain");
        }
    }
    private List<com.backend.controller.SemanticController.LanguageConnection> generateLanguageConnections(String word) {
        List<com.backend.controller.SemanticController.LanguageConnection> connections = new ArrayList<>();
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
    public String generateRdfForWord(String word) throws WordNotFoundException {
        WordDetailsDTO details = getWordDetails(word); // Reutiliza o método existente
        String baseUri = "http://englishforalltime.com/vocabulary/";
        String wordUri = baseUri + word.toLowerCase().replace(" ", "_");
        StringBuilder rdfBuilder = new StringBuilder();
        rdfBuilder.append("@prefix vocab: <").append(baseUri).append("> .\n");
        rdfBuilder.append("@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .\n");
        rdfBuilder.append("@prefix dct: <http://purl.org/dc/terms/> .\n");
        rdfBuilder.append("\n");
        rdfBuilder.append("<").append(wordUri).append(">\n");
        rdfBuilder.append("    a vocab:Word ;\n");
        rdfBuilder.append("    rdfs:label \"").append(details.word()).append("\" ;\n");
        if (details.phonetic() != null) {
            rdfBuilder.append("    vocab:phonetic \"").append(details.phonetic()).append("\" ;\n");
        }
        if (details.translation() != null) {
            rdfBuilder.append("    vocab:translation \"").append(details.translation()).append("\"@pt ;\n");
        }
        if (details.meanings() != null && !details.meanings().isEmpty()) {
            for (int i = 0; i < details.meanings().size(); i++) {
                var meaning = details.meanings().get(i);
                String meaningUri = wordUri + "/meaning" + (i + 1);
                rdfBuilder.append("    vocab:hasMeaning <").append(meaningUri).append("> ;\n");
                rdfBuilder.append("\n<").append(meaningUri).append(">\n");
                rdfBuilder.append("    a vocab:Meaning ;\n");
                rdfBuilder.append("    vocab:partOfSpeech \"").append(meaning.partOfSpeech()).append("\" ;\n");
                for (var def : meaning.definitions()) {
                    rdfBuilder.append("    dct:description \"").append(def.definition().replace("\"", "\\\"")).append("\" ;\n");
                    if (def.example() != null) {
                        rdfBuilder.append("    vocab:example \"").append(def.example().replace("\"", "\\\"")).append("\" ;\n");
                    }
                }
                for (var synonym : meaning.synonyms()) {
                    String synonymUri = baseUri + synonym.toLowerCase().replace(" ", "_");
                    rdfBuilder.append("    vocab:hasSynonym <").append(synonymUri).append("> ;\n");
                }
                rdfBuilder.setLength(rdfBuilder.length() - 2);
                rdfBuilder.append(" .\n");
            }
        }
        rdfBuilder.setLength(rdfBuilder.length() - 2);
        rdfBuilder.append(" .\n");
        return rdfBuilder.toString();
    }

    public String getTranslation(String word) {
        return fetchTranslation(word);
    }

    public NestedWordDetailsDTO getNestedWordDetails(String word) {
        return getWordDetailsWithNesting(word);
    }
}