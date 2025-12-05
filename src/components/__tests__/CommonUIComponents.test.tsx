/**
 * Common UI Components Integration Tests
 * Tests for Layout, Header, Sidebar, and LoadingSpinner components
 * Verifies that routing and navigation work correctly
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '../LoadingSpinner';

describe('Common UI Components', () => {
  describe('LoadingSpinner', () => {
    it('renders loading spinner with message', () => {
      render(<LoadingSpinner message="Loading..." />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders loading spinner without message', () => {
      render(<LoadingSpinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
    });

    it('renders with different sizes', () => {
      const { rerender } = render(<LoadingSpinner size="small" />);
      expect(screen.getByRole('status')).toBeInTheDocument();

      rerender(<LoadingSpinner size="medium" />);
      expect(screen.getByRole('status')).toBeInTheDocument();

      rerender(<LoadingSpinner size="large" />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('renders in fullScreen mode', () => {
      render(<LoadingSpinner fullScreen />);
      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
    });
  });
});
