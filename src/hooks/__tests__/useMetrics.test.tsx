/**
 * Unit tests for useMetrics hook
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMetrics } from '../useMetrics';
import { apiService } from '../../services';
import type { ChatLog, Feedback } from '../../types/graphql';

// Mock the API service
vi.mock('../../services', () => ({
  apiService: {
    query: vi.fn(),
  },
}));

// Helper to create a wrapper with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useMetrics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should calculate metrics correctly with valid data', async () => {
    const mockChatLogs: ChatLog[] = [
      {
        id: '1',
        conversationId: 'conv1',
        userId: 'user1',
        timestamp: '2024-01-01T10:00:00Z',
        userMessage: 'Hello',
        aiResponse: 'Hi there',
        responseTime: 100,
        accuracy: 90,
        sentiment: 'positive',
      },
      {
        id: '2',
        conversationId: 'conv1',
        userId: 'user1',
        timestamp: '2024-01-01T11:00:00Z',
        userMessage: 'How are you?',
        aiResponse: 'I am fine',
        responseTime: 200,
        accuracy: 80,
        sentiment: 'positive',
      },
    ];

    const mockFeedback: Feedback[] = [
      {
        id: 'f1',
        logId: '1',
        userId: 'user1',
        rating: 5,
        thumbsUp: true,
        timestamp: '2024-01-01T10:05:00Z',
      },
      {
        id: 'f2',
        logId: '2',
        userId: 'user1',
        rating: 4,
        thumbsUp: true,
        timestamp: '2024-01-01T11:05:00Z',
      },
    ];

    vi.mocked(apiService.query).mockImplementation(async (query: string) => {
      if (query.includes('listChatLogs')) {
        return { listChatLogs: { items: mockChatLogs, nextToken: null } };
      }
      if (query.includes('listFeedback')) {
        return { listFeedback: { items: mockFeedback, nextToken: null } };
      }
      return {};
    });

    const { result } = renderHook(() => useMetrics(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Accuracy: (90 + 80) / 2 = 85
    expect(result.current.accuracy).toBe(85);

    // Satisfaction: (5 + 4) / 2 = 4.5
    expect(result.current.satisfaction).toBe(4.5);

    // Interaction count: 2
    expect(result.current.interactionCount).toBe(2);

    // Avg response time: (100 + 200) / 2 = 150
    expect(result.current.avgResponseTime).toBe(150);
  });

  it('should handle empty data gracefully', async () => {
    vi.mocked(apiService.query).mockImplementation(async (query: string) => {
      if (query.includes('listChatLogs')) {
        return { listChatLogs: { items: [], nextToken: null } };
      }
      if (query.includes('listFeedback')) {
        return { listFeedback: { items: [], nextToken: null } };
      }
      return {};
    });

    const { result } = renderHook(() => useMetrics(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.accuracy).toBe(0);
    expect(result.current.satisfaction).toBe(0);
    expect(result.current.interactionCount).toBe(0);
    expect(result.current.avgResponseTime).toBe(0);
  });

  it('should filter by date range', async () => {
    const mockChatLogs: ChatLog[] = [
      {
        id: '1',
        conversationId: 'conv1',
        userId: 'user1',
        timestamp: '2024-01-15T10:00:00Z',
        userMessage: 'Hello',
        aiResponse: 'Hi',
        responseTime: 100,
        accuracy: 90,
      },
    ];

    vi.mocked(apiService.query).mockImplementation(async (query: string, variables: any) => {
      if (query.includes('listChatLogs')) {
        // Verify filter is applied
        expect(variables.filter).toBeDefined();
        expect(variables.filter.timestamp).toBeDefined();
        return { listChatLogs: { items: mockChatLogs, nextToken: null } };
      }
      if (query.includes('listFeedback')) {
        return { listFeedback: { items: [], nextToken: null } };
      }
      return {};
    });

    const { result } = renderHook(
      () =>
        useMetrics({
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-01-31T23:59:59Z',
        }),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.interactionCount).toBe(1);
  });

  it('should filter by userId', async () => {
    const mockChatLogs: ChatLog[] = [
      {
        id: '1',
        conversationId: 'conv1',
        userId: 'user1',
        timestamp: '2024-01-01T10:00:00Z',
        userMessage: 'Hello',
        aiResponse: 'Hi',
        responseTime: 100,
        accuracy: 90,
      },
    ];

    vi.mocked(apiService.query).mockImplementation(async (query: string, variables: any) => {
      if (query.includes('listChatLogs')) {
        // Verify userId filter is applied
        expect(variables.filter).toBeDefined();
        expect(variables.filter.userId).toEqual({ eq: 'user1' });
        return { listChatLogs: { items: mockChatLogs, nextToken: null } };
      }
      if (query.includes('listFeedback')) {
        return { listFeedback: { items: [], nextToken: null } };
      }
      return {};
    });

    const { result } = renderHook(() => useMetrics({ userId: 'user1' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.interactionCount).toBe(1);
  });

  it('should filter by conversationId', async () => {
    const mockChatLogs: ChatLog[] = [
      {
        id: '1',
        conversationId: 'conv1',
        userId: 'user1',
        timestamp: '2024-01-01T10:00:00Z',
        userMessage: 'Hello',
        aiResponse: 'Hi',
        responseTime: 100,
        accuracy: 90,
      },
    ];

    vi.mocked(apiService.query).mockImplementation(async (query: string, variables: any) => {
      if (query.includes('listChatLogs')) {
        // Verify conversationId filter is applied
        expect(variables.filter).toBeDefined();
        expect(variables.filter.conversationId).toEqual({ eq: 'conv1' });
        return { listChatLogs: { items: mockChatLogs, nextToken: null } };
      }
      if (query.includes('listFeedback')) {
        return { listFeedback: { items: [], nextToken: null } };
      }
      return {};
    });

    const { result } = renderHook(() => useMetrics({ conversationId: 'conv1' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.interactionCount).toBe(1);
  });

  it('should handle logs without accuracy values', async () => {
    const mockChatLogs: ChatLog[] = [
      {
        id: '1',
        conversationId: 'conv1',
        userId: 'user1',
        timestamp: '2024-01-01T10:00:00Z',
        userMessage: 'Hello',
        aiResponse: 'Hi',
        responseTime: 100,
        // No accuracy field
      },
      {
        id: '2',
        conversationId: 'conv1',
        userId: 'user1',
        timestamp: '2024-01-01T11:00:00Z',
        userMessage: 'How are you?',
        aiResponse: 'Fine',
        responseTime: 200,
        accuracy: 80,
      },
    ];

    vi.mocked(apiService.query).mockImplementation(async (query: string) => {
      if (query.includes('listChatLogs')) {
        return { listChatLogs: { items: mockChatLogs, nextToken: null } };
      }
      if (query.includes('listFeedback')) {
        return { listFeedback: { items: [], nextToken: null } };
      }
      return {};
    });

    const { result } = renderHook(() => useMetrics(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Only one log has accuracy, so average should be 80
    expect(result.current.accuracy).toBe(80);
    expect(result.current.interactionCount).toBe(2);
  });

  it('should handle errors gracefully', async () => {
    vi.mocked(apiService.query).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useMetrics(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toBe('Network error');
  });

  it('should support refetch', async () => {
    let callCount = 0;

    vi.mocked(apiService.query).mockImplementation(async (query: string) => {
      callCount++;
      if (query.includes('listChatLogs')) {
        return { listChatLogs: { items: [], nextToken: null } };
      }
      if (query.includes('listFeedback')) {
        return { listFeedback: { items: [], nextToken: null } };
      }
      return {};
    });

    const { result } = renderHook(() => useMetrics(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const initialCallCount = callCount;

    // Trigger refetch
    result.current.refetch();

    await waitFor(() => {
      expect(callCount).toBeGreaterThan(initialCallCount);
    });
  });
});
