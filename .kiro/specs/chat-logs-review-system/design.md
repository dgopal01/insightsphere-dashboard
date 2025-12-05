# Design Document

## Overview

The Chat Logs Review System is a single-page React application built with TypeScript, AWS Amplify, and Material-UI. The architecture follows a three-tier pattern: presentation layer (React components), business logic layer (custom hooks and services), and data layer (AWS AppSync GraphQL API with DynamoDB). The application connects to two existing DynamoDB tables and provides three main interfaces for reviewing chat logs, feedback logs, and monitoring review metrics through a dashboard.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Application                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Chat Logs    │  │ Feedback     │  │   Review     │      │
│  │ Review       │  │ Logs Review  │  │  Dashboard   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│  ┌──────────────────────────────────────────────────┐      │
│  │         Custom Hooks & State Management          │      │
│  └──────────────────────────────────────────────────┘      │
│         │                                                    │
│  ┌──────────────────────────────────────────────────┐      │
│  │            Amplify Client Library                 │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    AWS AppSync (GraphQL)                     │
│  ┌──────────────────────────────────────────────────┐      │
│  │              GraphQL Resolvers                    │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Amazon DynamoDB                           │
│  ┌──────────────────┐      ┌──────────────────┐            │
│  │ UnityAIAssistant │      │   UserFeedback   │            │
│  │      Logs        │      │                  │            │
│  └──────────────────┘      └──────────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

### Authentication Flow

```
User → Cognito Hosted UI → JWT Token → AppSync → DynamoDB
```

AWS Cognito manages user authentication with JWT tokens. All GraphQL requests include the authentication token in headers, and AppSync validates tokens before processing requests.

## Components and Interfaces

### Frontend Components

#### 1. Authentication Components

**SignInPage Component**
- Renders Cognito authentication UI using `@aws-amplify/ui-react`
- Handles authentication state changes
- Redirects to dashboard on successful authentication

```typescript
interface SignInPageProps {}
```

#### 2. Chat Logs Review Components

**ChatLogsReviewPage Component**
- Container component for chat logs review interface
- Manages state for selected log, filters, and pagination
- Coordinates between DataTable and ReviewModal components

```typescript
interface ChatLogsReviewPageProps {}

interface ChatLogsReviewState {
  logs: ChatLogEntry[];
  selectedLog: ChatLogEntry | null;
  filters: LogFilters;
  pagination: PaginationState;
  loading: boolean;
  error: Error | null;
}
```

**ChatLogsDataTable Component**
- Displays chat logs in a sortable, filterable table
- Implements Material-UI DataGrid
- Handles row selection and pagination

```typescript
interface ChatLogsDataTableProps {
  logs: ChatLogEntry[];
  loading: boolean;
  onRowClick: (log: ChatLogEntry) => void;
  onSort: (field: keyof ChatLogEntry, direction: 'asc' | 'desc') => void;
  onFilter: (filters: LogFilters) => void;
  onPageChange: (page: number) => void;
  totalCount: number;
  currentPage: number;
}
```

**ChatLogReviewModal Component**
- Modal dialog for reviewing individual chat log entries
- Contains form for entering rev_comment and rev_feedback
- Validates input and submits updates

```typescript
interface ChatLogReviewModalProps {
  open: boolean;
  log: ChatLogEntry | null;
  onClose: () => void;
  onSubmit: (logId: string, reviewData: ReviewData) => Promise<void>;
}

interface ReviewData {
  rev_comment: string;
  rev_feedback: string;
}
```

#### 3. Feedback Logs Review Components

**FeedbackLogsReviewPage Component**
- Container component for feedback logs review interface
- Similar structure to ChatLogsReviewPage but for UserFeedback data

```typescript
interface FeedbackLogsReviewPageProps {}

interface FeedbackLogsReviewState {
  logs: FeedbackLogEntry[];
  selectedLog: FeedbackLogEntry | null;
  filters: FeedbackFilters;
  pagination: PaginationState;
  loading: boolean;
  error: Error | null;
}
```

**FeedbackLogsDataTable Component**
- Displays feedback logs in a sortable, filterable table
- Similar to ChatLogsDataTable but with feedback-specific columns

