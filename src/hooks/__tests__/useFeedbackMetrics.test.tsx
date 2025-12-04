/**
 * Tests for useFeedbackMetrics hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFeedbackMetrics } from '../useFeedbackMetrics';
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

describe('useFeedbackMetrics', () => {
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

  it('should calculate metrics from feedback data', async () => {
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

    const { result } = renderHook(() => useFeedbackMetrics(), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.metrics).toEqual({
      positiveCount: 2,
      negativeCount: 1,
      averageRating: 4,
      totalCount: 3,
      ratio: 2,
    });
  });

  it('should filter metrics by time period', async () => {
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
        timestamp: '2024-01-15T00:00:00Z',
      },
      {
        id: '3',
        logId: 'log3',
        userId: 'user3',
        rating: 4,
        thumbsUp: true,
        timestamp: '2024-02-01T00:00:00Z',
      },
    ];

    vi.mocked(apiService.query).mockResolvedValue({
      listFeedback: {
        items: mockFeedback,
        nextToken: null,
      },
    });

    const { result } = renderHook(
      () =>
        useFeedbackMetrics({
          startDate: '2024-01-10T00:00:00Z',
          endDate: '2024-01-20T00:00:00Z',
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Only feedback with id '2' should be included
    expect(result.current.metrics).toEqual({
      positiveCount: 0,
      negativeCount: 1,
      averageRating: 3,
      totalCount: 1,
      ratio: 0,
    });
  });

  it('should handle empty feedback', async () => {
    vi.mocked(apiService.query).mockResolvedValue({
      listFeedback: {
        items: [],
        nextToken: null,
      },
    });

    const { result } = renderHook(() => useFeedbackMetrics(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.metrics).toEqual({
      positiveCount: 0,
      negativeCount: 0,
      averageRating: 0,
      totalCount: 0,
      ratio: 0,
    });
  });

  it('should filter by logId', async () => {
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

    const { result } = renderHook(() => useFeedbackMetrics({ logId: 'log1' }), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.metrics.totalCount).toBe(1);
    expect(result.current.metrics.positiveCount).toBe(1);
  });

  it('should handle all positive feedback', async () => {
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
        rating: 4,
        thumbsUp: true,
        timestamp: '2024-01-02T00:00:00Z',
      },
    ];

    vi.mocked(apiService.query).mockResolvedValue({
      listFeedback: {
        items: mockFeedback,
        nextToken: null,
      },
    });

    const { result } = renderHook(() => useFeedbackMetrics(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.metrics).toEqual({
      positiveCount: 2,
      negativeCount: 0,
      averageRating: 4.5,
      totalCount: 2,
      ratio: 2, // When no negative, ratio equals positive count
    });
  });
});
