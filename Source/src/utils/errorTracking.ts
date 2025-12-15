/**
 * Error Tracking Utilities
 * Integrates with Sentry for error monitoring
 * Requirement 9.3: Configure error tracking
 */

import * as Sentry from '@sentry/react';

/**
 * Error severity levels
 */
export type ErrorSeverity = 'fatal' | 'error' | 'warning' | 'info' | 'debug';

/**
 * Error context interface
 */
export interface ErrorContext {
  user?: {
    id: string;
    email?: string;
    username?: string;
  };
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
}

/**
 * Initialize error tracking
 * Requirement 9.3: Configure error tracking (Sentry)
 */
export const initErrorTracking = () => {
  // Only initialize in production or if explicitly enabled
  if (
    import.meta.env.MODE === 'production' ||
    import.meta.env.VITE_ENABLE_ERROR_TRACKING === 'true'
  ) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE || 'development',
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      // Performance Monitoring
      tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
      // Session Replay
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      // Release tracking
      release: import.meta.env.VITE_APP_VERSION || 'unknown',
      // Ignore common errors
      ignoreErrors: [
        'ResizeObserver loop limit exceeded',
        'Non-Error promise rejection captured',
        'Network request failed',
      ],
      beforeSend(event, hint) {
        // Filter out sensitive information
        if (event.request?.headers) {
          delete event.request.headers['Authorization'];
          delete event.request.headers['Cookie'];
        }

        // Add custom processing
        if (hint.originalException instanceof Error) {
          console.error('[Error Tracking]', hint.originalException);
        }

        return event;
      },
    });

    console.log('[Error Tracking] Sentry initialized');
  } else {
    console.log('[Error Tracking] Disabled in development mode');
  }
};

/**
 * Capture an error
 * Requirement 9.3: Error tracking
 */
export const captureError = (
  error: Error,
  context?: ErrorContext,
  severity: ErrorSeverity = 'error'
) => {
  // Log to console in development
  if (import.meta.env.MODE === 'development') {
    console.error('[Error]', error, context);
  }

  // Send to Sentry
  Sentry.withScope((scope) => {
    // Set severity
    scope.setLevel(severity);

    // Set user context
    if (context?.user) {
      scope.setUser(context.user);
    }

    // Set tags
    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }

    // Set extra context
    if (context?.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }

    // Capture the error
    Sentry.captureException(error);
  });
};

/**
 * Capture a message
 */
export const captureMessage = (
  message: string,
  context?: ErrorContext,
  severity: ErrorSeverity = 'info'
) => {
  if (import.meta.env.MODE === 'development') {
    console.log(`[${severity.toUpperCase()}]`, message, context);
  }

  Sentry.withScope((scope) => {
    scope.setLevel(severity);

    if (context?.user) {
      scope.setUser(context.user);
    }

    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }

    if (context?.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }

    Sentry.captureMessage(message, severity);
  });
};

/**
 * Set user context for error tracking
 */
export const setUserContext = (user: ErrorContext['user'] | undefined) => {
  if (user) {
    Sentry.setUser(user);
  } else {
    Sentry.setUser(null);
  }
};

/**
 * Add breadcrumb for debugging
 */
export const addBreadcrumb = (
  message: string,
  category: string,
  data?: Record<string, unknown>
) => {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
    timestamp: Date.now() / 1000,
  });
};

/**
 * Start a performance transaction
 */
export const startTransaction = (name: string, op: string) => {
  return Sentry.startSpan(
    {
      name,
      op,
    },
    () => {
      // Transaction logic here
    }
  );
};

/**
 * Wrap component with error boundary
 */
export const withErrorBoundary = Sentry.withErrorBoundary;