```typescript
interface FeedbackLogsDataTableProps {
  logs: FeedbackLogEntry[];
  loading: boolean;
  onRowClick: (log: FeedbackLogEntry) => void;
  onSort: (field: keyof FeedbackLogEntry, direction: 'asc' | 'desc') => void;
  onFilter: (filters: FeedbackFilters) => void;
  onPageChange: (page: number) => void;
  totalCount: number;
  currentPage: number;
}
```

**FeedbackLogReviewModal Component**
- Modal dialog for reviewing individual feedback log entries
- Similar to ChatLogReviewModal but for feedback data

```typescript
interface FeedbackLogReviewModalProps {
  open: boolean;
  log: FeedbackLogEntry | null;
  onClose: () => void;
  onSubmit: (logId: string, reviewData: ReviewData) => Promise<void>;
}
```

#### 4. Review Dashboard Components

**ReviewDashboardPage Component**
- Container component for metrics dashboard
- Fetches and displays aggregated metrics
- Implements auto-refresh functionality

```typescript
interface ReviewDashboardPageProps {}

interface DashboardState {
  metrics: ReviewMetrics | null;
  loading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
}
```

**MetricsCard Component**
- Displays individual metric with color-coded status
- Shows total, reviewed, pending counts and percentage
- Applies color coding based on completion percentage

```typescript
interface MetricsCardProps {
  title: string;
  total: number;
  reviewed: number;
  pending: number;
  percentage: number;
}
```

#### 5. Common Components

**Layout Component**
- Provides consistent layout with navigation sidebar
- Includes header with user info and logout button
- Wraps all page components

```typescript
interface LayoutProps {
  children: React.ReactNode;
}
```

**ErrorBoundary Component**
- Catches and displays React errors
- Provides fallback UI for error states
- Logs errors for debugging

```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}
```

**LoadingSpinner Component**
- Reusable loading indicator
- Consistent loading UI across application

```typescript
interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}
```

### Custom Hooks

#### useChatLogs Hook
- Manages chat logs data fetching and state
- Handles filtering, sorting, and pagination
- Provides update function for review submission

```typescript
interface UseChatLogsReturn {
  logs: ChatLogEntry[];
  loading: boolean;
  error: Error | null;
  totalCount: number;
  fetchLogs: (filters: LogFilters, page: number) => Promise<void>;
  updateReview: (logId: string, reviewData: ReviewData) => Promise<void>;
  refetch: () => Promise<void>;
}

function useChatLogs(): UseChatLogsReturn;
```

#### useFeedbackLogs Hook
- Manages feedback logs data fetching and state
- Similar to useChatLogs but for UserFeedback table

```typescript
interface UseFeedbackLogsReturn {
  logs: FeedbackLogEntry[];
  loading: boolean;
  error: Error | null;
  totalCount: number;
  fetchLogs: (filters: FeedbackFilters, page: number) => Promise<void>;
  updateReview: (logId: string, reviewData: ReviewData) => Promise<void>;
  refetch: () => Promise<void>;
}

function useFeedbackLogs(): UseFeedbackLogsReturn;
```

#### useReviewMetrics Hook
- Fetches and manages dashboard metrics
- Implements auto-refresh logic
- Calculates derived metrics (percentages)

```typescript
interface UseReviewMetricsReturn {
  metrics: ReviewMetrics | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
}

function useReviewMetrics(autoRefreshInterval?: number): UseReviewMetricsReturn;
```

### GraphQL API

#### Queries

**listUnityAIAssistantLogs**
```graphql
query ListUnityAIAssistantLogs(
  $filter: ModelUnityAIAssistantLogFilterInput
  $limit: Int
  $nextToken: String
) {
  listUnityAIAssistantLogs(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      log_id
      timestamp
      carrier_name
      chat_id
      citation
      fi_name
      guardrail_id
      guardrail_intervened
      model_id
      question
      response
      rev_comment
      rev_feedback
      session_id
      user_name
      usr_comment
      usr_feedback
    }
    nextToken
  }
}
```

**listUserFeedbacks**
```graphql
query ListUserFeedbacks(
  $filter: ModelUserFeedbackFilterInput
  $limit: Int
  $nextToken: String
) {
  listUserFeedbacks(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      datetime
      carrier
      comments
      feedback
      question
      response
      session_id
      type
      username
      user_name
      rev_comment
      rev_feedback
    }
    nextToken
  }
}
```

