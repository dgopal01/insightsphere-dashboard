import React from 'react';
import { BarChart3, MessageSquare, ThumbsUp, RefreshCw } from 'lucide-react';
import { useReviewMetrics } from '../hooks/useReviewMetrics';
import { ReviewMetricsCardNew } from '../components/ReviewMetricsCardNew';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { classifyError } from '../utils/errorHandling';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

function formatLastUpdated(date: Date | null): string {
  if (!date) return 'Never';

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

const ReviewDashboardPage: React.FC = () => {
  const { metrics, loading, error, refetch, lastUpdated } = useReviewMetrics({
    autoRefreshInterval: 30000,
    enabled: true,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="size-10 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Review Dashboard</h1>
            <p className="text-muted-foreground">Monitor review progress and metrics</p>
          </div>
        </div>

        {/* Last Updated */}
        <div className="flex items-center gap-2">
          {loading && (
            <RefreshCw className="size-4 animate-spin text-muted-foreground" />
          )}
          <Badge variant="outline" className="gap-2">
            <RefreshCw className="size-3" />
            Last updated: {formatLastUpdated(lastUpdated)}
          </Badge>
        </div>
      </div>

      <Separator />

      {/* Info Alert */}
      <Alert variant="info">
        <AlertDescription>
          Monitor review progress for chat logs and feedback logs. Metrics automatically refresh
          every 30 seconds. Color indicators: <strong>Green</strong> (&gt;80% reviewed),{' '}
          <strong>Yellow</strong> (40-80% reviewed), <strong>Red</strong> (&lt;40% reviewed).
        </AlertDescription>
      </Alert>

      {/* Error Display */}
      {error && (
        <ErrorDisplay
          error={error}
          type={classifyError(error)}
          onRetry={refetch}
          showDetails={process.env.NODE_ENV === 'development'}
        />
      )}

      {/* Loading State */}
      {loading && !metrics && (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading review metrics...</p>
        </div>
      )}

      {/* Metrics Display */}
      {metrics && (
        <div className="space-y-8">
          {/* Chat Logs Metrics */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="size-6 text-primary" />
              <h2 className="text-2xl font-semibold">Chat Logs Review Progress</h2>
            </div>
            <ReviewMetricsCardNew
              title="Chat Logs"
              total={metrics.totalChatLogs}
              reviewed={metrics.reviewedChatLogs}
              pending={metrics.pendingChatLogs}
              percentage={metrics.chatLogsReviewedPercentage}
              loading={loading}
            />
          </div>

          {/* Feedback Logs Metrics */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ThumbsUp className="size-6 text-primary" />
              <h2 className="text-2xl font-semibold">Feedback Logs Review Progress</h2>
            </div>
            <ReviewMetricsCardNew
              title="Feedback Logs"
              total={metrics.totalFeedbackLogs}
              reviewed={metrics.reviewedFeedbackLogs}
              pending={metrics.pendingFeedbackLogs}
              percentage={metrics.feedbackLogsReviewedPercentage}
              loading={loading}
            />
          </div>

          {/* No Data Alert */}
          {metrics.totalChatLogs + metrics.totalFeedbackLogs === 0 && (
            <Alert variant="info">
              <AlertDescription>
                No logs available for review. Data will appear here once logs are added to the system.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewDashboardPage;
