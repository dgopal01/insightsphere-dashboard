import { expect, afterEach, beforeAll, afterAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import * as fc from 'fast-check';
import { server, resetStores } from './mswServer';

// Start MSW server before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });
});

// Reset handlers and stores after each test
afterEach(() => {
  server.resetHandlers();
  resetStores();
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
});

// Stop MSW server after all tests
afterAll(() => {
  server.close();
});

// Configure fast-check to run 100 iterations per property test
fc.configureGlobal({
  numRuns: 100,
  verbose: false,
});

// Mock AWS Amplify modules
vi.mock('aws-amplify', () => ({
  Amplify: {
    configure: vi.fn(),
  },
}));

vi.mock('@aws-amplify/ui-react', () => ({
  Authenticator: vi.fn(),
  useAuthenticator: vi.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

// Export fast-check for use in tests
export { fc };
