/**
 * Dashboard Page
 * Displays performance metrics and analytics with filtering capabilities
 * Requirements: 5.1, 5.4, 5.5, 14.1, 14.2, 14.3, 14.4, 14.5
 * Optimized with useMemo and useCallback for performance
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Stack,
} from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ChatIcon from '@mui/icons-material/Chat';
import TimerIcon from '@mui/icons-material/Timer';
import { MetricsCard } from '../components/MetricsCard';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { PerformanceChart } from '../components/PerformanceChart';
import { TrendAnalysis } from '../components/TrendAnalysis';
import { useMetrics } from '../hooks/useMetrics';
import { useChatLogs } from '../hooks/useChatLogs';
import { classifyError } from '../utils';
import type { MetricData, DateRange, ChartDataPoint } from '../types';

/**
 * Get default date range (last 30 days)
 */
function getDefaultDateRange(): DateRange {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
}

/**
 * Dashboard Page Component
 */
const DashboardPage: React.FC = () => {
  // Filter state
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange());
  const [userSegment, setUserSegment] = useState<string>('all');
  const [conversationType, setConversationType] = useState<string>('all');

  // Build filter options for useMetrics
  const metricsOptions = useMemo(() => {
    const options: any = {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    };

    if (userSegment !== 'all') {
      options.userId = userSegment;
    }

    if (conversationType !== 'all') {
      options.conversationId = conversationType;
    }

    return options;
  }, [dateRange, userSegment, conversationType]);

  // Fetch metrics data
  const { accuracy, satisfaction, interactionCount, avgResponseTime, isLoading, error, refetch } =
    useMetrics(metricsOptions);

  // Fetch chat logs for time-series data
  const { logs, isLoading: isLoadingLogs } = useChatLogs({
    filters: {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      userId: userSegment !== 'all' ? userSegment : undefined,
      conversationId: conversationType !== 'all' ? conversationType : undefined,
    },
  });

  // Generate time-series data for charts
  const chartData = useMemo<ChartDataPoint[]>(() => {
    if (!logs || logs.length === 0) return [];

    // Group logs by date
    const dataByDate = new Map<string, { logs: typeof logs; feedback: number[] }>();

    logs.forEach((log) => {
      const date = new Date(log.timestamp).toISOString().split('T')[0];
      if (!dataByDate.has(date)) {
        dataByDate.set(date, { logs: [], feedback: [] });
      }
      dataByDate.get(date)!.logs.push(log);
    });

    // Calculate metrics for each date
    const chartPoints: ChartDataPoint[] = Array.from(dataByDate.entries())
      .map(([date, data]) => {
        const logsWithAccuracy = data.logs.filter((l) => l.accuracy !== undefined);
        const avgAccuracy =
          logsWithAccuracy.length > 0
            ? logsWithAccuracy.reduce((sum, l) => sum + (l.accuracy || 0), 0) /
              logsWithAccuracy.length
            : 0;

        const avgResponse =
          data.logs.length > 0
            ? data.logs.reduce((sum, l) => sum + l.responseTime, 0) / data.logs.length
            : 0;

        return {
          timestamp: date,
          accuracy: Number(avgAccuracy.toFixed(2)),
          interactions: data.logs.length,
          avgResponseTime: Number(avgResponse.toFixed(0)),
        };
      })
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

    return chartPoints;
  }, [logs]);

  // Generate metric data for trend analysis
  const metricData = useMemo<MetricData[]>(() => {
    return chartData.map((point) => ({
      timestamp: point.timestamp,
      accuracy: point.accuracy as number,
      satisfaction: satisfaction, // Use overall satisfaction for now
      interactionCount: point.interactions as number,
      avgResponseTime: point.avgResponseTime as number,
    }));
  }, [chartData, satisfaction]);

  // Handle date range changes - memoized to prevent unnecessary re-renders
  const handleStartDateChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setDateRange((prev) => ({ ...prev, startDate: event.target.value }));
  }, []);

  const handleEndDateChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setDateRange((prev) => ({ ...prev, endDate: event.target.value }));
  }, []);

  const handleUserSegmentChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setUserSegment(event.target.value);
  }, []);

  const handleConversationTypeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setConversationType(event.target.value);
  }, []);

  // Extract unique user segments and conversation types from logs
  const userSegments = useMemo(() => {
    const segments = new Set(logs.map((log) => log.userId));
    return ['all', ...Array.from(segments)];
  }, [logs]);

  const conversationTypes = useMemo(() => {
    const types = new Set(logs.map((log) => log.conversationId));
    return ['all', ...Array.from(types)];
  }, [logs]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Filter Controls */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            label="Start Date"
            type="date"
            value={dateRange.startDate}
            onChange={handleStartDateChange}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          <TextField
            fullWidth
            label="End Date"
            type="date"
            value={dateRange.endDate}
            onChange={handleEndDateChange}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          <TextField
            fullWidth
            select
            label="User Segment"
            value={userSegment}
            onChange={handleUserSegmentChange}
            size="small"
          >
            {userSegments.map((segment) => (
              <MenuItem key={segment} value={segment}>
                {segment === 'all' ? 'All Users' : segment}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            select
            label="Conversation Type"
            value={conversationType}
            onChange={handleConversationTypeChange}
            size="small"
          >
            {conversationTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type === 'all' ? 'All Conversations' : type}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Paper>

      {/* Error Display */}
      {error && (
        <ErrorDisplay
          error={error}
          type={classifyError(error)}
          onRetry={refetch}
          showDetails={process.env.NODE_ENV === 'development'}
        />
      )}

      {/* Metrics Cards */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={3}
        sx={{ mb: 3 }}
        flexWrap="wrap"
      >
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
          <MetricsCard
            title="Accuracy Score"
            value={accuracy}
            unit="%"
            icon={<SpeedIcon />}
            loading={isLoading}
            precision={2}
          />
        </Box>
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
          <MetricsCard
            title="Satisfaction Rating"
            value={satisfaction}
            unit="/5"
            icon={<ThumbUpIcon />}
            loading={isLoading}
            precision={2}
          />
        </Box>
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
          <MetricsCard
            title="Total Interactions"
            value={interactionCount}
            icon={<ChatIcon />}
            loading={isLoading}
            precision={0}
          />
        </Box>
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
          <MetricsCard
            title="Avg Response Time"
            value={avgResponseTime}
            unit="ms"
            icon={<TimerIcon />}
            loading={isLoading}
            precision={0}
          />
        </Box>
      </Stack>

      {/* Performance Charts */}
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} sx={{ mb: 3 }}>
        <Box sx={{ flex: 1 }}>
          <PerformanceChart
            data={chartData}
            type="line"
            title="Accuracy Trend"
            dataKeys={['accuracy']}
            height={300}
            loading={isLoadingLogs}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <PerformanceChart
            data={chartData}
            type="bar"
            title="Daily Interactions"
            dataKeys={['interactions']}
            height={300}
            loading={isLoadingLogs}
          />
        </Box>
      </Stack>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} sx={{ mb: 3 }}>
        <Box sx={{ flex: 1 }}>
          <PerformanceChart
            data={chartData}
            type="area"
            title="Response Time Trend"
            dataKeys={['avgResponseTime']}
            height={300}
            loading={isLoadingLogs}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <TrendAnalysis
            metrics={metricData}
            timeRange={dateRange}
            loading={isLoadingLogs}
          />
        </Box>
      </Stack>
    </Box>
  );
};

export default DashboardPage;
export { DashboardPage };
