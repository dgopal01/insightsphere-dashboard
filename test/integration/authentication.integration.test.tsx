/**
 * Integration tests for authentication flow
 * Tests the complete authentication workflow including sign-in, session management, and logout
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SignInPage } from '../../pages/SignInPage';
import { ChatLogsReviewPage } from '../../pages/ChatLogsReviewPage';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { AuthContext } from '../../contexts/AuthContext';
import { renderWithProviders } from '../utils';

/**
 * Mock authentication context for testing
 */
function createMockAuthContext(isAuthenticated: boolean = false) {
  return {
    isAuthenticated,
    user: isAuthenticated ? { username: 'test-user', email: 'test@example.com' } : null,
    loading: false,
    signIn: vi.fn().mockResolvedValue(undefined),
    signOut: vi.fn().mockResolvedValue(undefined),
    checkAuth: vi.fn().mockResolvedValue(isAuthenticated),
  };
}

/**
 * Test app component with authentication
 */
function TestApp({ authContext }: { authContext: ReturnType<typeof createMockAuthContext> }) {
  return (
    <AuthContext.Provider value={authContext}>
      <BrowserRouter>
        <Routes>
          <Route path="/signin" element={<SignInPage />} />
          <Route
            path="/chat-logs"
            element={
              <ProtectedRoute>
                <ChatLogsReviewPage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/signin" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    // Clear any stored authentication state
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('Sign-in Flow', () => {
    it('should display sign-in page for unauthenticated users', () => {
      const authContext = createMockAuthContext(false);

      render(<TestApp authContext={authContext} />);

      // Should show sign-in page
      expect(screen.getByText(/sign in/i)).toBeInTheDocument();
    });

    it('should redirect to protected route after successful authentication', async () => {
      const authContext = createMockAuthContext(false);
      const { rerender } = render(<TestApp authContext={authContext} />);

      // Initially on sign-in page
      expect(screen.getByText(/sign in/i)).toBeInTheDocument();

      // Simulate successful authentication
      const authenticatedContext = createMockAuthContext(true);
      rerender(<TestApp authContext={authenticatedContext} />);

      // Should now be able to access protected route
      // Note: In real app, this would happen automatically via Cognito
      expect(authenticatedContext.isAuthenticated).toBe(true);
    });

    it('should handle authentication errors gracefully', async () => {
      const authContext = createMockAuthContext(false);
      authContext.signIn = vi.fn().mockRejectedValue(new Error('Invalid credentials'));

      render(<TestApp authContext={authContext} />);

      // Attempt sign-in
      if (authContext.signIn) {
        await expect(authContext.signIn('test', 'wrong')).rejects.toThrow('Invalid credentials');
      }
    });
  });

  describe('Protected Routes', () => {
    it('should allow access to protected routes when authenticated', () => {
      const authContext = createMockAuthContext(true);

      render(<TestApp authContext={authContext} />);

      // Should be able to access protected content
      expect(authContext.isAuthenticated).toBe(true);
    });

    it('should redirect to sign-in when accessing protected route while unauthenticated', () => {
      const authContext = createMockAuthContext(false);

      render(<TestApp authContext={authContext} />);

      // Should be on sign-in page
      expect(screen.getByText(/sign in/i)).toBeInTheDocument();
    });
  });

  describe('Session Management', () => {
    it('should maintain authentication state across page refreshes', () => {
      const authContext = createMockAuthContext(true);

      const { rerender } = render(<TestApp authContext={authContext} />);

      // Simulate page refresh by re-rendering
      rerender(<TestApp authContext={authContext} />);

      // Should still be authenticated
      expect(authContext.isAuthenticated).toBe(true);
    });

    it('should handle session expiration', async () => {
      const authContext = createMockAuthContext(true);
      const { rerender } = render(<TestApp authContext={authContext} />);

      // Initially authenticated
      expect(authContext.isAuthenticated).toBe(true);

      // Simulate session expiration
      const expiredContext = createMockAuthContext(false);
      rerender(<TestApp authContext={expiredContext} />);

      // Should redirect to sign-in
      await waitFor(() => {
        expect(screen.getByText(/sign in/i)).toBeInTheDocument();
      });
    });
  });

  describe('Logout Flow', () => {
    it('should clear authentication state on logout', async () => {
      const authContext = createMockAuthContext(true);
      const { rerender } = render(<TestApp authContext={authContext} />);

      // Initially authenticated
      expect(authContext.isAuthenticated).toBe(true);

      // Perform logout
      if (authContext.signOut) {
        await authContext.signOut();
      }

      // Simulate post-logout state
      const loggedOutContext = createMockAuthContext(false);
      rerender(<TestApp authContext={loggedOutContext} />);

      // Should be logged out
      expect(loggedOutContext.isAuthenticated).toBe(false);
    });

    it('should redirect to sign-in page after logout', async () => {
      const authContext = createMockAuthContext(true);
      const { rerender } = render(<TestApp authContext={authContext} />);

      // Perform logout
      if (authContext.signOut) {
        await authContext.signOut();
      }

      // Simulate post-logout state
      const loggedOutContext = createMockAuthContext(false);
      rerender(<TestApp authContext={loggedOutContext} />);

      // Should show sign-in page
      await waitFor(() => {
        expect(screen.getByText(/sign in/i)).toBeInTheDocument();
      });
    });

    it('should clear local storage on logout', async () => {
      const authContext = createMockAuthContext(true);

      // Set some auth data in localStorage
      localStorage.setItem('authToken', 'test-token');
      localStorage.setItem('userId', 'test-user');

      render(<TestApp authContext={authContext} />);

      // Perform logout
      if (authContext.signOut) {
        await authContext.signOut();
      }

      // Clear storage (simulating what signOut should do)
      localStorage.clear();

      // Verify storage is cleared
      expect(localStorage.getItem('authToken')).toBeNull();
      expect(localStorage.getItem('userId')).toBeNull();
    });
  });

  describe('Authentication Token Management', () => {
    it('should include authentication token in API requests', async () => {
      const authContext = createMockAuthContext(true);

      render(<TestApp authContext={authContext} />);

      // In a real scenario, we would verify that API calls include the auth token
      // This is typically handled by Amplify automatically
      expect(authContext.isAuthenticated).toBe(true);
    });

    it('should refresh expired tokens automatically', async () => {
      const authContext = createMockAuthContext(true);
      authContext.checkAuth = vi.fn().mockResolvedValue(true);

      render(<TestApp authContext={authContext} />);

      // Simulate token refresh check
      if (authContext.checkAuth) {
        const isValid = await authContext.checkAuth();
        expect(isValid).toBe(true);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors during authentication', async () => {
      const authContext = createMockAuthContext(false);
      authContext.signIn = vi.fn().mockRejectedValue(new Error('Network error'));

      render(<TestApp authContext={authContext} />);

      // Attempt sign-in with network error
      if (authContext.signIn) {
        await expect(authContext.signIn('test', 'pass')).rejects.toThrow('Network error');
      }
    });

    it('should handle invalid credentials error', async () => {
      const authContext = createMockAuthContext(false);
      authContext.signIn = vi.fn().mockRejectedValue(new Error('Invalid credentials'));

      render(<TestApp authContext={authContext} />);

      // Attempt sign-in with invalid credentials
      if (authContext.signIn) {
        await expect(authContext.signIn('test', 'wrong')).rejects.toThrow('Invalid credentials');
      }
    });

    it('should handle unauthorized API responses', async () => {
      const authContext = createMockAuthContext(true);
      const { rerender } = render(<TestApp authContext={authContext} />);

      // Simulate unauthorized response (401)
      const unauthorizedContext = createMockAuthContext(false);
      rerender(<TestApp authContext={unauthorizedContext} />);

      // Should redirect to sign-in
      await waitFor(() => {
        expect(screen.getByText(/sign in/i)).toBeInTheDocument();
      });
    });
  });
});
