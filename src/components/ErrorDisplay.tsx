/**
 * ErrorDisplay Component
 * Displays user-friendly error messages with recovery options
 * Requirements: 2.5, 12.4
 */

import React from 'react';
import { Box, Alert, AlertTitle, Button, Typography } from '@mui/material';
import { Refresh, WifiOff, ErrorOutline, Lock } from '@mui/icons-material';

/**
 * Error types
 */
export type ErrorType = 'network' | 'authentication' | 'graphql' | 'validation' | 'application' | 'server' | 'unknown';

/**
 * Props for ErrorDisplay component
 */
export interface ErrorDisplayProps {
  error: Error | string;
  type?: ErrorType;
  onRetry?: () => void;
  onDismiss?: () => void;
  showDetails?: boolean;
  fullPage?: boolean;
}

/**
 * Get error icon based on type
 */
function getErrorIcon(type: ErrorType): React.ReactElement {
  switch (type) {
    case 'network':
      return <WifiOff />;
    case 'authentication':
      return <Lock />;
    default:
      return <ErrorOutline />;
  }
}

/**
 * Get user-friendly error message based on type
 */
function getUserFriendlyMessage(error: Error | string, type: ErrorType): string {
  const errorMessage = typeof error === 'string' ? error : error.message;

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
 * Get error title based on type
 */
function getErrorTitle(type: ErrorType): string {
  switch (type) {
    case 'network':
      return 'Connection Error';
    case 'authentication':
      return 'Authentication Error';
    case 'graphql':
      return 'Request Error';
    case 'validation':
      return 'Validation Error';
    case 'application':
      return 'Application Error';
    case 'server':
      return 'Server Error';
    default:
      return 'Error';
  }
}

/**
 * ErrorDisplay Component
 * Displays error messages with appropriate styling and recovery options
 */
export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  type = 'unknown',
  onRetry,
  onDismiss,
  showDetails = false,
  fullPage = false,
}) => {
  const errorMessage = getUserFriendlyMessage(error, type);
  const errorTitle = getErrorTitle(type);
  const errorDetails = typeof error === 'string' ? error : error.message;

  // Full page error display
  if (fullPage) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          p: 3,
        }}
      >
        <Box sx={{ maxWidth: 600, width: '100%', textAlign: 'center' }}>
          <Box sx={{ mb: 3 }}>
            {React.cloneElement(getErrorIcon(type), {
              sx: { fontSize: 80, color: 'error.main' },
            } as any)}
          </Box>

          <Typography variant="h5" gutterBottom color="error">
            {errorTitle}
          </Typography>

          <Typography variant="body1" color="text.secondary" paragraph>
            {errorMessage}
          </Typography>

          {showDetails && process.env.NODE_ENV === 'development' && (
            <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
              <Typography variant="caption" component="pre" sx={{ overflow: 'auto' }}>
                {errorDetails}
              </Typography>
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            {onRetry && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<Refresh />}
                onClick={onRetry}
                aria-label="Retry the failed operation"
                sx={{
                  '&:focus-visible': {
                    outline: '2px solid',
                    outlineColor: 'primary.main',
                    outlineOffset: '2px',
                  },
                }}
              >
                Try Again
              </Button>
            )}

            {onDismiss && (
              <Button
                variant="outlined"
                onClick={onDismiss}
                aria-label="Dismiss error message"
                sx={{
                  '&:focus-visible': {
                    outline: '2px solid',
                    outlineColor: 'primary.main',
                    outlineOffset: '2px',
                  },
                }}
              >
                Dismiss
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    );
  }

  // Inline error display (Alert)
  return (
    <Alert
      severity="error"
      icon={getErrorIcon(type)}
      onClose={onDismiss}
      action={
        onRetry && (
          <Button
            color="inherit"
            size="small"
            startIcon={<Refresh />}
            onClick={onRetry}
            aria-label="Retry the failed operation"
          >
            Retry
          </Button>
        )
      }
      sx={{ mb: 2 }}
      role="alert"
      aria-live="assertive"
    >
      <AlertTitle>{errorTitle}</AlertTitle>
      {errorMessage}

      {showDetails && process.env.NODE_ENV === 'development' && (
        <Typography variant="caption" component="pre" sx={{ mt: 1, overflow: 'auto' }}>
          {errorDetails}
        </Typography>
      )}
    </Alert>
  );
};

/**
 * NetworkError Component
 * Specialized error display for network errors
 */
export const NetworkError: React.FC<Omit<ErrorDisplayProps, 'type'>> = (props) => (
  <ErrorDisplay {...props} type="network" />
);

/**
 * AuthenticationError Component
 * Specialized error display for authentication errors
 */
export const AuthenticationError: React.FC<Omit<ErrorDisplayProps, 'type'>> = (props) => (
  <ErrorDisplay {...props} type="authentication" />
);

/**
 * ValidationError Component
 * Specialized error display for validation errors
 */
export const ValidationError: React.FC<Omit<ErrorDisplayProps, 'type'>> = (props) => (
  <ErrorDisplay {...props} type="validation" />
);

/**
 * ServerError Component
 * Specialized error display for server errors
 */
export const ServerError: React.FC<Omit<ErrorDisplayProps, 'type'>> = (props) => (
  <ErrorDisplay {...props} type="server" />
);
