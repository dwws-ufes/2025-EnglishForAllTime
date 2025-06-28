package com.backend.service;

import com.backend.domain.Course;
import com.backend.domain.Difficulty;
import com.backend.persistence.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;

    @Override
    public List<Course> findAll() {
        return courseRepository.findAll();
    }

    @Override
    public Optional<Course> findById(Long id) {
        return courseRepository.findById(id);
    }

    @Override
    public Course save(Course course) {
        // Garantir que createdAt seja sempre preenchido
        if (course.getCreatedAt() == null) {
            course.setCreatedAt(java.time.LocalDateTime.now());
        }
        return courseRepository.save(course);
    }

    @Override
    public Course update(Long id, Course course) {
        // CORREÇÃO: Usar .get() para extrair o Course do Optional
        Course existing = findById(id)
                .orElseThrow(() -> new RuntimeException("Curso não encontrado com ID: " + id));

        existing.setTitle(course.getTitle());
        existing.setDescription(course.getDescription());
        existing.setDifficulty(course.getDifficulty());
        existing.setThumbnailUrl(course.getThumbnailUrl());
        existing.setCreatedBy(course.getCreatedBy());

        return courseRepository.save(existing);
    }


    @Override
    @Transactional
    public void delete(Long id) {
        try {
            System.out.println("🗑️ [DELETE_SERVICE] Iniciando exclusão do curso ID: " + id);

            // Verificar se o curso existe
            Optional<Course> courseOpt = courseRepository.findById(id);
            if (courseOpt.isEmpty()) {
                System.err.println("❌ [DELETE_SERVICE] Curso não encontrado: " + id);
                throw new NoSuchElementException("Curso não encontrado com ID: " + id);
            }

            Course course = courseOpt.get();
            System.out.println("📚 [DELETE_SERVICE] Curso encontrado: " + course.getTitle());

            // Verificar se há módulos associados
//            if (course.getModules() != null && !course.getModules().isEmpty()) {
//                System.out.println("📝 [DELETE_SERVICE] Curso possui " + course.getModules().size() + " módulo(s) que serão excluídos em cascata");
//            }

            // A exclusão será feita em cascata devido à configuração cascade = CascadeType.ALL, orphanRemoval = true
            courseRepository.deleteById(id);

            System.out.println("✅ [DELETE_SERVICE] Curso e módulos relacionados excluídos com sucesso!");

        } catch (Exception e) {
            System.err.println("❌ [DELETE_SERVICE] Erro ao excluir curso: " + e.getClass().getSimpleName());
            System.err.println("❌ [DELETE_SERVICE] Mensagem: " + e.getMessage());
            e.printStackTrace();

            // Relançar a exceção para que o controller possa tratá-la
            throw new RuntimeException("Erro ao excluir o curso: " + e.getMessage(), e);
        }
    }

    @Override
    public List<Course> findByDifficulty(Difficulty difficulty) {
        try {
            return courseRepository.findByDifficulty(
                    com.backend.domain.Difficulty.valueOf(difficulty.name().toUpperCase())
            );
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid difficulty level: " + difficulty + ". Valid values are: "
                    + Difficulty.BEGINNER + ", " + Difficulty.INTERMEDIATE + ", " + Difficulty.ADVANCED);
        }
    }

    @Override
    public List<Course> findAllSorted(String sortBy, String sortDirection) {
        Sort sort;

        // Definir direção da ordenação
        Sort.Direction direction = "desc".equalsIgnoreCase(sortDirection)
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;

        // Validar e mapear campos de ordenação
        switch (sortBy.toLowerCase()) {
            case "title":
                sort = Sort.by(direction, "title");
                break;
            case "difficulty":
                sort = Sort.by(direction, "difficulty");
                break;
            default:
                // Ordenação padrão por data de criação (mais recentes primeiro)
                sort = Sort.by(Sort.Direction.DESC, "createdAt");
                break;
        }

        return courseRepository.findAll(sort);
    }
}