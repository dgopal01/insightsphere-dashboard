/**
 * Analytics Tracking Utilities
 * User behavior and event tracking
 * Requirement 9.4: Add user analytics tracking (optional)
 */

/**
 * Analytics event types
 */
export type AnalyticsEventType =
  | 'page_view'
  | 'button_click'
  | 'form_submit'
  | 'api_call'
  | 'error'
  | 'user_action'
  | 'performance';

/**
 * Analytics event interface
 */
export interface AnalyticsEvent {
  type: AnalyticsEventType;
  category: string;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, unknown>;
  timestamp: number;
  sessionId?: string;
  userId?: string;
}

/**
 * Page view event
 */
export interface PageViewEvent {
  path: string;
  title: string;
  referrer?: string;
}

/**
 * User action event
 */
export interface UserActionEvent {
  action: string;
  target: string;
  value?: number;
  metadata?: Record<string, unknown>;
}

// Session ID for tracking user sessions
let sessionId: string | null = null;
let userId: string | null = null;

/**
 * Generate a unique session ID
 */
const generateSessionId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Initialize analytics
 * Requirement 9.4: User analytics tracking
 */
export const initAnalytics = () => {
  // Generate session ID
  sessionId = generateSessionId();

  // Track initial page view
  trackPageView({
    path: window.location.pathname,
    title: document.title,
    referrer: document.referrer,
  });

  // Track page visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      trackEvent({
        type: 'user_action',
        category: 'Engagement',
        action: 'page_hidden',
        timestamp: Date.now(),
      });
    } else {
      trackEvent({
        type: 'user_action',
        category: 'Engagement',
        action: 'page_visible',
        timestamp: Date.now(),
      });
    }
  });

  // Track unload
  window.addEventListener('beforeunload', () => {
    trackEvent({
      type: 'user_action',
      category: 'Engagement',
      action: 'page_unload',
      timestamp: Date.now(),
    });
  });

  if (import.meta.env.MODE === 'development') {
    console.log('[Analytics] Initialized with session:', sessionId);
  }
};

/**
 * Set user ID for tracking
 */
export const setAnalyticsUserId = (id: string | null) => {
  userId = id;
  if (import.meta.env.MODE === 'development') {
    console.log('[Analytics] User ID set:', id);
  }
};

/**
 * Track a generic event
 * Requirement 9.4: User analytics tracking
 */
export const trackEvent = (event: Omit<AnalyticsEvent, 'sessionId' | 'userId'>) => {
  const fullEvent: AnalyticsEvent = {
    ...event,
    sessionId: sessionId || undefined,
    userId: userId || undefined,
  };

  // Log in development
  if (import.meta.env.MODE === 'development') {
    console.log('[Analytics Event]', fullEvent);
  }

  // Send to analytics service in production
  if (import.meta.env.MODE === 'production' && import.meta.env.VITE_ENABLE_ANALYTICS === 'true') {
    sendToAnalyticsService(fullEvent);
  }

  // Store locally for custom dashboard
  storeEventLocally(fullEvent);
};

/**
 * Track page view
 */
export const trackPageView = (pageView: PageViewEvent) => {
  trackEvent({
    type: 'page_view',
    category: 'Navigation',
    action: 'page_view',
    label: pageView.path,
    metadata: {
      title: pageView.title,
      referrer: pageView.referrer,
    },
    timestamp: Date.now(),
  });
};

/**
 * Track user action
 */
export const trackUserAction = (action: UserActionEvent) => {
  trackEvent({
    type: 'user_action',
    category: 'User Action',
    action: action.action,
    label: action.target,
    value: action.value,
    metadata: action.metadata,
    timestamp: Date.now(),
  });
};

/**
 * Track button click
 */
export const trackButtonClick = (buttonName: string, metadata?: Record<string, unknown>) => {
  trackEvent({
    type: 'button_click',
    category: 'Interaction',
    action: 'button_click',
    label: buttonName,
    metadata,
    timestamp: Date.now(),
  });
};

/**
 * Track form submission
 */
export const trackFormSubmit = (formName: string, success: boolean) => {
  trackEvent({
    type: 'form_submit',
    category: 'Form',
    action: 'form_submit',
    label: formName,
    value: success ? 1 : 0,
    metadata: { success },
    timestamp: Date.now(),
  });
};

/**
 * Track API call
 */
export const trackApiCall = (apiName: string, duration: number, success: boolean) => {
  trackEvent({
    type: 'api_call',
    category: 'API',
    action: apiName,
    value: duration,
    metadata: { success },
    timestamp: Date.now(),
  });
};

/**
 * Track error
 */
export const trackError = (
  errorType: string,
  errorMessage: string,
  metadata?: Record<string, unknown>
) => {
  trackEvent({
    type: 'error',
    category: 'Error',
    action: errorType,
    label: errorMessage,
    metadata,
    timestamp: Date.now(),
  });
};

/**
 * Send event to analytics service
 */
const sendToAnalyticsService = async (event: AnalyticsEvent) => {
  try {
    // Example: Send to Google Analytics
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        ...event.metadata,
      });
    }

    // Example: Send to custom analytics endpoint
    await fetch('/api/analytics/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    }).catch((error) => {
      console.error('[Analytics] Failed to send event:', error);
    });
  } catch (error) {
    console.error('[Analytics] Error sending event:', error);
  }
};

/**
 * Store event locally for custom dashboard
 * Requirement 9.5: Create custom dashboards for key metrics
 */
const storeEventLocally = (event: AnalyticsEvent) => {
  try {
    const key = 'insightsphere_analytics_events';
    const existing = localStorage.getItem(key);
    const events = existing ? JSON.parse(existing) : [];

    // Keep only last 500 events
    events.push(event);
    if (events.length > 500) {
      events.shift();
    }

    localStorage.setItem(key, JSON.stringify(events));
  } catch (error) {
    console.error('[Analytics] Failed to store event locally:', error);
  }
};

/**
 * Get stored analytics events
 * Requirement 9.5: Custom dashboards
 */
export const getStoredAnalyticsEvents = (): AnalyticsEvent[] => {
  try {
    const key = 'insightsphere_analytics_events';
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('[Analytics] Failed to retrieve events:', error);
    return [];
  }
};

/**
 * Get analytics summary
 */
export const getAnalyticsSummary = () => {
  const events = getStoredAnalyticsEvents();

  return {
    totalEvents: events.length,
    pageViews: events.filter((e) => e.type === 'page_view').length,
    userActions: events.filter((e) => e.type === 'user_action').length,
    errors: events.filter((e) => e.type === 'error').length,
    apiCalls: events.filter((e) => e.type === 'api_call').length,
    sessionId,
    userId,
  };
};

/**
 * Clear analytics data
 */
export const clearAnalyticsData = () => {
  try {
    localStorage.removeItem('insightsphere_analytics_events');
  } catch (error) {
    console.error('[Analytics] Failed to clear data:', error);
  }
};
