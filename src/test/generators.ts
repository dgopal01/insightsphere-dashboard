import * as fc from 'fast-check';

/**
 * Fast-check generators for domain-specific data types
 * These generators create realistic test data that matches the application's constraints
 */

/**
 * Generate a valid chat log ID
 */
export const chatLogIdArbitrary = () =>
  fc.uuid().map((id) => `log-${id}`);

/**
 * Generate a valid user ID
 */
export const userIdArbitrary = () =>
  fc.uuid().map((id) => `user-${id}`);

/**
 * Generate a valid conversation ID
 */
export const conversationIdArbitrary = () =>
  fc.uuid().map((id) => `conv-${id}`);

/**
 * Generate a valid timestamp (ISO 8601 format)
 */
export const timestampArbitrary = () =>
  fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') })
    .map((date) => date.toISOString());

/**
 * Generate a valid rating (1-5)
 */
export const ratingArbitrary = () =>
  fc.integer({ min: 1, max: 5 });

/**
 * Generate an invalid rating (outside 1-5 range)
 */
export const invalidRatingArbitrary = () =>
  fc.oneof(
    fc.integer({ max: 0 }),
    fc.integer({ min: 6 })
  );

/**
 * Generate a valid comment (0-1000 characters)
 */
export const commentArbitrary = () =>
  fc.string({ maxLength: 1000 });

/**
 * Generate an invalid comment (> 1000 characters)
 */
export const invalidCommentArbitrary = () =>
  fc.string({ minLength: 1001, maxLength: 2000 });

/**
 * Generate a thumbs up/down boolean
 */
export const thumbsArbitrary = () =>
  fc.boolean();

/**
 * Generate a sentiment value
 */
export const sentimentArbitrary = () =>
  fc.constantFrom('positive', 'negative', 'neutral');

/**
 * Generate a response time in milliseconds (realistic range)
 */
export const responseTimeArbitrary = () =>
  fc.integer({ min: 100, max: 10000 });

/**
 * Generate an accuracy score (0-100)
 */
export const accuracyArbitrary = () =>
  fc.float({ min: 0, max: 100, noNaN: true });

/**
 * Generate a date range
 */
export const dateRangeArbitrary = () =>
  fc.tuple(
    fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') }),
    fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') })
  ).map(([date1, date2]) => {
    const start = date1 < date2 ? date1 : date2;
    const end = date1 < date2 ? date2 : date1;
    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
  });

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
    category: fc.option(
      fc.constantFrom('accuracy', 'helpfulness', 'speed'),
      { nil: undefined }
    ),
  });

/**
 * Generate a theme value
 */
export const themeArbitrary = () =>
  fc.constantFrom('light', 'dark');

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
