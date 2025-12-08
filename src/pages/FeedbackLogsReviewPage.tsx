/**
 * Feedback Logs Review Page (New Design System)
 * Container component for reviewing User Feedback logs
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ThumbsUp, Filter, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { useFeedbackLogs, type SortDirection } from '../hooks/useFeedbackLogs';
import { classifyError, sanitizeText } from '../utils';
import type { FeedbackLogEntry, FeedbackLogFilters } from '../types';

/**
 * Truncate long text for display
 */
function truncateText(text: string, maxLength: number = 100): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Get review status for a log entry
 */
function getReviewStatus(log: FeedbackLogEntry): 'reviewed' | 'pending' {
  return log.rev_comment || log.rev_feedback ? 'reviewed' : 'pending';
}

/**
 * Get feedback type badge variant
 */
function getFeedbackVariant(feedback: string): 'default' | 'secondary' | 'outline' {
  if (feedback === 'thumbs_up') return 'default';
  if (feedback === 'thumbs_down') return 'destructive' as any;
  return 'outline';
}

/**
 * FeedbackLogsReviewPage Component
 */
const FeedbackLogsReviewPage: React.FC = () => {
  const [filters, setFilters] = useState<FeedbackLogFilters>({
    reviewStatus: 'all',
  });
  const [sortDirection] = useState<SortDirection>('desc');
  const [selectedLog, setSelectedLog] = useState<FeedbackLogEntry | null>(null);

  const {
    logs,
    loading,
    error,
    totalCount,
    nextToken,
    fetchLogs,
    fetchNextPage,
    refetch,
  } = useFeedbackLogs();

  useEffect(() => {
    fetchLogs(filters, sortDirection);
  }, [filters, sortDirection, fetchLogs]);

  const handleLoadMore = useCallback(() => {
    if (nextToken && !loading) {
      fetchNextPage();
    }
  }, [nextToken, loading, fetchNextPage]);

  const handleRowClick = useCallback((log: FeedbackLogEntry) => {
    setSelectedLog(log);
  }, []);

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <ThumbsUp className="size-10 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Feedback Logs Review</h1>
            <p className="text-muted-foreground">Review user feedback logs</p>
          </div>
        </div>
        <Separator />
        <ErrorDisplay
          error={error}
          type={classifyError(error)}
          onRetry={refetch}
          showDetails={process.env.NODE_ENV === 'development'}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ThumbsUp className="size-10 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Feedback Logs Review</h1>
            <p className="text-muted-foreground">
              Review and add comments to user feedback logs
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{totalCount} Total Logs</Badge>
          <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
            <RefreshCw className={`size-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Separator />

      {/* Filters Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="size-5" />
                Filters
              </CardTitle>
              <CardDescription>Filter feedback logs by review status</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filters.reviewStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilters({ reviewStatus: 'all' })}
              >
                All
              </Button>
              <Button
                variant={filters.reviewStatus === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilters({ reviewStatus: 'pending' })}
              >
                Pending
              </Button>
              <Button
                variant={filters.reviewStatus === 'reviewed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilters({ reviewStatus: 'reviewed' })}
              >
                Reviewed
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Data Table Card */}
      <Card>
        <CardHeader>
          <CardTitle>Feedback Logs ({logs.length})</CardTitle>
          <CardDescription>
            Click on a row to view details and add review comments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Loading feedback logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <ThumbsUp className="size-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No feedback logs found</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Timestamp</TableHead>
                      <TableHead className="w-[120px]">Feedback Type</TableHead>
                      <TableHead>Question</TableHead>
                      <TableHead>Response</TableHead>
                      <TableHead className="w-[130px] text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => {
                      const status = getReviewStatus(log);
                      return (
                        <TableRow
                          key={log.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleRowClick(log)}
                        >
                          <TableCell className="font-mono text-xs">
                            {new Date(log.datetime).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getFeedbackVariant(log.info?.feedback || '')}>
                              {log.info?.feedback === 'thumbs_up' ? '👍 Positive' : '👎 Negative'}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[300px]">
                            <span className="text-sm line-clamp-2">
                              {sanitizeText(truncateText(log.info?.question || ''))}
                            </span>
                          </TableCell>
                          <TableCell className="max-w-[300px]">
                            <span className="text-sm line-clamp-2">
                              {sanitizeText(truncateText(log.info?.response || ''))}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={status === 'reviewed' ? 'default' : 'outline'}
                              className={
                                status === 'reviewed'
                                  ? 'bg-green-100 text-green-800 border-green-200'
                                  : ''
                              }
                            >
                              {status === 'reviewed' ? 'Reviewed' : 'Pending'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Load More Button */}
              {nextToken && (
                <div className="flex justify-center mt-6">
                  <Button
                    variant="outline"
                    onClick={handleLoadMore}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="size-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load More'
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto bg-white shadow-2xl" style={{ backgroundColor: '#ffffff' }}>
            <CardHeader>
              <CardTitle>Feedback Log Details</CardTitle>
              <CardDescription>Log ID: {selectedLog.id}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Feedback Type:</h3>
                <Badge variant={getFeedbackVariant(selectedLog.info?.feedback || '')}>
                  {selectedLog.info?.feedback === 'thumbs_up' ? '👍 Positive' : '👎 Negative'}
                </Badge>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Question:</h3>
                <p className="text-sm">{sanitizeText(selectedLog.info?.question || '')}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Response:</h3>
                <p className="text-sm">{sanitizeText(selectedLog.info?.response || '')}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Timestamp:</h3>
                <p className="text-sm">{new Date(selectedLog.datetime).toLocaleString()}</p>
              </div>
              {selectedLog.rev_comment && (
                <div>
                  <h3 className="font-semibold mb-2">Review Comment:</h3>
                  <p className="text-sm">{selectedLog.rev_comment}</p>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setSelectedLog(null)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FeedbackLogsReviewPage;
