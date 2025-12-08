/**
 * useChatLogs Hook
 * Manages Unity AI Assistant chat logs data fetching for the Chat Logs Review System
 * Supports pagination, filtering, sorting, and review submission
 */

import { useState, useCallback } from 'react';
import * as DynamoDBService from '../services/DynamoDBService';
import type { ChatLogFilters, ReviewData } from '../types/graphql';

/**
 * Sort direction for timestamp
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Return type for useChatLogs hook
 */
export interface UseChatLogsReturn {
  logs: DynamoDBService.ChatLogEntry[];
  loading: boolean;
  error: Error | null;
  totalCount: number;
  nextToken: string | null;
  fetchLogs: (filters?: ChatLogFilters, sortDirection?: SortDirection) => Promise<void>;
  fetchNextPage: () => Promise<void>;
  updateReview: (logId: string, reviewData: ReviewData) => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Apply client-side filters to chat logs
 */
function applyFilters(logs: DynamoDBService.ChatLogEntry[], filters?: ChatLogFilters): DynamoDBService.ChatLogEntry[] {
  if (!filters) return logs;

  return logs.filter((log) => {
    // Carrier name filter
    if (filters.carrier_name && log.carrier_name !== filters.carrier_name) {
      return false;
    }

    // Date range filter
    if (filters.startDate && log.timestamp < filters.startDate) {
      return false;
    }
    if (filters.endDate && log.timestamp > filters.endDate) {
      return false;
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
 * Sort logs by timestamp
 */
function sortLogs(logs: DynamoDBService.ChatLogEntry[], direction: SortDirection): DynamoDBService.ChatLogEntry[] {
  return [...logs].sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return direction === 'asc' ? timeA - timeB : timeB - timeA;
  });
}

/**
 * Custom hook for fetching and managing Unity AI Assistant chat logs
 */
export function useChatLogs(): UseChatLogsReturn {
  const [logs, setLogs] = useState<DynamoDBService.ChatLogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<ChatLogFilters | undefined>(undefined);
  const [currentSortDirection, setCurrentSortDirection] = useState<SortDirection>('desc');
  const [totalCount, setTotalCount] = useState<number>(0);

  /**
   * Fetch chat logs with filters and sorting
   */
  const fetchLogs = useCallback(
    async (filters?: ChatLogFilters, sortDirection: SortDirection = 'desc') => {
      setLoading(true);
      setError(null);
      setCurrentFilters(filters);
      setCurrentSortDirection(sortDirection);

      try {
        // Fetch from DynamoDB
        const result = await DynamoDBService.listChatLogs(1000);
        
        // Apply client-side filters
        const filteredLogs = applyFilters(result.items, filters);
        
        // Sort logs
        const sortedLogs = sortLogs(filteredLogs, sortDirection);

        setLogs(sortedLogs);
        setNextToken(null); // Pagination handled client-side for now
        setTotalCount(sortedLogs.length);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch chat logs';
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
   * Update review fields for a chat log entry
   */
  const updateReview = useCallback(
    async (logId: string, reviewData: ReviewData) => {
      setError(null);

      try {
        // Find the log to get its timestamp (composite key)
        const log = logs.find((l) => l.log_id === logId);
        if (!log) {
          throw new Error(`Chat log not found: ${logId}`);
        }

        // Update in DynamoDB with both log_id and timestamp
        const updatedLog = await DynamoDBService.updateChatLogReview(
          logId,
          log.timestamp,
          reviewData.rev_comment,
          reviewData.rev_feedback,
          reviewData.issue_tags
        );

        // Update the log in the local state
        setLogs((prevLogs) =>
          prevLogs.map((l) =>
            l.log_id === logId
              ? {
                  ...l,
                  rev_comment: updatedLog.rev_comment,
                  rev_feedback: updatedLog.rev_feedback,
                  issue_tags: updatedLog.issue_tags,
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
