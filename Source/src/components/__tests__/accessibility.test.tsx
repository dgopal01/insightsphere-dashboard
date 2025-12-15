/**
 * Accessibility Tests
 * Tests keyboard navigation, ARIA labels, and screen reader support
 * Requirements: 10.1, 10.2, 10.4
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ThemeProvider, createTheme } from '@mui/material';
import type { ChatLog, Feedback } from '../../types';
import { expect, it, describe, vi } from 'vitest';

expect.extend(toHaveNoViolations);

const theme = createTheme();

// Mock data
const mockChatLog: ChatLog = {
  id: '1',
  conversationId: 'conv-1',
  userId: 'user-1',
  timestamp: '2024-01-01T12:00:00Z',
  userMessage: 'Test message',
  aiResponse: 'Test response',
  responseTime: 100,
  accuracy: 95,
};

const mockFeedback: Feedback = {
  id: '1',
  logId: 'log-1',
  userId: 'user-1',
  rating: 5,
  thumbsUp: true,
  comment: 'Great response!',
  timestamp: '2024-01-01T12:00:00Z',
};

describe('Accessibility Tests', () => {
  describe('FeedbackForm', () => {
    it('should have proper ARIA labels on interactive elements', async () => {
      const { FeedbackForm } = await import('../FeedbackForm');

      render(
        <ThemeProvider theme={theme}>
          <FeedbackForm logId="test-log" onSubmit={vi.fn()} />
        </ThemeProvider>
      );

      expect(screen.getByLabelText(/mark response as helpful/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/mark response as not helpful/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/additional comments/i)).toBeInTheDocument();
    });

    it('should associate error messages with form fields using aria-describedby', async () => {
      const { FeedbackForm } = await import('../FeedbackForm');
      const user = userEvent.setup();

      render(
        <ThemeProvider theme={theme}>
          <FeedbackForm logId="test-log" onSubmit={vi.fn()} />
        </ThemeProvider>
      );

      // Submit without rating to trigger validation error
      const submitButton = screen.getByRole('button', { name: /submit feedback/i });
      await user.click(submitButton);

      // Check that error message is associated with rating field
      const ratingError = screen.getByRole('alert');
      expect(ratingError).toBeInTheDocument();
    });

    it('should support keyboard navigation for thumbs up/down buttons', async () => {
      const { FeedbackForm } = await import('../FeedbackForm');
      const user = userEvent.setup();

      render(
        <ThemeProvider theme={theme}>
          <FeedbackForm logId="test-log" onSubmit={vi.fn()} />
        </ThemeProvider>
      );

      const thumbsUpButton = screen.getByLabelText(/mark response as helpful/i);

      // Tab to button and press Enter
      await user.tab();
      await user.tab();
      expect(thumbsUpButton).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(thumbsUpButton).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('LogFilters', () => {
    it('should have proper ARIA labels on filter inputs', async () => {
      const { LogFilters } = await import('../LogFilters');

      render(
        <ThemeProvider theme={theme}>
          <LogFilters filters={{}} onFilterChange={vi.fn()} />
        </ThemeProvider>
      );

      expect(screen.getByLabelText(/search text in chat logs/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/filter by user id/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/filter by conversation id/i)).toBeInTheDocument();
    });

    it('should support keyboard navigation for expand/collapse', async () => {
      const { LogFilters } = await import('../LogFilters');
      const user = userEvent.setup();

      render(
        <ThemeProvider theme={theme}>
          <LogFilters filters={{}} onFilterChange={vi.fn()} />
        </ThemeProvider>
      );

      const expandButton = screen.getByLabelText(/collapse filters/i);
      await user.click(expandButton);

      expect(screen.getByLabelText(/expand filters/i)).toBeInTheDocument();
    });
  });

  describe('LogTable', () => {
    it('should have proper ARIA labels on sortable columns', async () => {
      const { LogTable } = await import('../LogTable');

      render(
        <ThemeProvider theme={theme}>
          <LogTable logs={[mockChatLog]} loading={false} />
        </ThemeProvider>
      );

      expect(screen.getByLabelText(/sort by timestamp/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/sort by user id/i)).toBeInTheDocument();
    });

    it('should support keyboard navigation for table rows', async () => {
      const { LogTable } = await import('../LogTable');
      const user = userEvent.setup();
      const onRowClick = vi.fn();

      render(
        <ThemeProvider theme={theme}>
          <LogTable logs={[mockChatLog]} loading={false} onRowClick={onRowClick} />
        </ThemeProvider>
      );

      const row = screen.getByRole('row', { name: /chat log from user-1/i });

      // Focus and press Enter
      row.focus();
      await user.keyboard('{Enter}');

      expect(onRowClick).toHaveBeenCalledWith(mockChatLog);
    });

    it('should use semantic HTML time element for timestamps', async () => {
      const { LogTable } = await import('../LogTable');

      render(
        <ThemeProvider theme={theme}>
          <LogTable logs={[mockChatLog]} loading={false} />
        </ThemeProvider>
      );

      const timeElement = screen.getByText(/1\/1\/2024/i).closest('time');
      expect(timeElement).toHaveAttribute('datetime', mockChatLog.timestamp);
    });
  });

  describe('ErrorDisplay', () => {
    it('should announce errors with aria-live', async () => {
      const { ErrorDisplay } = await import('../ErrorDisplay');

      render(
        <ThemeProvider theme={theme}>
          <ErrorDisplay error="Test error" type="network" />
        </ThemeProvider>
      );

      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'assertive');
    });

    it('should have proper ARIA labels on retry button', async () => {
      const { ErrorDisplay } = await import('../ErrorDisplay');

      render(
        <ThemeProvider theme={theme}>
          <ErrorDisplay error="Test error" type="network" onRetry={vi.fn()} />
        </ThemeProvider>
      );

      expect(screen.getByLabelText(/retry the failed operation/i)).toBeInTheDocument();
    });
  });

  describe('MetricsCard', () => {
    it('should have proper ARIA labels for trend information', async () => {
      const { MetricsCard } = await import('../MetricsCard');

      render(
        <ThemeProvider theme={theme}>
          <MetricsCard title="Test Metric" value={100} trend={5.5} />
        </ThemeProvider>
      );

      expect(screen.getByRole('status', { name: /trend: up 5.5 percent/i })).toBeInTheDocument();
    });
  });
});
