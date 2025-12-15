/**
 * Storage Service Layer
 * Provides a unified interface for S3 file operations with error handling and retry logic
 */

import { uploadData, getUrl, remove, list } from 'aws-amplify/storage';

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
 * Custom error class for storage errors
 */
export class StorageError extends Error {
  public originalError?: unknown;

  constructor(message: string, originalError?: unknown) {
    super(message);
    this.name = 'StorageError';
    this.originalError = originalError;
  }
}

/**
 * Determines if an error is retryable
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('connection') ||
      message.includes('throttl') ||
      message.includes('503') ||
      message.includes('500')
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
 * Options for file upload
 */
export interface UploadOptions {
  contentType?: string;
  metadata?: Record<string, string>;
  onProgress?: (progress: { transferredBytes: number; totalBytes?: number }) => void;
}

/**
 * Options for getting signed URLs
 */
export interface GetUrlOptions {
  expiresIn?: number; // Expiration time in seconds (default: 900 = 15 minutes)
}

/**
 * Storage Service class for S3 operations
 */
export class StorageService {
  private retryConfig: RetryConfig;

  constructor(retryConfig: Partial<RetryConfig> = {}) {
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  }

  /**
   * Upload a file to S3
   * @param key - The S3 key (path) for the file
   * @param data - The file data (Blob, File, or string)
   * @param options - Upload options
   * @returns The S3 key of the uploaded file
   */
  async uploadFile(
    key: string,
    data: Blob | File | string,
    options: UploadOptions = {}
  ): Promise<string> {
    return this.executeWithRetry(async () => {
      try {
        const uploadOptions: {
          data: Blob | File | string;
          path: string;
          options?: {
            contentType?: string;
            metadata?: Record<string, string>;
            onProgress?: (event: { transferredBytes: number; totalBytes?: number }) => void;
          };
        } = {
          data,
          path: key,
        };

        if (options.contentType || options.metadata || options.onProgress) {
          uploadOptions.options = {
            contentType: options.contentType,
            metadata: options.metadata,
            onProgress: options.onProgress,
          };
        }

        await uploadData(uploadOptions).result;

        // Return the key as the path
        return key;
      } catch (error) {
        throw new StorageError('Failed to upload file', error);
      }
    });
  }

  /**
   * Get a signed URL for downloading a file
   * @param key - The S3 key (path) of the file
   * @param options - URL options
   * @returns A signed URL for accessing the file
   */
  async getSignedUrl(key: string, options: GetUrlOptions = {}): Promise<string> {
    return this.executeWithRetry(async () => {
      try {
        const result = await getUrl({
          path: key,
          options: {
            expiresIn: options.expiresIn || 900, // Default 15 minutes
          },
        });

        return result.url.toString();
      } catch (error) {
        throw new StorageError('Failed to get signed URL', error);
      }
    });
  }

  /**
   * Download a file from S3
   * @param key - The S3 key (path) of the file
   * @returns The file data as a Blob
   */
  async downloadFile(key: string): Promise<Blob> {
    return this.executeWithRetry(async () => {
      try {
        // Get signed URL and fetch the file
        const url = await this.getSignedUrl(key);
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.blob();
      } catch (error) {
        throw new StorageError('Failed to download file', error);
      }
    });
  }

  /**
   * Delete a file from S3
   * @param key - The S3 key (path) of the file to delete
   */
  async deleteFile(key: string): Promise<void> {
    return this.executeWithRetry(async () => {
      try {
        await remove({ path: key });
      } catch (error) {
        throw new StorageError('Failed to delete file', error);
      }
    });
  }

  /**
   * List files in S3 with optional prefix
   * @param prefix - Optional prefix to filter files
   * @returns Array of file keys
   */
  async listFiles(prefix?: string): Promise<string[]> {
    return this.executeWithRetry(async () => {
      try {
        const result = await list({
          path: prefix || '',
        });

        return result.items.map((item) => (item as any).path || (item as any).key || '');
      } catch (error) {
        throw new StorageError('Failed to list files', error);
      }
    });
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

    throw lastError || new StorageError('Operation failed after retries');
  }
}

/**
 * Singleton instance of StorageService
 */
export const storageService = new StorageService();
