/**
 * TrendAnalysis Component
 * Displays comparative trend analysis across multiple metrics
 * Calculates percentage changes and highlights significant variations
 */

import {
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  useTheme,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import type { MetricData, DateRange } from '../types';

export interface TrendAnalysisProps {
  metrics: MetricData[];
  timeRange: DateRange;
  loading?: boolean;
  error?: string;
}

interface MetricComparison {
  name: string;
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'flat';
}

/**
 * Calculate average metric value for a time period
 */
function calculateAverage(metrics: MetricData[], key: keyof MetricData): number {
  if (metrics.length === 0) return 0;

  const values = metrics.map((m) => m[key]).filter((v): v is number => typeof v === 'number');

  if (values.length === 0) return 0;

  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Split metrics into current and previous periods
 */
function splitMetricsByPeriod(
  metrics: MetricData[],
  timeRange: DateRange
): { current: MetricData[]; previous: MetricData[] } {
  const startDate = new Date(timeRange.startDate);
  const endDate = new Date(timeRange.endDate);
  const periodDuration = endDate.getTime() - startDate.getTime();
  const previousStartDate = new Date(startDate.getTime() - periodDuration);

  const current = metrics.filter((m) => {
    const date = new Date(m.timestamp);
    return date >= startDate && date <= endDate;
  });

  const previous = metrics.filter((m) => {
    const date = new Date(m.timestamp);
    return date >= previousStartDate && date < startDate;
  });

  return { current, previous };
}

/**
 * Calculate trend comparisons for all metrics
 */
function calculateTrends(
  currentMetrics: MetricData[],
  previousMetrics: MetricData[]
): MetricComparison[] {
  const metricKeys: Array<{ key: keyof MetricData; name: string }> = [
    { key: 'accuracy', name: 'Accuracy' },
    { key: 'satisfaction', name: 'Satisfaction' },
    { key: 'interactionCount', name: 'Interactions' },
    { key: 'avgResponseTime', name: 'Avg Response Time' },
  ];

  return metricKeys.map(({ key, name }) => {
    const current = calculateAverage(currentMetrics, key);
    const previous = calculateAverage(previousMetrics, key);
    const change = current - previous;
    const changePercent = previous !== 0 ? (change / previous) * 100 : 0;

    let trend: 'up' | 'down' | 'flat' = 'flat';
    if (Math.abs(changePercent) > 1) {
      trend = changePercent > 0 ? 'up' : 'down';
    }

    return {
      name,
      current,
      previous,
      change,
      changePercent,
      trend,
    };
  });
}

/**
 * Format metric value based on type
 */
function formatMetricValue(name: string, value: number): string {
  if (name === 'Interactions') {
    return Math.round(value).toString();
  }
  if (name === 'Avg Response Time') {
    return `${value.toFixed(0)}ms`;
  }
  return value.toFixed(2);
}

/**
 * Get trend icon and color
 */
function getTrendDisplay(trend: 'up' | 'down' | 'flat', metricName: string) {
  const theme = useTheme();

  // For response time, down is good (faster), up is bad (slower)
  const isResponseTime = metricName === 'Avg Response Time';

  if (trend === 'flat') {
    return {
      icon: <TrendingFlatIcon fontSize="small" />,
      color: theme.palette.text.secondary,
      label: 'No change',
    };
  }

  if (trend === 'up') {
    return {
      icon: <TrendingUpIcon fontSize="small" />,
      color: isResponseTime ? theme.palette.error.main : theme.palette.success.main,
      label: isResponseTime ? 'Slower' : 'Improved',
    };
  }

  return {
    icon: <TrendingDownIcon fontSize="small" />,
    color: isResponseTime ? theme.palette.success.main : theme.palette.error.main,
    label: isResponseTime ? 'Faster' : 'Declined',
  };
}

/**
 * TrendAnalysis component for comparative metrics
 */
export function TrendAnalysis({ metrics, timeRange, loading = false, error }: TrendAnalysisProps) {
  if (loading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Trend Analysis
          </Typography>
          <Box
            sx={{
              height: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'action.hover',
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Loading trend data...
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
            Trend Analysis
          </Typography>
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (metrics.length === 0) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Trend Analysis
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No data available for trend analysis
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const { current, previous } = splitMetricsByPeriod(metrics, timeRange);
  const trends = calculateTrends(current, previous);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Trend Analysis
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Comparing current period vs previous period
        </Typography>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Metric</TableCell>
                <TableCell align="right">Current</TableCell>
                <TableCell align="right">Previous</TableCell>
                <TableCell align="right">Change</TableCell>
                <TableCell align="center">Trend</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {trends.map((comparison) => {
                const trendDisplay = getTrendDisplay(comparison.trend, comparison.name);

                return (
                  <TableRow key={comparison.name} hover>
                    <TableCell component="th" scope="row">
                      <Typography variant="body2" fontWeight="medium">
                        {comparison.name}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {formatMetricValue(comparison.name, comparison.current)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="text.secondary">
                        {formatMetricValue(comparison.name, comparison.previous)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        sx={{
                          color: trendDisplay.color,
                          fontWeight: 'medium',
                        }}
                      >
                        {comparison.changePercent > 0 ? '+' : ''}
                        {comparison.changePercent.toFixed(1)}%
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        icon={trendDisplay.icon}
                        label={trendDisplay.label}
                        size="small"
                        sx={{
                          backgroundColor: `${trendDisplay.color}20`,
                          color: trendDisplay.color,
                          fontWeight: 'medium',
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
