import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('@EnglishForAllTime:token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Adicionar estado de loading

  useEffect(() => {
    const token = localStorage.getItem('@EnglishForAllTime:token');
    const userData = localStorage.getItem('@EnglishForAllTime:userData');

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setToken(token);
        console.log('✅ Dados do usuário recuperados:', parsedUser);
      } catch (error) {
        console.error('❌ Erro ao recuperar dados do usuário:', error);
        localStorage.removeItem('@EnglishForAllTime:token');
        localStorage.removeItem('@EnglishForAllTime:userData');
      }
    }
    setLoading(false); // Marcar como carregado
  }, []);

  const signIn = useCallback(async (token, userInfo = null) => {
    localStorage.setItem('@EnglishForAllTime:token', token);
    setToken(token);
    
    // Se userInfo foi fornecido, usar diretamente
    if (userInfo) {
      localStorage.setItem('@EnglishForAllTime:userData', JSON.stringify(userInfo));
      setUser(userInfo);
      console.log('✅ Usuário logado:', userInfo);
    } else {
      // Caso contrário, buscar as informações do usuário via API
      try {
        // Você pode fazer uma chamada para /auth/me aqui se necessário
        // Por enquanto, vamos usar um placeholder
        const fallbackUser = { email: 'user@example.com', name: 'Usuário', role: 'USER' };
        localStorage.setItem('@EnglishForAllTime:userData', JSON.stringify(fallbackUser));
        setUser(fallbackUser);
      } catch (error) {
        console.error('Erro ao buscar informações do usuário:', error);
        const fallbackUser = { email: 'user@example.com', name: 'Usuário', role: 'USER' };
        localStorage.setItem('@EnglishForAllTime:userData', JSON.stringify(fallbackUser));
        setUser(fallbackUser);
      }
    }
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem('@EnglishForAllTime:token');
    localStorage.removeItem('@EnglishForAllTime:userData');
    setToken(null);
    setUser(null);
    console.log('✅ Usuário deslogado');
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
      loading, // Expor o estado de loading
      signIn,
      signOut, 
      isAuthenticated: !!token && !!user,
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