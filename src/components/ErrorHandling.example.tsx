/**
 * Error Handling Examples
 * Demonstrates usage of error handling components and utilities
 */

import React, { useState } from 'react';
import { Box, Button, Stack, Typography, Paper } from '@mui/material';
import {
  ErrorBoundary,
  ErrorDisplay,
  NetworkError,
  AuthenticationError,
  ValidationError,
  ServerError,
} from './';
import { handleError, classifyError } from '../utils';

/**
 * Component that throws an error for testing ErrorBoundary
 */
const ErrorThrowingComponent: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('This is a test error from ErrorThrowingComponent');
  }
  return <Typography>Component is working normally</Typography>;
};

/**
 * Example demonstrating ErrorBoundary usage
 */
export const ErrorBoundaryExample: React.FC = () => {
  const [throwError, setThrowError] = useState(false);

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        ErrorBoundary Example
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Click the button to trigger an error and see the ErrorBoundary in action.
      </Typography>

      <Button variant="contained" color="error" onClick={() => setThrowError(true)} sx={{ mb: 2 }}>
        Trigger Error
      </Button>

      <ErrorBoundary
        onError={(error, errorInfo) => {
          console.log('Error caught by boundary:', error);
          console.log('Component stack:', errorInfo.componentStack);
        }}
        onReset={() => setThrowError(false)}
      >
        <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          <ErrorThrowingComponent shouldThrow={throwError} />
        </Box>
      </ErrorBoundary>
    </Paper>
  );
};

/**
 * Example demonstrating different error types
 */
export const ErrorDisplayExample: React.FC = () => {
  const [showError, setShowError] = useState<string | null>(null);

  const handleRetry = () => {
    console.log('Retry clicked');
    setShowError(null);
  };

  const handleDismiss = () => {
    console.log('Dismiss clicked');
    setShowError(null);
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        ErrorDisplay Examples
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Click buttons to see different error types displayed.
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }} flexWrap="wrap">
        <Button variant="outlined" onClick={() => setShowError('network')}>
          Network Error
        </Button>
        <Button variant="outlined" onClick={() => setShowError('authentication')}>
          Auth Error
        </Button>
        <Button variant="outlined" onClick={() => setShowError('validation')}>
          Validation Error
        </Button>
        <Button variant="outlined" onClick={() => setShowError('server')}>
          Server Error
        </Button>
        <Button variant="outlined" onClick={() => setShowError('unknown')}>
          Unknown Error
        </Button>
      </Stack>

      {showError === 'network' && (
        <NetworkError
          error="Failed to connect to the server"
          onRetry={handleRetry}
          onDismiss={handleDismiss}
        />
      )}

      {showError === 'authentication' && (
        <AuthenticationError
          error="Your session has expired"
          onRetry={handleRetry}
          onDismiss={handleDismiss}
        />
      )}

      {showError === 'validation' && (
        <ValidationError
          error="Please enter a valid email address"
          onRetry={handleRetry}
          onDismiss={handleDismiss}
        />
      )}

      {showError === 'server' && (
        <ServerError
          error="Internal server error occurred"
          onRetry={handleRetry}
          onDismiss={handleDismiss}
        />
      )}

      {showError === 'unknown' && (
        <ErrorDisplay
          error="An unexpected error occurred"
          type="unknown"
          onRetry={handleRetry}
          onDismiss={handleDismiss}
        />
      )}
    </Paper>
  );
};

/**
 * Example demonstrating error handling utilities
 */
export const ErrorUtilitiesExample: React.FC = () => {
  const [result, setResult] = useState<string>('');

  const testErrorClassification = () => {
    const errors = [
      new Error('Network timeout'),
      new Error('Unauthorized access'),
      new Error('Invalid input format'),
      new Error('Internal server error'),
      new Error('Something went wrong'),
    ];

    const results = errors.map((error) => {
      const type = classifyError(error);
      const errorInfo = handleError(error, { source: 'example' });
      return `${error.message} → ${type} (${errorInfo.severity})`;
    });

    setResult(results.join('\n'));
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Error Utilities Example
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Test error classification and handling utilities.
      </Typography>

      <Button variant="contained" onClick={testErrorClassification} sx={{ mb: 2 }}>
        Test Error Classification
      </Button>

      {result && (
        <Box
          component="pre"
          sx={{
            p: 2,
            bgcolor: 'background.default',
            borderRadius: 1,
            overflow: 'auto',
            fontSize: '0.875rem',
          }}
        >
          {result}
        </Box>
      )}
    </Paper>
  );
};

/**
 * Full page error example
 */
export const FullPageErrorExample: React.FC = () => {
  const [showFullPage, setShowFullPage] = useState(false);

  if (showFullPage) {
    return (
      <ErrorDisplay
        error="This is a full page error display"
        type="server"
        fullPage={true}
        onRetry={() => setShowFullPage(false)}
      />
    );
  }

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Full Page Error Example
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Click to see a full page error display.
      </Typography>

      <Button variant="contained" onClick={() => setShowFullPage(true)}>
        Show Full Page Error
      </Button>
    </Paper>
  );
};

/**
 * Combined example page
 */
export const ErrorHandlingExamples: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Error Handling Examples
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Examples demonstrating the error handling system.
      </Typography>

      <ErrorBoundaryExample />
      <ErrorDisplayExample />
      <ErrorUtilitiesExample />
      <FullPageErrorExample />
    </Box>
  );
};
