/**
 * Unit tests for useChatLogs hook
 * Tests data fetching, filtering, sorting, pagination, and review updates
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useChatLogs } from '../useChatLogs';
import { apiService } from '../../services';
import type { ChatLogEntry, ReviewData } from '../../types/graphql';

// Mock the API service
vi.mock('../../services', () => ({
  apiService: {
    query: vi.fn(),
    mutate: vi.fn(),
  },
}));

describe('useChatLogs', () => {
  const mockLogs: ChatLogEntry[] = [
    {
      log_id: '1',
      timestamp: '2024-01-01T10:00:00Z',
      carrier_name: 'CarrierA',
      question: 'Test question 1',
      response: 'Test response 1',
      rev_comment: '',
      rev_feedback: '',
    },
    {
      log_id: '2',
      timestamp: '2024-01-02T10:00:00Z',
      carrier_name: 'CarrierB',
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
    const { result } = renderHook(() => useChatLogs());

    expect(result.current.logs).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.totalCount).toBe(0);
    expect(result.current.nextToken).toBeNull();
  });

  it('should fetch logs successfully', async () => {
    vi.mocked(apiService.query).mockResolvedValueOnce({
      listUnityAIAssistantLogs: {
        items: mockLogs,
        nextToken: null,
      },
    });

    const { result } = renderHook(() => useChatLogs());

    await result.current.fetchLogs();

    await waitFor(() => {
      expect(result.current.logs).toHaveLength(2);
    });

    expect(result.current.logs[0].log_id).toBe('2'); // Descending order by default
    expect(result.current.logs[1].log_id).toBe('1');
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('should sort logs in ascending order', async () => {
    vi.mocked(apiService.query).mockResolvedValueOnce({
      listUnityAIAssistantLogs: {
        items: mockLogs,
        nextToken: null,
      },
    });

    const { result } = renderHook(() => useChatLogs());

    await result.current.fetchLogs(undefined, 'asc');

    await waitFor(() => {
      expect(result.current.logs).toHaveLength(2);
    });

    expect(result.current.logs[0].log_id).toBe('1'); // Ascending order
    expect(result.current.logs[1].log_id).toBe('2');
  });

  it('should filter logs by carrier_name', async () => {
    vi.mocked(apiService.query).mockResolvedValueOnce({
      listUnityAIAssistantLogs: {
        items: [mockLogs[0]],
        nextToken: null,
      },
    });

    const { result } = renderHook(() => useChatLogs());

    await result.current.fetchLogs({ carrier_name: 'CarrierA' });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(apiService.query).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        filter: expect.objectContaining({
          and: expect.arrayContaining([
            expect.objectContaining({
              carrier_name: { eq: 'CarrierA' },
            }),
          ]),
        }),
      })
    );
  });

  it('should handle pagination', async () => {
    vi.mocked(apiService.query)
      .mockResolvedValueOnce({
        listUnityAIAssistantLogs: {
          items: [mockLogs[0]],
          nextToken: 'token123',
        },
      })
      .mockResolvedValueOnce({
        listUnityAIAssistantLogs: {
          items: [mockLogs[1]],
          nextToken: null,
        },
      });

    const { result } = renderHook(() => useChatLogs());

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
      listUnityAIAssistantLogs: {
        items: mockLogs,
        nextToken: null,
      },
    });

    vi.mocked(apiService.mutate).mockResolvedValueOnce({
      updateUnityAIAssistantLog: {
        ...mockLogs[0],
        rev_comment: 'Updated comment',
        rev_feedback: 'Updated feedback',
      },
    });

    const { result } = renderHook(() => useChatLogs());

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
      const updatedLog = result.current.logs.find((log) => log.log_id === '1');
      expect(updatedLog?.rev_comment).toBe('Updated comment');
    });

    const updatedLog = result.current.logs.find((log) => log.log_id === '1');
    expect(updatedLog?.rev_feedback).toBe('Updated feedback');
  });

  it('should handle fetch errors', async () => {
    const errorMessage = 'Network error';
    vi.mocked(apiService.query).mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useChatLogs());

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
      listUnityAIAssistantLogs: {
        items: mockLogs,
        nextToken: null,
      },
    });

    const errorMessage = 'Update failed';
    vi.mocked(apiService.mutate).mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useChatLogs());

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
        listUnityAIAssistantLogs: {
          items: [mockLogs[0]],
          nextToken: null,
        },
      })
      .mockResolvedValueOnce({
        listUnityAIAssistantLogs: {
          items: mockLogs,
          nextToken: null,
        },
      });

    const { result } = renderHook(() => useChatLogs());

    await result.current.fetchLogs();

    await waitFor(() => {
      expect(result.current.logs).toHaveLength(1);
    });

    await result.current.refetch();

    await waitFor(() => {
      expect(result.current.logs).toHaveLength(2);
    });
  });
});
