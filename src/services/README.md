# Service Layer Documentation

This directory contains the service layer for the InsightSphere Dashboard application. The service layer provides a unified interface for interacting with AWS services through AWS Amplify.

## Services

### APIService

The `APIService` class provides methods for executing GraphQL operations with automatic retry logic and error handling.

#### Features

- **Query**: Execute GraphQL queries with automatic retries
- **Mutate**: Execute GraphQL mutations with automatic retries
- **Subscribe**: Subscribe to GraphQL subscriptions for real-time updates
- **Error Handling**: Automatic error handling with custom error types
- **Retry Logic**: Exponential backoff retry for transient failures (network errors, 5xx errors)

#### Usage

```typescript
import { apiService } from '@/services';
import { listChatLogs } from '@/graphql/queries';
import { createFeedback } from '@/graphql/mutations';
import { onCreateFeedback } from '@/graphql/subscriptions';

// Execute a query
const result = await apiService.query(listChatLogs, {
  limit: 50,
  filter: { userId: { eq: 'user123' } }
});

// Execute a mutation
const feedback = await apiService.mutate(createFeedback, {
  input: {
    logId: 'log123',
    userId: 'user123',
    rating: 5,
    thumbsUp: true,
    comment: 'Great response!',
    timestamp: new Date().toISOString()
  }
});

// Subscribe to real-time updates
const unsubscribe = apiService.subscribe(
  onCreateFeedback,
  (data) => {
    console.log('New feedback:', data);
  },
  (error) => {
    console.error('Subscription error:', error);
  }
);

// Unsubscribe when done
unsubscribe();
```

#### Configuration

You can customize the retry behavior by creating a new instance:

```typescript
import { APIService } from '@/services';

const customApiService = new APIService({
  maxRetries: 5,
  initialDelayMs: 500,
  maxDelayMs: 15000,
  backoffMultiplier: 2
});
```

### StorageService

The `StorageService` class provides methods for S3 file operations with automatic retry logic and error handling.

#### Features

- **Upload**: Upload files to S3 with progress tracking
- **Download**: Download files from S3
- **Get Signed URL**: Generate signed URLs for secure file access
- **Delete**: Delete files from S3
- **List**: List files in S3 with optional prefix filtering
- **Error Handling**: Automatic error handling with custom error types
- **Retry Logic**: Exponential backoff retry for transient failures

#### Usage

```typescript
import { storageService } from '@/services';

// Upload a file
const csvData = new Blob([csvContent], { type: 'text/csv' });
const key = await storageService.uploadFile(
  'exports/chat-logs-2024-01-01.csv',
  csvData,
  {
    contentType: 'text/csv',
    metadata: { exportDate: '2024-01-01' },
    onProgress: (progress) => {
      console.log(`Uploaded ${progress.transferredBytes} bytes`);
    }
  }
);

// Get a signed URL for download
const downloadUrl = await storageService.getSignedUrl(key, {
  expiresIn: 3600 // 1 hour
});

// Download a file
const blob = await storageService.downloadFile(key);

// List files with prefix
const files = await storageService.listFiles('exports/');

// Delete a file
await storageService.deleteFile(key);
```

#### Configuration

You can customize the retry behavior by creating a new instance:

```typescript
import { StorageService } from '@/services';

const customStorageService = new StorageService({
  maxRetries: 5,
  initialDelayMs: 500,
  maxDelayMs: 15000,
  backoffMultiplier: 2
});
```

## Error Handling

Both services provide custom error classes for better error handling:

### APIError

```typescript
import { APIError } from '@/services';

try {
  await apiService.query(someQuery);
} catch (error) {
  if (error instanceof APIError) {
    console.error('API Error:', error.message);
    console.error('Status Code:', error.statusCode);
    console.error('Original Error:', error.originalError);
  }
}
```

### StorageError

```typescript
import { StorageError } from '@/services';

try {
  await storageService.uploadFile(key, data);
} catch (error) {
  if (error instanceof StorageError) {
    console.error('Storage Error:', error.message);
    console.error('Original Error:', error.originalError);
  }
}
```

## Retry Logic

Both services implement exponential backoff retry logic for transient failures:

- **Network errors**: Connection failures, timeouts
- **Server errors**: 5xx status codes, throttling errors
- **Configurable**: Max retries, initial delay, max delay, backoff multiplier

### Default Configuration

```typescript
{
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2
}
```

### Retry Behavior

1. First attempt fails → Wait 1 second
2. Second attempt fails → Wait 2 seconds (1s × 2)
3. Third attempt fails → Wait 4 seconds (2s × 2)
4. Fourth attempt fails → Throw error

Non-retryable errors (e.g., validation errors, 4xx status codes) are thrown immediately without retries.

## Authentication

Both services automatically handle authentication through AWS Amplify:

- JWT tokens are automatically included in requests
- Token refresh is handled by Amplify
- Authentication errors are properly propagated

Make sure to configure Amplify before using these services:

```typescript
import { configureAmplify } from '@/amplify-config';

configureAmplify();
```

## Requirements Validation

This service layer implementation satisfies the following requirements:

- **Requirement 2.2**: Error handling and retry logic with exponential backoff
- **Requirement 12.5**: Request/response interceptors for authentication (handled by Amplify SDK)

The services provide:
- ✅ Query, mutate, and subscribe methods for GraphQL operations
- ✅ S3 file operations (upload, download, delete, list, signed URLs)
- ✅ Exponential backoff retry logic for transient failures
- ✅ Custom error classes for better error handling
- ✅ Authentication integration through Amplify SDK
- ✅ TypeScript type safety
- ✅ Singleton instances for easy usage
