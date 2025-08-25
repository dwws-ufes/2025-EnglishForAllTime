package com.backend.service;

import com.backend.domain.Course;
// import com.backend.domain.Module;
import com.backend.persistence.CourseRepository;
import org.apache.jena.rdf.model.*;
import org.apache.jena.vocabulary.RDF;
import org.apache.jena.vocabulary.RDFS;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;
import com.backend.dto.VocabularyMetadataDTO;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import java.io.StringWriter;

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
        // Resource ModuleClass = model.createResource(NAMESPACE + "Module");
        Resource WordClass = model.createResource(NAMESPACE + "Word");

        // Adicionar metadados das classes
        CourseClass.addProperty(RDFS.label, "Course");
        CourseClass.addProperty(RDFS.comment, "Represents an English course");

        // ModuleClass.addProperty(RDFS.label, "Module");
        // ModuleClass.addProperty(RDFS.comment, "Represents a course module");

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

            // TODO: Implementar processamento de módulos quando a entidade Module estiver criada
            /*
            // Processar módulos do curso
            for (Module module : course.getModules()) {
                Resource moduleResource = model.createResource(RESOURCE_BASE + "module/" + module.getId());
                moduleResource.addProperty(RDF.type, ModuleClass);
                moduleResource.addProperty(RDFS.label, module.getName());
                moduleResource.addProperty(belongsToCourse, courseResource);

                // Processar palavras do módulo
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
                        }
                    }
                }
            }
            */
        }

        // Serializar modelo para Turtle
        StringWriter writer = new StringWriter();
        model.write(writer, "TURTLE");

        log.info("Vocabulário RDF gerado com {} triplas", model.size());
        return writer.toString();
    }

    public VocabularyMetadataDTO getVocabularyMetadata() {
        try {
            // Usar dados dos cursos disponíveis
            List<Course> courses = courseRepository.findAll();

            return new VocabularyMetadataDTO(
                    "English For All Time Vocabulary",
                    "Vocabulário completo de inglês para aprendizado com definições e traduções",
                    "1.0.0",
                    "English For All Time Team",
                    LocalDateTime.now(),
                    0, // TODO: calcular totalWords quando módulos estiverem implementados
                    0, // TODO: calcular totalDefinitions quando módulos estiverem implementados
                    Arrays.asList("General", "Technical", "Academic", "Business"),
                    "MIT License",
                    "RDF/Turtle"
            );

        } catch (Exception e) {
            throw new RuntimeException("Erro ao gerar metadados do vocabulário", e);
        }
    }
}