# Testing Infrastructure

This directory contains the testing infrastructure for the InsightSphere Dashboard application.

## Overview

The testing setup uses:
- **Vitest**: Fast unit test framework with native ESM support
- **React Testing Library**: Testing utilities for React components
- **fast-check**: Property-based testing library
- **jsdom**: DOM implementation for Node.js

## Configuration

### Vitest Configuration
- Located in `vitest.config.ts` at the project root
- Configured with jsdom environment for React component testing
- Setup file runs before each test suite
- Coverage reporting enabled with v8 provider

### Fast-check Configuration
- Configured to run **100 iterations** per property test
- Global configuration in `setup.ts`
- Custom generators for domain-specific data in `generators.ts`

## Files

### `setup.ts`
- Global test setup and configuration
- Mocks for AWS Amplify, window.matchMedia, IntersectionObserver, ResizeObserver
- Cleanup after each test
- fast-check global configuration

### `utils.tsx`
- Custom render functions with providers (QueryClient, Router, Theme)
- Test utilities for common testing patterns
- Re-exports from React Testing Library

### `generators.ts`
- fast-check generators (arbitraries) for domain-specific types
- Generators for ChatLog, Feedback, filters, and other data models
- Smart generators that respect domain constraints

### `index.ts`
- Central export point for all test utilities

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
import { renderWithProviders, screen } from '@/test';

describe('MyComponent', () => {
  it('should render correctly', () => {
    renderWithProviders(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Writing Property-Based Tests

```typescript
import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { ratingArbitrary } from '@/test/generators';

describe('Rating Validation', () => {
  it('should accept valid ratings (1-5)', () => {
    /**
     * Feature: insightsphere-dashboard, Property 5: Rating validation
     * Validates: Requirements 3.3
     */
    fc.assert(
      fc.property(ratingArbitrary(), (rating) => {
        return validateRating(rating) === true;
      })
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
