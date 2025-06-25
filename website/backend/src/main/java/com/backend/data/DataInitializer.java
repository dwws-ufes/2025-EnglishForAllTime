package com.backend.data;

import com.backend.domain.User;
import com.backend.domain.UserRole;
import com.backend.persistence.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer implements CommandLineRunner {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        initAdmin();
        initAluno();
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

}
