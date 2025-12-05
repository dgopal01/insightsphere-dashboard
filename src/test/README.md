# Testing Infrastructure

This directory contains the testing infrastructure for the InsightSphere Dashboard and Chat Logs Review System applications.

## Overview

The testing setup uses:
- **Vitest**: Fast unit test framework with native ESM support
- **React Testing Library**: Testing utilities for React components
- **fast-check**: Property-based testing library for property-based testing
- **jsdom**: DOM implementation for Node.js
- **@testing-library/jest-dom**: Custom matchers for DOM assertions
- **@testing-library/user-event**: User interaction simulation

## Configuration

### Vitest Configuration
- Located in `vitest.config.ts` at the project root
- Configured with jsdom environment for React component testing
- Setup file runs before each test suite (`src/test/setup.ts`)
- Coverage reporting enabled with v8 provider
- Excludes problematic test files on Windows (file handle limitations)
- Path alias configured: `@` → `./src`

### Fast-check Configuration
- Configured to run **100 iterations** per property test (as per design document)
- Global configuration in `setup.ts`
- Custom generators for domain-specific data in `generators.ts`
- Verbose mode disabled for cleaner output

## Files

### `setup.ts`
- Global test setup and configuration
- Mocks for AWS Amplify modules (`aws-amplify`, `@aws-amplify/ui-react`)
- Mocks for browser APIs: `window.matchMedia`, `IntersectionObserver`, `ResizeObserver`
- Cleanup after each test (DOM, localStorage, sessionStorage)
- fast-check global configuration (100 iterations)
- Exports fast-check for use in tests

### `utils.tsx`
- Custom render functions with providers (QueryClient, Router, Theme)
- `renderWithProviders`: Wraps components with all necessary providers
- `createTestQueryClient`: Creates a QueryClient configured for testing
- `waitFor`: Utility for waiting on conditions
- `mockLocalStorage`: Mock implementation of localStorage
- Re-exports from React Testing Library and user-event

### `generators.ts`
- fast-check generators (arbitraries) for domain-specific types
- **InsightSphere Dashboard generators**: ChatLog, Feedback, filters, metrics
- **Chat Logs Review System generators**:
  - `chatLogEntryArbitrary`: UnityAIAssistantLog entries
  - `feedbackLogEntryArbitrary`: UserFeedback entries
  - `reviewedChatLogEntryArbitrary`: Reviewed chat logs
  - `pendingChatLogEntryArbitrary`: Pending chat logs
  - `reviewDataArbitrary`: Review submission data
  - `chatLogFiltersArbitrary`: Chat log filter options
  - `feedbackLogFiltersArbitrary`: Feedback log filter options
  - `paginationStateArbitrary`: Pagination state
  - `reviewMetricsArbitrary`: Dashboard metrics
  - `xssPayloadArbitrary`: XSS attack payloads for sanitization testing
  - `specialCharsArbitrary`: Special characters for escaping tests
- Smart generators that respect domain constraints (character limits, valid ranges)

### `mockGraphQL.ts`
- Mock GraphQL responses for testing
- **Mock data fixtures**:
  - `mockChatLogEntry`: Sample chat log entry
  - `mockReviewedChatLogEntry`: Reviewed chat log
  - `mockPendingChatLogEntry`: Pending chat log
  - `mockFeedbackLogEntry`: Sample feedback log entry
  - `mockReviewedFeedbackLogEntry`: Reviewed feedback log
  - `mockPendingFeedbackLogEntry`: Pending feedback log
  - `mockReviewMetrics`: Sample dashboard metrics
- **Mock response generators**:
  - `generateMockChatLogs`: Generate arrays of chat logs
  - `generateMockFeedbackLogs`: Generate arrays of feedback logs
- **Mock GraphQL responses**:
  - Success responses for queries and mutations
  - Error responses (network, auth, validation, server, not found)
- **Mock client functions**:
  - `createMockGraphQLClient`: Mock GraphQL client
  - `mockSuccessfulQuery`, `mockFailedQuery`: Query mocks
  - `mockSuccessfulMutation`, `mockFailedMutation`: Mutation mocks
  - Amplify API mocks

### `mswHandlers.ts`
- MSW (Mock Service Worker) handlers for integration testing
- Intercepts GraphQL requests and returns mock responses
- In-memory data stores for chat logs and feedback logs
- Utilities for resetting and setting custom data
- Error handlers for testing error scenarios

### `mswServer.ts`
- MSW server setup for integration testing
- Exports server instance and handlers
- Used in test setup to start/stop server

### `integration/`
- Integration tests for complete workflows
- Tests authentication, chat log review, feedback log review, dashboard metrics, and error handling
- Uses MSW for API mocking
- See `integration/README.md` for details

### `index.ts`
- Central export point for all test utilities
- Exports from: `utils`, `generators`, `mockGraphQL`, `mswHandlers`, `mswServer`, `setup`

