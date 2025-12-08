/**
 * Example usage of dashboard visualization components
 * This file demonstrates how to use MetricsCard, PerformanceChart, and TrendAnalysis
 */

import { Box, Stack } from '@mui/material';
import { MetricsCard } from './MetricsCard';
import { PerformanceChart } from './PerformanceChart';
import { TrendAnalysis } from './TrendAnalysis';
import SpeedIcon from '@mui/icons-material/Speed';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ChatIcon from '@mui/icons-material/Chat';
import TimerIcon from '@mui/icons-material/Timer';
import type { MetricData, DateRange } from '../types';

/**
 * Example dashboard visualization component
 */
export function DashboardVisualizationExample() {
  // Sample metrics data
  const accuracy = 87.5;
  const satisfaction = 4.2;
  const interactionCount = 1234;
  const avgResponseTime = 450;

  // Sample chart data
  const chartData = [
    { timestamp: '2024-01-01', accuracy: 85, satisfaction: 4.0, interactions: 100 },
    { timestamp: '2024-01-02', accuracy: 86, satisfaction: 4.1, interactions: 120 },
    { timestamp: '2024-01-03', accuracy: 88, satisfaction: 4.3, interactions: 150 },
    { timestamp: '2024-01-04', accuracy: 87, satisfaction: 4.2, interactions: 140 },
    { timestamp: '2024-01-05', accuracy: 89, satisfaction: 4.4, interactions: 160 },
    { timestamp: '2024-01-06', accuracy: 90, satisfaction: 4.5, interactions: 180 },
    { timestamp: '2024-01-07', accuracy: 88, satisfaction: 4.3, interactions: 170 },
  ];

  // Sample trend data
  const trendMetrics: MetricData[] = [
    {
      timestamp: '2024-01-01',
      accuracy: 85,
      satisfaction: 4.0,
      interactionCount: 100,
      avgResponseTime: 500,
    },
    {
      timestamp: '2024-01-02',
      accuracy: 86,
      satisfaction: 4.1,
      interactionCount: 120,
      avgResponseTime: 480,
    },
    {
      timestamp: '2024-01-03',
      accuracy: 88,
      satisfaction: 4.3,
      interactionCount: 150,
      avgResponseTime: 450,
    },
    {
      timestamp: '2024-01-04',
      accuracy: 87,
      satisfaction: 4.2,
      interactionCount: 140,
      avgResponseTime: 460,
    },
  ];

  const timeRange: DateRange = {
    startDate: '2024-01-03',
    endDate: '2024-01-04',
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Metrics Cards */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mb: 3 }}>
        <Box sx={{ flex: 1 }}>
          <MetricsCard
            title="Accuracy Score"
            value={accuracy}
            unit="%"
            trend={5.2}
            icon={<SpeedIcon />}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <MetricsCard
            title="Satisfaction Rating"
            value={satisfaction}
            unit="/5"
            trend={3.1}
            icon={<ThumbUpIcon />}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <MetricsCard
            title="Total Interactions"
            value={interactionCount}
            precision={0}
            trend={12.5}
            icon={<ChatIcon />}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <MetricsCard
            title="Avg Response Time"
            value={avgResponseTime}
            unit="ms"
            trend={-8.3}
            icon={<TimerIcon />}
          />
        </Box>
      </Stack>

      {/* Performance Charts */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 3 }}>
        <Box sx={{ flex: 1 }}>
          <PerformanceChart
            data={chartData}
            type="line"
            title="Accuracy & Satisfaction Trends"
            dataKeys={['accuracy', 'satisfaction']}
            height={300}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <PerformanceChart
            data={chartData}
            type="bar"
            title="Daily Interactions"
            dataKeys={['interactions']}
            height={300}
          />
        </Box>
      </Stack>

      {/* Trend Analysis */}
      <Box>
        <TrendAnalysis metrics={trendMetrics} timeRange={timeRange} />
      </Box>
    </Box>
  );
}
