import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Mostrar loading enquanto os dados estão sendo carregados
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{ backgroundColor: '#121212' }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  console.log('🔐 [PRIVATE_ROUTE] Verificando autenticação:', {
    isAuthenticated,
    loading,
    path: location.pathname
  });

  if (!isAuthenticated) {
    console.log('❌ [PRIVATE_ROUTE] Não autenticado - redirecionando para /login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('✅ [PRIVATE_ROUTE] Autenticado - permitindo acesso');
  return children;
};

export default PrivateRoute;