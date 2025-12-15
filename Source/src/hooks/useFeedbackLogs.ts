/**
 * useFeedbackLogs Hook
 * Manages User Feedback logs data fetching for the Chat Logs Review System
 * Supports pagination, filtering, sorting, and review submission
 */

import { useState, useCallback } from 'react';
import * as DynamoDBService from '../services/DynamoDBService';
import type { FeedbackLogFilters, ReviewData } from '../types/graphql';

/**
 * Sort direction for datetime
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Return type for useFeedbackLogs hook
 */
export interface UseFeedbackLogsReturn {
  logs: DynamoDBService.FeedbackLogEntry[];
  loading: boolean;
  error: Error | null;
  totalCount: number;
  nextToken: string | null;
  fetchLogs: (filters?: FeedbackLogFilters, sortDirection?: SortDirection) => Promise<void>;
  fetchNextPage: () => Promise<void>;
  updateReview: (logId: string, reviewData: ReviewData) => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Sort logs by datetime
 */
function sortLogs(logs: DynamoDBService.FeedbackLogEntry[], direction: SortDirection): DynamoDBService.FeedbackLogEntry[] {
  return [...logs].sort((a, b) => {
    const timeA = new Date(a.datetime).getTime();
    const timeB = new Date(b.datetime).getTime();
    return direction === 'asc' ? timeA - timeB : timeB - timeA;
  });
}

/**
 * Apply client-side filters to feedback logs
 */
function applyFilters(logs: DynamoDBService.FeedbackLogEntry[], filters?: FeedbackLogFilters): DynamoDBService.FeedbackLogEntry[] {
  if (!filters) return logs;

  return logs.filter((log) => {
    // Carrier filter
    if (filters.carrier && log.info?.carrier !== filters.carrier) {
      return false;
    }

    // Feedback type filter
    if (filters.feedbackType && filters.feedbackType !== 'all') {
      const logFeedback = log.info?.feedback;
      
      // Handle empty/no feedback filter
      if (filters.feedbackType === 'none') {
        if (logFeedback) {
          return false;
        }
      } else {
        // For thumbs_up or thumbs_down, check exact match
        if (!logFeedback || logFeedback !== filters.feedbackType) {
          console.log('Filtering out log:', { 
            logId: log.id,
            filterValue: filters.feedbackType, 
            logFeedback, 
            logFeedbackType: typeof logFeedback,
            match: logFeedback === filters.feedbackType 
          });
          return false;
        }
      }
    }

    // Date range filter
    if (filters.startDate) {
      const logDate = new Date(log.datetime).toISOString().split('T')[0];
      if (logDate < filters.startDate) {
        return false;
      }
    }
    if (filters.endDate) {
      const logDate = new Date(log.datetime).toISOString().split('T')[0];
      if (logDate > filters.endDate) {
        return false;
      }
    }

    // Review status filter
    if (filters.reviewStatus === 'reviewed') {
      if (!log.rev_comment && !log.rev_feedback) {
        return false;
      }
    } else if (filters.reviewStatus === 'pending') {
      if (log.rev_comment || log.rev_feedback) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Custom hook for fetching and managing User Feedback logs
 */
export function useFeedbackLogs(): UseFeedbackLogsReturn {
  const [logs, setLogs] = useState<DynamoDBService.FeedbackLogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<FeedbackLogFilters | undefined>(undefined);
  const [currentSortDirection, setCurrentSortDirection] = useState<SortDirection>('desc');
  const [totalCount, setTotalCount] = useState<number>(0);

  /**
   * Fetch feedback logs with filters and sorting
   */
  const fetchLogs = useCallback(
    async (filters?: FeedbackLogFilters, sortDirection: SortDirection = 'desc') => {
      setLoading(true);
      setError(null);
      setCurrentFilters(filters);
      setCurrentSortDirection(sortDirection);

      try {
        // Fetch from DynamoDB
        console.log('Fetching feedback logs with filters:', filters);
        const result = await DynamoDBService.listFeedbackLogs(1000);
        console.log('Fetched feedback logs:', result.items.length, 'items');
        
        // Log unique feedback values to understand data structure
        const uniqueFeedbackValues = new Set(result.items.map(log => log.info?.feedback).filter(Boolean));
        console.log('Unique feedback values in data:', Array.from(uniqueFeedbackValues));
        
        // Apply client-side filters
        const filteredLogs = applyFilters(result.items, filters);
        console.log('Filtered logs:', filteredLogs.length, 'items', 'Filter:', filters?.feedbackType);
        
        // Sort logs
        const sortedLogs = sortLogs(filteredLogs, sortDirection);

        setLogs(sortedLogs);
        setNextToken(null); // Pagination handled client-side for now
        setTotalCount(sortedLogs.length);
      } catch (err) {
        console.error('Error in fetchLogs:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch feedback logs';
        setError(new Error(errorMessage));
        setLogs([]);
        setNextToken(null);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Fetch next page of results
   * Note: Pagination is handled client-side for now
   */
  const fetchNextPage = useCallback(async () => {
    // All data is loaded at once, so no pagination needed
    return Promise.resolve();
  }, []);

  /**
   * Update review fields for a feedback log entry
   */
  const updateReview = useCallback(
    async (logId: string, reviewData: ReviewData) => {
      setError(null);

      try {
        // Find the log to get its datetime (composite key)
        const log = logs.find((l) => l.id === logId);
        if (!log) {
          throw new Error(`Feedback log not found: ${logId}`);
        }

        // Update in DynamoDB with both id and datetime
        const updatedLog = await DynamoDBService.updateFeedbackLogReview(
          logId,
          log.datetime,
          reviewData.rev_comment,
          reviewData.rev_feedback
        );

        // Update the log in the local state
        setLogs((prevLogs) =>
          prevLogs.map((l) =>
            l.id === logId
              ? {
                  ...l,
                  rev_comment: updatedLog.rev_comment,
                  rev_feedback: updatedLog.rev_feedback,
                }
              : l
          )
        );
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update review';
        const updateError = new Error(errorMessage);
        setError(updateError);
        throw updateError;
      }
    },
    [logs]
  );

  /**
   * Refetch current data
   */
  const refetch = useCallback(async () => {
    await fetchLogs(currentFilters, currentSortDirection);
  }, [fetchLogs, currentFilters, currentSortDirection]);

  return {
    logs,
    loading,
    error,
    totalCount,
    nextToken,
    fetchLogs,
    fetchNextPage,
    updateReview,
    refetch,
  };
}
