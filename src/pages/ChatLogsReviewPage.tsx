/**
 * Chat Logs Review Page (New Design System)
 * Container component for reviewing Unity AI Assistant chat logs
 */

import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Filter, RefreshCw } from 'lucide-react';
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
import { useChatLogs, type SortDirection } from '../hooks/useChatLogs';
import { classifyError, sanitizeText } from '../utils';
import type { ChatLogEntry, ChatLogFilters } from '../types';

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
function getReviewStatus(log: ChatLogEntry): 'reviewed' | 'pending' {
  return log.rev_comment || log.rev_feedback ? 'reviewed' : 'pending';
}

/**
 * ChatLogsReviewPage Component
 */
const ChatLogsReviewPage: React.FC = () => {
  const [filters, setFilters] = useState<ChatLogFilters>({
    reviewStatus: 'all',
  });
  const [sortDirection] = useState<SortDirection>('desc');
  const [selectedLog, setSelectedLog] = useState<ChatLogEntry | null>(null);

  const {
    logs,
    loading,
    error,
    totalCount,
    nextToken,
    fetchLogs,
    fetchNextPage,
    refetch,
  } = useChatLogs();

  useEffect(() => {
    fetchLogs(filters, sortDirection);
  }, [filters, sortDirection, fetchLogs]);

  const handleLoadMore = useCallback(() => {
    if (nextToken && !loading) {
      fetchNextPage();
    }
  }, [nextToken, loading, fetchNextPage]);

  const handleRowClick = useCallback((log: ChatLogEntry) => {
    setSelectedLog(log);
  }, []);

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <MessageSquare className="size-10 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Chat Logs Review</h1>
            <p className="text-muted-foreground">Review Unity AI Assistant chat logs</p>
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
          <MessageSquare className="size-10 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Chat Logs Review</h1>
            <p className="text-muted-foreground">
              Review and add comments to Unity AI Assistant chat logs
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
              <CardDescription>Filter chat logs by review status</CardDescription>
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
          <CardTitle>Chat Logs ({logs.length})</CardTitle>
          <CardDescription>
            Click on a row to view details and add review comments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Loading chat logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="size-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No chat logs found</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Timestamp</TableHead>
                      <TableHead className="w-[120px]">Carrier</TableHead>
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
                          key={log.log_id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleRowClick(log)}
                        >
                          <TableCell className="font-mono text-xs">
                            {new Date(log.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell>{log.carrier_name || 'N/A'}</TableCell>
                          <TableCell className="max-w-[300px]">
                            <div className="flex items-start gap-2">
                              <MessageSquare className="size-4 mt-0.5 text-primary shrink-0" />
                              <span className="text-sm line-clamp-2">
                                {sanitizeText(truncateText(log.question || ''))}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[300px]">
                            <div className="flex items-start gap-2">
                              <span className="text-sm line-clamp-2">
                                {sanitizeText(truncateText(log.response || ''))}
                              </span>
                            </div>
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

      {/* TODO: Add detail modal for selectedLog */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto bg-card">
            <CardHeader>
              <CardTitle>Chat Log Details</CardTitle>
              <CardDescription>Log ID: {selectedLog.log_id}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Question:</h3>
                <p className="text-sm">{sanitizeText(selectedLog.question || '')}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Response:</h3>
                <p className="text-sm">{sanitizeText(selectedLog.response || '')}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Carrier:</h3>
                <p className="text-sm">{selectedLog.carrier_name || 'N/A'}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Timestamp:</h3>
                <p className="text-sm">{new Date(selectedLog.timestamp).toLocaleString()}</p>
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

export default ChatLogsReviewPage;
