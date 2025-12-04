/**
 * Main Application Component
 * Sets up routing and authentication
 * Implements code splitting with React.lazy for performance optimization
 */

import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, Layout, ErrorBoundary } from './components';
import { handleError } from './utils';

// Lazy load page components for code splitting (Requirement 9.1)
const SignInPage = lazy(() => import('./pages/SignInPage'));
const UnauthorizedPage = lazy(() => import('./pages/UnauthorizedPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ChatLogsPage = lazy(() => import('./pages/ChatLogsPage'));
const FeedbackPage = lazy(() => import('./pages/FeedbackPage'));

// Loading fallback component
const PageLoader = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
    }}
  >
    <CircularProgress />
  </Box>
);

function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log error with context
        handleError(error, {
          componentStack: errorInfo.componentStack,
          location: window.location.href,
        });
      }}
    >
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public routes */}
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Protected routes with layout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DashboardPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DashboardPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/logs"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ChatLogsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/feedback"
              element={
                <ProtectedRoute>
                  <Layout>
                    <FeedbackPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Catch all - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
