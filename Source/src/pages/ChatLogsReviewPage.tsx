/**
 * Chat Logs Review Page (New Design System)
 * Container component for reviewing Unity AI Assistant chat logs
 */

import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Filter, RefreshCw, X, Save, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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

// Issue tags for chat log review
const ISSUE_TAGS = [
  'Accuracy Issue',
  'Tone/Style Issue',
  'Safety Concern',
  'Reasoning Quality',
  'Incomplete Response',
  'Hallucination/Fabrication',
];

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
  const [reviewComment, setReviewComment] = useState('');
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setReviewComment(log.rev_comment || '');
    setReviewFeedback(log.rev_feedback || '');
    // Parse existing tags from issue_tags field
    try {
      let existingTags: string[] = [];
      if (log.issue_tags) {
        if (typeof log.issue_tags === 'string') {
          existingTags = JSON.parse(log.issue_tags);
        } else if (Array.isArray(log.issue_tags)) {
          existingTags = log.issue_tags;
        }
      }
      setSelectedTags(existingTags);
    } catch {
      setSelectedTags([]);
    }
  }, []);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmitFeedback = async () => {
    if (!selectedLog) return;
    
    setIsSubmitting(true);
    try {
      // Import DynamoDB service
      const { updateChatLogReview } = await import('../services/DynamoDBService');
      
      // Update in DynamoDB with composite key (log_id + timestamp)
      await updateChatLogReview(
        selectedLog.log_id,
        selectedLog.timestamp,
        reviewComment,
        reviewFeedback,
        selectedTags
      );
      
      // Close modal and refresh data
      setSelectedLog(null);
      setReviewComment('');
      setReviewFeedback('');
      setSelectedTags([]);
      refetch();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert(`Failed to submit feedback: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <CardTitle className="flex items-center gap-2">
            <Filter className="size-5" />
            Filters
          </CardTitle>
          <CardDescription>Filter chat logs by review status, carrier, and date range</CardDescription>
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

          {/* Carrier Filter */}
          <div className="space-y-2">
            <Label htmlFor="carrier">Carrier Name</Label>
            <div className="flex gap-2">
              <Input
                id="carrier"
                placeholder="Enter carrier name..."
                value={filters.carrier_name || ''}
                onChange={(e) => setFilters({ ...filters, carrier_name: e.target.value || undefined })}
              />
              {filters.carrier_name && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setFilters({ ...filters, carrier_name: undefined })}
                >
                  <X className="size-4" />
                </Button>
              )}
            </div>
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
          {(filters.carrier_name || filters.startDate || filters.endDate) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters({ reviewStatus: filters.reviewStatus })}
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
                      <TableHead className="w-[200px]">Tags</TableHead>
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
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {(() => {
                                try {
                                  let tags: string[] = [];
                                  if (log.issue_tags) {
                                    if (typeof log.issue_tags === 'string') {
                                      tags = JSON.parse(log.issue_tags);
                                    } else if (Array.isArray(log.issue_tags)) {
                                      tags = log.issue_tags;
                                    }
                                  }
                                  if (tags.length > 0) {
                                    return tags.slice(0, 2).map((tag: string, idx: number) => (
                                      <Badge key={idx} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ));
                                  }
                                } catch {
                                  return null;
                                }
                                return <span className="text-xs text-muted-foreground">No tags</span>;
                              })()}
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

      {/* Editable Review Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <Card className="w-full max-w-6xl my-8 bg-white shadow-2xl" style={{ backgroundColor: '#ffffff' }}>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Review Chat Log</CardTitle>
                  <CardDescription>Log ID: {selectedLog.log_id}</CardDescription>
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
                    
                    {/* Question */}
                    <div className="bg-muted/50 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="size-4 text-primary" />
                        <span className="text-sm font-semibold">Question</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {new Date(selectedLog.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">
                        {sanitizeText(selectedLog.question || '')}
                      </p>
                    </div>

                    {/* Response */}
                    <div className="bg-secondary/10 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="size-4 text-secondary" />
                        <span className="text-sm font-semibold">Response</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {new Date(selectedLog.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">
                        {sanitizeText(selectedLog.response || '')}
                      </p>
                    </div>

                    {/* Metadata */}
                    <div className="pt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Carrier:</span>
                        <span className="font-medium">{selectedLog.carrier_name || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Timestamp:</span>
                        <span className="font-medium">
                          {new Date(selectedLog.timestamp).toLocaleString()}
                        </span>
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

                    {/* Issue Tags */}
                    <div className="space-y-3 mb-6">
                      <Label className="flex items-center gap-2">
                        <Tag className="size-4" />
                        Issue Tags
                      </Label>
                      <div className="space-y-2">
                        {ISSUE_TAGS.map((tag) => (
                          <div key={tag} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`tag-${tag}`}
                              checked={selectedTags.includes(tag)}
                              onCheckedChange={() => handleTagToggle(tag)}
                            />
                            <label
                              htmlFor={`tag-${tag}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {tag}
                            </label>
                          </div>
                        ))}
                      </div>
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

export default ChatLogsReviewPage;
