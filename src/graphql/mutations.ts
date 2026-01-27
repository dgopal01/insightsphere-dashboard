/**
 * GraphQL Mutations for InsightSphere Dashboard and Chat Logs Review System
 */

// ============================================================================
// Chat Logs Review System Mutations
// ============================================================================

/**
 * Update Unity AI Assistant Log review fields
 */
export const updateUnityAIAssistantLog = /* GraphQL */ `
  mutation UpdateUnityAIAssistantLog($input: UpdateUnityAIAssistantLogInput!) {
    updateUnityAIAssistantLog(input: $input) {
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
 * Update User Feedback review fields
 */
export const updateUserFeedback = /* GraphQL */ `
  mutation UpdateUserFeedback($input: UpdateUserFeedbackInput!) {
    updateUserFeedback(input: $input) {
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
// InsightSphere Dashboard Mutations (Legacy)
// ============================================================================

/**
 * Create a new feedback entry
 */
export const createFeedback = /* GraphQL */ `
  mutation CreateFeedback($input: CreateFeedbackInput!, $condition: ModelFeedbackConditionInput) {
    createFeedback(input: $input, condition: $condition) {
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
 * Update an existing feedback entry
 */
export const updateFeedback = /* GraphQL */ `
  mutation UpdateFeedback($input: UpdateFeedbackInput!, $condition: ModelFeedbackConditionInput) {
    updateFeedback(input: $input, condition: $condition) {
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
 * Delete a feedback entry
 */
export const deleteFeedback = /* GraphQL */ `
  mutation DeleteFeedback($input: DeleteFeedbackInput!, $condition: ModelFeedbackConditionInput) {
    deleteFeedback(input: $input, condition: $condition) {
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
