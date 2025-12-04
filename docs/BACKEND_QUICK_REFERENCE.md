# Backend Quick Reference

Quick commands and configurations for InsightSphere AWS backend.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Deploy backend (Windows)
.\scripts\deploy-backend.ps1

# 3. Verify backend (Windows)
.\scripts\verify-backend.ps1

# 4. Start development server
npm run dev
```

## Amplify Commands

```bash
# Initialize project
amplify init

# Deploy/update backend
amplify push

# Check status
amplify status

# Open AWS Console
amplify console

# Generate GraphQL code
amplify codegen

# View backend details
amplify env list
amplify env get --name dev

# Delete backend
amplify delete
```

## AWS CLI Commands

### Cognito

```bash
# List user pools
aws cognito-idp list-user-pools --max-results 10

# Describe user pool
aws cognito-idp describe-user-pool --user-pool-id <USER_POOL_ID>

# Create user
aws cognito-idp admin-create-user \
  --user-pool-id <USER_POOL_ID> \
  --username user@example.com \
  --user-attributes Name=email,Value=user@example.com

# Add user to group
aws cognito-idp admin-add-user-to-group \
  --user-pool-id <USER_POOL_ID> \
  --username user@example.com \
  --group-name admin

# List users
aws cognito-idp list-users --user-pool-id <USER_POOL_ID>
```

### DynamoDB

```bash
# List tables
aws dynamodb list-tables

# Describe table
aws dynamodb describe-table --table-name <TABLE_NAME>

# Scan table (get all items)
aws dynamodb scan --table-name <TABLE_NAME> --limit 10

# Query by GSI
aws dynamodb query \
  --table-name <TABLE_NAME> \
  --index-name byConversation \
  --key-condition-expression "conversationId = :convId" \
  --expression-attribute-values '{":convId":{"S":"conv-001"}}'

# Put item
aws dynamodb put-item \
  --table-name <TABLE_NAME> \
  --item file://item.json
```

### S3

```bash
# List buckets
aws s3 ls

# List bucket contents
aws s3 ls s3://<BUCKET_NAME>

# Upload file
aws s3 cp file.csv s3://<BUCKET_NAME>/private/<USER_ID>/

# Download file
aws s3 cp s3://<BUCKET_NAME>/private/<USER_ID>/file.csv ./

# Generate presigned URL
aws s3 presign s3://<BUCKET_NAME>/private/<USER_ID>/file.csv --expires-in 3600
```

### AppSync

```bash
# List GraphQL APIs
aws appsync list-graphql-apis

# Get GraphQL API
aws appsync get-graphql-api --api-id <API_ID>

# Get schema
aws appsync get-introspection-schema \
  --api-id <API_ID> \
  --format SDL \
  schema.graphql
```

## Environment Variables

```env
# Required variables
VITE_AWS_REGION=us-east-1
VITE_AWS_USER_POOL_ID=us-east-1_XXXXXXXXX
VITE_AWS_USER_POOL_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_AWS_GRAPHQL_ENDPOINT=https://XXXXXXXXX.appsync-api.us-east-1.amazonaws.com/graphql
VITE_AWS_S3_BUCKET=insightsphere-exports-dev-XXXXXXXXX
VITE_ENV=development
```

## GraphQL Queries

### List Chat Logs

```graphql
query ListChatLogs {
  listChatLogs(limit: 50) {
    items {
      id
      conversationId
      userId
      timestamp
      userMessage
      aiResponse
      responseTime
      accuracy
      sentiment
    }
    nextToken
  }
}
```

### Query by Conversation

```graphql
query ChatLogsByConversation($conversationId: String!) {
  chatLogsByConversation(conversationId: $conversationId, limit: 50) {
    items {
      id
      timestamp
      userMessage
      aiResponse
    }
    nextToken
  }
}
```

### Create Feedback

```graphql
mutation CreateFeedback($input: CreateFeedbackInput!) {
  createFeedback(input: $input) {
    id
    logId
    userId
    rating
    thumbsUp
    comment
    timestamp
  }
}
```

### List Feedback

```graphql
query ListFeedback {
  listFeedback(limit: 50) {
    items {
      id
      logId
      userId
      rating
      thumbsUp
      comment
      timestamp
      category
    }
    nextToken
  }
}
```

### Subscribe to New Feedback

```graphql
subscription OnCreateFeedback {
  onCreateFeedback {
    id
    logId
    userId
    rating
    thumbsUp
    comment
    timestamp
  }
}
```

## Resource Names

### Naming Patterns

- **User Pool**: `insightsphere-user-pool-<env>`
- **User Pool Client**: `insightsphere-client-<env>`
- **GraphQL API**: `insightsphere-<env>`
- **DynamoDB Tables**: 
  - `ChatLog-<api-id>-<env>`
  - `Feedback-<api-id>-<env>`
- **S3 Bucket**: `insightsphere-exports-<env>-<random>`

### User Groups

- `admin`: Full access to all features
- `viewer`: Read-only access

## Common Tasks

### Add Test Data

```bash
# Create sample chat log
aws dynamodb put-item \
  --table-name ChatLog-<API_ID>-dev \
  --item '{
    "id": {"S": "log-001"},
    "conversationId": {"S": "conv-001"},
    "userId": {"S": "user-001"},
    "timestamp": {"S": "2024-01-01T12:00:00Z"},
    "userMessage": {"S": "Test message"},
    "aiResponse": {"S": "Test response"},
    "responseTime": {"N": "250"}
  }'
