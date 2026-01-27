/**
 * Example usage of useChatLogs hook
 * This file demonstrates how to use the hook in a component
 */

import { useChatLogs } from './useChatLogs';

/**
 * Example component showing basic usage
 */
export function ChatLogsExample() {
  const { logs, isLoading, error, refetch, hasNextPage, fetchNextPage } = useChatLogs({
    filters: {
      userId: 'user123',
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2024-12-31T23:59:59Z',
    },
    limit: 50,
  });

  if (isLoading) {
    return <div>Loading chat logs...</div>;
  }

  if (error) {
    return (
      <div>
        <p>Error loading logs: {error.message}</p>
        <button onClick={refetch}>Retry</button>
      </div>
    );
  }

  if (logs.length === 0) {
    return <div>No chat logs found</div>;
  }

  return (
    <div>
      <h2>Chat Logs ({logs.length})</h2>
      <button onClick={refetch}>Refresh</button>

      <ul>
        {logs.map((log) => (
          <li key={log.id}>
            <strong>{log.userId}</strong> - {log.timestamp}
            <p>User: {log.userMessage}</p>
            <p>AI: {log.aiResponse}</p>
            <p>Response Time: {log.responseTime}ms</p>
          </li>
        ))}
      </ul>

      {hasNextPage && <button onClick={fetchNextPage}>Load More</button>}
    </div>
  );
}

/**
 * Example with conversation filtering
 */
export function ConversationLogsExample() {
  const { logs, isLoading, error } = useChatLogs({
    filters: {
      conversationId: 'conv-456',
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Conversation Logs</h2>
      {logs.map((log) => (
        <div key={log.id}>
          <p>{log.userMessage}</p>
          <p>{log.aiResponse}</p>
        </div>
      ))}
    </div>
  );
}

/**
 * Example with search text filtering
 */
export function SearchLogsExample() {
  const { logs, isLoading } = useChatLogs({
    filters: {
      searchText: 'error',
      sentiment: 'negative',
    },
  });

  if (isLoading) return <div>Searching...</div>;

  return (
    <div>
      <h2>Search Results ({logs.length})</h2>
      {logs.map((log) => (
        <div key={log.id}>
          <p>{log.userMessage}</p>
        </div>
      ))}
    </div>
  );
}
