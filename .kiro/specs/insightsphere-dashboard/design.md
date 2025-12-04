# Design Document

## Overview

InsightSphere is a React-based web application that provides comprehensive AI performance monitoring and feedback collection capabilities. The system reads existing chat logs from a pre-populated DynamoDB table and provides analytics, review, and feedback collection features. The system leverages AWS Amplify for backend infrastructure, including authentication (Cognito), data access (DynamoDB), file storage (S3), and real-time updates (AppSync). The frontend uses Material-UI for components, Recharts for data visualization, and React Query for state management.

The architecture follows a serverless model with clear separation between presentation, business logic, and data layers. Chat logs are read-only from the existing DynamoDB table, while feedback data is written to a separate table managed by InsightSphere. Real-time updates are achieved through GraphQL subscriptions, and the system is designed for scalability and high availability.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Dashboard   │  │  Chat Logs   │  │   Feedback   │      │
│  │    Page      │  │     Page     │  │     Page     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                   ┌────────▼────────┐                        │
│                   │  React Query    │                        │
│                   │  State Manager  │                        │
│                   └────────┬────────┘                        │
└────────────────────────────┼──────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  AWS Amplify    │
                    │   Client SDK    │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────┐  ┌────────▼────────┐  ┌───────▼────────┐
│  AWS Cognito   │  │  AWS AppSync    │  │   Amazon S3    │
│ Authentication │  │  GraphQL API    │  │  File Storage  │
└────────────────┘  └────────┬────────┘  └────────────────┘
                             │
                    ┌────────▼────────┐
                    │  Amazon         │
                    │  DynamoDB       │
                    └─────────────────┘