**getReviewMetrics**
```graphql
query GetReviewMetrics {
  getReviewMetrics {
    totalChatLogs
    reviewedChatLogs
    pendingChatLogs
    totalFeedbackLogs
    reviewedFeedbackLogs
    pendingFeedbackLogs
  }
}
```

#### Mutations

**updateUnityAIAssistantLog**
```graphql
mutation UpdateUnityAIAssistantLog($input: UpdateUnityAIAssistantLogInput!) {
  updateUnityAIAssistantLog(input: $input) {
    log_id
    rev_comment
    rev_feedback
  }
}
```

**updateUserFeedback**
```graphql
mutation UpdateUserFeedback($input: UpdateUserFeedbackInput!) {
  updateUserFeedback(input: $input) {
    id
    rev_comment
    rev_feedback
  }
}
```

## Data Models

### ChatLogEntry
```typescript
interface ChatLogEntry {
  log_id: string;
  timestamp: string;
  carrier_name: string;
  chat_id: string;
  citation: string;
  fi_name: string;
  guardrail_id: string;
  guardrail_intervened: boolean;
  model_id: string;
  question: string;
  response: string;
  rev_comment: string;
  rev_feedback: string;
  session_id: string;
  user_name: string;
  usr_comment: string;
  usr_feedback: string;
}
```

### FeedbackLogEntry
```typescript
interface FeedbackLogEntry {
  id: string;
  datetime: string;
  carrier: string;
  comments: string;
  feedback: string;
  question: string;
  response: string;
  session_id: string;
  type: string;
  username: string;
  user_name: string;
  rev_comment: string;
  rev_feedback: string;
}
```

### ReviewMetrics
```typescript
interface ReviewMetrics {
  totalChatLogs: number;
  reviewedChatLogs: number;
  pendingChatLogs: number;
  totalFeedbackLogs: number;
  reviewedFeedbackLogs: number;
  pendingFeedbackLogs: number;
}
```

### Filter Types
```typescript
interface LogFilters {
  carrier_name?: string;
  startDate?: string;
  endDate?: string;
  reviewStatus?: 'all' | 'reviewed' | 'pending';
}

interface FeedbackFilters {
  carrier?: string;
  startDate?: string;
  endDate?: string;
  reviewStatus?: 'all' | 'reviewed' | 'pending';
}
```

### Pagination State
```typescript
interface PaginationState {
  currentPage: number;
  pageSize: number;
  nextToken: string | null;
  hasMore: boolean;
}
```

## Correc
tness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Authentication Properties

Property 1: Valid credentials grant access
*For any* valid credential set (username and password), authenticating with those credentials should grant access to all review screens
**Validates: Requirements 1.2**

Property 2: Invalid credentials deny access
*For any* invalid credential set, authenticating with those credentials should display an error message and prevent access to review screens
**Validates: Requirements 1.3**

Property 3: Logout clears authentication
*For any* authenticated session, logging out should clear all authentication tokens and terminate the session
**Validates: Requirements 1.5**

### Chat Logs Data Display Properties

Property 4: All chat log fields displayed
*For any* retrieved chat log entry, the display should include log_id, timestamp, carrier_name, question, response, citation, and all review fields
**Validates: Requirements 2.2**

Property 5: Query errors show error UI
*For any* failed GraphQL query, the system should display an error message and provide a retry option
**Validates: Requirements 2.4**

Property 6: Loading state shows indicator
*For any* loading operation (chat logs, feedback logs, or metrics), the system should display a loading indicator while the operation is in progress
**Validates: Requirements 2.5, 5.5, 9.5**

### Chat Logs Filtering and Sorting Properties

Property 7: Carrier filter matches results
*For any* carrier name filter applied to chat logs, all displayed results should have a carrier_name field matching the filter value
**Validates: Requirements 3.1**

Property 8: Timestamp sort ordering
*For any* chat log dataset, when sorted by timestamp in ascending order, each entry's timestamp should be less than or equal to the next entry's timestamp; when sorted in descending order, each entry's timestamp should be greater than or equal to the next entry's timestamp
**Validates: Requirements 3.2**

