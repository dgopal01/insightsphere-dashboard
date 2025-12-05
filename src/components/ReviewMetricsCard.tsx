/**
 * ReviewMetricsCard Component
 * Displays review metrics with color-coded status indicators
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */

import React, { memo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Skeleton,
  Chip,
  Stack,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import AssessmentIcon from '@mui/icons-material/Assessment';

export interface ReviewMetricsCardProps {
  title: string;
  total: number;
  reviewed: number;
  pending: number;
  percentage: number;
  loading?: boolean;
}

/**
 * Get color based on percentage
 * Green: >80%, Yellow: 40-80%, Red: <40%
 * Requirements: 9.1, 9.2, 9.3
 */
function getStatusColor(percentage: number): 'success' | 'warning' | 'error' {
  if (percentage > 80) {
    return 'success'; // Green
  } else if (percentage >= 40) {
    return 'warning'; // Yellow
  } else {
    return 'error'; // Red
  }
}

/**
 * Get status label based on percentage
 */
function getStatusLabel(percentage: number): string {
  if (percentage > 80) {
    return 'Excellent Progress';
  } else if (percentage >= 40) {
    return 'In Progress';
  } else {
    return 'Needs Attention';
  }
}

/**
 * ReviewMetricsCard component for displaying review progress metrics
 * Memoized to prevent unnecessary re-renders
 */
const ReviewMetricsCardComponent: React.FC<ReviewMetricsCardProps> = ({
  title,
  total,
  reviewed,
  pending,
  percentage,
  loading = false,
}) => {
  const statusColor = getStatusColor(percentage);
  const statusLabel = getStatusLabel(percentage);

  if (loading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Skeleton variant="text" width="40%" height={32} />
          <Skeleton variant="rectangular" width="100%" height={20} sx={{ mt: 2, mb: 2 }} />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="rectangular" height={80} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="rectangular" height={80} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="rectangular" height={80} />
            </Box>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
      role="article"
      aria-label={`${title} review metrics`}
    >
      <CardContent>
        {/* Title and Status Badge */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="h3">
            {title}
          </Typography>
          <Chip
            label={statusLabel}
            color={statusColor}
            size="small"
            icon={<AssessmentIcon />}
            aria-label={`Status: ${statusLabel}`}
          />
        </Box>

        {/* Progress Bar */}
        <Box mb={3}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="body2" color="text.secondary">
              Review Progress
            </Typography>
            <Typography
              variant="h6"
              component="span"
              color={`${statusColor}.main`}
              fontWeight="bold"
              aria-label={`${percentage} percent reviewed`}
            >
              {percentage}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={percentage}
            color={statusColor}
            sx={{
              height: 12,
              borderRadius: 6,
              bgcolor: `${statusColor}.light`,
              '& .MuiLinearProgress-bar': {
                borderRadius: 6,
              },
            }}
            aria-label={`Progress bar showing ${percentage} percent completion`}
          />
        </Box>

        {/* Metrics Stack */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          {/* Total Count */}
          <Box
            sx={{
              flex: 1,
              p: 2,
              bgcolor: 'primary.light',
              borderRadius: 2,
              textAlign: 'center',
            }}
            role="region"
            aria-label="Total count"
          >
            <Typography variant="body2" color="primary.contrastText" gutterBottom>
              Total
            </Typography>
            <Typography
              variant="h4"
              component="div"
              color="primary.contrastText"
              fontWeight="bold"
              aria-label={`Total: ${total}`}
            >
              {total.toLocaleString()}
            </Typography>
          </Box>

          {/* Reviewed Count */}
          <Box
            sx={{
              flex: 1,
              p: 2,
              bgcolor: 'success.light',
              borderRadius: 2,
              textAlign: 'center',
            }}
            role="region"
            aria-label="Reviewed count"
          >
            <Box display="flex" justifyContent="center" alignItems="center" gap={0.5} mb={0.5}>
              <CheckCircleIcon
                sx={{ fontSize: 16, color: 'success.contrastText' }}
                aria-hidden="true"
              />
              <Typography variant="body2" color="success.contrastText">
                Reviewed
              </Typography>
            </Box>
            <Typography
              variant="h4"
              component="div"
              color="success.contrastText"
              fontWeight="bold"
              aria-label={`Reviewed: ${reviewed}`}
            >
              {reviewed.toLocaleString()}
            </Typography>
          </Box>

          {/* Pending Count */}
          <Box
            sx={{
              flex: 1,
              p: 2,
              bgcolor: 'warning.light',
              borderRadius: 2,
              textAlign: 'center',
            }}
            role="region"
            aria-label="Pending count"
          >
            <Box display="flex" justifyContent="center" alignItems="center" gap={0.5} mb={0.5}>
              <PendingIcon
                sx={{ fontSize: 16, color: 'warning.contrastText' }}
                aria-hidden="true"
              />
              <Typography variant="body2" color="warning.contrastText">
                Pending
              </Typography>
            </Box>
            <Typography
              variant="h4"
              component="div"
              color="warning.contrastText"
              fontWeight="bold"
              aria-label={`Pending: ${pending}`}
            >
              {pending.toLocaleString()}
            </Typography>
          </Box>
        </Stack>

        {/* Additional Info */}
        <Box mt={2} pt={2} borderTop={1} borderColor="divider">
          <Typography variant="caption" color="text.secondary" display="block">
            {reviewed} of {total} entries have been reviewed
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            {pending} entries are pending review
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

// Export memoized component for performance optimization
export const ReviewMetricsCard = memo(ReviewMetricsCardComponent);
