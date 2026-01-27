/**
 * useFeedbackMetrics Hook
 * Provides aggregated feedback metrics with time period filtering
 * Requirements: 4.1, 4.2, 4.4, 4.5
 */

import { useMemo } from 'react';
import { useFeedback } from './useFeedback';
import { calculateFeedbackMetrics } from '../utils/feedbackMetrics';
import type { FeedbackMetrics } from '../types';

/**
 * Options for useFeedbackMetrics hook
 */
export interface UseFeedbackMetricsOptions {
  logId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  enabled?: boolean;
}

/**
 * Extended feedback metrics with ratio
 */
export interface ExtendedFeedbackMetrics extends FeedbackMetrics {
  ratio: number;
}

/**
 * Return type for useFeedbackMetrics hook
 */
export interface UseFeedbackMetricsReturn {
  metrics: ExtendedFeedbackMetrics;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Custom hook for fetching and calculating aggregated feedback metrics
 *
 * This hook builds on useFeedback to provide calculated metrics including:
 * - Positive/negative feedback ratio (Requirement 4.1)
 * - Time period filtering (Requirement 4.2)
 * - Average rating calculation (Requirement 4.4)
 * - Date range filtering for metrics (Requirement 4.5)
 *
 * @param options - Configuration options for filtering and fetching
 * @returns Aggregated feedback metrics with loading and error states
 */
export function useFeedbackMetrics(
  options: UseFeedbackMetricsOptions = {}
): UseFeedbackMetricsReturn {
  const { logId, userId, startDate, endDate, enabled = true } = options;

  // Fetch feedback data using the base useFeedback hook
  const { feedback, isLoading, error, refetch } = useFeedback({
    logId,
    userId,
    startDate,
    endDate,
    enabled,
  });

  // Calculate metrics from feedback data
  // Memoize to avoid recalculation on every render
  const metrics = useMemo(() => {
    return calculateFeedbackMetrics(feedback, startDate, endDate);
  }, [feedback, startDate, endDate]);

  return {
    metrics,
    isLoading,
    error,
    refetch,
  };
}