## Usage

### Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Writing Unit Tests

```typescript
import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen, userEvent } from '@/test';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    renderWithProviders(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should handle user interactions', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MyComponent />);
    
    const button = screen.getByRole('button', { name: /submit/i });
    await user.click(button);
    
    expect(screen.getByText('Submitted')).toBeInTheDocument();
  });
});
```

### Writing Property-Based Tests

Property-based tests must follow the format specified in the design document:

```typescript
import { describe, it } from 'vitest';
import { fc } from '@/test';
import { reviewCommentArbitrary } from '@/test/generators';
import { validateReviewComment } from './validation';

describe('Review Comment Validation', () => {
  it('should accept valid review comments (0-5000 characters)', () => {
    /**
     * Feature: chat-logs-review-system, Property 13: Comment field validation
     * Validates: Requirements 4.2
     */
    fc.assert(
      fc.property(reviewCommentArbitrary(), (comment) => {
        const result = validateReviewComment(comment);
        return result.isValid === true;
      })
    );
  });

  it('should reject invalid review comments (> 5000 characters)', () => {
    /**
     * Feature: chat-logs-review-system, Property 13: Comment field validation
     * Validates: Requirements 4.2
     */
    fc.assert(
      fc.property(invalidReviewCommentArbitrary(), (comment) => {
        const result = validateReviewComment(comment);
        return result.isValid === false;
      })
    );
  });
});
```

### Using Mock GraphQL Responses

```typescript
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, screen } from '@/test';
import {
  mockListChatLogsResponse,
  mockUpdateChatLogResponse,
  mockNetworkError,
} from '@/test/mockGraphQL';
import { ChatLogsReviewPage } from './ChatLogsReviewPage';

describe('ChatLogsReviewPage', () => {
  it('should display chat logs', async () => {
    // Mock the GraphQL query
    const mockGraphQL = vi.fn().mockResolvedValue({
      data: { listUnityAIAssistantLogs: mockListChatLogsResponse },
    });

    renderWithProviders(<ChatLogsReviewPage />);
    
    // Wait for data to load
    await screen.findByText(/log-000/i);
    
    expect(screen.getByText(/Verizon/i)).toBeInTheDocument();
  });

  it('should handle network errors', async () => {
    const mockGraphQL = vi.fn().mockRejectedValue(mockNetworkError);

    renderWithProviders(<ChatLogsReviewPage />);
    
    await screen.findByText(/network error/i);
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });
});
```

### Using Generators in Tests

```typescript
import { describe, it, expect } from 'vitest';
import { fc } from '@/test';
import {
  chatLogEntryArbitrary,
  reviewedChatLogEntryArbitrary,
  pendingChatLogEntryArbitrary,
} from '@/test/generators';
import { calculateReviewedCount } from './metrics';

describe('Metrics Calculation', () => {
  it('should count reviewed entries correctly', () => {
    /**
     * Feature: chat-logs-review-system, Property 31: Reviewed count calculation
     * Validates: Requirements 8.2, 8.5
     */
    fc.assert(
      fc.property(
        fc.array(reviewedChatLogEntryArbitrary(), { minLength: 1, maxLength: 100 }),
        (logs) => {
          const count = calculateReviewedCount(logs);
          // All logs should be counted as reviewed
          return count === logs.length;
        }
      )
    );
  });

  it('should not count pending entries as reviewed', () => {
    /**
     * Feature: chat-logs-review-system, Property 31: Reviewed count calculation
     * Validates: Requirements 8.2, 8.5
     */
    fc.assert(
      fc.property(
        fc.array(pendingChatLogEntryArbitrary(), { minLength: 1, maxLength: 100 }),
        (logs) => {
          const count = calculateReviewedCount(logs);
          // No logs should be counted as reviewed
          return count === 0;
        }
      )
    );
  });
});
```

## Property-Based Testing Guidelines

1. **Tag each property test** with a comment referencing the design document:
   ```typescript
   /**
    * Feature: insightsphere-dashboard, Property {number}: {property_text}
    * Validates: Requirements {requirement_ids}
    */
   ```

2. **Use smart generators** that constrain inputs to valid domain ranges

3. **Run 100 iterations** per property test (configured globally)

4. **Test universal properties** that should hold across all inputs

5. **Avoid mocking** in property tests - test real logic

## Test Organization

Tests should be co-located with source files:
```
src/
  components/
    MyComponent.tsx
    MyComponent.test.tsx
  hooks/
    useMyHook.ts
    useMyHook.test.ts
```

## Coverage Requirements

- Minimum 80% code coverage
- 100% coverage for utility functions and business logic
- Focus on behavior, not implementation details

## Mocking Strategy

- AWS services are mocked globally in `setup.ts`
- Avoid mocking in property tests
- Use real implementations where possible
- Mock only external dependencies (APIs, storage, etc.)
