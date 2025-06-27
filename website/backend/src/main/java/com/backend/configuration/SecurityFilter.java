package com.backend.configuration;

import com.backend.Util.DebugUtil;
import com.backend.persistence.UserRepository;
import com.backend.service.TokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class SecurityFilter extends OncePerRequestFilter {

    private final TokenService tokenService;
    private final UserRepository userRepository;
    private final DebugUtil debugUtil;

    public SecurityFilter(TokenService tokenService, UserRepository userRepository, DebugUtil debugUtil) {
        this.tokenService = tokenService;
        this.userRepository = userRepository;
        this.debugUtil = debugUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String requestURI = request.getRequestURI();
        String method = request.getMethod();

        debugUtil.debug("🔍 [SECURITY_FILTER]", method + " " + requestURI);

        var token = this.recoverToken(request);
        debugUtil.debug("🔑 [SECURITY_FILTER] Token presente:", (token != null ? "SIM" : "NÃO"));

        if(token != null) {
            try {
                var login = tokenService.validateToken(token);
                debugUtil.debug("✅ [SECURITY_FILTER]", "Token válido para usuário: " + login);

                UserDetails user = userRepository.findByLogin(login);

                if (user != null) {
                    debugUtil.debug("👤 [SECURITY_FILTER]", "Usuário encontrado: " + user.getUsername());
                    debugUtil.debug("🔐 [SECURITY_FILTER]", "Authorities: " + user.getAuthorities());

                    var authentication = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                    SecurityContextHolder.getContext().setAuthentication(authentication);

                    debugUtil.debug("🎯 [SECURITY_FILTER]", "Usuário autenticado com sucesso!");
                } else {
                    debugUtil.debugError("❌ [SECURITY_FILTER]", "Usuário não encontrado no banco: " + login);
                }

            } catch (Exception e) {
                debugUtil.debugError("❌ [SECURITY_FILTER]", "Erro na validação do token: " + e.getMessage());
                e.printStackTrace();
            }
        }

        filterChain.doFilter(request, response);
    }


    private String recoverToken(HttpServletRequest request) {
        var authHeader = request.getHeader("Authorization");
        debugUtil.debug("📝 [SECURITY_FILTER]", "Authorization header: " + (authHeader != null ? authHeader.substring(0, Math.min(authHeader.length(), 20)) + "..." : "NULL"));

        if(authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        return authHeader.replace("Bearer ", "");
    }
}