Property 9: Multiple filters intersection
*For any* combination of filters applied to chat logs, all displayed results should match every filter criterion simultaneously
**Validates: Requirements 3.3**

Property 10: Clear filters shows all data
*For any* filtered chat log view, clearing all filters should result in displaying all available chat logs (up to pagination limit)
**Validates: Requirements 3.4**

Property 11: Pagination state invariant
*For any* sort or filter operation on chat logs, the pagination state (current page, page size) should remain unchanged
**Validates: Requirements 3.5**

### Chat Log Review Submission Properties

Property 12: Detail view shows all fields
*For any* selected chat log entry, the detailed view should display all log fields including log_id, timestamp, carrier_name, question, response, citation, guardrail information, and review fields
**Validates: Requirements 4.1**

Property 13: Comment field validation
*For any* string input to the review comment field, the system should accept it if and only if it is alphanumeric and has length less than or equal to 5000 characters
**Validates: Requirements 4.2**

Property 14: Feedback field validation
*For any* string input to the review feedback field, the system should accept it if and only if it is alphanumeric and has length less than or equal to 5000 characters
**Validates: Requirements 4.3**

Property 15: Review submission updates database
*For any* chat log entry and valid review data (comment and feedback), submitting the review should result in the rev_comment and rev_feedback fields being updated in the UnityAIAssistantLogs table
**Validates: Requirements 4.4**

Property 16: Successful update shows confirmation
*For any* successful review update operation, the system should display a success confirmation message and refresh the displayed data to reflect the update
**Validates: Requirements 4.5**

Property 17: Failed update preserves data
*For any* failed review update operation, the system should display an error message and retain the entered review data (comment and feedback) for potential retry
**Validates: Requirements 4.6**

### Feedback Logs Data Display Properties

Property 18: All feedback log fields displayed
*For any* retrieved feedback log entry, the display should include id, datetime, carrier, comments, feedback, question, response, username, and all review fields
**Validates: Requirements 5.2**

Property 19: Feedback query errors show error UI
*For any* failed GraphQL query for feedback logs, the system should display an error message and provide a retry option
**Validates: Requirements 5.4**

### Feedback Logs Filtering and Sorting Properties

Property 20: Carrier filter matches feedback results
*For any* carrier filter applied to feedback logs, all displayed results should have a carrier field matching the filter value
**Validates: Requirements 6.1**

Property 21: Datetime sort ordering
*For any* feedback log dataset, when sorted by datetime in ascending order, each entry's datetime should be less than or equal to the next entry's datetime; when sorted in descending order, each entry's datetime should be greater than or equal to the next entry's datetime
**Validates: Requirements 6.2**

Property 22: Multiple feedback filters intersection
*For any* combination of filters applied to feedback logs, all displayed results should match every filter criterion simultaneously
**Validates: Requirements 6.3**

Property 23: Clear feedback filters shows all data
*For any* filtered feedback log view, clearing all filters should result in displaying all available feedback logs (up to pagination limit)
**Validates: Requirements 6.4**

Property 24: Feedback pagination state invariant
*For any* sort or filter operation on feedback logs, the pagination state (current page, page size) should remain unchanged
**Validates: Requirements 6.5**

### Feedback Log Review Submission Properties

Property 25: Feedback detail view shows all fields
*For any* selected feedback log entry, the detailed view should display all feedback fields including id, datetime, carrier, comments, feedback, question, response, username, and review fields
**Validates: Requirements 7.1**

Property 26: Feedback comment field validation
*For any* string input to the feedback review comment field, the system should accept it if and only if it is alphanumeric and has length less than or equal to 5000 characters
**Validates: Requirements 7.2**

Property 27: Feedback feedback field validation
*For any* string input to the feedback review feedback field, the system should accept it if and only if it is alphanumeric and has length less than or equal to 5000 characters
**Validates: Requirements 7.3**

Property 28: Feedback review submission updates database
*For any* feedback log entry and valid review data (comment and feedback), submitting the review should result in the rev_comment and rev_feedback fields being updated in the UserFeedback table
**Validates: Requirements 7.4**

