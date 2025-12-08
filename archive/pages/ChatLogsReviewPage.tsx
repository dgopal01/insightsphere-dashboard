/**
 * Chat Logs Review Page
 * Container component for reviewing Unity AI Assistant chat logs
 * Requirements: 2.1, 2.2, 2.3, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import { ChatLogsDataTable } from '../components/ChatLogsDataTable';
import { ChatLogsFilters } from '../components/ChatLogsFilters';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { useChatLogs, type SortDirection } from '../hooks/useChatLogs';
import { classifyError } from '../utils';
import type { ChatLogEntry, ChatLogFilters } from '../types';

/**
 * ChatLogsReviewPage Component
 * Main container for the Chat Logs Review interface
 */
const ChatLogsReviewPage: React.FC = () => {
  // State for filters and sorting
  const [filters, setFilters] = useState<ChatLogFilters>({
    reviewStatus: 'all',
  });
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedLog, setSelectedLog] = useState<ChatLogEntry | null>(null);

  // Use the custom hook for data fetching
  const {
    logs,
    loading,
    error,
    totalCount,
    nextToken,
    fetchLogs,
    fetchNextPage,
    updateReview,
    refetch,
  } = useChatLogs();

  // Fetch logs on mount and when filters/sort change
  useEffect(() => {
    fetchLogs(filters, sortDirection);
  }, [filters, sortDirection, fetchLogs]);

  /**
   * Handle filter changes
   */
  const handleFilterChange = useCallback((newFilters: ChatLogFilters) => {
    setFilters(newFilters);
  }, []);

  /**
   * Handle sort direction change
   */
  const handleSortChange = useCallback((direction: SortDirection) => {
    setSortDirection(direction);
  }, []);

  /**
   * Handle row click to view details
   */
  const handleRowClick = useCallback((log: ChatLogEntry) => {
    setSelectedLog(log);
  }, []);

  /**
   * Handle load more (pagination)
   */
  const handleLoadMore = useCallback(() => {
    if (nextToken && !loading) {
      fetchNextPage();
    }
  }, [nextToken, loading, fetchNextPage]);

  /**
   * Handle review submission
   */
  const handleReviewSubmit = useCallback(
    async (logId: string, reviewData: { rev_comment: string; rev_feedback: string; issue_tags?: string[] }) => {
      try {
        await updateReview(logId, reviewData);
        setSelectedLog(null);
      } catch (err) {
        // Error is already set in the hook
        console.error('Failed to submit review:', err);
      }
    },
    [updateReview]
  );

  /**
   * Handle clear filters
   */
  const handleClearFilters = useCallback(() => {
    setFilters({ reviewStatus: 'all' });
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Chat Logs Review
      </Typography>

      <Typography variant="body2" color="text.secondary" paragraph>
        Review and add comments to Unity AI Assistant chat logs
      </Typography>

      {/* Error Display */}
      {error && (
        <ErrorDisplay
          error={error}
          type={classifyError(error)}
          onRetry={refetch}
          showDetails={process.env.NODE_ENV === 'development'}
        />
      )}

      {/* Filters */}
      <ChatLogsFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      {/* Data Table */}
      <ChatLogsDataTable
        logs={logs}
        loading={loading}
        totalCount={totalCount}
        hasMore={!!nextToken}
        sortDirection={sortDirection}
        onRowClick={handleRowClick}
        onSortChange={handleSortChange}
        onLoadMore={handleLoadMore}
        selectedLog={selectedLog}
        onCloseDetail={() => setSelectedLog(null)}
        onReviewSubmit={handleReviewSubmit}
      />
    </Box>
  );
};

export default ChatLogsReviewPage;
export { ChatLogsReviewPage };
