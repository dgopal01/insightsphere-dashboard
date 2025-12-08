/**
 * FeedbackMetrics Component
 * Displays aggregated feedback metrics with visual indicators
 * Requirements: 4.1, 4.3, 4.5
 */

import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Rating,
  LinearProgress,
  Paper,
  TextField,
  Stack,
  Chip,
  Divider,
  useTheme,
} from '@mui/material';
import {
  ThumbUp,
  ThumbDown,
  TrendingUp,
  TrendingDown,
  Star as StarIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { useFeedbackMetrics } from '../hooks/useFeedbackMetrics';
import type { Feedback } from '../types';

/**
 * Props for FeedbackMetrics component
 */
export interface FeedbackMetricsProps {
  logId?: string;
  userId?: string;
  feedback?: Feedback[];
}

/**
 * Data point for trend chart
 */
interface TrendDataPoint {
  date: string;
  positiveCount: number;
  negativeCount: number;
  averageRating: number;
}

/**
 * FeedbackMetrics Component
 *
 * Displays:
 * - Positive/negative feedback ratio with visual indicator (Requirement 4.1)
 * - Average rating with star display (Requirement 4.3)
 * - Trend chart showing feedback over time (Requirement 4.3)
 * - Date range filter controls (Requirement 4.5)
 */
export const FeedbackMetrics: React.FC<FeedbackMetricsProps> = ({
  logId,
  userId,
  feedback: externalFeedback,
}) => {
  const theme = useTheme();
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Use hook if no external feedback provided
  const { metrics, isLoading } = useFeedbackMetrics({
    logId,
    userId,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    enabled: !externalFeedback,
  });

  // Use external feedback if provided, otherwise use hook data
  const displayMetrics = useMemo(() => {
    if (externalFeedback) {
      // Calculate metrics from external feedback
      const filtered = externalFeedback.filter((f) => {
        if (startDate && f.timestamp < startDate) return false;
        if (endDate && f.timestamp > endDate) return false;
        return true;
      });

      const positiveCount = filtered.filter((f) => f.thumbsUp).length;
      const negativeCount = filtered.filter((f) => !f.thumbsUp).length;
      const totalRating = filtered.reduce((sum, f) => sum + f.rating, 0);
      const averageRating = filtered.length > 0 ? totalRating / filtered.length : 0;
      const ratio = negativeCount === 0 ? positiveCount : positiveCount / negativeCount;

      return {
        positiveCount,
        negativeCount,
        averageRating,
        totalCount: filtered.length,
        ratio,
      };
    }
    return metrics;
  }, [externalFeedback, metrics, startDate, endDate]);

  /**
   * Generate trend data from feedback
   */
  const trendData = useMemo((): TrendDataPoint[] => {
    const feedbackSource = externalFeedback || [];

    if (feedbackSource.length === 0) {
      return [];
    }

    // Filter by date range
    const filtered = feedbackSource.filter((f) => {
      if (startDate && f.timestamp < startDate) return false;
      if (endDate && f.timestamp > endDate) return false;
      return true;
    });

    // Group by date
    const groupedByDate = new Map<string, Feedback[]>();

    filtered.forEach((f) => {
      const date = f.timestamp.split('T')[0]; // Get YYYY-MM-DD
      if (!groupedByDate.has(date)) {
        groupedByDate.set(date, []);
      }
      groupedByDate.get(date)!.push(f);
    });

    // Calculate metrics for each date
    const data: TrendDataPoint[] = Array.from(groupedByDate.entries())
      .map(([date, items]) => {
        const positiveCount = items.filter((f) => f.thumbsUp).length;
        const negativeCount = items.filter((f) => !f.thumbsUp).length;
        const totalRating = items.reduce((sum, f) => sum + f.rating, 0);
        const averageRating = items.length > 0 ? totalRating / items.length : 0;

        return {
          date,
          positiveCount,
          negativeCount,
          averageRating,
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));

    return data;
  }, [externalFeedback, startDate, endDate]);

  /**
   * Calculate ratio percentage for visual display
   */
  const ratioPercentage = useMemo(() => {
    const total = displayMetrics.positiveCount + displayMetrics.negativeCount;
    if (total === 0) return 50;
    return (displayMetrics.positiveCount / total) * 100;
  }, [displayMetrics]);

  /**
   * Format date for display
   */
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  /**
   * Get trend indicator
   */
  const getTrendIndicator = () => {
    if (trendData.length < 2) return null;

    const recent = trendData[trendData.length - 1];
    const previous = trendData[trendData.length - 2];

    const recentRatio = recent.positiveCount / (recent.positiveCount + recent.negativeCount || 1);
    const previousRatio =
      previous.positiveCount / (previous.positiveCount + previous.negativeCount || 1);

    const isImproving = recentRatio > previousRatio;

    return (
      <Chip
        icon={isImproving ? <TrendingUp /> : <TrendingDown />}
        label={isImproving ? 'Improving' : 'Declining'}
        color={isImproving ? 'success' : 'error'}
        size="small"
      />
    );
  };

  return (
    <Box>
      {/* Date Range Filters - Requirement 4.5 */}
      <Paper sx={{ p: 2, mb: 3 }} role="search" aria-label="Feedback metrics date range filter">
        <Typography variant="h6" gutterBottom id="date-range-heading">
          Filter by Date Range
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
            inputProps={{
              'aria-label': 'Filter start date for feedback metrics',
            }}
          />
          <TextField
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
            inputProps={{
              'aria-label': 'Filter end date for feedback metrics',
            }}
          />
        </Stack>
      </Paper>

      {/* Metrics Cards */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 3 }}>
        {/* Positive/Negative Ratio - Requirement 4.1 */}
        <Box sx={{ flex: 1 }}>
          <Card sx={{ height: '100%' }} role="region" aria-labelledby="feedback-ratio-heading">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ flex: 1 }} id="feedback-ratio-heading">
                  Feedback Ratio
                </Typography>
                {getTrendIndicator()}
              </Box>

              <Stack spacing={2}>
                {/* Positive Count */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <ThumbUp sx={{ color: 'success.main', mr: 1 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                      Positive
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      {displayMetrics.positiveCount}
                    </Typography>
                  </Box>
                </Box>

                {/* Negative Count */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <ThumbDown sx={{ color: 'error.main', mr: 1 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                      Negative
                    </Typography>
                    <Typography variant="h6" color="error.main">
                      {displayMetrics.negativeCount}
                    </Typography>
                  </Box>
                </Box>

                <Divider />

                {/* Visual Ratio Bar */}
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Ratio
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {displayMetrics.ratio.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      position: 'relative',
                      height: 24,
                      borderRadius: 1,
                      overflow: 'hidden',
                      bgcolor: 'error.light',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: `${ratioPercentage}%`,
                        bgcolor: 'success.main',
                        transition: 'width 0.3s ease',
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: 'white',
                        fontWeight: 'bold',
                        textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                      }}
                    >
                      {ratioPercentage.toFixed(1)}% Positive
                    </Typography>
                  </Box>
                </Box>

                {/* Total Count */}
                <Box sx={{ textAlign: 'center', pt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Total Feedback: {displayMetrics.totalCount}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* Average Rating - Requirement 4.3 */}
        <Box sx={{ flex: 1 }}>
          <Card sx={{ height: '100%' }} role="region" aria-labelledby="average-rating-heading">
            <CardContent>
              <Typography variant="h6" gutterBottom id="average-rating-heading">
                Average Rating
              </Typography>

              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography
                  variant="h2"
                  fontWeight="bold"
                  color="primary.main"
                  gutterBottom
                  aria-label={`Average rating: ${displayMetrics.averageRating.toFixed(2)} out of 5`}
                >
                  {displayMetrics.averageRating.toFixed(2)}
                </Typography>

                <Rating
                  value={displayMetrics.averageRating}
                  readOnly
                  precision={0.1}
                  size="large"
                  sx={{ mb: 2 }}
                  aria-label={`${displayMetrics.averageRating.toFixed(1)} stars out of 5`}
                />

                <Typography variant="body2" color="text.secondary">
                  out of 5.0
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Rating Distribution */}
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Rating Distribution
                </Typography>
                {[5, 4, 3, 2, 1].map((rating) => {
                  const feedbackSource = externalFeedback || [];
                  const count = feedbackSource.filter((f) => {
                    if (startDate && f.timestamp < startDate) return false;
                    if (endDate && f.timestamp > endDate) return false;
                    return f.rating === rating;
                  }).length;
                  const percentage =
                    displayMetrics.totalCount > 0 ? (count / displayMetrics.totalCount) * 100 : 0;

                  return (
                    <Box key={rating} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="caption" sx={{ width: 20 }}>
                        {rating}
                      </Typography>
                      <StarIcon sx={{ fontSize: 16, color: 'warning.main', mr: 1 }} />
                      <Box sx={{ flex: 1, mr: 2 }}>
                        <LinearProgress
                          variant="determinate"
                          value={percentage}
                          sx={{ height: 8, borderRadius: 1 }}
                        />
                      </Box>
                      <Typography variant="caption" sx={{ width: 40, textAlign: 'right' }}>
                        {count}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Stack>

      {/* Trend Chart - Requirement 4.3 */}
      {trendData.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Feedback Trends Over Time
            </Typography>

            <Box sx={{ width: '100%', height: 300, mt: 2 }}>
              <ResponsiveContainer>
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={formatDate} style={{ fontSize: 12 }} />
                  <YAxis style={{ fontSize: 12 }} />
                  <Tooltip
                    labelFormatter={(label) => `Date: ${formatDate(label as string)}`}
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 4,
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="positiveCount"
                    stackId="1"
                    stroke={theme.palette.success.main}
                    fill={theme.palette.success.light}
                    name="Positive"
                  />
                  <Area
                    type="monotone"
                    dataKey="negativeCount"
                    stackId="1"
                    stroke={theme.palette.error.main}
                    fill={theme.palette.error.light}
                    name="Negative"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Average Rating Trend
            </Typography>

            <Box sx={{ width: '100%', height: 250, mt: 2 }}>
              <ResponsiveContainer>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={formatDate} style={{ fontSize: 12 }} />
                  <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} style={{ fontSize: 12 }} />
                  <Tooltip
                    labelFormatter={(label) => `Date: ${formatDate(label as string)}`}
                    formatter={(value: number) => [value.toFixed(2), 'Rating']}
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 4,
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="averageRating"
                    stroke={theme.palette.primary.main}
                    strokeWidth={2}
                    dot={{ fill: theme.palette.primary.main, r: 4 }}
                    name="Average Rating"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {trendData.length === 0 && !isLoading && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <StarIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No feedback data available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Feedback trends will appear here once data is available for the selected date range.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};
