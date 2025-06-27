package com.backend.service;

import com.backend.domain.Course;
import com.backend.domain.Difficulty;
import com.backend.persistence.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
    public void delete(Long id) {
        courseRepository.deleteById(id);
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
}