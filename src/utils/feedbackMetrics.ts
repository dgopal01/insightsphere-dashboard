/**
 * Utility functions for calculating feedback metrics
 * Requirements: 4.1, 4.2, 4.4, 4.5
 */

import type { Feedback, FeedbackMetrics } from '../types';

/**
 * Calculate positive/negative feedback ratio
 * Requirement 4.1: Display positive/negative feedback ratio
 *
 * @param feedback - Array of feedback entries
 * @returns Object with positive count, negative count, and ratio
 */
export function calculateFeedbackRatio(feedback: Feedback[]): {
  positiveCount: number;
  negativeCount: number;
  ratio: number;
} {
  if (feedback.length === 0) {
    return {
      positiveCount: 0,
      negativeCount: 0,
      ratio: 0,
    };
  }

  const positiveCount = feedback.filter((f) => f.thumbsUp).length;
  const negativeCount = feedback.filter((f) => !f.thumbsUp).length;

  // Calculate ratio as positive / negative (handle division by zero)
  const ratio = negativeCount === 0 ? positiveCount : positiveCount / negativeCount;

  return {
    positiveCount,
    negativeCount,
    ratio,
  };
}

/**
 * Calculate average rating from feedback entries
 * Requirement 4.4: Calculate average rating
 *
 * @param feedback - Array of feedback entries
 * @returns Average rating (0 if no feedback)
 */
export function calculateAverageRating(feedback: Feedback[]): number {
  if (feedback.length === 0) {
    return 0;
  }

  const totalRating = feedback.reduce((sum, f) => sum + f.rating, 0);
  return totalRating / feedback.length;
}

/**
 * Filter feedback by time period
 * Requirement 4.2: Add time period filtering for metrics
 *
 * @param feedback - Array of feedback entries
 * @param startDate - Start date in ISO 8601 format
 * @param endDate - End date in ISO 8601 format
 * @returns Filtered feedback within the time period
 */
export function filterFeedbackByTimePeriod(
  feedback: Feedback[],
  startDate?: string,
  endDate?: string
): Feedback[] {
  return feedback.filter((f) => {
    const timestamp = f.timestamp;

    // Check start date constraint
    if (startDate && timestamp < startDate) {
      return false;
    }

    // Check end date constraint
    if (endDate && timestamp > endDate) {
      return false;
    }

    return true;
  });
}

/**
 * Calculate comprehensive feedback metrics
 * Combines all metric calculations into a single function
 *
 * @param feedback - Array of feedback entries
 * @param startDate - Optional start date for filtering
 * @param endDate - Optional end date for filtering
 * @returns Complete feedback metrics
 */
export function calculateFeedbackMetrics(
  feedback: Feedback[],
  startDate?: string,
  endDate?: string
): FeedbackMetrics & { ratio: number } {
  // Filter by time period if dates provided
  const filteredFeedback = filterFeedbackByTimePeriod(feedback, startDate, endDate);

  // Calculate ratio
  const { positiveCount, negativeCount, ratio } = calculateFeedbackRatio(filteredFeedback);

  // Calculate average rating
  const averageRating = calculateAverageRating(filteredFeedback);

  return {
    positiveCount,
    negativeCount,
    averageRating,
    totalCount: filteredFeedback.length,
    ratio,
  };
}
