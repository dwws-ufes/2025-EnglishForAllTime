import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Mostrar loading enquanto os dados estão sendo carregados
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  console.log('🔍 [ADMIN_ROUTE] Verificando acesso admin:', {
    isAuthenticated,
    user: user?.email,
    role: user?.role,
    isAdmin: user?.role === 'ADMIN',
    loading
  });

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    console.log('❌ [ADMIN_ROUTE] Acesso negado - redirecionando para /home');
    return <Navigate to="/home" state={{ from: location }} replace />;
  }

  console.log('✅ [ADMIN_ROUTE] Acesso permitido para ADMIN');
  return children;
};

export default AdminRoute;