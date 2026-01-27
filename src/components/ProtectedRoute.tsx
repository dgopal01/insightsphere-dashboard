/**
 * Protected Route Component - Authentication Disabled
 * Allows direct access to all routes without authentication
 */

import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Always render children - no authentication required
  return <>{children}</>;
};