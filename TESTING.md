# Testing Guide

## Quick Start

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with UI (interactive)
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Testing Infrastructure

The project uses:
- **Vitest** - Fast unit test framework
- **React Testing Library** - Component testing utilities
- **fast-check** - Property-based testing (100 iterations per test)
- **jsdom** - DOM environment for tests

## Writing Tests

### Unit Tests

Place test files next to the source files with `.test.ts` or `.test.tsx` extension:

```typescript
// MyComponent.test.tsx
import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen, userEvent } from '@/test';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('should render with correct text', () => {
    renderWithProviders(<MyComponent title="Hello" />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MyComponent />);
    
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Clicked')).toBeInTheDocument();
  });
});
```

### Property-Based Tests

Use fast-check for testing universal properties:

```typescript
import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { ratingArbitrary, invalidRatingArbitrary } from '@/test/generators';

describe('Rating Validation', () => {
  it('should accept valid ratings (1-5)', () => {
    /**
     * Feature: insightsphere-dashboard, Property 5: Rating validation
     * Validates: Requirements 3.3
     */
    fc.assert(
      fc.property(ratingArbitrary(), (rating) => {
        const result = validateRating(rating);
        return result.isValid === true;
      })
    );
  });

  it('should reject invalid ratings', () => {
    fc.assert(
      fc.property(invalidRatingArbitrary(), (rating) => {
        const result = validateRating(rating);
        return result.isValid === false;
      })
    );
  });
});
```

## Available Test Utilities

### Render Functions

```typescript
import { renderWithProviders } from '@/test';

// Renders component with all necessary providers
renderWithProviders(<MyComponent />);

// With custom QueryClient
const queryClient = createTestQueryClient();
renderWithProviders(<MyComponent />, { queryClient });
```

### Fast-check Generators

Pre-built generators for domain types:

```typescript
import {
  chatLogArbitrary,
  feedbackArbitrary,
  ratingArbitrary,
  commentArbitrary,
  dateRangeArbitrary,
  logFiltersArbitrary,
} from '@/test/generators';

// Generate random chat logs
fc.assert(
  fc.property(chatLogArbitrary(), (log) => {
    // Test with random chat log
  })
);
```

## Property Test Requirements

1. **Tag each property test** with the design document reference:
   ```typescript
   /**
    * Feature: insightsphere-dashboard, Property {number}: {description}
    * Validates: Requirements {ids}
    */
   ```

2. **Use appropriate generators** from `@/test/generators`

3. **Tests run 100 iterations** automatically (configured globally)

4. **Test real logic** - avoid mocking in property tests

## Best Practices

### Do's ✅
- Test behavior, not implementation
- Use semantic queries (`getByRole`, `getByLabelText`)
- Co-locate tests with source files
- Use property tests for universal properties
- Use unit tests for specific examples and edge cases
- Clean up after tests (automatic with setup)

### Don'ts ❌
- Don't test implementation details
- Don't use `getByTestId` unless necessary
- Don't mock everything - test real logic
- Don't write brittle tests that break on refactoring
- Don't skip accessibility in tests

## Coverage

Run coverage report:
```bash
npm run test:coverage
```

Coverage requirements:
- Minimum 80% overall coverage
- 100% for utility functions and business logic
- Focus on critical paths and edge cases

## Debugging Tests

### Run specific test file
```bash
npx vitest run src/components/MyComponent.test.tsx
```

### Run tests matching pattern
```bash
npx vitest run -t "should validate rating"
```

### Debug in VS Code
Add breakpoint and run "Debug Test" from the test file

## Common Patterns

### Testing Async Operations
```typescript
it('should load data', async () => {
  renderWithProviders(<MyComponent />);
  
  // Wait for element to appear
  const element = await screen.findByText('Loaded');
  expect(element).toBeInTheDocument();
});
```

### Testing Forms
```typescript
it('should submit form', async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();
  
  renderWithProviders(<MyForm onSubmit={onSubmit} />);
  
  await user.type(screen.getByLabelText('Name'), 'John');
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  
  expect(onSubmit).toHaveBeenCalledWith({ name: 'John' });
});
```

### Testing Error States
```typescript
it('should display error message', () => {
  renderWithProviders(<MyComponent error="Something went wrong" />);
  expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
});
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [fast-check Documentation](https://fast-check.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
