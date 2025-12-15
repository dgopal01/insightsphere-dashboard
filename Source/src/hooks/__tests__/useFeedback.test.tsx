/**
 * Tests for useFeedback hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFeedback } from '../useFeedback';
import { apiService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import type { Feedback } from '../../types';

// Mock dependencies
vi.mock('../../services', () => ({
  apiService: {
    query: vi.fn(),
    mutate: vi.fn(),
    subscribe: vi.fn(() => () => {}),
  },
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('useFeedback', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    vi.clearAllMocks();

    // Mock authenticated user
    vi.mocked(useAuth).mockReturnValue({
      user: { username: 'testuser', role: 'admin' },
      isAuthenticated: true,
      isLoading: false,
      error: null,
      signIn: vi.fn(),
      signOut: vi.fn(),
      hasRole: vi.fn(),
      refreshAuth: vi.fn(),
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should fetch feedback successfully', async () => {
    const mockFeedback: Feedback[] = [
      {
        id: '1',
        logId: 'log1',
        userId: 'user1',
        rating: 5,
        thumbsUp: true,
        timestamp: '2024-01-01T00:00:00Z',
      },
    ];

    vi.mocked(apiService.query).mockResolvedValue({
      listFeedback: {
        items: mockFeedback,
        nextToken: null,
      },
    });

    const { result } = renderHook(() => useFeedback(), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.feedback).toEqual(mockFeedback);
    expect(result.current.error).toBeNull();
  });

  it('should calculate metrics correctly', async () => {
    const mockFeedback: Feedback[] = [
      {
        id: '1',
        logId: 'log1',
        userId: 'user1',
        rating: 5,
        thumbsUp: true,
        timestamp: '2024-01-01T00:00:00Z',
      },
      {
        id: '2',
        logId: 'log2',
        userId: 'user2',
        rating: 3,
        thumbsUp: false,
        timestamp: '2024-01-02T00:00:00Z',
      },
      {
        id: '3',
        logId: 'log3',
        userId: 'user3',
        rating: 4,
        thumbsUp: true,
        timestamp: '2024-01-03T00:00:00Z',
      },
    ];

    vi.mocked(apiService.query).mockResolvedValue({
      listFeedback: {
        items: mockFeedback,
        nextToken: null,
      },
    });

    const { result } = renderHook(() => useFeedback(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.metrics).toEqual({
      positiveCount: 2,
      negativeCount: 1,
      averageRating: 4,
      totalCount: 3,
    });
  });

  it('should submit feedback successfully', async () => {
    const mockFeedback: Feedback = {
      id: 'new-feedback',
      logId: 'log1',
      userId: 'testuser',
      rating: 5,
      thumbsUp: true,
      comment: 'Great response!',
      timestamp: '2024-01-01T00:00:00Z',
    };

    vi.mocked(apiService.query).mockResolvedValue({
      listFeedback: {
        items: [],
        nextToken: null,
      },
    });

    vi.mocked(apiService.mutate).mockResolvedValue({
      createFeedback: mockFeedback,
    });

    const { result } = renderHook(() => useFeedback(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const feedbackInput = {
      logId: 'log1',
      rating: 5,
      thumbsUp: true,
      comment: 'Great response!',
    };

    await result.current.submitFeedback(feedbackInput);

    expect(apiService.mutate).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        input: expect.objectContaining({
          logId: 'log1',
          userId: 'testuser',
          rating: 5,
          thumbsUp: true,
          comment: 'Great response!',
        }),
      })
    );
  });

  it('should filter feedback by logId', async () => {
    const mockFeedback: Feedback[] = [
      {
        id: '1',
        logId: 'log1',
        userId: 'user1',
        rating: 5,
        thumbsUp: true,
        timestamp: '2024-01-01T00:00:00Z',
      },
    ];

    vi.mocked(apiService.query).mockResolvedValue({
      feedbackByLogId: {
        items: mockFeedback,
        nextToken: null,
      },
    });

    const { result } = renderHook(() => useFeedback({ logId: 'log1' }), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.feedback).toEqual(mockFeedback);
  });

  it('should handle empty feedback list', async () => {
    vi.mocked(apiService.query).mockResolvedValue({
      listFeedback: {
        items: [],
        nextToken: null,
      },
    });

    const { result } = renderHook(() => useFeedback(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.feedback).toEqual([]);
    expect(result.current.metrics).toEqual({
      positiveCount: 0,
      negativeCount: 0,
      averageRating: 0,
      totalCount: 0,
    });
  });
});
