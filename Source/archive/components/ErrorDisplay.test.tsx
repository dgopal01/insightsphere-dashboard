/**
 * ErrorDisplay Component Tests
 * Tests error display with different error types
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
  ErrorDisplay,
  NetworkError,
  AuthenticationError,
  ValidationError,
  ServerError,
} from './ErrorDisplay';

describe('ErrorDisplay', () => {
  it('renders error message', () => {
    render(<ErrorDisplay error="Test error message" />);
    expect(screen.getByText(/Test error message/i)).toBeInTheDocument();
  });

  it('displays network error message', () => {
    render(<ErrorDisplay error="Network failed" type="network" />);
    expect(screen.getByText(/Unable to connect to the server/i)).toBeInTheDocument();
  });

  it('displays authentication error message', () => {
    render(<ErrorDisplay error="Auth failed" type="authentication" />);
    expect(screen.getByText(/session has expired/i)).toBeInTheDocument();
  });

  it('displays validation error message', () => {
    render(<ErrorDisplay error="Invalid input" type="validation" />);
    expect(screen.getByText(/Invalid input/i)).toBeInTheDocument();
  });

  it('displays server error message', () => {
    render(<ErrorDisplay error="Server error" type="server" />);
    expect(screen.getByText(/server encountered an error/i)).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    const onRetry = vi.fn();
    render(<ErrorDisplay error="Test error" onRetry={onRetry} />);

    const retryButton = screen.getByText('Retry');
    fireEvent.click(retryButton);

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    const onDismiss = vi.fn();
    render(<ErrorDisplay error="Test error" onDismiss={onDismiss} />);

    const dismissButton = screen.getByLabelText(/close/i);
    fireEvent.click(dismissButton);

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('renders full page error display', () => {
    render(<ErrorDisplay error="Test error" fullPage={true} />);
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('shows error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(<ErrorDisplay error={new Error('Detailed error')} showDetails={true} />);
    expect(screen.getByText(/Detailed error/i)).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });
});

describe('Specialized Error Components', () => {
  it('NetworkError renders with network type', () => {
    render(<NetworkError error="Connection failed" />);
    expect(screen.getByText(/Unable to connect to the server/i)).toBeInTheDocument();
  });

  it('AuthenticationError renders with authentication type', () => {
    render(<AuthenticationError error="Auth failed" />);
    expect(screen.getByText(/session has expired/i)).toBeInTheDocument();
  });

  it('ValidationError renders with validation type', () => {
    render(<ValidationError error="Invalid data" />);
    expect(screen.getByText(/Invalid data/i)).toBeInTheDocument();
  });

  it('ServerError renders with server type', () => {
    render(<ServerError error="Server error" />);
    expect(screen.getByText(/server encountered an error/i)).toBeInTheDocument();
  });
});