Property 29: Successful feedback update shows confirmation
*For any* successful feedback review update operation, the system should display a success confirmation message and refresh the displayed data to reflect the update
**Validates: Requirements 7.5**

Property 30: Failed feedback update preserves data
*For any* failed feedback review update operation, the system should display an error message and retain the entered review data (comment and feedback) for potential retry
**Validates: Requirements 7.6**

### Dashboard Metrics Properties

Property 31: Reviewed count calculation
*For any* dataset of chat logs or feedback logs, the count of reviewed entries should equal the number of entries where rev_comment is not empty OR rev_feedback is not empty
**Validates: Requirements 8.2, 8.5**

Property 32: Pending count calculation
*For any* dataset of chat logs or feedback logs, the count of pending entries should equal the number of entries where both rev_comment AND rev_feedback are empty
**Validates: Requirements 8.3, 8.6**

Property 33: Metrics display completeness
*For any* metrics display, it should show total count, reviewed count, pending count, and percentage for both chat logs and feedback logs
**Validates: Requirements 9.4**

### Input Validation and Sanitization Properties

Property 34: XSS prevention in comments
*For any* string input containing potential XSS payloads (script tags, event handlers, etc.) entered in review comment fields, the system should sanitize the input to remove or escape malicious content before storage
**Validates: Requirements 10.1**

Property 35: XSS prevention in feedback
*For any* string input containing potential XSS payloads entered in review feedback fields, the system should sanitize the input to remove or escape malicious content before storage
**Validates: Requirements 10.2**

Property 36: Character limit enforcement
*For any* input field with a maximum character limit, submitting input exceeding that limit should be prevented and a validation error should be displayed
**Validates: Requirements 10.3**

Property 37: Required field validation
*For any* form with required fields, submitting the form with empty required fields should be prevented and a validation error should be displayed
**Validates: Requirements 10.4**

Property 38: Special character escaping
*For any* string input containing special characters (quotes, backslashes, etc.), the system should properly escape those characters before database storage to prevent injection attacks
**Validates: Requirements 10.5**

### Error Handling Properties

Property 39: GraphQL error messaging
*For any* failed GraphQL query or mutation, the system should display a user-friendly error message that describes the issue
**Validates: Requirements 11.1**

Property 40: Network error messaging
*For any* network connectivity error, the system should display a connectivity error message suggesting the user check their network connection
**Validates: Requirements 11.2**

Property 41: Authentication error redirect
*For any* authentication error (expired token, invalid token, etc.), the system should redirect the user to the authentication interface with an appropriate error message
**Validates: Requirements 11.3**

Property 42: Mutation failure data preservation
*For any* failed mutation operation, the system should display the error and preserve all user-entered data to allow for retry without re-entry
**Validates: Requirements 11.4**

Property 43: Unexpected error handling
*For any* unexpected error or exception, the system should log the error details (to console or monitoring service) and display a generic error message to the user
**Validates: Requirements 11.5**

## Error Handling

### Error Categories

#### 1. Network Errors
- Connection timeouts
- DNS resolution failures
- Network unavailability

**Handling Strategy:**
- Display user-friendly message: "Unable to connect. Please check your internet connection."
- Provide retry button
- Log error details to console
- Implement exponential backoff for retries

#### 2. Authentication Errors
- Expired tokens
- Invalid credentials
- Insufficient permissions

**Handling Strategy:**
- Redirect to sign-in page
- Clear local authentication state
- Display appropriate message (e.g., "Your session has expired. Please sign in again.")
- Preserve intended destination for post-login redirect

#### 3. GraphQL Errors
- Query/mutation failures
- Validation errors
- Server errors

**Handling Strategy:**
- Parse GraphQL error response
- Display specific error message when available
- Provide context-appropriate actions (retry, cancel, etc.)
- Log full error details for debugging

#### 4. Validation Errors
- Input exceeds character limits
- Required fields empty
- Invalid data format

**Handling Strategy:**
- Display inline validation messages
- Highlight invalid fields
- Prevent form submission until resolved
- Preserve user input for correction

#### 5. Application Errors
- Component rendering errors
- State management errors
- Unexpected exceptions

**Handling Strategy:**
- Use Error Boundary to catch React errors
- Display fallback UI
- Log error stack trace
- Provide option to reload or return to safe state

