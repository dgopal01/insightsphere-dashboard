import React, { memo } from 'react';
import { CheckCircle, Clock, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface ReviewMetricsCardProps {
  title: string;
  total: number;
  reviewed: number;
  pending: number;
  percentage: number;
  loading?: boolean;
}

function getStatusColor(percentage: number): string {
  if (percentage > 80) return 'text-green-600';
  if (percentage >= 40) return 'text-yellow-600';
  return 'text-red-600';
}

function getStatusBgColor(percentage: number): string {
  if (percentage > 80) return 'bg-green-50 border-green-200';
  if (percentage >= 40) return 'bg-yellow-50 border-yellow-200';
  return 'bg-red-50 border-red-200';
}

function getStatusLabel(percentage: number): string {
  if (percentage > 80) return 'Excellent Progress';
  if (percentage >= 40) return 'In Progress';
  return 'Needs Attention';
}

function getProgressColor(percentage: number): string {
  if (percentage > 80) return 'bg-green-600';
  if (percentage >= 40) return 'bg-yellow-600';
  return 'bg-red-600';
}

const ReviewMetricsCardComponent: React.FC<ReviewMetricsCardProps> = ({
  title,
  total,
  reviewed,
  pending,
  percentage,
  loading = false,
}) => {
  const statusColor = getStatusColor(percentage);
  const statusBgColor = getStatusBgColor(percentage);
  const statusLabel = getStatusLabel(percentage);
  const progressColor = getProgressColor(percentage);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-3 w-full" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-all hover:shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{title}</CardTitle>
          <Badge variant="outline" className={cn('gap-1', statusBgColor)}>
            <BarChart3 className="size-3" />
            {statusLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Review Progress</span>
            <span className={cn('text-2xl font-bold', statusColor)}>{percentage}%</span>
          </div>
          <div className="relative">
            <Progress value={percentage} className="h-3" />
            <div
              className={cn('absolute inset-0 h-3 rounded-full transition-all', progressColor)}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center">
            <div className="text-sm text-muted-foreground mb-1">Total</div>
            <div className="text-3xl font-bold text-primary">{total.toLocaleString()}</div>
          </div>

          {/* Reviewed */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-green-700 mb-1">
              <CheckCircle className="size-4" />
              <span>Reviewed</span>
            </div>
            <div className="text-3xl font-bold text-green-700">{reviewed.toLocaleString()}</div>
          </div>

          {/* Pending */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-yellow-700 mb-1">
              <Clock className="size-4" />
              <span>Pending</span>
            </div>
            <div className="text-3xl font-bold text-yellow-700">{pending.toLocaleString()}</div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="pt-4 border-t space-y-1">
          <p className="text-xs text-muted-foreground">
            {reviewed} of {total} entries have been reviewed
          </p>
          <p className="text-xs text-muted-foreground">{pending} entries are pending review</p>
        </div>
      </CardContent>
    </Card>
  );
};

export const ReviewMetricsCardNew = memo(ReviewMetricsCardComponent);
