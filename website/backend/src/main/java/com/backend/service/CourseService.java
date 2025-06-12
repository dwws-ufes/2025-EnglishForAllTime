package com.backend.service;

import com.backend.domain.Course;
import com.backend.domain.Difficulty;

import java.util.List;

public interface CourseService {
    List<Course> findAll();
    Course findById(Long id);
    Course save(Course course);
    Course update(Long id, Course course);
    void delete(Long id);
    List<Course> findByDifficulty(Difficulty difficulty);
}