### Error Logging

All errors should be logged with the following information:
- Timestamp
- Error type and message
- User ID (if authenticated)
- Current route/screen
- Stack trace (for application errors)
- Request details (for API errors)

### User Feedback

Error messages should be:
- Clear and concise
- Non-technical (avoid jargon)
- Actionable (suggest next steps)
- Consistent in tone and format

## Testing Strategy

### Unit Testing

**Framework:** Vitest with React Testing Library

**Coverage Areas:**
- Component rendering and props
- User interactions (clicks, form inputs)
- State management logic
- Utility functions (validation, sanitization, formatting)
- Custom hooks behavior
- Error boundary functionality

**Example Unit Tests:**
- MetricsCard displays correct color based on percentage
- ReviewModal validates input length
- Filter components update state correctly
- Sanitization functions remove XSS payloads
- Date formatting utilities handle edge cases

### Property-Based Testing

**Framework:** fast-check (JavaScript property-based testing library)

**Configuration:**
- Minimum 100 iterations per property test
- Each property test must reference its corresponding design document property
- Tag format: `**Feature: chat-logs-review-system, Property {number}: {property_text}**`

**Coverage Areas:**
- Input validation across wide range of inputs
- Sorting and filtering logic with random datasets
- Metrics calculation with various data distributions
- Sanitization effectiveness with generated payloads
- Error handling with simulated failures

**Example Property Tests:**
- Property 8: Generate random chat log arrays, sort by timestamp, verify ordering
- Property 13: Generate random strings of various lengths, verify validation logic
- Property 31: Generate random log datasets, verify reviewed count calculation
- Property 34: Generate strings with XSS payloads, verify sanitization

### Integration Testing

**Framework:** Vitest with MSW (Mock Service Worker) for API mocking

**Coverage Areas:**
- Complete user workflows (authentication → review → submission)
- GraphQL query and mutation integration
- Error handling across component boundaries
- Navigation and routing
- State persistence across screens

**Example Integration Tests:**
- User authenticates, navigates to chat logs, filters data, submits review
- Dashboard loads metrics, auto-refreshes, displays correct colors
- Error occurs during submission, user retries successfully
- Session expires, user redirected to login, returns to intended page

### End-to-End Testing

**Framework:** Playwright or Cypress

**Coverage Areas:**
- Critical user paths through actual application
- Authentication flow with real Cognito
- Data retrieval and display from actual DynamoDB (test environment)
- Cross-browser compatibility
- Responsive design on different screen sizes

**Example E2E Tests:**
- Complete review workflow from login to submission
- Dashboard metrics accuracy with real data
- Filter and sort operations with large datasets
- Error recovery scenarios

### Testing Best Practices

1. **Test Isolation:** Each test should be independent and not rely on other tests
2. **Mock External Dependencies:** Use MSW for API calls, mock AWS services in unit tests
3. **Test User Behavior:** Focus on what users do, not implementation details
4. **Accessibility Testing:** Include tests for keyboard navigation, screen reader compatibility
5. **Performance Testing:** Monitor test execution time, optimize slow tests
6. **Continuous Integration:** Run tests on every commit, block merges on failures

### Test Data Management

**Generators for Property-Based Testing:**
```typescript
// Generate random chat log entries
function generateChatLog(): ChatLogEntry;

// Generate random feedback log entries
function generateFeedbackLog(): FeedbackLogEntry;

// Generate random review data
function generateReviewData(): ReviewData;

// Generate strings with XSS payloads
function generateXSSPayload(): string;

// Generate strings of specific length ranges
function generateString(minLength: number, maxLength: number): string;
```

**Mock Data for Unit/Integration Testing:**
- Predefined chat log fixtures
- Predefined feedback log fixtures
- Mock GraphQL responses
- Mock authentication states

## Deployment Architecture

### CloudFormation Template Structure

The deployment uses a single CloudFormation template that provisions:

1. **DynamoDB Tables** (if not existing)
   - UnityAIAssistantLogs table with GSI on carrier_name
   - UserFeedback table with GSI on carrier

2. **Cognito User Pool**
   - User pool for authentication
   - App client for web application
   - User pool domain for hosted UI

