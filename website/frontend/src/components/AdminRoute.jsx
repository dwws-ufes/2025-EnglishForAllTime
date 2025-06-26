import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  console.log('🔍 [ADMIN_ROUTE] Verificando acesso admin:', {
    isAuthenticated,
    user: user?.email,
    role: user?.role,
    isAdmin: user?.role === 'ADMIN'
  });

  // ❌ ERRO: !user?.role === 'ADMIN' sempre retorna false
  // ✅ CORREÇÃO: user?.role !== 'ADMIN'
  if (!isAuthenticated || user?.role !== 'ADMIN') {
    console.log('❌ [ADMIN_ROUTE] Acesso negado - redirecionando para /home');
    return <Navigate to="/home" state={{ from: location }} replace />;
  }

  console.log('✅ [ADMIN_ROUTE] Acesso permitido para ADMIN');
  return children;
};

export default AdminRoute;