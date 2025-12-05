/**
 * Mock GraphQL responses for testing
 * These mocks simulate the responses from AWS AppSync GraphQL API
 */

import type {
  ChatLogEntry,
  FeedbackLogEntry,
  ReviewMetrics,
  ListUnityAIAssistantLogsResponse,
  ListUserFeedbacksResponse,
  UnityAIAssistantLog,
  UserFeedback,
} from '../types';

// ============================================================================
// Mock Data Fixtures
// ============================================================================

/**
 * Mock ChatLogEntry data
 */
export const mockChatLogEntry: ChatLogEntry = {
  log_id: 'log-123e4567-e89b-12d3-a456-426614174000',
  timestamp: '2024-01-15T10:30:00.000Z',
  carrier_name: 'Verizon',
  chat_id: 'chat-123',
  citation: 'Source: Knowledge Base Article #42',
  fi_name: 'Financial Institution A',
  guardrail_id: 'guardrail-001',
  guardrail_intervened: false,
  model_id: 'claude-v2',
  question: 'What are the benefits of 5G?',
  response: '5G offers faster speeds, lower latency, and improved connectivity for mobile devices.',
  rev_comment: undefined,
  rev_feedback: undefined,
  session_id: 'session-456',
  user_name: 'john.doe',
  usr_comment: 'This was helpful',
  usr_feedback: 'positive',
};

/**
 * Mock reviewed ChatLogEntry
 */
export const mockReviewedChatLogEntry: ChatLogEntry = {
  ...mockChatLogEntry,
  log_id: 'log-reviewed-001',
  rev_comment: 'Response is accurate and helpful',
  rev_feedback: 'Approved for production use',
};

/**
 * Mock pending ChatLogEntry
 */
export const mockPendingChatLogEntry: ChatLogEntry = {
  ...mockChatLogEntry,
  log_id: 'log-pending-001',
  rev_comment: undefined,
  rev_feedback: undefined,
};

/**
 * Mock FeedbackLogEntry data
 */
export const mockFeedbackLogEntry: FeedbackLogEntry = {
  id: 'feedback-123e4567-e89b-12d3-a456-426614174000',
  datetime: '2024-01-15T11:00:00.000Z',
  carrier: 'AT&T',
  comments: 'The AI response was very helpful',
  feedback: 'positive',
  question: 'How do I activate my new phone?',
  response: 'To activate your phone, follow these steps...',
  session_id: 'session-789',
  type: 'positive',
  username: 'jane.smith',
  user_name: 'Jane Smith',
  rev_comment: undefined,
  rev_feedback: undefined,
};

/**
 * Mock reviewed FeedbackLogEntry
 */
export const mockReviewedFeedbackLogEntry: FeedbackLogEntry = {
  ...mockFeedbackLogEntry,
  id: 'feedback-reviewed-001',
  rev_comment: 'User feedback is positive and constructive',
  rev_feedback: 'No action needed',
};

/**
 * Mock pending FeedbackLogEntry
 */
export const mockPendingFeedbackLogEntry: FeedbackLogEntry = {
  ...mockFeedbackLogEntry,
  id: 'feedback-pending-001',
  rev_comment: undefined,
  rev_feedback: undefined,
};

/**
 * Mock ReviewMetrics data
 */
export const mockReviewMetrics: ReviewMetrics = {
  totalChatLogs: 100,
  reviewedChatLogs: 75,
  pendingChatLogs: 25,
  totalFeedbackLogs: 50,
  reviewedFeedbackLogs: 30,
  pendingFeedbackLogs: 20,
};

/**
 * Generate an array of mock chat log entries
 */
export function generateMockChatLogs(count: number, reviewed: boolean = false): ChatLogEntry[] {
  return Array.from({ length: count }, (_, i) => ({
    log_id: `log-${i.toString().padStart(3, '0')}`,
    timestamp: new Date(Date.now() - i * 3600000).toISOString(),
    carrier_name: ['Verizon', 'AT&T', 'T-Mobile', 'Sprint'][i % 4],
    chat_id: `chat-${i}`,
    citation: `Citation ${i}`,
    fi_name: `FI ${i}`,
    guardrail_id: `guardrail-${i}`,
    guardrail_intervened: i % 3 === 0,
    model_id: 'claude-v2',
    question: `Question ${i}`,
    response: `Response ${i}`,
    rev_comment: reviewed ? `Review comment ${i}` : undefined,
    rev_feedback: reviewed ? `Review feedback ${i}` : undefined,
    session_id: `session-${i}`,
    user_name: `user-${i}`,
    usr_comment: i % 2 === 0 ? `User comment ${i}` : undefined,
    usr_feedback: i % 2 === 0 ? 'positive' : 'negative',
  }));
}

/**
 * Generate an array of mock feedback log entries
 */
