/**
 * Integration tests for validation and sanitization utilities
 * Tests how validation and sanitization work together for review submissions
 */

import { describe, it, expect } from 'vitest';
import {
  validateReviewCommentComprehensive,
  validateReviewFeedbackComprehensive,
  validateReviewFields,
  escapeSpecialCharacters,
  CHARACTER_LIMITS,
} from '../validation';
import { sanitizeText, sanitizeFeedbackComment } from '../sanitization';

describe('validation and sanitization integration', () => {
  describe('review submission workflow', () => {
    it('should validate and sanitize a typical review comment', () => {
      const userInput = 'This is a <b>great</b> response!';

      // First validate
      const validation = validateReviewCommentComprehensive(userInput);
      expect(validation.isValid).toBe(true);

      // Then sanitize for display
      const sanitized = sanitizeText(userInput);
      expect(sanitized).toContain('<b>great</b>'); // Safe tags preserved
      expect(sanitized).toContain('response!');
    });

    it('should reject and not sanitize invalid input exceeding character limit', () => {
      const userInput = 'a'.repeat(5001);

      // Validation should fail first
      const validation = validateReviewCommentComprehensive(userInput);
      expect(validation.isValid).toBe(false);
      expect(validation.error).toContain('5000');

      // Should not proceed to sanitization if validation fails
    });

    it('should handle XSS attempts by validating then sanitizing', () => {
      const maliciousInput = '<script>alert("XSS")</script>Good feedback';

      // Validation passes (it's within character limit and alphanumeric)
      const validation = validateReviewCommentComprehensive(maliciousInput);
      expect(validation.isValid).toBe(true);

      // But sanitization removes the malicious content
      const sanitized = sanitizeText(maliciousInput);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toBe('Good feedback');
    });

    it('should escape special characters for database storage', () => {
      const userInput = 'User said: "It\'s working!"';

      // Validate
      const validation = validateReviewCommentComprehensive(userInput);
      expect(validation.isValid).toBe(true);

      // Escape for database
      const escaped = escapeSpecialCharacters(userInput);
      expect(escaped).toContain('\\"');
      expect(escaped).toContain("\\'");
    });

    it('should validate that at least one review field is provided', () => {
      // Both empty - should fail
      const result1 = validateReviewFields('', '');
      expect(result1.isValid).toBe(false);

      // Comment provided - should pass
      const result2 = validateReviewFields('Some comment', '');
      expect(result2.isValid).toBe(true);

      // Feedback provided - should pass
      const result3 = validateReviewFields('', 'Some feedback');
      expect(result3.isValid).toBe(true);

      // Both provided - should pass
      const result4 = validateReviewFields('Comment', 'Feedback');
      expect(result4.isValid).toBe(true);
    });

    it('should handle complete review submission workflow', () => {
      const comment = 'The response was accurate and helpful.';
      const feedback = 'Consider adding more <b>examples</b> next time.';

      // Step 1: Validate both fields
      const commentValidation = validateReviewCommentComprehensive(comment);
      const feedbackValidation = validateReviewFeedbackComprehensive(feedback);
      const fieldsValidation = validateReviewFields(comment, feedback);

      expect(commentValidation.isValid).toBe(true);
      expect(feedbackValidation.isValid).toBe(true);
      expect(fieldsValidation.isValid).toBe(true);

      // Step 2: Sanitize for display
      const sanitizedComment = sanitizeText(comment);
      const sanitizedFeedback = sanitizeFeedbackComment(feedback);

      expect(sanitizedComment).toBe(comment); // No HTML, so unchanged
      expect(sanitizedFeedback).toContain('<b>examples</b>'); // Safe tags preserved

      // Step 3: Escape for database storage
      const escapedComment = escapeSpecialCharacters(sanitizedComment);
      const escapedFeedback = escapeSpecialCharacters(sanitizedFeedback);

      expect(escapedComment).toBeDefined();
      expect(escapedFeedback).toBeDefined();
    });

    it('should reject empty review when both fields are whitespace', () => {
      const comment = '   ';
      const feedback = '\t\n';

      const validation = validateReviewFields(comment, feedback);
      expect(validation.isValid).toBe(false);
      expect(validation.error).toContain('At least one review field');
    });

    it('should handle edge case of exactly 5000 characters', () => {
      const maxLengthComment = 'a'.repeat(CHARACTER_LIMITS.REVIEW_COMMENT);

      const validation = validateReviewCommentComprehensive(maxLengthComment);
      expect(validation.isValid).toBe(true);

      // Should still be able to sanitize
      const sanitized = sanitizeText(maxLengthComment);
      expect(sanitized.length).toBe(CHARACTER_LIMITS.REVIEW_COMMENT);
    });

    it('should handle complex special characters in review text', () => {
      const complexInput = 'Email: user@example.com\nQuote: "Hello"\nRating: 5/5';

      // Validate
      const validation = validateReviewCommentComprehensive(complexInput);
      expect(validation.isValid).toBe(true);

      // Escape
      const escaped = escapeSpecialCharacters(complexInput);
      expect(escaped).toContain('\\n'); // Escaped newline
      expect(escaped).toContain('\\"'); // Escaped quote
      expect(escaped).toContain('@'); // Special chars preserved
    });

    it('should sanitize potential XSS in feedback field', () => {
      const feedback = 'Good job! <img src=x onerror="alert(1)">';

      // Validate (passes character limit)
      const validation = validateReviewFeedbackComprehensive(feedback);
      expect(validation.isValid).toBe(true);

      // Sanitize removes malicious content
      const sanitized = sanitizeFeedbackComment(feedback);
      expect(sanitized).not.toContain('<img');
      expect(sanitized).not.toContain('onerror');
      expect(sanitized).toContain('Good job!');
    });
  });

  describe('error message consistency', () => {
    it('should provide clear error messages for validation failures', () => {
      // Required field error
      const requiredResult = validateReviewCommentComprehensive('', true);
      expect(requiredResult.error).toBe('This field is required');

      // Character limit error
      const limitResult = validateReviewCommentComprehensive('a'.repeat(5001));
      expect(limitResult.error).toContain('5000');
      expect(limitResult.error).toContain('maximum character limit');

      // Review fields error
      const fieldsResult = validateReviewFields(null, null);
      expect(fieldsResult.error).toContain('At least one review field');
    });
  });
});
