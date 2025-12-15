/**
 * PerformanceChart Component
 * Renders interactive charts using Recharts library
 * Supports zoom, hover tooltips, and responsive sizing
 * Optimized with React.memo for performance
 */

import React, { memo } from 'react';
import { Card, CardContent, Typography, Box, useTheme, useMediaQuery } from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export interface ChartDataPoint {
  timestamp: string;
  [key: string]: string | number;
}

export interface PerformanceChartProps {
  data: ChartDataPoint[];
  type: 'line' | 'bar' | 'area';
  title: string;
  dataKeys?: string[];
  xAxisKey?: string;
  loading?: boolean;
  error?: string;
  height?: number;
  colors?: string[];
}

/**
 * Custom tooltip component for charts
 */
function CustomTooltip({ active, payload, label }: any) {
  const theme = useTheme();

  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        backgroundColor:
          theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.95)',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        padding: 1.5,
        boxShadow: 2,
      }}
    >
      <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
        {label}
      </Typography>
      {payload.map((entry: any, index: number) => (
        <Box key={index} display="flex" alignItems="center" gap={1}>
          <Box
            sx={{
              width: 12,
              height: 12,
              backgroundColor: entry.color,
              borderRadius: '50%',
            }}
          />
          <Typography variant="body2" color="text.secondary">
            {entry.name}:
          </Typography>
          <Typography variant="body2" fontWeight="medium">
            {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

/**
 * Format timestamp for display on X-axis
 */
function formatXAxis(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return timestamp;
  }
}

/**
 * PerformanceChart component for rendering various chart types
 * Memoized to prevent unnecessary re-renders
 */
const PerformanceChartComponent: React.FC<PerformanceChartProps> = ({
  data,
  type,
  title,
  dataKeys = [],
  xAxisKey = 'timestamp',
  loading = false,
  error,
  height = 300,
  colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'],
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Extract data keys from first data point if not provided
  const effectiveDataKeys =
    dataKeys.length > 0
      ? dataKeys
      : data.length > 0
        ? Object.keys(data[0]).filter((key) => key !== xAxisKey)
        : [];

  if (loading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Box
            sx={{
              height,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'action.hover',
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Loading chart data...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Box
            sx={{
              height,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'error.light',
              borderRadius: 1,
              opacity: 0.1,
            }}
          >
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Box
            sx={{
              height,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'action.hover',
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No data available
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const chartProps = {
    data,
    margin: { top: 5, right: isMobile ? 5 : 30, left: isMobile ? 0 : 20, bottom: 5 },
  };

  const axisProps = {
    stroke: theme.palette.text.secondary,
    style: { fontSize: isMobile ? 10 : 12 },
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <ResponsiveContainer width="100%" height={height}>
          {type === 'line' ? (
            <LineChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis dataKey={xAxisKey} tickFormatter={formatXAxis} {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} />
              {effectiveDataKeys.map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          ) : type === 'bar' ? (
            <BarChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis dataKey={xAxisKey} tickFormatter={formatXAxis} {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} />
              {effectiveDataKeys.map((key, index) => (
                <Bar key={key} dataKey={key} fill={colors[index % colors.length]} />
              ))}
            </BarChart>
          ) : (
            <AreaChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis dataKey={xAxisKey} tickFormatter={formatXAxis} {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} />
              {effectiveDataKeys.map((key, index) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[index % colors.length]}
                  fill={colors[index % colors.length]}
                  fillOpacity={0.6}
                />
              ))}
            </AreaChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Export memoized component for performance optimization
export const PerformanceChart = memo(PerformanceChartComponent);
