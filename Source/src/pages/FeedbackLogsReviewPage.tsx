/**
 * Feedback Logs Review Page (New Design System)
 * Container component for reviewing User Feedback logs
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ThumbsUp, ThumbsDown, Filter, RefreshCw, X, Save, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
    feedbackType: 'all',
  });
  const [sortDirection] = useState<SortDirection>('desc');
  const [selectedLog, setSelectedLog] = useState<FeedbackLogEntry | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { logs, loading, error, totalCount, nextToken, fetchLogs, fetchNextPage, refetch } =
    useFeedbackLogs();

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
    setReviewComment(log.rev_comment || '');
    setReviewFeedback(log.rev_feedback || '');
  }, []);

  const handleSubmitFeedback = async () => {
    if (!selectedLog) return;

    setIsSubmitting(true);
    try {
      // Import DynamoDB service
      const { updateFeedbackLogReview } = await import('../services/DynamoDBService');

      // Update in DynamoDB with composite key (id + datetime)
      await updateFeedbackLogReview(
        selectedLog.id,
        selectedLog.datetime,
        reviewComment,
        reviewFeedback
      );

      // Close modal and refresh data
      setSelectedLog(null);
      setReviewComment('');
      setReviewFeedback('');
      refetch();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert(
        `Failed to submit feedback: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <p className="text-muted-foreground">Review and add comments to user feedback logs</p>
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
          <CardTitle className="flex items-center gap-2">
            <Filter className="size-5" />
            Filters
          </CardTitle>
          <CardDescription>
            Filter feedback logs by review status, feedback type, and date range
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Review Status Filter */}
          <div className="space-y-2">
            <Label>Review Status</Label>
            <div className="flex gap-2">
              <Button
                variant={filters.reviewStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilters({ ...filters, reviewStatus: 'all' })}
              >
                All
              </Button>
              <Button
                variant={filters.reviewStatus === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilters({ ...filters, reviewStatus: 'pending' })}
              >
                Pending
              </Button>
              <Button
                variant={filters.reviewStatus === 'reviewed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilters({ ...filters, reviewStatus: 'reviewed' })}
              >
                Reviewed
              </Button>
            </div>
          </div>

          {/* Feedback Type Filter */}
          <div className="space-y-2">
            <Label htmlFor="feedbackType">Feedback Type</Label>
            <Select
              value={filters.feedbackType || 'all'}
              onValueChange={(value) => {
                console.log('Filter changed to:', value);
                setFilters({ ...filters, feedbackType: value as any });
              }}
            >
              <SelectTrigger id="feedbackType" className="w-full bg-white">
                <SelectValue placeholder="Select feedback type" />
              </SelectTrigger>
              <SelectContent className="z-[100] bg-white border shadow-lg">
                <SelectItem value="all">All Feedback</SelectItem>
                <SelectItem value="thumbs_up">👍 Positive</SelectItem>
                <SelectItem value="thumbs_down">👎 Negative</SelectItem>
                <SelectItem value="none">❓ No Feedback</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value || undefined })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value || undefined })}
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          {(filters.feedbackType !== 'all' || filters.startDate || filters.endDate) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setFilters({ reviewStatus: filters.reviewStatus, feedbackType: 'all' })
              }
              className="w-full"
            >
              <X className="size-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Data Table Card */}
      <Card>
        <CardHeader>
          <CardTitle>Feedback Logs ({logs.length})</CardTitle>
          <CardDescription>Click on a row to view details and add review comments</CardDescription>
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
                            {log.info?.feedback ? (
                              <Badge variant={getFeedbackVariant(log.info.feedback)}>
                                {log.info.feedback === 'thumbs_up' ? '👍 Positive' : '👎 Negative'}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">No feedback</span>
                            )}
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
                  <Button variant="outline" onClick={handleLoadMore} disabled={loading}>
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

      {/* Editable Review Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <Card
            className="w-full max-w-6xl my-8 bg-white shadow-2xl"
            style={{ backgroundColor: '#ffffff' }}
          >
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Review Feedback Log</CardTitle>
                  <CardDescription>Log ID: {selectedLog.id}</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedLog(null)}>
                  <X className="size-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Conversation Transcript */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Conversation Transcript</h3>

                    {/* Feedback Type Badge */}
                    {selectedLog.info?.feedback && (
                      <div className="mb-4">
                        <Badge
                          variant={getFeedbackVariant(selectedLog.info.feedback)}
                          className="text-base px-3 py-1"
                        >
                          {selectedLog.info.feedback === 'thumbs_up' ? (
                            <>
                              <ThumbsUp className="size-4 mr-1" /> Positive
                            </>
                          ) : (
                            <>
                              <ThumbsDown className="size-4 mr-1" /> Negative
                            </>
                          )}
                        </Badge>
                      </div>
                    )}

                    {/* Question */}
                    <div className="bg-muted/50 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="size-4 text-primary" />
                        <span className="text-sm font-semibold">Question</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {new Date(selectedLog.datetime).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">
                        {sanitizeText(selectedLog.info?.question || '')}
                      </p>
                    </div>

                    {/* Response */}
                    <div className="bg-secondary/10 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="size-4 text-secondary" />
                        <span className="text-sm font-semibold">Response</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {new Date(selectedLog.datetime).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">
                        {sanitizeText(selectedLog.info?.response || '')}
                      </p>
                    </div>

                    {/* Metadata */}
                    <div className="pt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Timestamp:</span>
                        <span className="font-medium">
                          {new Date(selectedLog.datetime).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Feedback ID:</span>
                        <span className="font-medium">{selectedLog.id}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Submit Feedback */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Submit Feedback</h3>

                    {/* Reviewer Comments */}
                    <div className="space-y-2 mb-6">
                      <Label htmlFor="rev_comment">Reviewer Comments</Label>
                      <textarea
                        id="rev_comment"
                        className="w-full min-h-[120px] px-3 py-2 text-sm rounded-md border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Enter your observations and feedback about this conversation..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                      />
                    </div>

                    {/* Corrected/Ground Truth Response */}
                    <div className="space-y-2 mb-6">
                      <Label htmlFor="rev_feedback">Corrected/Ground Truth Response</Label>
                      <textarea
                        id="rev_feedback"
                        className="w-full min-h-[120px] px-3 py-2 text-sm rounded-md border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Provide the ideal response or correction (optional)..."
                        value={reviewFeedback}
                        onChange={(e) => setReviewFeedback(e.target.value)}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t mt-6">
                      <Button
                        type="button"
                        className="flex-1"
                        style={{ backgroundColor: '#00818F', color: '#ffffff' }}
                        onClick={handleSubmitFeedback}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <RefreshCw className="size-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Save className="size-4 mr-2" />
                            Submit Feedback
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setSelectedLog(null)}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FeedbackLogsReviewPage;
