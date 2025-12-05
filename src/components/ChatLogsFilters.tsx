/**
 * ChatLogsFilters Component
 * Filter controls for Unity AI Assistant chat logs
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */

import React, { useState } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Paper,
  Typography,
  IconButton,
  Collapse,
  Stack,
  Button,
} from '@mui/material';
import { FilterList, Clear, ExpandMore, ExpandLess } from '@mui/icons-material';
import type { ChatLogFilters } from '../types';

/**
 * Props for ChatLogsFilters component
 */
export interface ChatLogsFiltersProps {
  filters: ChatLogFilters;
  onFilterChange: (filters: ChatLogFilters) => void;
  onClearFilters: () => void;
}

/**
 * ChatLogsFilters Component
 * Provides filtering controls for carrier name, date range, and review status
 */
export const ChatLogsFilters: React.FC<ChatLogsFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
}) => {
  const [expanded, setExpanded] = useState(true);

  /**
   * Handle carrier name change
   */
  const handleCarrierChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    onFilterChange({
      ...filters,
      carrier_name: value || undefined,
    });
  };

  /**
   * Handle start date change
   */
  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    onFilterChange({
      ...filters,
      startDate: value ? new Date(value).toISOString() : undefined,
    });
  };

  /**
   * Handle end date change
   */
  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    onFilterChange({
      ...filters,
      endDate: value ? new Date(value).toISOString() : undefined,
    });
  };

  /**
   * Handle review status change
   */
  const handleReviewStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value as 'all' | 'reviewed' | 'pending';
    onFilterChange({
      ...filters,
      reviewStatus: value,
    });
  };

  /**
   * Check if any filters are active
   */
  const hasActiveFilters =
    filters.carrier_name || filters.startDate || filters.endDate || filters.reviewStatus !== 'all';

  /**
   * Format date for input field (ISO date string to YYYY-MM-DD)
   */
  const formatDateForInput = (isoString?: string): string => {
    if (!isoString) return '';
    return isoString.split('T')[0];
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }} role="search" aria-label="Chat log filters">
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FilterList sx={{ mr: 1, color: 'primary.main' }} aria-hidden="true" />
          <Typography variant="h6" id="filters-heading">
            Filters
          </Typography>
          {hasActiveFilters && (
            <Button
              size="small"
              startIcon={<Clear />}
              onClick={onClearFilters}
              sx={{
                ml: 2,
                '&:focus-visible': {
                  outline: '2px solid',
                  outlineColor: 'primary.main',
                  outlineOffset: '2px',
                },
              }}
              aria-label="Clear all filters"
            >
              Clear Filters
            </Button>
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
          {/* Row 1: Carrier Name and Review Status */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 300px', minWidth: '200px' }}>
              <TextField
                fullWidth
                label="Carrier Name"
                placeholder="Filter by carrier..."
                value={filters.carrier_name || ''}
                onChange={handleCarrierChange}
                size="small"
                inputProps={{
                  'aria-label': 'Filter by carrier name',
                }}
              />
            </Box>
            <Box sx={{ flex: '1 1 300px', minWidth: '200px' }}>
              <TextField
                fullWidth
                select
                label="Review Status"
                value={filters.reviewStatus || 'all'}
                onChange={handleReviewStatusChange}
                size="small"
                inputProps={{
                  'aria-label': 'Filter by review status',
                }}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="reviewed">Reviewed</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </TextField>
            </Box>
          </Box>

          {/* Row 2: Date Range */}
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
