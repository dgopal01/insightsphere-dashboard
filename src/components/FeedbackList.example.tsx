/**
 * FeedbackList Component Example Usage
 * Demonstrates how to use the FeedbackList component with the useFeedback hook
 */

import React, { useState } from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import { FeedbackList, type GroupByOption } from './FeedbackList';
import { useFeedback } from '../hooks/useFeedback';

/**
 * Example: Basic FeedbackList
 */
export const BasicFeedbackListExample: React.FC = () => {
  const { feedback, isLoading } = useFeedback();

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        All Feedback
      </Typography>
      <FeedbackList feedback={feedback} loading={isLoading} />
    </Container>
  );
};

/**
 * Example: FeedbackList with Grouping
 */
export const GroupedFeedbackListExample: React.FC = () => {
  const { feedback, isLoading } = useFeedback();
  const [groupBy, setGroupBy] = useState<GroupByOption>('none');

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Feedback with Grouping
      </Typography>
      <FeedbackList
        feedback={feedback}
        loading={isLoading}
        groupBy={groupBy}
        onGroupByChange={setGroupBy}
      />
    </Container>
  );
};

/**
 * Example: FeedbackList for Specific Log
 */
export const LogFeedbackListExample: React.FC<{ logId: string }> = ({ logId }) => {
  const { feedback, isLoading } = useFeedback({ logId });

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Feedback for Log: {logId}
      </Typography>
      <FeedbackList feedback={feedback} loading={isLoading} />
    </Container>
  );
};

/**
 * Example: FeedbackList for Specific User
 */
export const UserFeedbackListExample: React.FC<{ userId: string }> = ({ userId }) => {
  const { feedback, isLoading } = useFeedback({ userId });
  const [groupBy, setGroupBy] = useState<GroupByOption>('date');

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Feedback from User: {userId}
      </Typography>
      <FeedbackList
        feedback={feedback}
        loading={isLoading}
        groupBy={groupBy}
        onGroupByChange={setGroupBy}
      />
    </Container>
  );
};

/**
 * Example: FeedbackList with Custom Pagination
 */
export const CustomPaginationFeedbackListExample: React.FC = () => {
  const { feedback, isLoading } = useFeedback();

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Feedback with Custom Pagination
      </Typography>
      <FeedbackList
        feedback={feedback}
        loading={isLoading}
        itemsPerPage={5} // Show 5 items per page
      />
    </Container>
  );
};

/**
 * Example: FeedbackList with Date Range Filter
 */
export const DateRangeFeedbackListExample: React.FC = () => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7); // Last 7 days

  const { feedback, isLoading } = useFeedback({
    startDate: startDate.toISOString(),
    endDate: new Date().toISOString(),
  });

  const [groupBy, setGroupBy] = useState<GroupByOption>('date');

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Feedback from Last 7 Days
      </Typography>
      <FeedbackList
        feedback={feedback}
        loading={isLoading}
        groupBy={groupBy}
        onGroupByChange={setGroupBy}
      />
    </Container>
  );
};

/**
 * Example: Complete Feedback Page with Metrics
 */
export const CompleteFeedbackPageExample: React.FC = () => {
  const { feedback, isLoading, metrics } = useFeedback();
  const [groupBy, setGroupBy] = useState<GroupByOption>('rating');

  return (
    <Container maxWidth="lg">
      <Typography variant="h3" gutterBottom>
        Feedback Dashboard
      </Typography>

      {/* Metrics Summary */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6">Total Feedback</Typography>
          <Typography variant="h4">{metrics.totalCount}</Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6">Average Rating</Typography>
          <Typography variant="h4">{metrics.averageRating.toFixed(1)}</Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6">Positive</Typography>
          <Typography variant="h4" color="success.main">
            {metrics.positiveCount}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6">Negative</Typography>
          <Typography variant="h4" color="error.main">
            {metrics.negativeCount}
          </Typography>
        </Paper>
      </Box>

      {/* Feedback List */}
      <FeedbackList
        feedback={feedback}
        loading={isLoading}
        groupBy={groupBy}
        onGroupByChange={setGroupBy}
      />
    </Container>
  );
};
