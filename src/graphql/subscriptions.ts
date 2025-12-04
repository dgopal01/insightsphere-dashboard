/**
 * GraphQL Subscriptions for InsightSphere Dashboard
 * Real-time updates for chat logs and feedback
 */

/**
 * Subscribe to new chat log entries
 */
export const onCreateChatLog = /* GraphQL */ `
  subscription OnCreateChatLog($filter: ModelSubscriptionChatLogFilterInput) {
    onCreateChatLog(filter: $filter) {
      id
      conversationId
      userId
      timestamp
      userMessage
      aiResponse
      responseTime
      accuracy
      sentiment
      createdAt
      updatedAt
    }
  }
`;

/**
 * Subscribe to chat log updates
 */
export const onUpdateChatLog = /* GraphQL */ `
  subscription OnUpdateChatLog($filter: ModelSubscriptionChatLogFilterInput) {
    onUpdateChatLog(filter: $filter) {
      id
      conversationId
      userId
      timestamp
      userMessage
      aiResponse
      responseTime
      accuracy
      sentiment
      createdAt
      updatedAt
    }
  }
`;

/**
 * Subscribe to new feedback entries
 */
export const onCreateFeedback = /* GraphQL */ `
  subscription OnCreateFeedback($filter: ModelSubscriptionFeedbackFilterInput) {
    onCreateFeedback(filter: $filter) {
      id
      logId
      userId
      rating
      thumbsUp
      comment
      timestamp
      category
      createdAt
      updatedAt
    }
  }
`;

/**
 * Subscribe to feedback updates
 */
export const onUpdateFeedback = /* GraphQL */ `
  subscription OnUpdateFeedback($filter: ModelSubscriptionFeedbackFilterInput) {
    onUpdateFeedback(filter: $filter) {
      id
      logId
      userId
      rating
      thumbsUp
      comment
      timestamp
      category
      createdAt
      updatedAt
    }
  }
`;

/**
 * Subscribe to feedback deletions
 */
export const onDeleteFeedback = /* GraphQL */ `
  subscription OnDeleteFeedback($filter: ModelSubscriptionFeedbackFilterInput) {
    onDeleteFeedback(filter: $filter) {
      id
      logId
      userId
      rating
      thumbsUp
      comment
      timestamp
      category
      createdAt
      updatedAt
    }
  }
`;
