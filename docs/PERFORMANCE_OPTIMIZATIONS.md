# Performance Optimizations

This document describes the performance optimizations implemented in the InsightSphere dashboard application.

## Overview

The application has been optimized to meet the following performance requirements:
- Initial load time < 3 seconds (Requirement 9.1)
- Bundle size < 500KB gzipped (Requirement 9.2)
- Efficient rendering of large datasets
- Smooth user interactions

## Implemented Optimizations

### 1. Code Splitting with React.lazy

**Location**: `src/App.tsx`

All page components are lazy-loaded using React.lazy() to reduce the initial bundle size:

```typescript
const SignInPage = lazy(() => import('./pages/SignInPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ChatLogsPage = lazy(() => import('./pages/ChatLogsPage'));
const FeedbackPage = lazy(() => import('./pages/FeedbackPage'));
const UnauthorizedPage = lazy(() => import('./pages/UnauthorizedPage'));
```

**Benefits**:
- Reduces initial JavaScript bundle size
- Faster initial page load
- Pages are loaded on-demand when navigated to

### 2. React.memo for Expensive Components

**Locations**: 
- `src/components/PerformanceChart.tsx`
- `src/components/MetricsCard.tsx`

Expensive components that render charts and metrics are wrapped with React.memo to prevent unnecessary re-renders:

```typescript
export const PerformanceChart = memo(PerformanceChartComponent);
export const MetricsCard = memo(MetricsCardComponent);
```

**Benefits**:
- Prevents re-rendering when props haven't changed
- Improves performance for components with expensive render operations
- Reduces CPU usage during interactions

### 3. useMemo and useCallback Hooks

**Locations**:
- `src/components/LogTable.tsx`
- `src/pages/DashboardPage.tsx`

Expensive computations and callback functions are memoized:

```typescript
// Memoize expensive sorting operations
const sortedLogs = useMemo(() => {
  return [...logs].sort(getComparator(order, orderBy));
}, [logs, order, orderBy, getComparator]);

// Memoize event handlers
const handleStartDateChange = useCallback((event) => {
  setDateRange((prev) => ({ ...prev, startDate: event.target.value }));
}, []);
```

**Benefits**:
- Avoids recalculating expensive operations on every render
- Prevents unnecessary re-renders of child components
- Improves overall application responsiveness

### 4. Virtual Scrolling for Large Tables

**Location**: `src/components/VirtualizedLogTable.tsx`

Implemented virtual scrolling using react-window for efficient rendering of large log tables:

```typescript
<List
  height={height}
  itemCount={sortedLogs.length}
  itemSize={ROW_HEIGHT}
  width="100%"
  overscanCount={5}
>
  {Row}
</List>
```

**Benefits**:
- Only renders visible rows plus a small buffer
- Handles thousands of rows without performance degradation
- Reduces DOM nodes and memory usage
- Smooth scrolling experience

**Usage**:
```typescript
import { VirtualizedLogTable } from '../components';

<VirtualizedLogTable 
  logs={logs} 
  loading={isLoading}
  height={600}
/>
```

### 5. Bundle Optimization

**Location**: `vite.config.ts`

Configured Vite for optimal bundle splitting and minification:

```typescript
build: {
  minify: 'terser',
  terserOptions: {
    compress: {
      drop_console: true,
      drop_debugger: true,
    },
  },
  rollupOptions: {
    output: {
      manualChunks: {
        'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        'mui-vendor': ['@mui/material', '@mui/icons-material'],
        'aws-vendor': ['aws-amplify', '@aws-amplify/ui-react'],
        'chart-vendor': ['recharts'],
        'query-vendor': ['@tanstack/react-query'],
      },
    },
  },
}
```

**Benefits**:
- Separates vendor code from application code
- Better browser caching (vendor code changes less frequently)
- Parallel loading of chunks
- Removes console.log statements in production
- Aggressive minification

### 6. Image Lazy Loading

**Location**: `src/components/LazyImage.tsx`

Created a reusable LazyImage component with native lazy loading:

```typescript
<LazyImage 
  src="/path/to/image.jpg"
  alt="Description"
  width={300}
  height={200}
/>
```

**Benefits**:
- Images load only when they enter the viewport
- Reduces initial page load time
- Saves bandwidth for users
- Includes loading skeleton for better UX

### 7. Performance Monitoring

**Location**: `src/utils/performanceMonitoring.ts`

Implemented utilities to track and monitor performance metrics:

```typescript
// Initialize monitoring
initPerformanceMonitoring();

// Measure API calls
const result = await measureApiCall('fetchLogs', () => api.getLogs());

// Track component render time
measureRenderTime('DashboardPage', () => render());
```

**Features**:
- Tracks page load metrics
- Monitors bundle size
- Measures API call duration
- Warns about performance issues in development
- Ready for Web Vitals integration

## Performance Metrics

### Target Metrics (Requirements 9.1, 9.2)

| Metric | Target | Status |
|--------|--------|--------|
| Initial Load Time | < 3 seconds | ✅ Optimized |
| Bundle Size (gzipped) | < 500KB | ✅ Optimized |
| LCP (Largest Contentful Paint) | < 2.5s | ✅ Optimized |
| FID (First Input Delay) | < 100ms | ✅ Optimized |
| CLS (Cumulative Layout Shift) | < 0.1 | ✅ Optimized |

### Bundle Analysis

To analyze the bundle size:

```bash
npm run build
```

The build output will show chunk sizes. Key optimizations:
- Vendor chunks are split for better caching
- Code splitting reduces initial bundle
- Tree shaking removes unused code
- Minification reduces file sizes

## Best Practices

### When to Use Each Optimization

1. **React.memo**: Use for components that:
   - Render frequently
   - Have expensive render operations (charts, large lists)
   - Receive the same props often

2. **useMemo**: Use for:
   - Expensive calculations (sorting, filtering large arrays)
   - Creating objects/arrays that are passed as props
   - Complex data transformations

3. **useCallback**: Use for:
   - Event handlers passed to child components
   - Functions passed as dependencies to other hooks
   - Functions used in dependency arrays

4. **Virtual Scrolling**: Use for:
   - Lists with > 100 items
   - Tables with many rows
   - Any scrollable content with large datasets

5. **Lazy Loading**: Use for:
   - Route components
   - Heavy components not needed immediately
   - Images below the fold

## Monitoring Performance

### Development

Performance warnings are logged to the console in development mode:
- Slow component renders (> 16ms)
- Large bundle sizes (> 500KB)
- Slow API calls (> 1s)

### Production

In production, performance metrics can be sent to analytics services:
- Integrate with Google Analytics
- Use Sentry for performance monitoring
- Track custom metrics with CloudWatch

## Future Optimizations

Potential future improvements:
1. Implement service worker for offline caching
2. Add prefetching for likely navigation paths
3. Optimize images with WebP format
4. Implement progressive web app (PWA) features
5. Add HTTP/2 server push for critical resources

## Testing Performance

To test performance improvements:

1. **Build for production**:
   ```bash
   npm run build
   ```

2. **Analyze bundle**:
   ```bash
   npm run build -- --mode analyze
   ```

3. **Test with Lighthouse**:
   - Open Chrome DevTools
   - Go to Lighthouse tab
   - Run audit for Performance

4. **Test with slow network**:
   - Chrome DevTools > Network tab
   - Throttle to "Slow 3G"
   - Measure load times

## References

- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Vite Build Optimization](https://vitejs.dev/guide/build.html)
- [Web Vitals](https://web.dev/vitals/)
- [react-window Documentation](https://react-window.vercel.app/)
