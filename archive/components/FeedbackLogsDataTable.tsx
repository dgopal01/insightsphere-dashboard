/**
 * FeedbackLogsDataTable Component
 * Displays User Feedback logs in a sortable, paginated table
 * Requirements: 5.2, 5.3, 5.5, 6.2, 6.5
 */

import React, { useMemo } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
  Chip,
  Button,
  Skeleton,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Feedback as FeedbackIcon,
  Comment,
  Visibility,
  CheckCircle,
  PendingActions,
} from '@mui/icons-material';
import { FeedbackLogReviewModal } from './FeedbackLogReviewModal';
import { sanitizeText } from '../utils';
import type { FeedbackLogEntry } from '../types';
import type { SortDirection } from '../hooks/useFeedbackLogs';

/**
 * Column definitions for the table
 */
interface Column {
  id: keyof FeedbackLogEntry | 'actions' | 'info';
  label: string;
  minWidth?: number;
  align?: 'left' | 'right' | 'center';
  sortable: boolean;
  format?: (value: any, row: FeedbackLogEntry) => React.ReactNode;
}

/**
 * Props for FeedbackLogsDataTable component
 */
export interface FeedbackLogsDataTableProps {
  logs: FeedbackLogEntry[];
  loading: boolean;
  totalCount: number;
  hasMore: boolean;
  sortDirection: SortDirection;
  onRowClick: (log: FeedbackLogEntry) => void;
  onSortChange: (direction: SortDirection) => void;
  onLoadMore: () => void;
  selectedLog: FeedbackLogEntry | null;
  onCloseDetail: () => void;
  onReviewSubmit: (logId: string, reviewData: { rev_comment: string; rev_feedback: string }) => Promise<void>;
}

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
 * FeedbackLogsDataTable Component
 */
