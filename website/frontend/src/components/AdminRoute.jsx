// src/components/AdminRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user?.role === 'ADMIN') {
    // Se não estiver autenticado ou não for admin, redireciona para home
    return <Navigate to="/home" state={{ from: location }} replace />;
  }

  return children;
};

export default AdminRoute;