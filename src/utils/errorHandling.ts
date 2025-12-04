/**
 * Error Handling Utilities
 * Provides error classification, logging, and user-friendly message generation
 * Requirements: 2.5, 12.4
 */

import { APIError } from '../services/APIService';

/**
 * Error types for classification
 */
export type ErrorType = 'network' | 'authentication' | 'validation' | 'server' | 'unknown';

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
 * Classify error based on its characteristics
 */
export function classifyError(error: unknown): ErrorType {
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
 */
export function getUserFriendlyMessage(error: unknown, type: ErrorType): string {
  const errorMessage = error instanceof Error ? error.message : String(error);

  switch (type) {
    case 'network':
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    case 'authentication':
      return 'Your session has expired or you do not have permission to access this resource. Please sign in again.';
    case 'validation':
      return errorMessage || 'The information you provided is invalid. Please check your input and try again.';
    case 'server':
      return 'The server encountered an error while processing your request. Please try again later.';
    default:
      return errorMessage || 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Create structured error information
 */
export function createErrorInfo(
  error: unknown,
  context?: Record<string, any>
): ErrorInfo {
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
      error: errorInfo.originalError instanceof Error ? {
        name: errorInfo.originalError.name,
        message: errorInfo.originalError.message,
        stack: errorInfo.originalError.stack,
      } : errorInfo.originalError,
    });

    // TODO: Integrate with error tracking service
    // Example: Sentry.captureException(errorInfo.originalError, { extra: errorInfo });
    // Example: CloudWatch.putMetricData({ ... });
  }
}

/**
 * Handle error with logging and return structured error info
 */
export function handleError(
  error: unknown,
  context?: Record<string, any>
): ErrorInfo {
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
