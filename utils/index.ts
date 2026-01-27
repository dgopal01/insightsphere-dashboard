/**
 * Utilities barrel export
 */

export {
  calculateFeedbackRatio,
  calculateAverageRating,
  filterFeedbackByTimePeriod,
  calculateFeedbackMetrics,
} from './feedbackMetrics';

export {
  sanitizeText,
  sanitizeFeedbackComment,
  sanitizeSearchInput,
  sanitizeHtml,
} from './sanitization';

export {
  validateRequired,
  validateCharacterLimit,
  validateReviewComment,
  validateReviewFeedback,
  validateReviewFields,
  escapeSpecialCharacters,
  unescapeSpecialCharacters,
  validateAlphanumeric,
  validateReviewCommentComprehensive,
  validateReviewFeedbackComprehensive,
  getRemainingCharacters,
  isApproachingLimit,
  CHARACTER_LIMITS,
  VALIDATION_ERRORS,
} from './validation';

export type { ValidationResult } from './validation';

export {
  classifyError,
  getErrorSeverity,
  getUserFriendlyMessage,
  createErrorInfo,
  logError,
  handleError,
  isRetryableError,
  getRetryDelay,
  formatErrorForDisplay,
} from './errorHandling';

export type { ErrorInfo, ErrorType, ErrorSeverity } from './errorHandling';

export {
  reportWebVitals,
  measureRenderTime,
  trackBundlePerformance,
  initPerformanceMonitoring,
  measureApiCall,
  sendToAnalytics,
  sendToCloudWatch,
  getStoredMetrics,
  clearStoredMetrics,
} from './performanceMonitoring';

export type { WebVitalsMetric, AnalyticsEvent } from './performanceMonitoring';

export {
  initErrorTracking,
  captureError,
  captureMessage,
  setUserContext,
  addBreadcrumb,
  startTransaction,
  withErrorBoundary,
} from './errorTracking';

export type { ErrorSeverity as SentryErrorSeverity, ErrorContext } from './errorTracking';

export {
  sendMetricToCloudWatch,
  sendLogToCloudWatch,
  trackApiMetric,
  trackUserAction as trackCloudWatchUserAction,
  trackErrorMetric,
  trackPerformanceMetric,
  getCloudWatchDashboardConfig,
} from './cloudWatchMonitoring';

export type { CloudWatchMetric, CloudWatchLogEvent } from './cloudWatchMonitoring';

export {
  initAnalytics,
  setAnalyticsUserId,
  trackEvent,
  trackPageView,
  trackUserAction,
  trackButtonClick,
  trackFormSubmit,
  trackApiCall,
  trackError,
  getStoredAnalyticsEvents,
  getAnalyticsSummary,
  clearAnalyticsData,
} from './analytics';

export type {
  AnalyticsEventType,
  AnalyticsEvent as AnalyticsEventData,
  PageViewEvent,
  UserActionEvent,
} from './analytics';
