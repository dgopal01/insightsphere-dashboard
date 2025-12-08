/**
 * MetricsCard Component
 * Displays individual performance metrics with optional trend indicators
 * Supports loading and error states
 * Optimized with React.memo for performance
 */

import React, { memo } from 'react';
import { Card, CardContent, Typography, Box, Skeleton } from '@mui/material';
import type { ReactNode } from 'react';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

export interface MetricsCardProps {
  title: string;
  value: number | string;
  trend?: number;
  icon?: ReactNode;
  loading?: boolean;
  error?: string;
  unit?: string;
  precision?: number;
}

/**
 * Format value with appropriate precision and unit
 */
function formatValue(value: number | string, precision?: number, unit?: string): string {
  if (typeof value === 'string') {
    return value;
  }

  const formatted = precision !== undefined ? value.toFixed(precision) : value.toString();
  return unit ? `${formatted}${unit}` : formatted;
}

/**
 * MetricsCard component for displaying individual metrics
 * Memoized to prevent unnecessary re-renders
 */
const MetricsCardComponent: React.FC<MetricsCardProps> = ({
  title,
  value,
  trend,
  icon,
  loading = false,
  error,
  unit,
  precision = 2,
}) => {
  if (loading) {
    return (
      <Card sx={{ height: '100%', minHeight: 150 }}>
        <CardContent>
          <Skeleton variant="text" width="60%" height={24} />
          <Skeleton variant="text" width="80%" height={48} sx={{ mt: 2 }} />
          <Skeleton variant="text" width="40%" height={20} sx={{ mt: 1 }} />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ height: '100%', minHeight: 150 }}>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const trendColor = trend !== undefined ? (trend >= 0 ? 'success.main' : 'error.main') : undefined;
  const TrendIcon = trend !== undefined ? (trend >= 0 ? TrendingUpIcon : TrendingDownIcon) : null;

  return (
    <Card
      sx={{
        height: '100%',
        minHeight: 150,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
      role="article"
      aria-label={`${title} metric card`}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Typography
            variant="subtitle2"
            color="text.secondary"
            gutterBottom
            id={`metric-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
          >
            {title}
          </Typography>
          {icon && (
            <Box color="primary.main" sx={{ opacity: 0.7 }} aria-hidden="true">
              {icon}
            </Box>
          )}
        </Box>

        <Typography
          variant="h4"
          component="div"
          sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}
          aria-labelledby={`metric-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
        >
          {formatValue(value, precision, unit)}
        </Typography>

        {trend !== undefined && TrendIcon && (
          <Box
            display="flex"
            alignItems="center"
            gap={0.5}
            role="status"
            aria-label={`Trend: ${trend >= 0 ? 'up' : 'down'} ${Math.abs(trend).toFixed(1)} percent compared to previous period`}
          >
            <TrendIcon sx={{ fontSize: 20, color: trendColor }} aria-hidden="true" />
            <Typography variant="body2" color={trendColor}>
              {Math.abs(trend).toFixed(1)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              vs previous period
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Export memoized component for performance optimization
export const MetricsCard = memo(MetricsCardComponent);
