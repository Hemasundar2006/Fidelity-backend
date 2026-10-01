import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute - wraps routes that require authentication.
 * allowedRoles: string[] – if provided, only those roles can access.
 * Redirects unauthenticated users to /login.
 * Redirects wrong-role users to their own dashboard.
 */
const ROLE_HOME = {
  admin: '/dashboard/admin',
  receptionist: '/dashboard/receptionist',
  doctor: '/dashboard/doctor',
  nurse: '/dashboard/nurse',
  lab: '/dashboard/lab',
  pharmacy: '/dashboard/pharmacy',
};

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Not logged in → go to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Allowed roles specified and user role not in list → redirect to their dashboard
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const home = ROLE_HOME[user.role] || '/login';
    return <Navigate to={home} replace />;
  }

  return children;
};

export { ROLE_HOME };
