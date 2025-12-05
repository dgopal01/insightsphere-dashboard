/**
 * FeedbackForm Example Usage
 * Demonstrates how to use the FeedbackForm component
 */

import React from 'react';
import { FeedbackForm } from './FeedbackForm';
import { useFeedback } from '../hooks/useFeedback';
import { Box, Container, Typography } from '@mui/material';

/**
 * Example: FeedbackForm with useFeedback hook
 */
export const FeedbackFormExample: React.FC = () => {
  const { submitFeedback, isSubmitting } = useFeedback();

  const handleSubmit = async (feedback: any) => {
    await submitFeedback(feedback);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Feedback Form Example
        </Typography>
        <Typography variant="body1" paragraph>
          This example demonstrates the FeedbackForm component with all features:
        </Typography>
        <ul>
          <li>Thumbs up/down buttons for quick feedback</li>
          <li>1-5 star rating input (required)</li>
          <li>Optional text comment field (max 1000 characters)</li>
          <li>Client-side validation for rating range and comment length</li>
          <li>Success confirmation after submission</li>
          <li>Error messages for validation failures</li>
        </ul>

        <Box sx={{ mt: 4 }}>
          <FeedbackForm logId="example-log-123" onSubmit={handleSubmit} disabled={isSubmitting} />
        </Box>
      </Box>
    </Container>
  );
};

/**
 * Example: FeedbackForm with custom submit handler
 */
export const FeedbackFormCustomExample: React.FC = () => {
  const handleSubmit = async (feedback: any) => {
    console.log('Feedback submitted:', feedback);
    // Custom submission logic here
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Custom Feedback Handler
        </Typography>
        <FeedbackForm logId="custom-log-456" onSubmit={handleSubmit} />
      </Box>
    </Container>
  );
};
