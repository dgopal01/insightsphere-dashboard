/**
 * CloudWatch Monitoring Integration
 * Sends metrics and logs to AWS CloudWatch
 * Requirement 9.4: Add CloudWatch integration for backend monitoring
 */

/**
 * CloudWatch metric interface
 */
export interface CloudWatchMetric {
  namespace: string;
  metricName: string;
  value: number;
  unit: 'Count' | 'Seconds' | 'Milliseconds' | 'Bytes' | 'Percent' | 'None';
  dimensions?: Record<string, string>;
  timestamp?: number;
}

/**
 * CloudWatch log event interface
 */
export interface CloudWatchLogEvent {
  message: string;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';
  timestamp: number;
  context?: Record<string, unknown>;
}

/**
 * Send metric to CloudWatch
 * Requirement 9.4: CloudWatch integration
 */
export const sendMetricToCloudWatch = async (metric: CloudWatchMetric): Promise<void> => {
  // Only send in production with CloudWatch enabled
  if (process.env.NODE_ENV !== 'production' || process.env.VITE_ENABLE_CLOUDWATCH !== 'true') {
    if (process.env.NODE_ENV === 'development') {
      console.log('[CloudWatch Metric]', metric);
    }
    return;
  }

  try {
    // Send to backend API endpoint that forwards to CloudWatch
    const response = await fetch('/api/monitoring/cloudwatch/metrics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...metric,
        timestamp: metric.timestamp || Date.now(),
      }),
    });

    if (!response.ok) {
      throw new Error(`CloudWatch API error: ${response.status}`);
    }
  } catch (error) {
    console.error('[CloudWatch] Failed to send metric:', error);
  }
};

/**
 * Send log to CloudWatch Logs
 * Requirement 9.4: CloudWatch integration
 */
export const sendLogToCloudWatch = async (log: CloudWatchLogEvent): Promise<void> => {
  if (process.env.NODE_ENV !== 'production' || process.env.VITE_ENABLE_CLOUDWATCH !== 'true') {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[CloudWatch Log] [${log.level}]`, log.message, log.context);
    }
    return;
  }

  try {
    const response = await fetch('/api/monitoring/cloudwatch/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(log),
    });

    if (!response.ok) {
      throw new Error(`CloudWatch Logs API error: ${response.status}`);
    }
  } catch (error) {
    console.error('[CloudWatch] Failed to send log:', error);
  }
};

/**
 * Track API call metrics to CloudWatch
 */
export const trackApiMetric = async (
  apiName: string,
  duration: number,
  success: boolean
): Promise<void> => {
  await sendMetricToCloudWatch({
    namespace: 'InsightSphere/API',
    metricName: 'ApiCallDuration',
    value: duration,
    unit: 'Milliseconds',
    dimensions: {
      ApiName: apiName,
      Status: success ? 'Success' : 'Error',
    },
  });

  await sendMetricToCloudWatch({
    namespace: 'InsightSphere/API',
    metricName: 'ApiCallCount',
    value: 1,
    unit: 'Count',
    dimensions: {
      ApiName: apiName,
      Status: success ? 'Success' : 'Error',
    },
  });
};

/**
 * Track user action metrics
 */
export const trackUserAction = async (action: string, value?: number): Promise<void> => {
  await sendMetricToCloudWatch({
    namespace: 'InsightSphere/UserActions',
    metricName: action,
    value: value || 1,
    unit: value ? 'None' : 'Count',
    dimensions: {
      Environment: process.env.NODE_ENV || 'development',
    },
  });
};

/**
 * Track error metrics
 */
export const trackErrorMetric = async (errorType: string, errorMessage: string): Promise<void> => {
  await sendMetricToCloudWatch({
    namespace: 'InsightSphere/Errors',
    metricName: 'ErrorCount',
    value: 1,
    unit: 'Count',
    dimensions: {
      ErrorType: errorType,
      Environment: process.env.NODE_ENV || 'development',
    },
  });

  await sendLogToCloudWatch({
    message: errorMessage,
    level: 'ERROR',
    timestamp: Date.now(),
    context: {
      errorType,
    },
  });
};

/**
 * Track performance metrics
 */
export const trackPerformanceMetric = async (
  metricName: string,
  value: number,
  unit: CloudWatchMetric['unit'] = 'Milliseconds'
): Promise<void> => {
  await sendMetricToCloudWatch({
    namespace: 'InsightSphere/Performance',
    metricName,
    value,
    unit,
    dimensions: {
      Environment: process.env.NODE_ENV || 'development',
    },
  });
};

/**
 * Create custom CloudWatch dashboard configuration
 * Requirement 9.5: Create custom dashboards for key metrics
 */
export const getCloudWatchDashboardConfig = () => {
  return {
    dashboardName: 'InsightSphere-Monitoring',
    dashboardBody: JSON.stringify({
      widgets: [
        {
          type: 'metric',
          properties: {
            metrics: [
              ['InsightSphere/API', 'ApiCallDuration', { stat: 'Average' }],
              ['...', { stat: 'p99' }],
            ],
            period: 300,
            stat: 'Average',
            region: 'us-east-1',
            title: 'API Response Time',
            yAxis: {
              left: {
                label: 'Milliseconds',
              },
            },
          },
        },
        {
          type: 'metric',
          properties: {
            metrics: [['InsightSphere/API', 'ApiCallCount', { stat: 'Sum' }]],
            period: 300,
            stat: 'Sum',
            region: 'us-east-1',
            title: 'API Call Volume',
          },
        },
        {
          type: 'metric',
          properties: {
            metrics: [['InsightSphere/Errors', 'ErrorCount', { stat: 'Sum' }]],
            period: 300,
            stat: 'Sum',
            region: 'us-east-1',
            title: 'Error Count',
          },
        },
        {
          type: 'metric',
          properties: {
            metrics: [
              ['InsightSphere/Performance', 'LCP', { stat: 'Average' }],
              ['InsightSphere/Performance', 'FID', { stat: 'Average' }],
              ['InsightSphere/Performance', 'CLS', { stat: 'Average' }],
            ],
            period: 300,
            stat: 'Average',
            region: 'us-east-1',
            title: 'Web Vitals',
          },
        },
        {
          type: 'metric',
          properties: {
            metrics: [
              ['InsightSphere/UserActions', 'PageView', { stat: 'Sum' }],
              ['InsightSphere/UserActions', 'FeedbackSubmission', { stat: 'Sum' }],
              ['InsightSphere/UserActions', 'LogExport', { stat: 'Sum' }],
            ],
            period: 300,
            stat: 'Sum',
            region: 'us-east-1',
            title: 'User Actions',
          },
        },
      ],
    }),
  };
};
