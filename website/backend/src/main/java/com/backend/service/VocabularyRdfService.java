package com.backend.service;

import com.backend.domain.Course;
import com.backend.domain.Module;
import com.backend.persistence.CourseRepository;
import org.apache.jena.rdf.model.*;
import org.apache.jena.vocabulary.RDF;
import org.apache.jena.vocabulary.RDFS;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

import java.io.StringWriter;
import java.util.List;

@Service
@Slf4j
public class VocabularyRdfService {

    @Autowired
    private CourseRepository courseRepository;

    private static final String NAMESPACE = "http://englishforalltime.com/ns/vocab#";
    private static final String RESOURCE_BASE = "http://englishforalltime.com/resource/";

    public String generateVocabularyRdf() {
        Model model = ModelFactory.createDefaultModel();

        // Definir prefixos
        model.setNsPrefix("vocab", NAMESPACE);
        model.setNsPrefix("res", RESOURCE_BASE);
        model.setNsPrefix("rdfs", RDFS.getURI());

        // Criar propriedades do vocabulário
        Property hasWord = model.createProperty(NAMESPACE + "hasWord");
        Property hasTranslation = model.createProperty(NAMESPACE + "hasTranslation");
        Property belongsToModule = model.createProperty(NAMESPACE + "belongsToModule");
        Property belongsToCourse = model.createProperty(NAMESPACE + "belongsToCourse");
        Property hasDifficulty = model.createProperty(NAMESPACE + "hasDifficulty");

        // Definir classes
        Resource CourseClass = model.createResource(NAMESPACE + "Course");
        Resource ModuleClass = model.createResource(NAMESPACE + "Module");
        Resource WordClass = model.createResource(NAMESPACE + "Word");

        // Adicionar metadados das classes
        CourseClass.addProperty(RDFS.label, "Course");
        CourseClass.addProperty(RDFS.comment, "Represents an English course");

        ModuleClass.addProperty(RDFS.label, "Module");
        ModuleClass.addProperty(RDFS.comment, "Represents a course module");

        WordClass.addProperty(RDFS.label, "Word");
        WordClass.addProperty(RDFS.comment, "Represents an English word with translation");

        // Buscar dados do banco
        List<Course> courses = courseRepository.findAll();

        for (Course course : courses) {
            // Criar recurso do curso
            Resource courseResource = model.createResource(RESOURCE_BASE + "course/" + course.getId());
            courseResource.addProperty(RDF.type, CourseClass);
            courseResource.addProperty(RDFS.label, course.getName());
            courseResource.addProperty(hasDifficulty, course.getDifficulty().toString());

            // Processar módulos do curso
            for (Module module : course.getModules()) {
                Resource moduleResource = model.createResource(RESOURCE_BASE + "module/" + module.getId());
                moduleResource.addProperty(RDF.type, ModuleClass);
                moduleResource.addProperty(RDFS.label, module.getName());
                moduleResource.addProperty(belongsToCourse, courseResource);

                // Processar palavras do módulo (assumindo que existe uma lista de palavras)
                if (module.getVocabulary() != null && !module.getVocabulary().isEmpty()) {
                    String[] vocabularyEntries = module.getVocabulary().split(",");

                    for (int i = 0; i < vocabularyEntries.length; i++) {
                        String word = vocabularyEntries[i].trim();
                        if (!word.isEmpty()) {
                            Resource wordResource = model.createResource(RESOURCE_BASE + "word/" +
                                    course.getId() + "/" + module.getId() + "/" + i);

                            wordResource.addProperty(RDF.type, WordClass);
                            wordResource.addProperty(hasWord, word);
                            wordResource.addProperty(belongsToModule, moduleResource);
                            wordResource.addProperty(belongsToCourse, courseResource);

                            // Tentar buscar tradução via SemanticService (opcional)
                            // wordResource.addProperty(hasTranslation, translation);
                        }
                    }
                }
            }
        }

        // Serializar modelo para Turtle
        StringWriter writer = new StringWriter();
        model.write(writer, "TURTLE");

        log.info("Vocabulário RDF gerado com {} triplas", model.size());
        return writer.toString();
    }
}