3. **AppSync GraphQL API**
   - GraphQL schema
   - Data sources (DynamoDB tables)
   - Resolvers for queries and mutations
   - Lambda function for metrics calculation

4. **Lambda Functions**
   - GetReviewMetrics function for dashboard
   - IAM role with DynamoDB read permissions

5. **Amplify Hosting**
   - Amplify app
   - Branch configuration
   - Build settings
   - Environment variables

6. **IAM Roles and Policies**
   - AppSync service role for DynamoDB access
   - Lambda execution role
   - Amplify service role

### Deployment Script

A single PowerShell script (`deploy.ps1`) that:
1. Validates AWS credentials
2. Packages Lambda functions
3. Uploads assets to S3 (if needed)
4. Deploys CloudFormation stack
5. Outputs application URL and configuration

### Environment Configuration

Environment variables managed through CloudFormation parameters:
- `Environment` (dev/staging/prod)
- `CognitoDomain` (unique domain prefix)
- `AllowedOrigins` (CORS configuration)

### Monitoring and Logging

- CloudWatch Logs for Lambda functions
- AppSync logging enabled
- Amplify build logs
- Custom metrics for review completion rates

## Security Considerations

### Authentication and Authorization

- All API requests require valid Cognito JWT token
- Token validation at AppSync layer
- Role-based access control (future enhancement)
- Secure token storage in browser (httpOnly cookies or secure localStorage)

### Data Protection

- All data encrypted at rest (DynamoDB encryption)
- All data encrypted in transit (HTTPS/TLS)
- Input sanitization to prevent XSS
- Parameterized queries to prevent injection
- Content Security Policy headers

### API Security

- GraphQL query depth limiting
- Rate limiting on API endpoints
- Request size limits
- CORS configuration for allowed origins

### Secrets Management

- AWS credentials never in source code
- Environment variables for configuration
- Cognito client secrets managed by AWS
- API keys rotated regularly

## Performance Optimization

### Frontend Optimizations

1. **Code Splitting**
   - Lazy load routes
   - Dynamic imports for large components
   - Separate vendor bundles

2. **Caching**
   - Cache GraphQL query results
   - Browser caching for static assets
   - Service worker for offline capability (future)

3. **Rendering Optimization**
   - React.memo for expensive components
   - useMemo for expensive calculations
   - useCallback for event handlers
   - Virtual scrolling for large lists

4. **Bundle Optimization**
   - Tree shaking unused code
   - Minification and compression
   - Image optimization
   - Font subsetting

### Backend Optimizations

1. **Database**
   - GSI for efficient carrier-based queries
   - Pagination to limit result sets
   - Projection expressions to fetch only needed fields
   - DynamoDB auto-scaling

2. **API**
   - GraphQL field-level caching
   - Batch operations where possible
   - Connection pooling in Lambda
   - Lambda provisioned concurrency for metrics function

3. **Network**
   - CloudFront CDN for static assets
   - Gzip compression
   - HTTP/2 support
   - Keep-alive connections

## Maintenance and Monitoring

### Health Checks

- API endpoint health monitoring
- Database connection monitoring
- Authentication service availability
- Frontend application availability

### Metrics to Track

- Review completion rate (percentage)
- Average time to review
- API response times
- Error rates by type
- User session duration
- Page load times

### Alerting

- High error rate alerts
- API latency alerts
- Authentication failure alerts
- Database throttling alerts
- Cost anomaly alerts

### Backup and Recovery

- DynamoDB point-in-time recovery enabled
- CloudFormation stack exports for disaster recovery
- Regular testing of backup restoration
- Documentation of recovery procedures

## Future Enhancements

1. **Advanced Filtering**
   - Full-text search across logs
   - Date range pickers
   - Multi-select filters
   - Saved filter presets

2. **Bulk Operations**
   - Bulk review submission
   - Batch export
   - Bulk status updates

3. **Analytics**
   - Review trends over time
   - Reviewer performance metrics
   - Common feedback patterns
   - AI-assisted review suggestions

4. **Collaboration**
   - Review assignments
   - Comments and discussions
   - Review workflow states
   - Approval processes

5. **Mobile Support**
   - Responsive design improvements
   - Native mobile app
   - Offline capability
   - Push notifications
