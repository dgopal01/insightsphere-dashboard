/**
 * Review Dashboard Page
 * Displays aggregated metrics for chat logs and feedback logs review progress
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 9.1, 9.2, 9.3, 9.4, 9.5
 */

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ChatIcon from '@mui/icons-material/Chat';
import FeedbackIcon from '@mui/icons-material/Feedback';
import { useReviewMetrics } from '../hooks/useReviewMetrics';
import { ReviewMetricsCard } from '../components/ReviewMetricsCard';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { classifyError } from '../utils/errorHandling';

/**
 * Format timestamp for display
 */
function formatLastUpdated(date: Date | null): string {
  if (!date) {
    return 'Never';
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);

  if (diffSecs < 60) {
    return `${diffSecs} second${diffSecs !== 1 ? 's' : ''} ago`;
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleTimeString();
  }
}

/**
 * Review Dashboard Page Component
 * Displays metrics for both chat logs and feedback logs with auto-refresh
 */
const ReviewDashboardPage: React.FC = () => {
  // Fetch metrics with auto-refresh every 30 seconds
  const { metrics, loading, error, refetch, lastUpdated } = useReviewMetrics({
    autoRefreshInterval: 30000, // 30 seconds
    enabled: true,
  });

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <AssessmentIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            Review Dashboard
          </Typography>
        </Box>

        {/* Last Updated Indicator */}
        <Box display="flex" alignItems="center" gap={1}>
          {loading && (
            <CircularProgress size={20} aria-label="Loading metrics" />
          )}
          <Chip
            icon={<RefreshIcon />}
            label={`Last updated: ${formatLastUpdated(lastUpdated)}`}
            size="small"
            variant="outlined"
            color={loading ? 'default' : 'primary'}
            aria-live="polite"
            aria-atomic="true"
          />
        </Box>
      </Box>

      {/* Description */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'info.light', color: 'info.contrastText' }}>
        <Typography variant="body2">
          Monitor review progress for chat logs and feedback logs. Metrics automatically refresh
          every 30 seconds. Color indicators: <strong>Green</strong> (&gt;80% reviewed),{' '}
          <strong>Yellow</strong> (40-80% reviewed), <strong>Red</strong> (&lt;40% reviewed).
        </Typography>
      </Paper>

      {/* Error Display */}
      {error && (
        <Box mb={3}>
          <ErrorDisplay
            error={error}
            type={classifyError(error)}
            onRetry={refetch}
            showDetails={process.env.NODE_ENV === 'development'}
          />
        </Box>
      )}

      {/* Loading State */}
      {loading && !metrics && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <Box textAlign="center">
            <CircularProgress size={60} />
            <Typography variant="body1" sx={{ mt: 2 }}>
              Loading review metrics...
            </Typography>
          </Box>
        </Box>
      )}

      {/* Metrics Display */}
      {metrics && (
        <Stack spacing={3}>
          {/* Chat Logs Metrics */}
          <Box>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <ChatIcon color="primary" />
              <Typography variant="h5" component="h2">
                Chat Logs Review Progress
              </Typography>
            </Box>
            <ReviewMetricsCard
              title="Chat Logs"
              total={metrics.totalChatLogs}
              reviewed={metrics.reviewedChatLogs}
              pending={metrics.pendingChatLogs}
              percentage={metrics.chatLogsReviewedPercentage}
              loading={loading}
            />
          </Box>

          {/* Feedback Logs Metrics */}
          <Box>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <FeedbackIcon color="primary" />
              <Typography variant="h5" component="h2">
                Feedback Logs Review Progress
              </Typography>
            </Box>
            <ReviewMetricsCard
              title="Feedback Logs"
              total={metrics.totalFeedbackLogs}
              reviewed={metrics.reviewedFeedbackLogs}
              pending={metrics.pendingFeedbackLogs}
              percentage={metrics.feedbackLogsReviewedPercentage}
              loading={loading}
            />
          </Box>

          {/* Summary Alert */}
          {metrics.totalChatLogs + metrics.totalFeedbackLogs === 0 && (
            <Alert severity="info">
              No logs available for review. Data will appear here once logs are added to the system.
            </Alert>
          )}
        </Stack>
      )}
    </Box>
  );
};

export default ReviewDashboardPage;
export { ReviewDashboardPage };
