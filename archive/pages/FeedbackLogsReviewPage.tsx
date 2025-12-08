/**
 * Feedback Logs Review Page
 * Container component for reviewing User Feedback logs
 * Requirements: 5.1, 5.2, 5.3, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import { FeedbackLogsDataTable } from '../components/FeedbackLogsDataTable';
import { FeedbackLogsFilters } from '../components/FeedbackLogsFilters';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { useFeedbackLogs, type SortDirection } from '../hooks/useFeedbackLogs';
import { classifyError } from '../utils';
import type { FeedbackLogEntry, FeedbackLogFilters } from '../types';

/**
 * FeedbackLogsReviewPage Component
 * Main container for the Feedback Logs Review interface
 */
const FeedbackLogsReviewPage: React.FC = () => {
  // State for filters and sorting
  const [filters, setFilters] = useState<FeedbackLogFilters>({
    reviewStatus: 'all',
  });
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedLog, setSelectedLog] = useState<FeedbackLogEntry | null>(null);

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
  } = useFeedbackLogs();

  // Fetch logs on mount and when filters/sort change
  useEffect(() => {
    fetchLogs(filters, sortDirection);
  }, [filters, sortDirection, fetchLogs]);

  /**
   * Handle filter changes
   */
  const handleFilterChange = useCallback((newFilters: FeedbackLogFilters) => {
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
  const handleRowClick = useCallback((log: FeedbackLogEntry) => {
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
    async (logId: string, reviewData: { rev_comment: string; rev_feedback: string }) => {
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
        Feedback Logs Review
      </Typography>

      <Typography variant="body2" color="text.secondary" paragraph>
        Review and add comments to user-submitted feedback
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
      <FeedbackLogsFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      {/* Data Table */}
      <FeedbackLogsDataTable
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

export default FeedbackLogsReviewPage;
export { FeedbackLogsReviewPage };
