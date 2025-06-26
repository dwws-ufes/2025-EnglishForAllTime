package com.backend.controller;

import com.backend.domain.Course;
import com.backend.domain.Difficulty;
import com.backend.domain.User;
import com.backend.service.AuthenticationService;
import com.backend.service.AuthorizationService;
import com.backend.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;
    private final AuthorizationService authorizationService;

    @GetMapping
    public ResponseEntity<List<Course>> getAllCourses() {
        try {
            System.out.println("🔍 [GET_COURSES] Iniciando busca de cursos...");

            List<Course> courses = courseService.findAll();

            System.out.println("📚 [GET_COURSES] Total de cursos encontrados: " + courses.size());

            // Log detalhado dos cursos
            for (int i = 0; i < Math.min(courses.size(), 3); i++) {
                Course course = courses.get(i);
                System.out.println("📖 [GET_COURSES] Curso " + (i+1) + ": " + course.getTitle());
                System.out.println("   - ID: " + course.getId());
                System.out.println("   - Dificuldade: " + course.getDifficulty());
                System.out.println("   - Criado por: " + (course.getCreatedBy() != null ? course.getCreatedBy().getLogin() : "N/A"));
            }

            System.out.println("✅ [GET_COURSES] Retornando cursos com sucesso!");
            return ResponseEntity.ok(courses);

        } catch (Exception e) {
            System.err.println("❌ [GET_COURSES] Erro no controller: " + e.getClass().getSimpleName());
            System.err.println("❌ [GET_COURSES] Mensagem: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    @GetMapping("/{id}")
    public ResponseEntity<Course> getCourseById(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Course> createCourse(
            @RequestBody Course course,
            Authentication authentication) {

        try {
            User authenticatedUser = null;

            // Método 1: Cast direto (preferido)
            if (authentication.getPrincipal() instanceof User) {
                authenticatedUser = (User) authentication.getPrincipal();
            }
            // Método 2: Buscar por username se cast falhar
            else if (authentication.getPrincipal() instanceof UserDetails) {
                UserDetails userDetails = (UserDetails) authentication.getPrincipal();
                String username = userDetails.getUsername();
                // Buscar o usuário no banco pelo username
                authenticatedUser = authorizationService.loadUserByUsername(username);
            }
            // Método 3: Último recurso - buscar por nome
            else {
                String username = authentication.getName();
                authenticatedUser = authorizationService.loadUserByUsername(username);
            }

            if (authenticatedUser == null) {
                System.err.println("❌ Usuário não encontrado!");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            System.out.println("✅ Usuário encontrado: " + authenticatedUser.getLogin());

            // Definir o criador do curso
            course.setCreatedBy(authenticatedUser);

            // Criar o curso
            Course created = courseService.save(course);

            return ResponseEntity.status(HttpStatus.CREATED).body(created);

        } catch (Exception e) {
            System.err.println("❌ Erro: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
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