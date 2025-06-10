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
                .orElseThrow(() -> new NoSuchElementException("Course not found"));
    }

    @Override
    public Course save(Course course) {
        return courseRepository.save(course);
    }

    @Override
    public Course update(Long id, Course course) {
        Course existing = findById(id);
        existing.setTitle(course.getTitle());
        existing.setDifficulty(course.getDifficulty());
        return courseRepository.save(existing);
    }

    @Override
    public void delete(Long id) {
        courseRepository.deleteById(id);
    }
}