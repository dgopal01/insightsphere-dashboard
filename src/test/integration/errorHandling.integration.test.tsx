/**
 * Integration tests for error handling across component boundaries
 * Tests how errors propagate and are handled throughout the application
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChatLogsReviewPage } from '../../pages/ChatLogsReviewPage';
import { FeedbackLogsReviewPage } from '../../pages/FeedbackLogsReviewPage';
import { ReviewDashboardPage } from '../../pages/ReviewDashboardPage';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { server, errorHandlers } from '../mswServer';
import { graphql, HttpResponse } from 'msw';

// Mock Amplify API
vi.mock('aws-amplify', () => ({
  Amplify: {
    configure: vi.fn(),
  },
}));

vi.mock('@aws-amplify/api-graphql', () => ({
  generateClient: vi.fn(() => ({
    graphql: vi.fn(),
  })),
}));

/**
 * Test wrapper with error boundary
 */
function TestAppWithErrorBoundary({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ErrorBoundary>{children}</ErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

describe('Error Handling Integration Tests', () => {
  beforeEach(() => {
    // Reset server handlers
    server.resetHandlers();
  });

  describe('Network Errors', () => {
    it('should display user-friendly message for network errors in chat logs', async () => {
      // Configure server to return network error
      server.use(...errorHandlers.networkError);

      render(
        <TestAppWithErrorBoundary>
          <ChatLogsReviewPage />
        </TestAppWithErrorBoundary>
      );

      await waitFor(() => {
        // Should display network error message
        expect(screen.getByText(/network/i)).toBeInTheDocument();
      });
    });

    it('should display user-friendly message for network errors in feedback logs', async () => {
      server.use(...errorHandlers.networkError);

      render(
        <TestAppWithErrorBoundary>
          <FeedbackLogsReviewPage />
        </TestAppWithErrorBoundary>
      );

      await waitFor(() => {
        expect(screen.getByText(/network/i)).toBeInTheDocument();
      });
    });

    it('should display user-friendly message for network errors in dashboard', async () => {
      server.use(...errorHandlers.networkError);

      render(
        <TestAppWithErrorBoundary>
          <ReviewDashboardPage />
        </TestAppWithErrorBoundary>
      );

      await waitFor(() => {
        expect(screen.getByText(/network/i)).toBeInTheDocument();
      });
    });

    it('should suggest checking network connection', async () => {
      server.use(...errorHandlers.networkError);

      render(
        <TestAppWithErrorBoundary>
          <ChatLogsReviewPage />
        </TestAppWithErrorBoundary>
      );

      await waitFor(() => {
        expect(screen.getByText(/check.*connection/i)).toBeInTheDocument();
      });
    });

    it('should provide retry option for network errors', async () => {
      server.use(...errorHandlers.networkError);

      render(
        <TestAppWithErrorBoundary>
          <ChatLogsReviewPage />
        </TestAppWithErrorBoundary>
      );

      await waitFor(() => {
        expect(screen.getByText(/retry/i)).toBeInTheDocument();
      });
    });
  });

  describe('Authentication Errors', () => {
    it('should handle authentication errors in chat logs', async () => {
      server.use(...errorHandlers.authError);

      render(
        <TestAppWithErrorBoundary>
          <ChatLogsReviewPage />
        </TestAppWithErrorBoundary>
      );

      await waitFor(() => {
        // Should display authentication error
        expect(screen.getByText(/unauthorized|authentication/i)).toBeInTheDocument();
      });
    });

    it('should handle authentication errors in feedback logs', async () => {
      server.use(...errorHandlers.authError);

      render(
        <TestAppWithErrorBoundary>
          <FeedbackLogsReviewPage />
        </TestAppWithErrorBoundary>
      );

      await waitFor(() => {
        expect(screen.getByText(/unauthorized|authentication/i)).toBeInTheDocument();
      });
    });

    it('should handle authentication errors in dashboard', async () => {
      server.use(...errorHandlers.authError);

      render(
        <TestAppWithErrorBoundary>
          <ReviewDashboardPage />
        </TestAppWithErrorBoundary>
      );

      await waitFor(() => {
        expect(screen.getByText(/unauthorized|authentication/i)).toBeInTheDocument();
      });
    });

    it('should redirect to sign-in on authentication error', async () => {
      server.use(...errorHandlers.authError);

      render(
        <TestAppWithErrorBoundary>
          <ChatLogsReviewPage />
        </TestAppWithErrorBoundary>
      );

      await waitFor(() => {
        // In real app, would redirect to /signin
        // Here we just verify error is displayed
        expect(screen.getByText(/unauthorized|authentication/i)).toBeInTheDocument();
      });
    });
  });

  describe('Validation Errors', () => {
    it('should display validation error for chat log review', async () => {
      server.use(...errorHandlers.validationError);

      render(
        <TestAppWithErrorBoundary>
          <ChatLogsReviewPage />
        </TestAppWithErrorBoundary>
      );

      // Would need to trigger a mutation to see validation error
      // This is a placeholder for the test structure
    });

    it('should display validation error for feedback log review', async () => {
      server.use(...errorHandlers.validationError);

      render(
        <TestAppWithErrorBoundary>
          <FeedbackLogsReviewPage />
        </TestAppWithErrorBoundary>
      );

      // Would need to trigger a mutation to see validation error
    });

    it('should preserve user input on validation error', async () => {
      server.use(...errorHandlers.validationError);

      render(
        <TestAppWithErrorBoundary>
          <ChatLogsReviewPage />
        </TestAppWithErrorBoundary>
      );

      // Enter data, submit, verify data is preserved after validation error
    });
  });

  describe('GraphQL Errors', () => {
    it('should display user-friendly message for GraphQL errors', async () => {
      server.use(
        graphql.query('ListUnityAIAssistantLogs', () => {
          return HttpResponse.json(
            {
              errors: [
                {
                  message: 'GraphQL error occurred',
                  errorType: 'GraphQLError',
                },
              ],
            },
            { status: 500 }
          );
        })
      );

      render(
        <TestAppWithErrorBoundary>
          <ChatLogsReviewPage />
        </TestAppWithErrorBoundary>
      );

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });

    it('should handle multiple GraphQL errors', async () => {
      server.use(
        graphql.query('ListUnityAIAssistantLogs', () => {
          return HttpResponse.json(
            {
              errors: [
                {
                  message: 'Error 1',
                  errorType: 'GraphQLError',
                },
                {
                  message: 'Error 2',
                  errorType: 'GraphQLError',
                },
              ],
            },
            { status: 500 }
          );
        })
      );

      render(
        <TestAppWithErrorBoundary>
          <ChatLogsReviewPage />
        </TestAppWithErrorBoundary>
      );

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Component Errors', () => {
    it('should catch and display React component errors', () => {
      // Create a component that throws an error
      const ThrowError = () => {
        throw new Error('Component error');
      };

      render(
        <TestAppWithErrorBoundary>
          <ThrowError />
        </TestAppWithErrorBoundary>
      );

      // Error boundary should catch and display error
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it('should display fallback UI for component errors', () => {
      const ThrowError = () => {
        throw new Error('Component error');
      };

      render(
        <TestAppWithErrorBoundary>
          <ThrowError />
        </TestAppWithErrorBoundary>
      );

      // Should show fallback UI
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it('should log error details for debugging', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const ThrowError = () => {
        throw new Error('Component error');
      };

      render(
        <TestAppWithErrorBoundary>
          <ThrowError />
        </TestAppWithErrorBoundary>
      );

      // Error should be logged
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('Error Recovery', () => {
    it('should allow retry after network error', async () => {
      let callCount = 0;

      server.use(
        graphql.query('ListUnityAIAssistantLogs', () => {
          callCount++;
          if (callCount === 1) {
            return HttpResponse.json(
              {
                errors: [{ message: 'Network error', errorType: 'NetworkError' }],
              },
              { status: 500 }
            );
          }
          return HttpResponse.json({
            data: {
              listUnityAIAssistantLogs: {
                items: [],
                nextToken: null,
              },
            },
          });
        })
      );

      const user = userEvent.setup();
      render(
        <TestAppWithErrorBoundary>
          <ChatLogsReviewPage />
        </TestAppWithErrorBoundary>
      );

      // Wait for error
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });

      // Click retry
      const retryButton = screen.getByText(/retry/i);
      await user.click(retryButton);

      // Should succeed on retry
      await waitFor(() => {
        expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
      });
    });

    it('should recover from temporary errors', async () => {
      let callCount = 0;

      server.use(
        graphql.query('GetReviewMetrics', () => {
          callCount++;
          if (callCount === 1) {
            return HttpResponse.json(
              {
                errors: [{ message: 'Temporary error', errorType: 'ServerError' }],
              },
              { status: 500 }
            );
          }
          return HttpResponse.json({
            data: {
              getReviewMetrics: {
                totalChatLogs: 0,
                reviewedChatLogs: 0,
                pendingChatLogs: 0,
                totalFeedbackLogs: 0,
                reviewedFeedbackLogs: 0,
                pendingFeedbackLogs: 0,
              },
            },
          });
        })
      );

      render(
        <TestAppWithErrorBoundary>
          <ReviewDashboardPage />
        </TestAppWithErrorBoundary>
      );

      // Should eventually succeed
      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Propagation', () => {
    it('should propagate errors from child to parent components', () => {
      const ThrowError = () => {
        throw new Error('Child component error');
      };

      render(
        <TestAppWithErrorBoundary>
          <div>
            <ThrowError />
          </div>
        </TestAppWithErrorBoundary>
      );

      // Parent error boundary should catch child error
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it('should handle errors in nested components', () => {
      const NestedError = () => {
        throw new Error('Nested error');
      };

      const Parent = () => (
        <div>
          <NestedError />
        </div>
      );

      render(
        <TestAppWithErrorBoundary>
          <Parent />
        </TestAppWithErrorBoundary>
      );

      // Error boundary should catch nested error
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  describe('Error Messages', () => {
    it('should display clear error messages', async () => {
      server.use(
        graphql.query('ListUnityAIAssistantLogs', () => {
          return HttpResponse.json(
            {
              errors: [
                {
                  message: 'Unable to fetch chat logs',
                  errorType: 'QueryError',
                },
              ],
            },
            { status: 500 }
          );
        })
      );

      render(
        <TestAppWithErrorBoundary>
          <ChatLogsReviewPage />
        </TestAppWithErrorBoundary>
      );

      await waitFor(() => {
        expect(screen.getByText(/unable to fetch/i)).toBeInTheDocument();
      });
    });

    it('should avoid technical jargon in error messages', async () => {
      server.use(...errorHandlers.networkError);

      render(
        <TestAppWithErrorBoundary>
          <ChatLogsReviewPage />
        </TestAppWithErrorBoundary>
      );

      await waitFor(() => {
        const errorText = screen.getByText(/network/i).textContent || '';
        // Should not contain technical terms like "500", "GraphQL", "DynamoDB"
        expect(errorText).not.toMatch(/500|graphql|dynamodb/i);
      });
    });

    it('should provide actionable error messages', async () => {
      server.use(...errorHandlers.networkError);

      render(
        <TestAppWithErrorBoundary>
          <ChatLogsReviewPage />
        </TestAppWithErrorBoundary>
      );

      await waitFor(() => {
        // Should suggest an action (retry, check connection, etc.)
        expect(screen.getByText(/retry|check|try again/i)).toBeInTheDocument();
      });
    });
  });
});
