/**
 * FeedbackList Component
 * Displays list of feedback entries with ratings and comments
 * Supports grouping by date, rating, or user
 * Implements pagination with loading and empty states
 * Requirements: 4.3
 */

import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Rating,
  Chip,
  Avatar,
  Divider,
  Skeleton,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ThumbUp,
  ThumbDown,
  Person,
  CalendarToday,
  Star,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import type { Feedback } from '../types';
import { sanitizeFeedbackComment } from '../utils';

/**
 * Grouping options for feedback list
 */
export type GroupByOption = 'none' | 'date' | 'rating' | 'user';

/**
 * Props for FeedbackList component
 */
export interface FeedbackListProps {
  feedback: Feedback[];
  loading?: boolean;
  groupBy?: GroupByOption;
  onGroupByChange?: (groupBy: GroupByOption) => void;
  itemsPerPage?: number;
}

/**
 * Grouped feedback structure
 */
interface GroupedFeedback {
  groupKey: string;
  groupLabel: string;
  items: Feedback[];
}

/**
 * FeedbackList Component
 */
export const FeedbackList: React.FC<FeedbackListProps> = ({
  feedback,
  loading = false,
  groupBy = 'none',
  onGroupByChange,
  itemsPerPage = 10,
}) => {
  const [page, setPage] = useState(0);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  /**
   * Group feedback based on selected option
   */
  const groupedFeedback = useMemo((): GroupedFeedback[] => {
    if (groupBy === 'none') {
      return [
        {
          groupKey: 'all',
          groupLabel: 'All Feedback',
          items: feedback,
        },
      ];
    }

    const groups = new Map<string, Feedback[]>();

    feedback.forEach((item) => {
      let key: string;

      switch (groupBy) {
        case 'date': {
          const date = new Date(item.timestamp);
          key = date.toISOString().split('T')[0]; // YYYY-MM-DD
          break;
        }
        case 'rating': {
          key = `rating-${item.rating}`;
          break;
        }
        case 'user': {
          key = item.userId;
          break;
        }
        default:
          key = 'all';
      }

      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(item);
    });

    // Convert to array and sort
    const result: GroupedFeedback[] = Array.from(groups.entries()).map(([key, items]) => {
      // Find the label from the first item
      let groupLabel = key;
      if (items.length > 0) {
        const firstItem = items[0];
        switch (groupBy) {
          case 'date': {
            const date = new Date(firstItem.timestamp);
            groupLabel = date.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });
            break;
          }
          case 'rating':
            groupLabel = `${firstItem.rating} Star${firstItem.rating !== 1 ? 's' : ''}`;
            break;
          case 'user':
            groupLabel = `User: ${firstItem.userId}`;
            break;
        }
      }

      return {
        groupKey: key,
        groupLabel,
        items: items.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ),
      };
    });

    // Sort groups
    if (groupBy === 'date') {
      result.sort((a, b) => b.groupKey.localeCompare(a.groupKey)); // Most recent first
    } else if (groupBy === 'rating') {
      result.sort((a, b) => {
        const ratingA = parseInt(a.groupKey.split('-')[1]);
        const ratingB = parseInt(b.groupKey.split('-')[1]);
        return ratingB - ratingA; // Highest rating first
      });
    } else {
      result.sort((a, b) => a.groupLabel.localeCompare(b.groupLabel)); // Alphabetical
    }

    return result;
  }, [feedback, groupBy]);

  /**
   * Get paginated items
   */
  const paginatedGroups = useMemo(() => {
    if (groupBy === 'none') {
      const startIndex = page * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return [
        {
          ...groupedFeedback[0],
          items: groupedFeedback[0]?.items.slice(startIndex, endIndex) || [],
        },
      ];
    }
    return groupedFeedback;
  }, [groupedFeedback, page, itemsPerPage, groupBy]);

  /**
   * Toggle group expansion
   */
  const toggleGroup = (groupKey: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey);
      } else {
        newSet.add(groupKey);
      }
      return newSet;
    });
  };

  /**
   * Handle group by change
   */
  const handleGroupByChange = (event: any) => {
    const value = event.target.value as GroupByOption;
    setPage(0); // Reset pagination
    setExpandedGroups(new Set()); // Collapse all groups
    onGroupByChange?.(value);
  };

  /**
   * Handle load more
   */
  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  /**
   * Check if there are more items to load
   */
  const hasMore = useMemo(() => {
    if (groupBy !== 'none') return false;
    const totalItems = groupedFeedback[0]?.items.length || 0;
    return (page + 1) * itemsPerPage < totalItems;
  }, [groupedFeedback, page, itemsPerPage, groupBy]);

  /**
   * Format timestamp
   */
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  /**
   * Get category color
   */
  const getCategoryColor = (
    category?: 'accuracy' | 'helpfulness' | 'speed'
  ): 'primary' | 'secondary' | 'success' | 'default' => {
    switch (category) {
      case 'accuracy':
        return 'primary';
      case 'helpfulness':
        return 'secondary';
      case 'speed':
        return 'success';
      default:
        return 'default';
    }
  };

  /**
   * Render loading skeleton
   */
  const renderLoadingSkeleton = () => {
    return (
      <Stack spacing={2}>
        {[...Array(3)].map((_, index) => (
          <Card key={`skeleton-${index}`}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="40%" />
                  <Skeleton variant="text" width="30%" />
                </Box>
              </Box>
              <Skeleton variant="rectangular" height={60} />
            </CardContent>
          </Card>
        ))}
      </Stack>
    );
  };

  /**
   * Render empty state
   */
  const renderEmptyState = () => {
    return (
      <Paper sx={{ p: 8, textAlign: 'center' }}>
        <Star sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No feedback yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Feedback entries will appear here once users start submitting their reviews.
        </Typography>
      </Paper>
    );
  };

  /**
   * Render feedback item
   */
  const renderFeedbackItem = (item: Feedback) => {
    return (
      <Card key={item.id} sx={{ mb: 2 }}>
        <CardContent>
          {/* Header with user info and timestamp */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
              <Person />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {item.userId}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                <CalendarToday sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />
                {formatTimestamp(item.timestamp)}
              </Typography>
            </Box>
            {/* Thumbs up/down indicator */}
            <Tooltip title={item.thumbsUp ? 'Positive' : 'Negative'}>
              <Chip
                icon={item.thumbsUp ? <ThumbUp /> : <ThumbDown />}
                label={item.thumbsUp ? 'Positive' : 'Negative'}
                color={item.thumbsUp ? 'success' : 'error'}
                size="small"
              />
            </Tooltip>
          </Box>

          {/* Rating */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Rating value={item.rating} readOnly size="small" />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              ({item.rating}/5)
            </Typography>
            {item.category && (
              <Chip
                label={item.category}
                color={getCategoryColor(item.category)}
                size="small"
                sx={{ ml: 2 }}
              />
            )}
          </Box>

          {/* Comment */}
          {item.comment && (
            <>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.primary" sx={{ whiteSpace: 'pre-wrap' }}>
                {sanitizeFeedbackComment(item.comment)}
              </Typography>
            </>
          )}

          {/* Log ID reference */}
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary">
              Log ID: {item.logId}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  };

  /**
   * Render group
   */
  const renderGroup = (group: GroupedFeedback) => {
    const isExpanded = expandedGroups.has(group.groupKey) || groupBy === 'none';
    const showToggle = groupBy !== 'none';

    return (
      <Box key={group.groupKey} sx={{ mb: 3 }}>
        {showToggle && (
          <Paper
            sx={{
              p: 2,
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              '&:hover': { bgcolor: 'action.hover' },
              '&:focus-within': {
                outline: '2px solid',
                outlineColor: 'primary.main',
                outlineOffset: '2px',
              },
            }}
            onClick={() => toggleGroup(group.groupKey)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleGroup(group.groupKey);
              }
            }}
            tabIndex={0}
            role="button"
            aria-expanded={isExpanded}
            aria-controls={`group-content-${group.groupKey}`}
            aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${group.groupLabel} group with ${group.items.length} feedback ${group.items.length !== 1 ? 'entries' : 'entry'}`}
          >
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6">{group.groupLabel}</Typography>
              <Typography variant="caption" color="text.secondary">
                {group.items.length} feedback {group.items.length !== 1 ? 'entries' : 'entry'}
              </Typography>
            </Box>
            <IconButton aria-hidden="true" tabIndex={-1}>
              {isExpanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Paper>
        )}

        {isExpanded && (
          <Box
            id={`group-content-${group.groupKey}`}
            role="region"
            aria-label={`${group.groupLabel} feedback entries`}
          >
            {group.items.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                No feedback in this group
              </Typography>
            ) : (
              group.items.map(renderFeedbackItem)
            )}
          </Box>
        )}
      </Box>
    );
  };

  // Show loading state
  if (loading) {
    return (
      <Box>
        {onGroupByChange && (
          <Box sx={{ mb: 3 }}>
            <Skeleton variant="rectangular" height={56} />
          </Box>
        )}
        {renderLoadingSkeleton()}
      </Box>
    );
  }

  // Show empty state
  if (feedback.length === 0) {
    return (
      <Box>
        {onGroupByChange && (
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Group By</InputLabel>
            <Select value={groupBy} onChange={handleGroupByChange} label="Group By">
              <MenuItem value="none">None</MenuItem>
              <MenuItem value="date">Date</MenuItem>
              <MenuItem value="rating">Rating</MenuItem>
              <MenuItem value="user">User</MenuItem>
            </Select>
          </FormControl>
        )}
        {renderEmptyState()}
      </Box>
    );
  }

  return (
    <Box>
      {/* Group By Selector */}
      {onGroupByChange && (
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="group-by-label">Group By</InputLabel>
          <Select
            value={groupBy}
            onChange={handleGroupByChange}
            label="Group By"
            labelId="group-by-label"
            inputProps={{
              'aria-label': 'Group feedback entries by',
            }}
          >
            <MenuItem value="none">None</MenuItem>
            <MenuItem value="date">Date</MenuItem>
            <MenuItem value="rating">Rating</MenuItem>
            <MenuItem value="user">User</MenuItem>
          </Select>
        </FormControl>
      )}

      {/* Feedback Groups */}
      {paginatedGroups.map(renderGroup)}

      {/* Load More Button (for pagination when not grouped) */}
      {groupBy === 'none' && hasMore && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button
            variant="outlined"
            onClick={handleLoadMore}
            size="large"
            aria-label="Load more feedback entries"
            sx={{
              '&:focus-visible': {
                outline: '2px solid',
                outlineColor: 'primary.main',
                outlineOffset: '2px',
              },
            }}
          >
            Load More
          </Button>
        </Box>
      )}

      {/* Total count */}
      {feedback.length > 0 && (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Showing{' '}
            {groupBy === 'none'
              ? Math.min((page + 1) * itemsPerPage, feedback.length)
              : feedback.length}{' '}
            of {feedback.length} feedback {feedback.length !== 1 ? 'entries' : 'entry'}
          </Typography>
        </Box>
      )}
    </Box>
  );
};
