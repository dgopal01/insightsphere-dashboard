/**
 * ChatLogsDataTable Component
 * Displays Unity AI Assistant chat logs in a sortable, paginated table
 * Requirements: 2.2, 2.3, 2.5, 3.2, 3.5
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
  ChatBubbleOutline,
  SmartToy,
  Visibility,
  CheckCircle,
  PendingActions,
} from '@mui/icons-material';
import { ChatLogReviewModal } from './ChatLogReviewModal';
import { sanitizeText } from '../utils';
import type { ChatLogEntry } from '../types';
import type { SortDirection } from '../hooks/useChatLogs';

/**
 * Column definitions for the table
 */
interface Column {
  id: keyof ChatLogEntry | 'actions' | 'issue_tags';
  label: string;
  minWidth?: number;
  align?: 'left' | 'right' | 'center';
  sortable: boolean;
  format?: (value: any, row: ChatLogEntry) => React.ReactNode;
}

/**
 * Props for ChatLogsDataTable component
 */
export interface ChatLogsDataTableProps {
  logs: ChatLogEntry[];
  loading: boolean;
  totalCount: number;
  hasMore: boolean;
  sortDirection: SortDirection;
  onRowClick: (log: ChatLogEntry) => void;
  onSortChange: (direction: SortDirection) => void;
  onLoadMore: () => void;
  selectedLog: ChatLogEntry | null;
  onCloseDetail: () => void;
  onReviewSubmit: (logId: string, reviewData: { rev_comment: string; rev_feedback: string; issue_tags?: string[] }) => Promise<void>;
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
function getReviewStatus(log: ChatLogEntry): 'reviewed' | 'pending' {
  return log.rev_comment || log.rev_feedback ? 'reviewed' : 'pending';
}

/**
 * ChatLogsDataTable Component
 */
export const ChatLogsDataTable: React.FC<ChatLogsDataTableProps> = ({
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
        id: 'timestamp',
        label: 'Timestamp',
        minWidth: 170,
        sortable: true,
        format: (value: string) => new Date(value).toLocaleString(),
      },
      {
        id: 'carrier_name',
        label: 'Carrier',
        minWidth: 120,
        sortable: false,
      },
      {
        id: 'question',
        label: 'Question',
        minWidth: 200,
        sortable: false,
        format: (value: string) => (
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <ChatBubbleOutline
              sx={{ fontSize: 16, mr: 1, mt: 0.5, color: 'primary.main', flexShrink: 0 }}
              aria-hidden="true"
            />
            <Typography variant="body2">{sanitizeText(truncateText(value))}</Typography>
          </Box>
        ),
      },
      {
        id: 'response',
        label: 'Response',
        minWidth: 200,
        sortable: false,
        format: (value: string) => (
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <SmartToy
              sx={{ fontSize: 16, mr: 1, mt: 0.5, color: 'secondary.main', flexShrink: 0 }}
              aria-hidden="true"
            />
            <Typography variant="body2">{sanitizeText(truncateText(value))}</Typography>
          </Box>
        ),
      },
      {
        id: 'log_id',
        label: 'Review Status',
        minWidth: 130,
        align: 'center',
        sortable: false,
        format: (_value: string, row: ChatLogEntry) => {
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
        id: 'issue_tags',
        label: 'Tags',
        minWidth: 200,
        sortable: false,
        format: (value: string[] | string | undefined) => {
          if (!value) return <Typography variant="body2" color="text.secondary">—</Typography>;
          
          let tags: string[] = [];
          if (typeof value === 'string') {
            try {
              tags = JSON.parse(value);
            } catch {
              tags = value.split(',').map(t => t.trim()).filter(Boolean);
            }
          } else if (Array.isArray(value)) {
            tags = value;
          }
          
          if (tags.length === 0) return <Typography variant="body2" color="text.secondary">—</Typography>;
          
          return (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  variant="outlined"
                  color="error"
                  sx={{ fontSize: '0.75rem' }}
                />
              ))}
            </Box>
          );
        },
      },
      {
        id: 'actions',
        label: 'Actions',
        minWidth: 100,
        align: 'center',
        sortable: false,
        format: (_value: any, row: ChatLogEntry) => (
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onRowClick(row);
              }}
              aria-label={`View details for log ${row.log_id}`}
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
            <ChatBubbleOutline sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No chat logs found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your filters or check back later for new logs.
            </Typography>
          </Box>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <>
      <Paper sx={{ width: '100%', overflow: 'hidden' }} role="region" aria-label="Chat logs table">
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader aria-label="Chat logs with sortable columns">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                  >
                    {column.sortable && column.id === 'timestamp' ? (
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
                        key={log.log_id}
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
                        aria-label={`Chat log from ${log.carrier_name} at ${new Date(log.timestamp).toLocaleString()}`}
                      >
                        {columns.map((column) => {
                          const value = column.id !== 'actions' ? log[column.id as keyof ChatLogEntry] : null;
                          return (
                            <TableCell key={column.id} align={column.align}>
                              {column.format ? column.format(value, log) : value}
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
              aria-label="Load more chat logs"
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
              Loading more logs...
            </Typography>
          </Box>
        )}

        {/* Total count display */}
        {!loading && logs.length > 0 && (
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary" align="center">
              Showing {logs.length} of {totalCount} logs
              {hasMore && ' (more available)'}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Review Modal */}
      <ChatLogReviewModal
        open={!!selectedLog}
        log={selectedLog}
        onClose={onCloseDetail}
        onSubmit={onReviewSubmit}
      />
    </>
  );
};
