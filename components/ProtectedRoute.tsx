/**
 * Protected Route Component
 * Now allows direct access without authentication checks
 */

import React from 'react';
import type { UserRole } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

/**
 * ProtectedRoute component that now allows direct access
 * No authentication or role checks - all users can access all routes
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Directly render children without any authentication checks
  return <>{children}</>;
};
