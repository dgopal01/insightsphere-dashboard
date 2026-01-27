/**
 * GraphQL Types for InsightSphere Dashboard and Chat Logs Review System
 * These types match the GraphQL schemas defined in CloudFormation and Amplify
 */

// ============================================================================
// Chat Logs Review System Types
// ============================================================================

/**
 * UnityAIAssistantLog model - Chat logs from Unity AI Assistant
 */
export interface UnityAIAssistantLog {
  log_id: string;
  timestamp: string;
  carrier_name: string;
  chat_id?: string;
  citation?: string;
  fi_name?: string;
  guardrail_id?: string;
  guardrail_intervened?: boolean;
  model_id?: string;
  question: string;
  response: string;
  rev_comment?: string;
  rev_feedback?: string;
  session_id?: string;
  user_name?: string;
  usr_comment?: string;
  usr_feedback?: string;
}

/**
 * UserFeedback model - User feedback entries
 */
export interface UserFeedback {
  id: string;
  datetime: string;
  carrier: string;
  comments?: string;
  feedback?: string;
  question?: string;
  response?: string;
  session_id?: string;
  type?: string;
  username?: string;
  user_name?: string;
  rev_comment?: string;
  rev_feedback?: string;
}

/**
 * ReviewMetrics - Dashboard metrics for review progress
 */
export interface ReviewMetrics {
  totalChatLogs: number;
  reviewedChatLogs: number;
  pendingChatLogs: number;
  totalFeedbackLogs: number;
  reviewedFeedbackLogs: number;
  pendingFeedbackLogs: number;
}

/**
 * ChatLogEntry - Type alias for DynamoDB ChatLogEntry
 * Using DynamoDB structure directly
 */
export type ChatLogEntry = {
  log_id: string;
  timestamp: string;
  carrier_name?: string;
  chat_id?: string;
  citation?: string;
  fi_name?: string;
  guardrail_id?: string;
  guardrail_intervened?: boolean;
  model_id?: string;
  question?: string;
  response?: string;
  rev_comment?: string;
  rev_feedback?: string;
  issue_tags?: string[] | string;
  session_id?: string;
  user_name?: string;
  usr_comment?: string;
  usr_feedback?: string;
};

/**
 * FeedbackLogEntry - Type alias for DynamoDB FeedbackLogEntry
 * Using DynamoDB structure directly
 */
export type FeedbackLogEntry = {
  id: string;
  datetime: string;
  info?: {
    carrier?: string;
    feedback?: string;
    comments?: string;
    question?: string;
    response?: string;
    user_name?: string;
    session_id?: string;
    type?: string;
    username?: string;
  };
  rev_comment?: string;
  rev_feedback?: string;
};

/**
 * ReviewData - Data submitted when reviewing a log entry
 */
export interface ReviewData {
  rev_comment: string;
  rev_feedback: string;
  issue_tags?: string[];
}

/**
 * LogFilters - Filter options for chat logs
 */
export interface ChatLogFilters {
  carrier_name?: string;
  startDate?: string;
  endDate?: string;
  reviewStatus?: 'all' | 'reviewed' | 'pending';
}

/**
 * FeedbackFilters - Filter options for feedback logs
 */
export interface FeedbackLogFilters {
  carrier?: string;
  feedbackType?: 'all' | 'thumbs_up' | 'thumbs_down' | 'none';
  startDate?: string;
  endDate?: string;
  reviewStatus?: 'all' | 'reviewed' | 'pending';
}

/**
 * PaginationState - State for pagination management
 */
export interface PaginationState {
  currentPage: number;
  pageSize: number;
  nextToken: string | null;
  hasMore: boolean;
}

/**
 * List response for UnityAIAssistantLog queries
 */
export interface ListUnityAIAssistantLogsResponse {
  items: UnityAIAssistantLog[];
  nextToken?: string;
}

/**
 * List response for UserFeedback queries
 */
export interface ListUserFeedbacksResponse {
  items: UserFeedback[];
  nextToken?: string;
}

/**
 * Input type for updating UnityAIAssistantLog
 */
export interface UpdateUnityAIAssistantLogInput {
  log_id: string;
  rev_comment?: string;
  rev_feedback?: string;
}

/**
 * Input type for updating UserFeedback
 */
export interface UpdateUserFeedbackInput {
  id: string;
  rev_comment?: string;
  rev_feedback?: string;
}

/**
 * Filter input for UnityAIAssistantLog queries
 */
export interface ModelUnityAIAssistantLogFilterInput {
  log_id?: ModelIDInput;
  carrier_name?: ModelStringInput;
  timestamp?: ModelStringInput;
  rev_comment?: ModelStringInput;
  rev_feedback?: ModelStringInput;
  question?: ModelStringInput;
  response?: ModelStringInput;
  and?: ModelUnityAIAssistantLogFilterInput[];
  or?: ModelUnityAIAssistantLogFilterInput[];
  not?: ModelUnityAIAssistantLogFilterInput;
}

/**
 * Filter input for UserFeedback queries
 */
export interface ModelUserFeedbackFilterInput {
  id?: ModelIDInput;
  carrier?: ModelStringInput;
  datetime?: ModelStringInput;
  rev_comment?: ModelStringInput;
  rev_feedback?: ModelStringInput;
  and?: ModelUserFeedbackFilterInput[];
  or?: ModelUserFeedbackFilterInput[];
  not?: ModelUserFeedbackFilterInput;
}

/**
 * Model ID input for filtering
 */
export interface ModelIDInput {
  eq?: string;
  ne?: string;
  contains?: string;
  notContains?: string;
  beginsWith?: string;
  between?: [string, string];
  gt?: string;
  ge?: string;
  lt?: string;
  le?: string;
}

/**
 * Model String input for filtering
 */
export interface ModelStringInput {
  eq?: string;
  ne?: string;
  contains?: string;
  notContains?: string;
  beginsWith?: string;
  between?: [string, string];
  gt?: string;
  ge?: string;
  lt?: string;
  le?: string;
}

/**
 * GraphQL query variables for listing Unity AI Assistant Logs
 */
export interface ListUnityAIAssistantLogsVariables {
  filter?: ModelUnityAIAssistantLogFilterInput;
  limit?: number;
  nextToken?: string;
}

/**
 * GraphQL query variables for listing User Feedbacks
 */
export interface ListUserFeedbacksVariables {
  filter?: ModelUserFeedbackFilterInput;
  limit?: number;
  nextToken?: string;
}

/**
 * GraphQL mutation variables for updating Unity AI Assistant Log
 */
export interface UpdateUnityAIAssistantLogVariables {
  input: UpdateUnityAIAssistantLogInput;
}

/**
 * GraphQL mutation variables for updating User Feedback
 */
export interface UpdateUserFeedbackVariables {
  input: UpdateUserFeedbackInput;
}

/**
 * GraphQL subscription data for Unity AI Assistant Log updates
 */
export interface OnUpdateUnityAIAssistantLogSubscription {
  onUpdateUnityAIAssistantLog: UnityAIAssistantLog;
}

/**
 * GraphQL subscription data for User Feedback updates
 */
export interface OnUpdateUserFeedbackSubscription {
  onUpdateUserFeedback: UserFeedback;
}

// ============================================================================
// InsightSphere Dashboard Types (Legacy)
// ============================================================================

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
