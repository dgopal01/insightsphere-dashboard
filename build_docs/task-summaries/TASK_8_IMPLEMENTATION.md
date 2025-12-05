# Task 8 Implementation: Chat Logs Data Fetching

## Overview

Implemented the `useChatLogs` hook that provides comprehensive chat logs data fetching with React Query, including pagination, filtering, and real-time subscriptions.

## Implementation Details

### File Created

- `src/hooks/useChatLogs.ts` - Main hook implementation
- `src/hooks/useChatLogs.example.tsx` - Example usage demonstrations

### Features Implemented

#### 1. React Query Integration

The hook uses React Query for efficient data fetching and caching:

```typescript
const { logs, isLoading, error, refetch, hasNextPage, fetchNextPage } = useChatLogs({
  filters: {
    userId: 'user123',
    conversationId: 'conv-456',
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-12-31T23:59:59Z',
    sentiment: 'positive',
    searchText: 'error',
  },
  limit: 50,
  enabled: true,
});
```

#### 2. GraphQL Query with Pagination

The hook automatically selects the most efficient GraphQL query based on filters:

- **listChatLogs**: Default query for general listing
- **chatLogsByConversation**: Uses GSI when conversationId filter is provided
- **chatLogsByUser**: Uses GSI when userId filter is provided

Pagination is handled through:
- `nextToken` tracking for cursor-based pagination
- `hasNextPage` boolean to indicate more data availability
- `fetchNextPage()` function to load additional pages
- Accumulated logs across pages

#### 3. Filtering Support

**Server-side filters** (DynamoDB):
- `userId` - Exact match using GSI
- `conversationId` - Exact match using GSI
- `sentiment` - Exact match
- `startDate` / `endDate` - Date range filtering

**Client-side filters**:
- `searchText` - Full-text search across userMessage, aiResponse, conversationId, and userId

#### 4. Real-time Subscriptions

The hook automatically subscribes to new chat logs via GraphQL subscriptions:

```typescript
// Subscription is set up automatically
// New logs are prepended to the list if they match current filters
// Query cache is invalidated to maintain consistency
```

Features:
- Automatic subscription setup when hook is enabled
- Filter matching for incoming logs
- Prepends new logs to the beginning of the list
- Invalidates React Query cache for consistency
- Proper cleanup on unmount

#### 5. State Management

The hook provides comprehensive state information:

```typescript
interface UseChatLogsReturn {
  logs: ChatLog[];              // Filtered and accumulated logs
  isLoading: boolean;           // Loading state
  error: Error | null;          // Error state
  refetch: () => void;          // Refetch from beginning
  hasNextPage: boolean;         // More pages available
  fetchNextPage: () => void;    // Load next page
  isFetchingNextPage: boolean;  // Loading next page state
}
```

#### 6. Error Handling

- Network errors are caught and exposed via the `error` property
- Subscription errors are logged to console
- Retry logic is handled by APIService (exponential backoff)
- React Query provides automatic retry for failed queries

#### 7. Empty State Handling

- Returns empty array when no logs match filters
- Components can check `logs.length === 0` for empty state
- Loading state is separate from empty state

## Usage Examples

### Basic Usage

```typescript
function ChatLogsPage() {
  const { logs, isLoading, error } = useChatLogs();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (logs.length === 0) return <div>No logs found</div>;

  return (
    <div>
      {logs.map(log => (
        <div key={log.id}>{log.userMessage}</div>
      ))}
    </div>
  );
}
```

### With Filters

```typescript
function FilteredLogs() {
  const { logs, isLoading } = useChatLogs({
    filters: {
      userId: 'user123',
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2024-12-31T23:59:59Z',
    },
  });

  return <LogTable logs={logs} loading={isLoading} />;
}
```

### With Pagination

```typescript
function PaginatedLogs() {
  const { logs, hasNextPage, fetchNextPage, isFetchingNextPage } = useChatLogs({
    limit: 50,
  });

  return (
    <div>
      <LogList logs={logs} />
      {hasNextPage && (
        <button onClick={fetchNextPage} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
}
```

### With Search

```typescript
function SearchableLogs() {
  const [searchText, setSearchText] = useState('');
  
  const { logs, isLoading } = useChatLogs({
    filters: { searchText },
  });

  return (
    <div>
      <input
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        placeholder="Search logs..."
      />
      <LogTable logs={logs} loading={isLoading} />
    </div>
  );
}
```

## Technical Decisions

### Why Separate GSI Queries?

Using specific GSI queries (`chatLogsByConversation`, `chatLogsByUser`) instead of always using `listChatLogs` provides:
- Better performance through optimized DynamoDB indexes
- Lower costs by scanning less data
- Faster query response times

### Why Client-Side Search?

DynamoDB doesn't support full-text search natively. Options considered:
1. **Client-side filtering** (chosen) - Simple, works for moderate data sizes
2. **ElasticSearch** - Overkill for MVP, adds complexity
3. **DynamoDB Scan** - Expensive and slow

For production with large datasets, consider adding ElasticSearch or similar.

### Why Accumulate Logs?

Logs are accumulated across pagination calls to provide a seamless infinite scroll experience. This approach:
- Simplifies component logic
- Provides better UX
- Resets when filters change

### Why Prepend New Logs?

New logs from subscriptions are prepended (added to beginning) because:
- Most recent logs are typically most relevant
- Matches chronological ordering (newest first)
- Prevents pagination issues

## Requirements Validation

✅ **Requirement 1.1**: View chat logs - Hook fetches and returns logs
✅ **Requirement 1.5**: Real-time updates - Subscription automatically updates logs
✅ **Requirement 7.1**: Read from DynamoDB - Uses GraphQL queries to DynamoDB
✅ **Requirement 7.2**: Query by conversationId - Uses GSI for efficient queries
✅ **Requirement 7.3**: Query by userId - Uses GSI for efficient queries
✅ **Requirement 7.4**: Pagination support - Implements cursor-based pagination
✅ **Requirement 11.1**: Real-time sync - WebSocket subscription for live updates

## Testing Considerations

The hook should be tested for:
1. Fetching logs without filters
2. Fetching logs with various filter combinations
3. Pagination (loading multiple pages)
4. Real-time subscription updates
5. Error handling
6. Empty state handling
7. Filter changes (should reset pagination)

## Next Steps

This hook is now ready to be used in:
- Task 9: LogTable component
- Task 10: LogFilters component
- Task 11: CSV export functionality

## Dependencies

- `@tanstack/react-query` - State management
- `aws-amplify/api` - GraphQL client
- `src/services/APIService` - API abstraction layer
- `src/graphql/queries` - GraphQL query definitions
- `src/graphql/subscriptions` - GraphQL subscription definitions
- `src/types/graphql` - TypeScript type definitions
