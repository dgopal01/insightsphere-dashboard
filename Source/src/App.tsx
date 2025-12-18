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

// Landing Page
const ProductsLandingPage = lazy(() => import('./pages/ProductsLandingPage'));

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

            {/* Landing Page - Products Selection */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <ProductsLandingPage />
                </ProtectedRoute>
              }
            />

            {/* Unity ISA Product Routes */}
            <Route
              path="/unity-isa/dashboard"
              element={
                <ProtectedRoute>
                  <NewLayout productId="unity-isa">
                    <ReviewDashboardPage />
                  </NewLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/unity-isa/ai-metrics"
              element={
                <ProtectedRoute>
                  <NewLayout productId="unity-isa">
                    <AIMetricsDashboardPage />
                  </NewLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/unity-isa/chat-logs-review"
              element={
                <ProtectedRoute>
                  <NewLayout productId="unity-isa">
                    <ChatLogsReviewPage />
                  </NewLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/unity-isa/feedback-logs-review"
              element={
                <ProtectedRoute>
                  <NewLayout productId="unity-isa">
                    <FeedbackLogsReviewPage />
                  </NewLayout>
                </ProtectedRoute>
              }
            />

            {/* Legacy routes - redirect to Unity ISA */}
            <Route path="/dashboard" element={<Navigate to="/unity-isa/dashboard" replace />} />
            <Route path="/ai-metrics" element={<Navigate to="/unity-isa/ai-metrics" replace />} />
            <Route
              path="/review-dashboard"
              element={<Navigate to="/unity-isa/dashboard" replace />}
            />
            <Route
              path="/chat-logs-review"
              element={<Navigate to="/unity-isa/chat-logs-review" replace />}
            />
            <Route
              path="/feedback-logs-review"
              element={<Navigate to="/unity-isa/feedback-logs-review" replace />}
            />

            {/* Design Demo */}
            <Route
              path="/design-demo"
              element={
                <ProtectedRoute>
                  <NewLayout productId="unity-isa">
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
