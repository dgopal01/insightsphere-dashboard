/**
 * Unit tests for sanitization utilities
 * Tests XSS prevention and safe content handling
 */

import { describe, it, expect } from 'vitest';
import {
  sanitizeText,
  sanitizeFeedbackComment,
  sanitizeSearchInput,
  sanitizeHtml,
} from '../sanitization';

describe('sanitization utilities', () => {
  describe('sanitizeText', () => {
    it('should remove script tags', () => {
      const input = '<script>alert("XSS")</script>Hello';
      const result = sanitizeText(input);
      expect(result).toBe('Hello');
      expect(result).not.toContain('<script>');
    });

    it('should remove event handlers', () => {
      const input = '<div onclick="alert(\'XSS\')">Click me</div>';
      const result = sanitizeText(input);
      expect(result).not.toContain('onclick');
      expect(result).toContain('Click me');
    });

    it('should remove javascript: URLs', () => {
      const input = '<a href="javascript:alert(\'XSS\')">Link</a>';
      const result = sanitizeText(input);
      expect(result).not.toContain('javascript:');
    });

    it('should allow safe formatting tags', () => {
      const input = '<b>Bold</b> <i>Italic</i> <em>Emphasis</em> <strong>Strong</strong>';
      const result = sanitizeText(input);
      expect(result).toContain('<b>Bold</b>');
      expect(result).toContain('<i>Italic</i>');
      expect(result).toContain('<em>Emphasis</em>');
      expect(result).toContain('<strong>Strong</strong>');
    });

    it('should handle null input', () => {
      const result = sanitizeText(null);
      expect(result).toBe('');
    });

    it('should handle undefined input', () => {
      const result = sanitizeText(undefined);
      expect(result).toBe('');
    });

    it('should handle empty string', () => {
      const result = sanitizeText('');
      expect(result).toBe('');
    });

    it('should preserve plain text', () => {
      const input = 'This is plain text with no HTML';
      const result = sanitizeText(input);
      expect(result).toBe(input);
    });

    it('should remove img tags with onerror', () => {
      const input = '<img src="x" onerror="alert(\'XSS\')">';
      const result = sanitizeText(input);
      expect(result).not.toContain('<img');
      expect(result).not.toContain('onerror');
    });

    it('should remove iframe tags', () => {
      const input = '<iframe src="evil.com"></iframe>Hello';
      const result = sanitizeText(input);
      expect(result).toBe('Hello');
      expect(result).not.toContain('<iframe');
    });
  });

  describe('sanitizeFeedbackComment', () => {
    it('should sanitize feedback comments', () => {
      const input = '<script>alert("XSS")</script>Great response!';
      const result = sanitizeFeedbackComment(input);
      expect(result).toBe('Great response!');
      expect(result).not.toContain('<script>');
    });

    it('should handle null comments', () => {
      const result = sanitizeFeedbackComment(null);
      expect(result).toBe('');
    });

    it('should preserve safe formatting in comments', () => {
      const input = 'This is <b>bold</b> and <i>italic</i> text';
      const result = sanitizeFeedbackComment(input);
      expect(result).toContain('<b>bold</b>');
      expect(result).toContain('<i>italic</i>');
    });
  });

  describe('sanitizeSearchInput', () => {
    it('should remove all HTML tags from search input', () => {
      const input = '<b>search</b> <i>term</i>';
      const result = sanitizeSearchInput(input);
      expect(result).toBe('search term');
      expect(result).not.toContain('<b>');
      expect(result).not.toContain('<i>');
    });

    it('should remove script tags from search input', () => {
      const input = '<script>alert("XSS")</script>search term';
      const result = sanitizeSearchInput(input);
      expect(result).toBe('search term');
      expect(result).not.toContain('<script>');
    });

    it('should handle null search input', () => {
      const result = sanitizeSearchInput(null);
      expect(result).toBe('');
    });

    it('should preserve plain text search queries', () => {
      const input = 'user:123 conversation:abc';
      const result = sanitizeSearchInput(input);
      expect(result).toBe(input);
    });

    it('should handle special characters in search', () => {
      const input = 'search & filter | sort';
      const result = sanitizeSearchInput(input);
      expect(result).toContain('&');
      expect(result).toContain('|');
    });
  });

  describe('sanitizeHtml', () => {
    it('should allow more permissive HTML tags', () => {
      const input = '<div><p>Paragraph</p><ul><li>Item</li></ul></div>';
      const result = sanitizeHtml(input);
      expect(result).toContain('<div>');
      expect(result).toContain('<p>');
      expect(result).toContain('<ul>');
      expect(result).toContain('<li>');
    });

    it('should allow safe links', () => {
      const input = '<a href="https://example.com">Link</a>';
      const result = sanitizeHtml(input);
      expect(result).toContain('<a');
      expect(result).toContain('href="https://example.com"');
    });

    it('should still remove script tags', () => {
      const input = '<div><script>alert("XSS")</script>Content</div>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('<script>');
      expect(result).toContain('Content');
    });

    it('should handle null HTML', () => {
      const result = sanitizeHtml(null);
      expect(result).toBe('');
    });
  });

  describe('XSS attack vectors', () => {
    it('should handle already-encoded script tags safely', () => {
      // Already-encoded HTML entities are safe and should be preserved
      const input = '&lt;script&gt;alert("XSS")&lt;/script&gt;';
      const result = sanitizeText(input);
      // The encoded entities should remain as text, not be executed
      expect(result).toContain('&lt;');
      expect(result).toContain('&gt;');
    });

    it('should prevent XSS via data URIs', () => {
      const input = '<a href="data:text/html,<script>alert(\'XSS\')</script>">Click</a>';
      const result = sanitizeText(input);
      expect(result).not.toContain('data:');
    });

    it('should prevent XSS via style attributes', () => {
      const input = '<div style="background:url(javascript:alert(\'XSS\'))">Text</div>';
      const result = sanitizeText(input);
      expect(result).not.toContain('javascript:');
    });

    it('should prevent XSS via SVG', () => {
      const input = '<svg onload="alert(\'XSS\')"></svg>';
      const result = sanitizeText(input);
      expect(result).not.toContain('onload');
      expect(result).not.toContain('<svg');
    });
  });
});
