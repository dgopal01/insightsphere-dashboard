/**
 * ErrorDisplay Component
 * Displays error messages with appropriate styling and actions
 */

import React from 'react';
import { AlertCircle, WifiOff, Lock, RefreshCw, Server, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';

export type ErrorType = 'network' | 'authentication' | 'graphql' | 'validation' | 'application' | 'server' | 'unknown';

export interface ErrorDisplayProps {
  error: Error | string;
  type?: ErrorType;
  onRetry?: () => void;
  showDetails?: boolean;
  className?: string;
}

/**
 * ErrorDisplay component for showing error messages
 */
export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  error, 
  type, 
  onRetry, 
  showDetails = false,
  className 
}) => {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorStack = typeof error === 'string' ? undefined : error.stack;
  
  // Determine error type if not provided
  const errorType = type || (
    errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('fetch') 
      ? 'network'
      : errorMessage.toLowerCase().includes('auth') || errorMessage.toLowerCase().includes('unauthorized')
      ? 'authentication'
      : errorMessage.toLowerCase().includes('server')
      ? 'server'
      : 'unknown'
  );

  const Icon = errorType === 'network' ? WifiOff 
    : errorType === 'authentication' ? Lock 
    : errorType === 'server' ? Server
    : errorType === 'validation' ? AlertTriangle
    : AlertCircle;

  return (
    <Alert variant="destructive" className={className}>
      <Icon className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription className="space-y-2">
        <div className="flex items-center justify-between">
          <span>{errorMessage}</span>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="ml-4 gap-2"
            >
              <RefreshCw className="h-3 w-3" />
              Retry
            </Button>
          )}
        </div>
        {showDetails && errorStack && (
          <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-32">
            {errorStack}
          </pre>
        )}
      </AlertDescription>
    </Alert>
  );
};

// Convenience components for specific error types
export const NetworkError: React.FC<Omit<ErrorDisplayProps, 'error'>> = (props) => (
  <ErrorDisplay error="Network error. Please check your connection and try again." {...props} />
);

export const AuthenticationError: React.FC<Omit<ErrorDisplayProps, 'error'>> = (props) => (
  <ErrorDisplay error="Authentication failed. Please sign in again." {...props} />
);

export const ValidationError: React.FC<{ message: string } & Omit<ErrorDisplayProps, 'error'>> = ({ 
  message, 
  ...props 
}) => (
  <ErrorDisplay error={`Validation error: ${message}`} {...props} />
);

export const ServerError: React.FC<Omit<ErrorDisplayProps, 'error'>> = (props) => (
  <ErrorDisplay error="Server error. Please try again later." {...props} />
);
