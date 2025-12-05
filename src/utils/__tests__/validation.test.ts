/**
 * Unit tests for validation utilities
 * Tests input validation, character limits, and special character handling
 */

import { describe, it, expect } from 'vitest';
import {
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
} from '../validation';

describe('validation utilities', () => {
  describe('validateRequired', () => {
    it('should return valid for non-empty string', () => {
      const result = validateRequired('Hello');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return invalid for null', () => {
      const result = validateRequired(null);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(VALIDATION_ERRORS.REQUIRED_FIELD);
    });

    it('should return invalid for undefined', () => {
      const result = validateRequired(undefined);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(VALIDATION_ERRORS.REQUIRED_FIELD);
    });

    it('should return invalid for empty string', () => {
      const result = validateRequired('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(VALIDATION_ERRORS.REQUIRED_FIELD);
    });

    it('should return invalid for whitespace-only string', () => {
      const result = validateRequired('   ');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(VALIDATION_ERRORS.REQUIRED_FIELD);
    });

    it('should return valid for string with leading/trailing whitespace', () => {
      const result = validateRequired('  Hello  ');
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateCharacterLimit', () => {
    it('should return valid for string within limit', () => {
      const result = validateCharacterLimit('Hello', 10);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return valid for string at exact limit', () => {
      const result = validateCharacterLimit('Hello', 5);
      expect(result.isValid).toBe(true);
    });

    it('should return invalid for string exceeding limit', () => {
      const result = validateCharacterLimit('Hello World', 5);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(VALIDATION_ERRORS.EXCEEDS_CHARACTER_LIMIT(5));
    });

    it('should return valid for null', () => {
      const result = validateCharacterLimit(null, 10);
      expect(result.isValid).toBe(true);
    });

    it('should return valid for undefined', () => {
      const result = validateCharacterLimit(undefined, 10);
      expect(result.isValid).toBe(true);
    });

    it('should return valid for empty string', () => {
      const result = validateCharacterLimit('', 10);
      expect(result.isValid).toBe(true);
    });

    it('should handle large character limits', () => {
      const longString = 'a'.repeat(5000);
      const result = validateCharacterLimit(longString, 5000);
      expect(result.isValid).toBe(true);
    });

    it('should detect exceeding large character limits', () => {
      const longString = 'a'.repeat(5001);
      const result = validateCharacterLimit(longString, 5000);
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateReviewComment', () => {
    it('should validate comment within 5000 character limit', () => {
      const comment = 'This is a valid review comment';
      const result = validateReviewComment(comment);
      expect(result.isValid).toBe(true);
    });

    it('should reject comment exceeding 5000 characters', () => {
      const comment = 'a'.repeat(5001);
      const result = validateReviewComment(comment);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('5000');
    });

    it('should accept comment at exactly 5000 characters', () => {
      const comment = 'a'.repeat(5000);
      const result = validateReviewComment(comment);
      expect(result.isValid).toBe(true);
    });

    it('should accept null comment', () => {
      const result = validateReviewComment(null);
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateReviewFeedback', () => {
    it('should validate feedback within 5000 character limit', () => {
      const feedback = 'This is valid review feedback';
      const result = validateReviewFeedback(feedback);
      expect(result.isValid).toBe(true);
    });

    it('should reject feedback exceeding 5000 characters', () => {
      const feedback = 'a'.repeat(5001);
      const result = validateReviewFeedback(feedback);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('5000');
    });

    it('should accept feedback at exactly 5000 characters', () => {
      const feedback = 'a'.repeat(5000);
      const result = validateReviewFeedback(feedback);
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateReviewFields', () => {
    it('should return valid when comment is provided', () => {
      const result = validateReviewFields('Some comment', null);
      expect(result.isValid).toBe(true);
    });

    it('should return valid when feedback is provided', () => {
      const result = validateReviewFields(null, 'Some feedback');
      expect(result.isValid).toBe(true);
    });

    it('should return valid when both are provided', () => {
      const result = validateReviewFields('Comment', 'Feedback');
      expect(result.isValid).toBe(true);
    });

    it('should return invalid when both are null', () => {
      const result = validateReviewFields(null, null);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('At least one review field');
    });

    it('should return invalid when both are empty strings', () => {
      const result = validateReviewFields('', '');
      expect(result.isValid).toBe(false);
    });

    it('should return invalid when both are whitespace', () => {
      const result = validateReviewFields('   ', '   ');
      expect(result.isValid).toBe(false);
    });

    it('should return valid when comment has content but feedback is whitespace', () => {
      const result = validateReviewFields('Comment', '   ');
      expect(result.isValid).toBe(true);
    });
  });

  describe('escapeSpecialCharacters', () => {
    it('should escape single quotes', () => {
      const result = escapeSpecialCharacters("It's a test");
      expect(result).toBe("It\\'s a test");
    });

    it('should escape double quotes', () => {
      const result = escapeSpecialCharacters('He said "hello"');
      expect(result).toBe('He said \\"hello\\"');
    });

    it('should escape backslashes', () => {
      const result = escapeSpecialCharacters('C:\\path\\to\\file');
      expect(result).toBe('C:\\\\path\\\\to\\\\file');
    });

    it('should escape newlines', () => {
      const result = escapeSpecialCharacters('Line 1\nLine 2');
      expect(result).toBe('Line 1\\nLine 2');
    });

    it('should escape carriage returns', () => {
      const result = escapeSpecialCharacters('Line 1\rLine 2');
      expect(result).toBe('Line 1\\rLine 2');
    });

    it('should escape tabs', () => {
      const result = escapeSpecialCharacters('Column1\tColumn2');
      expect(result).toBe('Column1\\tColumn2');
    });

    it('should escape null bytes', () => {
      const result = escapeSpecialCharacters('Text\0End');
      expect(result).toBe('Text\\0End');
    });

    it('should handle multiple special characters', () => {
      const result = escapeSpecialCharacters("It's a \"test\"\nwith\\backslash");
      expect(result).toBe("It\\'s a \\\"test\\\"\\nwith\\\\backslash");
    });

    it('should return empty string for null', () => {
      const result = escapeSpecialCharacters(null);
      expect(result).toBe('');
    });

    it('should return empty string for undefined', () => {
      const result = escapeSpecialCharacters(undefined);
      expect(result).toBe('');
    });

    it('should handle plain text without special characters', () => {
      const result = escapeSpecialCharacters('Plain text');
      expect(result).toBe('Plain text');
    });
  });

  describe('unescapeSpecialCharacters', () => {
    it('should unescape single quotes', () => {
      const result = unescapeSpecialCharacters("It\\'s a test");
      expect(result).toBe("It's a test");
    });

    it('should unescape double quotes', () => {
      const result = unescapeSpecialCharacters('He said \\"hello\\"');
      expect(result).toBe('He said "hello"');
    });

    it('should unescape backslashes', () => {
      const result = unescapeSpecialCharacters('C:\\\\path\\\\to\\\\file');
      expect(result).toBe('C:\\path\\to\\file');
    });

    it('should unescape newlines', () => {
      const result = unescapeSpecialCharacters('Line 1\\nLine 2');
      expect(result).toBe('Line 1\nLine 2');
    });

    it('should round-trip escape and unescape', () => {
      const original = "It's a \"test\"\nwith\\backslash";
      const escaped = escapeSpecialCharacters(original);
      const unescaped = unescapeSpecialCharacters(escaped);
      expect(unescaped).toBe(original);
    });

    it('should return empty string for null', () => {
      const result = unescapeSpecialCharacters(null);
      expect(result).toBe('');
    });
  });

  describe('validateAlphanumeric', () => {
    it('should accept letters and numbers', () => {
      const result = validateAlphanumeric('Hello123');
      expect(result.isValid).toBe(true);
    });

    it('should accept spaces', () => {
      const result = validateAlphanumeric('Hello World 123');
      expect(result.isValid).toBe(true);
    });

    it('should accept common punctuation', () => {
      const result = validateAlphanumeric('Hello, world! How are you?');
      expect(result.isValid).toBe(true);
    });

    it('should accept special characters like @#$%', () => {
      const result = validateAlphanumeric('Email: user@example.com, 100%');
      expect(result.isValid).toBe(true);
    });

    it('should accept newlines and tabs', () => {
      const result = validateAlphanumeric('Line 1\nLine 2\tTabbed');
      expect(result.isValid).toBe(true);
    });

    it('should accept brackets and parentheses', () => {
      const result = validateAlphanumeric('Array[0] and (parentheses) and {braces}');
      expect(result.isValid).toBe(true);
    });

    it('should return valid for null', () => {
      const result = validateAlphanumeric(null);
      expect(result.isValid).toBe(true);
    });

    it('should return valid for undefined', () => {
      const result = validateAlphanumeric(undefined);
      expect(result.isValid).toBe(true);
    });

    it('should return valid for empty string', () => {
      const result = validateAlphanumeric('');
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateReviewCommentComprehensive', () => {
    it('should validate valid comment', () => {
      const result = validateReviewCommentComprehensive('This is a valid comment');
      expect(result.isValid).toBe(true);
    });

    it('should reject comment exceeding character limit', () => {
      const comment = 'a'.repeat(5001);
      const result = validateReviewCommentComprehensive(comment);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('5000');
    });

    it('should reject empty comment when required', () => {
      const result = validateReviewCommentComprehensive('', true);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(VALIDATION_ERRORS.REQUIRED_FIELD);
    });

    it('should accept empty comment when not required', () => {
      const result = validateReviewCommentComprehensive('', false);
      expect(result.isValid).toBe(true);
    });

    it('should accept null when not required', () => {
      const result = validateReviewCommentComprehensive(null, false);
      expect(result.isValid).toBe(true);
    });

    it('should reject null when required', () => {
      const result = validateReviewCommentComprehensive(null, true);
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateReviewFeedbackComprehensive', () => {
    it('should validate valid feedback', () => {
      const result = validateReviewFeedbackComprehensive('This is valid feedback');
      expect(result.isValid).toBe(true);
    });

    it('should reject feedback exceeding character limit', () => {
      const feedback = 'a'.repeat(5001);
      const result = validateReviewFeedbackComprehensive(feedback);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('5000');
    });

    it('should reject empty feedback when required', () => {
      const result = validateReviewFeedbackComprehensive('', true);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(VALIDATION_ERRORS.REQUIRED_FIELD);
    });

    it('should accept empty feedback when not required', () => {
      const result = validateReviewFeedbackComprehensive('', false);
      expect(result.isValid).toBe(true);
    });
  });

  describe('getRemainingCharacters', () => {
    it('should return full limit for null', () => {
      const result = getRemainingCharacters(null, 100);
      expect(result).toBe(100);
    });

    it('should return full limit for undefined', () => {
      const result = getRemainingCharacters(undefined, 100);
      expect(result).toBe(100);
    });

    it('should return full limit for empty string', () => {
      const result = getRemainingCharacters('', 100);
      expect(result).toBe(100);
    });

    it('should calculate remaining characters correctly', () => {
      const result = getRemainingCharacters('Hello', 100);
      expect(result).toBe(95);
    });

    it('should return 0 when at limit', () => {
      const result = getRemainingCharacters('Hello', 5);
      expect(result).toBe(0);
    });

    it('should return 0 when exceeding limit', () => {
      const result = getRemainingCharacters('Hello World', 5);
      expect(result).toBe(0);
    });

    it('should handle large limits', () => {
      const text = 'a'.repeat(4500);
      const result = getRemainingCharacters(text, 5000);
      expect(result).toBe(500);
    });
  });

  describe('isApproachingLimit', () => {
    it('should return false for null', () => {
      const result = isApproachingLimit(null, 100);
      expect(result).toBe(false);
    });

    it('should return false for undefined', () => {
      const result = isApproachingLimit(undefined, 100);
      expect(result).toBe(false);
    });

    it('should return false for empty string', () => {
      const result = isApproachingLimit('', 100);
      expect(result).toBe(false);
    });

    it('should return false when below 90% threshold', () => {
      const result = isApproachingLimit('a'.repeat(80), 100);
      expect(result).toBe(false);
    });

    it('should return true when at 90% threshold', () => {
      const result = isApproachingLimit('a'.repeat(90), 100);
      expect(result).toBe(true);
    });

    it('should return true when above 90% threshold', () => {
      const result = isApproachingLimit('a'.repeat(95), 100);
      expect(result).toBe(true);
    });

    it('should return true when at limit', () => {
      const result = isApproachingLimit('a'.repeat(100), 100);
      expect(result).toBe(true);
    });

    it('should return true when exceeding limit', () => {
      const result = isApproachingLimit('a'.repeat(110), 100);
      expect(result).toBe(true);
    });

    it('should handle large limits correctly', () => {
      const text = 'a'.repeat(4500);
      const result = isApproachingLimit(text, 5000);
      expect(result).toBe(true); // 4500 >= 4500 (90% of 5000)
    });

    it('should return false when just below threshold for large limits', () => {
      const text = 'a'.repeat(4499);
      const result = isApproachingLimit(text, 5000);
      expect(result).toBe(false); // 4499 < 4500 (90% of 5000)
    });
  });

  describe('CHARACTER_LIMITS', () => {
    it('should have correct review comment limit', () => {
      expect(CHARACTER_LIMITS.REVIEW_COMMENT).toBe(5000);
    });

    it('should have correct review feedback limit', () => {
      expect(CHARACTER_LIMITS.REVIEW_FEEDBACK).toBe(5000);
    });

    it('should have search input limit', () => {
      expect(CHARACTER_LIMITS.SEARCH_INPUT).toBe(500);
    });

    it('should have username limit', () => {
      expect(CHARACTER_LIMITS.USERNAME).toBe(100);
    });
  });

  describe('VALIDATION_ERRORS', () => {
    it('should have required field error', () => {
      expect(VALIDATION_ERRORS.REQUIRED_FIELD).toBe('This field is required');
    });

    it('should generate character limit error with limit', () => {
      const error = VALIDATION_ERRORS.EXCEEDS_CHARACTER_LIMIT(100);
      expect(error).toContain('100');
      expect(error).toContain('maximum character limit');
    });

    it('should have invalid format error', () => {
      expect(VALIDATION_ERRORS.INVALID_FORMAT).toBe('Invalid input format');
    });

    it('should have invalid characters error', () => {
      expect(VALIDATION_ERRORS.CONTAINS_INVALID_CHARACTERS).toBe(
        'Input contains invalid characters'
      );
    });
  });
});
