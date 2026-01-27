# Integration Tests

This directory contains integration tests for the Chat Logs Review System. These tests verify complete workflows and interactions between multiple components.

## Overview

Integration tests use MSW (Mock Service Worker) to intercept and mock GraphQL API calls, allowing us to test the full application flow without requiring a live backend.

## Test Suites

### 1. Authentication Integration Tests (`authentication.integration.test.tsx`)
Tests the complete authentication workflow:
- Sign-in flow
- Protected routes
- Session management
- Logout flow
- Token management
- Error handling

**Validates Requirements:** 1.1, 1.2, 1.3, 1.4, 1.5

### 2. Chat Log Review Integration Tests (`chatLogReview.integration.test.tsx`)
Tests the end-to-end chat log review workflow:
- Viewing chat logs
- Filtering by carrier and review status
- Sorting by timestamp
- Pagination
- Selecting and reviewing logs
- Submitting reviews
- Error handling
- Loading states

**Validates Requirements:** 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6

### 3. Feedback Log Review Integration Tests (`feedbackLogReview.integration.test.tsx`)
Tests the end-to-end feedback log review workflow:
- Viewing feedback logs
- Filtering by carrier and review status
- Sorting by datetime
- Pagination
- Selecting and reviewing logs
- Submitting reviews
- Error handling
- Loading states

**Validates Requirements:** 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6

### 4. Dashboard Metrics Integration Tests (`dashboardMetrics.integration.test.tsx`)
Tests the dashboard metrics workflow:
- Loading metrics
- Displaying all metrics (total, reviewed, pending, percentage)
- Color-coded indicators (green >80%, yellow 40-80%, red <40%)
- Metrics calculation
- Auto-refresh
- Error handling
- Loading states

**Validates Requirements:** 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 9.1, 9.2, 9.3, 9.4, 9.5

### 5. Error Handling Integration Tests (`errorHandling.integration.test.tsx`)
Tests error handling across component boundaries:
- Network errors
- Authentication errors
- Validation errors
- GraphQL errors
- Component errors
- Error recovery
- Error propagation
- Error messages

**Validates Requirements:** 11.1, 11.2, 11.3, 11.4, 11.5

## MSW Setup

### Handlers (`../mswHandlers.ts`)
Defines mock GraphQL handlers for:
- `ListUnityAIAssistantLogs` - Returns mock chat logs with filtering support
- `ListUserFeedbacks` - Returns mock feedback logs with filtering support
- `GetReviewMetrics` - Returns calculated metrics based on mock data
- `UpdateUnityAIAssistantLog` - Updates chat log review fields
- `UpdateUserFeedback` - Updates feedback log review fields

### Server (`../mswServer.ts`)
Sets up the MSW server with default handlers and provides utilities for:
- Resetting data stores
- Setting custom data
- Accessing current data

### Setup (`../setup.ts`)
Configures MSW to:
- Start server before all tests
- Reset handlers and data after each test
- Stop server after all tests

## Running Integration Tests

### Run All Integration Tests
```bash
npm test src/test/integration
```

### Run Specific Test Suite
```bash
npm test src/test/integration/authentication.integration.test.tsx
npm test src/test/integration/chatLogReview.integration.test.tsx
npm test src/test/integration/feedbackLogReview.integration.test.tsx
npm test src/test/integration/dashboardMetrics.integration.test.tsx
npm test src/test/integration/errorHandling.integration.test.tsx
```

### Run with Coverage
```bash
npm test -- --coverage src/test/integration
```

### Run in Watch Mode
```bash
npm test -- --watch src/test/integration
```

## Known Issues

### Windows File Handle Limitation
On Windows systems, integration tests may fail with "EMFILE: too many open files" error due to @mui/icons-material importing many icon files. This is a known limitation of Windows file handles.

**Workarounds:**
1. Run tests on Linux/Mac systems
2. Run individual test suites instead of all at once
3. Increase Windows file handle limit (requires system configuration)
4. Use WSL (Windows Subsystem for Linux)

The integration tests are currently excluded from the default test run in `vitest.config.ts` due to this issue.

## Test Structure

Each integration test follows this structure:

```typescript
describe('Feature Integration Tests', () => {
  beforeEach(() => {
    // Reset mock data
    setChatLogsStore(generateMockChatLogs(10));
  });

  describe('Workflow Step', () => {
    it('should perform expected behavior', async () => {
      // Arrange: Set up test data and render component
      renderWithProviders(<Component />);

      // Act: Perform user interactions
      const user = userEvent.setup();
      await user.click(screen.getByText('Button'));

      // Assert: Verify expected outcomes
      await waitFor(() => {
        expect(screen.getByText('Expected Result')).toBeInTheDocument();
      });
    });
  });
});
```

## Best Practices

1. **Use MSW for API Mocking**: Always use MSW handlers instead of mocking Amplify directly
2. **Reset State**: Always reset mock data in `beforeEach` to ensure test isolation
3. **Wait for Async Operations**: Use `waitFor` for async operations and state updates
4. **Test User Behavior**: Focus on what users do, not implementation details
5. **Verify Complete Workflows**: Test entire user journeys, not just individual actions
6. **Handle Loading States**: Verify loading indicators appear and disappear appropriately
7. **Test Error Scenarios**: Include tests for error handling and recovery
8. **Use Descriptive Test Names**: Test names should clearly describe what is being tested

## Debugging

### Enable MSW Logging
To see MSW request/response logs:
```typescript
server.listen({ onUnhandledRequest: 'warn' });
```

### View Test Output
```bash
npm test -- --reporter=verbose src/test/integration
```

### Debug Specific Test
```bash
npm test -- --reporter=verbose src/test/integration/authentication.integration.test.tsx
```

## Contributing

When adding new integration tests:
1. Follow the existing test structure
2. Use MSW handlers for API mocking
3. Test complete workflows, not individual functions
4. Include error handling tests
5. Verify loading states
6. Update this README with new test suites

## References

- [MSW Documentation](https://mswjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
