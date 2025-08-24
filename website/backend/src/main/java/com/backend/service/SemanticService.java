package com.backend.service;

import org.apache.jena.query.*;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;
import java.util.Optional;

@Service
@Slf4j
public class SemanticService {

    private final Model model;
    private static final String DBPEDIA_ENDPOINT = "https://dbpedia.org/sparql";
    private static final String WIKIDATA_ENDPOINT = "https://query.wikidata.org/sparql";

    public SemanticService() {
        this.model = ModelFactory.createDefaultModel();
        log.info("SemanticService inicializado");
    }

    public Optional<String> getTranslation(String word) {
        try {
            String sparqlQuery = buildTranslationQuery(word);

            try (QueryExecution qexec = QueryExecutionFactory.sparqlService(WIKIDATA_ENDPOINT, sparqlQuery)) {
                ResultSet results = qexec.execSelect();

                if (results.hasNext()) {
                    QuerySolution solution = results.nextSolution();
                    if (solution.getLiteral("labelPt") != null) {
                        String translation = solution.getLiteral("labelPt").getString();
                        log.debug("Tradução encontrada para '{}': {}", word, translation);
                        return Optional.of(translation);
                    }
                }

                log.warn("Nenhuma tradução encontrada para a palavra: {}", word);
                return Optional.empty();
            }
        } catch (Exception e) {
            log.error("Erro ao buscar tradução para '{}': {}", word, e.getMessage());
            return Optional.empty();
        }
    }

    private String buildTranslationQuery(String word) {
        return """
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            PREFIX wdt: <http://www.wikidata.org/prop/direct/>
            
            SELECT ?labelPt WHERE {
              ?item rdfs:label "%s"@en .
              ?item rdfs:label ?labelPt .
              FILTER(lang(?labelPt) = "pt")
            }
            LIMIT 1
            """.formatted(word);
    }

    public Optional<String> getDefinition(String word) {
        try {
            String sparqlQuery = buildDefinitionQuery(word);

            try (QueryExecution qexec = QueryExecutionFactory.sparqlService(DBPEDIA_ENDPOINT, sparqlQuery)) {
                ResultSet results = qexec.execSelect();

                if (results.hasNext()) {
                    QuerySolution solution = results.nextSolution();
                    if (solution.getLiteral("abstract") != null) {
                        String definition = solution.getLiteral("abstract").getString();

                        if (definition.length() > 500) {
                            definition = definition.substring(0, 500) + "...";
                        }

                        log.debug("Definição encontrada para '{}': {}", word, definition.substring(0, Math.min(100, definition.length())));
                        return Optional.of(definition);
                    }
                }

                log.warn("Nenhuma definição encontrada para a palavra: {}", word);
                return Optional.empty();
            }
        } catch (Exception e) {
            log.error("Erro ao buscar definição para '{}': {}", word, e.getMessage());
            return Optional.empty();
        }
    }

    private String buildDefinitionQuery(String word) {
        String capitalizedWord = word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase();

        return """
            PREFIX dbo: <http://dbpedia.org/ontology/>
            PREFIX dbr: <http://dbpedia.org/resource/>

            SELECT ?abstract WHERE {
                dbr:%s dbo:abstract ?abstract .
                FILTER (lang(?abstract) = 'en')
            }
            LIMIT 1
            """.formatted(capitalizedWord);
    }

    public ResultSet executeQuery(String sparqlQuery) {
        Query query = QueryFactory.create(sparqlQuery);
        try (QueryExecution qexec = QueryExecutionFactory.create(query, model)) {
            return ResultSetFactory.copyResults(qexec.execSelect());
        }
    }
}