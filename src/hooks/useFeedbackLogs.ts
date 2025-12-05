/**
 * useFeedbackLogs Hook
 * Manages User Feedback logs data fetching for the Chat Logs Review System
 * Supports pagination, filtering, sorting, and review submission
 */

import { useState, useCallback } from 'react';
import { apiService } from '../services';
import { listFeedback } from '../graphql/queries';
import { updateUserFeedback } from '../graphql/mutations';
import type {
  FeedbackLogEntry,
  FeedbackLogFilters,
  ReviewData,
  ListUserFeedbacksResponse,
  ModelUserFeedbackFilterInput,
  UpdateUserFeedbackInput,
} from '../types/graphql';

/**
 * Sort direction for datetime
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Return type for useFeedbackLogs hook
 */
export interface UseFeedbackLogsReturn {
  logs: FeedbackLogEntry[];
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
 * Build GraphQL filter from FeedbackLogFilters
 */
function buildGraphQLFilter(filters?: FeedbackLogFilters): ModelUserFeedbackFilterInput | undefined {
  if (!filters) return undefined;

  const filter: ModelUserFeedbackFilterInput = {};
  const andConditions: ModelUserFeedbackFilterInput[] = [];

  // Carrier filter
  if (filters.carrier) {
    andConditions.push({
      carrier: { eq: filters.carrier },
    });
  }

  // Date range filter on datetime
  if (filters.startDate && filters.endDate) {
    andConditions.push({
      datetime: { ge: filters.startDate },
    });
    andConditions.push({
      datetime: { le: filters.endDate },
    });
  } else if (filters.startDate) {
    andConditions.push({
      datetime: { ge: filters.startDate },
    });
  } else if (filters.endDate) {
    andConditions.push({
      datetime: { le: filters.endDate },
    });
  }

  // Review status filter
  if (filters.reviewStatus === 'reviewed') {
    // Reviewed: has rev_comment OR rev_feedback
    filter.or = [
      { rev_comment: { ne: '' } },
      { rev_feedback: { ne: '' } },
    ];
  } else if (filters.reviewStatus === 'pending') {
    // Pending: both rev_comment AND rev_feedback are empty or null
    andConditions.push({
      or: [
        { rev_comment: { eq: '' } },
        { rev_comment: { eq: null as any } },
      ],
    });
    andConditions.push({
      or: [
        { rev_feedback: { eq: '' } },
        { rev_feedback: { eq: null as any } },
      ],
    });
  }

  // Combine all AND conditions
  if (andConditions.length > 0) {
    filter.and = andConditions;
  }

  return Object.keys(filter).length > 0 ? filter : undefined;
}

/**
 * Sort logs by datetime
 */
function sortLogs(logs: FeedbackLogEntry[], direction: SortDirection): FeedbackLogEntry[] {
  return [...logs].sort((a, b) => {
    const timeA = new Date(a.datetime).getTime();
    const timeB = new Date(b.datetime).getTime();
    return direction === 'asc' ? timeA - timeB : timeB - timeA;
  });
}

/**
 * Custom hook for fetching and managing User Feedback logs
 */
export function useFeedbackLogs(): UseFeedbackLogsReturn {
  const [logs, setLogs] = useState<FeedbackLogEntry[]>([]);
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
        const graphQLFilter = buildGraphQLFilter(filters);
        const variables = {
          filter: graphQLFilter,
          limit: 50,
        };

        const result = await apiService.query<{ listFeedback: ListUserFeedbacksResponse }>(
          listFeedback,
          variables
        );

        const response = result.listFeedback;
        const sortedLogs = sortLogs(response.items, sortDirection);

        setLogs(sortedLogs);
        setNextToken(response.nextToken || null);
        setTotalCount(response.items.length);
      } catch (err) {
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
   */
  const fetchNextPage = useCallback(async () => {
    if (!nextToken || loading) return;

    setLoading(true);
    setError(null);

    try {
      const graphQLFilter = buildGraphQLFilter(currentFilters);
      const variables = {
        filter: graphQLFilter,
        limit: 50,
        nextToken,
      };

      const result = await apiService.query<{ listFeedback: ListUserFeedbacksResponse }>(
        listFeedback,
        variables
      );

      const response = result.listFeedback;
      const sortedNewLogs = sortLogs(response.items, currentSortDirection);

      setLogs((prevLogs) => [...prevLogs, ...sortedNewLogs]);
      setNextToken(response.nextToken || null);
      setTotalCount((prevCount) => prevCount + response.items.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch next page';
      setError(new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  }, [nextToken, loading, currentFilters, currentSortDirection]);

  /**
   * Update review fields for a feedback log entry
   */
  const updateReview = useCallback(
    async (logId: string, reviewData: ReviewData) => {
      setError(null);

      try {
        const input: UpdateUserFeedbackInput = {
          id: logId,
          rev_comment: reviewData.rev_comment,
          rev_feedback: reviewData.rev_feedback,
        };

        const result = await apiService.mutate<{ updateUserFeedback: FeedbackLogEntry }>(
          updateUserFeedback,
          { input }
        );

        const updatedLog = result.updateUserFeedback;

        // Update the log in the local state
        setLogs((prevLogs) =>
          prevLogs.map((log) =>
            log.id === logId
              ? {
                  ...log,
                  rev_comment: updatedLog.rev_comment,
                  rev_feedback: updatedLog.rev_feedback,
                }
              : log
          )
        );
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update review';
        const updateError = new Error(errorMessage);
        setError(updateError);
        throw updateError;
      }
    },
    []
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
