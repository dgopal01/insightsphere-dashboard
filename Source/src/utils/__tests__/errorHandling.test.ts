/**
 * Error Handling Utilities Tests
 * Tests error classification, logging, and message generation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  classifyError,
  getErrorSeverity,
  getUserFriendlyMessage,
  createErrorInfo,
  isRetryableError,
  getRetryDelay,
  formatErrorForDisplay,
  retryWithBackoff,
  createRetryable,
} from '../errorHandling';
import { APIError } from '../../services/APIService';

describe('classifyError', () => {
  it('classifies network errors', () => {
    const error = new Error('Network request failed');
    expect(classifyError(error)).toBe('network');
  });

  it('classifies authentication errors', () => {
    const error = new Error('Unauthorized access');
    expect(classifyError(error)).toBe('authentication');
  });

  it('classifies validation errors', () => {
    const error = new Error('Invalid input format');
    expect(classifyError(error)).toBe('validation');
  });

  it('classifies server errors', () => {
    const error = new Error('Internal server error');
    expect(classifyError(error)).toBe('server');
  });

  it('classifies APIError with 401 status as authentication', () => {
    const error = new APIError('Unauthorized', 401);
    expect(classifyError(error)).toBe('authentication');
  });

  it('classifies APIError with 400 status as validation', () => {
    const error = new APIError('Bad request', 400);
    expect(classifyError(error)).toBe('validation');
  });

  it('classifies APIError with 500 status as server', () => {
    const error = new APIError('Server error', 500);
    expect(classifyError(error)).toBe('server');
  });

  it('classifies GraphQL errors', () => {
    const error = { graphQLErrors: [{ message: 'GraphQL error' }] };
    expect(classifyError(error)).toBe('graphql');
  });

  it('classifies application errors', () => {
    const error = new Error('React component error');
    expect(classifyError(error)).toBe('application');
  });

  it('classifies unknown errors', () => {
    const error = new Error('Something went wrong');
    expect(classifyError(error)).toBe('unknown');
  });
});

describe('getErrorSeverity', () => {
  it('returns high severity for authentication errors', () => {
    const error = new Error('Unauthorized');
    expect(getErrorSeverity(error, 'authentication')).toBe('high');
  });

  it('returns medium severity for network errors', () => {
    const error = new Error('Network failed');
    expect(getErrorSeverity(error, 'network')).toBe('medium');
  });

  it('returns low severity for validation errors', () => {
    const error = new Error('Invalid input');
    expect(getErrorSeverity(error, 'validation')).toBe('low');
  });

  it('returns high severity for 500 server errors', () => {
    const error = new APIError('Server error', 500);
    expect(getErrorSeverity(error, 'server')).toBe('high');
  });

  it('returns medium severity for unknown errors', () => {
    const error = new Error('Unknown error');
    expect(getErrorSeverity(error, 'unknown')).toBe('medium');
  });
});

describe('getUserFriendlyMessage', () => {
  it('returns network error message', () => {
    const error = new Error('Network failed');
    const message = getUserFriendlyMessage(error, 'network');
    expect(message).toContain('Unable to connect to the server');
  });

  it('returns authentication error message', () => {
    const error = new Error('Unauthorized');
    const message = getUserFriendlyMessage(error, 'authentication');
    expect(message).toContain('session has expired');
  });

  it('returns GraphQL error message', () => {
    const error = new Error('GraphQL error');
    const message = getUserFriendlyMessage(error, 'graphql');
    expect(message).toContain('error processing your request');
  });

  it('returns validation error message with original message', () => {
    const error = new Error('Invalid email format');
    const message = getUserFriendlyMessage(error, 'validation');
    expect(message).toContain('Invalid email format');
  });

  it('returns application error message', () => {
    const error = new Error('Application error');
    const message = getUserFriendlyMessage(error, 'application');
    expect(message).toContain('application encountered an error');
  });

  it('returns server error message', () => {
    const error = new Error('Server error');
    const message = getUserFriendlyMessage(error, 'server');
    expect(message).toContain('server encountered an error');
  });

  it('returns generic message for unknown errors', () => {
    const error = new Error('Something went wrong');
    const message = getUserFriendlyMessage(error, 'unknown');
    expect(message).toContain('Something went wrong');
  });
});

describe('createErrorInfo', () => {
  it('creates error info with all fields', () => {
    const error = new Error('Test error');
    const context = { userId: '123', action: 'test' };
    const errorInfo = createErrorInfo(error, context);

    expect(errorInfo.type).toBeDefined();
    expect(errorInfo.severity).toBeDefined();
    expect(errorInfo.message).toBeDefined();
    expect(errorInfo.originalError).toBe(error);
    expect(errorInfo.timestamp).toBeDefined();
    expect(errorInfo.context).toEqual(context);
  });

  it('creates error info without context', () => {
    const error = new Error('Test error');
    const errorInfo = createErrorInfo(error);

    expect(errorInfo.context).toBeUndefined();
  });
});

describe('isRetryableError', () => {
  it('returns true for network errors', () => {
    const error = new Error('Network timeout');
    expect(isRetryableError(error)).toBe(true);
  });

  it('returns true for server errors', () => {
    const error = new Error('Internal server error');
    expect(isRetryableError(error)).toBe(true);
  });

  it('returns false for authentication errors', () => {
    const error = new Error('Unauthorized');
    expect(isRetryableError(error)).toBe(false);
  });

  it('returns false for validation errors', () => {
    const error = new Error('Invalid input');
    expect(isRetryableError(error)).toBe(false);
  });

  it('returns true for APIError with 503 status', () => {
    const error = new APIError('Service unavailable', 503);
    expect(isRetryableError(error)).toBe(true);
  });

  it('returns true for APIError with 429 status', () => {
    const error = new APIError('Too many requests', 429);
    expect(isRetryableError(error)).toBe(true);
  });

  it('returns false for APIError with 400 status', () => {
    const error = new APIError('Bad request', 400);
    expect(isRetryableError(error)).toBe(false);
  });
});

describe('getRetryDelay', () => {
  it('calculates exponential backoff delay', () => {
    expect(getRetryDelay(0, 1000)).toBe(1000);
    expect(getRetryDelay(1, 1000)).toBe(2000);
    expect(getRetryDelay(2, 1000)).toBe(4000);
    expect(getRetryDelay(3, 1000)).toBe(8000);
  });

  it('caps delay at maximum', () => {
    expect(getRetryDelay(10, 1000)).toBe(10000);
  });

  it('uses default base delay', () => {
    expect(getRetryDelay(0)).toBe(1000);
  });
});

describe('formatErrorForDisplay', () => {
  it('formats Error instance', () => {
    const error = new Error('Test error');
    expect(formatErrorForDisplay(error)).toBe('Test error');
  });

  it('formats string error', () => {
    expect(formatErrorForDisplay('String error')).toBe('String error');
  });

  it('formats unknown error', () => {
    expect(formatErrorForDisplay({ unknown: 'error' })).toBe('An unexpected error occurred');
  });
});

describe('retryWithBackoff', () => {
  it('succeeds on first attempt', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    const result = await retryWithBackoff(fn);
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on retryable error and eventually succeeds', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('Network timeout'))
      .mockRejectedValueOnce(new Error('Network timeout'))
      .mockResolvedValue('success');

    const result = await retryWithBackoff(fn, { maxAttempts: 3, baseDelay: 10 });
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('throws error after max attempts', async () => {
    const error = new Error('Network timeout');
    const fn = vi.fn().mockRejectedValue(error);

    await expect(retryWithBackoff(fn, { maxAttempts: 3, baseDelay: 10 })).rejects.toThrow(
      'Network timeout'
    );
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('does not retry non-retryable errors', async () => {
    const error = new Error('Invalid input');
    const fn = vi.fn().mockRejectedValue(error);

    await expect(retryWithBackoff(fn, { maxAttempts: 3, baseDelay: 10 })).rejects.toThrow(
      'Invalid input'
    );
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('calls onRetry callback on each retry', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('Network timeout'))
      .mockResolvedValue('success');

    const onRetry = vi.fn();
    await retryWithBackoff(fn, { maxAttempts: 3, baseDelay: 10, onRetry });

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error));
  });

  it('uses custom shouldRetry function', async () => {
    const error = new Error('Custom error');
    const fn = vi.fn().mockRejectedValue(error);
    const shouldRetry = vi.fn().mockReturnValue(false);

    await expect(
      retryWithBackoff(fn, { maxAttempts: 3, baseDelay: 10, shouldRetry })
    ).rejects.toThrow('Custom error');

    expect(fn).toHaveBeenCalledTimes(1);
    expect(shouldRetry).toHaveBeenCalledWith(error);
  });

  it('respects maxDelay cap', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('Network timeout'))
      .mockResolvedValue('success');

    const onRetry = vi.fn();
    await retryWithBackoff(fn, {
      maxAttempts: 3,
      baseDelay: 1000,
      maxDelay: 500,
      onRetry,
    });

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe('createRetryable', () => {
  it('creates a retryable function', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('Network timeout'))
      .mockResolvedValue('success');

    const retryableFn = createRetryable(fn, { maxAttempts: 3, baseDelay: 10 });
    const result = await retryableFn();

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('passes arguments to the original function', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    const retryableFn = createRetryable(fn, { maxAttempts: 3, baseDelay: 10 });

    await retryableFn('arg1', 'arg2');
    expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('retries with arguments', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('Network timeout'))
      .mockResolvedValue('success');

    const retryableFn = createRetryable(fn, { maxAttempts: 3, baseDelay: 10 });
    await retryableFn('test');

    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenNthCalledWith(1, 'test');
    expect(fn).toHaveBeenNthCalledWith(2, 'test');
  });
});
