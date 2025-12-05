# API Documentation - Chat Logs Review System

This document provides comprehensive documentation for the GraphQL API used by the Chat Logs Review System.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [GraphQL Endpoint](#graphql-endpoint)
- [Types](#types)
- [Queries](#queries)
- [Mutations](#mutations)
- [Subscriptions](#subscriptions)
- [Filters](#filters)
- [Pagination](#pagination)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Examples](#examples)

## Overview

The Chat Logs Review System uses AWS AppSync to provide a GraphQL API for accessing and updating chat logs and feedback data stored in DynamoDB.

### API Features

- **Real-time Updates**: GraphQL subscriptions for live data
- **Flexible Queries**: Filter, sort, and paginate results
- **Type Safety**: Strongly typed schema
- **Authentication**: Cognito JWT token-based auth
- **Efficient**: Field-level data fetching

### Base URL

```
https://<api-id>.appsync-api.<region>.amazonaws.com/graphql
```

Replace `<api-id>` and `<region>` with your AppSync API ID and AWS region.

## Authentication

All API requests require authentication using AWS Cognito JWT tokens.

### Authentication Flow

1. User signs in via Cognito Hosted UI
2. Cognito returns JWT tokens (ID token, access token, refresh token)
3. Include ID token in API requests

### Request Headers

```http
POST /graphql HTTP/1.1
Host: <api-id>.appsync-api.<region>.amazonaws.com
Content-Type: application/json
Authorization: Bearer <id-token>
```

### Token Expiration

- **ID Token**: 1 hour
- **Access Token**: 1 hour
- **Refresh Token**: 30 days

Use the refresh token to obtain new tokens when they expire.

## GraphQL Endpoint

### HTTP Method

```
POST /graphql
```

### Request Format

```json
{
  "query": "query { ... }",
  "variables": { ... },
  "operationName": "OperationName"
}
```

### Response Format

```json
{
  "data": { ... },
  "errors": [ ... ]
}
```

## Types

### UnityAIAssistantLog

Represents a chat log entry from the Unity AI Assistant.

```graphql
type UnityAIAssistantLog {
  log_id: ID!                      # Unique log identifier
  timestamp: String!                # ISO 8601 timestamp
  carrier_name: String!             # Carrier name
  chat_id: String                   # Chat session ID
  citation: String                  # Source citation
  fi_name: String                   # FI name
  guardrail_id: String              # Guardrail identifier
  guardrail_intervened: Boolean     # Whether guardrail intervened
  model_id: String                  # AI model identifier
  question: String!                 # User question
  response: String!                 # AI response
  rev_comment: String               # Reviewer comment
  rev_feedback: String              # Reviewer feedback
  session_id: String                # Session identifier
  user_name: String                 # User name
  usr_comment: String               # User comment
  usr_feedback: String              # User feedback
}
```

### UserFeedback

Represents user feedback on AI responses.

```graphql
type UserFeedback {
  id: ID!                          # Unique feedback identifier
  datetime: String!                 # ISO 8601 datetime
  carrier: String!                  # Carrier name
  comments: String                  # User comments
  feedback: String                  # User feedback
  question: String                  # Original question
  response: String                  # AI response
  session_id: String                # Session identifier
  type: String                      # Feedback type
  username: String                  # Username
  user_name: String                 # User display name
  rev_comment: String               # Reviewer comment
  rev_feedback: String              # Reviewer feedback
}
```

### ReviewMetrics

Aggregated metrics for review progress.

```graphql
type ReviewMetrics {
  totalChatLogs: Int!              # Total chat logs count
  reviewedChatLogs: Int!           # Reviewed chat logs count
  pendingChatLogs: Int!            # Pending chat logs count
  totalFeedbackLogs: Int!          # Total feedback logs count
  reviewedFeedbackLogs: Int!       # Reviewed feedback logs count
  pendingFeedbackLogs: Int!        # Pending feedback logs count
}
```

### Connection Types

For paginated results:

```graphql
type UnityAIAssistantLogConnection {
  items: [UnityAIAssistantLog]     # Array of log entries
  nextToken: String                 # Pagination token
}

type UserFeedbackConnection {
  items: [UserFeedback]            # Array of feedback entries
  nextToken: String                 # Pagination token
}
```

## Queries

### getUnityAIAssistantLog

Retrieve a single chat log by ID.

**Signature**:
```graphql
getUnityAIAssistantLog(log_id: ID!): UnityAIAssistantLog
```

**Parameters**:
- `log_id` (required): The unique log identifier

**Example**:
```graphql
query GetChatLog {
  getUnityAIAssistantLog(log_id: "log-123") {
    log_id
    timestamp
    carrier_name
    question
    response
    rev_comment
    rev_feedback
  }
}
```

**Response**:
```json
{
  "data": {
    "getUnityAIAssistantLog": {
      "log_id": "log-123",
      "timestamp": "2024-12-05T10:30:00Z",
      "carrier_name": "CarrierA",
      "question": "What is the weather?",
      "response": "The weather is sunny.",
      "rev_comment": "Good response",
      "rev_feedback": "Accurate"
    }
  }
}
```

### listUnityAIAssistantLogs

Retrieve a paginated list of chat logs with optional filtering.

**Signature**:
```graphql
listUnityAIAssistantLogs(
  filter: ModelUnityAIAssistantLogFilterInput
  limit: Int
  nextToken: String
): UnityAIAssistantLogConnection
```

**Parameters**:
- `filter` (optional): Filter criteria
- `limit` (optional): Maximum number of results (default: 50, max: 100)
- `nextToken` (optional): Pagination token from previous response

**Example**:
```graphql
query ListChatLogs {
  listUnityAIAssistantLogs(
    filter: {
      carrier_name: { eq: "CarrierA" }
    }
    limit: 20
  ) {
    items {
      log_id
      timestamp
      carrier_name
      question
      response
    }
    nextToken
  }
}
```

**Response**:
```json
{
  "data": {
    "listUnityAIAssistantLogs": {
      "items": [
        {
          "log_id": "log-123",
          "timestamp": "2024-12-05T10:30:00Z",
          "carrier_name": "CarrierA",
          "question": "What is the weather?",
          "response": "The weather is sunny."
        }
      ],
      "nextToken": "eyJ2ZXJzaW9uIjoxLCJ0b2tlbiI6IkFRSUNBSGk..."
    }
  }
}
```

### getUserFeedback

Retrieve a single feedback entry by ID.

**Signature**:
```graphql
getUserFeedback(id: ID!): UserFeedback
```

**Parameters**:
- `id` (required): The unique feedback identifier

**Example**:
```graphql
query GetFeedback {
  getUserFeedback(id: "feedback-456") {
    id
    datetime
    carrier
    comments
    feedback
    rev_comment
    rev_feedback
  }
}
```

### listUserFeedbacks

Retrieve a paginated list of feedback entries with optional filtering.

**Signature**:
```graphql
listUserFeedbacks(
  filter: ModelUserFeedbackFilterInput
  limit: Int
  nextToken: String
): UserFeedbackConnection
```

**Parameters**:
- `filter` (optional): Filter criteria
- `limit` (optional): Maximum number of results (default: 50, max: 100)
- `nextToken` (optional): Pagination token from previous response

**Example**:
```graphql
query ListFeedback {
  listUserFeedbacks(
    filter: {
      carrier: { eq: "CarrierB" }
    }
    limit: 20
  ) {
    items {
      id
      datetime
      carrier
      comments
      feedback
    }
    nextToken
  }
}
```

### getReviewMetrics

Retrieve aggregated review metrics for dashboard.

**Signature**:
```graphql
getReviewMetrics: ReviewMetrics
```

**Parameters**: None

**Example**:
```graphql
query GetMetrics {
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

**Response**:
```json
{
  "data": {
    "getReviewMetrics": {
      "totalChatLogs": 1000,
      "reviewedChatLogs": 750,
      "pendingChatLogs": 250,
      "totalFeedbackLogs": 500,
      "reviewedFeedbackLogs": 400,
      "pendingFeedbackLogs": 100
    }
  }
}
```

## Mutations

### updateUnityAIAssistantLog

Update review fields for a chat log entry.

**Signature**:
```graphql
updateUnityAIAssistantLog(
  input: UpdateUnityAIAssistantLogInput!
): UnityAIAssistantLog
```

**Input Type**:
```graphql
input UpdateUnityAIAssistantLogInput {
  log_id: ID!                      # Required: Log ID to update
  rev_comment: String              # Optional: Reviewer comment
  rev_feedback: String             # Optional: Reviewer feedback
}
```

**Example**:
```graphql
mutation UpdateChatLog {
  updateUnityAIAssistantLog(input: {
    log_id: "log-123"
    rev_comment: "Excellent response quality"
    rev_feedback: "Accurate and helpful"
  }) {
    log_id
    rev_comment
    rev_feedback
    timestamp
  }
}
```

**Response**:
```json
{
  "data": {
    "updateUnityAIAssistantLog": {
      "log_id": "log-123",
      "rev_comment": "Excellent response quality",
      "rev_feedback": "Accurate and helpful",
      "timestamp": "2024-12-05T10:30:00Z"
    }
  }
}
```

### updateUserFeedback

Update review fields for a feedback entry.

**Signature**:
```graphql
updateUserFeedback(
  input: UpdateUserFeedbackInput!
): UserFeedback
```

**Input Type**:
```graphql
input UpdateUserFeedbackInput {
  id: ID!                          # Required: Feedback ID to update
  rev_comment: String              # Optional: Reviewer comment
  rev_feedback: String             # Optional: Reviewer feedback
}
```

**Example**:
```graphql
mutation UpdateFeedback {
  updateUserFeedback(input: {
    id: "feedback-456"
    rev_comment: "Valid user concern"
    rev_feedback: "Needs follow-up"
  }) {
    id
    rev_comment
    rev_feedback
    datetime
  }
}
```

## Subscriptions

### onUpdateUnityAIAssistantLog

Subscribe to real-time updates for chat logs.

**Signature**:
```graphql
onUpdateUnityAIAssistantLog(log_id: ID): UnityAIAssistantLog
  @aws_subscribe(mutations: ["updateUnityAIAssistantLog"])
```

**Parameters**:
- `log_id` (optional): Subscribe to specific log ID only

**Example**:
```graphql
subscription OnChatLogUpdate {
  onUpdateUnityAIAssistantLog {
    log_id
    rev_comment
    rev_feedback
    timestamp
  }
}
```

### onUpdateUserFeedback

Subscribe to real-time updates for feedback entries.

**Signature**:
```graphql
onUpdateUserFeedback(id: ID): UserFeedback
  @aws_subscribe(mutations: ["updateUserFeedback"])
```

**Parameters**:
- `id` (optional): Subscribe to specific feedback ID only

**Example**:
```graphql
subscription OnFeedbackUpdate {
  onUpdateUserFeedback {
    id
    rev_comment
    rev_feedback
    datetime
  }
}
```

## Filters

### ModelStringInput

Filter for string fields:

```graphql
input ModelStringInput {
  eq: String                       # Equals
  ne: String                       # Not equals
  contains: String                 # Contains substring
  notContains: String              # Does not contain substring
  beginsWith: String               # Begins with prefix
}
```

**Example**:
```graphql
filter: {
  carrier_name: { eq: "CarrierA" }
}
```

### ModelIDInput

Filter for ID fields:

```graphql
input ModelIDInput {
  eq: ID                           # Equals
  ne: ID                           # Not equals
  contains: ID                     # Contains substring
  notContains: ID                  # Does not contain substring
  beginsWith: ID                   # Begins with prefix
}
```

### Logical Operators

Combine filters with logical operators:

```graphql
input ModelUnityAIAssistantLogFilterInput {
  log_id: ModelIDInput
  carrier_name: ModelStringInput
  timestamp: ModelStringInput
  and: [ModelUnityAIAssistantLogFilterInput]
  or: [ModelUnityAIAssistantLogFilterInput]
  not: ModelUnityAIAssistantLogFilterInput
}
```

**Example - AND**:
```graphql
filter: {
  and: [
    { carrier_name: { eq: "CarrierA" } }
    { timestamp: { beginsWith: "2024-12" } }
  ]
}
```

**Example - OR**:
```graphql
filter: {
  or: [
    { carrier_name: { eq: "CarrierA" } }
    { carrier_name: { eq: "CarrierB" } }
  ]
}
```

**Example - NOT**:
```graphql
filter: {
  not: {
    carrier_name: { eq: "CarrierA" }
  }
}
```

## Pagination

### Forward Pagination

Use `nextToken` to fetch subsequent pages:

```graphql
# First page
query FirstPage {
  listUnityAIAssistantLogs(limit: 20) {
    items { log_id }
    nextToken
  }
}

# Second page
query SecondPage {
  listUnityAIAssistantLogs(
    limit: 20
    nextToken: "eyJ2ZXJzaW9uIjoxLCJ0b2tlbiI6IkFRSUNBSGk..."
  ) {
    items { log_id }
    nextToken
  }
}
```

### Pagination Best Practices

1. **Limit**: Use reasonable page sizes (20-50 items)
2. **Token Storage**: Store `nextToken` for next page
3. **End Detection**: `nextToken` is `null` when no more pages
4. **Consistency**: Use same filter/sort for all pages

## Error Handling

### Error Response Format

```json
{
  "errors": [
    {
      "message": "Error message",
      "errorType": "ErrorType",
      "path": ["fieldName"],
      "locations": [{ "line": 2, "column": 3 }]
    }
  ]
}
```

### Common Error Types

#### Unauthorized

```json
{
  "errors": [
    {
      "message": "Unauthorized",
      "errorType": "Unauthorized"
    }
  ]
}
```

**Cause**: Missing or invalid authentication token

**Solution**: Ensure valid JWT token in Authorization header

#### ValidationError

```json
{
  "errors": [
    {
      "message": "Variable 'log_id' has an invalid value",
      "errorType": "ValidationError"
    }
  ]
}
```

**Cause**: Invalid input parameters

**Solution**: Verify input matches schema types

#### DynamoDbException

```json
{
  "errors": [
    {
      "message": "DynamoDB operation failed",
      "errorType": "DynamoDbException"
    }
  ]
}
```

**Cause**: Database operation error

**Solution**: Check CloudWatch logs, verify table exists

#### LambdaException

```json
{
  "errors": [
    {
      "message": "Lambda invocation failed",
      "errorType": "LambdaException"
    }
  ]
}
```

**Cause**: Lambda function error

**Solution**: Check Lambda logs in CloudWatch

## Rate Limiting

### Default Limits

- **Queries**: 1000 requests per second
- **Mutations**: 500 requests per second
- **Subscriptions**: 100 concurrent connections

### Throttling Response

```json
{
  "errors": [
    {
      "message": "Rate exceeded",
      "errorType": "ThrottlingException"
    }
  ]
}
```

### Best Practices

1. Implement exponential backoff
2. Cache query results
3. Use subscriptions for real-time updates
4. Batch operations when possible

## Examples

### Complete Query Example

```javascript
// Using fetch API
const query = `
  query ListRecentLogs {
    listUnityAIAssistantLogs(
      filter: {
        timestamp: { beginsWith: "2024-12" }
      }
      limit: 10
    ) {
      items {
        log_id
        timestamp
        carrier_name
        question
        response
        rev_comment
      }
      nextToken
    }
  }
`;

const response = await fetch(GRAPHQL_ENDPOINT, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${idToken}`
  },
  body: JSON.stringify({ query })
});

const data = await response.json();
console.log(data.data.listUnityAIAssistantLogs);
```

### Complete Mutation Example

```javascript
// Using fetch API
const mutation = `
  mutation ReviewChatLog($input: UpdateUnityAIAssistantLogInput!) {
    updateUnityAIAssistantLog(input: $input) {
      log_id
      rev_comment
      rev_feedback
    }
  }
`;

const variables = {
  input: {
    log_id: "log-123",
    rev_comment: "Excellent response",
    rev_feedback: "Accurate and helpful"
  }
};

const response = await fetch(GRAPHQL_ENDPOINT, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${idToken}`
  },
  body: JSON.stringify({ query: mutation, variables })
});

const data = await response.json();
console.log(data.data.updateUnityAIAssistantLog);
```

### Subscription Example

```javascript
// Using AWS Amplify
import { API, graphqlOperation } from 'aws-amplify';

const subscription = `
  subscription OnLogUpdate {
    onUpdateUnityAIAssistantLog {
      log_id
      rev_comment
      rev_feedback
    }
  }
`;

const sub = API.graphql(graphqlOperation(subscription)).subscribe({
  next: ({ value }) => {
    console.log('Log updated:', value.data.onUpdateUnityAIAssistantLog);
  },
  error: (error) => {
    console.error('Subscription error:', error);
  }
});

// Unsubscribe when done
sub.unsubscribe();
```

## Testing the API

### Using GraphQL Playground

1. Go to AppSync Console
2. Select your API
3. Click "Queries" in left sidebar
4. Use built-in GraphQL explorer

### Using curl

```bash
# Query example
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"query":"{ getReviewMetrics { totalChatLogs } }"}' \
  https://YOUR_API_ID.appsync-api.us-east-1.amazonaws.com/graphql

# Mutation example
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"query":"mutation { updateUnityAIAssistantLog(input: {log_id: \"log-123\", rev_comment: \"Good\"}) { log_id } }"}' \
  https://YOUR_API_ID.appsync-api.us-east-1.amazonaws.com/graphql
```

### Using Postman

1. Create new POST request
2. Set URL to GraphQL endpoint
3. Add headers:
   - `Content-Type: application/json`
   - `Authorization: Bearer YOUR_JWT_TOKEN`
4. Set body to raw JSON:
   ```json
   {
     "query": "{ getReviewMetrics { totalChatLogs } }"
   }
   ```
5. Send request

## Additional Resources

- [AWS AppSync Documentation](https://docs.aws.amazon.com/appsync/)
- [GraphQL Specification](https://graphql.org/learn/)
- [AWS Amplify GraphQL Guide](https://docs.amplify.aws/lib/graphqlapi/getting-started/)

---

**Last Updated**: December 2024  
**Version**: 1.0.0
