/**
 * LogTable Component
 * Displays chat logs in a sortable, paginated table
 * Requirements: 1.1, 1.4
 * Optimized with useMemo and useCallback for performance
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Skeleton,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import { ChatBubbleOutline, SmartToy } from '@mui/icons-material';
import type { ChatLog } from '../types/graphql';
import { sanitizeText } from '../utils';

/**
 * Column definitions for the table
 */
type ColumnId =
  | 'timestamp'
  | 'userId'
  | 'conversationId'
  | 'userMessage'
  | 'aiResponse'
  | 'responseTime'
  | 'accuracy';

interface Column {
  id: ColumnId;
  label: string;
  minWidth?: number;
  align?: 'left' | 'right' | 'center';
  sortable: boolean;
  format?: (value: string | number | undefined) => string;
}

const columns: Column[] = [
  {
    id: 'timestamp',
    label: 'Timestamp',
    minWidth: 170,
    sortable: true,
    format: (value: string | number | undefined) =>
      value ? new Date(value as string).toLocaleString() : '',
  },
  {
    id: 'userId',
    label: 'User ID',
    minWidth: 120,
    sortable: true,
  },
  {
    id: 'conversationId',
    label: 'Conversation ID',
    minWidth: 150,
    sortable: true,
  },
  {
    id: 'userMessage',
    label: 'User Message',
    minWidth: 200,
    sortable: false,
  },
  {
    id: 'aiResponse',
    label: 'AI Response',
    minWidth: 200,
    sortable: false,
  },
  {
    id: 'responseTime',
    label: 'Response Time (ms)',
    minWidth: 100,
    align: 'right',
    sortable: true,
  },
  {
    id: 'accuracy',
    label: 'Accuracy',
    minWidth: 100,
    align: 'center',
    sortable: true,
    format: (value: string | number | undefined) => (value !== undefined ? `${value}%` : 'N/A'),
  },
];

/**
 * Props for LogTable component
 */
export interface LogTableProps {
  logs: ChatLog[];
  loading?: boolean;
  onRowClick?: (log: ChatLog) => void;
}

/**
 * Sort order type
 */
type Order = 'asc' | 'desc';

/**
 * LogTable Component
 */
export const LogTable: React.FC<LogTableProps> = ({ logs, loading = false, onRowClick }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(50); // Fixed at 50 items per page as per requirements
  const [orderBy, setOrderBy] = useState<ColumnId>('timestamp');
  const [order, setOrder] = useState<Order>('desc');

  /**
   * Handle sort request - memoized to prevent unnecessary re-renders
   */
  const handleRequestSort = useCallback(
    (property: ColumnId) => {
      setOrder((prevOrder) => {
        const isAsc = orderBy === property && prevOrder === 'asc';
        return isAsc ? 'desc' : 'asc';
      });
      setOrderBy(property);
    },
    [orderBy]
  );

  /**
   * Handle page change - memoized to prevent unnecessary re-renders
   */
  const handleChangePage = useCallback((_event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  /**
   * Comparator function for sorting - memoized for performance
   */
  const getComparator = useMemo(
    () => (order: Order, orderBy: ColumnId) => {
      return (a: ChatLog, b: ChatLog) => {
        let aValue: string | number | undefined = a[orderBy];
        let bValue: string | number | undefined = b[orderBy];

        // Handle undefined values
        if (aValue === undefined) aValue = '';
        if (bValue === undefined) bValue = '';

        // Convert to comparable types
        if (orderBy === 'timestamp') {
          aValue = new Date(aValue as string).getTime();
          bValue = new Date(bValue as string).getTime();
        }

        if (aValue < bValue) {
          return order === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return order === 'asc' ? 1 : -1;
        }
        return 0;
      };
    },
    []
  );

  /**
   * Sort and paginate logs - memoized to avoid expensive operations on every render
   */
  const sortedAndPaginatedLogs = useMemo(() => {
    const sorted = [...logs].sort(getComparator(order, orderBy));
    return sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [logs, order, orderBy, page, rowsPerPage, getComparator]);

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

  /**
   * Truncate long text for display - memoized utility function
   */
  const truncateText = useCallback((text: string, maxLength: number = 100): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }, []);

  /**
   * Get accuracy color based on value - memoized utility function
   */
  const getAccuracyColor = useCallback(
    (accuracy?: number): 'success' | 'warning' | 'error' | 'default' => {
      if (accuracy === undefined) return 'default';
      if (accuracy >= 80) return 'success';
      if (accuracy >= 60) return 'warning';
      return 'error';
    },
    []
  );

  return (
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
                  {column.sortable ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleRequestSort(column.id)}
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
            {loading
              ? renderLoadingSkeleton()
              : logs.length === 0
                ? renderEmptyState()
                : sortedAndPaginatedLogs.map((log) => (
                    <TableRow
                      hover
                      key={log.id}
                      onClick={() => onRowClick?.(log)}
                      tabIndex={onRowClick ? 0 : undefined}
                      onKeyDown={(e) => {
                        if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                          e.preventDefault();
                          onRowClick(log);
                        }
                      }}
                      sx={{
                        cursor: onRowClick ? 'pointer' : 'default',
                        '&:hover': {
                          backgroundColor: onRowClick ? 'action.hover' : 'transparent',
                        },
                        '&:focus-visible': {
                          outline: '2px solid',
                          outlineColor: 'primary.main',
                          outlineOffset: '-2px',
                        },
                      }}
                      aria-label={`Chat log from ${log.userId} at ${new Date(log.timestamp).toLocaleString()}`}
                    >
                      <TableCell>
                        <time dateTime={log.timestamp}>
                          {new Date(log.timestamp).toLocaleString()}
                        </time>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap>
                          {log.userId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap>
                          {log.conversationId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                          <ChatBubbleOutline
                            sx={{ fontSize: 16, mr: 1, mt: 0.5, color: 'primary.main' }}
                            aria-hidden="true"
                          />
                          <Typography variant="body2">
                            {sanitizeText(truncateText(log.userMessage))}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                          <SmartToy
                            sx={{ fontSize: 16, mr: 1, mt: 0.5, color: 'secondary.main' }}
                            aria-hidden="true"
                          />
                          <Typography variant="body2">
                            {sanitizeText(truncateText(log.aiResponse))}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          aria-label={`Response time: ${log.responseTime} milliseconds`}
                        >
                          {log.responseTime}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={log.accuracy !== undefined ? `${log.accuracy}%` : 'N/A'}
                          color={getAccuracyColor(log.accuracy)}
                          size="small"
                          aria-label={
                            log.accuracy !== undefined
                              ? `Accuracy: ${log.accuracy} percent`
                              : 'Accuracy not available'
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
          </TableBody>
        </Table>
      </TableContainer>
      {!loading && logs.length > 0 && (
        <TablePagination
          rowsPerPageOptions={[50]}
          component="div"
          count={logs.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          aria-label="Table pagination"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} of ${count !== -1 ? count : `more than ${to}`}`
          }
        />
      )}
    </Paper>
  );
};
