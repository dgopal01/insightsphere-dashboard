/**
 * Input sanitization utilities using DOMPurify
 * Protects against XSS attacks by sanitizing user-generated content
 */

import DOMPurify from 'dompurify';

/**
 * Configuration for DOMPurify
 * - ALLOWED_TAGS: Only allow safe text formatting tags
 * - ALLOWED_ATTR: Only allow safe attributes
 * - KEEP_CONTENT: Keep text content even if tags are removed
 */
const SANITIZE_CONFIG = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p'],
  ALLOWED_ATTR: [],
  KEEP_CONTENT: true,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
};

/**
 * Sanitizes user-generated text content to prevent XSS attacks
 * Removes all potentially malicious HTML/JavaScript while preserving safe formatting
 *
 * @param input - The user-generated text to sanitize
 * @returns Sanitized text safe for display in the DOM
 *
 * @example
 * ```typescript
 * const userInput = '<script>alert("XSS")</script>Hello';
 * const safe = sanitizeText(userInput); // Returns: 'Hello'
 * ```
 */
export function sanitizeText(input: string | null | undefined): string {
  if (!input) {
    return '';
  }

  // Sanitize the input using DOMPurify with our configuration
  return DOMPurify.sanitize(input, SANITIZE_CONFIG) as string;
}

/**
 * Sanitizes feedback comments before rendering
 * Applies strict sanitization suitable for user feedback text
 *
 * @param comment - The feedback comment to sanitize
 * @returns Sanitized comment safe for display
 */
export function sanitizeFeedbackComment(comment: string | null | undefined): string {
  return sanitizeText(comment);
}

/**
 * Sanitizes search input before display
 * Removes all HTML tags and scripts from search queries
 *
 * @param searchInput - The search query to sanitize
 * @returns Sanitized search query safe for display
 */
export function sanitizeSearchInput(searchInput: string | null | undefined): string {
  if (!searchInput) {
    return '';
  }

  // For search inputs, we want to strip ALL HTML tags
  return DOMPurify.sanitize(searchInput, {
    ALLOWED_TAGS: [],
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
  }) as string;
}

/**
 * Sanitizes HTML content with more permissive settings
 * Useful for rich text content where some formatting is desired
 *
 * @param html - The HTML content to sanitize
 * @returns Sanitized HTML safe for display
 */
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) {
    return '';
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p', 'ul', 'ol', 'li', 'a', 'span', 'div'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
  }) as string;
}
