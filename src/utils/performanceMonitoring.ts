/**
 * Performance Monitoring Utilities
 * Tracks Web Vitals and performance metrics
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */

import { onCLS, onINP, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';

/**
 * Web Vitals metrics interface
 */
export interface WebVitalsMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType?: string;
}

/**
 * Analytics event interface
 */
export interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp: number;
}

/**
 * Report Web Vitals metric
 * Requirement 9.3: Performance monitoring
 */
export const reportWebVitals = (metric: Metric) => {
  const webVitalMetric: WebVitalsMetric = {
    name: metric.name as WebVitalsMetric['name'],
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
  };

  // Log to console in development
  if (import.meta.env.MODE === 'development') {
    console.log(`[Web Vitals] ${webVitalMetric.name}:`, {
      value: webVitalMetric.value,
      rating: webVitalMetric.rating,
      id: webVitalMetric.id,
    });
  }

  // Send to analytics service in production
  if (import.meta.env.MODE === 'production') {
    sendToAnalytics({
      category: 'Web Vitals',
      action: webVitalMetric.name,
      label: webVitalMetric.rating,
      value: Math.round(webVitalMetric.value),
      timestamp: Date.now(),
    });
  }

  // Send to CloudWatch (if configured)
  sendToCloudWatch('WebVitals', webVitalMetric);
};

/**
 * Measure component render time
 */
export const measureRenderTime = (componentName: string, callback: () => void) => {
  const startTime = performance.now();
  callback();
  const endTime = performance.now();
  const renderTime = endTime - startTime;

  if (import.meta.env.MODE === 'development' && renderTime > 16) {
    // Warn if render takes longer than one frame (16ms)
    console.warn(`[Performance] ${componentName} render took ${renderTime.toFixed(2)}ms`);
  }

  return renderTime;
};

/**
 * Track bundle size and loading performance
 */
export const trackBundlePerformance = () => {
  if (typeof window === 'undefined') return;

  // Wait for page load
  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    if (perfData) {
      const metrics = {
        dns: perfData.domainLookupEnd - perfData.domainLookupStart,
        tcp: perfData.connectEnd - perfData.connectStart,
        request: perfData.responseStart - perfData.requestStart,
        response: perfData.responseEnd - perfData.responseStart,
        dom: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        load: perfData.loadEventEnd - perfData.loadEventStart,
        total: perfData.loadEventEnd - perfData.fetchStart,
      };

      if (import.meta.env.MODE === 'development') {
        console.log('[Performance] Page Load Metrics:', metrics);
      }

      // Check if total load time exceeds threshold (3 seconds)
      if (metrics.total > 3000) {
        console.warn(
          `[Performance] Page load time (${metrics.total.toFixed(0)}ms) exceeds 3s threshold`
        );
      }
    }

    // Track resource sizes
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const jsResources = resources.filter((r) => r.name.endsWith('.js'));
    const totalJsSize = jsResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);

    if (import.meta.env.MODE === 'development') {
      console.log('[Performance] JavaScript Bundle Size:', {
        totalKB: (totalJsSize / 1024).toFixed(2),
        files: jsResources.length,
      });
    }

    // Warn if bundle size exceeds 500KB
    if (totalJsSize > 500 * 1024) {
      console.warn(
        `[Performance] JavaScript bundle size (${(totalJsSize / 1024).toFixed(0)}KB) exceeds 500KB threshold`
      );
    }
  });
};

/**
 * Send analytics event
 * Requirement 9.4: User analytics tracking
 */
export const sendToAnalytics = (event: AnalyticsEvent) => {
  // In production, send to analytics service (e.g., Google Analytics, Amplitude)
  if (import.meta.env.MODE === 'production') {
    // Example: gtag('event', event.action, { ... });
    console.log('[Analytics]', event);
  }

  // Store locally for custom dashboard
  storeMetricLocally('analytics', event);
};

/**
 * Send metric to CloudWatch
 * Requirement 9.4: CloudWatch integration for backend monitoring
 */
export const sendToCloudWatch = (namespace: string, metric: unknown) => {
  // In production with AWS credentials, send to CloudWatch
  if (import.meta.env.MODE === 'production' && import.meta.env.VITE_ENABLE_CLOUDWATCH === 'true') {
    // This would typically be done via a backend API endpoint
    // to avoid exposing AWS credentials in the frontend
    fetch('/api/metrics/cloudwatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ namespace, metric, timestamp: Date.now() }),
    }).catch((error) => {
      console.error('[CloudWatch] Failed to send metric:', error);
    });
  }
};

/**
 * Store metric locally for custom dashboard
 * Requirement 9.5: Create custom dashboards for key metrics
 */
const storeMetricLocally = (type: string, data: unknown) => {
  try {
    const key = `insightsphere_metrics_${type}`;
    const existing = localStorage.getItem(key);
    const metrics = existing ? JSON.parse(existing) : [];

    // Keep only last 100 metrics to avoid storage issues
    const metricWithTimestamp =
      typeof data === 'object' && data !== null
        ? { ...(data as Record<string, unknown>), timestamp: Date.now() }
        : { value: data, timestamp: Date.now() };

    metrics.push(metricWithTimestamp);
    if (metrics.length > 100) {
      metrics.shift();
    }

    localStorage.setItem(key, JSON.stringify(metrics));
  } catch (error) {
    console.error('[Metrics Storage] Failed to store metric:', error);
  }
};

/**
 * Get stored metrics for custom dashboard
 * Requirement 9.5: Create custom dashboards for key metrics
 */
export const getStoredMetrics = (type: string): unknown[] => {
  try {
    const key = `insightsphere_metrics_${type}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('[Metrics Storage] Failed to retrieve metrics:', error);
    return [];
  }
};

/**
 * Clear stored metrics
 */
export const clearStoredMetrics = (type?: string) => {
  try {
    if (type) {
      localStorage.removeItem(`insightsphere_metrics_${type}`);
    } else {
      // Clear all metrics
      const keys = Object.keys(localStorage).filter((key) =>
        key.startsWith('insightsphere_metrics_')
      );
      keys.forEach((key) => localStorage.removeItem(key));
    }
  } catch (error) {
    console.error('[Metrics Storage] Failed to clear metrics:', error);
  }
};

/**
 * Initialize performance monitoring
 * Requirements: 9.3, 9.4, 9.5
 */
export const initPerformanceMonitoring = () => {
  // Track bundle performance
  trackBundlePerformance();

  // Track Web Vitals
  onCLS(reportWebVitals);
  onINP(reportWebVitals); // INP replaced FID in web-vitals v4
  onFCP(reportWebVitals);
  onLCP(reportWebVitals);
  onTTFB(reportWebVitals);

  // Log initialization
  if (import.meta.env.MODE === 'development') {
    console.log('[Performance Monitoring] Initialized');
  }
};

/**
 * Measure API call performance
 */
export const measureApiCall = async <T>(apiName: string, apiCall: () => Promise<T>): Promise<T> => {
  const startTime = performance.now();

  try {
    const result = await apiCall();
    const endTime = performance.now();
    const duration = endTime - startTime;

    if (import.meta.env.MODE === 'development') {
      console.log(`[API Performance] ${apiName}: ${duration.toFixed(2)}ms`);
    }

    // Warn if API call takes longer than 1 second
    if (duration > 1000) {
      console.warn(`[API Performance] ${apiName} took ${duration.toFixed(0)}ms (>1s threshold)`);
    }

    return result;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;

    console.error(`[API Performance] ${apiName} failed after ${duration.toFixed(2)}ms`, error);
    throw error;
  }
};
