/**
 * GraphQL Subscriptions for InsightSphere Dashboard and Chat Logs Review System
 * Real-time updates for chat logs and feedback
 */

// ============================================================================
// Chat Logs Review System Subscriptions
// ============================================================================

/**
 * Subscribe to Unity AI Assistant Log updates
 */
export const onUpdateUnityAIAssistantLog = /* GraphQL */ `
  subscription OnUpdateUnityAIAssistantLog($log_id: ID) {
    onUpdateUnityAIAssistantLog(log_id: $log_id) {
      log_id
      timestamp
      carrier_name
      chat_id
      citation
      fi_name
      guardrail_id
      guardrail_intervened
      model_id
      question
      response
      rev_comment
      rev_feedback
      session_id
      user_name
      usr_comment
      usr_feedback
    }
  }
`;

/**
 * Subscribe to User Feedback updates
 */
export const onUpdateUserFeedback = /* GraphQL */ `
  subscription OnUpdateUserFeedback($id: ID) {
    onUpdateUserFeedback(id: $id) {
      id
      datetime
      carrier
      comments
      feedback
      question
      response
      session_id
      type
      username
      user_name
      rev_comment
      rev_feedback
    }
  }
`;

// ============================================================================
// InsightSphere Dashboard Subscriptions (Legacy)
// ============================================================================

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
