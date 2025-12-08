/**
 * ChatLogReviewModal Component
 * Modal dialog for reviewing individual chat log entries
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6
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
  FormGroup,
  FormControlLabel,
  Checkbox,
  FormLabel,
} from '@mui/material';
import { Close, Save, CheckCircle, PendingActions, LocalOffer } from '@mui/icons-material';
import { validateReviewComment, validateReviewFeedback } from '../utils/validation';
import { sanitizeText } from '../utils/sanitization';
import type { ChatLogEntry } from '../types';

/**
 * Available issue tags for chat log review
 */
export const ISSUE_TAGS = [
  'Accuracy Issue',
  'Tone/Style Issue',
  'Safety Concern',
  'Reasoning Quality',
  'Incomplete Response',
  'Hallucination/Fabrication',
] as const;

export type IssueTag = typeof ISSUE_TAGS[number];

/**
 * Props for ChatLogReviewModal component
 */
export interface ChatLogReviewModalProps {
  open: boolean;
  log: ChatLogEntry | null;
  onClose: () => void;
  onSubmit: (logId: string, reviewData: { rev_comment: string; rev_feedback: string; issue_tags?: string[] }) => Promise<void>;
}

/**
 * Get review status for a log entry
 */
function getReviewStatus(log: ChatLogEntry): 'reviewed' | 'pending' {
  return log.rev_comment || log.rev_feedback ? 'reviewed' : 'pending';
}

/**
 * ChatLogReviewModal Component
 */
export const ChatLogReviewModal: React.FC<ChatLogReviewModalProps> = ({
  open,
  log,
  onClose,
  onSubmit,
}) => {
  const [revComment, setRevComment] = useState('');
  const [revFeedback, setRevFeedback] = useState('');
  const [issueTags, setIssueTags] = useState<string[]>([]);
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
      // Parse existing issue tags if they exist (stored as JSON string or comma-separated)
      const existingTags = log.issue_tags;
      if (existingTags) {
        try {
          const parsed = typeof existingTags === 'string' ? JSON.parse(existingTags) : existingTags;
          setIssueTags(Array.isArray(parsed) ? parsed : []);
        } catch {
          // If parsing fails, try comma-separated (only if it's a string)
          if (typeof existingTags === 'string') {
            setIssueTags(existingTags.split(',').map((t) => t.trim()).filter(Boolean));
          } else {
            setIssueTags([]);
          }
        }
      } else {
        setIssueTags([]);
      }
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
   * Handle issue tag toggle
   */
  const handleTagToggle = (tag: string) => {
    setIssueTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    setSubmitSuccess(false);
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
        issue_tags: issueTags,
      };

      await onSubmit(log.log_id, sanitizedData);
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

    const existingTags = log.issue_tags ? (typeof log.issue_tags === 'string' ? JSON.parse(log.issue_tags) : log.issue_tags) : [];
    const hasChanges =
      revComment !== (log.rev_comment || '') || 
      revFeedback !== (log.rev_feedback || '') ||
      JSON.stringify(issueTags) !== JSON.stringify(existingTags);

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
          <Typography variant="h6">Review Chat Log</Typography>
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
            Log Details
          </Typography>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 45%' }}>
                <Typography variant="caption" color="text.secondary">
                  Log ID
                </Typography>
                <Typography variant="body2">{log.log_id}</Typography>
              </Box>
              <Box sx={{ flex: '1 1 45%' }}>
                <Typography variant="caption" color="text.secondary">
                  Timestamp
                </Typography>
                <Typography variant="body2">
                  {new Date(log.timestamp).toLocaleString()}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 45%' }}>
                <Typography variant="caption" color="text.secondary">
                  Carrier
                </Typography>
                <Typography variant="body2">{log.carrier_name}</Typography>
              </Box>
              <Box sx={{ flex: '1 1 45%' }}>
                <Typography variant="caption" color="text.secondary">
                  User
                </Typography>
                <Typography variant="body2">{log.user_name || 'N/A'}</Typography>
              </Box>
            </Box>
          </Stack>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Question and Response */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Question
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
            {log.question}
          </Typography>

          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Response
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
            {log.response}
          </Typography>

          {log.citation && (
            <>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Citation
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {log.citation}
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
            sx={{ mb: 3 }}
            inputProps={{
              'aria-label': 'Review feedback',
              maxLength: 5000,
            }}
          />

          {/* Issue Tags */}
          <Box sx={{ mb: 2 }}>
            <FormLabel component="legend" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocalOffer fontSize="small" />
              Issue Tags (Optional)
            </FormLabel>
            <FormGroup>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 1 }}>
                {ISSUE_TAGS.map((tag) => (
                  <FormControlLabel
                    key={tag}
                    control={
                      <Checkbox
                        checked={issueTags.includes(tag)}
                        onChange={() => handleTagToggle(tag)}
                        disabled={submitting || submitSuccess}
                        sx={{
                          '&:focus-visible': {
                            outline: '2px solid',
                            outlineColor: 'primary.main',
                            outlineOffset: '2px',
                          },
                        }}
                      />
                    }
                    label={<Typography variant="body2">{tag}</Typography>}
                  />
                ))}
              </Box>
            </FormGroup>
          </Box>

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
