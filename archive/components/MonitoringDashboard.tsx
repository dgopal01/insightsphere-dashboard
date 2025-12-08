/**
 * Monitoring Dashboard Component
 * Displays custom metrics and analytics
 * Requirement 9.5: Create custom dashboards for key metrics
 */

import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import {
  Speed as SpeedIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { getStoredMetrics } from '../utils/performanceMonitoring';
import { getStoredAnalyticsEvents, getAnalyticsSummary } from '../utils/analytics';
import type { WebVitalsMetric } from '../utils/performanceMonitoring';
import type { AnalyticsEvent } from '../utils/analytics';

/**
 * Monitoring Dashboard Component
 */
export const MonitoringDashboard = () => {
  const [webVitals, setWebVitals] = useState<WebVitalsMetric[]>([]);
  const [analyticsEvents, setAnalyticsEvents] = useState<AnalyticsEvent[]>([]);
  const [summary, setSummary] = useState<ReturnType<typeof getAnalyticsSummary> | null>(null);

  useEffect(() => {
    // Load metrics from local storage
    const vitals = getStoredMetrics('webvitals') as WebVitalsMetric[];
    const events = getStoredAnalyticsEvents();
    const analyticsSummary = getAnalyticsSummary();

    setWebVitals(vitals);
    setAnalyticsEvents(events);
    setSummary(analyticsSummary);
  }, []);

  const getLatestWebVital = (name: string) => {
    const vital = webVitals.filter((v) => v.name === name).pop();
    return vital;
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good':
        return 'success';
      case 'needs-improvement':
        return 'warning';
      case 'poor':
        return 'error';
      default:
        return 'default';
    }
  };

  const recentErrors = analyticsEvents
    .filter((e) => e.type === 'error')
    .slice(-10)
    .reverse();

  const recentApiCalls = analyticsEvents
    .filter((e) => e.type === 'api_call')
    .slice(-10)
    .reverse();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Monitoring Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Real-time performance metrics and analytics
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <SpeedIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Performance</Typography>
              </Box>
              <Typography variant="h4">{webVitals.length}</Typography>
              <Typography variant="body2" color="text.secondary">
                Web Vitals Recorded
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Events</Typography>
              </Box>
              <Typography variant="h4">{summary?.totalEvents || 0}</Typography>
              <Typography variant="body2" color="text.secondary">
                Total Analytics Events
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ErrorIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">Errors</Typography>
              </Box>
              <Typography variant="h4">{summary?.errors || 0}</Typography>
              <Typography variant="body2" color="text.secondary">
                Errors Tracked
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PeopleIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">User Actions</Typography>
              </Box>
              <Typography variant="h4">{summary?.userActions || 0}</Typography>
              <Typography variant="body2" color="text.secondary">
                User Interactions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Web Vitals */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Web Vitals
          </Typography>
          <Grid container spacing={2}>
            {['LCP', 'INP', 'CLS', 'FCP', 'TTFB'].map((vitalName) => {
              const vital = getLatestWebVital(vitalName);
              return (
                <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={vitalName}>
                  <Box
                    sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}
                  >
                    <Typography variant="subtitle2" color="text.secondary">
                      {vitalName}
                    </Typography>
                    {vital ? (
                      <>
                        <Typography variant="h5" sx={{ my: 1 }}>
                          {vital.value.toFixed(2)}
                        </Typography>
                        <Chip
                          label={vital.rating}
                          color={getRatingColor(vital.rating) as any}
                          size="small"
                        />
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ my: 1 }}>
                        No data
                      </Typography>
                    )}
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>

      {/* Recent Errors */}
      {recentErrors.length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Errors
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Time</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Message</TableCell>
                    <TableCell>User</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentErrors.map((error, index) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(error.timestamp).toLocaleTimeString()}</TableCell>
                      <TableCell>{error.action}</TableCell>
                      <TableCell>{error.label || 'N/A'}</TableCell>
                      <TableCell>{error.userId || 'Anonymous'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Recent API Calls */}
      {recentApiCalls.length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent API Calls
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Time</TableCell>
                    <TableCell>API</TableCell>
                    <TableCell>Duration (ms)</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentApiCalls.map((call, index) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(call.timestamp).toLocaleTimeString()}</TableCell>
                      <TableCell>{call.action}</TableCell>
                      <TableCell>{call.value?.toFixed(0) || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip
                          label={call.metadata?.success ? 'Success' : 'Error'}
                          color={call.metadata?.success ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Session Info */}
      {summary && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Session Information
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Session ID
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                  {summary.sessionId || 'N/A'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  User ID
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                  {summary.userId || 'Anonymous'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Page Views
                </Typography>
                <Typography variant="h6">{summary.pageViews}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  API Calls
                </Typography>
                <Typography variant="h6">{summary.apiCalls}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  User Actions
                </Typography>
                <Typography variant="h6">{summary.userActions}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default MonitoringDashboard;
