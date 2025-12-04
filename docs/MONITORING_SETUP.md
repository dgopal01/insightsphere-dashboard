# Monitoring and Analytics Setup

This document describes the monitoring and analytics infrastructure for InsightSphere Dashboard.

## Overview

The monitoring system provides comprehensive observability through:
- **Error Tracking** (Sentry) - Requirement 9.3
- **Performance Monitoring** (Web Vitals) - Requirement 9.3
- **CloudWatch Integration** - Requirement 9.4
- **User Analytics** - Requirement 9.4
- **Custom Dashboards** - Requirement 9.5

## Components

### 1. Error Tracking (Sentry)

**Location**: `src/utils/errorTracking.ts`

**Features**:
- Automatic error capture and reporting
- Session replay for debugging
- Performance tracing
- User context tracking
- Breadcrumb tracking for debugging

**Configuration**:
```env
VITE_SENTRY_DSN=your-sentry-dsn
VITE_ENABLE_ERROR_TRACKING=true
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=your-token
```

**Usage**:
```typescript
import { captureError, captureMessage, addBreadcrumb } from './utils';

// Capture an error
try {
  // code
} catch (error) {
  captureError(error, {
    user: { id: userId },
    tags: { component: 'FeedbackForm' },
    extra: { formData }
  });
}

// Add breadcrumb
addBreadcrumb('User clicked submit', 'user-action', { buttonId: 'submit' });
```

### 2. Performance Monitoring (Web Vitals)

**Location**: `src/utils/performanceMonitoring.ts`

**Metrics Tracked**:
- **LCP** (Largest Contentful Paint) - Target: < 2.5s
- **FID** (First Input Delay) - Target: < 100ms
- **CLS** (Cumulative Layout Shift) - Target: < 0.1
- **FCP** (First Contentful Paint)
- **TTFB** (Time to First Byte)

**Features**:
- Automatic Web Vitals tracking
- Bundle size monitoring
- API call performance tracking
- Component render time measurement

**Usage**:
```typescript
import { measureApiCall, measureRenderTime } from './utils';

// Measure API call
const data = await measureApiCall('fetchChatLogs', () => 
  API.graphql({ query: listChatLogs })
);

// Measure render time
measureRenderTime('FeedbackForm', () => {
  // render logic
});
```

### 3. CloudWatch Integration

**Location**: `src/utils/cloudWatchMonitoring.ts`

**Features**:
- Custom metrics publishing
- Log aggregation
- API performance tracking
- Error rate monitoring
- User action tracking

**Configuration**:
```env
VITE_ENABLE_CLOUDWATCH=true
```

**Backend API Required**:
The frontend sends metrics to backend endpoints that forward to CloudWatch:
- `POST /api/monitoring/cloudwatch/metrics` - Send metrics
- `POST /api/monitoring/cloudwatch/logs` - Send logs

**Usage**:
```typescript
import { trackApiMetric, trackUserAction, trackErrorMetric } from './utils';

// Track API call
await trackApiMetric('listChatLogs', duration, success);

// Track user action
await trackUserAction('FeedbackSubmission', 1);

// Track error
await trackErrorMetric('ValidationError', 'Invalid rating value');
```

**Dashboard Configuration**:
The system provides a CloudWatch dashboard configuration with widgets for:
- API response times (average and p99)
- API call volume
- Error counts
- Web Vitals metrics
- User action counts

### 4. User Analytics

**Location**: `src/utils/analytics.ts`

**Features**:
- Page view tracking
- User action tracking
- Form submission tracking
- Button click tracking
- Session tracking
- Local storage for custom dashboards

**Configuration**:
```env
VITE_ENABLE_ANALYTICS=true
```

**Usage**:
```typescript
import { 
  trackPageView, 
  trackUserAction, 
  trackButtonClick,
  trackFormSubmit 
} from './utils';

// Track page view
trackPageView({
  path: '/dashboard',
  title: 'Dashboard',
  referrer: document.referrer
});

// Track button click
trackButtonClick('export-csv', { logCount: 100 });

// Track form submission
trackFormSubmit('feedback-form', true);

// Track custom action
trackUserAction({
  action: 'filter_applied',
  target: 'chat-logs',
  metadata: { filterType: 'date-range' }
});
```

### 5. Custom Monitoring Dashboard

**Location**: `src/components/MonitoringDashboard.tsx`

**Features**:
- Real-time Web Vitals display
- Analytics event summary
- Recent errors table
- Recent API calls table
- Session information
- Performance metrics visualization

**Access**:
Navigate to `/monitoring` (admin only) to view the dashboard.

