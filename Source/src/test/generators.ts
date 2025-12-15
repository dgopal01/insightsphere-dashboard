import * as fc from 'fast-check';

/**
 * Fast-check generators for domain-specific data types
 * These generators create realistic test data that matches the application's constraints
 */

// ============================================================================
// Basic Generators
// ============================================================================

/**
 * Generate a valid chat log ID
 */
export const chatLogIdArbitrary = () => fc.uuid().map((id) => `log-${id}`);

/**
 * Generate a valid user ID
 */
export const userIdArbitrary = () => fc.uuid().map((id) => `user-${id}`);

/**
 * Generate a valid conversation ID
 */
export const conversationIdArbitrary = () => fc.uuid().map((id) => `conv-${id}`);

/**
 * Generate a valid timestamp (ISO 8601 format)
 */
export const timestampArbitrary = () =>
  fc
    .integer({ min: Date.parse('2020-01-01T00:00:00.000Z'), max: Date.parse('2025-12-31T23:59:59.999Z') })
    .map((timestamp) => new Date(timestamp).toISOString());

/**
 * Generate a valid rating (1-5)
 */
export const ratingArbitrary = () => fc.integer({ min: 1, max: 5 });

/**
 * Generate an invalid rating (outside 1-5 range)
 */
export const invalidRatingArbitrary = () =>
  fc.oneof(fc.integer({ max: 0 }), fc.integer({ min: 6 }));

/**
 * Generate a valid comment (0-1000 characters)
 */
export const commentArbitrary = () => fc.string({ maxLength: 1000 });

/**
 * Generate an invalid comment (> 1000 characters)
 */
export const invalidCommentArbitrary = () => fc.string({ minLength: 1001, maxLength: 2000 });

/**
 * Generate a thumbs up/down boolean
 */
export const thumbsArbitrary = () => fc.boolean();

/**
 * Generate a sentiment value
 */
export const sentimentArbitrary = () => fc.constantFrom('positive', 'negative', 'neutral');

/**
 * Generate a response time in milliseconds (realistic range)
 */
export const responseTimeArbitrary = () => fc.integer({ min: 100, max: 10000 });

/**
 * Generate an accuracy score (0-100)
 */
export const accuracyArbitrary = () => fc.float({ min: 0, max: 100, noNaN: true });

/**
 * Generate a date range
 */
export const dateRangeArbitrary = () =>
  fc
    .tuple(
      fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') }),
      fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') })
    )
    .map(([date1, date2]) => {
      const start = date1 < date2 ? date1 : date2;
      const end = date1 < date2 ? date2 : date1;
      return {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      };
    });

/**
 * Generate a theme value
 */
export const themeArbitrary = () => fc.constantFrom('light', 'dark');

// ============================================================================
// InsightSphere Dashboard Generators (Legacy)
// ============================================================================

/**
 * Generate a complete ChatLog object
 */
export const chatLogArbitrary = () =>
  fc.record({
    id: chatLogIdArbitrary(),
    conversationId: conversationIdArbitrary(),
    userId: userIdArbitrary(),
    timestamp: timestampArbitrary(),
    userMessage: fc.string({ minLength: 1, maxLength: 500 }),
    aiResponse: fc.string({ minLength: 1, maxLength: 1000 }),
    responseTime: responseTimeArbitrary(),
    accuracy: fc.option(accuracyArbitrary(), { nil: undefined }),
    sentiment: fc.option(sentimentArbitrary(), { nil: undefined }),
  });

/**
 * Generate a complete Feedback object
 */
export const feedbackArbitrary = () =>
  fc.record({
    id: fc.uuid(),
    logId: chatLogIdArbitrary(),
    userId: userIdArbitrary(),
    rating: ratingArbitrary(),
    thumbsUp: thumbsArbitrary(),
    comment: fc.option(commentArbitrary(), { nil: undefined }),
    timestamp: timestampArbitrary(),
    category: fc.option(fc.constantFrom('accuracy', 'helpfulness', 'speed'), { nil: undefined }),
  });

/**
 * Generate filter criteria
 */
export const logFiltersArbitrary = () =>
  fc.record({
    startDate: fc.option(timestampArbitrary(), { nil: undefined }),
    endDate: fc.option(timestampArbitrary(), { nil: undefined }),
    userId: fc.option(userIdArbitrary(), { nil: undefined }),
    conversationId: fc.option(conversationIdArbitrary(), { nil: undefined }),
    searchText: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
    sentiment: fc.option(sentimentArbitrary(), { nil: undefined }),
  });

