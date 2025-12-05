# AppSync Schema Fix Required

## Problem

The AppSync API schema doesn't match the actual DynamoDB table structure.

### Current AppSync Schema
```graphql
type ChatLog {
  id: ID!
  conversationId: String!
  userId: String!
  userMessage: String!
  aiResponse: String!
  timestamp: AWSDateTime!
}

type Feedback {
  id: ID!
  logId: String!
  userId: String!
  rating: Int!
  comment: String
  timestamp: AWSDateTime!
}
```

### Actual DynamoDB Table Structure

**UnityAIAssistantLogs Table:**
```json
{
  "log_id": "string",
  "timestamp": "string",
  "carrier_name": "string",
  "question": "string",
  "response": "string",
  "rev_comment": "string",
  "rev_feedback": "string",
  "user_name": "string",
  // ... more fields
}
```

**userFeedback Table:**
```json
{
  "id": "string",
  "datetime": "string",
  "info": {
    "carrier": "string",
    "feedback": "string",
    "comments": "string",
    "question": "string",
    "response": "string",
    "user_name": "string",
    "session_id": "string",
    "type": "string",
    "username": "string"
  }
}
```

## Solution Options

### Option 1: Update AppSync Schema (Recommended)

Update the CloudFormation template to create the correct schema:

```yaml
# In cloudformation/chat-logs-review-stack.yaml

GraphQLSchema:
  Type: AWS::AppSync::GraphQLSchema
  Properties:
    ApiId: !GetAtt GraphQLApi.ApiId
    Definition: |
      type UnityAIAssistantLog {
        log_id: ID!
        timestamp: String!
        carrier_name: String
        question: String
        response: String
        rev_comment: String
        rev_feedback: String
        user_name: String
        session_id: String
        chat_id: String
        citation: String
        fi_name: String
        guardrail_id: String
        guardrail_intervened: Boolean
        model_id: String
        usr_comment: String
        usr_feedback: String
      }
      
      type UserFeedback {
        id: ID!
        datetime: String!
        info: FeedbackInfo
      }
      
      type FeedbackInfo {
        carrier: String
        feedback: String
        comments: String
        question: String
        response: String
        user_name: String
        session_id: String
        type: String
        username: String
      }
      
      type UnityAIAssistantLogConnection {
        items: [UnityAIAssistantLog]
        nextToken: String
      }
      
      type UserFeedbackConnection {
        items: [UserFeedback]
        nextToken: String
      }
      
      type Query {
        listUnityAIAssistantLogs(limit: Int, nextToken: String): UnityAIAssistantLogConnection
        listUserFeedbacks(limit: Int, nextToken: String): UserFeedbackConnection
        getUnityAIAssistantLog(log_id: ID!): UnityAIAssistantLog
        getUserFeedback(id: ID!): UserFeedback
      }
      
      type Mutation {
        updateUnityAIAssistantLog(log_id: ID!, rev_comment: String, rev_feedback: String): UnityAIAssistantLog
        updateUserFeedback(id: ID!, rev_comment: String, rev_feedback: String): UserFeedback
      }
```

Then update the resolvers to match.

### Option 2: Quick Fix - Direct DynamoDB Access

Since updating AppSync requires CloudFormation changes, create a temporary service to query DynamoDB directly:

1. Install AWS SDK for DynamoDB
2. Create a DynamoDB service
3. Bypass AppSync for now

### Option 3: Use Existing AppSync with Field Mapping

Create VTL (Velocity Template Language) resolvers that map between the schema and table structure.

## Immediate Action Required

The AppSync API needs to be reconfigured to match your actual table structure. Until then, the application cannot load data.

### Steps to Fix:

1. **Update CloudFormation Template**
   - Modify `cloudformation/chat-logs-review-stack.yaml`
   - Add correct GraphQL schema
   - Add correct resolvers with field mapping

2. **Deploy Updated Stack**
   ```bash
   aws cloudformation update-stack \
     --stack-name chat-logs-review-dev \
     --template-body file://cloudformation/chat-logs-review-stack.yaml \
     --capabilities CAPABILITY_NAMED_IAM \
     --region us-east-1
   ```

3. **Update Application Code**
   - Revert to using `listUnityAIAssistantLogs` and `listUserFeedbacks`
   - Update type definitions to match new schema

## Temporary Workaround

Until the AppSync schema is fixed, you can:

1. Use AWS SDK to query DynamoDB directly
2. Create a Lambda function to act as a proxy
3. Use API Gateway + Lambda instead of AppSync

Would you like me to implement one of these solutions?
