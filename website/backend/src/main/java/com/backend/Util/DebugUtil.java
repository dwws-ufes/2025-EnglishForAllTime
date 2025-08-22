package com.backend.Util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

// Pode ser substituido pelo Logger do SLF4J ou Logback, mas aqui é uma implementação simples para debug
// Existe um nível de implementação de debug que pode ser habilitado ou desabilitado via configuração

@Component
public class DebugUtil {

    @Value("${app.debug.enabled:false}")
    private boolean debugEnabled;

    private static final DateTimeFormatter TIMESTAMP_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS");

    /**
     * Imprime mensagem de debug somente se o debug estiver habilitado
     */
    public void debug(String message) {
        if (debugEnabled) {
            String timestamp = LocalDateTime.now().format(TIMESTAMP_FORMAT);
            System.out.println("[DEBUG] " + timestamp + " - " + message);
        }
    }

    /**
     * Imprime mensagem de debug com prefixo customizado
     */
    public void debug(String prefix, String message) {
        if (debugEnabled) {
            String timestamp = LocalDateTime.now().format(TIMESTAMP_FORMAT);
            System.out.println("[DEBUG] " + timestamp + " " + prefix + " " + message);
        }
    }

    /**
     * Imprime mensagem de erro de debug
     */
    public void debugError(String message) {
        if (debugEnabled) {
            String timestamp = LocalDateTime.now().format(TIMESTAMP_FORMAT);
            System.err.println("[DEBUG_ERROR] " + timestamp + " - " + message);
        }
    }

    /**
     * Imprime mensagem de erro de debug com prefixo
     */
    public void debugError(String prefix, String message) {
        if (debugEnabled) {
            String timestamp = LocalDateTime.now().format(TIMESTAMP_FORMAT);
            System.err.println("[DEBUG_ERROR] " + timestamp + " " + prefix + " " + message);
        }
    }

    /**
     * Imprime stack trace somente se debug estiver habilitado
     */
    public void debugException(String message, Exception e) {
        if (debugEnabled) {
            String timestamp = LocalDateTime.now().format(TIMESTAMP_FORMAT);
            System.err.println("[DEBUG_ERROR] " + timestamp + " - " + message);
            e.printStackTrace();
        }
    }

    /**
     * Verifica se o debug está habilitado
     */
    public boolean isDebugEnabled() {
        return debugEnabled;
    }
}