export const FeedbackLogsDataTable: React.FC<FeedbackLogsDataTableProps> = ({
  logs,
  loading,
  totalCount,
  hasMore,
  sortDirection,
  onRowClick,
  onSortChange,
  onLoadMore,
  selectedLog,
  onCloseDetail,
  onReviewSubmit,
}) => {
  /**
   * Column definitions
   */
  const columns: Column[] = useMemo(
    () => [
      {
        id: 'datetime',
        label: 'Date/Time',
        minWidth: 170,
        sortable: true,
        format: (value: string) => new Date(value).toLocaleString(),
      },
      {
        id: 'info',
        label: 'Carrier',
        minWidth: 120,
        sortable: false,
        format: (_value: any, row: FeedbackLogEntry) => {
          try {
            return row.info?.carrier || 'N/A';
          } catch (error) {
            console.error('Error rendering carrier:', error);
            return 'N/A';
          }
        },
      },
      {
        id: 'info',
        label: 'User',
        minWidth: 120,
        sortable: false,
        format: (_value: any, row: FeedbackLogEntry) => {
          try {
            return row.info?.username || row.info?.user_name || 'N/A';
          } catch (error) {
            console.error('Error rendering user:', error);
            return 'N/A';
          }
        },
      },
      {
        id: 'info',
        label: 'User Comments',
        minWidth: 200,
        sortable: false,
        format: (_value: any, row: FeedbackLogEntry) => {
          try {
            const comments = row.info?.comments || '';
            return (
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <Comment
                  sx={{ fontSize: 16, mr: 1, mt: 0.5, color: 'info.main', flexShrink: 0 }}
                  aria-hidden="true"
                />
                <Typography variant="body2">{sanitizeText(truncateText(comments))}</Typography>
              </Box>
            );
          } catch (error) {
            console.error('Error rendering comments:', error);
            return <Typography variant="body2">—</Typography>;
          }
        },
      },
      {
        id: 'info',
        label: 'User Feedback',
        minWidth: 200,
        sortable: false,
        format: (_value: any, row: FeedbackLogEntry) => {
          try {
            const feedback = row.info?.feedback || '';
            return (
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <FeedbackIcon
                  sx={{ fontSize: 16, mr: 1, mt: 0.5, color: 'warning.main', flexShrink: 0 }}
                  aria-hidden="true"
                />
                <Typography variant="body2">{sanitizeText(truncateText(feedback))}</Typography>
              </Box>
            );
          } catch (error) {
            console.error('Error rendering feedback:', error);
            return <Typography variant="body2">—</Typography>;
          }
        },
      },
      {
        id: 'id',
        label: 'Review Status',
        minWidth: 130,
        align: 'center',
        sortable: false,
        format: (_value: string, row: FeedbackLogEntry) => {
          const status = getReviewStatus(row);
          return (
            <Chip
              label={status === 'reviewed' ? 'Reviewed' : 'Pending'}
              color={status === 'reviewed' ? 'success' : 'warning'}
              size="small"
              icon={status === 'reviewed' ? <CheckCircle /> : <PendingActions />}
              aria-label={`Review status: ${status}`}
            />
          );
        },
      },
      {
        id: 'actions',
        label: 'Actions',
        minWidth: 100,
        align: 'center',
        sortable: false,
        format: (_value: any, row: FeedbackLogEntry) => (
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onRowClick(row);
              }}
              aria-label={`View details for feedback ${row.id}`}
              sx={{
                '&:focus-visible': {
                  outline: '2px solid',
                  outlineColor: 'primary.main',
                  outlineOffset: '2px',
                },
              }}
            >
              <Visibility />
            </IconButton>
          </Tooltip>
        ),
      },
    ],
    [onRowClick]
  );

  /**
   * Handle sort toggle
   */
  const handleSortToggle = () => {
    onSortChange(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  /**
   * Render loading skeleton
   */
  const renderLoadingSkeleton = () => {
    return (
      <>
        {[...Array(5)].map((_, index) => (
          <TableRow key={`skeleton-${index}`}>
            {columns.map((column) => (
              <TableCell key={column.id}>
                <Skeleton variant="text" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </>
    );
  };

  /**
   * Render empty state
   */
  const renderEmptyState = () => {
    return (
      <TableRow>
        <TableCell colSpan={columns.length} align="center">
          <Box sx={{ py: 8 }}>
            <FeedbackIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No feedback logs found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your filters or check back later for new feedback.
            </Typography>
          </Box>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <>
      <Paper sx={{ width: '100%', overflow: 'hidden' }} role="region" aria-label="Feedback logs table">
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader aria-label="Feedback logs with sortable columns">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                  >
                    {column.sortable && column.id === 'datetime' ? (
                      <TableSortLabel
                        active={true}
                        direction={sortDirection}
                        onClick={handleSortToggle}
                        aria-label={`Sort by ${column.label}`}
                        sx={{
                          '&:focus-visible': {
                            outline: '2px solid',
                            outlineColor: 'primary.main',
                            outlineOffset: '2px',
                          },
                        }}
                      >
                        {column.label}
                      </TableSortLabel>
                    ) : (
                      column.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && logs.length === 0
                ? renderLoadingSkeleton()
                : logs.length === 0
                  ? renderEmptyState()
                  : logs.map((log) => (
                      <TableRow
                        hover
                        key={log.id}
                        onClick={() => onRowClick(log)}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onRowClick(log);
                          }
                        }}
                        sx={{
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          },
                          '&:focus-visible': {
                            outline: '2px solid',
                            outlineColor: 'primary.main',
                            outlineOffset: '-2px',
                          },
                        }}
                        aria-label={`Feedback from ${log.info?.username || 'user'} at ${new Date(log.datetime).toLocaleString()}`}
                      >
                        {columns.map((column, index) => {
                          const value = column.id !== 'actions' ? log[column.id as keyof FeedbackLogEntry] : null;
                          return (
                            <TableCell key={`${column.id}-${index}`} align={column.align}>
                              {column.format ? column.format(value, log) : (typeof value === 'string' || typeof value === 'number' ? value : '')}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Load More Button */}
        {!loading && logs.length > 0 && hasMore && (
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="outlined"
              onClick={onLoadMore}
              disabled={loading}
              aria-label="Load more feedback logs"
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

        {/* Loading indicator for pagination */}
        {loading && logs.length > 0 && (
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Loading more feedback...
            </Typography>
          </Box>
        )}

        {/* Total count display */}
        {!loading && logs.length > 0 && (
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary" align="center">
              Showing {logs.length} of {totalCount} feedback logs
              {hasMore && ' (more available)'}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Review Modal */}
      <FeedbackLogReviewModal
        open={!!selectedLog}
        log={selectedLog}
        onClose={onCloseDetail}
        onSubmit={onReviewSubmit}
      />
    </>
  );
};
