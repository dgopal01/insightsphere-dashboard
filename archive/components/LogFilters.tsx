/**
 * LogFilters Component
 * Provides filtering controls for chat logs
 * Requirements: 1.2
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Paper,
  Typography,
  IconButton,
  Collapse,
  Stack,
} from '@mui/material';
import { FilterList, Clear, ExpandMore, ExpandLess } from '@mui/icons-material';
import type { LogFilters as LogFiltersType } from '../types/graphql';
import { sanitizeSearchInput } from '../utils';

/**
 * Props for LogFilters component
 */
export interface LogFiltersProps {
  filters: LogFiltersType;
  onFilterChange: (filters: LogFiltersType) => void;
}

/**
 * Debounce hook for text inputs
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * LogFilters Component
 */
export const LogFilters: React.FC<LogFiltersProps> = ({ filters, onFilterChange }) => {
  const [expanded, setExpanded] = useState(true);

  // Local state for text inputs (for debouncing)
  const [localSearchText, setLocalSearchText] = useState(filters.searchText || '');
  const [localUserId, setLocalUserId] = useState(filters.userId || '');
  const [localConversationId, setLocalConversationId] = useState(filters.conversationId || '');

  // Debounced values
  const debouncedSearchText = useDebounce(localSearchText, 300);
  const debouncedUserId = useDebounce(localUserId, 300);
  const debouncedConversationId = useDebounce(localConversationId, 300);

  // Update filters when debounced values change
  useEffect(() => {
    onFilterChange({
      ...filters,
      searchText: sanitizeSearchInput(debouncedSearchText) || undefined,
    });
  }, [debouncedSearchText]);

  useEffect(() => {
    onFilterChange({
      ...filters,
      userId: sanitizeSearchInput(debouncedUserId) || undefined,
    });
  }, [debouncedUserId]);

  useEffect(() => {
    onFilterChange({
      ...filters,
      conversationId: sanitizeSearchInput(debouncedConversationId) || undefined,
    });
  }, [debouncedConversationId]);

  /**
   * Handle date range changes
   */
  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    onFilterChange({
      ...filters,
      startDate: value ? new Date(value).toISOString() : undefined,
    });
  };

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    onFilterChange({
      ...filters,
      endDate: value ? new Date(value).toISOString() : undefined,
    });
  };

  /**
   * Handle sentiment change
   */
  const handleSentimentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    onFilterChange({
      ...filters,
      sentiment: value ? (value as 'positive' | 'negative' | 'neutral') : undefined,
    });
  };

  /**
   * Clear all filters
   */
  const handleClearFilters = useCallback(() => {
    setLocalSearchText('');
    setLocalUserId('');
    setLocalConversationId('');
    onFilterChange({});
  }, [onFilterChange]);

  /**
   * Check if any filters are active
   */
  const hasActiveFilters =
    filters.searchText ||
    filters.userId ||
    filters.conversationId ||
    filters.startDate ||
    filters.endDate ||
    filters.sentiment;

  /**
   * Format date for input field (ISO date string to YYYY-MM-DD)
   */
  const formatDateForInput = (isoString?: string): string => {
    if (!isoString) return '';
    return isoString.split('T')[0];
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }} role="search" aria-label="Chat log filters">
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FilterList sx={{ mr: 1, color: 'primary.main' }} aria-hidden="true" />
          <Typography variant="h6" id="filters-heading">
            Filters
          </Typography>
          {hasActiveFilters && (
            <IconButton
              size="small"
              onClick={handleClearFilters}
              sx={{
                ml: 1,
                '&:focus-visible': {
                  outline: '2px solid',
                  outlineColor: 'primary.main',
                  outlineOffset: '2px',
                },
              }}
              aria-label="Clear all filters"
            >
              <Clear fontSize="small" />
            </IconButton>
          )}
        </Box>
        <IconButton
          size="small"
          onClick={() => setExpanded(!expanded)}
          aria-label={expanded ? 'Collapse filters' : 'Expand filters'}
          aria-expanded={expanded}
          aria-controls="filters-content"
          sx={{
            '&:focus-visible': {
              outline: '2px solid',
              outlineColor: 'primary.main',
              outlineOffset: '2px',
            },
          }}
        >
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      <Collapse in={expanded} id="filters-content">
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          {/* Row 1: Search Text and Sentiment */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 300px', minWidth: '200px' }}>
              <TextField
                fullWidth
                label="Search Text"
                placeholder="Search in messages..."
                value={localSearchText}
                onChange={(e) => setLocalSearchText(e.target.value)}
                helperText="Search in user messages, AI responses, user ID, and conversation ID"
                size="small"
                inputProps={{
                  'aria-label': 'Search text in chat logs',
                  'aria-describedby': 'search-text-helper',
                }}
                FormHelperTextProps={{
                  id: 'search-text-helper',
                }}
              />
            </Box>
            <Box sx={{ flex: '1 1 300px', minWidth: '200px' }}>
              <TextField
                fullWidth
                select
                label="Sentiment"
                value={filters.sentiment || ''}
                onChange={handleSentimentChange}
                size="small"
                inputProps={{
                  'aria-label': 'Filter by sentiment',
                }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="positive">Positive</MenuItem>
                <MenuItem value="negative">Negative</MenuItem>
                <MenuItem value="neutral">Neutral</MenuItem>
              </TextField>
            </Box>
          </Box>

          {/* Row 2: User ID and Conversation ID */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 300px', minWidth: '200px' }}>
              <TextField
                fullWidth
                label="User ID"
                placeholder="Filter by user ID..."
                value={localUserId}
                onChange={(e) => setLocalUserId(e.target.value)}
                size="small"
                inputProps={{
                  'aria-label': 'Filter by user ID',
                }}
              />
            </Box>
            <Box sx={{ flex: '1 1 300px', minWidth: '200px' }}>
              <TextField
                fullWidth
                label="Conversation ID"
                placeholder="Filter by conversation ID..."
                value={localConversationId}
                onChange={(e) => setLocalConversationId(e.target.value)}
                size="small"
                inputProps={{
                  'aria-label': 'Filter by conversation ID',
                }}
              />
            </Box>
          </Box>

          {/* Row 3: Date Range */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 300px', minWidth: '200px' }}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={formatDateForInput(filters.startDate)}
                onChange={handleStartDateChange}
                InputLabelProps={{
                  shrink: true,
                }}
                size="small"
                inputProps={{
                  'aria-label': 'Filter start date',
                }}
              />
            </Box>
            <Box sx={{ flex: '1 1 300px', minWidth: '200px' }}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={formatDateForInput(filters.endDate)}
                onChange={handleEndDateChange}
                InputLabelProps={{
                  shrink: true,
                }}
                size="small"
                inputProps={{
                  'aria-label': 'Filter end date',
                }}
              />
            </Box>
          </Box>
        </Stack>
      </Collapse>
    </Paper>
  );
};
