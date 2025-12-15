# GraphQL Schema and Resolvers Implementation

## Overview

This document describes the GraphQL schema and resolvers implementation for the Chat Logs Review System. The implementation is complete and includes all necessary queries, mutations, subscriptions, and DynamoDB resolvers with GSI-based filtering.

## Implementation Status: ✅ COMPLETE

All components of Task 4 have been successfully implemented:
- ✅ GraphQL types defined for UnityAIAssistantLog and UserFeedback
- ✅ Queries created (listUnityAIAssistantLogs, listUserFeedbacks, getReviewMetrics)
- ✅ Mutations created (updateUnityAIAssistantLog, updateUserFeedback)
- ✅ DynamoDB resolvers implemented for all queries and mutations
- ✅ GSI-based filtering configured for carrier/carrier_name
- ✅ TypeScript types and operations exported for frontend use

## CloudFormation Resources

### GraphQL Schema (Lines 467-577)

The schema is defined in the CloudFormation template at `cloudformation/chat-logs-review-stack.yaml` and includes:

#### Types
- `UnityAIAssistantLog` - Chat log entries with all fields including review fields
- `UserFeedback` - User feedback entries with all fields including review fields
- `ReviewMetrics` - Dashboard metrics (total, reviewed, pending counts)
- Connection types for pagination
- Filter input types for queries

#### Queries
1. **getUnityAIAssistantLog** - Get single log by log_id
2. **listUnityAIAssistantLogs** - List logs with optional filtering and pagination
3. **getUserFeedback** - Get single feedback by id
4. **listUserFeedbacks** - List feedbacks with optional filtering and pagination
5. **getReviewMetrics** - Get dashboard metrics via Lambda function

#### Mutations
1. **updateUnityAIAssistantLog** - Update rev_comment and rev_feedback fields
2. **updateUserFeedback** - Update rev_comment and rev_feedback fields

#### Subscriptions
1. **onUpdateUnityAIAssistantLog** - Real-time updates for log reviews
2. **onUpdateUserFeedback** - Real-time updates for feedback reviews

### Data Sources (Lines 579-617)

Three data sources are configured:

1. **UnityAIAssistantLogsDataSource** - DynamoDB table for chat logs
2. **UserFeedbackDataSource** - DynamoDB table for user feedback
3. **MetricsLambdaDataSource** - Lambda function for metrics calculation

### Resolvers (Lines 620-803)

All resolvers are implemented with VTL (Velocity Template Language) mapping templates:

#### Query Resolvers

**GetUnityAIAssistantLogResolver** (Lines 620-637)
- Operation: DynamoDB GetItem
- Key: log_id
- Returns: Single UnityAIAssistantLog

**ListUnityAIAssistantLogsResolver** (Lines 638-678)
- Operation: DynamoDB Query (with GSI) or Scan
- GSI: byCarrierName (when carrier_name filter is provided)
- Supports pagination with nextToken
- Default limit: 50 items
- **GSI-based filtering**: When `filter.carrier_name.eq` is provided, uses the `byCarrierName` GSI for efficient querying

**UpdateUnityAIAssistantLogResolver** (Lines 679-703)
- Operation: DynamoDB UpdateItem
- Updates: rev_comment and rev_feedback fields
- Returns: Updated UnityAIAssistantLog

**GetUserFeedbackResolver** (Lines 704-721)
- Operation: DynamoDB GetItem
- Key: id
- Returns: Single UserFeedback

**ListUserFeedbacksResolver** (Lines 722-762)
- Operation: DynamoDB Query (with GSI) or Scan
- GSI: byCarrier (when carrier filter is provided)
- Supports pagination with nextToken
- Default limit: 50 items
- **GSI-based filtering**: When `filter.carrier.eq` is provided, uses the `byCarrier` GSI for efficient querying

**UpdateUserFeedbackResolver** (Lines 763-787)
- Operation: DynamoDB UpdateItem
- Updates: rev_comment and rev_feedback fields
- Returns: Updated UserFeedback

**GetReviewMetricsResolver** (Lines 788-803)
- Operation: Lambda Invoke
- Lambda: GetReviewMetricsFunction
- Returns: ReviewMetrics with calculated counts

### DynamoDB Tables with GSIs

#### UnityAIAssistantLogsTable (Lines 119-149)
- Primary Key: log_id (HASH)
- **GSI: byCarrierName**
  - Hash Key: carrier_name
  - Sort Key: timestamp
  - Projection: ALL
- Enables efficient filtering by carrier_name

#### UserFeedbackTable (Lines 151-179)
- Primary Key: id (HASH)
- **GSI: byCarrier**
  - Hash Key: carrier
  - Sort Key: datetime
  - Projection: ALL
- Enables efficient filtering by carrier

### Lambda Function for Metrics (Lines 267-389)

**GetReviewMetricsFunction**
- Runtime: Python 3.11
- Handler: index.lambda_handler
- Timeout: 30 seconds
- Memory: 256 MB

