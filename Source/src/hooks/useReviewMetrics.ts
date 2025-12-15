/**
 * useReviewMetrics Hook
 * Manages review metrics data fetching for the dashboard
 * Provides auto-refresh functionality and calculates derived metrics
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import * as DynamoDBService from '../services/DynamoDBService';
import type { ReviewMetrics } from '../types/graphql';

/**
 * Extended metrics with calculated percentages
 */
export interface ExtendedReviewMetrics extends ReviewMetrics {
  chatLogsReviewedPercentage: number;
  feedbackLogsReviewedPercentage: number;
}

/**
 * Return type for useReviewMetrics hook
 */
export interface UseReviewMetricsReturn {
  metrics: ExtendedReviewMetrics | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
}

/**
 * Options for useReviewMetrics hook
 */
export interface UseReviewMetricsOptions {
  autoRefreshInterval?: number; // milliseconds, 0 to disable
  enabled?: boolean;
}

/**
 * Calculate percentage from counts
 */
function calculatePercentage(reviewed: number, total: number): number {
  if (total === 0) {
    return 0;
  }
  return Math.round((reviewed / total) * 100);
}

/**
 * Custom hook for fetching and managing review metrics
 * 
 * @param options - Configuration options for the hook
 * @returns Metrics data, loading state, error state, refetch function, and last updated timestamp
 * 
 * @example
 * ```tsx
 * const { metrics, loading, error, refetch, lastUpdated } = useReviewMetrics({
 *   autoRefreshInterval: 30000, // Refresh every 30 seconds
 * });
 * ```
 */
export function useReviewMetrics(
  options: UseReviewMetricsOptions = {}
): UseReviewMetricsReturn {
  const { autoRefreshInterval = 0, enabled = true } = options;

  const [metrics, setMetrics] = useState<ExtendedReviewMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Use ref to track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef<boolean>(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Fetch metrics from the API
   * Since getReviewMetrics resolver doesn't exist, we calculate metrics client-side
   */
  const fetchMetrics = useCallback(async () => {
    if (!enabled) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch all chat logs and feedback logs to calculate metrics
      // Using DynamoDB directly
      const [chatLogsResponse, feedbackLogsResponse] = await Promise.all([
        DynamoDBService.listChatLogs(1000),
        DynamoDBService.listFeedbackLogs(1000),
      ]);

      const chatLogs = chatLogsResponse.items;
      const feedbackLogs = feedbackLogsResponse.items;

      // Calculate chat logs metrics
      const totalChatLogs = chatLogs.length;
      const reviewedChatLogs = chatLogs.filter(
        (log) => log.rev_comment || log.rev_feedback
      ).length;
      const pendingChatLogs = totalChatLogs - reviewedChatLogs;

      // Calculate feedback logs metrics
      const totalFeedbackLogs = feedbackLogs.length;
      const reviewedFeedbackLogs = feedbackLogs.filter(
        (log) => log.rev_comment || log.rev_feedback
      ).length;
      const pendingFeedbackLogs = totalFeedbackLogs - reviewedFeedbackLogs;

      // Calculate percentages
      const chatLogsReviewedPercentage = calculatePercentage(
        reviewedChatLogs,
        totalChatLogs
      );

      const feedbackLogsReviewedPercentage = calculatePercentage(
        reviewedFeedbackLogs,
        totalFeedbackLogs
      );

      const extendedMetrics: ExtendedReviewMetrics = {
        totalChatLogs,
        reviewedChatLogs,
        pendingChatLogs,
        totalFeedbackLogs,
        reviewedFeedbackLogs,
        pendingFeedbackLogs,
        chatLogsReviewedPercentage,
        feedbackLogsReviewedPercentage,
      };

      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setMetrics(extendedMetrics);
        setLastUpdated(new Date());
        setLoading(false);
      }
    } catch (err) {
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch review metrics';
        setError(new Error(errorMessage));
        setLoading(false);
      }
    }
  }, [enabled]);

  /**
   * Refetch metrics manually
   */
  const refetch = useCallback(async () => {
    await fetchMetrics();
  }, [fetchMetrics]);

  /**
   * Set up auto-refresh interval
   */
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Fetch metrics immediately on mount or when enabled changes
    if (enabled) {
      fetchMetrics();

      // Set up auto-refresh if interval is specified
      if (autoRefreshInterval > 0) {
        intervalRef.current = setInterval(() => {
          fetchMetrics();
        }, autoRefreshInterval);
      }
    }

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, autoRefreshInterval, fetchMetrics]);

  /**
   * Track component mount status
   */
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    metrics,
    loading,
    error,
    refetch,
    lastUpdated,
  };
}
