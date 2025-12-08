/**
 * VirtualizedLogTable Component
 * Displays chat logs in a sortable table with virtual scrolling for performance
 * Requirements: 1.1, 1.4, 9.2
 * Uses react-window for efficient rendering of large datasets
 */

import React, { useState, useMemo, useCallback, useRef } from 'react';
// @ts-ignore - react-window types issue
import { FixedSizeList } from 'react-window';
import {
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
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
}

const columns: Column[] = [
  { id: 'timestamp', label: 'Timestamp', minWidth: 170, sortable: true },
  { id: 'userId', label: 'User ID', minWidth: 120, sortable: true },
  { id: 'conversationId', label: 'Conversation ID', minWidth: 150, sortable: true },
  { id: 'userMessage', label: 'User Message', minWidth: 200, sortable: false },
  { id: 'aiResponse', label: 'AI Response', minWidth: 200, sortable: false },
  {
    id: 'responseTime',
    label: 'Response Time (ms)',
    minWidth: 100,
    align: 'right',
    sortable: true,
  },
  { id: 'accuracy', label: 'Accuracy', minWidth: 100, align: 'center', sortable: true },
];

/**
 * Props for VirtualizedLogTable component
 */
export interface VirtualizedLogTableProps {
  logs: ChatLog[];
  loading?: boolean;
  onRowClick?: (log: ChatLog) => void;
  height?: number;
}

/**
 * Sort order type
 */
type Order = 'asc' | 'desc';

/**
 * Row height constant for virtual scrolling
 */
const ROW_HEIGHT = 73;

/**
 * VirtualizedLogTable Component
 */
export const VirtualizedLogTable: React.FC<VirtualizedLogTableProps> = ({
  logs,
  loading = false,
  onRowClick,
  height = 600,
}) => {
  const [orderBy, setOrderBy] = useState<ColumnId>('timestamp');
  const [order, setOrder] = useState<Order>('desc');
  const listRef = useRef<FixedSizeList>(null);

  /**
   * Handle sort request - memoized to prevent unnecessary re-renders
   */
  const handleRequestSort = useCallback(
    (property: ColumnId) => {
      const isAsc = orderBy === property && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(property);
    },
    [orderBy, order]
  );

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
   * Sort logs - memoized to avoid expensive operations on every render
   */
  const sortedLogs = useMemo(() => {
    return [...logs].sort(getComparator(order, orderBy));
  }, [logs, order, orderBy, getComparator]);

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

  /**
   * Render individual row - memoized for virtual scrolling performance
   */
  const Row = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const log = sortedLogs[index];

      return (
        <TableRow
          hover
          style={style}
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
            display: 'flex',
            alignItems: 'center',
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
          <TableCell sx={{ flex: '0 0 170px' }}>
            <time dateTime={log.timestamp}>{new Date(log.timestamp).toLocaleString()}</time>
          </TableCell>
          <TableCell sx={{ flex: '0 0 120px' }}>
            <Typography variant="body2" noWrap>
              {log.userId}
            </Typography>
          </TableCell>
          <TableCell sx={{ flex: '0 0 150px' }}>
            <Typography variant="body2" noWrap>
              {log.conversationId}
            </Typography>
          </TableCell>
          <TableCell sx={{ flex: '1 1 200px' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <ChatBubbleOutline
                sx={{ fontSize: 16, mr: 1, mt: 0.5, color: 'primary.main' }}
                aria-hidden="true"
              />
              <Typography variant="body2">{sanitizeText(truncateText(log.userMessage))}</Typography>
            </Box>
          </TableCell>
          <TableCell sx={{ flex: '1 1 200px' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <SmartToy
                sx={{ fontSize: 16, mr: 1, mt: 0.5, color: 'secondary.main' }}
                aria-hidden="true"
              />
              <Typography variant="body2">{sanitizeText(truncateText(log.aiResponse))}</Typography>
            </Box>
          </TableCell>
          <TableCell align="right" sx={{ flex: '0 0 100px' }}>
            <Typography
              variant="body2"
              aria-label={`Response time: ${log.responseTime} milliseconds`}
            >
              {log.responseTime}
            </Typography>
          </TableCell>
          <TableCell align="center" sx={{ flex: '0 0 100px' }}>
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
      );
    },
    [sortedLogs, onRowClick, truncateText, getAccuracyColor]
  );

  /**
   * Render empty state
   */
  if (!loading && logs.length === 0) {
    return (
      <Paper sx={{ width: '100%' }} role="region" aria-label="Chat logs table">
        <Box sx={{ p: 8, textAlign: 'center' }}>
          <ChatBubbleOutline sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No chat logs found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your filters or check back later for new logs.
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }} role="region" aria-label="Chat logs table">
      <TableContainer>
        <Table stickyHeader aria-label="Chat logs with sortable columns">
          <TableHead>
            <TableRow sx={{ display: 'flex' }}>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  sx={{
                    flex:
                      column.id === 'userMessage' || column.id === 'aiResponse'
                        ? '1 1 200px'
                        : `0 0 ${column.minWidth}px`,
                  }}
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
        </Table>
      </TableContainer>

      {loading ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Loading chat logs...
          </Typography>
        </Box>
      ) : (
        <FixedSizeList
          ref={listRef}
          height={height}
          itemCount={sortedLogs.length}
          itemSize={ROW_HEIGHT}
          width="100%"
          overscanCount={5}
        >
          {Row}
        </FixedSizeList>
      )}

      {!loading && sortedLogs.length > 0 && (
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary" align="center">
            Showing {sortedLogs.length} log{sortedLogs.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};