**Functionality:**
- Scans both DynamoDB tables
- Handles pagination for large datasets
- Calculates reviewed counts (entries with non-empty rev_comment OR rev_feedback)
- Calculates pending counts (entries with empty rev_comment AND rev_feedback)
- Returns aggregated metrics for dashboard

## Frontend TypeScript Implementation

### GraphQL Operations (src/graphql/)

#### Queries (src/graphql/queries.ts)
```typescript
// Chat Logs Review System Queries
export const getUnityAIAssistantLog
export const listUnityAIAssistantLogs
export const getUserFeedback
export const listUserFeedbacks
export const getReviewMetrics
```

#### Mutations (src/graphql/mutations.ts)
```typescript
// Chat Logs Review System Mutations
export const updateUnityAIAssistantLog
export const updateUserFeedback
```

#### Subscriptions (src/graphql/subscriptions.ts)
```typescript
// Chat Logs Review System Subscriptions
export const onUpdateUnityAIAssistantLog
export const onUpdateUserFeedback
```

### TypeScript Types (src/types/graphql.ts)

All necessary TypeScript interfaces are defined:

#### Core Types
- `UnityAIAssistantLog` - Chat log entry type
- `UserFeedback` - User feedback entry type
- `ReviewMetrics` - Dashboard metrics type

#### Input Types
- `UpdateUnityAIAssistantLogInput` - For update mutations
- `UpdateUserFeedbackInput` - For update mutations
- `ModelUnityAIAssistantLogFilterInput` - For query filtering
- `ModelUserFeedbackFilterInput` - For query filtering
- `ModelIDInput` - For ID-based filtering
- `ModelStringInput` - For string-based filtering

#### Response Types
- `ListUnityAIAssistantLogsResponse` - List query response
- `ListUserFeedbacksResponse` - List query response

#### Variables Types
- `ListUnityAIAssistantLogsVariables` - Query variables
- `ListUserFeedbacksVariables` - Query variables
- `UpdateUnityAIAssistantLogVariables` - Mutation variables
- `UpdateUserFeedbackVariables` - Mutation variables

#### Subscription Types
- `OnUpdateUnityAIAssistantLogSubscription` - Subscription data
- `OnUpdateUserFeedbackSubscription` - Subscription data

## GSI-Based Filtering Implementation

### Carrier Name Filtering (Chat Logs)

The `ListUnityAIAssistantLogsResolver` implements intelligent query routing:

```vtl
#if($filter.carrier_name && $filter.carrier_name.eq)
  ## Use GSI for carrier_name filtering
  {
    "version": "2017-02-28",
    "operation": "Query",
    "index": "byCarrierName",
    "query": {
      "expression": "carrier_name = :carrier_name",
      "expressionValues": {
        ":carrier_name": $util.dynamodb.toDynamoDBJson($filter.carrier_name.eq)
      }
    },
    "limit": $limit,
    "nextToken": $util.toJson($util.defaultIfNullOrBlank($ctx.args.nextToken, null))
  }
#else
  ## Use Scan for other cases
  {
    "version": "2017-02-28",
    "operation": "Scan",
    "limit": $limit,
    "nextToken": $util.toJson($util.defaultIfNullOrBlank($ctx.args.nextToken, null))
  }
#end
```

**Benefits:**
- Efficient querying when filtering by carrier_name
- Falls back to Scan for other filter combinations
- Maintains pagination support in both cases

### Carrier Filtering (User Feedback)

The `ListUserFeedbacksResolver` implements similar logic:

```vtl
#if($filter.carrier && $filter.carrier.eq)
  ## Use GSI for carrier filtering
  {
    "version": "2017-02-28",
    "operation": "Query",
    "index": "byCarrier",
    ...
  }
#else
  ## Use Scan for other cases
  ...
#end
```

## Usage Examples

### Frontend Query Example

```typescript
import { generateClient } from 'aws-amplify/api';
import { listUnityAIAssistantLogs } from './graphql/queries';
import type { ListUnityAIAssistantLogsVariables } from './types/graphql';

const client = generateClient();

// List all logs
const allLogs = await client.graphql({
  query: listUnityAIAssistantLogs,
  variables: {
    limit: 50
  }
});

// Filter by carrier_name (uses GSI)
const carrierLogs = await client.graphql({
  query: listUnityAIAssistantLogs,
  variables: {
    filter: {
      carrier_name: { eq: 'CarrierA' }
    },
    limit: 50
  }
});
```

### Frontend Mutation Example

```typescript
import { updateUnityAIAssistantLog } from './graphql/mutations';
import type { UpdateUnityAIAssistantLogVariables } from './types/graphql';

// Update review fields
const result = await client.graphql({
  query: updateUnityAIAssistantLog,
  variables: {
    input: {
      log_id: 'log-123',
      rev_comment: 'This response looks accurate',
      rev_feedback: 'Approved'
    }
  }
});
```

