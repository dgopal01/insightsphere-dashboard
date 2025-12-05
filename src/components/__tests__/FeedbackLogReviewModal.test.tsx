/**
 * FeedbackLogReviewModal Component Tests
 * Basic smoke tests to verify component renders and functions correctly
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FeedbackLogReviewModal } from '../FeedbackLogReviewModal';
import type { FeedbackLogEntry } from '../../types';

// Mock validation and sanitization utilities
vi.mock('../../utils/validation', () => ({
  validateReviewComment: (value: string) => ({
    isValid: value.length <= 5000,
    error: value.length > 5000 ? 'Comment exceeds 5000 characters' : null,
  }),
  validateReviewFeedback: (value: string) => ({
    isValid: value.length <= 5000,
    error: value.length > 5000 ? 'Feedback exceeds 5000 characters' : null,
  }),
}));

vi.mock('../../utils/sanitization', () => ({
  sanitizeText: (text: string) => text,
}));

describe('FeedbackLogReviewModal', () => {
  const mockLog: FeedbackLogEntry = {
    id: 'test-feedback-123',
    datetime: '2024-01-15T10:30:00Z',
    carrier: 'TestCarrier',
    comments: 'User comment text',
    feedback: 'User feedback text',
    question: 'Test question?',
    response: 'Test response',
    session_id: 'session-123',
    type: 'general',
    username: 'testuser',
    user_name: 'Test User',
    rev_comment: '',
    rev_feedback: '',
  };

  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal when open is true', () => {
    render(
      <FeedbackLogReviewModal
        open={true}
        log={mockLog}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText('Review Feedback Log')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('does not render modal when open is false', () => {
    render(
      <FeedbackLogReviewModal
        open={false}
        log={mockLog}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.queryByText('Review Feedback Log')).not.toBeInTheDocument();
  });

  it('displays all feedback log fields', () => {
    render(
      <FeedbackLogReviewModal
        open={true}
        log={mockLog}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText(mockLog.id)).toBeInTheDocument();
    expect(screen.getByText(mockLog.carrier)).toBeInTheDocument();
    expect(screen.getByText(mockLog.question)).toBeInTheDocument();
    expect(screen.getByText(mockLog.response)).toBeInTheDocument();
    expect(screen.getByText(mockLog.comments)).toBeInTheDocument();
    expect(screen.getByText(mockLog.feedback)).toBeInTheDocument();
  });

  it('shows reviewed status when log has review data', () => {
    const reviewedLog = {
      ...mockLog,
      rev_comment: 'This has been reviewed',
    };

    render(
      <FeedbackLogReviewModal
        open={true}
        log={reviewedLog}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText('Reviewed')).toBeInTheDocument();
  });

  it('allows entering review comment', () => {
    render(
      <FeedbackLogReviewModal
        open={true}
        log={mockLog}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const commentField = screen.getByLabelText('Review comment');
    fireEvent.change(commentField, { target: { value: 'Test review comment' } });

    expect(commentField).toHaveValue('Test review comment');
  });

  it('allows entering review feedback', () => {
    render(
      <FeedbackLogReviewModal
        open={true}
        log={mockLog}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const feedbackField = screen.getByLabelText('Review feedback');
    fireEvent.change(feedbackField, { target: { value: 'Test review feedback' } });

    expect(feedbackField).toHaveValue('Test review feedback');
  });

  it('displays character counter for comment field', () => {
    render(
      <FeedbackLogReviewModal
        open={true}
        log={mockLog}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText('0/5000 characters')).toBeInTheDocument();

    const commentField = screen.getByLabelText('Review comment');
    fireEvent.change(commentField, { target: { value: 'Test' } });

    expect(screen.getByText('4/5000 characters')).toBeInTheDocument();
  });

  it('calls onSubmit when submit button is clicked with valid data', async () => {
    mockOnSubmit.mockResolvedValue(undefined);

    render(
      <FeedbackLogReviewModal
        open={true}
        log={mockLog}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const commentField = screen.getByLabelText('Review comment');
    fireEvent.change(commentField, { target: { value: 'Test review' } });

    const submitButton = screen.getByRole('button', { name: /submit review/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(mockLog.id, {
        rev_comment: 'Test review',
        rev_feedback: '',
      });
    });
  });

  it('displays success message after successful submission', async () => {
    mockOnSubmit.mockResolvedValue(undefined);

    render(
      <FeedbackLogReviewModal
        open={true}
        log={mockLog}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const commentField = screen.getByLabelText('Review comment');
    fireEvent.change(commentField, { target: { value: 'Test review' } });

    const submitButton = screen.getByRole('button', { name: /submit review/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Review submitted successfully!')).toBeInTheDocument();
    });
  });

  it('displays error message on submission failure', async () => {
    mockOnSubmit.mockRejectedValue(new Error('Network error'));

    render(
      <FeedbackLogReviewModal
        open={true}
        log={mockLog}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const commentField = screen.getByLabelText('Review comment');
    fireEvent.change(commentField, { target: { value: 'Test review' } });

    const submitButton = screen.getByRole('button', { name: /submit review/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('preserves form data after submission failure', async () => {
    mockOnSubmit.mockRejectedValue(new Error('Network error'));

    render(
      <FeedbackLogReviewModal
        open={true}
        log={mockLog}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const commentField = screen.getByLabelText('Review comment');
    const feedbackField = screen.getByLabelText('Review feedback');
    
    fireEvent.change(commentField, { target: { value: 'Test comment' } });
    fireEvent.change(feedbackField, { target: { value: 'Test feedback' } });

    const submitButton = screen.getByRole('button', { name: /submit review/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    // Verify data is preserved
    expect(commentField).toHaveValue('Test comment');
    expect(feedbackField).toHaveValue('Test feedback');
  });

  it('calls onClose when cancel button is clicked', () => {
    render(
      <FeedbackLogReviewModal
        open={true}
        log={mockLog}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('disables submit button when no data is entered', () => {
    render(
      <FeedbackLogReviewModal
        open={true}
        log={mockLog}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const submitButton = screen.getByRole('button', { name: /submit review/i });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when valid data is entered', () => {
    render(
      <FeedbackLogReviewModal
        open={true}
        log={mockLog}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const commentField = screen.getByLabelText('Review comment');
    fireEvent.change(commentField, { target: { value: 'Test review' } });

    const submitButton = screen.getByRole('button', { name: /submit review/i });
    expect(submitButton).not.toBeDisabled();
  });
});
