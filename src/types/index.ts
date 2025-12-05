/**
 * Core TypeScript type definitions for InsightSphere
 */

export interface ChatLog {
  id: string;
  conversationId: string;
  userId: string;
  timestamp: string; // ISO 8601 format
  userMessage: string;
  aiResponse: string;
  responseTime: number; // milliseconds
  accuracy?: number; // 0-100
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface Feedback {
  id: string;
  logId: string;
  userId: string;
  rating: number; // 1-5
  thumbsUp: boolean;
  comment?: string;
  timestamp: string; // ISO 8601 format
  category?: 'accuracy' | 'helpfulness' | 'speed';
}

export interface MetricData {
  timestamp: string;
  accuracy: number;
  satisfaction: number;
  interactionCount: number;
  avgResponseTime: number;
}

export interface LogFilters {
  startDate?: string;
  endDate?: string;
  userId?: string;
  conversationId?: string;
  searchText?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface FeedbackInput {
  logId: string;
  rating: number;
  thumbsUp: boolean;
  comment?: string;
  category?: 'accuracy' | 'helpfulness' | 'speed';
}

export interface FeedbackMetrics {
  positiveCount: number;
  negativeCount: number;
  averageRating: number;
  totalCount: number;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface ChartDataPoint {
  timestamp: string;
  [key: string]: string | number;
}

export type UserRole = 'admin' | 'viewer';

export interface CognitoUser {
  username: string;
  email?: string;
  attributes?: Record<string, string>;
}

// Export GraphQL-specific types
export * from './graphql';

// Re-export Chat Logs Review System types for convenience
export type {
  ChatLogEntry,
  FeedbackLogEntry,
  ReviewData,
  ChatLogFilters,
  FeedbackLogFilters,
  PaginationState,
  ReviewMetrics,
  UnityAIAssistantLog,
  UserFeedback,
  UpdateUnityAIAssistantLogInput,
  UpdateUserFeedbackInput,
  ListUnityAIAssistantLogsResponse,
  ListUserFeedbacksResponse,
} from './graphql';