```

### Reset User Password

```bash
aws cognito-idp admin-set-user-password \
  --user-pool-id <USER_POOL_ID> \
  --username user@example.com \
  --password NewPassword123! \
  --permanent
```

### Export DynamoDB Table

```bash
# Scan and save to file
aws dynamodb scan \
  --table-name <TABLE_NAME> \
  --output json > table-backup.json
```

### Import DynamoDB Table

```bash
# Batch write from file
aws dynamodb batch-write-item \
  --request-items file://table-backup.json
```

## Monitoring

### CloudWatch Logs

```bash
# List log groups
aws logs describe-log-groups

# Tail logs
aws logs tail /aws/appsync/apis/<API_ID> --follow

# Query logs
aws logs filter-log-events \
  --log-group-name /aws/appsync/apis/<API_ID> \
  --filter-pattern "ERROR"
```

### Metrics

```bash
# Get DynamoDB metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/DynamoDB \
  --metric-name ConsumedReadCapacityUnits \
  --dimensions Name=TableName,Value=<TABLE_NAME> \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-02T00:00:00Z \
  --period 3600 \
  --statistics Sum
```

## Troubleshooting

### Check Amplify Status

```bash
amplify status
amplify diagnose
```

### View Backend Config

```bash
cat amplify/backend/backend-config.json
cat amplify/team-provider-info.json
```

### Test GraphQL API

```bash
# Using curl
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{"query":"query { listChatLogs { items { id } } }"}' \
  <GRAPHQL_ENDPOINT>
```

### Validate Schema

```bash
amplify api gql-compile
```

## Security

### IAM Policies

```bash
# View authenticated role policy
aws iam get-role-policy \
  --role-name amplify-insightsphere-dev-auth-role \
  --policy-name amplify-policy
```

### Cognito Token

```bash
# Get user token (for testing)
aws cognito-idp admin-initiate-auth \
  --user-pool-id <USER_POOL_ID> \
  --client-id <CLIENT_ID> \
  --auth-flow ADMIN_NO_SRP_AUTH \
  --auth-parameters USERNAME=user@example.com,PASSWORD=password
```

## Cost Optimization

### Check Usage

```bash
# DynamoDB table size
aws dynamodb describe-table \
  --table-name <TABLE_NAME> \
  --query 'Table.TableSizeBytes'

# S3 bucket size
aws s3 ls s3://<BUCKET_NAME> --recursive --summarize
```

### Set Billing Alerts

```bash
# Create billing alarm
aws cloudwatch put-metric-alarm \
  --alarm-name billing-alarm \
  --alarm-description "Alert when charges exceed $10" \
  --metric-name EstimatedCharges \
  --namespace AWS/Billing \
  --statistic Maximum \
  --period 21600 \
  --evaluation-periods 1 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold
```

## Useful Links

- [Amplify Console](https://console.aws.amazon.com/amplify/)
- [Cognito Console](https://console.aws.amazon.com/cognito/)
- [DynamoDB Console](https://console.aws.amazon.com/dynamodb/)
- [S3 Console](https://console.aws.amazon.com/s3/)
- [AppSync Console](https://console.aws.amazon.com/appsync/)
- [CloudWatch Console](https://console.aws.amazon.com/cloudwatch/)