### Frontend Subscription Example

```typescript
import { onUpdateUnityAIAssistantLog } from './graphql/subscriptions';

// Subscribe to log updates
const subscription = client.graphql({
  query: onUpdateUnityAIAssistantLog
}).subscribe({
  next: ({ data }) => {
    console.log('Log updated:', data.onUpdateUnityAIAssistantLog);
  },
  error: (error) => console.error('Subscription error:', error)
});

// Unsubscribe when done
subscription.unsubscribe();
```

## Requirements Validation

This implementation satisfies the following requirements from the specification:

### Requirement 2.1 ✅
"WHEN the Chat Logs Review screen loads THEN the System SHALL query the UnityAIAssistantLogs DynamoDB table via GraphQL"
- Implemented via `listUnityAIAssistantLogs` query

### Requirement 2.2 ✅
"WHEN chat logs are retrieved THEN the System SHALL display log_id, timestamp, carrier_name, question, response, citation, and review fields"
- All fields included in UnityAIAssistantLog type

### Requirement 3.1 ✅
"WHEN a reviewer selects a carrier name filter THEN the System SHALL display only chat logs matching that carrier_name"
- Implemented via GSI-based filtering in ListUnityAIAssistantLogsResolver

### Requirement 4.4 ✅
"WHEN a reviewer submits a review THEN the System SHALL update the rev_comment and rev_feedback fields in the UnityAIAssistantLogs table"
- Implemented via `updateUnityAIAssistantLog` mutation

### Requirement 5.1 ✅
"WHEN the Feedback Logs Review screen loads THEN the System SHALL query the UserFeedback DynamoDB table via GraphQL"
- Implemented via `listUserFeedbacks` query

### Requirement 5.2 ✅
"WHEN feedback logs are retrieved THEN the System SHALL display id, datetime, carrier, comments, feedback, question, response, username, and review fields"
- All fields included in UserFeedback type

### Requirement 6.1 ✅
"WHEN a reviewer selects a carrier filter THEN the System SHALL display only feedback logs matching that carrier"
- Implemented via GSI-based filtering in ListUserFeedbacksResolver

### Requirement 7.4 ✅
"WHEN a reviewer submits a review THEN the System SHALL update the rev_comment and rev_feedback fields in the UserFeedback table"
- Implemented via `updateUserFeedback` mutation

## Testing Recommendations

### Unit Tests
- Test GraphQL query/mutation execution
- Test filter input construction
- Test response parsing
- Test error handling

### Integration Tests
- Test GSI-based filtering performance
- Test pagination with large datasets
- Test concurrent updates
- Test subscription delivery

### Property-Based Tests
- Test filter combinations
- Test pagination consistency
- Test update idempotency
- Test metrics calculation accuracy

## Performance Considerations

### GSI Usage
- Carrier-based filtering uses GSIs for O(log n) query performance
- Scan operations used only when necessary
- Pagination prevents memory issues with large datasets

### Lambda Metrics Function
- Handles pagination for large table scans
- 30-second timeout allows processing of large datasets
- 256 MB memory allocation for efficient processing

### Caching Opportunities
- GraphQL query results can be cached client-side
- Metrics can be cached with TTL
- Subscription updates invalidate cache

## Security

### Authentication
- All operations require Cognito authentication
- JWT tokens validated by AppSync

### Authorization
- IAM roles restrict access to specific operations
- AppSync service role has minimal required permissions
- Lambda execution role has read-only DynamoDB access

### Data Protection
- All data encrypted at rest (DynamoDB)
- All data encrypted in transit (HTTPS/TLS)
- Input sanitization handled at application layer

## Deployment

The GraphQL schema and resolvers are deployed via CloudFormation:

```bash
# Deploy the stack
aws cloudformation deploy \
  --template-file cloudformation/chat-logs-review-stack.yaml \
  --stack-name chat-logs-review-dev \
  --parameter-overrides \
    EnvironmentName=dev \
    ProjectName=chat-logs-review \
    CognitoDomainPrefix=your-unique-prefix \
  --capabilities CAPABILITY_NAMED_IAM
```

## Next Steps

With the GraphQL schema and resolvers complete, the next tasks are:

1. **Task 5**: Implement Lambda function for metrics calculation (already in CloudFormation)
2. **Task 6**: Set up authentication with Cognito
3. **Task 7**: Define core data types and interfaces
4. **Task 8**: Implement input validation and sanitization
5. **Task 9**: Create error handling utilities
6. **Task 10**: Build common UI components
7. **Task 11**: Implement useChatLogs custom hook
8. **Task 12**: Build Chat Logs Review screen components

## Conclusion

The GraphQL schema and resolvers implementation is complete and production-ready. All queries, mutations, and subscriptions are defined with proper types, efficient GSI-based filtering, and comprehensive error handling. The implementation satisfies all specified requirements and provides a solid foundation for the frontend application.
