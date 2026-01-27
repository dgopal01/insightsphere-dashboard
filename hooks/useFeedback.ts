/**
 * useFeedback Hook
 * Manages feedback data fetching and submission with React Query
 * Supports pagination, filtering, real-time subscriptions, and optimistic updates
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { apiService } from '../services';
import { listFeedback, feedbackByLogId, feedbackByUser } from '../graphql/queries';
import { createFeedback } from '../graphql/mutations';
import { onCreateFeedback } from '../graphql/subscriptions';
import { useAuth } from '../contexts/AuthContext';
import type {
  Feedback,
  FeedbackInput,
  ListFeedbackResponse,
  OnCreateFeedbackSubscription,
  CreateFeedbackVariables,
} from '../types/graphql';
import type { FeedbackMetrics } from '../types';

/**
 * Options for useFeedback hook
 */
export interface UseFeedbackOptions {
  logId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  enabled?: boolean;
}

/**
 * Return type for useFeedback hook
 */
export interface UseFeedbackReturn {
  feedback: Feedback[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  submitFeedback: (input: FeedbackInput) => Promise<Feedback>;
  isSubmitting: boolean;
  metrics: FeedbackMetrics;
}

/**
 * Build GraphQL filter from options
 */
function buildGraphQLFilter(options?: UseFeedbackOptions) {
  if (!options) return undefined;

  const filter: any = {};

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
 * Calculate feedback metrics from feedback list
 */
function calculateMetrics(feedback: Feedback[]): FeedbackMetrics {
  if (feedback.length === 0) {
    return {
      positiveCount: 0,
      negativeCount: 0,
      averageRating: 0,
      totalCount: 0,
    };
  }

  const positiveCount = feedback.filter((f) => f.thumbsUp).length;
  const negativeCount = feedback.filter((f) => !f.thumbsUp).length;
  const totalRating = feedback.reduce((sum, f) => sum + f.rating, 0);
  const averageRating = totalRating / feedback.length;

  return {
    positiveCount,
    negativeCount,
    averageRating,
    totalCount: feedback.length,
  };
}

/**
 * Custom hook for fetching and managing feedback
 */
export function useFeedback(options: UseFeedbackOptions = {}): UseFeedbackReturn {
  const { logId, userId, startDate, endDate, limit = 50, enabled = true } = options;
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [nextToken, setNextToken] = useState<string | undefined>(undefined);
  const [allFeedback, setAllFeedback] = useState<Feedback[]>([]);

  // Determine which query to use based on options
  const getQueryConfig = useCallback(() => {
    const graphQLFilter = buildGraphQLFilter({ startDate, endDate });

    // Use GSI for logId if provided
    if (logId) {
      return {
        query: feedbackByLogId,
        variables: {
          logId,
          filter: graphQLFilter,
          limit,
          nextToken,
        },
        queryKey: 'feedbackByLogId',
      };
    }

    // Use GSI for userId if provided
    if (userId) {
      return {
        query: feedbackByUser,
        variables: {
          userId,
          filter: graphQLFilter,
          limit,
          nextToken,
        },
        queryKey: 'feedbackByUser',
      };
    }

    // Default to listFeedback
    return {
      query: listFeedback,
      variables: {
        filter: graphQLFilter,
        limit,
        nextToken,
      },
      queryKey: 'listFeedback',
    };
  }, [logId, userId, startDate, endDate, limit, nextToken]);

  const queryConfig = getQueryConfig();

  // Fetch feedback using React Query
  const {
    data,
    isLoading,
    error,
    refetch: refetchQuery,
  } = useQuery<ListFeedbackResponse>({
    queryKey: [
      'feedback',
      queryConfig.queryKey,
      logId,
      userId,
      startDate,
      endDate,
      limit,
      nextToken,
    ],
    queryFn: async () => {
      const result = await apiService.query<any>(queryConfig.query, queryConfig.variables);

      // Extract the response based on query type
      if (logId) {
        return result.feedbackByLogId;
      } else if (userId) {
        return result.feedbackByUser;
      } else {
        return result.listFeedback;
      }
    },
    enabled,
  });

  // Update accumulated feedback when data changes
  useEffect(() => {
    if (data?.items) {
      if (nextToken) {
        // Append to existing feedback for pagination
        setAllFeedback((prev) => [...prev, ...data.items]);
      } else {
        // Replace feedback for new query
        setAllFeedback(data.items);
      }
    }
  }, [data, nextToken]);

  // Reset accumulated feedback when filters change
  useEffect(() => {
    setAllFeedback([]);
    setNextToken(undefined);
  }, [logId, userId, startDate, endDate]);

  // Fetch next page
  const fetchNextPage = useCallback(() => {
    if (data?.nextToken) {
      setNextToken(data.nextToken);
    }
  }, [data?.nextToken]);

  // Refetch from beginning
  const refetch = useCallback(() => {
    setNextToken(undefined);
    setAllFeedback([]);
    refetchQuery();
  }, [refetchQuery]);

  // Mutation for creating feedback with optimistic updates
  const mutation = useMutation({
    mutationFn: async (input: FeedbackInput): Promise<Feedback> => {
      if (!user) {
        throw new Error('User must be authenticated to submit feedback');
      }

      const variables: CreateFeedbackVariables = {
        input: {
          logId: input.logId,
          userId: user.username,
          rating: input.rating,
          thumbsUp: input.thumbsUp,
          comment: input.comment,
          timestamp: new Date().toISOString(),
          category: input.category,
        },
      };

      const result = await apiService.mutate<any>(createFeedback, variables);
      return result.createFeedback;
    },
    onMutate: async (input: FeedbackInput) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['feedback'] });

      // Snapshot the previous value
      const previousFeedback = queryClient.getQueryData(['feedback']);

      // Optimistically update to the new value
      const optimisticFeedback: Feedback = {
        id: `temp-${Date.now()}`,
        logId: input.logId,
        userId: user?.username || '',
        rating: input.rating,
        thumbsUp: input.thumbsUp,
        comment: input.comment,
        timestamp: new Date().toISOString(),
        category: input.category,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add optimistic feedback to the list
      setAllFeedback((prev) => [optimisticFeedback, ...prev]);

      // Return context with previous value for rollback
      return { previousFeedback };
    },
    onError: (err, _input, context) => {
      // Rollback to previous value on error
      if (context?.previousFeedback) {
        queryClient.setQueryData(['feedback'], context.previousFeedback);
      }

      // Remove optimistic feedback
      setAllFeedback((prev) => prev.filter((f) => !f.id.startsWith('temp-')));

      console.error('Failed to submit feedback:', err);
    },
    onSuccess: (newFeedback) => {
      // Remove optimistic feedback and add real feedback
      setAllFeedback((prev) => {
        const withoutOptimistic = prev.filter((f) => !f.id.startsWith('temp-'));
        return [newFeedback, ...withoutOptimistic];
      });

      // Invalidate and refetch feedback queries
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
    },
  });

