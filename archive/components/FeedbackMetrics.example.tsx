/**
 * FeedbackMetrics Component Example
 * Demonstrates usage of the FeedbackMetrics component
 */

import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import { FeedbackMetrics } from './FeedbackMetrics';
import type { Feedback } from '../types';

/**
 * Sample feedback data for demonstration
 */
const sampleFeedback: Feedback[] = [
  {
    id: '1',
    logId: 'log1',
    userId: 'user1',
    rating: 5,
    thumbsUp: true,
    comment: 'Excellent response! Very helpful and accurate.',
    timestamp: '2024-01-15T10:00:00Z',
    category: 'accuracy',
  },
  {
    id: '2',
    logId: 'log2',
    userId: 'user2',
    rating: 4,
    thumbsUp: true,
    comment: 'Good response, could be more detailed.',
    timestamp: '2024-01-16T11:00:00Z',
    category: 'helpfulness',
  },
  {
    id: '3',
    logId: 'log3',
    userId: 'user3',
    rating: 5,
    thumbsUp: true,
    timestamp: '2024-01-17T12:00:00Z',
    category: 'speed',
  },
  {
    id: '4',
    logId: 'log4',
    userId: 'user4',
    rating: 2,
    thumbsUp: false,
    comment: 'Not helpful at all.',
    timestamp: '2024-01-18T13:00:00Z',
    category: 'accuracy',
  },
  {
    id: '5',
    logId: 'log5',
    userId: 'user5',
    rating: 3,
    thumbsUp: false,
    comment: 'Average response.',
    timestamp: '2024-01-19T14:00:00Z',
    category: 'helpfulness',
  },
  {
    id: '6',
    logId: 'log6',
    userId: 'user6',
    rating: 5,
    thumbsUp: true,
    timestamp: '2024-01-20T15:00:00Z',
    category: 'speed',
  },
  {
    id: '7',
    logId: 'log7',
    userId: 'user7',
    rating: 4,
    thumbsUp: true,
    comment: 'Pretty good!',
    timestamp: '2024-01-21T16:00:00Z',
    category: 'accuracy',
  },
  {
    id: '8',
    logId: 'log8',
    userId: 'user8',
    rating: 1,
    thumbsUp: false,
    comment: 'Terrible response.',
    timestamp: '2024-01-22T17:00:00Z',
    category: 'helpfulness',
  },
];

/**
 * Example component demonstrating FeedbackMetrics usage
 */
export const FeedbackMetricsExample: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          FeedbackMetrics Component Example
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          This example demonstrates the FeedbackMetrics component with sample data. The component
          displays:
        </Typography>
        <Box component="ul" sx={{ pl: 3 }}>
          <li>
            <Typography variant="body2">
              Positive/negative feedback ratio with visual indicator
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              Average rating with star display and distribution
            </Typography>
          </li>
          <li>
            <Typography variant="body2">Trend charts showing feedback over time</Typography>
          </li>
          <li>
            <Typography variant="body2">Date range filter controls</Typography>
          </li>
        </Box>
      </Paper>

      <FeedbackMetrics feedback={sampleFeedback} />
    </Container>
  );
};

export default FeedbackMetricsExample;
