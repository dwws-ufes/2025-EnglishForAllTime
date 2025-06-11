package com.backend.persistence;

import com.backend.domain.Course;
import com.backend.domain.Difficulty;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByDifficulty(Difficulty difficulty);
}
