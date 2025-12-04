/**
 * GraphQL Queries for InsightSphere Dashboard
 */

/**
 * Get a single chat log by ID
 */
export const getChatLog = /* GraphQL */ `
  query GetChatLog($id: ID!) {
    getChatLog(id: $id) {
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
 * List all chat logs with optional filtering and pagination
 */
export const listChatLogs = /* GraphQL */ `
  query ListChatLogs($filter: ModelChatLogFilterInput, $limit: Int, $nextToken: String) {
    listChatLogs(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
    }
  }
`;

/**
 * Query chat logs by conversation ID
 */
export const chatLogsByConversation = /* GraphQL */ `
  query ChatLogsByConversation(
    $conversationId: String!
    $timestamp: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelChatLogFilterInput
    $limit: Int
    $nextToken: String
  ) {
    chatLogsByConversation(
      conversationId: $conversationId
      timestamp: $timestamp
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
    }
  }
`;

/**
 * Query chat logs by user ID
 */
export const chatLogsByUser = /* GraphQL */ `
  query ChatLogsByUser(
    $userId: String!
    $timestamp: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelChatLogFilterInput
    $limit: Int
    $nextToken: String
  ) {
    chatLogsByUser(
      userId: $userId
      timestamp: $timestamp
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
    }
  }
`;

/**
 * Get a single feedback entry by ID
 */
export const getFeedback = /* GraphQL */ `
  query GetFeedback($id: ID!) {
    getFeedback(id: $id) {
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
 * List all feedback with optional filtering and pagination
 */
export const listFeedback = /* GraphQL */ `
  query ListFeedback($filter: ModelFeedbackFilterInput, $limit: Int, $nextToken: String) {
    listFeedback(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
    }
  }
`;

/**
 * Query feedback by log ID
 */
export const feedbackByLogId = /* GraphQL */ `
  query FeedbackByLogId(
    $logId: ID!
    $timestamp: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelFeedbackFilterInput
    $limit: Int
    $nextToken: String
  ) {
    feedbackByLogId(
      logId: $logId
      timestamp: $timestamp
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
    }
  }
`;

/**
 * Query feedback by user ID
 */
export const feedbackByUser = /* GraphQL */ `
  query FeedbackByUser(
    $userId: String!
    $timestamp: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelFeedbackFilterInput
    $limit: Int
    $nextToken: String
  ) {
    feedbackByUser(
      userId: $userId
      timestamp: $timestamp
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
    }
  }
`;

/**
 * Get aggregated metrics for a date range
 */
export const getMetrics = /* GraphQL */ `
  query GetMetrics($startDate: AWSDateTime!, $endDate: AWSDateTime!) {
    getMetrics(startDate: $startDate, endDate: $endDate) {
      accuracy
      satisfaction
      interactionCount
      avgResponseTime
    }
  }
`;

/**
 * Get feedback statistics for a date range
 */
export const getFeedbackStats = /* GraphQL */ `
  query GetFeedbackStats($startDate: AWSDateTime!, $endDate: AWSDateTime!) {
    getFeedbackStats(startDate: $startDate, endDate: $endDate) {
      positiveCount
      negativeCount
      averageRating
      totalCount
    }
  }
`;
