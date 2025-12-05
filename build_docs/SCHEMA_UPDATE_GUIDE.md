# Update AppSync Schema for Unity Tables

## Current Situation

Your tables have a different schema than what the app expects:

### UnityAIAssistantLogs Table Fields:
- `log_id` (Primary Key)
- `timestamp`
- `carrier_name` ⭐ Required
- `question` ⭐ Required  
- `response` ⭐ Required
- `citation` ⭐ Required
- `chat_id`
- `session_id`
- `user_name`
- `fi_name`
- `guardrail_id`
- `guardrail_intervened`
- `model_id`
- `usr_comment`
- `usr_feedback`
- `rev_comment`
- `rev_feedback`

### userFeedback Table Fields:
- `id` (Primary Key)
- `datetime`
- `info` (Map containing: carrier, comments, feedback, question, response, session_id, username, user_name)

## Solution: Update AppSync Schema via Console

### Step 1: Open AppSync Console

1. Go to: https://console.aws.amazon.com/appsync/home?region=us-east-1
2. Click on your API: `insightsphere-dev-api`
3. Click "Schema" in the left sidebar

### Step 2: Update the Schema

Replace the entire schema with this:

```graphql
schema {
  query: Query
  mutation: Mutation
  subscription: Subscription
}

type ChatLog {
  id: ID!
  log_id: String!
  timestamp: AWSDateTime!
  carrier_name: String!
  chat_id: String
  question: String!
  response: String!
  citation: String
  fi_name: String
  guardrail_id: String
  guardrail_intervened: Boolean
  model_id: String
  session_id: String
  user_name: String
  usr_comment: String
  usr_feedback: String
  rev_comment: String
  rev_feedback: String
  
  # Mapped fields for app compatibility
  conversationId: String!
  userId: String!
  userMessage: String!
  aiResponse: String!
  metadata: AWSJSON
}

type ChatLogConnection {
  items: [ChatLog]
  nextToken: String
}

type Feedback {
  id: ID!
  datetime: AWSDateTime!
  info: FeedbackInfo!
  
  # Mapped fields for app compatibility
  logId: String!
  userId: String!
  rating: Int
  comment: String
  timestamp: AWSDateTime!
}

type FeedbackInfo {
  carrier: String
  comments: String
  feedback: String
  question: String
  response: String
  session_id: String
  type: String
  username: String
  user_name: String
}

type FeedbackConnection {
  items: [Feedback]
  nextToken: String
}

type Mutation {
  createFeedback(input: CreateFeedbackInput!): Feedback
}

type Query {
  getChatLog(log_id: String!): ChatLog
  listChatLogs(limit: Int, nextToken: String): ChatLogConnection
  getFeedback(id: ID!): Feedback
  listFeedback(limit: Int, nextToken: String): FeedbackConnection
}

type Subscription {
  onCreateFeedback: Feedback @aws_subscribe(mutations: ["createFeedback"])
}

input CreateFeedbackInput {
  info: FeedbackInfoInput!
}

input FeedbackInfoInput {
  carrier: String
  comments: String
  feedback: String
  question: String
  response: String
  session_id: String!
  type: String
  username: String!
  user_name: String
}
```

### Step 3: Update Resolvers

After saving the schema, you need to update the resolvers:

#### For `listChatLogs` Query:

1. Click on "listChatLogs" in the Resolvers section
2. Update the **Response mapping template**:

```vtl
## Map DynamoDB fields to GraphQL schema
#set($items = [])
#foreach($item in $ctx.result.items)
  #set($mappedItem = {
    "id": $item.log_id,
    "log_id": $item.log_id,
    "timestamp": $item.timestamp,
    "carrier_name": $item.carrier_name,
    "chat_id": $item.chat_id,
    "question": $item.question,
    "response": $item.response,
    "citation": $item.citation,
    "fi_name": $item.fi_name,
    "guardrail_id": $item.guardrail_id,
    "guardrail_intervened": $item.guardrail_intervened,
    "model_id": $item.model_id,
    "session_id": $item.session_id,
    "user_name": $item.user_name,
    "usr_comment": $item.usr_comment,
    "usr_feedback": $item.usr_feedback,
    "rev_comment": $item.rev_comment,
    "rev_feedback": $item.rev_feedback,
    "conversationId": $util.defaultIfNull($item.session_id, $util.defaultIfNull($item.chat_id, $item.log_id)),
    "userId": $util.defaultIfNull($item.user_name, "anonymous"),
    "userMessage": $item.question,
    "aiResponse": $item.response,
    "metadata": $util.toJson({
      "carrier_name": $item.carrier_name,
      "citation": $item.citation,
      "fi_name": $item.fi_name,
      "guardrail_id": $item.guardrail_id,
      "model_id": $item.model_id
    })
  })
  $util.qr($items.add($mappedItem))
#end

{
  "items": $util.toJson($items),
  #if($ctx.result.nextToken)
    "nextToken": "$ctx.result.nextToken"
  #end
}
```

#### For `listFeedback` Query:

1. Click on "listFeedback" in the Resolvers section
2. Update the **Response mapping template**:

```vtl
## Map DynamoDB fields to GraphQL schema
#set($items = [])
#foreach($item in $ctx.result.items)
  #set($mappedItem = {
    "id": $item.id,
    "datetime": $item.datetime,
    "info": $item.info,
    "logId": $util.defaultIfNull($item.info.session_id, $item.id),
    "userId": $util.defaultIfNull($item.info.username, $util.defaultIfNull($item.info.user_name, "anonymous")),
    "rating": 0,
    "comment": $util.defaultIfNull($item.info.comments, $util.defaultIfNull($item.info.feedback, "")),
    "timestamp": $item.datetime
  })
  $util.qr($items.add($mappedItem))
#end

{
  "items": $util.toJson($items),
  #if($ctx.result.nextToken)
    "nextToken": "$ctx.result.nextToken"
  #end
}
```

### Step 4: Save and Test

1. Click "Save Resolver" for each resolver
2. Test in the AppSync Queries console:

```graphql
query TestListChatLogs {
  listChatLogs(limit: 10) {
    items {
      id
      carrier_name
      question
      response
      citation
      timestamp
    }
  }
}
```

## Alternative: Simpler Approach

If updating the schema is too complex, I can create a Lambda resolver that transforms the data. This would be easier but adds a Lambda function.

Would you like me to:
1. Create detailed step-by-step screenshots guide for console updates?
2. Create a Lambda function to transform the data?
3. Create a script to automate the resolver updates?

## Quick Test

To verify the tables are accessible, run:

```bash
# Test ChatLogs table
aws dynamodb scan --table-name UnityAIAssistantLogs --limit 1 --region us-east-1

# Test Feedback table
aws dynamodb scan --table-name userFeedback --limit 1 --region us-east-1
```

This will show if the data is accessible and confirm the schema.
