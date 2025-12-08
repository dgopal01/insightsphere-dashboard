/**
 * Main Application Component
 * Sets up routing and authentication
 * Implements code splitting with React.lazy for performance optimization
 */

import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, ErrorBoundary } from './components';
import { NewLayout } from './components/layout/NewLayout';
import { handleError } from './utils';

// Lazy load page components for code splitting (Requirement 9.1)
const SignInPage = lazy(() => import('./pages/SignInPage'));
const UnauthorizedPage = lazy(() => import('./pages/UnauthorizedPage'));

// Chat Logs Review System Pages
const ChatLogsReviewPage = lazy(() => import('./pages/ChatLogsReviewPage'));
const FeedbackLogsReviewPage = lazy(() => import('./pages/FeedbackLogsReviewPage'));
const ReviewDashboardPage = lazy(() => import('./pages/ReviewDashboardPage'));
const AIMetricsDashboardPage = lazy(() => import('./pages/AIMetricsDashboardPage'));
const DesignSystemDemo = lazy(() => import('./pages/DesignSystemDemo'));

// Loading fallback component
const PageLoader = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

function App() {
  return (
    <ErrorBoundary
      onError={(error: Error, errorInfo: React.ErrorInfo) => {
        // Log error with context
        handleError(error, {
          componentStack: errorInfo.componentStack || '',
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
                  <NewLayout>
                    <ReviewDashboardPage />
                  </NewLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <NewLayout>
                    <ReviewDashboardPage />
                  </NewLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai-metrics"
              element={
                <ProtectedRoute>
                  <NewLayout>
                    <AIMetricsDashboardPage />
                  </NewLayout>
                </ProtectedRoute>
              }
            />

            {/* Chat Logs Review System Routes */}
            <Route
              path="/review-dashboard"
              element={
                <ProtectedRoute>
                  <NewLayout>
                    <ReviewDashboardPage />
                  </NewLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat-logs-review"
              element={
                <ProtectedRoute>
                  <NewLayout>
                    <ChatLogsReviewPage />
                  </NewLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/feedback-logs-review"
              element={
                <ProtectedRoute>
                  <NewLayout>
                    <FeedbackLogsReviewPage />
                  </NewLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/design-demo"
              element={
                <ProtectedRoute>
                  <NewLayout>
                    <DesignSystemDemo />
                  </NewLayout>
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
