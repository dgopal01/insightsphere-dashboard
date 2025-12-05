/**
 * useMetrics Hook
 * Manages performance metrics data fetching with React Query
 * Calculates accuracy scores, satisfaction ratings, interaction counts, and response times
 * Supports date range and segmentation filters
 */

import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { apiService } from '../services';
import { listChatLogs, listFeedback } from '../graphql/queries';
import type {
  ChatLog,
  Feedback,
  ListChatLogsResponse,
  ListFeedbackResponse,
} from '../types/graphql';

/**
 * Options for useMetrics hook
 */
export interface UseMetricsOptions {
  startDate?: string;
  endDate?: string;
  userId?: string;
  conversationId?: string;
  enabled?: boolean;
}

/**
 * Return type for useMetrics hook
 */
export interface UseMetricsReturn {
  accuracy: number;
  satisfaction: number;
  interactionCount: number;
  avgResponseTime: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Build GraphQL filter for chat logs
 */
function buildChatLogFilter(options: UseMetricsOptions) {
  const filter: any = {};

  if (options.userId) {
    filter.userId = { eq: options.userId };
  }

  if (options.conversationId) {
    filter.conversationId = { eq: options.conversationId };
  }

  if (options.startDate && options.endDate) {
    filter.timestamp = { between: [options.startDate, options.endDate] };
  } else if (options.startDate) {
    filter.timestamp = { ge: options.startDate };
  } else if (options.endDate) {
    filter.timestamp = { le: options.endDate };
  }

  return Object.keys(filter).length > 0 ? filter : undefined;
}

/**
 * Build GraphQL filter for feedback
 */
function buildFeedbackFilter(options: UseMetricsOptions) {
  const filter: any = {};

  if (options.userId) {
    filter.userId = { eq: options.userId };
  }

  if (options.startDate && options.endDate) {
    filter.timestamp = { between: [options.startDate, options.endDate] };
  } else if (options.startDate) {
    filter.timestamp = { ge: options.startDate };
  } else if (options.endDate) {
    filter.timestamp = { le: options.endDate };
  }

  return Object.keys(filter).length > 0 ? filter : undefined;
}

/**
 * Calculate accuracy score from chat logs
 * Average of accuracy values where available
 */
function calculateAccuracy(logs: ChatLog[]): number {
  const logsWithAccuracy = logs.filter(
    (log) => log.accuracy !== undefined && log.accuracy !== null
  );

  if (logsWithAccuracy.length === 0) {
    return 0;
  }

  const totalAccuracy = logsWithAccuracy.reduce((sum, log) => sum + (log.accuracy || 0), 0);
  return totalAccuracy / logsWithAccuracy.length;
}

/**
 * Calculate satisfaction rating from feedback
 * Average of all ratings (1-5 scale)
 */
function calculateSatisfaction(feedback: Feedback[]): number {
  if (feedback.length === 0) {
    return 0;
  }

  const totalRating = feedback.reduce((sum, f) => sum + f.rating, 0);
  return totalRating / feedback.length;
}

/**
 * Calculate average response time from chat logs
 * Average of responseTime values in milliseconds
 */
function calculateAvgResponseTime(logs: ChatLog[]): number {
  if (logs.length === 0) {
    return 0;
  }

  const totalResponseTime = logs.reduce((sum, log) => sum + log.responseTime, 0);
  return totalResponseTime / logs.length;
}

/**
 * Custom hook for fetching and calculating performance metrics
 */
export function useMetrics(options: UseMetricsOptions = {}): UseMetricsReturn {
  const { startDate, endDate, userId, conversationId, enabled = true } = options;

  // Fetch chat logs for accuracy, interaction count, and response time
  const {
    data: chatLogsData,
    isLoading: isLoadingLogs,
    error: logsError,
    refetch: refetchLogs,
  } = useQuery<ListChatLogsResponse>({
    queryKey: ['metrics', 'chatLogs', startDate, endDate, userId, conversationId],
    queryFn: async () => {
      const filter = buildChatLogFilter({ startDate, endDate, userId, conversationId });

      // Fetch all logs (may need pagination for large datasets)
      const result = await apiService.query<any>(listChatLogs, {
        filter,
        limit: 1000, // Fetch up to 1000 logs for metrics calculation
      });

      return result.listChatLogs;
    },
    enabled,
  });

  // Fetch feedback for satisfaction rating
  const {
    data: feedbackData,
    isLoading: isLoadingFeedback,
    error: feedbackError,
    refetch: refetchFeedback,
  } = useQuery<ListFeedbackResponse>({
    queryKey: ['metrics', 'feedback', startDate, endDate, userId],
    queryFn: async () => {
      const filter = buildFeedbackFilter({ startDate, endDate, userId });

      // Fetch all feedback (may need pagination for large datasets)
      const result = await apiService.query<any>(listFeedback, {
        filter,
        limit: 1000, // Fetch up to 1000 feedback entries for metrics calculation
      });

      return result.listFeedback;
    },
    enabled,
  });

  // Calculate metrics from fetched data
  const metrics = useMemo(() => {
    const logs = chatLogsData?.items || [];
    const feedback = feedbackData?.items || [];

    return {
      accuracy: calculateAccuracy(logs),
      satisfaction: calculateSatisfaction(feedback),
      interactionCount: logs.length,
      avgResponseTime: calculateAvgResponseTime(logs),
    };
  }, [chatLogsData, feedbackData]);

  // Refetch all data
  const refetch = useCallback(() => {
    refetchLogs();
    refetchFeedback();
  }, [refetchLogs, refetchFeedback]);

  return {
    accuracy: metrics.accuracy,
    satisfaction: metrics.satisfaction,
    interactionCount: metrics.interactionCount,
    avgResponseTime: metrics.avgResponseTime,
    isLoading: isLoadingLogs || isLoadingFeedback,
    error: (logsError || feedbackError) as Error | null,
    refetch,
  };
}
