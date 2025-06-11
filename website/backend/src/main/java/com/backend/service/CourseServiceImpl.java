package com.backend.service;

import com.backend.domain.Course;
import com.backend.persistence.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;

    @Override
    public List<Course> findAll() {
        return courseRepository.findAll();
    }

    @Override
    public Course findById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Curso não encontrado"));
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
        Course existing = findById(id);
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
    public List<Course> findByDifficulty(String difficulty) {
        return courseRepository.findByDifficulty(
                com.backend.domain.Difficulty.valueOf(difficulty.toUpperCase())
        );
    }
}