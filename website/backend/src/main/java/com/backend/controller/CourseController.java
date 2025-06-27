package com.backend.controller;

import com.backend.domain.Course;
import com.backend.domain.Difficulty;
import com.backend.domain.User;
import com.backend.domain.UserRole;
import com.backend.service.AuthenticationService;
import com.backend.service.AuthorizationService;
import com.backend.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;
    private final AuthorizationService authorizationService;
    private final AuthenticationService authenticationService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllCourses() {
        try {
            System.out.println("🔍 [GET_COURSES] Iniciando busca de cursos...");

            List<Course> courses = courseService.findAll();
            System.out.println("📚 [GET_COURSES] Total de cursos encontrados: " + courses.size());

            // Converter manualmente para Map para evitar problemas de serialização
            List<Map<String, Object>> coursesResponse = courses.stream().map(course -> {
                Map<String, Object> courseMap = new HashMap<>();
                courseMap.put("id", course.getId());
                courseMap.put("title", course.getTitle());
                courseMap.put("description", course.getDescription());
                courseMap.put("difficulty", course.getDifficulty() != null ? course.getDifficulty().toString() : null);
                courseMap.put("createdAt", course.getCreatedAt() != null ? course.getCreatedAt().toString() : null);
                courseMap.put("createdBy", course.getCreatedBy() != null ? course.getCreatedBy().getLogin() : null);

                System.out.println("📖 [GET_COURSES] Curso serializado: " + course.getTitle());
                return courseMap;
            }).collect(Collectors.toList());

            System.out.println("✅ [GET_COURSES] Retornando " + coursesResponse.size() + " cursos!");
            return ResponseEntity.ok(coursesResponse);

        } catch (Exception e) {
            System.err.println("❌ [GET_COURSES] Erro no controller: " + e.getClass().getSimpleName());
            System.err.println("❌ [GET_COURSES] Mensagem: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.emptyList());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Course> getCourseById(@PathVariable Long id) {
        try {
            System.out.println("🔍 [GET_COURSE_BY_ID] Buscando curso com ID: " + id);

            Optional<Course> courseOpt = courseService.findById(id);
            if (courseOpt.isEmpty()) {
                System.err.println("❌ [GET_COURSE_BY_ID] Curso não encontrado: " + id);
                return ResponseEntity.notFound().build();
            }

            Course course = courseOpt.get();
            System.out.println("✅ [GET_COURSE_BY_ID] Curso encontrado: " + course.getTitle());

            return ResponseEntity.ok(course);

        } catch (Exception e) {
            System.err.println("❌ [GET_COURSE_BY_ID] Erro: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
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
    public ResponseEntity<Map<String, Object>> updateCourse(
            @PathVariable Long id,
            @RequestBody Map<String, Object> courseData,
            Authentication authentication) {
        try {
            System.out.println("🔄 [UPDATE_COURSE] Iniciando atualização do curso ID: " + id);
            System.out.println("📝 [UPDATE_COURSE] Dados recebidos: " + courseData);

            // Buscar o curso existente
            Optional<Course> existingCourseOpt = courseService.findById(id);
            if (existingCourseOpt.isEmpty()) {
                System.err.println("❌ [UPDATE_COURSE] Curso não encontrado: " + id);
                return ResponseEntity.notFound().build();
            }

            Course existingCourse = existingCourseOpt.get();
            System.out.println("📖 [UPDATE_COURSE] Curso encontrado: " + existingCourse.getTitle());

            // Verificar se o usuário é admin ou o criador do curso
            String userLogin = authentication.getName();
            User currentUser = authorizationService.loadUserByUsername(userLogin);

            boolean isAdmin = currentUser.getRole() == UserRole.ADMIN;
            boolean isCreator = existingCourse.getCreatedBy() != null &&
                    existingCourse.getCreatedBy().equals(currentUser);

            if (!isAdmin && !isCreator) {
                System.err.println("❌ [UPDATE_COURSE] Usuário não autorizado: " + userLogin);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Você não tem permissão para editar este curso"));
            }

            // Atualizar apenas os campos permitidos
            if (courseData.containsKey("title")) {
                String title = (String) courseData.get("title");
                if (title != null && !title.trim().isEmpty()) {
                    existingCourse.setTitle(title.trim());
                    System.out.println("📝 [UPDATE_COURSE] Título atualizado: " + title);
                }
            }

            if (courseData.containsKey("description")) {
                String description = (String) courseData.get("description");
                if (description != null && !description.trim().isEmpty()) {
                    existingCourse.setDescription(description.trim());
                    System.out.println("📝 [UPDATE_COURSE] Descrição atualizada");
                }
            }

            if (courseData.containsKey("difficulty")) {
                String difficultyStr = (String) courseData.get("difficulty");
                if (difficultyStr != null && !difficultyStr.trim().isEmpty()) {
                    try {
                        Difficulty difficulty = Difficulty.valueOf(difficultyStr.toUpperCase());
                        existingCourse.setDifficulty(difficulty);
                        System.out.println("📝 [UPDATE_COURSE] Dificuldade atualizada: " + difficulty);
                    } catch (IllegalArgumentException e) {
                        System.err.println("❌ [UPDATE_COURSE] Dificuldade inválida: " + difficultyStr);
                        return ResponseEntity.badRequest()
                                .body(Map.of("error", "Dificuldade inválida: " + difficultyStr));
                    }
                }
            }

            // Salvar as alterações
            Course updatedCourse = courseService.save(existingCourse);
            System.out.println("✅ [UPDATE_COURSE] Curso atualizado com sucesso!");

            // Retornar resposta formatada
            Map<String, Object> response = new HashMap<>();
            response.put("id", updatedCourse.getId());
            response.put("title", updatedCourse.getTitle());
            response.put("description", updatedCourse.getDescription());
            response.put("difficulty", updatedCourse.getDifficulty() != null ? updatedCourse.getDifficulty().toString() : null);
            response.put("createdAt", updatedCourse.getCreatedAt() != null ? updatedCourse.getCreatedAt().toString() : null);
            response.put("createdBy", updatedCourse.getCreatedBy() != null ? updatedCourse.getCreatedBy().getLogin() : null);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ [UPDATE_COURSE] Erro inesperado: " + e.getClass().getSimpleName());
            System.err.println("❌ [UPDATE_COURSE] Mensagem: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erro interno do servidor"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteCourse(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            System.out.println("🗑️ [DELETE_COURSE] Iniciando exclusão do curso ID: " + id);

            // Verificar se o curso existe
            Optional<Course> courseOpt = courseService.findById(id);
            if (courseOpt.isEmpty()) {
                System.err.println("❌ [DELETE_COURSE] Curso não encontrado: " + id);
                return ResponseEntity.notFound().build();
            }

            Course course = courseOpt.get();
            System.out.println("📚 [DELETE_COURSE] Curso encontrado: " + course.getTitle());

            // Verificar permissões do usuário
            String userLogin = authentication.getName();
            User currentUser = authorizationService.loadUserByUsername(userLogin);

            boolean isAdmin = currentUser.getRole() == UserRole.ADMIN;
            boolean isCreator = course.getCreatedBy() != null && course.getCreatedBy().equals(currentUser);

            if (!isAdmin && !isCreator) {
                System.err.println("❌ [DELETE_COURSE] Usuário não autorizado: " + userLogin);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Você não tem permissão para excluir este curso"));
            }

            // Informações sobre módulos relacionados
//            int moduleCount = course.getModules() != null ? course.getModules().size() : 0;
//            if (moduleCount > 0) {
//                System.out.println("⚠️ [DELETE_COURSE] O curso possui " + moduleCount + " módulo(s) que serão excluídos");
//            }

            // Executar exclusão
            courseService.delete(id);
            System.out.println("✅ [DELETE_COURSE] Curso excluído com sucesso!");

            // Retornar resposta de sucesso com informações
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Curso excluído com sucesso");
            response.put("courseId", id);
            response.put("courseTitle", course.getTitle());
//            response.put("modulesDeleted", moduleCount);

            return ResponseEntity.ok(response);

        } catch (NoSuchElementException e) {
            System.err.println("❌ [DELETE_COURSE] Curso não encontrado: " + e.getMessage());
            return ResponseEntity.notFound().build();

        } catch (RuntimeException e) {
            System.err.println("❌ [DELETE_COURSE] Erro de negócio: " + e.getMessage());
            e.printStackTrace();
            
            // Verificar se é erro de constraint de chave estrangeira
            if (e.getMessage().toLowerCase().contains("constraint") || 
                e.getMessage().toLowerCase().contains("foreign key") ||
                e.getMessage().toLowerCase().contains("referential integrity")) {
                
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of(
                            "error", "Não é possível excluir este curso pois ele possui dados relacionados",
                            "details", "O curso pode ter módulos, matrículas ou outras informações associadas"
                        ));
            }
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                        "error", "Erro ao excluir o curso",
                        "details", e.getMessage()
                    ));

        } catch (Exception e) {
            System.err.println("❌ [DELETE_COURSE] Erro inesperado: " + e.getClass().getSimpleName());
            System.err.println("❌ [DELETE_COURSE] Mensagem: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                        "error", "Erro interno do servidor",
                        "details", e.getMessage()
                    ));
        }
    }

    @GetMapping("/filter")
    public ResponseEntity<List<Course>> getCoursesByDifficulty(@RequestParam Difficulty difficulty) {
        return ResponseEntity.ok(courseService.findByDifficulty(difficulty));
    }
}