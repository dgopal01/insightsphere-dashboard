/**
 * Mock Authentication Context - No Authentication Required
 * Provides mock AWS credentials for DynamoDB access
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';
import type { UserRole } from '../types';

interface AuthUser {
  username: string;
  email?: string;
  role: UserRole;
  attributes?: Record<string, string>;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  requiresNewPassword: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  confirmNewPassword: (newPassword: string) => Promise<void>;
  signOut: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Auto-authenticate with mock user
  useEffect(() => {
    const mockUser: AuthUser = {
      username: 'mock-admin',
      email: 'admin@swbc.com',
      role: 'admin',
      attributes: {
        'custom:role': 'admin',
        email: 'admin@swbc.com'
      }
    };
    
    setUser(mockUser);
    setIsLoading(false);
  }, []);

  const handleSignIn = async () => {
    return Promise.resolve();
  };

  const confirmNewPassword = async () => {
    return Promise.resolve();
  };

  const handleSignOut = async () => {
    return Promise.resolve();
  };

  const hasRole = (): boolean => {
    return true; // Always grant access
  };

  const refreshAuth = async () => {
    return Promise.resolve();
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: true, // Always authenticated
    isLoading,
    error: null,
    requiresNewPassword: false,
    signIn: handleSignIn,
    confirmNewPassword,
    signOut: handleSignOut,
    hasRole,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};