/**
 * Error Handling Utilities
 * Provides error classification, logging, and user-friendly message generation
 * Requirements: 2.5, 12.4
 */

import { APIError } from '../services/APIService';

/**
 * Error types for classification
 */
export type ErrorType = 'network' | 'authentication' | 'graphql' | 'validation' | 'application' | 'server' | 'unknown';

/**
 * Error severity levels
 */
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Structured error information
 */
export interface ErrorInfo {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  originalError: Error | unknown;
  timestamp: string;
  context?: Record<string, any>;
}

/**
 * Check if error is a GraphQL error
 */
function isGraphQLError(error: unknown): boolean {
  if (typeof error === 'object' && error !== null) {
    // Check for GraphQL error structure
    return (
      'graphQLErrors' in error ||
      'networkError' in error ||
      ('errors' in error && Array.isArray((error as any).errors))
    );
  }
  return false;
}

/**
 * Classify error based on its characteristics
 * Requirements: 11.1, 11.2, 11.3
 */
export function classifyError(error: unknown): ErrorType {
  // Handle GraphQL errors
  if (isGraphQLError(error)) {
    return 'graphql';
  }

  // Handle APIError instances
  if (error instanceof APIError) {
    if (error.statusCode === 401 || error.statusCode === 403) {
      return 'authentication';
    }
    if (error.statusCode === 400 || error.statusCode === 422) {
      return 'validation';
    }
    if (error.statusCode && error.statusCode >= 500) {
      return 'server';
    }
  }

  // Handle standard Error instances
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Network errors
    if (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('connection') ||
      message.includes('fetch') ||
      message.includes('offline')
    ) {
      return 'network';
    }

    // Authentication errors
    if (
      message.includes('unauthorized') ||
      message.includes('authentication') ||
      message.includes('token') ||
      message.includes('session') ||
      message.includes('permission')
    ) {
      return 'authentication';
    }

    // Validation errors
    if (
      message.includes('validation') ||
      message.includes('invalid') ||
      message.includes('required') ||
      message.includes('format')
    ) {
      return 'validation';
    }

    // Server errors
    if (
      message.includes('server') ||
      message.includes('internal') ||
      message.includes('500') ||
      message.includes('503')
    ) {
      return 'server';
    }

    // Application errors (React errors, component errors, etc.)
    if (
      message.includes('react') ||
      message.includes('component') ||
      message.includes('render') ||
      message.includes('hook')
    ) {
      return 'application';
    }
  }

  return 'unknown';
}

/**
 * Determine error severity
 */
export function getErrorSeverity(error: unknown, type: ErrorType): ErrorSeverity {
  // Authentication errors are high severity
  if (type === 'authentication') {
    return 'high';
  }

  // Server errors are medium to high severity
  if (type === 'server') {
    if (error instanceof APIError && error.statusCode === 500) {
      return 'high';
    }
    return 'medium';
  }

  // Network errors are medium severity
  if (type === 'network') {
    return 'medium';
  }

  // Validation errors are low severity
  if (type === 'validation') {
    return 'low';
  }

  // Unknown errors are medium severity by default
  return 'medium';
}

/**
 * Get user-friendly error message
 * Requirements: 11.1, 11.2, 11.3, 11.4, 11.5
 */
