/**
 * Input validation utilities
 * Provides validation functions for user inputs with character limits,
 * required field checks, and special character handling
 */

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Character limits for different input fields
 */
export const CHARACTER_LIMITS = {
  REVIEW_COMMENT: 5000,
  REVIEW_FEEDBACK: 5000,
  SEARCH_INPUT: 500,
  USERNAME: 100,
} as const;

/**
 * Validation error messages
 */
export const VALIDATION_ERRORS = {
  REQUIRED_FIELD: 'This field is required',
  EXCEEDS_CHARACTER_LIMIT: (limit: number) => `Input exceeds maximum character limit of ${limit}`,
  INVALID_FORMAT: 'Invalid input format',
  CONTAINS_INVALID_CHARACTERS: 'Input contains invalid characters',
  EMPTY_STRING: 'Input cannot be empty or contain only whitespace',
} as const;

/**
 * Validates that a field is not empty
 * Checks for null, undefined, empty string, or whitespace-only strings
 *
 * @param value - The value to validate
 * @returns ValidationResult indicating if the field is valid
 *
 * @example
 * ```typescript
 * const result = validateRequired('  ');
 * // Returns: { isValid: false, error: 'This field is required' }
 * ```
 */
export function validateRequired(value: string | null | undefined): ValidationResult {
  if (value === null || value === undefined || value.trim() === '') {
    return {
      isValid: false,
      error: VALIDATION_ERRORS.REQUIRED_FIELD,
    };
  }

  return { isValid: true };
}

/**
 * Validates that input does not exceed a character limit
 *
 * @param value - The value to validate
 * @param limit - Maximum number of characters allowed
 * @returns ValidationResult indicating if the length is valid
 *
 * @example
 * ```typescript
 * const result = validateCharacterLimit('Hello', 3);
 * // Returns: { isValid: false, error: 'Input exceeds maximum character limit of 3' }
 * ```
 */
export function validateCharacterLimit(
  value: string | null | undefined,
  limit: number
): ValidationResult {
  if (value === null || value === undefined) {
    return { isValid: true };
  }

  if (value.length > limit) {
    return {
      isValid: false,
      error: VALIDATION_ERRORS.EXCEEDS_CHARACTER_LIMIT(limit),
    };
  }

  return { isValid: true };
}

/**
 * Validates review comment field
 * Checks character limit of 5000 characters
 *
 * @param comment - The review comment to validate
 * @returns ValidationResult indicating if the comment is valid
 */
export function validateReviewComment(comment: string | null | undefined): ValidationResult {
  return validateCharacterLimit(comment, CHARACTER_LIMITS.REVIEW_COMMENT);
}

/**
 * Validates review feedback field
 * Checks character limit of 5000 characters
 *
 * @param feedback - The review feedback to validate
 * @returns ValidationResult indicating if the feedback is valid
 */
export function validateReviewFeedback(feedback: string | null | undefined): ValidationResult {
  return validateCharacterLimit(feedback, CHARACTER_LIMITS.REVIEW_FEEDBACK);
}

/**
 * Validates that at least one of the review fields (comment or feedback) is provided
 *
 * @param comment - The review comment
 * @param feedback - The review feedback
 * @returns ValidationResult indicating if at least one field has content
 */
export function validateReviewFields(
  comment: string | null | undefined,
  feedback: string | null | undefined
): ValidationResult {
  const hasComment = comment !== null && comment !== undefined && comment.trim() !== '';
  const hasFeedback = feedback !== null && feedback !== undefined && feedback.trim() !== '';

  if (!hasComment && !hasFeedback) {
    return {
      isValid: false,
      error: 'At least one review field (comment or feedback) must be provided',
    };
  }

  return { isValid: true };
}

/**
 * Escapes special characters for safe database storage
 * Handles quotes, backslashes, and other special characters
 *
 * @param input - The string to escape
 * @returns Escaped string safe for database storage
 *
 * @example
 * ```typescript
 * const escaped = escapeSpecialCharacters("It's a \"test\"");
 * // Returns: "It\\'s a \\"test\\""
 * ```
 */
