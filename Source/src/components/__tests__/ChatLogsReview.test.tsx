/**
 * Tests for Chat Logs Review components
 * Requirements: 2.1, 2.2, 2.3, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChatLogsFilters } from '../ChatLogsFilters';
import type { ChatLogFilters } from '../../types';

describe('ChatLogsFilters', () => {
  it('renders filter controls', () => {
    const mockOnFilterChange = vi.fn();
    const mockOnClearFilters = vi.fn();
    const filters: ChatLogFilters = { reviewStatus: 'all' };

    render(
      <ChatLogsFilters
        filters={filters}
        onFilterChange={mockOnFilterChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by carrier name')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by review status')).toBeInTheDocument();
  });

  it('displays all filter options', () => {
    const mockOnFilterChange = vi.fn();
    const mockOnClearFilters = vi.fn();
    const filters: ChatLogFilters = { reviewStatus: 'all' };

    render(
      <ChatLogsFilters
        filters={filters}
        onFilterChange={mockOnFilterChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    // Check that date filters are present
    expect(screen.getByLabelText('Filter start date')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter end date')).toBeInTheDocument();
  });
});
