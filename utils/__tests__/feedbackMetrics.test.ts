/**
 * Unit tests for feedback metrics utility functions
 */

import { describe, it, expect } from 'vitest';
import {
  calculateFeedbackRatio,
  calculateAverageRating,
  filterFeedbackByTimePeriod,
  calculateFeedbackMetrics,
} from '../feedbackMetrics';
import type { Feedback } from '../../types';

describe('feedbackMetrics utilities', () => {
  describe('calculateFeedbackRatio', () => {
    it('should calculate ratio correctly with positive and negative feedback', () => {
      const feedback: Feedback[] = [
        {
          id: '1',
          logId: 'log1',
          userId: 'user1',
          rating: 5,
          thumbsUp: true,
          timestamp: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          logId: 'log2',
          userId: 'user2',
          rating: 3,
          thumbsUp: false,
          timestamp: '2024-01-02T00:00:00Z',
        },
        {
          id: '3',
          logId: 'log3',
          userId: 'user3',
          rating: 4,
          thumbsUp: true,
          timestamp: '2024-01-03T00:00:00Z',
        },
      ];

      const result = calculateFeedbackRatio(feedback);

      expect(result.positiveCount).toBe(2);
      expect(result.negativeCount).toBe(1);
      expect(result.ratio).toBe(2); // 2 positive / 1 negative = 2
    });

    it('should handle empty feedback array', () => {
      const result = calculateFeedbackRatio([]);

      expect(result.positiveCount).toBe(0);
      expect(result.negativeCount).toBe(0);
      expect(result.ratio).toBe(0);
    });

    it('should handle all positive feedback', () => {
      const feedback: Feedback[] = [
        {
          id: '1',
          logId: 'log1',
          userId: 'user1',
          rating: 5,
          thumbsUp: true,
          timestamp: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          logId: 'log2',
          userId: 'user2',
          rating: 4,
          thumbsUp: true,
          timestamp: '2024-01-02T00:00:00Z',
        },
      ];

      const result = calculateFeedbackRatio(feedback);

      expect(result.positiveCount).toBe(2);
      expect(result.negativeCount).toBe(0);
      expect(result.ratio).toBe(2); // When no negative, ratio equals positive count
    });

    it('should handle all negative feedback', () => {
      const feedback: Feedback[] = [
        {
          id: '1',
          logId: 'log1',
          userId: 'user1',
          rating: 2,
          thumbsUp: false,
          timestamp: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          logId: 'log2',
          userId: 'user2',
          rating: 1,
          thumbsUp: false,
          timestamp: '2024-01-02T00:00:00Z',
        },
      ];

      const result = calculateFeedbackRatio(feedback);

      expect(result.positiveCount).toBe(0);
      expect(result.negativeCount).toBe(2);
      expect(result.ratio).toBe(0); // 0 positive / 2 negative = 0
    });
  });

  describe('calculateAverageRating', () => {
    it('should calculate average rating correctly', () => {
      const feedback: Feedback[] = [
        {
          id: '1',
          logId: 'log1',
          userId: 'user1',
          rating: 5,
          thumbsUp: true,
          timestamp: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          logId: 'log2',
          userId: 'user2',
          rating: 3,
          thumbsUp: false,
          timestamp: '2024-01-02T00:00:00Z',
        },
        {
          id: '3',
          logId: 'log3',
          userId: 'user3',
          rating: 4,
          thumbsUp: true,
          timestamp: '2024-01-03T00:00:00Z',
        },
      ];

      const result = calculateAverageRating(feedback);

      expect(result).toBe(4); // (5 + 3 + 4) / 3 = 4
    });

    it('should return 0 for empty feedback array', () => {
      const result = calculateAverageRating([]);

      expect(result).toBe(0);
    });

    it('should handle single feedback entry', () => {
      const feedback: Feedback[] = [
        {
          id: '1',
          logId: 'log1',
          userId: 'user1',
          rating: 5,
          thumbsUp: true,
          timestamp: '2024-01-01T00:00:00Z',
        },
      ];

      const result = calculateAverageRating(feedback);

      expect(result).toBe(5);
    });
  });

  describe('filterFeedbackByTimePeriod', () => {
    const feedback: Feedback[] = [
      {
        id: '1',
        logId: 'log1',
        userId: 'user1',
        rating: 5,
        thumbsUp: true,
        timestamp: '2024-01-01T00:00:00Z',
      },
      {
        id: '2',
        logId: 'log2',
        userId: 'user2',
        rating: 3,
        thumbsUp: false,
        timestamp: '2024-01-15T00:00:00Z',
      },
      {
        id: '3',
        logId: 'log3',
        userId: 'user3',
        rating: 4,
        thumbsUp: true,
        timestamp: '2024-02-01T00:00:00Z',
      },
    ];

    it('should filter by start date only', () => {
      const result = filterFeedbackByTimePeriod(feedback, '2024-01-10T00:00:00Z', undefined);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('2');
      expect(result[1].id).toBe('3');
    });

    it('should filter by end date only', () => {
      const result = filterFeedbackByTimePeriod(feedback, undefined, '2024-01-20T00:00:00Z');

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
    });

    it('should filter by both start and end date', () => {
      const result = filterFeedbackByTimePeriod(
        feedback,
        '2024-01-10T00:00:00Z',
        '2024-01-20T00:00:00Z'
      );

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('should return all feedback when no dates provided', () => {
      const result = filterFeedbackByTimePeriod(feedback, undefined, undefined);

      expect(result).toHaveLength(3);
    });

    it('should return empty array when no feedback matches', () => {
      const result = filterFeedbackByTimePeriod(
        feedback,
        '2024-03-01T00:00:00Z',
        '2024-03-31T00:00:00Z'
      );

      expect(result).toHaveLength(0);
    });
  });

  describe('calculateFeedbackMetrics', () => {
    const feedback: Feedback[] = [
      {
        id: '1',
        logId: 'log1',
        userId: 'user1',
        rating: 5,
        thumbsUp: true,
        timestamp: '2024-01-01T00:00:00Z',
      },
      {
        id: '2',
        logId: 'log2',
        userId: 'user2',
        rating: 3,
        thumbsUp: false,
        timestamp: '2024-01-15T00:00:00Z',
      },
      {
        id: '3',
        logId: 'log3',
        userId: 'user3',
        rating: 4,
        thumbsUp: true,
        timestamp: '2024-02-01T00:00:00Z',
      },
    ];

    it('should calculate all metrics correctly', () => {
      const result = calculateFeedbackMetrics(feedback);

      expect(result.positiveCount).toBe(2);
      expect(result.negativeCount).toBe(1);
      expect(result.averageRating).toBe(4); // (5 + 3 + 4) / 3 = 4
      expect(result.totalCount).toBe(3);
      expect(result.ratio).toBe(2); // 2 positive / 1 negative = 2
    });

    it('should calculate metrics with time period filtering', () => {
      const result = calculateFeedbackMetrics(
        feedback,
        '2024-01-10T00:00:00Z',
        '2024-01-20T00:00:00Z'
      );

      expect(result.positiveCount).toBe(0);
      expect(result.negativeCount).toBe(1);
      expect(result.averageRating).toBe(3);
      expect(result.totalCount).toBe(1);
      expect(result.ratio).toBe(0);
    });

    it('should handle empty feedback array', () => {
      const result = calculateFeedbackMetrics([]);

      expect(result.positiveCount).toBe(0);
      expect(result.negativeCount).toBe(0);
      expect(result.averageRating).toBe(0);
      expect(result.totalCount).toBe(0);
      expect(result.ratio).toBe(0);
    });
  });
});
