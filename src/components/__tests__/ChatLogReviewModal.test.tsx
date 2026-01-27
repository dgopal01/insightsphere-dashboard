/**
 * Tests for ChatLogReviewModal Component
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatLogReviewModal } from '../ChatLogReviewModal';
import type { ChatLogEntry } from '../../types';

describe('ChatLogReviewModal', () => {
  const mockLog: ChatLogEntry = {
    log_id: 'test-log-123',
    timestamp: '2024-01-15T10:30:00Z',
    carrier_name: 'TestCarrier',
    chat_id: 'chat-456',
    citation: 'Test citation',
    fi_name: 'test-fi',
    guardrail_id: 'guard-789',
    guardrail_intervened: false,
    model_id: 'model-001',
    question: 'What is the test question?',
    response: 'This is the test response.',
    rev_comment: '',
    rev_feedback: '',
    session_id: 'session-123',
    user_name: 'testuser',
    usr_comment: '',
    usr_feedback: '',
  };

  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal when open with log data', () => {
    render(
      <ChatLogReviewModal open={true} log={mockLog} onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );

    expect(screen.getByText('Review Chat Log')).toBeInTheDocument();
    expect(screen.getByText('TestCarrier')).toBeInTheDocument();
    expect(screen.getByText('What is the test question?')).toBeInTheDocument();
    expect(screen.getByText('This is the test response.')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <ChatLogReviewModal
        open={false}
        log={mockLog}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.queryByText('Review Chat Log')).not.toBeInTheDocument();
  });

  it('displays review comment textarea with character counter', () => {
    render(
      <ChatLogReviewModal open={true} log={mockLog} onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );

    const commentField = screen.getByLabelText('Review comment');
    expect(commentField).toBeInTheDocument();
    expect(screen.getByText('0/5000 characters')).toBeInTheDocument();
  });

  it('displays review feedback textarea with character counter', () => {
    render(
      <ChatLogReviewModal open={true} log={mockLog} onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );

    const feedbackField = screen.getByLabelText('Review feedback');
    expect(feedbackField).toBeInTheDocument();
  });

  it('updates character counter when typing in comment field', async () => {
    const user = userEvent.setup();
    render(
      <ChatLogReviewModal open={true} log={mockLog} onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );

    const commentField = screen.getByLabelText('Review comment');
    await user.type(commentField, 'Test comment');

    await waitFor(() => {
      expect(screen.getByText('12/5000 characters')).toBeInTheDocument();
    });
  });

  it('validates character limit for comment field', async () => {
    const user = userEvent.setup();
    render(
      <ChatLogReviewModal open={true} log={mockLog} onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );

    const commentField = screen.getByLabelText('Review comment');
    const longText = 'a'.repeat(5001);

    // Type text that exceeds limit (field has maxLength attribute)
    await user.type(commentField, longText);

    // The field should enforce maxLength, so only 5000 chars should be present
    await waitFor(() => {
      expect(commentField).toHaveValue('a'.repeat(5000));
    });
  });

  it('disables submit button when both fields are empty', () => {
    render(
      <ChatLogReviewModal open={true} log={mockLog} onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );

    const submitButton = screen.getByRole('button', { name: /submit review/i });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when comment field has content', async () => {
    const user = userEvent.setup();
    render(
      <ChatLogReviewModal open={true} log={mockLog} onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );

    const commentField = screen.getByLabelText('Review comment');
    await user.type(commentField, 'Valid comment');

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /submit review/i });
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('enables submit button when feedback field has content', async () => {
    const user = userEvent.setup();
    render(
      <ChatLogReviewModal open={true} log={mockLog} onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );

    const feedbackField = screen.getByLabelText('Review feedback');
    await user.type(feedbackField, 'Valid feedback');

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /submit review/i });
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('calls onSubmit with sanitized data when form is submitted', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue(undefined);

    render(
      <ChatLogReviewModal open={true} log={mockLog} onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );

    const commentField = screen.getByLabelText('Review comment');
    const feedbackField = screen.getByLabelText('Review feedback');

    await user.type(commentField, 'Test comment');
    await user.type(feedbackField, 'Test feedback');

    const submitButton = screen.getByRole('button', { name: /submit review/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith('test-log-123', {
        rev_comment: 'Test comment',
        rev_feedback: 'Test feedback',
      });
    });
  });

  it('displays success message after successful submission', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue(undefined);

    render(
      <ChatLogReviewModal open={true} log={mockLog} onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );

    const commentField = screen.getByLabelText('Review comment');
    await user.type(commentField, 'Test comment');

    const submitButton = screen.getByRole('button', { name: /submit review/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Review submitted successfully!')).toBeInTheDocument();
    });
  });

  it('displays error message when submission fails', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockRejectedValue(new Error('Network error'));

    render(
      <ChatLogReviewModal open={true} log={mockLog} onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );

    const commentField = screen.getByLabelText('Review comment');
    await user.type(commentField, 'Test comment');

    const submitButton = screen.getByRole('button', { name: /submit review/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('preserves entered data when submission fails', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockRejectedValue(new Error('Network error'));

    render(
      <ChatLogReviewModal open={true} log={mockLog} onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );

    const commentField = screen.getByLabelText('Review comment');
    const feedbackField = screen.getByLabelText('Review feedback');

    await user.type(commentField, 'Test comment');
    await user.type(feedbackField, 'Test feedback');

    const submitButton = screen.getByRole('button', { name: /submit review/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    // Data should still be in the fields
    expect(commentField).toHaveValue('Test comment');
    expect(feedbackField).toHaveValue('Test feedback');
  });

  it('shows loading state during submission', async () => {
    const user = userEvent.setup();
    let resolveSubmit: () => void;
    const submitPromise = new Promise<void>((resolve) => {
      resolveSubmit = resolve;
    });
    mockOnSubmit.mockReturnValue(submitPromise);

    render(
      <ChatLogReviewModal open={true} log={mockLog} onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );

    const commentField = screen.getByLabelText('Review comment');
    await user.type(commentField, 'Test comment');

    const submitButton = screen.getByRole('button', { name: /submit review/i });
    await user.click(submitButton);

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText('Submitting...')).toBeInTheDocument();
    });

    // Resolve the promise
    resolveSubmit!();
  });

  it('displays all log fields in detail view', () => {
    render(
      <ChatLogReviewModal open={true} log={mockLog} onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );

    // Check that key fields are displayed
    expect(screen.getByText('test-log-123')).toBeInTheDocument();
    expect(screen.getByText('TestCarrier')).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('What is the test question?')).toBeInTheDocument();
    expect(screen.getByText('This is the test response.')).toBeInTheDocument();
    expect(screen.getByText('Test citation')).toBeInTheDocument();
  });

  it('shows pending status chip for unreviewed log', () => {
    render(
      <ChatLogReviewModal open={true} log={mockLog} onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );

    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('shows reviewed status chip for reviewed log', () => {
    const reviewedLog: ChatLogEntry = {
      ...mockLog,
      rev_comment: 'Already reviewed',
    };

    render(
      <ChatLogReviewModal
        open={true}
        log={reviewedLog}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText('Reviewed')).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ChatLogReviewModal open={true} log={mockLog} onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
