/**
 * Tests for useReviewMetrics hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useReviewMetrics } from '../useReviewMetrics';
import { apiService } from '../../services';
import type { ReviewMetrics } from '../../types/graphql';

// Mock dependencies
vi.mock('../../services', () => ({
  apiService: {
    query: vi.fn(),
    mutate: vi.fn(),
    subscribe: vi.fn(() => () => {}),
  },
}));

describe('useReviewMetrics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('should fetch and calculate metrics correctly', async () => {
    const mockMetrics: ReviewMetrics = {
      totalChatLogs: 100,
      reviewedChatLogs: 75,
      pendingChatLogs: 25,
      totalFeedbackLogs: 50,
      reviewedFeedbackLogs: 30,
      pendingFeedbackLogs: 20,
    };

    vi.mocked(apiService.query).mockResolvedValue({
      getReviewMetrics: mockMetrics,
    });

    const { result } = renderHook(() => useReviewMetrics());

    expect(result.current.loading).toBe(true);
    expect(result.current.metrics).toBe(null);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.metrics).toEqual({
      ...mockMetrics,
      chatLogsReviewedPercentage: 75, // 75/100 = 75%
      feedbackLogsReviewedPercentage: 60, // 30/50 = 60%
    });
    expect(result.current.error).toBe(null);
    expect(result.current.lastUpdated).toBeInstanceOf(Date);
  });

  it('should handle zero totals correctly', async () => {
    const mockMetrics: ReviewMetrics = {
      totalChatLogs: 0,
      reviewedChatLogs: 0,
      pendingChatLogs: 0,
      totalFeedbackLogs: 0,
      reviewedFeedbackLogs: 0,
      pendingFeedbackLogs: 0,
    };

    vi.mocked(apiService.query).mockResolvedValue({
      getReviewMetrics: mockMetrics,
    });

    const { result } = renderHook(() => useReviewMetrics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.metrics).toEqual({
      ...mockMetrics,
      chatLogsReviewedPercentage: 0,
      feedbackLogsReviewedPercentage: 0,
    });
  });

  it('should handle errors correctly', async () => {
    const errorMessage = 'Failed to fetch metrics';
    vi.mocked(apiService.query).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useReviewMetrics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe(errorMessage);
    expect(result.current.metrics).toBe(null);
  });

  it('should refetch metrics when refetch is called', async () => {
    const mockMetrics: ReviewMetrics = {
      totalChatLogs: 100,
      reviewedChatLogs: 75,
      pendingChatLogs: 25,
      totalFeedbackLogs: 50,
      reviewedFeedbackLogs: 30,
      pendingFeedbackLogs: 20,
    };

    vi.mocked(apiService.query).mockResolvedValue({
      getReviewMetrics: mockMetrics,
    });

    const { result } = renderHook(() => useReviewMetrics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(apiService.query).toHaveBeenCalledTimes(1);

    // Update mock for second call
    const updatedMetrics: ReviewMetrics = {
      totalChatLogs: 100,
      reviewedChatLogs: 80,
      pendingChatLogs: 20,
      totalFeedbackLogs: 50,
      reviewedFeedbackLogs: 35,
      pendingFeedbackLogs: 15,
    };

    vi.mocked(apiService.query).mockResolvedValue({
      getReviewMetrics: updatedMetrics,
    });

    await result.current.refetch();

    await waitFor(() => {
      expect(result.current.metrics?.reviewedChatLogs).toBe(80);
    });

    expect(apiService.query).toHaveBeenCalledTimes(2);
    expect(result.current.metrics?.chatLogsReviewedPercentage).toBe(80);
  });

  it('should not fetch when enabled is false', () => {
    const { result } = renderHook(() => useReviewMetrics({ enabled: false }));

    expect(apiService.query).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(true);
    expect(result.current.metrics).toBe(null);
  });

  it('should calculate percentages correctly with rounding', async () => {
    const mockMetrics: ReviewMetrics = {
      totalChatLogs: 3,
      reviewedChatLogs: 2,
      pendingChatLogs: 1,
      totalFeedbackLogs: 7,
      reviewedFeedbackLogs: 5,
      pendingFeedbackLogs: 2,
    };

    vi.mocked(apiService.query).mockResolvedValue({
      getReviewMetrics: mockMetrics,
    });

    const { result } = renderHook(() => useReviewMetrics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // 2/3 = 0.6666... should round to 67%
    expect(result.current.metrics?.chatLogsReviewedPercentage).toBe(67);
    // 5/7 = 0.7142... should round to 71%
    expect(result.current.metrics?.feedbackLogsReviewedPercentage).toBe(71);
  });

  it('should update lastUpdated timestamp on successful fetch', async () => {
    const mockMetrics: ReviewMetrics = {
      totalChatLogs: 100,
      reviewedChatLogs: 75,
      pendingChatLogs: 25,
      totalFeedbackLogs: 50,
      reviewedFeedbackLogs: 30,
      pendingFeedbackLogs: 20,
    };

    vi.mocked(apiService.query).mockResolvedValue({
      getReviewMetrics: mockMetrics,
    });

    const { result } = renderHook(() => useReviewMetrics());

    expect(result.current.lastUpdated).toBe(null);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.lastUpdated).toBeInstanceOf(Date);
  });
});
