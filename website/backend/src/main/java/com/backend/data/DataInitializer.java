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
    }

    private void initAdmin() {
        if(userRepository.findByLogin("admin@englishforalltime.com") == null) {
            User admin = new User();
            admin.setLogin("admin@englishforalltime.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(UserRole.ADMIN);

            userRepository.save(admin);

            System.out.println("Usuário admin padrão criado com sucesso!");
        }
    }
}
