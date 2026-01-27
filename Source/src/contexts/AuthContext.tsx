/**
 * Mock Authentication Context
 * Provides authentication interface without actual authentication
 * Allows direct access to all application features
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
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

  // Mock user - automatically authenticated
  useEffect(() => {
    const mockUser: AuthUser = {
      username: 'mock-user',
      email: 'user@swbc.com',
      role: 'admin', // Grant admin access to all features
      attributes: {
        'custom:role': 'admin',
        email: 'user@swbc.com'
      }
    };
    
    setUser(mockUser);
    setIsLoading(false);
  }, []);

  const handleSignIn = async () => {
    // Mock sign in - always succeeds
    return Promise.resolve();
  };

  const confirmNewPassword = async () => {
    return Promise.resolve();
  };

  const handleSignOut = async () => {
    // Mock sign out - no actual action needed
    return Promise.resolve();
  };

  const hasRole = (): boolean => {
    // Always return true - grant access to all features
    return true;
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