// ============================================================================
// Chat Logs Review System Generators
// ============================================================================

/**
 * Generate a carrier name
 */
export const carrierNameArbitrary = () =>
  fc.constantFrom('Verizon', 'AT&T', 'T-Mobile', 'Sprint', 'US Cellular', 'Cricket');

/**
 * Generate a valid review comment (0-5000 characters)
 */
export const reviewCommentArbitrary = () => fc.string({ maxLength: 5000 });

/**
 * Generate an invalid review comment (> 5000 characters)
 */
export const invalidReviewCommentArbitrary = () =>
  fc.string({ minLength: 5001, maxLength: 6000 });

/**
 * Generate a valid review feedback (0-5000 characters)
 */
export const reviewFeedbackArbitrary = () => fc.string({ maxLength: 5000 });

/**
 * Generate an invalid review feedback (> 5000 characters)
 */
export const invalidReviewFeedbackArbitrary = () =>
  fc.string({ minLength: 5001, maxLength: 6000 });

/**
 * Generate a complete UnityAIAssistantLog (ChatLogEntry) object
 */
export const chatLogEntryArbitrary = () =>
  fc.record({
    log_id: fc.uuid(),
    timestamp: timestampArbitrary(),
    carrier_name: carrierNameArbitrary(),
    chat_id: fc.option(fc.uuid(), { nil: undefined }),
    citation: fc.option(fc.string({ maxLength: 500 }), { nil: undefined }),
    fi_name: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
    guardrail_id: fc.option(fc.uuid(), { nil: undefined }),
    guardrail_intervened: fc.option(fc.boolean(), { nil: undefined }),
    model_id: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
    question: fc.string({ minLength: 1, maxLength: 1000 }),
    response: fc.string({ minLength: 1, maxLength: 2000 }),
    rev_comment: fc.option(reviewCommentArbitrary(), { nil: undefined }),
    rev_feedback: fc.option(reviewFeedbackArbitrary(), { nil: undefined }),
    session_id: fc.option(fc.uuid(), { nil: undefined }),
    user_name: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
    usr_comment: fc.option(fc.string({ maxLength: 1000 }), { nil: undefined }),
    usr_feedback: fc.option(fc.string({ maxLength: 1000 }), { nil: undefined }),
  });

/**
 * Generate a reviewed ChatLogEntry (has rev_comment or rev_feedback)
 */
export const reviewedChatLogEntryArbitrary = () =>
  chatLogEntryArbitrary().chain((log) =>
    fc.record({
      rev_comment: fc.string({ minLength: 1, maxLength: 5000 }),
      rev_feedback: fc.string({ minLength: 1, maxLength: 5000 }),
    }).map((review) => ({
      ...log,
      ...review,
    }))
  );

/**
 * Generate a pending ChatLogEntry (no rev_comment and no rev_feedback)
 */
export const pendingChatLogEntryArbitrary = () =>
  chatLogEntryArbitrary().map((log) => ({
    ...log,
    rev_comment: undefined,
    rev_feedback: undefined,
  }));

/**
 * Generate a complete UserFeedback (FeedbackLogEntry) object
 */
export const feedbackLogEntryArbitrary = () =>
  fc.record({
    id: fc.uuid(),
    datetime: timestampArbitrary(),
    carrier: carrierNameArbitrary(),
    comments: fc.option(fc.string({ maxLength: 1000 }), { nil: undefined }),
    feedback: fc.option(fc.string({ maxLength: 1000 }), { nil: undefined }),
    question: fc.option(fc.string({ maxLength: 1000 }), { nil: undefined }),
    response: fc.option(fc.string({ maxLength: 2000 }), { nil: undefined }),
    session_id: fc.option(fc.uuid(), { nil: undefined }),
    type: fc.option(fc.constantFrom('positive', 'negative', 'neutral'), { nil: undefined }),
    username: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
    user_name: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
    rev_comment: fc.option(reviewCommentArbitrary(), { nil: undefined }),
    rev_feedback: fc.option(reviewFeedbackArbitrary(), { nil: undefined }),
  });

/**
 * Generate a reviewed FeedbackLogEntry (has rev_comment or rev_feedback)
 */
export const reviewedFeedbackLogEntryArbitrary = () =>
  feedbackLogEntryArbitrary().chain((log) =>
    fc.record({
      rev_comment: fc.string({ minLength: 1, maxLength: 5000 }),
      rev_feedback: fc.string({ minLength: 1, maxLength: 5000 }),
    }).map((review) => ({
      ...log,
      ...review,
    }))
  );

