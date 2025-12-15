/**
 * Unit tests for useFeedbackLogs hook
 * Tests data fetching, filtering, sorting, pagination, and review updates
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useFeedbackLogs } from '../useFeedbackLogs';
import { apiService } from '../../services';
import type { FeedbackLogEntry, ReviewData } from '../../types/graphql';

// Mock the API service
vi.mock('../../services', () => ({
  apiService: {
    query: vi.fn(),
    mutate: vi.fn(),
  },
}));

describe('useFeedbackLogs', () => {
  const mockLogs: FeedbackLogEntry[] = [
    {
      id: '1',
      datetime: '2024-01-01T10:00:00Z',
      carrier: 'CarrierA',
      comments: 'Test comment 1',
      feedback: 'Test feedback 1',
      question: 'Test question 1',
      response: 'Test response 1',
      rev_comment: '',
      rev_feedback: '',
    },
    {
      id: '2',
      datetime: '2024-01-02T10:00:00Z',
      carrier: 'CarrierB',
      comments: 'Test comment 2',
      feedback: 'Test feedback 2',
      question: 'Test question 2',
      response: 'Test response 2',
      rev_comment: 'Reviewed',
      rev_feedback: '',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useFeedbackLogs());

    expect(result.current.logs).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.totalCount).toBe(0);
    expect(result.current.nextToken).toBeNull();
  });

  it('should fetch logs successfully', async () => {
    vi.mocked(apiService.query).mockResolvedValueOnce({
      listUserFeedbacks: {
        items: mockLogs,
        nextToken: null,
      },
    });

    const { result } = renderHook(() => useFeedbackLogs());

    await result.current.fetchLogs();

    await waitFor(() => {
      expect(result.current.logs).toHaveLength(2);
    });

    expect(result.current.logs[0].id).toBe('2'); // Descending order by default
    expect(result.current.logs[1].id).toBe('1');
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('should sort logs in ascending order', async () => {
    vi.mocked(apiService.query).mockResolvedValueOnce({
      listUserFeedbacks: {
        items: mockLogs,
        nextToken: null,
      },
    });

    const { result } = renderHook(() => useFeedbackLogs());

    await result.current.fetchLogs(undefined, 'asc');

    await waitFor(() => {
      expect(result.current.logs).toHaveLength(2);
    });

    expect(result.current.logs[0].id).toBe('1'); // Ascending order
    expect(result.current.logs[1].id).toBe('2');
  });

  it('should filter logs by carrier', async () => {
    vi.mocked(apiService.query).mockResolvedValueOnce({
      listUserFeedbacks: {
        items: [mockLogs[0]],
        nextToken: null,
      },
    });

    const { result } = renderHook(() => useFeedbackLogs());

    await result.current.fetchLogs({ carrier: 'CarrierA' });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(apiService.query).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        filter: expect.objectContaining({
          and: expect.arrayContaining([
            expect.objectContaining({
              carrier: { eq: 'CarrierA' },
            }),
          ]),
        }),
      })
    );
  });

  it('should handle pagination', async () => {
    vi.mocked(apiService.query)
      .mockResolvedValueOnce({
        listUserFeedbacks: {
          items: [mockLogs[0]],
          nextToken: 'token123',
        },
      })
      .mockResolvedValueOnce({
        listUserFeedbacks: {
          items: [mockLogs[1]],
          nextToken: null,
        },
      });

    const { result } = renderHook(() => useFeedbackLogs());

    await result.current.fetchLogs();

    await waitFor(() => {
      expect(result.current.logs).toHaveLength(1);
    });

    expect(result.current.nextToken).toBe('token123');

    await result.current.fetchNextPage();

    await waitFor(() => {
      expect(result.current.logs).toHaveLength(2);
    });

    expect(result.current.nextToken).toBeNull();
  });

  it('should update review successfully', async () => {
    vi.mocked(apiService.query).mockResolvedValueOnce({
      listUserFeedbacks: {
        items: mockLogs,
        nextToken: null,
      },
    });

    vi.mocked(apiService.mutate).mockResolvedValueOnce({
      updateUserFeedback: {
        ...mockLogs[0],
        rev_comment: 'Updated comment',
        rev_feedback: 'Updated feedback',
      },
    });

    const { result } = renderHook(() => useFeedbackLogs());

    await result.current.fetchLogs();

    await waitFor(() => {
      expect(result.current.logs).toHaveLength(2);
    });

    const reviewData: ReviewData = {
      rev_comment: 'Updated comment',
      rev_feedback: 'Updated feedback',
    };

    await result.current.updateReview('1', reviewData);

    await waitFor(() => {
      const updatedLog = result.current.logs.find((log) => log.id === '1');
      expect(updatedLog?.rev_comment).toBe('Updated comment');
    });

    const updatedLog = result.current.logs.find((log) => log.id === '1');
    expect(updatedLog?.rev_feedback).toBe('Updated feedback');
  });

  it('should handle fetch errors', async () => {
    const errorMessage = 'Network error';
    vi.mocked(apiService.query).mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useFeedbackLogs());

    await result.current.fetchLogs();

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });

    expect(result.current.error?.message).toBe(errorMessage);
    expect(result.current.logs).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('should handle update errors', async () => {
    vi.mocked(apiService.query).mockResolvedValueOnce({
      listUserFeedbacks: {
        items: mockLogs,
        nextToken: null,
      },
    });

    const errorMessage = 'Update failed';
    vi.mocked(apiService.mutate).mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useFeedbackLogs());

    await result.current.fetchLogs();

    await waitFor(() => {
      expect(result.current.logs).toHaveLength(2);
    });

    const reviewData: ReviewData = {
      rev_comment: 'Test',
      rev_feedback: 'Test',
    };

    await expect(result.current.updateReview('1', reviewData)).rejects.toThrow(errorMessage);
    
    await waitFor(() => {
      expect(result.current.error?.message).toBe(errorMessage);
    });
  });

  it('should refetch data', async () => {
    vi.mocked(apiService.query)
      .mockResolvedValueOnce({
        listUserFeedbacks: {
          items: [mockLogs[0]],
          nextToken: null,
        },
      })
      .mockResolvedValueOnce({
        listUserFeedbacks: {
          items: mockLogs,
          nextToken: null,
        },
      });

    const { result } = renderHook(() => useFeedbackLogs());

    await result.current.fetchLogs();

    await waitFor(() => {
      expect(result.current.logs).toHaveLength(1);
    });

    await result.current.refetch();

    await waitFor(() => {
      expect(result.current.logs).toHaveLength(2);
    });
  });

  it('should filter by date range', async () => {
    vi.mocked(apiService.query).mockResolvedValueOnce({
      listUserFeedbacks: {
        items: mockLogs,
        nextToken: null,
      },
    });

    const { result } = renderHook(() => useFeedbackLogs());

    await result.current.fetchLogs({
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2024-01-31T23:59:59Z',
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(apiService.query).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        filter: expect.objectContaining({
          and: expect.arrayContaining([
            expect.objectContaining({
              datetime: { ge: '2024-01-01T00:00:00Z' },
            }),
            expect.objectContaining({
              datetime: { le: '2024-01-31T23:59:59Z' },
            }),
          ]),
        }),
      })
    );
  });

  it('should filter by review status - reviewed', async () => {
    vi.mocked(apiService.query).mockResolvedValueOnce({
      listUserFeedbacks: {
        items: [mockLogs[1]],
        nextToken: null,
      },
    });

    const { result } = renderHook(() => useFeedbackLogs());

    await result.current.fetchLogs({ reviewStatus: 'reviewed' });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(apiService.query).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        filter: expect.objectContaining({
          or: expect.arrayContaining([
            expect.objectContaining({
              rev_comment: { ne: '' },
            }),
            expect.objectContaining({
              rev_feedback: { ne: '' },
            }),
          ]),
        }),
      })
    );
  });

  it('should filter by review status - pending', async () => {
    vi.mocked(apiService.query).mockResolvedValueOnce({
      listUserFeedbacks: {
        items: [mockLogs[0]],
        nextToken: null,
      },
    });

    const { result } = renderHook(() => useFeedbackLogs());

    await result.current.fetchLogs({ reviewStatus: 'pending' });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(apiService.query).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        filter: expect.objectContaining({
          and: expect.any(Array),
        }),
      })
    );
  });
});
