import React from 'react';
import { useAuth } from '../../context/authContext';
import { Navigate } from 'react-router-dom';

const RoleBaseRoutes = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default RoleBaseRoutes;