  // Set up real-time subscription for new feedback
  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = apiService.subscribe<OnCreateFeedbackSubscription>(
      onCreateFeedback,
      (subscriptionData) => {
        const newFeedback = subscriptionData.onCreateFeedback;

        // Check if the new feedback matches current filters
        const matchesFilters =
          (!logId || newFeedback.logId === logId) &&
          (!userId || newFeedback.userId === userId) &&
          (!startDate || newFeedback.timestamp >= startDate) &&
          (!endDate || newFeedback.timestamp <= endDate);

        if (matchesFilters) {
          // Check if feedback already exists (avoid duplicates from optimistic updates)
          setAllFeedback((prev) => {
            const exists = prev.some((f) => f.id === newFeedback.id);
            if (exists) {
              return prev;
            }
            return [newFeedback, ...prev];
          });

          // Invalidate query to ensure consistency
          queryClient.invalidateQueries({
            queryKey: ['feedback'],
          });
        }
      },
      (error) => {
        console.error('Feedback subscription error:', error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [enabled, logId, userId, startDate, endDate, queryClient]);

  // Calculate metrics from current feedback
  const metrics = useMemo(() => calculateMetrics(allFeedback), [allFeedback]);

  return {
    feedback: allFeedback,
    isLoading,
    error: error as Error | null,
    refetch,
    hasNextPage: !!data?.nextToken,
    fetchNextPage,
    isFetchingNextPage: !!nextToken && isLoading,
    submitFeedback: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    metrics,
  };
}