/**
 * Generate a pending FeedbackLogEntry (no rev_comment and no rev_feedback)
 */
export const pendingFeedbackLogEntryArbitrary = () =>
  feedbackLogEntryArbitrary().map((log) => ({
    ...log,
    rev_comment: undefined,
    rev_feedback: undefined,
  }));

/**
 * Generate ReviewData object
 */
export const reviewDataArbitrary = () =>
  fc.record({
    rev_comment: reviewCommentArbitrary(),
    rev_feedback: reviewFeedbackArbitrary(),
  });

/**
 * Generate ChatLogFilters object
 */
export const chatLogFiltersArbitrary = () =>
  fc.record({
    carrier_name: fc.option(carrierNameArbitrary(), { nil: undefined }),
    startDate: fc.option(timestampArbitrary(), { nil: undefined }),
    endDate: fc.option(timestampArbitrary(), { nil: undefined }),
    reviewStatus: fc.option(fc.constantFrom('all', 'reviewed', 'pending'), { nil: undefined }),
  });

/**
 * Generate FeedbackLogFilters object
 */
export const feedbackLogFiltersArbitrary = () =>
  fc.record({
    carrier: fc.option(carrierNameArbitrary(), { nil: undefined }),
    startDate: fc.option(timestampArbitrary(), { nil: undefined }),
    endDate: fc.option(timestampArbitrary(), { nil: undefined }),
    reviewStatus: fc.option(fc.constantFrom('all', 'reviewed', 'pending'), { nil: undefined }),
  });

/**
 * Generate PaginationState object
 */
export const paginationStateArbitrary = () =>
  fc.record({
    currentPage: fc.integer({ min: 1, max: 100 }),
    pageSize: fc.constantFrom(10, 25, 50, 100),
    nextToken: fc.option(fc.uuid(), { nil: null }),
    hasMore: fc.boolean(),
  });

/**
 * Generate ReviewMetrics object
 */
export const reviewMetricsArbitrary = () =>
  fc
    .record({
      totalChatLogs: fc.integer({ min: 0, max: 10000 }),
      reviewedChatLogs: fc.integer({ min: 0, max: 10000 }),
      totalFeedbackLogs: fc.integer({ min: 0, max: 10000 }),
      reviewedFeedbackLogs: fc.integer({ min: 0, max: 10000 }),
    })
    .map((metrics) => ({
      ...metrics,
      // Ensure reviewed counts don't exceed totals
      reviewedChatLogs: Math.min(metrics.reviewedChatLogs, metrics.totalChatLogs),
      reviewedFeedbackLogs: Math.min(metrics.reviewedFeedbackLogs, metrics.totalFeedbackLogs),
      // Calculate pending counts
      pendingChatLogs: metrics.totalChatLogs - Math.min(metrics.reviewedChatLogs, metrics.totalChatLogs),
      pendingFeedbackLogs: metrics.totalFeedbackLogs - Math.min(metrics.reviewedFeedbackLogs, metrics.totalFeedbackLogs),
    }));

/**
 * Generate XSS payload strings for testing sanitization
 */
export const xssPayloadArbitrary = () =>
  fc.constantFrom(
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert("XSS")>',
    '<svg onload=alert("XSS")>',
    'javascript:alert("XSS")',
    '<iframe src="javascript:alert(\'XSS\')">',
    '<body onload=alert("XSS")>',
    '<input onfocus=alert("XSS") autofocus>',
    '<select onfocus=alert("XSS") autofocus>',
    '<textarea onfocus=alert("XSS") autofocus>',
    '<keygen onfocus=alert("XSS") autofocus>',
    '<video><source onerror="alert(\'XSS\')">',
    '<audio src=x onerror=alert("XSS")>',
    '<details open ontoggle=alert("XSS")>',
    '<marquee onstart=alert("XSS")>',
    '"><script>alert(String.fromCharCode(88,83,83))</script>'
  );

/**
 * Generate special characters for testing escaping
 */
export const specialCharsArbitrary = () =>
  fc.constantFrom(
    "'; DROP TABLE users; --",
    '" OR "1"="1',
    "' OR '1'='1",
    '\'; DROP TABLE logs; --',
    '<>&"\'\`',
    '\\n\\r\\t',
    '${alert("XSS")}',
    '{{7*7}}',
    '#{7*7}',
    '%{7*7}'
  );
