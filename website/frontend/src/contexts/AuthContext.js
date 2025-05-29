import React, { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('@EnglishForAllTime:token'));

  const signIn = useCallback(async (token) => {
    localStorage.setItem('@EnglishForAllTime:token', token);
    setToken(token);
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem('@EnglishForAllTime:token');
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, signIn, signOut, isAuthenticated: !!token }}>
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