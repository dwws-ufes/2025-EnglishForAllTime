package com.backend.controller;

import com.backend.domain.Course;
import com.backend.domain.Difficulty;
import com.backend.domain.User;
import com.backend.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @GetMapping
    public ResponseEntity<List<Course>> getAllCourses() {
        return ResponseEntity.ok(courseService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Course> getCourseById(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Course> createCourse(
            @RequestBody Course course, 
            Authentication authentication) {
        
        // Obter o usuário autenticado
        User authenticatedUser = (User) authentication.getPrincipal();
        
        // Definir o criador do curso
        course.setCreatedBy(authenticatedUser);
        
        // Criar o curso
        Course created = courseService.save(course);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Course> updateCourse(
            @PathVariable Long id, 
            @RequestBody Course course,
            Authentication authentication) {
        
        // Obter o usuário autenticado para auditoria
        User authenticatedUser = (User) authentication.getPrincipal();
        
        Course updated = courseService.update(id, course);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        courseService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/filter")
    public ResponseEntity<List<Course>> getCoursesByDifficulty(@RequestParam Difficulty difficulty) {
        return ResponseEntity.ok(courseService.findByDifficulty(difficulty));
    }
}