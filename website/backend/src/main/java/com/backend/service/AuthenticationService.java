package com.backend.service;

import com.backend.domain.User;
import com.backend.domain.UserRole;
import com.backend.dto.AuthenticationDTO;
import com.backend.dto.LoginResponseDTO;
import com.backend.dto.RegisterDTO;
import com.backend.exception.UserAlreadyExistsException;
import com.backend.exception.UserNotAuthenticatedException;
import com.backend.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthenticationService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;

    public LoginResponseDTO login(AuthenticationDTO data) {
        try {
            var authenticationToken = new UsernamePasswordAuthenticationToken(data.login(), data.password());
            var auth = this.authenticationManager.authenticate(authenticationToken);
            
            var token = tokenService.generateToken((User) auth.getPrincipal());
            return new LoginResponseDTO(token);
        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("Credenciais inválidas");
        }
    }

    public void register(RegisterDTO data) {
        if (this.userRepository.findByLogin(data.login()) != null) {
            throw new UserAlreadyExistsException("Usuário já existe");
        }

        User newUser = new User(data.login(), passwordEncoder.encode(data.password()), data.role());
        this.userRepository.save(newUser);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getProfile(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UserNotAuthenticatedException("Usuário não autenticado");
        }

        User user = (User) authentication.getPrincipal();
        return Map.of(
            "login", user.getLogin(),
            "role", user.getRole()
        );
    }
}