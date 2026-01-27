/**
 * MSW (Mock Service Worker) handlers for integration testing
 * These handlers intercept GraphQL requests and return mock responses
 */

import { graphql, HttpResponse } from 'msw';
import {
  mockChatLogEntry,
  mockFeedbackLogEntry,
  mockReviewMetrics,
  generateMockChatLogs,
  generateMockFeedbackLogs,
  mockNetworkError,
  mockAuthError,
  mockValidationError,
} from './mockGraphQL';
import type { ChatLogEntry, FeedbackLogEntry } from '../types';

// In-memory data stores for testing
let chatLogsStore: ChatLogEntry[] = generateMockChatLogs(20);
let feedbackLogsStore: FeedbackLogEntry[] = generateMockFeedbackLogs(15);

/**
 * Reset stores to initial state
 */
export function resetStores() {
  chatLogsStore = generateMockChatLogs(20);
  feedbackLogsStore = generateMockFeedbackLogs(15);
}

/**
 * Set custom chat logs data
 */
export function setChatLogsStore(logs: ChatLogEntry[]) {
  chatLogsStore = logs;
}

/**
 * Set custom feedback logs data
 */
export function setFeedbackLogsStore(logs: FeedbackLogEntry[]) {
  feedbackLogsStore = logs;
}

/**
 * Get current chat logs store
 */
export function getChatLogsStore() {
  return chatLogsStore;
}

/**
 * Get current feedback logs store
 */
export function getFeedbackLogsStore() {
  return feedbackLogsStore;
}

/**
 * Default MSW handlers for GraphQL operations
 */
