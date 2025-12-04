/**
 * Example usage of useMetrics hook
 * Demonstrates fetching and displaying performance metrics
 */

import React from 'react';
import { useMetrics } from './useMetrics';

/**
 * Example component showing basic metrics display
 */
export function MetricsExample() {
  const { accuracy, satisfaction, interactionCount, avgResponseTime, isLoading, error } =
    useMetrics({
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2024-12-31T23:59:59Z',
    });

  if (isLoading) {
    return <div>Loading metrics...</div>;
  }

  if (error) {
    return <div>Error loading metrics: {error.message}</div>;
  }

  return (
    <div>
      <h2>Performance Metrics</h2>
      <div>
        <p>Accuracy: {accuracy.toFixed(2)}%</p>
        <p>Satisfaction: {satisfaction.toFixed(2)}/5</p>
        <p>Total Interactions: {interactionCount}</p>
        <p>Avg Response Time: {avgResponseTime.toFixed(0)}ms</p>
      </div>
    </div>
  );
}

/**
 * Example component with date range filtering
 */
export function MetricsWithDateRangeExample() {
  const [startDate, setStartDate] = React.useState('2024-01-01T00:00:00Z');
  const [endDate, setEndDate] = React.useState('2024-12-31T23:59:59Z');

  const { accuracy, satisfaction, interactionCount, avgResponseTime, isLoading, refetch } =
    useMetrics({
      startDate,
      endDate,
    });

  return (
    <div>
      <h2>Performance Metrics with Date Range</h2>
      <div>
        <label>
          Start Date:
          <input
            type="datetime-local"
            value={startDate.slice(0, 16)}
            onChange={(e) => setStartDate(new Date(e.target.value).toISOString())}
          />
        </label>
        <label>
          End Date:
          <input
            type="datetime-local"
            value={endDate.slice(0, 16)}
            onChange={(e) => setEndDate(new Date(e.target.value).toISOString())}
          />
        </label>
        <button onClick={refetch}>Refresh</button>
      </div>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div>
          <p>Accuracy: {accuracy.toFixed(2)}%</p>
          <p>Satisfaction: {satisfaction.toFixed(2)}/5</p>
          <p>Total Interactions: {interactionCount}</p>
          <p>Avg Response Time: {avgResponseTime.toFixed(0)}ms</p>
        </div>
      )}
    </div>
  );
}

/**
 * Example component with user segmentation
 */
export function MetricsWithUserSegmentExample() {
  const [userId, setUserId] = React.useState<string>('');

  const { accuracy, satisfaction, interactionCount, avgResponseTime, isLoading } = useMetrics({
    userId: userId || undefined,
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-12-31T23:59:59Z',
  });

  return (
    <div>
      <h2>Performance Metrics by User</h2>
      <div>
        <label>
          User ID:
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter user ID to filter"
          />
        </label>
      </div>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div>
          <p>Accuracy: {accuracy.toFixed(2)}%</p>
          <p>Satisfaction: {satisfaction.toFixed(2)}/5</p>
          <p>Total Interactions: {interactionCount}</p>
          <p>Avg Response Time: {avgResponseTime.toFixed(0)}ms</p>
        </div>
      )}
    </div>
  );
}

/**
 * Example component with conversation type segmentation
 */
export function MetricsWithConversationTypeExample() {
  const [conversationId, setConversationId] = React.useState<string>('');

  const { accuracy, satisfaction, interactionCount, avgResponseTime, isLoading } = useMetrics({
    conversationId: conversationId || undefined,
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-12-31T23:59:59Z',
  });

  return (
    <div>
      <h2>Performance Metrics by Conversation</h2>
      <div>
        <label>
          Conversation ID:
          <input
            type="text"
            value={conversationId}
            onChange={(e) => setConversationId(e.target.value)}
            placeholder="Enter conversation ID to filter"
          />
        </label>
      </div>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div>
          <p>Accuracy: {accuracy.toFixed(2)}%</p>
          <p>Satisfaction: {satisfaction.toFixed(2)}/5</p>
          <p>Total Interactions: {interactionCount}</p>
          <p>Avg Response Time: {avgResponseTime.toFixed(0)}ms</p>
        </div>
      )}
    </div>
  );
}
