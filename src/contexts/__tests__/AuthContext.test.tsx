/**
 * AuthContext Tests
 * Validates authentication context functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import * as auth from 'aws-amplify/auth';

// Mock AWS Amplify auth
vi.mock('aws-amplify/auth', () => ({
  signIn: vi.fn(),
  signOut: vi.fn(),
  getCurrentUser: vi.fn(),
  fetchAuthSession: vi.fn(),
  confirmSignIn: vi.fn(),
}));

// Mock utility functions
vi.mock('../../utils', () => ({
  setUserContext: vi.fn(),
  setAnalyticsUserId: vi.fn(),
  captureError: vi.fn(),
  trackUserAction: vi.fn(),
}));

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should provide authentication context', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current).toBeDefined();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('should throw error when useAuth is used outside AuthProvider', () => {
    // Suppress console.error for this test
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');

    consoleError.mockRestore();
  });

  it('should load authenticated user on mount', async () => {
    const mockUser = {
      username: 'testuser',
      userId: 'test-user-id',
    };

    const mockSession = {
      tokens: {
        idToken: {
          payload: {
            email: 'test@example.com',
            'custom:role': 'admin',
          },
        },
      },
    };

    vi.mocked(auth.getCurrentUser).mockResolvedValue(mockUser as any);
    vi.mocked(auth.fetchAuthSession).mockResolvedValue(mockSession as any);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    expect(result.current.user).toEqual({
      username: 'testuser',
      email: 'test@example.com',
      role: 'admin',
      attributes: mockSession.tokens.idToken.payload,
    });
  });

  it('should handle sign in successfully', async () => {
    const mockSignInResult = {
      isSignedIn: true,
      nextStep: {
        signInStep: 'DONE',
      },
    };

    const mockUser = {
      username: 'testuser',
      userId: 'test-user-id',
    };

    const mockSession = {
      tokens: {
        idToken: {
          payload: {
            email: 'test@example.com',
            'custom:role': 'viewer',
          },
        },
      },
    };

    vi.mocked(auth.signIn).mockResolvedValue(mockSignInResult as any);
    vi.mocked(auth.getCurrentUser).mockResolvedValue(mockUser as any);
    vi.mocked(auth.fetchAuthSession).mockResolvedValue(mockSession as any);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await result.current.signIn('testuser', 'password123');

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    expect(auth.signIn).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'password123',
    });
  });

  it('should handle sign out successfully', async () => {
    const mockUser = {
      username: 'testuser',
      userId: 'test-user-id',
    };

    const mockSession = {
      tokens: {
        idToken: {
          payload: {
            email: 'test@example.com',
          },
        },
      },
    };

    vi.mocked(auth.getCurrentUser).mockResolvedValue(mockUser as any);
    vi.mocked(auth.fetchAuthSession).mockResolvedValue(mockSession as any);
    vi.mocked(auth.signOut).mockResolvedValue(undefined as any);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    await result.current.signOut();

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(auth.signOut).toHaveBeenCalled();
  });

  it('should check user roles correctly', async () => {
    const mockUser = {
      username: 'testuser',
      userId: 'test-user-id',
    };

    const mockSession = {
      tokens: {
        idToken: {
          payload: {
            email: 'test@example.com',
            'custom:role': 'admin',
          },
        },
      },
    };

    vi.mocked(auth.getCurrentUser).mockResolvedValue(mockUser as any);
    vi.mocked(auth.fetchAuthSession).mockResolvedValue(mockSession as any);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    expect(result.current.hasRole('admin')).toBe(true);
    expect(result.current.hasRole('viewer')).toBe(true); // Admin has access to everything
  });

  it('should handle new password requirement', async () => {
    const mockSignInResult = {
      isSignedIn: false,
      nextStep: {
        signInStep: 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED',
      },
    };

    vi.mocked(auth.signIn).mockResolvedValue(mockSignInResult as any);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await result.current.signIn('testuser', 'tempPassword');

    await waitFor(() => {
      expect(result.current.requiresNewPassword).toBe(true);
    });

    expect(result.current.isAuthenticated).toBe(false);
  });
});
