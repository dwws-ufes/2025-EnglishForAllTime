package com.backend.service;

import com.backend.dto.SemanticResource;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class LinkedDataService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public LinkedDataService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    public List<SemanticResource> fetchFromDBpedia(String word) {
        log.info("🌍 Consultando DBpedia para: {}", word);

        // Validação de entrada
        if (word == null || word.trim().isEmpty() || word.length() > 50) {
            log.warn("⚠️ Palavra inválida para DBpedia: {}", word);
            return new ArrayList<>();
        }

        String sparqlQuery = buildSparqlQuery(word.trim());

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            headers.setAccept(List.of(MediaType.APPLICATION_JSON));
            headers.set("User-Agent", "EnglishForAllTime/1.0");
            headers.set("Connection", "close");

            MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
            formData.add("query", sparqlQuery);
            formData.add("format", "application/json");
            formData.add("timeout", "10000");

            HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(formData, headers);

            log.debug("🔍 Query SPARQL: {}", sparqlQuery);

            ResponseEntity<String> response = restTemplate.exchange(
                    "https://dbpedia.org/sparql", HttpMethod.POST, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List<SemanticResource> resources = parseDBpediaResponse(response.getBody());
                log.info("✅ DBpedia retornou {} recursos para '{}'", resources.size(), word);
                return resources;
            } else {
                log.warn("⚠️ DBpedia retornou status não sucessful: {}", response.getStatusCode());
            }

        } catch (Exception e) {
            log.error("❌ Erro ao consultar DBpedia para '{}': {}", word, e.getMessage(), e);
        }

        return new ArrayList<>();
    }

    private String buildSparqlQuery(String word) {
        String escapedWord = word.toLowerCase()
                .replace("'", "\\'")
                .replace("\"", "\\\"")
                .replace("\\", "\\\\");

        return String.format("""
                PREFIX dbo: <http://dbpedia.org/ontology/>
                PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

                SELECT DISTINCT ?resource ?label ?abstract ?type WHERE {
                    ?resource rdfs:label ?label .
                    OPTIONAL { ?resource dbo:abstract ?abstract . }
                    OPTIONAL { ?resource rdf:type ?type . }
                    FILTER(LANG(?label) = "en")
                    FILTER(CONTAINS(LCASE(STR(?label)), "%s"))
                    FILTER(STRLEN(STR(?label)) < 100)
                } LIMIT 5
                """, escapedWord);
    }

    private List<SemanticResource> parseDBpediaResponse(String jsonResponse) {
        List<SemanticResource> resources = new ArrayList<>();

        try {
            JsonNode root = objectMapper.readTree(jsonResponse);
            JsonNode results = root.path("results").path("bindings");

            if (results.isArray()) {
                for (JsonNode binding : results) {
                    SemanticResource resource = new SemanticResource();

                    if (binding.has("resource")) {
                        resource.setUri(binding.path("resource").path("value").asText());
                    }

                    if (binding.has("label")) {
                        resource.setLabel(binding.path("label").path("value").asText());
                    }

                    if (binding.has("abstract")) {
                        String abstractText = binding.path("abstract").path("value").asText();
                        if (abstractText.length() > 300) {
                            abstractText = abstractText.substring(0, 300) + "...";
                        }
                        resource.setDescription(abstractText);
                    }

                    if (binding.has("type")) {
                        resource.setType(binding.path("type").path("value").asText());
                    }

                    resources.add(resource);
                }
            }
        } catch (Exception e) {
            log.error("❌ Erro ao parsear resposta da DBpedia: {}", e.getMessage(), e);
        }

        return resources;
    }
}