export function getUserFriendlyMessage(error: unknown, type: ErrorType): string {
  const errorMessage = error instanceof Error ? error.message : String(error);

  switch (type) {
    case 'network':
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    case 'authentication':
      return 'Your session has expired or you do not have permission to access this resource. Please sign in again.';
    case 'graphql':
      return 'There was an error processing your request. Please try again.';
    case 'validation':
      return (
        errorMessage ||
        'The information you provided is invalid. Please check your input and try again.'
      );
    case 'application':
      return 'The application encountered an error. Please refresh the page and try again.';
    case 'server':
      return 'The server encountered an error while processing your request. Please try again later.';
    default:
      return errorMessage || 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Create structured error information
 */
export function createErrorInfo(error: unknown, context?: Record<string, any>): ErrorInfo {
  const type = classifyError(error);
  const severity = getErrorSeverity(error, type);
  const message = getUserFriendlyMessage(error, type);

  return {
    type,
    severity,
    message,
    originalError: error,
    timestamp: new Date().toISOString(),
    context,
  };
}

/**
 * Log error to console in development or to error service in production
 */
export function logError(errorInfo: ErrorInfo): void {
  if (import.meta.env.MODE === 'development') {
    // Log to console in development with color coding
    const severityColors: Record<ErrorSeverity, string> = {
      low: 'color: #FFA726',
      medium: 'color: #FF7043',
      high: 'color: #EF5350',
      critical: 'color: #D32F2F; font-weight: bold',
    };

    console.group(
      `%c[${errorInfo.severity.toUpperCase()}] ${errorInfo.type} Error`,
      severityColors[errorInfo.severity]
    );
    console.error('Message:', errorInfo.message);
    console.error('Timestamp:', errorInfo.timestamp);
    if (errorInfo.context) {
      console.error('Context:', errorInfo.context);
    }
    console.error('Original Error:', errorInfo.originalError);
    console.groupEnd();
  } else {
    // In production, send to error tracking service
    // For now, we'll just log to console, but this should be replaced
    // with actual error tracking service integration (e.g., Sentry, CloudWatch)
    console.error('Production error:', {
      type: errorInfo.type,
      severity: errorInfo.severity,
      message: errorInfo.message,
      timestamp: errorInfo.timestamp,
      context: errorInfo.context,
      error:
        errorInfo.originalError instanceof Error
          ? {
              name: errorInfo.originalError.name,
              message: errorInfo.originalError.message,
              stack: errorInfo.originalError.stack,
            }
          : errorInfo.originalError,
    });

    // TODO: Integrate with error tracking service
    // Example: Sentry.captureException(errorInfo.originalError, { extra: errorInfo });
    // Example: CloudWatch.putMetricData({ ... });
  }
}

/**
 * Handle error with logging and return structured error info
 */
export function handleError(error: unknown, context?: Record<string, any>): ErrorInfo {
  const errorInfo = createErrorInfo(error, context);
  logError(errorInfo);
  return errorInfo;
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  const type = classifyError(error);

  // Network and server errors are typically retryable
  if (type === 'network' || type === 'server') {
    return true;
  }

  // Check for specific retryable status codes
  if (error instanceof APIError) {
    // 408 Request Timeout, 429 Too Many Requests, 503 Service Unavailable
    return error.statusCode === 408 || error.statusCode === 429 || error.statusCode === 503;
  }

  return false;
}

/**
 * Get retry delay based on attempt number (exponential backoff)
 */
export function getRetryDelay(attempt: number, baseDelay: number = 1000): number {
  const maxDelay = 10000; // 10 seconds
  const delay = baseDelay * Math.pow(2, attempt);
  return Math.min(delay, maxDelay);
}

/**
 * Format error for display
 */
export function formatErrorForDisplay(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}

/**
 * Retry options for retry logic
 */
export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  onRetry?: (attempt: number, error: unknown) => void;
  shouldRetry?: (error: unknown) => boolean;
}

/**
 * Default retry options
 */
const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  onRetry: () => {},
  shouldRetry: isRetryableError,
};

/**
 * Retry a function with exponential backoff
 * Requirements: 11.1, 11.2, 11.3, 11.4, 11.5
 * 
 * @param fn - The async function to retry
 * @param options - Retry configuration options
 * @returns Promise that resolves with the function result or rejects with the last error
 * 
 * @example
 * const result = await retryWithBackoff(
 *   () => fetchData(),
 *   { maxAttempts: 3, baseDelay: 1000 }
 * );
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: unknown;

  for (let attempt = 0; attempt < opts.maxAttempts; attempt++) {
    try {
      // Try to execute the function
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if we should retry this error
      if (!opts.shouldRetry(error)) {
        throw error;
      }

      // Check if we've exhausted all attempts
      if (attempt === opts.maxAttempts - 1) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        opts.baseDelay * Math.pow(2, attempt),
        opts.maxDelay
      );

      // Call retry callback
      opts.onRetry(attempt + 1, error);

      // Log retry attempt
      if (import.meta.env.MODE === 'development') {
        console.warn(
          `Retry attempt ${attempt + 1}/${opts.maxAttempts} after ${delay}ms`,
          error
        );
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError;
}

/**
 * Create a retryable version of an async function
 * 
 * @param fn - The async function to make retryable
 * @param options - Retry configuration options
 * @returns A new function that retries on failure
 * 
 * @example
 * const retryableFetch = createRetryable(fetchData, { maxAttempts: 3 });
 * const result = await retryableFetch();
 */
export function createRetryable<TArgs extends any[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  options: RetryOptions = {}
): (...args: TArgs) => Promise<TReturn> {
  return (...args: TArgs) => retryWithBackoff(() => fn(...args), options);
}
