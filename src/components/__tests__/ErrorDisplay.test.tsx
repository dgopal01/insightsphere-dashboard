/**
 * ErrorDisplay Component Tests
 * Tests error message display and recovery options
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  ErrorDisplay,
  NetworkError,
  AuthenticationError,
  ValidationError,
  ServerError,
} from '../ErrorDisplay';

describe('ErrorDisplay', () => {
  it('renders error message', () => {
    render(<ErrorDisplay error={new Error('Test error')} />);
    expect(screen.getByText(/unexpected error occurred/i)).toBeInTheDocument();
  });

  it('renders network error with appropriate message', () => {
    render(<ErrorDisplay error={new Error('Network failed')} type="network" />);
    expect(screen.getByText(/unable to connect to the server/i)).toBeInTheDocument();
  });

  it('renders authentication error with appropriate message', () => {
    render(<ErrorDisplay error={new Error('Unauthorized')} type="authentication" />);
    expect(screen.getByText(/session has expired/i)).toBeInTheDocument();
  });

  it('renders GraphQL error with appropriate message', () => {
    render(<ErrorDisplay error={new Error('GraphQL error')} type="graphql" />);
    expect(screen.getByText(/error processing your request/i)).toBeInTheDocument();
  });

  it('renders validation error with custom message', () => {
    render(<ErrorDisplay error={new Error('Invalid email')} type="validation" />);
    expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
  });

  it('renders server error with appropriate message', () => {
    render(<ErrorDisplay error={new Error('Server error')} type="server" />);
    expect(screen.getByText(/server encountered an error/i)).toBeInTheDocument();
  });

  it('displays retry button when onRetry is provided', () => {
    const onRetry = vi.fn();
    render(<ErrorDisplay error={new Error('Test error')} onRetry={onRetry} />);
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(<ErrorDisplay error={new Error('Test error')} onRetry={onRetry} />);

    const retryButton = screen.getByRole('button', { name: /retry/i });
    await user.click(retryButton);

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('displays dismiss button when onDismiss is provided', () => {
    const onDismiss = vi.fn();
    render(<ErrorDisplay error={new Error('Test error')} onDismiss={onDismiss} />);
    expect(screen.getByLabelText(/dismiss/i)).toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();

    render(<ErrorDisplay error={new Error('Test error')} onDismiss={onDismiss} />);

    const dismissButton = screen.getByLabelText(/dismiss/i);
    await user.click(dismissButton);

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('renders full page error display when fullPage is true', () => {
    render(<ErrorDisplay error={new Error('Test error')} fullPage={true} />);
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });

  it('renders inline error display by default', () => {
    const { container } = render(<ErrorDisplay error={new Error('Test error')} />);
    const alert = container.querySelector('[role="alert"]');
    expect(alert).toBeInTheDocument();
  });

  it('shows error details in development mode when showDetails is true', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(<ErrorDisplay error={new Error('Detailed error')} showDetails={true} />);
    expect(screen.getByText(/detailed error/i)).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('handles string errors', () => {
    render(<ErrorDisplay error="String error message" />);
    expect(screen.getByText(/string error message/i)).toBeInTheDocument();
  });
});

describe('NetworkError', () => {
  it('renders network error with correct type', () => {
    render(<NetworkError error={new Error('Network failed')} />);
    expect(screen.getByText(/unable to connect to the server/i)).toBeInTheDocument();
  });
});

describe('AuthenticationError', () => {
  it('renders authentication error with correct type', () => {
    render(<AuthenticationError error={new Error('Unauthorized')} />);
    expect(screen.getByText(/session has expired/i)).toBeInTheDocument();
  });
});

describe('ValidationError', () => {
  it('renders validation error with correct type', () => {
    render(<ValidationError error={new Error('Invalid input')} />);
    expect(screen.getByText(/invalid input/i)).toBeInTheDocument();
  });
});

describe('ServerError', () => {
  it('renders server error with correct type', () => {
    render(<ServerError error={new Error('Server error')} />);
    expect(screen.getByText(/server encountered an error/i)).toBeInTheDocument();
  });
});
