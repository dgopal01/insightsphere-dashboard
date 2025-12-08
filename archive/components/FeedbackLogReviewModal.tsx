/**
 * FeedbackLogReviewModal Component
 * Modal dialog for reviewing individual feedback log entries
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Divider,
  Alert,
  CircularProgress,
  Chip,
  Stack,
} from '@mui/material';
import { Close, Save, CheckCircle, PendingActions } from '@mui/icons-material';
import { validateReviewComment, validateReviewFeedback } from '../utils/validation';
import { sanitizeText } from '../utils/sanitization';
import type { FeedbackLogEntry } from '../types';

/**
 * Props for FeedbackLogReviewModal component
 */
export interface FeedbackLogReviewModalProps {
  open: boolean;
  log: FeedbackLogEntry | null;
  onClose: () => void;
  onSubmit: (logId: string, reviewData: { rev_comment: string; rev_feedback: string }) => Promise<void>;
}

/**
 * Get review status for a log entry
 */
function getReviewStatus(log: FeedbackLogEntry): 'reviewed' | 'pending' {
  return log.rev_comment || log.rev_feedback ? 'reviewed' : 'pending';
}

/**
 * FeedbackLogReviewModal Component
 */
export const FeedbackLogReviewModal: React.FC<FeedbackLogReviewModalProps> = ({
  open,
  log,
  onClose,
  onSubmit,
}) => {
  const [revComment, setRevComment] = useState('');
  const [revFeedback, setRevFeedback] = useState('');
  const [commentError, setCommentError] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Initialize form with existing review data
  useEffect(() => {
    if (log) {
      setRevComment(log.rev_comment || '');
      setRevFeedback(log.rev_feedback || '');
      setCommentError(null);
      setFeedbackError(null);
      setSubmitError(null);
      setSubmitSuccess(false);
    }
  }, [log]);

  /**
   * Handle comment change with validation
   */
  const handleCommentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setRevComment(value);
    setCommentError(null);
    setSubmitSuccess(false);

    // Validate on change
    const validation = validateReviewComment(value);
    if (!validation.isValid) {
      setCommentError(validation.error || null);
    }
  };

  /**
   * Handle feedback change with validation
   */
  const handleFeedbackChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setRevFeedback(value);
    setFeedbackError(null);
    setSubmitSuccess(false);

    // Validate on change
    const validation = validateReviewFeedback(value);
    if (!validation.isValid) {
      setFeedbackError(validation.error || null);
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async () => {
    if (!log) return;

    // Validate both fields
    const commentValidation = validateReviewComment(revComment);
    const feedbackValidation = validateReviewFeedback(revFeedback);

    if (!commentValidation.isValid || !feedbackValidation.isValid) {
      setCommentError(commentValidation.error || null);
      setFeedbackError(feedbackValidation.error || null);
      return;
    }

    // At least one field must be filled
    if (!revComment.trim() && !revFeedback.trim()) {
      setSubmitError('Please provide at least a comment or feedback');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      // Sanitize inputs before submission
      const sanitizedData = {
        rev_comment: sanitizeText(revComment),
        rev_feedback: sanitizeText(revFeedback),
      };

      await onSubmit(log.id, sanitizedData);
      setSubmitSuccess(true);

      // Close modal after short delay to show success message
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit review';
      setSubmitError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle close with confirmation if data changed
   */
  const handleClose = () => {
    if (!log) {
      onClose();
      return;
    }

    const hasChanges =
      revComment !== (log.rev_comment || '') || revFeedback !== (log.rev_feedback || '');

    if (hasChanges && !submitSuccess) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to close?'
      );
      if (!confirmed) return;
    }

    onClose();
  };

  if (!log) return null;

  const status = getReviewStatus(log);
  const isFormValid =
    !commentError && !feedbackError && (revComment.trim() || revFeedback.trim());

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="review-modal-title"
    >
      <DialogTitle id="review-modal-title">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Review Feedback Log</Typography>
          <Chip
            label={status === 'reviewed' ? 'Reviewed' : 'Pending'}
            color={status === 'reviewed' ? 'success' : 'warning'}
            size="small"
            icon={status === 'reviewed' ? <CheckCircle /> : <PendingActions />}
          />
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Success Message */}
        {submitSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Review submitted successfully!
          </Alert>
        )}

        {/* Error Message */}
        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}

        {/* Log Details */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Feedback Details
          </Typography>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 45%' }}>
                <Typography variant="caption" color="text.secondary">
                  Feedback ID
                </Typography>
                <Typography variant="body2">{log.id}</Typography>
              </Box>
              <Box sx={{ flex: '1 1 45%' }}>
                <Typography variant="caption" color="text.secondary">
                  Date/Time
                </Typography>
                <Typography variant="body2">
                  {new Date(log.datetime).toLocaleString()}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 45%' }}>
                <Typography variant="caption" color="text.secondary">
                  Carrier
                </Typography>
                <Typography variant="body2">{log.info?.carrier || 'N/A'}</Typography>
              </Box>
              <Box sx={{ flex: '1 1 45%' }}>
                <Typography variant="caption" color="text.secondary">
                  User
                </Typography>
                <Typography variant="body2">{log.info?.username || log.info?.user_name || 'N/A'}</Typography>
              </Box>
            </Box>
            {log.info?.type && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Type
                </Typography>
                <Typography variant="body2">{log.info?.type}</Typography>
              </Box>
            )}
          </Stack>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* User Feedback Content */}
        <Box sx={{ mb: 3 }}>
          {log.info?.question && (
            <>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Question
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                {log.info?.question}
              </Typography>
            </>
          )}

          {log.info?.response && (
            <>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Response
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                {log.info?.response}
              </Typography>
            </>
          )}

          {log.info?.comments && (
            <>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                User Comments
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                {log.info?.comments}
              </Typography>
            </>
          )}

          {log.info?.feedback && (
            <>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                User Feedback
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {log.info?.feedback}
              </Typography>
            </>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Review Form */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Review
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Review Comment"
            placeholder="Enter your review comment (optional)"
            value={revComment}
            onChange={handleCommentChange}
            error={!!commentError}
            helperText={
              commentError || `${revComment.length}/5000 characters`
            }
            disabled={submitting || submitSuccess}
            sx={{ mb: 2 }}
            inputProps={{
              'aria-label': 'Review comment',
              maxLength: 5000,
            }}
          />

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Review Feedback"
            placeholder="Enter your review feedback (optional)"
            value={revFeedback}
            onChange={handleFeedbackChange}
            error={!!feedbackError}
            helperText={
              feedbackError || `${revFeedback.length}/5000 characters`
            }
            disabled={submitting || submitSuccess}
            inputProps={{
              'aria-label': 'Review feedback',
              maxLength: 5000,
            }}
          />

          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Note: At least one field (comment or feedback) must be filled
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={handleClose}
          disabled={submitting}
          startIcon={<Close />}
          sx={{
            '&:focus-visible': {
              outline: '2px solid',
              outlineColor: 'primary.main',
              outlineOffset: '2px',
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!isFormValid || submitting || submitSuccess}
          startIcon={submitting ? <CircularProgress size={20} /> : <Save />}
          sx={{
            '&:focus-visible': {
              outline: '2px solid',
              outlineColor: 'primary.main',
              outlineOffset: '2px',
            },
          }}
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
