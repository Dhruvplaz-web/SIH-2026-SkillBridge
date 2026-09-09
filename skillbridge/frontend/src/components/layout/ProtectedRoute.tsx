import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';
import { PageLoader } from '../ui/Spinner';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to correct dashboard
    const paths: Record<Role, string> = {
      STUDENT: '/student',
      RECRUITER: '/recruiter',
      ACADEMICIAN: '/academician',
      ADMIN: '/admin',
    };
    return <Navigate to={paths[user.role]} replace />;
  }

  return <Outlet />;
}
