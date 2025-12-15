/**
 * MSW server setup for integration testing
 */

import { setupServer } from 'msw/node';
import { handlers } from './mswHandlers';

// Create MSW server with default handlers
export const server = setupServer(...handlers);

// Export for use in tests
export { handlers } from './mswHandlers';
export * from './mswHandlers';
