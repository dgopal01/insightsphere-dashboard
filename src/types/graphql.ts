/**
 * GraphQL Types for InsightSphere Dashboard
 * These types match the GraphQL schema defined in amplify/backend/api/insightsphere/schema.graphql
 */

/**
 * ChatLog model - Read-only access to existing chat logs
 */
export interface ChatLog {
  id: string;
  conversationId: string;
  userId: string;
  timestamp: string; // ISO 8601 format (AWSDateTime)
  userMessage: string;
  aiResponse: string;
  responseTime: number; // milliseconds
  accuracy?: number; // 0-100
  sentiment?: 'positive' | 'negative' | 'neutral';
  feedback?: Feedback[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Feedback model - Read-write access for user feedback
 */
export interface Feedback {
  id: string;
  logId: string;
  userId: string;
  rating: number; // 1-5
  thumbsUp: boolean;
  comment?: string;
  timestamp: string; // ISO 8601 format (AWSDateTime)
  category?: 'accuracy' | 'helpfulness' | 'speed';
  chatLog?: ChatLog;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Input type for creating feedback
 */
export interface FeedbackInput {
  logId: string;
  rating: number;
  thumbsUp: boolean;
  comment?: string;
  category?: 'accuracy' | 'helpfulness' | 'speed';
}

/**
 * Aggregated metrics result
 */
export interface MetricsResult {
  accuracy?: number;
  satisfaction?: number;
  interactionCount?: number;
  avgResponseTime?: number;
}

/**
 * Feedback statistics result
 */
export interface FeedbackStats {
  positiveCount?: number;
  negativeCount?: number;
  averageRating?: number;
  totalCount?: number;
}

/**
 * Filter options for chat logs
 */
export interface LogFilters {
  startDate?: string;
  endDate?: string;
  userId?: string;
  conversationId?: string;
  searchText?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

/**
 * Pagination info
 */
export interface PaginationInfo {
  nextToken?: string;
  limit?: number;
}

/**
 * List response for ChatLog queries
 */
export interface ListChatLogsResponse {
  items: ChatLog[];
  nextToken?: string;
}

/**
 * List response for Feedback queries
 */
export interface ListFeedbackResponse {
  items: Feedback[];
  nextToken?: string;
}

/**
 * GraphQL query variables for listing chat logs
 */
export interface ListChatLogsVariables {
  filter?: {
    conversationId?: { eq?: string };
    userId?: { eq?: string };
    timestamp?: { between?: [string, string] };
    sentiment?: { eq?: string };
  };
  limit?: number;
  nextToken?: string;
}

/**
 * GraphQL query variables for listing feedback
 */
export interface ListFeedbackVariables {
  filter?: {
    logId?: { eq?: string };
    userId?: { eq?: string };
    timestamp?: { between?: [string, string] };
  };
  limit?: number;
  nextToken?: string;
}

/**
 * GraphQL mutation variables for creating feedback
 */
export interface CreateFeedbackVariables {
  input: {
    logId: string;
    userId: string;
    rating: number;
    thumbsUp: boolean;
    comment?: string;
    timestamp: string;
    category?: string;
  };
}

/**
 * GraphQL subscription data for new chat logs
 */
export interface OnCreateChatLogSubscription {
  onCreateChatLog: ChatLog;
}

/**
 * GraphQL subscription data for new feedback
 */
export interface OnCreateFeedbackSubscription {
  onCreateFeedback: Feedback;
}
