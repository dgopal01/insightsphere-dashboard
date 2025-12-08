/**
 * FeedbackForm Component
 * Collects user feedback with thumbs up/down, star ratings, and text comments
 * Requirements: 3.1, 3.3, 3.4, 12.1, 12.4
 */

import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Paper,
  IconButton,
  Rating,
  CircularProgress,
  Snackbar,
  FormHelperText,
} from '@mui/material';
import { ThumbUp, ThumbDown, Send } from '@mui/icons-material';
import type { FeedbackInput } from '../types';
import { sanitizeFeedbackComment } from '../utils';

/**
 * Props for FeedbackForm component
 */
export interface FeedbackFormProps {
  logId: string;
  onSubmit: (feedback: FeedbackInput) => Promise<void>;
  disabled?: boolean;
}

/**
 * Validation errors
 */
interface ValidationErrors {
  rating?: string;
  comment?: string;
}

/**
 * Form state
 */
interface FormState {
  thumbsUp: boolean | null;
  rating: number | null;
  comment: string;
  category?: 'accuracy' | 'helpfulness' | 'speed';
}

/**
 * FeedbackForm Component
 */
export const FeedbackForm: React.FC<FeedbackFormProps> = ({
  logId,
  onSubmit,
  disabled = false,
}) => {
  const [formState, setFormState] = useState<FormState>({
    thumbsUp: null,
    rating: null,
    comment: '',
    category: undefined,
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  /**
   * Validate form inputs
   * Requirements: 12.1 - Client-side validation
   */
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    // Validate rating range (1-5)
    // Requirement 3.3: Accept values from 1 to 5
    if (formState.rating === null) {
      errors.rating = 'Please provide a rating';
    } else if (formState.rating < 1 || formState.rating > 5) {
      errors.rating = 'Rating must be between 1 and 5';
    }

    // Validate comment length (max 1000 characters)
    // Requirement 3.4: Store comments with maximum length of 1000 characters
    if (formState.comment && formState.comment.length > 1000) {
      errors.comment = `Comment is too long (${formState.comment.length}/1000 characters)`;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle thumbs up button click
   */
  const handleThumbsUp = () => {
    setFormState((prev) => ({
      ...prev,
      thumbsUp: prev.thumbsUp === true ? null : true,
    }));
  };

  /**
   * Handle thumbs down button click
   */
  const handleThumbsDown = () => {
    setFormState((prev) => ({
      ...prev,
      thumbsUp: prev.thumbsUp === false ? null : false,
    }));
  };

  /**
   * Handle rating change
   */
  const handleRatingChange = (_event: React.SyntheticEvent, value: number | null) => {
    setFormState((prev) => ({
      ...prev,
      rating: value,
    }));
    // Clear rating error when user changes rating
    if (validationErrors.rating) {
      setValidationErrors((prev) => ({ ...prev, rating: undefined }));
    }
  };

  /**
   * Handle comment change
   */
  const handleCommentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFormState((prev) => ({
      ...prev,
      comment: value,
    }));
    // Clear comment error when user types
    if (validationErrors.comment && value.length <= 1000) {
      setValidationErrors((prev) => ({ ...prev, comment: undefined }));
    }
  };

  /**
   * Handle form submission
   * Requirements: 3.1, 3.2 - Submit feedback with validation
   */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Clear previous errors
    setSubmitError(null);

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Check if thumbs up/down is selected
    if (formState.thumbsUp === null) {
      setSubmitError('Please select thumbs up or thumbs down');
      return;
    }

    // Check if rating is provided
    if (formState.rating === null) {
      setSubmitError('Please provide a rating');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare feedback input with sanitized comment
      const feedbackInput: FeedbackInput = {
        logId,
        rating: formState.rating,
        thumbsUp: formState.thumbsUp,
        comment: formState.comment ? sanitizeFeedbackComment(formState.comment) : undefined,
        category: formState.category,
      };

      // Submit feedback
      await onSubmit(feedbackInput);

      // Show success confirmation
      // Requirement 3.5: Confirm successful submission
      setShowSuccess(true);

      // Reset form
      setFormState({
        thumbsUp: null,
        rating: null,
        comment: '',
        category: undefined,
      });
      setValidationErrors({});
    } catch (error) {
      // Display error message for validation failures
      // Requirement 12.4: Display error messages
      console.error('Failed to submit feedback:', error);
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to submit feedback. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle success snackbar close
   */
  const handleCloseSuccess = () => {
    setShowSuccess(false);
  };

  /**
   * Get character count color
   */
  const getCharCountColor = () => {
    const length = formState.comment.length;
    if (length > 1000) return 'error';
    if (length > 900) return 'warning';
    return 'text.secondary';
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Submit Feedback
      </Typography>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        {/* Thumbs Up/Down Buttons */}
        {/* Requirement 3.1: Display thumbs up and thumbs down buttons */}
        <Box sx={{ mb: 3 }} role="group" aria-labelledby="helpful-label">
          <Typography variant="body2" gutterBottom id="helpful-label">
            Was this response helpful?
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <IconButton
              aria-label="Mark response as helpful (thumbs up)"
              aria-pressed={formState.thumbsUp === true}
              onClick={handleThumbsUp}
              disabled={disabled || isSubmitting}
              color={formState.thumbsUp === true ? 'primary' : 'default'}
              sx={{
                border: 1,
                borderColor: formState.thumbsUp === true ? 'primary.main' : 'divider',
                '&:hover': {
                  borderColor: 'primary.main',
                },
                '&:focus-visible': {
                  outline: '2px solid',
                  outlineColor: 'primary.main',
                  outlineOffset: '2px',
                },
              }}
            >
              <ThumbUp />
            </IconButton>
            <IconButton
              aria-label="Mark response as not helpful (thumbs down)"
              aria-pressed={formState.thumbsUp === false}
              onClick={handleThumbsDown}
              disabled={disabled || isSubmitting}
              color={formState.thumbsUp === false ? 'error' : 'default'}
              sx={{
                border: 1,
                borderColor: formState.thumbsUp === false ? 'error.main' : 'divider',
                '&:hover': {
                  borderColor: 'error.main',
                },
                '&:focus-visible': {
                  outline: '2px solid',
                  outlineColor: 'error.main',
                  outlineOffset: '2px',
                },
              }}
            >
              <ThumbDown />
            </IconButton>
          </Box>
        </Box>

        {/* Star Rating Input */}
        {/* Requirement 3.3: Accept rating values from 1 to 5 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" gutterBottom id="rating-label">
            Rate this response (1-5 stars) *
          </Typography>
          <Rating
            name="rating"
            value={formState.rating}
            onChange={handleRatingChange}
            disabled={disabled || isSubmitting}
            size="large"
            aria-labelledby="rating-label"
            aria-describedby={validationErrors.rating ? 'rating-error' : undefined}
            aria-required="true"
            aria-invalid={!!validationErrors.rating}
          />
          {validationErrors.rating && (
            <FormHelperText error id="rating-error" role="alert">
              {validationErrors.rating}
            </FormHelperText>
          )}
        </Box>

        {/* Optional Text Comment Field */}
        {/* Requirement 3.4: Store comments with maximum length of 1000 characters */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Additional Comments (Optional)"
            placeholder="Share your thoughts about this response..."
            value={formState.comment}
            onChange={handleCommentChange}
            disabled={disabled || isSubmitting}
            error={!!validationErrors.comment}
            helperText={validationErrors.comment}
            inputProps={{
              maxLength: 1001, // Allow typing one extra to show error
              'aria-label': 'Additional comments about the response',
              'aria-describedby': validationErrors.comment
                ? 'comment-error char-count'
                : 'char-count',
              'aria-invalid': !!validationErrors.comment,
            }}
            FormHelperTextProps={{
              id: validationErrors.comment ? 'comment-error' : undefined,
              role: validationErrors.comment ? 'alert' : undefined,
            }}
          />
          <Typography
            variant="caption"
            id="char-count"
            sx={{
              display: 'block',
              textAlign: 'right',
              mt: 0.5,
              color: getCharCountColor(),
            }}
            aria-live="polite"
          >
            {formState.comment.length}/1000 characters
          </Typography>
        </Box>

        {/* Submit Error */}
        {submitError && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            onClose={() => setSubmitError(null)}
            role="alert"
            aria-live="assertive"
          >
            {submitError}
          </Alert>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <Send />}
          disabled={disabled || isSubmitting}
          fullWidth
          aria-label={isSubmitting ? 'Submitting feedback, please wait' : 'Submit feedback'}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </Button>
      </Box>

      {/* Success Snackbar */}
      {/* Requirement 3.5: Confirm successful submission */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
          Feedback submitted successfully! Thank you for your input.
        </Alert>
      </Snackbar>
    </Paper>
  );
};
