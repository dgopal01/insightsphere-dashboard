/**
 * GraphQL Mutations for InsightSphere Dashboard
 */

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