export function generateMockFeedbackLogs(
  count: number,
  reviewed: boolean = false
): FeedbackLogEntry[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `feedback-${i.toString().padStart(3, '0')}`,
    datetime: new Date(Date.now() - i * 3600000).toISOString(),
    carrier: ['Verizon', 'AT&T', 'T-Mobile', 'Sprint'][i % 4],
    comments: `User comment ${i}`,
    feedback: i % 2 === 0 ? 'positive' : 'negative',
    question: `Question ${i}`,
    response: `Response ${i}`,
    session_id: `session-${i}`,
    type: i % 2 === 0 ? 'positive' : 'negative',
    username: `user${i}`,
    user_name: `User ${i}`,
    rev_comment: reviewed ? `Review comment ${i}` : undefined,
    rev_feedback: reviewed ? `Review feedback ${i}` : undefined,
  }));
}

// ============================================================================
// Mock GraphQL Query Responses
// ============================================================================

/**
 * Mock successful listUnityAIAssistantLogs response
 */
export const mockListChatLogsResponse: ListUnityAIAssistantLogsResponse = {
  items: generateMockChatLogs(10),
  nextToken: 'next-token-123',
};

/**
 * Mock successful listUserFeedbacks response
 */
export const mockListFeedbackLogsResponse: ListUserFeedbacksResponse = {
  items: generateMockFeedbackLogs(10),
  nextToken: 'next-token-456',
};

/**
 * Mock successful getReviewMetrics response
 */
export const mockGetReviewMetricsResponse = {
  data: {
    getReviewMetrics: mockReviewMetrics,
  },
};

/**
 * Mock successful updateUnityAIAssistantLog response
 */
export const mockUpdateChatLogResponse = {
  data: {
    updateUnityAIAssistantLog: {
      ...mockChatLogEntry,
      rev_comment: 'Updated review comment',
      rev_feedback: 'Updated review feedback',
    },
  },
};

/**
 * Mock successful updateUserFeedback response
 */
export const mockUpdateFeedbackLogResponse = {
  data: {
    updateUserFeedback: {
      ...mockFeedbackLogEntry,
      rev_comment: 'Updated review comment',
      rev_feedback: 'Updated review feedback',
    },
  },
};

// ============================================================================
// Mock GraphQL Error Responses
// ============================================================================

/**
 * Mock GraphQL network error
 */
export const mockNetworkError = {
  errors: [
    {
      message: 'Network error',
      errorType: 'NetworkError',
    },
  ],
};

/**
 * Mock GraphQL authentication error
 */
export const mockAuthError = {
  errors: [
    {
      message: 'Unauthorized',
      errorType: 'Unauthorized',
      errorInfo: {
        code: 'UNAUTHORIZED',
      },
    },
  ],
};

/**
 * Mock GraphQL validation error
 */
export const mockValidationError = {
  errors: [
    {
      message: 'Validation error: rev_comment exceeds maximum length',
      errorType: 'ValidationError',
      path: ['updateUnityAIAssistantLog'],
    },
  ],
};

/**
 * Mock GraphQL server error
 */
export const mockServerError = {
  errors: [
    {
      message: 'Internal server error',
      errorType: 'InternalServerError',
    },
  ],
};

/**
 * Mock GraphQL not found error
 */
export const mockNotFoundError = {
  errors: [
    {
      message: 'Item not found',
      errorType: 'NotFoundError',
    },
  ],
};

// ============================================================================
// Mock GraphQL Client Functions
// ============================================================================

/**
 * Create a mock GraphQL client for testing
 */
export function createMockGraphQLClient() {
  return {
    query: vi.fn(),
    mutate: vi.fn(),
    subscribe: vi.fn(),
  };
}

/**
 * Mock successful query function
 */
export function mockSuccessfulQuery<T>(data: T) {
  return vi.fn().mockResolvedValue({ data });
}

/**
 * Mock failed query function
 */
export function mockFailedQuery(error: any) {
  return vi.fn().mockRejectedValue(error);
}

/**
 * Mock successful mutation function
 */
export function mockSuccessfulMutation<T>(data: T) {
  return vi.fn().mockResolvedValue({ data });
}

/**
 * Mock failed mutation function
 */
export function mockFailedMutation(error: any) {
  return vi.fn().mockRejectedValue(error);
}

// ============================================================================
// Mock AWS Amplify API Functions
// ============================================================================

/**
 * Mock Amplify API.graphql function
 */
export function mockAmplifyGraphQL() {
  return {
    graphql: vi.fn(),
  };
}

/**
 * Create mock for successful Amplify GraphQL query
 */
export function createMockAmplifyQuery<T>(data: T) {
  return vi.fn().mockResolvedValue({ data });
}

/**
 * Create mock for failed Amplify GraphQL query
 */
export function createMockAmplifyQueryError(error: any) {
  return vi.fn().mockRejectedValue(error);
}

// Note: vi is imported from vitest in the test files
declare const vi: any;