**Data Storage**:
Metrics are stored in localStorage:
- `insightsphere_metrics_webvitals` - Web Vitals data
- `insightsphere_metrics_analytics` - Analytics events
- `insightsphere_analytics_events` - Detailed event log

## Integration with Existing Code

### Error Boundary Integration

The ErrorBoundary component automatically captures React errors:

```typescript
import { ErrorBoundary } from './components';

<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### Auth Context Integration

Set user context when user signs in:

```typescript
import { setUserContext, setAnalyticsUserId } from './utils';

// After successful sign in
setUserContext({
  id: user.username,
  email: user.attributes?.email,
  username: user.username
});

setAnalyticsUserId(user.username);
```

### API Service Integration

Track API calls automatically:

```typescript
import { measureApiCall, trackApiCall } from './utils';

const fetchData = async () => {
  const startTime = performance.now();
  try {
    const result = await measureApiCall('fetchChatLogs', () =>
      API.graphql({ query: listChatLogs })
    );
    const duration = performance.now() - startTime;
    await trackApiCall('fetchChatLogs', duration, true);
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    await trackApiCall('fetchChatLogs', duration, false);
    throw error;
  }
};
```

## Deployment Considerations

### Development Environment
- Error tracking: Disabled by default (console logging only)
- Performance monitoring: Enabled with verbose logging
- CloudWatch: Disabled
- Analytics: Enabled with local storage only

### Production Environment
- Error tracking: Enabled with Sentry DSN
- Performance monitoring: Enabled with sampling
- CloudWatch: Enabled with backend API
- Analytics: Enabled with external service integration

### Environment Variables

Required for production:
```env
# Sentry
VITE_SENTRY_DSN=https://...@sentry.io/...
VITE_ENABLE_ERROR_TRACKING=true
SENTRY_ORG=your-org
SENTRY_PROJECT=insightsphere
SENTRY_AUTH_TOKEN=your-token

# CloudWatch
VITE_ENABLE_CLOUDWATCH=true

# Analytics
VITE_ENABLE_ANALYTICS=true

# Version tracking
VITE_APP_VERSION=1.0.0
```

## Monitoring Best Practices

### 1. Error Tracking
- Always provide context when capturing errors
- Use appropriate severity levels
- Add breadcrumbs for complex user flows
- Filter sensitive information before sending

### 2. Performance Monitoring
- Monitor Web Vitals regularly
- Set up alerts for threshold violations
- Track API performance trends
- Optimize based on real user data

### 3. CloudWatch Integration
- Use consistent metric namespaces
- Add relevant dimensions for filtering
- Set up CloudWatch alarms for critical metrics
- Review logs regularly for patterns

### 4. Analytics
- Track meaningful user actions
- Respect user privacy
- Aggregate data for insights
- Use data to drive improvements

### 5. Custom Dashboards
- Review metrics regularly
- Set up automated reports
- Share insights with team
- Act on identified issues

## Troubleshooting

### Sentry Not Capturing Errors
1. Check `VITE_SENTRY_DSN` is set correctly
2. Verify `VITE_ENABLE_ERROR_TRACKING=true`
3. Check browser console for Sentry initialization logs
4. Verify network requests to Sentry are not blocked

### Web Vitals Not Recording
1. Check browser compatibility (modern browsers only)
2. Verify `initPerformanceMonitoring()` is called
3. Check console for Web Vitals logs in development
4. Ensure page has sufficient content for LCP

### CloudWatch Metrics Not Appearing
1. Verify backend API endpoints are implemented
2. Check `VITE_ENABLE_CLOUDWATCH=true`
3. Verify AWS credentials on backend
4. Check CloudWatch Logs for API errors

### Analytics Events Not Tracking
1. Check `VITE_ENABLE_ANALYTICS=true`
2. Verify `initAnalytics()` is called
3. Check localStorage for stored events
4. Verify network requests in production

## Maintenance

### Regular Tasks
- Review error rates weekly
- Monitor performance trends monthly
- Update Sentry release versions
- Clean up old CloudWatch logs
- Archive analytics data quarterly

### Alerts to Set Up
- Error rate > 1% of requests
- LCP > 2.5s for 5% of users
- API response time > 1s average
- Failed API calls > 5% of total

## Resources

- [Sentry Documentation](https://docs.sentry.io/)
- [Web Vitals](https://web.dev/vitals/)
- [CloudWatch Documentation](https://docs.aws.amazon.com/cloudwatch/)
- [Google Analytics](https://analytics.google.com/)

## Support

For issues or questions about monitoring:
1. Check this documentation
2. Review error logs in Sentry
3. Check CloudWatch dashboards
4. Contact DevOps team