export function escapeSpecialCharacters(input: string | null | undefined): string {
  if (!input) {
    return '';
  }

  return input
    .replace(/\\/g, '\\\\') // Escape backslashes first
    .replace(/'/g, "\\'") // Escape single quotes
    .replace(/"/g, '\\"') // Escape double quotes
    .replace(/\n/g, '\\n') // Escape newlines
    .replace(/\r/g, '\\r') // Escape carriage returns
    .replace(/\t/g, '\\t') // Escape tabs
    .replace(/\0/g, '\\0'); // Escape null bytes
}

/**
 * Unescapes special characters for display
 * Reverses the escaping done by escapeSpecialCharacters
 *
 * @param input - The escaped string
 * @returns Unescaped string for display
 */
export function unescapeSpecialCharacters(input: string | null | undefined): string {
  if (!input) {
    return '';
  }

  // Must unescape backslashes first, then other escape sequences
  return input
    .replace(/\\\\/g, '\x00') // Temporarily replace \\ with null byte
    .replace(/\\0/g, '\0') // Unescape null bytes
    .replace(/\\t/g, '\t') // Unescape tabs
    .replace(/\\r/g, '\r') // Unescape carriage returns
    .replace(/\\n/g, '\n') // Unescape newlines
    .replace(/\\"/g, '"') // Unescape double quotes
    .replace(/\\'/g, "'") // Unescape single quotes
    .replace(/\x00/g, '\\'); // Replace temporary null byte with single backslash
}

/**
 * Validates alphanumeric input with allowed special characters
 * Allows letters, numbers, spaces, and common punctuation
 *
 * @param value - The value to validate
 * @returns ValidationResult indicating if the format is valid
 */
export function validateAlphanumeric(value: string | null | undefined): ValidationResult {
  if (!value) {
    return { isValid: true };
  }

  // Allow letters, numbers, spaces, and common punctuation
  const alphanumericPattern = /^[a-zA-Z0-9\s.,!?;:()\-'"@#$%&*+=\[\]{}/<>_\n\r\t]*$/;

  if (!alphanumericPattern.test(value)) {
    return {
      isValid: false,
      error: VALIDATION_ERRORS.CONTAINS_INVALID_CHARACTERS,
    };
  }

  return { isValid: true };
}

/**
 * Comprehensive validation for review comment field
 * Checks required, character limit, and format
 *
 * @param comment - The review comment to validate
 * @param isRequired - Whether the field is required
 * @returns ValidationResult with detailed error message
 */
export function validateReviewCommentComprehensive(
  comment: string | null | undefined,
  isRequired: boolean = false
): ValidationResult {
  // Check required if specified
  if (isRequired) {
    const requiredResult = validateRequired(comment);
    if (!requiredResult.isValid) {
      return requiredResult;
    }
  }

  // Check character limit
  const limitResult = validateReviewComment(comment);
  if (!limitResult.isValid) {
    return limitResult;
  }

  // Check alphanumeric format
  const formatResult = validateAlphanumeric(comment);
  if (!formatResult.isValid) {
    return formatResult;
  }

  return { isValid: true };
}

/**
 * Comprehensive validation for review feedback field
 * Checks required, character limit, and format
 *
 * @param feedback - The review feedback to validate
 * @param isRequired - Whether the field is required
 * @returns ValidationResult with detailed error message
 */
export function validateReviewFeedbackComprehensive(
  feedback: string | null | undefined,
  isRequired: boolean = false
): ValidationResult {
  // Check required if specified
  if (isRequired) {
    const requiredResult = validateRequired(feedback);
    if (!requiredResult.isValid) {
      return requiredResult;
    }
  }

  // Check character limit
  const limitResult = validateReviewFeedback(feedback);
  if (!limitResult.isValid) {
    return limitResult;
  }

  // Check alphanumeric format
  const formatResult = validateAlphanumeric(feedback);
  if (!formatResult.isValid) {
    return formatResult;
  }

  return { isValid: true };
}

/**
 * Gets the remaining character count for an input
 *
 * @param value - The current input value
 * @param limit - The character limit
 * @returns Number of characters remaining
 */
export function getRemainingCharacters(value: string | null | undefined, limit: number): number {
  if (!value) {
    return limit;
  }

  return Math.max(0, limit - value.length);
}

/**
 * Checks if input is approaching character limit (within 10%)
 *
 * @param value - The current input value
 * @param limit - The character limit
 * @returns True if within 10% of limit
 */
export function isApproachingLimit(value: string | null | undefined, limit: number): boolean {
  if (!value) {
    return false;
  }

  const threshold = limit * 0.9;
  return value.length >= threshold;
}