```

### Component Architecture

The frontend follows a layered architecture:

1. **Presentation Layer**: React components organized by feature (dashboard, logs, feedback)
2. **State Management Layer**: React Query for server state, React Context for UI state
3. **Service Layer**: API clients and business logic abstraction
4. **Integration Layer**: AWS Amplify SDK for backend communication

### Data Flow

**Reading Chat Logs:**
1. User interacts with React components
2. Components trigger queries through custom hooks
3. Hooks use React Query to manage API calls
4. Amplify SDK communicates with AWS AppSync GraphQL API
5. AppSync reads data from the existing ChatLogs DynamoDB table
6. Real-time updates for new logs flow back through GraphQL subscriptions
7. React Query updates component state automatically

**Writing Feedback:**
1. User submits feedback through FeedbackForm component
2. Component calls submitFeedback mutation through custom hook
3. Amplify SDK sends mutation to AWS AppSync
4. AppSync writes feedback to the Feedback DynamoDB table
5. Subscription notifies all connected clients of new feedback
6. Dashboard metrics update automatically

## Components and Interfaces

### Core Components

#### Dashboard Components

**MetricsCard**
- Props: `{ title: string, value: number | string, trend?: number, icon: ReactNode }`
- Displays individual performance metrics with optional trend indicators
- Supports loading and error states

**PerformanceChart**
- Props: `{ data: ChartDataPoint[], type: 'line' | 'bar' | 'area', title: string }`
- Renders interactive charts using Recharts library
- Supports zoom, hover tooltips, and responsive sizing

**TrendAnalysis**
- Props: `{ metrics: MetricData[], timeRange: DateRange }`
- Displays comparative trend analysis across multiple metrics
- Calculates percentage changes and highlights significant variations

#### Chat Logs Components

**LogTable**
- Props: `{ logs: ChatLog[], loading: boolean, onSort: (column: string) => void }`
- Renders paginated table with sortable columns
- Supports row selection and bulk operations

**LogFilters**
- Props: `{ filters: LogFilters, onFilterChange: (filters: LogFilters) => void }`
- Provides search inputs for timestamp, user ID, conversation ID, and content
- Includes date range picker and dropdown filters

**LogExport**
- Props: `{ logs: ChatLog[], filename?: string }`
- Triggers CSV generation and S3 upload
- Displays progress indicator and download link

#### Feedback Components

**FeedbackForm**
- Props: `{ logId: string, onSubmit: (feedback: FeedbackInput) => void }`
- Collects thumbs up/down, star ratings, and text comments
- Validates input before submission

**FeedbackList**
- Props: `{ feedback: Feedback[], groupBy?: 'date' | 'rating' | 'user' }`
- Displays feedback entries with filtering and grouping options
- Supports pagination and infinite scroll

**FeedbackMetrics**
- Props: `{ feedback: Feedback[], timeRange: DateRange }`
- Calculates and displays aggregated feedback statistics
- Shows positive/negative ratios and average ratings

### Custom Hooks

**useAuth**
```typescript
interface UseAuthReturn {
  user: CognitoUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  hasRole: (role: 'admin' | 'viewer') => boolean;
}
```

**useChatLogs**
```typescript
interface UseChatLogsReturn {
  logs: ChatLog[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  hasNextPage: boolean;
  fetchNextPage: () => void;
}
```

**useFeedback**
```typescript
interface UseFeedbackReturn {
  feedback: Feedback[];
  isLoading: boolean;
  error: Error | null;
  submitFeedback: (input: FeedbackInput) => Promise<void>;
  metrics: FeedbackMetrics;
}
```

**useMetrics**
```typescript
interface UseMetricsReturn {
  accuracy: number;
  satisfaction: number;
  interactionCount: number;
  avgResponseTime: number;
  isLoading: boolean;
  refetch: () => void;
}
```

### Service Layer Interfaces

**API Service**
```typescript
interface APIService {
  query<T>(query: string, variables?: Record<string, any>): Promise<T>;
  mutate<T>(mutation: string, variables: Record<string, any>): Promise<T>;
  subscribe<T>(subscription: string, callback: (data: T) => void): () => void;
}
```

**Storage Service**
```typescript
interface StorageService {
  uploadFile(key: string, file: Blob): Promise<string>;
  downloadFile(key: string): Promise<Blob>;
  getSignedUrl(key: string): Promise<string>;
}
```

**Auth Service**
```typescript
interface AuthService {
  getCurrentUser(): Promise<CognitoUser | null>;
  signIn(username: string, password: string): Promise<CognitoUser>;
  signOut(): Promise<void>;
  refreshToken(): Promise<string>;
}
```

## Data Models

### TypeScript Interfaces

**ChatLog**
```typescript
interface ChatLog {
  id: string;
  conversationId: string;
  userId: string;
  timestamp: string; // ISO 8601 format
  userMessage: string;
  aiResponse: string;
  responseTime: number; // milliseconds
  accuracy?: number; // 0-100
  sentiment?: 'positive' | 'negative' | 'neutral';
}
```

**Feedback**
```typescript
interface Feedback {
  id: string;
  logId: string;
  userId: string;
  rating: number; // 1-5
  thumbsUp: boolean;
  comment?: string;
  timestamp: string; // ISO 8601 format
  category?: 'accuracy' | 'helpfulness' | 'speed';
}
```

**MetricData**
```typescript
interface MetricData {
  timestamp: string;
  accuracy: number;
  satisfaction: number;
  interactionCount: number;
  avgResponseTime: number;
}
```

**LogFilters**
```typescript
interface LogFilters {
  startDate?: string;
  endDate?: string;
  userId?: string;
  conversationId?: string;
  searchText?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}
```

**FeedbackInput**
```typescript
interface FeedbackInput {
  logId: string;
  rating: number;
  thumbsUp: boolean;
  comment?: string;
  category?: 'accuracy' | 'helpfulness' | 'speed';
}
```

### DynamoDB Table Design

**ChatLogs Table (Existing - Read Only)**
- Primary Key: `id` (String)
- GSI 1: `conversationId-timestamp-index` for querying by conversation
- GSI 2: `userId-timestamp-index` for querying by user
- Attributes: All fields from ChatLog interface
- Access Pattern: Read-only queries and subscriptions
- Note: This table is pre-populated by the AI chatbot system

**Feedback Table (Managed by InsightSphere)**
- Primary Key: `id` (String)
- GSI 1: `logId-timestamp-index` for querying feedback by log
- GSI 2: `userId-timestamp-index` for querying feedback by user
- Attributes: All fields from Feedback interface
- Provisioned capacity: On-demand billing mode
- Access Pattern: Read and write operations

### GraphQL Schema Relationships

- ChatLog has many Feedback entries (one-to-many)
- Feedback belongs to one ChatLog (many-to-one)
- ChatLog model is read-only with authentication through `@auth(rules: [{allow: private, operations: [read]}])`
- Feedback model allows read and write with authentication through `@auth(rules: [{allow: private}])`
- Indexes enable efficient queries for common access patterns

### Data Access Patterns

**Chat Logs (Read-Only):**
- List all logs with pagination
- Query logs by conversationId
- Query logs by userId
- Filter logs by date range
- Search logs by message content
- Subscribe to new log entries

**Feedback (Read-Write):**
- Create new feedback entries
- List feedback by logId
- List feedback by userId
- Query aggregated feedback metrics
- Subscribe to new feedback entries


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Filter matching consistency
*For any* set of chat logs and any filter criteria, all returned logs should match the specified filter conditions (user ID, conversation ID, date range, search text, sentiment).
**Validates: Requirements 1.2**

### Property 2: Sort order correctness
*For any* set of chat logs and any sortable column, the sorted results should be in correct ascending or descending order based on the column values.
**Validates: Requirements 1.3**

### Property 3: CSV export completeness
*For any* set of filtered chat logs, the generated CSV file should contain exactly the same log entries with all columns present.
**Validates: Requirements 2.1, 2.4**

### Property 4: Feedback persistence
*For any* valid feedback submission (rating 1-5, thumbs up/down, optional comment), the stored feedback in DynamoDB should contain all submitted fields with correct timestamp and user ID.
**Validates: Requirements 3.2**

### Property 5: Rating validation
*For any* rating value from 1 to 5, the system should accept the rating; for any value outside this range, the system should reject it.
**Validates: Requirements 3.3**

### Property 6: Comment length validation
*For any* text comment with length ≤ 1000 characters, the system should accept it; for any comment with length > 1000 characters, the system should reject it.
**Validates: Requirements 3.4**

### Property 7: Feedback ratio calculation
*For any* set of feedback entries, the calculated positive/negative ratio should equal (count of thumbsUp=true) / (count of thumbsUp=false).
**Validates: Requirements 4.1**

### Property 8: Time period filtering
*For any* set of feedback entries and any date range, only feedback with timestamps within the specified range should be included in calculations.
**Validates: Requirements 4.2**

### Property 9: Average rating calculation
*For any* set of feedback entries with ratings, the computed average should equal the sum of all ratings divided by the count of ratings.
**Validates: Requirements 4.4**

### Property 10: Date range metric filtering
*For any* set of performance data and any date range filter, the displayed metrics should be calculated using only data points within the specified date range.
**Validates: Requirements 4.5, 5.4**

### Property 11: Conversation type segmentation
*For any* set of logs and any conversation type filter, all returned logs should have the specified conversation type.
**Validates: Requirements 5.5**

### Property 12: Feedback schema completeness
*For any* submitted feedback, the stored entry should contain all required fields: id, logId, userId, rating, thumbsUp, and timestamp.
**Validates: Requirements 8.1**

### Property 13: Feedback-log referential integrity
*For any* feedback entry, the logId field should reference an existing chat log entry.
**Validates: Requirements 8.3**

### Property 14: Client-side input validation
*For any* form submission, all input fields should be validated before the API request is sent.
**Validates: Requirements 12.1**

### Property 15: XSS sanitization
*For any* user-generated text content, all potentially malicious HTML/JavaScript should be sanitized before display.
**Validates: Requirements 12.3**

### Property 16: Theme persistence round-trip
*For any* theme selection (light or dark), saving the preference and reloading the application should restore the same theme.
**Validates: Requirements 13.2, 13.3**

### Property 17: Date range filter correctness
*For any* dataset and any date range (start date, end date), all returned data should have timestamps >= start date AND <= end date.
**Validates: Requirements 14.1**

### Property 18: User segment filter correctness
*For any* dataset and any user segment filter, all returned data should belong to the specified user segment.
**Validates: Requirements 14.2**

### Property 19: Conversation type filter correctness
*For any* dataset and any conversation type filter, all returned data should have the specified conversation type.
**Validates: Requirements 14.3**

### Property 20: Multiple filter AND logic
*For any* dataset and any combination of filters (date range, user segment, conversation type), all returned data should satisfy ALL applied filters simultaneously.
**Validates: Requirements 14.4**

## Error Handling

### Error Categories

**Network Errors**
- Connection failures to AWS services
- Timeout errors for API requests
- WebSocket disconnection

**Authentication Errors**
- Invalid credentials
- Expired tokens
- Insufficient permissions

**Validation Errors**
- Invalid input formats
- Out-of-range values
- Missing required fields

**Data Errors**
- Missing chat logs
- Corrupted data
- Referential integrity violations

### Error Handling Strategy

**User-Facing Errors**
- Display clear, actionable error messages
- Provide suggestions for resolution
- Maintain application state (no data loss)
- Log errors for debugging

**Network Resilience**
- Automatic retry with exponential backoff (max 3 attempts)
- Graceful degradation when services unavailable
- Offline mode with cached data where possible
- Clear indication of connection status

**Validation Errors**
- Inline validation with immediate feedback
- Highlight invalid fields with specific error messages
- Prevent form submission until all fields valid
- Preserve user input during validation

**Error Boundaries**
- React Error Boundaries to catch component errors
- Fallback UI with error details and recovery options
- Error reporting to monitoring service
- Prevent entire application crash

### Error Recovery

**Automatic Recovery**
- Token refresh on expiration
- WebSocket reconnection on disconnect
- Retry failed API requests
- Sync missed updates after reconnection

**Manual Recovery**
- Reload button for failed data fetches
- Clear cache option for corrupted data
- Logout/login for authentication issues
- Contact support for unrecoverable errors

## Testing Strategy

### Unit Testing

**Framework**: Jest with React Testing Library

**Coverage Requirements**:
- Minimum 80% code coverage
- 100% coverage for utility functions and business logic
- Focus on component behavior, not implementation details

**Unit Test Focus Areas**:
- Component rendering with various props
- User interaction handlers (clicks, form submissions)
- Data transformation functions
- Validation logic
- Error handling paths
- Edge cases (empty data, null values, boundary conditions)

**Example Unit Tests**:
- FeedbackForm validates rating range (1-5)
- LogFilters applies multiple filters correctly
- MetricsCard displays loading state
- CSV export handles empty log list
- Theme toggle updates local storage

### Property-Based Testing

**Framework**: fast-check (JavaScript property-based testing library)

**Configuration**:
- Minimum 100 iterations per property test
- Use seed for reproducible failures
- Generate realistic test data matching domain constraints

**Property Test Requirements**:
- Each correctness property from the design document MUST be implemented as a property-based test
- Each test MUST be tagged with a comment: `**Feature: insightsphere-dashboard, Property {number}: {property_text}**`
- Tests should use smart generators that constrain inputs to valid domain ranges

**Property Test Focus Areas**:
- Filter operations return only matching data
- Sort operations maintain correct order
- Calculations (averages, ratios) are mathematically correct
- Data transformations preserve information
- Validation accepts valid inputs and rejects invalid ones
- Round-trip operations (save/load theme, export/import data)

**Example Property Tests**:
- For any filter criteria, all returned logs match the filter
- For any set of ratings, average calculation is correct
- For any theme selection, save then load returns same theme
- For any valid feedback, all fields are persisted correctly

### Integration Testing

**Framework**: Cypress for end-to-end testing

**Integration Test Focus**:
- Authentication flow (login, token refresh, logout)
- Data fetching from DynamoDB through GraphQL
- Real-time updates via WebSocket subscriptions
- CSV export and S3 upload
- Multi-component workflows (view log → submit feedback → see updated metrics)

**Mock Strategy**:
- Mock AWS services in development/test environments
- Use AWS Amplify mock backend for local testing
- Avoid mocking in property tests - test real logic

### Accessibility Testing

**Tools**: jest-axe, eslint-plugin-jsx-a11y

**Accessibility Requirements**:
- All interactive elements keyboard accessible
- Proper ARIA labels and roles
- Focus management for modals and dynamic content
- Screen reader compatibility
- Color contrast compliance (WCAG 2.1 AA)

### Performance Testing

**Tools**: Lighthouse CI, Web Vitals

**Performance Metrics**:
- Initial load time < 3 seconds
- Bundle size < 500KB gzipped
- LCP < 2.5s, FID < 100ms, CLS < 0.1
- API response time < 1 second for typical queries

## Implementation Notes

### Technology Stack Decisions

**React Query for State Management**
- Automatic caching and background refetching
- Built-in loading and error states
- Optimistic updates for better UX
- Subscription support for real-time data

**Material-UI for Components**
- Comprehensive component library
- Built-in accessibility features
- Theming support for light/dark modes
- Responsive design out of the box

**Recharts for Visualizations**
- React-native chart library
- Declarative API matching React patterns
- Interactive features (tooltips, zoom)
- Responsive and customizable

**TypeScript for Type Safety**
- Catch errors at compile time
- Better IDE support and autocomplete
- Self-documenting code through types
- Easier refactoring

### AWS Amplify Configuration

**Authentication Setup**
```typescript
// Configure Cognito user pool
Auth.configure({
  region: 'us-east-1',
  userPoolId: process.env.REACT_APP_USER_POOL_ID,
  userPoolWebClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID,
});
```

**GraphQL API Setup**
```typescript
// Configure AppSync endpoint
API.configure({
  aws_appsync_graphqlEndpoint: process.env.REACT_APP_GRAPHQL_ENDPOINT,
  aws_appsync_region: 'us-east-1',
  aws_appsync_authenticationType: 'AMAZON_COGNITO_USER_POOLS',
});
```

**Storage Setup**
```typescript
// Configure S3 bucket for exports
Storage.configure({
  bucket: process.env.REACT_APP_S3_BUCKET,
  region: 'us-east-1',
  level: 'private', // User-specific storage
});
```

### GraphQL Schema

```graphql
type ChatLog @model @auth(rules: [{allow: private, operations: [read]}]) {
  id: ID!
  conversationId: String! @index(name: "byConversation")
  userId: String! @index(name: "byUser")
  timestamp: AWSDateTime!
  userMessage: String!
  aiResponse: String!
  responseTime: Int!
  accuracy: Float
  sentiment: String
  feedback: [Feedback] @hasMany(indexName: "byLogId", fields: ["id"])
}

type Feedback @model @auth(rules: [{allow: private}]) {
  id: ID!
  logId: ID! @index(name: "byLogId")
  userId: String! @index(name: "byUser")
  rating: Int!
  thumbsUp: Boolean!
  comment: String
  timestamp: AWSDateTime!
  category: String
  chatLog: ChatLog @belongsTo(fields: ["logId"])
}

type Query {
  getMetrics(startDate: AWSDateTime!, endDate: AWSDateTime!): MetricsResult
  getFeedbackStats(startDate: AWSDateTime!, endDate: AWSDateTime!): FeedbackStats
}

type MetricsResult {
  accuracy: Float
  satisfaction: Float
  interactionCount: Int
  avgResponseTime: Float
}

type FeedbackStats {
  positiveCount: Int
  negativeCount: Int
  averageRating: Float
  totalCount: Int
}
```

### Security Considerations

**Input Sanitization**
- Use DOMPurify for all user-generated content
- Validate all inputs on client and server
- Escape special characters in search queries

**Authentication**
- JWT tokens with short expiration (1 hour)
- Automatic token refresh before expiration
- Secure token storage (httpOnly cookies or memory)
- Logout on token refresh failure

**Authorization**
- Role-based access control (admin, viewer)
- GraphQL resolvers enforce permissions
- UI hides unauthorized features
- API rejects unauthorized requests

**Data Protection**
- HTTPS for all communications
- Encrypted data at rest in DynamoDB
- Private S3 bucket with signed URLs
- No sensitive data in client-side logs

### Performance Optimization

**Code Splitting**
- Lazy load routes with React.lazy()
- Split vendor bundles from application code
- Dynamic imports for heavy components (charts)

**Caching Strategy**
- React Query caches API responses
- Stale-while-revalidate pattern
- Cache invalidation on mutations
- Local storage for user preferences

**Bundle Optimization**
- Tree shaking to remove unused code
- Minification and compression
- Image optimization and lazy loading
- CDN for static assets

**Rendering Optimization**
- React.memo for expensive components
- useMemo/useCallback for expensive computations
- Virtual scrolling for large lists
- Debounce search inputs

### Deployment Strategy

**Environment Configuration**
- Development: Local with Amplify mock backend
- Staging: AWS with test data
- Production: AWS with production data

**CI/CD Pipeline**
- GitHub Actions for automated testing
- Amplify Console for deployment
- Automatic deployment on main branch merge
- Manual approval for production deployments

**Monitoring**
- CloudWatch for backend metrics
- Sentry for frontend error tracking
- Google Analytics for user behavior
- Custom dashboards for business metrics
