/**
 * Type definition tests for Chat Logs Review System
 * Validates that all required types are properly defined and exported
 */

import { describe, it, expect } from 'vitest';
import type {
  ChatLogEntry,
  FeedbackLogEntry,
  ReviewMetrics,
  ChatLogFilters,
  FeedbackLogFilters,
  PaginationState,
  ReviewData,
} from '../index';

describe('Core Data Types', () => {
  it('should have ChatLogEntry type defined', () => {
    const chatLog: ChatLogEntry = {
      log_id: 'test-log-1',
      timestamp: '2024-01-01T00:00:00Z',
      carrier_name: 'TestCarrier',
      question: 'Test question',
      response: 'Test response',
    };

    expect(chatLog.log_id).toBe('test-log-1');
    expect(chatLog.carrier_name).toBe('TestCarrier');
  });

  it('should have FeedbackLogEntry type defined', () => {
    const feedback: FeedbackLogEntry = {
      id: 'test-feedback-1',
      datetime: '2024-01-01T00:00:00Z',
      carrier: 'TestCarrier',
    };

    expect(feedback.id).toBe('test-feedback-1');
    expect(feedback.carrier).toBe('TestCarrier');
  });

  it('should have ReviewMetrics type defined', () => {
    const metrics: ReviewMetrics = {
      totalChatLogs: 100,
      reviewedChatLogs: 50,
      pendingChatLogs: 50,
      totalFeedbackLogs: 75,
      reviewedFeedbackLogs: 25,
      pendingFeedbackLogs: 50,
    };

    expect(metrics.totalChatLogs).toBe(100);
    expect(metrics.reviewedChatLogs).toBe(50);
  });

  it('should have ChatLogFilters type defined', () => {
    const filters: ChatLogFilters = {
      carrier_name: 'TestCarrier',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      reviewStatus: 'pending',
    };

    expect(filters.carrier_name).toBe('TestCarrier');
    expect(filters.reviewStatus).toBe('pending');
  });

  it('should have FeedbackLogFilters type defined', () => {
    const filters: FeedbackLogFilters = {
      carrier: 'TestCarrier',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      reviewStatus: 'reviewed',
    };

    expect(filters.carrier).toBe('TestCarrier');
    expect(filters.reviewStatus).toBe('reviewed');
  });

  it('should have PaginationState type defined', () => {
    const pagination: PaginationState = {
      currentPage: 1,
      pageSize: 50,
      nextToken: 'token123',
      hasMore: true,
    };

    expect(pagination.currentPage).toBe(1);
    expect(pagination.pageSize).toBe(50);
    expect(pagination.hasMore).toBe(true);
  });

  it('should have ReviewData type defined', () => {
    const reviewData: ReviewData = {
      rev_comment: 'This is a review comment',
      rev_feedback: 'This is review feedback',
    };

    expect(reviewData.rev_comment).toBe('This is a review comment');
    expect(reviewData.rev_feedback).toBe('This is review feedback');
  });

  it('should allow optional fields in ChatLogEntry', () => {
    const chatLog: ChatLogEntry = {
      log_id: 'test-log-2',
      timestamp: '2024-01-01T00:00:00Z',
      carrier_name: 'TestCarrier',
      question: 'Test question',
      response: 'Test response',
      chat_id: 'chat-123',
      citation: 'Citation text',
      rev_comment: 'Review comment',
      rev_feedback: 'Review feedback',
    };

    expect(chatLog.chat_id).toBe('chat-123');
    expect(chatLog.rev_comment).toBe('Review comment');
  });

  it('should allow optional fields in FeedbackLogEntry', () => {
    const feedback: FeedbackLogEntry = {
      id: 'test-feedback-2',
      datetime: '2024-01-01T00:00:00Z',
      carrier: 'TestCarrier',
      comments: 'User comments',
      feedback: 'User feedback',
      question: 'Question text',
      response: 'Response text',
      rev_comment: 'Review comment',
      rev_feedback: 'Review feedback',
    };

    expect(feedback.comments).toBe('User comments');
    expect(feedback.rev_comment).toBe('Review comment');
  });

  it('should support all reviewStatus values in ChatLogFilters', () => {
    const allFilter: ChatLogFilters = { reviewStatus: 'all' };
    const reviewedFilter: ChatLogFilters = { reviewStatus: 'reviewed' };
    const pendingFilter: ChatLogFilters = { reviewStatus: 'pending' };

    expect(allFilter.reviewStatus).toBe('all');
    expect(reviewedFilter.reviewStatus).toBe('reviewed');
    expect(pendingFilter.reviewStatus).toBe('pending');
  });

  it('should support all reviewStatus values in FeedbackLogFilters', () => {
    const allFilter: FeedbackLogFilters = { reviewStatus: 'all' };
    const reviewedFilter: FeedbackLogFilters = { reviewStatus: 'reviewed' };
    const pendingFilter: FeedbackLogFilters = { reviewStatus: 'pending' };

    expect(allFilter.reviewStatus).toBe('all');
    expect(reviewedFilter.reviewStatus).toBe('reviewed');
    expect(pendingFilter.reviewStatus).toBe('pending');
  });
});
