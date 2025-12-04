/**
 * Monitoring Utilities Tests
 * Tests for error tracking, analytics, and performance monitoring
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getStoredMetrics, clearStoredMetrics } from '../performanceMonitoring';
import {
  trackUserAction,
  trackButtonClick,
  trackFormSubmit,
  getStoredAnalyticsEvents,
  getAnalyticsSummary,
  clearAnalyticsData,
} from '../analytics';

describe('Performance Monitoring', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should store and retrieve metrics', () => {
    // Store a metric
    localStorage.setItem(
      'insightsphere_metrics_test',
      JSON.stringify([{ value: 100, timestamp: Date.now() }])
    );

    const metrics = getStoredMetrics('test');
    expect(metrics).toHaveLength(1);
    expect(metrics[0]).toHaveProperty('value', 100);
  });

  it('should clear stored metrics', () => {
    localStorage.setItem('insightsphere_metrics_test', JSON.stringify([{ value: 100 }]));

    clearStoredMetrics('test');

    const metrics = getStoredMetrics('test');
    expect(metrics).toHaveLength(0);
  });

  it('should clear all metrics when no type specified', () => {
    localStorage.setItem('insightsphere_metrics_test1', JSON.stringify([{ value: 100 }]));
    localStorage.setItem('insightsphere_metrics_test2', JSON.stringify([{ value: 200 }]));

    clearStoredMetrics();

    expect(getStoredMetrics('test1')).toHaveLength(0);
    expect(getStoredMetrics('test2')).toHaveLength(0);
  });
});

describe('Analytics', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should track user actions', () => {
    trackUserAction({
      action: 'test_action',
      target: 'test_target',
      value: 123,
    });

    const events = getStoredAnalyticsEvents();
    expect(events.length).toBeGreaterThan(0);

    const lastEvent = events[events.length - 1];
    expect(lastEvent.action).toBe('test_action');
    expect(lastEvent.value).toBe(123);
  });

  it('should track button clicks', () => {
    trackButtonClick('test-button', { extra: 'data' });

    const events = getStoredAnalyticsEvents();
    const clickEvent = events.find((e) => e.type === 'button_click');

    expect(clickEvent).toBeDefined();
    expect(clickEvent?.label).toBe('test-button');
    expect(clickEvent?.metadata).toHaveProperty('extra', 'data');
  });

  it('should track form submissions', () => {
    trackFormSubmit('test-form', true);

    const events = getStoredAnalyticsEvents();
    const formEvent = events.find((e) => e.type === 'form_submit');

    expect(formEvent).toBeDefined();
    expect(formEvent?.label).toBe('test-form');
    expect(formEvent?.value).toBe(1);
  });

  it('should generate analytics summary', () => {
    trackUserAction({ action: 'action1', target: 'target1' });
    trackButtonClick('button1');
    trackFormSubmit('form1', true);

    const summary = getAnalyticsSummary();

    expect(summary.totalEvents).toBeGreaterThan(0);
    expect(summary.userActions).toBeGreaterThan(0);
    expect(summary.sessionId).toBeDefined();
  });

  it('should clear analytics data', () => {
    trackUserAction({ action: 'test', target: 'test' });

    clearAnalyticsData();

    const events = getStoredAnalyticsEvents();
    expect(events).toHaveLength(0);
  });

  it('should limit stored events to 500', () => {
    // Store 499 events
    const events = Array.from({ length: 499 }, (_, i) => ({
      type: 'user_action' as const,
      category: 'test',
      action: `action${i}`,
      timestamp: Date.now(),
    }));

    localStorage.setItem('insightsphere_analytics_events', JSON.stringify(events));

    // Track two more events (should bring total to 500, then remove oldest)
    trackUserAction({ action: 'new_action_1', target: 'test' });
    trackUserAction({ action: 'new_action_2', target: 'test' });

    const storedEvents = getStoredAnalyticsEvents();
    expect(storedEvents.length).toBeLessThanOrEqual(500);
  });
});

describe('Error Tracking', () => {
  it('should handle errors gracefully when localStorage is unavailable', () => {
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = vi.fn(() => {
      throw new Error('Storage unavailable');
    });

    // Should not throw
    expect(() => {
      trackUserAction({ action: 'test', target: 'test' });
    }).not.toThrow();

    Storage.prototype.setItem = originalSetItem;
  });

  it('should handle errors when retrieving metrics', () => {
    const originalGetItem = Storage.prototype.getItem;
    Storage.prototype.getItem = vi.fn(() => {
      throw new Error('Storage unavailable');
    });

    const metrics = getStoredMetrics('test');
    expect(metrics).toEqual([]);

    Storage.prototype.getItem = originalGetItem;
  });
});
