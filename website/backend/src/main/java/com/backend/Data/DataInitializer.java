package com.backend.Data;

import com.backend.Domain.User;
import com.backend.Persistence.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {
    @Bean
    public CommandLineRunner initAdmin(UserRepository repo, PasswordEncoder encoder) {
        return args -> {
            String adminEmail = "admin@englishforalltime.com";
            if (repo.findByEmail(adminEmail).isEmpty()) {
                User admin = new User(null, "Admin", adminEmail, encoder.encode("admin123"));
                repo.save(admin);
                System.out.println("✅ Admin criado com sucesso.");
            }
        };
    }
}
