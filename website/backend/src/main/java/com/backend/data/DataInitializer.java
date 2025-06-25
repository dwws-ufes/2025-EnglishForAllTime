package com.backend.data;

import com.backend.domain.Course;
import com.backend.domain.Difficulty;
import com.backend.domain.User;
import com.backend.domain.UserRole;
import com.backend.persistence.CourseRepository;
import com.backend.persistence.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer implements CommandLineRunner {
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, CourseRepository courseRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        initAdmin();
        initAluno();
        initSampleCourses();
    }

    private void initAdmin() {
        if(userRepository.findByLogin("admin@englishforalltime.com") == null) {
            User admin = new User();
            admin.setLogin("admin@englishforalltime.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(UserRole.ADMIN);
            admin.setCreatedAt(java.time.LocalDateTime.now());

            userRepository.save(admin);

            System.out.println("✅ Usuário admin padrão criado com sucesso!");
            System.out.println("📧 Email: admin@englishforalltime.com");
            System.out.println("🔑 Senha: admin123");
            System.out.println("👑 Role: ADMIN");
        }
    }

    private void initAluno() {
        if(userRepository.findByLogin("aluno@englishforalltime.com") == null) {
            User aluno = new User();
            aluno.setLogin("aluno@englishforalltime.com");
            aluno.setPassword(passwordEncoder.encode("aluno123"));
            aluno.setRole(UserRole.USER);
            aluno.setCreatedAt(java.time.LocalDateTime.now());

            userRepository.save(aluno);

            System.out.println("✅ Usuário aluno padrão criado com sucesso!");
            System.out.println("📧 Email: aluno@englishforalltime.com");
            System.out.println("🔑 Senha: aluno123");
            System.out.println("👤 Role: USER");
        }
    }

    private void initSampleCourses() {
        // Verificar se já existem cursos
        if (courseRepository.count() > 0) {
            System.out.println("📚 Cursos já existem no banco de dados.");
            return;
        }

        // Buscar o usuário admin para ser o criador dos cursos
        User admin = userRepository.findByLogin("admin@englishforalltime.com");
        if (admin == null) {
            System.err.println("❌ Admin não encontrado para criar cursos de exemplo!");
            return;
        }

        System.out.println("🎓 Criando cursos de exemplo...");

        // Curso 1 - Iniciante
        Course curso1 = new Course();
        curso1.setTitle("English for Beginners - Basic Conversations");
        curso1.setDescription("Aprenda inglês do zero com conversações básicas do dia a dia. Este curso é perfeito para quem está começando a jornada no idioma inglês.");
        curso1.setDifficulty(Difficulty.BEGINNER);
        curso1.setThumbnailUrl("https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400");
        curso1.setCreatedBy(admin);
        curso1.setCreatedAt(java.time.LocalDateTime.now().minusDays(10));
        courseRepository.save(curso1);

        // Curso 2 - Intermediário
        Course curso2 = new Course();
        curso2.setTitle("Business English - Professional Communication");
        curso2.setDescription("Desenvolva suas habilidades de comunicação profissional em inglês. Ideal para quem trabalha em ambientes corporativos.");
        curso2.setDifficulty(Difficulty.INTERMEDIATE);
        curso2.setThumbnailUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400");
        curso2.setCreatedBy(admin);
        curso2.setCreatedAt(java.time.LocalDateTime.now().minusDays(8));
        courseRepository.save(curso2);

        // Curso 3 - Avançado
        Course curso3 = new Course();
        curso3.setTitle("Advanced English Grammar & Writing");
        curso3.setDescription("Domine a gramática avançada e técnicas de escrita em inglês. Para estudantes que querem alcançar a fluência completa.");
        curso3.setDifficulty(Difficulty.ADVANCED);
        curso3.setThumbnailUrl("https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400");
        curso3.setCreatedBy(admin);
        curso3.setCreatedAt(java.time.LocalDateTime.now().minusDays(5));
        courseRepository.save(curso3);

        // Curso 4 - Iniciante
        Course curso4 = new Course();
        curso4.setTitle("English Pronunciation Masterclass");
        curso4.setDescription("Melhore sua pronúncia em inglês com técnicas comprovadas e exercícios práticos.");
        curso4.setDifficulty(Difficulty.BEGINNER);
        curso4.setThumbnailUrl("https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400");
        curso4.setCreatedBy(admin);
        curso4.setCreatedAt(java.time.LocalDateTime.now().minusDays(3));
        courseRepository.save(curso4);

        // Curso 5 - Intermediário
        Course curso5 = new Course();
        curso5.setTitle("Travel English - Confidence for Your Adventures");
        curso5.setDescription("Prepare-se para viajar com confiança! Aprenda inglês essencial para turismo e viagens internacionais.");
        curso5.setDifficulty(Difficulty.INTERMEDIATE);
        curso5.setThumbnailUrl("https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400");
        curso5.setCreatedBy(admin);
        curso5.setCreatedAt(java.time.LocalDateTime.now().minusDays(1));
        courseRepository.save(curso5);

        System.out.println("✅ 5 cursos de exemplo criados com sucesso!");
        System.out.println("📚 Cursos disponíveis:");
        System.out.println("  1. English for Beginners (BEGINNER)");
        System.out.println("  2. Business English (INTERMEDIATE)");
        System.out.println("  3. Advanced Grammar (ADVANCED)");
        System.out.println("  4. Pronunciation Masterclass (BEGINNER)");
        System.out.println("  5. Travel English (INTERMEDIATE)");
    }

}
