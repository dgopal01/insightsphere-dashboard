/**
 * useChatLogs Hook
 * Manages chat logs data fetching with React Query
 * Supports pagination, filtering, and real-time subscriptions
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, useCallback } from 'react';
import { apiService } from '../services';
import { listChatLogs, chatLogsByConversation, chatLogsByUser } from '../graphql/queries';
import { onCreateChatLog } from '../graphql/subscriptions';
import type {
  ChatLog,
  LogFilters,
  ListChatLogsResponse,
  OnCreateChatLogSubscription,
} from '../types/graphql';

/**
 * Options for useChatLogs hook
 */
export interface UseChatLogsOptions {
  filters?: LogFilters;
  limit?: number;
  enabled?: boolean;
}

/**
 * Return type for useChatLogs hook
 */
export interface UseChatLogsReturn {
  logs: ChatLog[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
}

/**
 * Build GraphQL filter from LogFilters
 */
function buildGraphQLFilter(filters?: LogFilters) {
  if (!filters) return undefined;

  const filter: any = {};

  if (filters.userId) {
    filter.userId = { eq: filters.userId };
  }

  if (filters.conversationId) {
    filter.conversationId = { eq: filters.conversationId };
  }

  if (filters.sentiment) {
    filter.sentiment = { eq: filters.sentiment };
  }

  if (filters.startDate && filters.endDate) {
    filter.timestamp = { between: [filters.startDate, filters.endDate] };
  } else if (filters.startDate) {
    filter.timestamp = { ge: filters.startDate };
  } else if (filters.endDate) {
    filter.timestamp = { le: filters.endDate };
  }

  // Note: searchText filtering will be done client-side
  // as DynamoDB doesn't support full-text search natively

  return Object.keys(filter).length > 0 ? filter : undefined;
}

/**
 * Filter logs by search text (client-side)
 */
function filterBySearchText(logs: ChatLog[], searchText?: string): ChatLog[] {
  if (!searchText || searchText.trim() === '') {
    return logs;
  }

  const lowerSearchText = searchText.toLowerCase();
  return logs.filter(
    (log) =>
      log.userMessage.toLowerCase().includes(lowerSearchText) ||
      log.aiResponse.toLowerCase().includes(lowerSearchText) ||
      log.conversationId.toLowerCase().includes(lowerSearchText) ||
      log.userId.toLowerCase().includes(lowerSearchText)
  );
}

/**
 * Custom hook for fetching and managing chat logs
 */
export function useChatLogs(options: UseChatLogsOptions = {}): UseChatLogsReturn {
  const { filters, limit = 50, enabled = true } = options;
  const queryClient = useQueryClient();
  const [nextToken, setNextToken] = useState<string | undefined>(undefined);
  const [allLogs, setAllLogs] = useState<ChatLog[]>([]);

  // Determine which query to use based on filters
  const getQueryConfig = useCallback(() => {
    const graphQLFilter = buildGraphQLFilter(filters);

    // Use GSI for conversationId if provided
    if (filters?.conversationId) {
      return {
        query: chatLogsByConversation,
        variables: {
          conversationId: filters.conversationId,
          filter: graphQLFilter,
          limit,
          nextToken,
        },
        queryKey: 'chatLogsByConversation',
      };
    }

    // Use GSI for userId if provided
    if (filters?.userId) {
      return {
        query: chatLogsByUser,
        variables: {
          userId: filters.userId,
          filter: graphQLFilter,
          limit,
          nextToken,
        },
        queryKey: 'chatLogsByUser',
      };
    }

    // Default to listChatLogs
    return {
      query: listChatLogs,
      variables: {
        filter: graphQLFilter,
        limit,
        nextToken,
      },
      queryKey: 'listChatLogs',
    };
  }, [filters, limit, nextToken]);

  const queryConfig = getQueryConfig();

  // Fetch chat logs using React Query
  const {
    data,
    isLoading,
    error,
    refetch: refetchQuery,
  } = useQuery<ListChatLogsResponse>({
    queryKey: ['chatLogs', queryConfig.queryKey, filters, limit, nextToken],
    queryFn: async () => {
      const result = await apiService.query<any>(queryConfig.query, queryConfig.variables);

      // Extract the response based on query type
      if (filters?.conversationId) {
        return result.chatLogsByConversation;
      } else if (filters?.userId) {
        return result.chatLogsByUser;
      } else {
        return result.listChatLogs;
      }
    },
    enabled,
  });

  // Update accumulated logs when data changes
  useEffect(() => {
    if (data?.items) {
      if (nextToken) {
        // Append to existing logs for pagination
        setAllLogs((prev) => [...prev, ...data.items]);
      } else {
        // Replace logs for new query
        setAllLogs(data.items);
      }
    }
  }, [data, nextToken]);

  // Reset accumulated logs when filters change
  useEffect(() => {
    setAllLogs([]);
    setNextToken(undefined);
  }, [filters]);

  // Apply client-side search text filtering
  const filteredLogs = filterBySearchText(allLogs, filters?.searchText);

  // Fetch next page
  const fetchNextPage = useCallback(() => {
    if (data?.nextToken) {
      setNextToken(data.nextToken);
    }
  }, [data?.nextToken]);

  // Refetch from beginning
  const refetch = useCallback(() => {
    setNextToken(undefined);
    setAllLogs([]);
    refetchQuery();
  }, [refetchQuery]);

  // Set up real-time subscription for new chat logs
  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = apiService.subscribe<OnCreateChatLogSubscription>(
      onCreateChatLog,
      (subscriptionData) => {
        const newLog = subscriptionData.onCreateChatLog;

        // Check if the new log matches current filters
        const matchesFilters =
          (!filters?.userId || newLog.userId === filters.userId) &&
          (!filters?.conversationId || newLog.conversationId === filters.conversationId) &&
          (!filters?.sentiment || newLog.sentiment === filters.sentiment) &&
          (!filters?.startDate || newLog.timestamp >= filters.startDate) &&
          (!filters?.endDate || newLog.timestamp <= filters.endDate);

        if (matchesFilters) {
          // Add new log to the beginning of the list
          setAllLogs((prev) => [newLog, ...prev]);

          // Invalidate query to ensure consistency
          queryClient.invalidateQueries({
            queryKey: ['chatLogs'],
          });
        }
      },
      (error) => {
        console.error('Chat logs subscription error:', error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [enabled, filters, queryClient]);

  return {
    logs: filteredLogs,
    isLoading,
    error: error as Error | null,
    refetch,
    hasNextPage: !!data?.nextToken,
    fetchNextPage,
    isFetchingNextPage: !!nextToken && isLoading,
  };
}
