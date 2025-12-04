/**
 * API Service Layer
 * Provides a unified interface for GraphQL operations with error handling and retry logic
 */

import { generateClient } from 'aws-amplify/api';
import type { GraphQLResult } from '@aws-amplify/api-graphql';

/**
 * Configuration for retry logic
 */
interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

/**
 * Default retry configuration with exponential backoff
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
};

/**
 * Custom error class for API errors
 */
export class APIError extends Error {
  public statusCode?: number;
  public originalError?: unknown;

  constructor(message: string, statusCode?: number, originalError?: unknown) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}

/**
 * Determines if an error is retryable
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof APIError) {
    // Retry on 5xx server errors and network errors
    return !error.statusCode || error.statusCode >= 500;
  }

  // Retry on network errors
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('network') || message.includes('timeout') || message.includes('connection')
    );
  }

  return false;
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * API Service class for GraphQL operations
 */
export class APIService {
  private client = generateClient();
  private retryConfig: RetryConfig;

  constructor(retryConfig: Partial<RetryConfig> = {}) {
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  }

  /**
   * Execute a GraphQL query with retry logic
   */
  async query<T = unknown>(query: string, variables?: Record<string, any>): Promise<T> {
    return this.executeWithRetry(async () => {
      try {
        const result = (await this.client.graphql({
          query,
          variables: variables as any,
        })) as GraphQLResult<T>;

        if (result.errors && result.errors.length > 0) {
          throw new APIError(result.errors[0].message, undefined, result.errors);
        }

        if (!result.data) {
          throw new APIError('No data returned from query');
        }

        return result.data;
      } catch (error) {
        if (error instanceof APIError) {
          throw error;
        }
        throw new APIError('Query failed', undefined, error);
      }
    });
  }

  /**
   * Execute a GraphQL mutation with retry logic
   */
  async mutate<T = unknown>(mutation: string, variables: Record<string, any>): Promise<T> {
    return this.executeWithRetry(async () => {
      try {
        const result = (await this.client.graphql({
          query: mutation,
          variables: variables as any,
        })) as GraphQLResult<T>;

        if (result.errors && result.errors.length > 0) {
          throw new APIError(result.errors[0].message, undefined, result.errors);
        }

        if (!result.data) {
          throw new APIError('No data returned from mutation');
        }

        return result.data;
      } catch (error) {
        if (error instanceof APIError) {
          throw error;
        }
        throw new APIError('Mutation failed', undefined, error);
      }
    });
  }

  /**
   * Subscribe to GraphQL subscription
   * Returns an unsubscribe function
   */
  subscribe<T = unknown>(
    subscription: string,
    callback: (data: T) => void,
    onError?: (error: Error) => void
  ): () => void {
    try {
      const observable = this.client.graphql({ query: subscription });

      // Check if the result is subscribable
      if ('subscribe' in observable) {
        const sub = (observable as any).subscribe({
          next: (result: any) => {
            if ('data' in result && result.data) {
              callback(result.data as T);
            }
          },
          error: (error: any) => {
            const apiError = new APIError('Subscription error', undefined, error);
            if (onError) {
              onError(apiError);
            } else {
              console.error('Subscription error:', apiError);
            }
          },
        });

        return () => {
          sub.unsubscribe();
        };
      } else {
        throw new Error('GraphQL result is not subscribable');
      }
    } catch (error) {
      const apiError = new APIError('Failed to create subscription', undefined, error);
      if (onError) {
        onError(apiError);
      } else {
        console.error('Subscription creation error:', apiError);
      }
      return () => {}; // Return no-op unsubscribe function
    }
  }

  /**
   * Execute an operation with exponential backoff retry logic
   */
  private async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error | undefined;
    let delay = this.retryConfig.initialDelayMs;

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry if this is the last attempt or error is not retryable
        if (attempt === this.retryConfig.maxRetries || !isRetryableError(error)) {
          break;
        }

        // Wait before retrying with exponential backoff
        await sleep(Math.min(delay, this.retryConfig.maxDelayMs));
        delay *= this.retryConfig.backoffMultiplier;
      }
    }

    throw lastError || new APIError('Operation failed after retries');
  }
}

/**
 * Singleton instance of APIService
 */
export const apiService = new APIService();
