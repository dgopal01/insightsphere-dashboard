/**
 * LoadingSpinner Component Tests
 * Tests for the reusable loading indicator component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-busy', 'true');
  });

  it('renders with custom message', () => {
    const message = 'Loading data...';
    render(<LoadingSpinner message={message} />);
    
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it('renders with small size', () => {
    render(<LoadingSpinner size="small" />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
  });

  it('renders with large size', () => {
    render(<LoadingSpinner size="large" />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
  });

  it('renders in fullScreen mode', () => {
    render(<LoadingSpinner fullScreen />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    const message = 'Loading content';
    render(<LoadingSpinner message={message} />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-live', 'polite');
    expect(spinner).toHaveAttribute('aria-busy', 'true');
  });
});