export const handlers = [
  // List Unity AI Assistant Logs (Chat Logs)
  graphql.query('ListUnityAIAssistantLogs', ({ variables }) => {
    const { filter, limit = 50 } = variables as any;

    let filteredLogs = [...chatLogsStore];

    // Apply carrier_name filter
    if (filter?.carrier_name?.eq) {
      filteredLogs = filteredLogs.filter((log) => log.carrier_name === filter.carrier_name.eq);
    }

    // Apply review status filter
    if (filter?.reviewStatus) {
      if (filter.reviewStatus === 'reviewed') {
        filteredLogs = filteredLogs.filter((log) => log.rev_comment || log.rev_feedback);
      } else if (filter.reviewStatus === 'pending') {
        filteredLogs = filteredLogs.filter((log) => !log.rev_comment && !log.rev_feedback);
      }
    }

    // Apply pagination
    const items = filteredLogs.slice(0, limit);
    const nextToken = filteredLogs.length > limit ? 'next-token' : null;

    return HttpResponse.json({
      data: {
        listUnityAIAssistantLogs: {
          items,
          nextToken,
        },
      },
    });
  }),

  // List User Feedbacks (Feedback Logs)
  graphql.query('ListUserFeedbacks', ({ variables }) => {
    const { filter, limit = 50 } = variables as any;

    let filteredLogs = [...feedbackLogsStore];

    // Apply carrier filter
    if (filter?.carrier?.eq) {
      filteredLogs = filteredLogs.filter((log) => log.carrier === filter.carrier.eq);
    }

    // Apply review status filter
    if (filter?.reviewStatus) {
      if (filter.reviewStatus === 'reviewed') {
        filteredLogs = filteredLogs.filter((log) => log.rev_comment || log.rev_feedback);
      } else if (filter.reviewStatus === 'pending') {
        filteredLogs = filteredLogs.filter((log) => !log.rev_comment && !log.rev_feedback);
      }
    }

    // Apply pagination
    const items = filteredLogs.slice(0, limit);
    const nextToken = filteredLogs.length > limit ? 'next-token' : null;

    return HttpResponse.json({
      data: {
        listUserFeedbacks: {
          items,
          nextToken,
        },
      },
    });
  }),

  // Get Review Metrics
  graphql.query('GetReviewMetrics', () => {
    const totalChatLogs = chatLogsStore.length;
    const reviewedChatLogs = chatLogsStore.filter(
      (log) => log.rev_comment || log.rev_feedback
    ).length;
    const pendingChatLogs = totalChatLogs - reviewedChatLogs;

    const totalFeedbackLogs = feedbackLogsStore.length;
    const reviewedFeedbackLogs = feedbackLogsStore.filter(
      (log) => log.rev_comment || log.rev_feedback
    ).length;
    const pendingFeedbackLogs = totalFeedbackLogs - reviewedFeedbackLogs;

    return HttpResponse.json({
      data: {
        getReviewMetrics: {
          totalChatLogs,
          reviewedChatLogs,
          pendingChatLogs,
          totalFeedbackLogs,
          reviewedFeedbackLogs,
          pendingFeedbackLogs,
        },
      },
    });
  }),

  // Update Unity AI Assistant Log (Chat Log)
  graphql.mutation('UpdateUnityAIAssistantLog', ({ variables }) => {
    const { input } = variables as any;
    const { log_id, rev_comment, rev_feedback } = input;

    const logIndex = chatLogsStore.findIndex((log) => log.log_id === log_id);

    if (logIndex === -1) {
      return HttpResponse.json(
        {
          errors: [
            {
              message: 'Chat log not found',
              errorType: 'NotFoundError',
            },
          ],
        },
        { status: 404 }
      );
    }

    // Validate character limits
    if (rev_comment && rev_comment.length > 5000) {
      return HttpResponse.json(
        {
          errors: [
            {
              message: 'Validation error: rev_comment exceeds maximum length of 5000 characters',
              errorType: 'ValidationError',
            },
          ],
        },
        { status: 400 }
      );
    }

    if (rev_feedback && rev_feedback.length > 5000) {
      return HttpResponse.json(
        {
          errors: [
            {
              message: 'Validation error: rev_feedback exceeds maximum length of 5000 characters',
              errorType: 'ValidationError',
            },
          ],
        },
        { status: 400 }
      );
    }

    // Update the log
    chatLogsStore[logIndex] = {
      ...chatLogsStore[logIndex],
      rev_comment,
      rev_feedback,
    };

    return HttpResponse.json({
      data: {
        updateUnityAIAssistantLog: chatLogsStore[logIndex],
      },
    });
  }),

  // Update User Feedback (Feedback Log)
  graphql.mutation('UpdateUserFeedback', ({ variables }) => {
    const { input } = variables as any;
    const { id, rev_comment, rev_feedback } = input;

    const logIndex = feedbackLogsStore.findIndex((log) => log.id === id);

    if (logIndex === -1) {
      return HttpResponse.json(
        {
          errors: [
            {
              message: 'Feedback log not found',
              errorType: 'NotFoundError',
            },
          ],
        },
        { status: 404 }
      );
    }

    // Validate character limits
    if (rev_comment && rev_comment.length > 5000) {
      return HttpResponse.json(
        {
          errors: [
            {
              message: 'Validation error: rev_comment exceeds maximum length of 5000 characters',
              errorType: 'ValidationError',
            },
          ],
        },
        { status: 400 }
      );
    }

    if (rev_feedback && rev_feedback.length > 5000) {
      return HttpResponse.json(
        {
          errors: [
            {
              message: 'Validation error: rev_feedback exceeds maximum length of 5000 characters',
              errorType: 'ValidationError',
            },
          ],
        },
        { status: 400 }
      );
    }

    // Update the log
    feedbackLogsStore[logIndex] = {
      ...feedbackLogsStore[logIndex],
      rev_comment,
      rev_feedback,
    };

    return HttpResponse.json({
      data: {
        updateUserFeedback: feedbackLogsStore[logIndex],
      },
    });
  }),
];

/**
 * Error handlers for testing error scenarios
 */
export const errorHandlers = {
  networkError: [
    graphql.query('ListUnityAIAssistantLogs', () => {
      return HttpResponse.json(mockNetworkError, { status: 500 });
    }),
    graphql.query('ListUserFeedbacks', () => {
      return HttpResponse.json(mockNetworkError, { status: 500 });
    }),
    graphql.query('GetReviewMetrics', () => {
      return HttpResponse.json(mockNetworkError, { status: 500 });
    }),
  ],
  authError: [
    graphql.query('ListUnityAIAssistantLogs', () => {
      return HttpResponse.json(mockAuthError, { status: 401 });
    }),
    graphql.query('ListUserFeedbacks', () => {
      return HttpResponse.json(mockAuthError, { status: 401 });
    }),
    graphql.query('GetReviewMetrics', () => {
      return HttpResponse.json(mockAuthError, { status: 401 });
    }),
  ],
  validationError: [
    graphql.mutation('UpdateUnityAIAssistantLog', () => {
      return HttpResponse.json(mockValidationError, { status: 400 });
    }),
    graphql.mutation('UpdateUserFeedback', () => {
      return HttpResponse.json(mockValidationError, { status: 400 });
    }),
  ],
};
