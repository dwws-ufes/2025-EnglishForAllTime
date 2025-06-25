import React, { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('@EnglishForAllTime:token'));
  const [user, setUser] = useState(null);

  const signIn = useCallback(async (token, userInfo = null) => {
    localStorage.setItem('@EnglishForAllTime:token', token);
    setToken(token);
    
    // Se userInfo foi fornecido, usar diretamente
    if (userInfo) {
      setUser(userInfo);
    } else {
      // Caso contrário, buscar as informações do usuário via API
      try {
        // Você pode fazer uma chamada para /auth/me aqui se necessário
        // Por enquanto, vamos usar um placeholder
        setUser({ email: 'user@example.com', name: 'Usuário' });
      } catch (error) {
        console.error('Erro ao buscar informações do usuário:', error);
        setUser({ email: 'user@example.com', name: 'Usuário' });
      }
    }
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem('@EnglishForAllTime:token');
    setToken(null);
    setUser(null);
  }, []);

  // Função para verificar se o usuário é admin
  const isAdmin = useCallback(() => {
    return user?.role === 'ADMIN';
  }, [user]);

  // Função para verificar se o usuário tem uma role específica
  const hasRole = useCallback((role) => {
    return user?.role === role;
  }, [user]);

  return (
    <AuthContext.Provider value={{ 
      token, 
      user, 
      signIn, 
      signOut, 
      isAuthenticated: !!token,
      isAdmin,
      hasRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};