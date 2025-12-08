/**
 * FeedbackList Component Tests
 * Tests feedback list display, grouping, and pagination functionality
 *
 * NOTE: These tests are excluded from the test suite on Windows due to a file handle
 * limitation (EMFILE: too many open files) caused by @mui/icons-material having
 * thousands of icon files. The tests are valid and will run successfully on Linux/Mac
 * or WSL. See vitest.config.ts for the exclusion configuration.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeedbackList } from './FeedbackList';
import type { Feedback } from '../types';

describe('FeedbackList', () => {
  const mockFeedback: Feedback[] = [
    {
      id: '1',
      logId: 'log-1',
      userId: 'user-1',
      rating: 5,
      thumbsUp: true,
      comment: 'Great response!',
      timestamp: '2024-01-01T10:00:00Z',
      category: 'accuracy',
    },
    {
      id: '2',
      logId: 'log-2',
      userId: 'user-2',
      rating: 3,
      thumbsUp: false,
      comment: 'Could be better',
      timestamp: '2024-01-02T10:00:00Z',
      category: 'helpfulness',
    },
    {
      id: '3',
      logId: 'log-3',
      userId: 'user-1',
      rating: 4,
      thumbsUp: true,
      timestamp: '2024-01-03T10:00:00Z',
    },
  ];

  it('renders feedback list', () => {
    render(<FeedbackList feedback={mockFeedback} />);

    // Check that feedback items are displayed
    expect(screen.getByText('user-1')).toBeInTheDocument();
    expect(screen.getByText('user-2')).toBeInTheDocument();
    expect(screen.getByText('Great response!')).toBeInTheDocument();
    expect(screen.getByText('Could be better')).toBeInTheDocument();
  });

  it('displays empty state when no feedback', () => {
    render(<FeedbackList feedback={[]} />);

    expect(screen.getByText(/no feedback yet/i)).toBeInTheDocument();
  });

  it('displays loading state', () => {
    render(<FeedbackList feedback={[]} loading={true} />);

    // Should show skeleton loaders
    const skeletons = screen.getAllByRole('progressbar');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('displays thumbs up/down indicators', () => {
    render(<FeedbackList feedback={mockFeedback} />);

    // Check for positive and negative chips
    expect(screen.getByText('Positive')).toBeInTheDocument();
    expect(screen.getByText('Negative')).toBeInTheDocument();
  });

  it('displays ratings correctly', () => {
    render(<FeedbackList feedback={mockFeedback} />);

    // Check for rating displays
    expect(screen.getByText('(5/5)')).toBeInTheDocument();
    expect(screen.getByText('(3/5)')).toBeInTheDocument();
    expect(screen.getByText('(4/5)')).toBeInTheDocument();
  });

  it('displays categories when present', () => {
    render(<FeedbackList feedback={mockFeedback} />);

    expect(screen.getByText('accuracy')).toBeInTheDocument();
    expect(screen.getByText('helpfulness')).toBeInTheDocument();
  });

  it('supports grouping by date', async () => {
    const user = userEvent.setup();
    const onGroupByChange = vi.fn();

    render(
      <FeedbackList feedback={mockFeedback} groupBy="none" onGroupByChange={onGroupByChange} />
    );

    // Open the group by selector
    const select = screen.getByLabelText('Group By');
    await user.click(select);

    // Select "Date" option
    const dateOption = screen.getByRole('option', { name: 'Date' });
    await user.click(dateOption);

    expect(onGroupByChange).toHaveBeenCalledWith('date');
  });

  it('supports grouping by rating', async () => {
    const user = userEvent.setup();
    const onGroupByChange = vi.fn();

    render(
      <FeedbackList feedback={mockFeedback} groupBy="none" onGroupByChange={onGroupByChange} />
    );

    // Open the group by selector
    const select = screen.getByLabelText('Group By');
    await user.click(select);

    // Select "Rating" option
    const ratingOption = screen.getByRole('option', { name: 'Rating' });
    await user.click(ratingOption);

    expect(onGroupByChange).toHaveBeenCalledWith('rating');
  });

  it('supports grouping by user', async () => {
    const user = userEvent.setup();
    const onGroupByChange = vi.fn();

    render(
      <FeedbackList feedback={mockFeedback} groupBy="none" onGroupByChange={onGroupByChange} />
    );

    // Open the group by selector
    const select = screen.getByLabelText('Group By');
    await user.click(select);

    // Select "User" option
    const userOption = screen.getByRole('option', { name: 'User' });
    await user.click(userOption);

    expect(onGroupByChange).toHaveBeenCalledWith('user');
  });

  it('paginates feedback when not grouped', () => {
    const largeFeedback: Feedback[] = Array.from({ length: 25 }, (_, i) => ({
      id: `${i + 1}`,
      logId: `log-${i + 1}`,
      userId: `user-${i + 1}`,
      rating: 5,
      thumbsUp: true,
      timestamp: `2024-01-01T${String(i).padStart(2, '0')}:00:00Z`,
    }));

    render(<FeedbackList feedback={largeFeedback} itemsPerPage={10} />);

    // Should show "Load More" button
    expect(screen.getByRole('button', { name: /load more/i })).toBeInTheDocument();

    // Should show count
    expect(screen.getByText(/showing 10 of 25/i)).toBeInTheDocument();
  });

  it('loads more feedback when button clicked', async () => {
    const user = userEvent.setup();
    const largeFeedback: Feedback[] = Array.from({ length: 25 }, (_, i) => ({
      id: `${i + 1}`,
      logId: `log-${i + 1}`,
      userId: `user-${i + 1}`,
      rating: 5,
      thumbsUp: true,
      timestamp: `2024-01-01T${String(i).padStart(2, '0')}:00:00Z`,
    }));

    render(<FeedbackList feedback={largeFeedback} itemsPerPage={10} />);

    // Click load more
    const loadMoreButton = screen.getByRole('button', { name: /load more/i });
    await user.click(loadMoreButton);

    // Should show more items
    expect(screen.getByText(/showing 20 of 25/i)).toBeInTheDocument();
  });

  it('displays log ID reference for each feedback', () => {
    render(<FeedbackList feedback={mockFeedback} />);

    expect(screen.getByText(/log id: log-1/i)).toBeInTheDocument();
    expect(screen.getByText(/log id: log-2/i)).toBeInTheDocument();
    expect(screen.getByText(/log id: log-3/i)).toBeInTheDocument();
  });

  it('formats timestamps correctly', () => {
    render(<FeedbackList feedback={mockFeedback} />);

    // Check that timestamps are formatted (exact format may vary by locale)
    const timestamps = screen.getAllByText(/Jan|2024/);
    expect(timestamps.length).toBeGreaterThan(0);
  });
});
