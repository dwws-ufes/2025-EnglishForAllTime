package com.backend.semantic;

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

    public SemanticService() {
        this.model = ModelFactory.createDefaultModel();
        log.info("SemanticService inicializado");
    }

    public Optional<String> getDefinition(String word) {
        try {
            String sparqlQuery = buildDefinitionQuery(word);
            QueryExecution qexec = QueryExecutionFactory.sparqlService(DBPEDIA_ENDPOINT, sparqlQuery);

            ResultSet results = qexec.execSelect();

            if (results.hasNext()) {
                QuerySolution solution = results.nextSolution();
                String definition = solution.getLiteral("abstract").getString();

                // Limitar o tamanho da definição para ser mais concisa
                if (definition.length() > 500) {
                    definition = definition.substring(0, 500) + "...";
                }

                log.debug("Definição encontrada para '{}': {}", word, definition.substring(0, Math.min(100, definition.length())));
                qexec.close();
                return Optional.of(definition);
            }

            qexec.close();
            log.warn("Nenhuma definição encontrada para a palavra: {}", word);
            return Optional.empty();

        } catch (Exception e) {
            log.error("Erro ao buscar definição para '{}': {}", word, e.getMessage());
            return Optional.empty();
        }
    }

    private String buildDefinitionQuery(String word) {
        // Capitalizar a primeira letra da palavra para corresponder ao formato DBpedia
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