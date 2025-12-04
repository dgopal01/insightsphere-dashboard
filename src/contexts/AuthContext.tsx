/**
 * Authentication Context
 * Manages authentication state and provides auth-related functionality
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { signIn, signOut, getCurrentUser, fetchAuthSession, confirmSignIn } from 'aws-amplify/auth';
import type { UserRole } from '../types';
import { setUserContext, setAnalyticsUserId, captureError, trackUserAction } from '../utils';

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
  const [error, setError] = useState<string | null>(null);
  const [requiresNewPassword, setRequiresNewPassword] = useState(false);

  /**
   * Extract user role from Cognito attributes
   * Defaults to 'viewer' if no role is specified
   */
  const extractUserRole = (attributes?: Record<string, string>): UserRole => {
    const role = attributes?.['custom:role'] || attributes?.role;
    return role === 'admin' || role === 'viewer' ? role : 'viewer';
  };

  /**
   * Load current authenticated user
   */
  const loadUser = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const currentUser = await getCurrentUser();
      const session = await fetchAuthSession();

      if (!session.tokens) {
        setUser(null);
        return;
      }

      // Extract user attributes from ID token
      const idToken = session.tokens.idToken;
      const attributes = idToken?.payload as Record<string, string> | undefined;

      const authUser: AuthUser = {
        username: currentUser.username,
        email: attributes?.email as string | undefined,
        role: extractUserRole(attributes),
        attributes,
      };

      setUser(authUser);

      // Set user context for error tracking and analytics (Requirement 9.3, 9.4)
      setUserContext({
        id: authUser.username,
        email: authUser.email,
        username: authUser.username,
      });
      setAnalyticsUserId(authUser.username);
    } catch (err) {
      console.error('Error loading user:', err);

      // Capture error for monitoring (Requirement 9.3)
      if (err instanceof Error) {
        captureError(err, {
          tags: { component: 'AuthContext', action: 'loadUser' },
        });
      }

      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  /**
   * Set up automatic token refresh
   * Tokens expire after 1 hour, refresh every 50 minutes
   */
  useEffect(() => {
    if (!user) return;

    const refreshInterval = setInterval(
      async () => {
        try {
          await fetchAuthSession({ forceRefresh: true });
          console.log('Token refreshed successfully');
        } catch (err) {
          console.error('Token refresh failed:', err);
          setError('Session expired. Please sign in again.');
          setUser(null);
        }
      },
      50 * 60 * 1000
    ); // 50 minutes

    return () => clearInterval(refreshInterval);
  }, [user]);

  /**
   * Sign in with username and password
   */
  const handleSignIn = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setRequiresNewPassword(false);

      const signInResult = await signIn({ username, password });

      // Check if user needs to change password
      if (signInResult.nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        setRequiresNewPassword(true);
        setIsLoading(false);
        return;
      }

      await loadUser();

      // Track successful sign in (Requirement 9.4)
      trackUserAction({
        action: 'sign_in',
        target: 'auth',
        metadata: { username },
      });
    } catch (err: any) {
      console.error('Sign in error:', err);

      // Provide user-friendly error messages
      let errorMessage = 'Failed to sign in. Please try again.';

      if (err.name === 'NotAuthorizedException') {
        errorMessage = 'Incorrect username or password.';
      } else if (err.name === 'UserNotFoundException') {
        errorMessage = 'User not found.';
      } else if (err.name === 'UserNotConfirmedException') {
        errorMessage = 'Please confirm your account before signing in.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      // Capture error for monitoring (Requirement 9.3)
      captureError(err, {
        tags: { component: 'AuthContext', action: 'signIn' },
        extra: { username, errorName: err.name },
      });

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Confirm new password for users who need to change their temporary password
   */
  const confirmNewPassword = async (newPassword: string) => {
    try {
      setIsLoading(true);
      setError(null);

      await confirmSignIn({ challengeResponse: newPassword });
      setRequiresNewPassword(false);
      await loadUser();

      // Track successful password change
      trackUserAction({
        action: 'password_changed',
        target: 'auth',
      });
    } catch (err: any) {
      console.error('Password change error:', err);

      let errorMessage = 'Failed to change password. Please try again.';
      if (err.message) {
        errorMessage = err.message;
      }

      captureError(err, {
        tags: { component: 'AuthContext', action: 'confirmNewPassword' },
      });

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Sign out current user
   */
  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      setError(null);

      await signOut();
      setUser(null);

      // Clear user context from monitoring (Requirement 9.3, 9.4)
      setUserContext(undefined);
      setAnalyticsUserId(null);

      // Track sign out (Requirement 9.4)
      trackUserAction({
        action: 'sign_out',
        target: 'auth',
      });
    } catch (err: any) {
      console.error('Sign out error:', err);

      // Capture error for monitoring (Requirement 9.3)
      captureError(err, {
        tags: { component: 'AuthContext', action: 'signOut' },
      });

      setError('Failed to sign out. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Check if user has specific role
   */
  const hasRole = (role: UserRole): boolean => {
    if (!user) return false;

    // Admin has access to everything
    if (user.role === 'admin') return true;

    // Otherwise, check exact role match
    return user.role === role;
  };

  /**
   * Manually refresh authentication state
   */
  const refreshAuth = async () => {
    await loadUser();
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    requiresNewPassword,
    signIn: handleSignIn,
    confirmNewPassword,
    signOut: handleSignOut,
    hasRole,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to access authentication context
 * Must be used within AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
