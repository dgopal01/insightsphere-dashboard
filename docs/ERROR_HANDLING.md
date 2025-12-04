# Error Handling System

This document describes the comprehensive error handling system implemented in InsightSphere.

## Overview

The error handling system provides:
- **ErrorBoundary**: React component for catching and handling React errors
- **ErrorDisplay**: User-friendly error display components
- **Error Utilities**: Classification, logging, and message generation
- **Network Retry Logic**: Automatic retry with exponential backoff (in APIService)

## Components

### ErrorBoundary

A React Error Boundary component that catches errors in child components and displays a fallback UI.

**Features:**
- Catches React component errors
- Displays user-friendly error UI
- Provides recovery options (Try Again, Go Home, Reload)
- Logs errors to console (dev) or error service (prod)
- Supports custom fallback UI
- Calls optional error handler callback

**Usage:**

```tsx
import { ErrorBoundary } from './components';

<ErrorBoundary
  onError={(error, errorInfo) => {
    // Custom error handling
    console.log('Error:', error);
  }}
  onReset={() => {
    // Custom reset logic
  }}
>
  <YourComponent />
</ErrorBoundary>
```

**Custom Fallback:**

```tsx
<ErrorBoundary fallback={<CustomErrorUI />}>
  <YourComponent />
</ErrorBoundary>
```

### ErrorDisplay

A flexible error display component that shows user-friendly error messages with recovery options.

**Features:**
- Displays errors inline or full-page
- Classifies errors by type (network, authentication, validation, server, unknown)
- Shows appropriate icons and messages
- Provides retry and dismiss actions
- Shows error details in development mode

**Error Types:**
- `network`: Connection and network errors
- `authentication`: Auth and permission errors
- `validation`: Input validation errors
- `server`: Server-side errors
- `unknown`: Unclassified errors

**Usage:**

```tsx
import { ErrorDisplay } from './components';

// Basic usage
<ErrorDisplay
  error={error}
  type="network"
  onRetry={handleRetry}
  onDismiss={handleDismiss}
/>

// Full page error
<ErrorDisplay
  error={error}
  type="server"
  fullPage={true}
  onRetry={handleRetry}
/>

// Show details in development
<ErrorDisplay
  error={error}
  showDetails={process.env.NODE_ENV === 'development'}
/>
```

**Specialized Components:**

```tsx
import { NetworkError, AuthenticationError, ValidationError, ServerError } from './components';

<NetworkError error="Connection failed" onRetry={handleRetry} />
<AuthenticationError error="Session expired" onRetry={handleRetry} />
<ValidationError error="Invalid input" onDismiss={handleDismiss} />
<ServerError error="Server error" onRetry={handleRetry} />
```

## Utilities

### Error Classification

Automatically classifies errors based on their characteristics:

```typescript
import { classifyError } from './utils';

const error = new Error('Network timeout');
const type = classifyError(error); // Returns 'network'
```

### Error Severity

Determines the severity level of errors:

```typescript
import { getErrorSeverity } from './utils';

const severity = getErrorSeverity(error, 'authentication'); // Returns 'high'
```

Severity levels:
- `low`: Validation errors
- `medium`: Network errors, unknown errors
- `high`: Authentication errors, 500 server errors
- `critical`: Reserved for critical system failures

### User-Friendly Messages

Generates user-friendly error messages:

```typescript
import { getUserFriendlyMessage } from './utils';

const message = getUserFriendlyMessage(error, 'network');
// Returns: "Unable to connect to the server. Please check your internet connection and try again."
```

### Error Logging

Logs errors with context:

```typescript
import { handleError } from './utils';

try {
  // Some operation
} catch (error) {
  const errorInfo = handleError(error, {
    userId: user.id,
    action: 'fetchData',
    component: 'DashboardPage',
  });
}
```

**Development Mode:**
- Logs to console with color coding
- Shows full error details and stack traces
- Groups related error information

**Production Mode:**
- Logs structured error data
- Ready for integration with error tracking services (Sentry, CloudWatch)
- Includes context and metadata

### Retry Logic

Check if an error is retryable:

```typescript
import { isRetryableError, getRetryDelay } from './utils';

if (isRetryableError(error)) {
  const delay = getRetryDelay(attemptNumber);
  setTimeout(() => retry(), delay);
}
```

## Integration Examples

### Page-Level Error Handling

```tsx
import { ErrorDisplay } from '../components';
import { classifyError } from '../utils';

export const MyPage: React.FC = () => {
  const { data, error, refetch } = useMyData();

  return (
    <Box>
      {error && (
        <ErrorDisplay
          error={error}
          type={classifyError(error)}
          onRetry={refetch}
          showDetails={process.env.NODE_ENV === 'development'}
        />
      )}
      {/* Page content */}
    </Box>
  );
};
```

### Application-Level Error Boundary

```tsx
import { ErrorBoundary } from './components';
import { handleError } from './utils';

function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        handleError(error, {
          componentStack: errorInfo.componentStack,
          location: window.location.href,
        });
      }}
    >
      <YourApp />
    </ErrorBoundary>
  );
}
```

### API Service Error Handling

The APIService already includes:
- Automatic retry with exponential backoff (max 3 attempts)
- Network error detection
- Structured error responses
- Custom APIError class

```typescript
import { apiService } from './services';

try {
  const data = await apiService.query(query, variables);
} catch (error) {
  // Error is already retried and classified
  // Handle the error in your component
}
```

## Error Flow

1. **Error Occurs**: An error happens in the application
2. **Classification**: Error is classified by type and severity
3. **Logging**: Error is logged with context (console in dev, service in prod)
4. **Display**: User-friendly error message is shown
5. **Recovery**: User can retry, dismiss, or navigate away
6. **Retry Logic**: Retryable errors are automatically retried with backoff

## Best Practices

1. **Always wrap the app in ErrorBoundary**: Catch unexpected React errors
2. **Use ErrorDisplay for API errors**: Show user-friendly messages
3. **Classify errors**: Use `classifyError()` for appropriate error types
4. **Provide retry options**: Allow users to retry failed operations
5. **Log with context**: Include relevant context when logging errors
6. **Show details in dev**: Help developers debug issues
7. **Hide details in prod**: Don't expose sensitive information
8. **Test error scenarios**: Verify error handling works correctly

## Future Enhancements

- Integration with Sentry or similar error tracking service
- CloudWatch integration for backend error monitoring
- Custom error reporting dashboard
- Error analytics and trends
- Automated error notifications
- Error recovery suggestions based on error patterns

## Requirements Validation

This implementation satisfies:
- **Requirement 2.5**: Error handling for export operations
- **Requirement 12.4**: Display user-friendly error messages
- Comprehensive error catching with ErrorBoundary
- Network error handling with retry logic
- User-friendly error messages for all error types
- Error logging for debugging (console in dev, service in prod)
