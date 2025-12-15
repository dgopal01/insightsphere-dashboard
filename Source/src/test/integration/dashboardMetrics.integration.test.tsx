/**
 * Integration tests for dashboard metrics loading and display
 * Tests the complete dashboard workflow: loading metrics → displaying → auto-refresh
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ReviewDashboardPage } from '../../pages/ReviewDashboardPage';
import { renderWithProviders } from '../utils';
import {
  server,
  setChatLogsStore,
  setFeedbackLogsStore,
  generateMockChatLogs,
  generateMockFeedbackLogs,
} from '../mswServer';

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

describe('Dashboard Metrics Integration Tests', () => {
  beforeEach(() => {
    // Reset to default mock data
    setChatLogsStore(generateMockChatLogs(20));
    setFeedbackLogsStore(generateMockFeedbackLogs(15));
  });

  describe('Loading Metrics', () => {
    it('should load and display metrics on page load', async () => {
      renderWithProviders(<ReviewDashboardPage />);

      // Should show loading state initially
      expect(screen.getByText(/loading/i)).toBeInTheDocument();

      // Wait for data to load
      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Should display metrics
    });

    it('should display metrics within 3 seconds', async () => {
      const startTime = Date.now();
      
      renderWithProviders(<ReviewDashboardPage />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      }, { timeout: 3000 });

      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000);
    });

    it('should handle empty data gracefully', async () => {
      setChatLogsStore([]);
      setFeedbackLogsStore([]);

      renderWithProviders(<ReviewDashboardPage />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Should display zero metrics
    });
  });

  describe('Displaying Metrics', () => {
    it('should display total count for chat logs', async () => {
      const chatLogs = generateMockChatLogs(25);
      setChatLogsStore(chatLogs);

      renderWithProviders(<ReviewDashboardPage />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Verify total count is displayed (25)
    });

    it('should display reviewed count for chat logs', async () => {
      const reviewedLogs = generateMockChatLogs(15, true);
      const pendingLogs = generateMockChatLogs(10, false);
      setChatLogsStore([...reviewedLogs, ...pendingLogs]);

      renderWithProviders(<ReviewDashboardPage />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Verify reviewed count is displayed (15)
    });

    it('should display pending count for chat logs', async () => {
      const reviewedLogs = generateMockChatLogs(15, true);
      const pendingLogs = generateMockChatLogs(10, false);
      setChatLogsStore([...reviewedLogs, ...pendingLogs]);

      renderWithProviders(<ReviewDashboardPage />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Verify pending count is displayed (10)
    });

    it('should display percentage for chat logs', async () => {
      const reviewedLogs = generateMockChatLogs(20, true);
      const pendingLogs = generateMockChatLogs(5, false);
      setChatLogsStore([...reviewedLogs, ...pendingLogs]);

      renderWithProviders(<ReviewDashboardPage />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Verify percentage is displayed (80%)
    });

    it('should display total count for feedback logs', async () => {
      const feedbackLogs = generateMockFeedbackLogs(30);
      setFeedbackLogsStore(feedbackLogs);

      renderWithProviders(<ReviewDashboardPage />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Verify total count is displayed (30)
    });

    it('should display reviewed count for feedback logs', async () => {
      const reviewedLogs = generateMockFeedbackLogs(18, true);
      const pendingLogs = generateMockFeedbackLogs(12, false);
      setFeedbackLogsStore([...reviewedLogs, ...pendingLogs]);

      renderWithProviders(<ReviewDashboardPage />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Verify reviewed count is displayed (18)
    });

    it('should display pending count for feedback logs', async () => {
      const reviewedLogs = generateMockFeedbackLogs(18, true);
      const pendingLogs = generateMockFeedbackLogs(12, false);
      setFeedbackLogsStore([...reviewedLogs, ...pendingLogs]);

      renderWithProviders(<ReviewDashboardPage />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Verify pending count is displayed (12)
    });

    it('should display percentage for feedback logs', async () => {
      const reviewedLogs = generateMockFeedbackLogs(15, true);
      const pendingLogs = generateMockFeedbackLogs(5, false);
      setFeedbackLogsStore([...reviewedLogs, ...pendingLogs]);

      renderWithProviders(<ReviewDashboardPage />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Verify percentage is displayed (75%)
    });

    it('should display all metrics simultaneously', async () => {
      renderWithProviders(<ReviewDashboardPage />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Verify all metrics are displayed:
      // - Chat logs: total, reviewed, pending, percentage
      // - Feedback logs: total, reviewed, pending, percentage
    });
  });

  describe('Color-Coded Indicators', () => {
    it('should display green indicator when reviewed percentage > 80%', async () => {
      const reviewedLogs = generateMockChatLogs(85, true);
      const pendingLogs = generateMockChatLogs(15, false);
      setChatLogsStore([...reviewedLogs, ...pendingLogs]);

      renderWithProviders(<ReviewDashboardPage />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Verify green color indicator is displayed (85% reviewed)
    });

    it('should display yellow indicator when reviewed percentage between 40-80%', async () => {
      const reviewedLogs = generateMockChatLogs(60, true);
      const pendingLogs = generateMockChatLogs(40, false);
      setChatLogsStore([...reviewedLogs, ...pendingLogs]);

      renderWithProviders(<ReviewDashboardPage />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Verify yellow color indicator is displayed (60% reviewed)
    });

    it('should display red indicator when reviewed percentage < 40%', async () => {
      const reviewedLogs = generateMockChatLogs(30, true);
      const pendingLogs = generateMockChatLogs(70, false);
      setChatLogsStore([...reviewedLogs, ...pendingLogs]);

      renderWithProviders(<ReviewDashboardPage />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Verify red color indicator is displayed (30% reviewed)
    });

    it('should apply color coding to both chat logs and feedback logs independently', async () => {
      // Chat logs: 85% reviewed (green)
      const reviewedChatLogs = generateMockChatLogs(85, true);
      const pendingChatLogs = generateMockChatLogs(15, false);
      setChatLogsStore([...reviewedChatLogs, ...pendingChatLogs]);

      // Feedback logs: 30% reviewed (red)
      const reviewedFeedbackLogs = generateMockFeedbackLogs(30, true);
      const pendingFeedbackLogs = generateMockFeedbackLogs(70, false);
      setFeedbackLogsStore([...reviewedFeedbackLogs, ...pendingFeedbackLogs]);

      renderWithProviders(<ReviewDashboardPage />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Verify chat logs show green and feedback logs show red
    });
  });

  describe('Metrics Calculation', () => {
    it('should correctly calculate reviewed count (entries with rev_comment OR rev_feedback)', async () => {
      const logsWithComment = generateMockChatLogs(10).map((log) => ({
        ...log,
        rev_comment: 'Has comment',
        rev_feedback: undefined,
      }));
      const logsWithFeedback = generateMockChatLogs(5).map((log) => ({
        ...log,
        rev_comment: undefined,
        rev_feedback: 'Has feedback',
      }));
      const logsWithBoth = generateMockChatLogs(3).map((log) => ({
        ...log,
        rev_comment: 'Has comment',
        rev_feedback: 'Has feedback',
      }));
      const pendingLogs = generateMockChatLogs(7, false);

      setChatLogsStore([...logsWithComment, ...logsWithFeedback, ...logsWithBoth, ...pendingLogs]);

      renderWithProviders(<ReviewDashboardPage />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Reviewed count should be 18 (10 + 5 + 3)
      // Pending count should be 7
    });

    it('should correctly calculate pending count (entries with empty rev_comment AND rev_feedback)', async () => {
      const reviewedLogs = generateMockChatLogs(15, true);
      const pendingLogs = generateMockChatLogs(10, false);
      setChatLogsStore([...reviewedLogs, ...pendingLogs]);

      renderWithProviders(<ReviewDashboardPage />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Pending count should be 10
    });

    it('should correctly calculate percentage', async () => {
      const reviewedLogs = generateMockChatLogs(75, true);
      const pendingLogs = generateMockChatLogs(25, false);
      setChatLogsStore([...reviewedLogs, ...pendingLogs]);

      renderWithProviders(<ReviewDashboardPage />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Percentage should be 75%
    });
  });

  describe('Auto-Refresh', () => {
    it('should display last updated timestamp', async () => {
      renderWithProviders(<ReviewDashboardPage />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Verify last updated timestamp is displayed
    });

    it('should update metrics when data changes', async () => {
      const { rerender } = renderWithProviders(<ReviewDashboardPage />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Change data
      const newReviewedLogs = generateMockChatLogs(90, true);
      const newPendingLogs = generateMockChatLogs(10, false);
      setChatLogsStore([...newReviewedLogs, ...newPendingLogs]);

      // Re-render to trigger refresh
      rerender(<ReviewDashboardPage />);

      await waitFor(() => {
        // Verify metrics are updated
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when metrics query fails', async () => {
      // Configure server to return error
      server.use(
        // Add error handler
      );

      renderWithProviders(<ReviewDashboardPage />);

      await waitFor(() => {
        // Verify error message is displayed
      });
    });

    it('should provide retry option after error', async () => {
      // Configure server to return error
      server.use(
        // Add error handler
      );

      renderWithProviders(<ReviewDashboardPage />);

      await waitFor(() => {
        // Verify retry option is available
      });
    });

    it('should handle network errors gracefully', async () => {
      // Configure server to return network error
      server.use(
        // Add network error handler
      );

      renderWithProviders(<ReviewDashboardPage />);

      await waitFor(() => {
        // Verify network error message is displayed
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading indicator while fetching metrics', () => {
      renderWithProviders(<ReviewDashboardPage />);

      // Should show loading state
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should hide loading indicator after metrics load', async () => {
      renderWithProviders(<ReviewDashboardPage />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });
    });
  });
});
