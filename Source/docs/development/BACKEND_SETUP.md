# AWS Backend Setup Guide

This guide walks you through setting up the AWS Amplify backend for InsightSphere Dashboard.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Backend Configuration](#backend-configuration)
4. [Deployment](#deployment)
5. [Post-Deployment Configuration](#post-deployment-configuration)
6. [Verification](#verification)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Tools

1. **Node.js and npm** (v18 or later)
   ```bash
   node --version
   npm --version
   ```

2. **AWS CLI** (v2 or later)
   ```bash
   aws --version
   ```
   
   Install from: https://aws.amazon.com/cli/

3. **Amplify CLI** (v14 or later)
   ```bash
   npm install -g @aws-amplify/cli
   amplify --version
   ```

### AWS Account Setup

1. **Create an AWS Account** (if you don't have one)
   - Go to https://aws.amazon.com/
   - Sign up for a new account

2. **Configure AWS CLI**
   ```bash
   aws configure
   ```
   
   You'll need:
   - AWS Access Key ID
   - AWS Secret Access Key
   - Default region (e.g., `us-east-1`)
   - Default output format (e.g., `json`)

3. **Configure Amplify CLI**
   ```bash
   amplify configure
   ```
   
   This will:
   - Open AWS Console in your browser
   - Guide you through creating an IAM user
   - Set up local credentials

## Initial Setup

### 1. Clone and Install Dependencies

```bash
# Navigate to project directory
cd ai_metrics_portal

# Install dependencies
npm install
```

### 2. Review Backend Configuration

The backend configuration is already set up in the `amplify/` directory:

- **Authentication**: Cognito User Pool with email-based login
- **API**: AppSync GraphQL API with ChatLog and Feedback models
- **Storage**: S3 bucket for CSV exports
- **Database**: DynamoDB tables with GSI indexes

## Backend Configuration

### GraphQL Schema

The schema is defined in `amplify/backend/api/insightsphere/schema.graphql`:

```graphql
# ChatLog - Read-only access
type ChatLog @model @auth(rules: [{ allow: private, operations: [read] }]) {
  id: ID!
  conversationId: String! @index(name: "byConversation", sortKeyFields: ["timestamp"])
  userId: String! @index(name: "byUser", sortKeyFields: ["timestamp"])
  timestamp: AWSDateTime!
  userMessage: String!
  aiResponse: String!
  responseTime: Int!
  accuracy: Float
  sentiment: String
  feedback: [Feedback] @hasMany(indexName: "byLogId", fields: ["id"])
}

# Feedback - Full access
type Feedback @model @auth(rules: [{ allow: private }]) {
  id: ID!
  logId: ID! @index(name: "byLogId", sortKeyFields: ["timestamp"])
  userId: String! @index(name: "byUser", sortKeyFields: ["timestamp"])
  rating: Int!
  thumbsUp: Boolean!
  comment: String
  timestamp: AWSDateTime!
  category: String
  chatLog: ChatLog @belongsTo(fields: ["logId"])
}
```

### DynamoDB Tables

**ChatLog Table:**
- Primary Key: `id`
- GSI 1: `byConversation` (conversationId + timestamp)
- GSI 2: `byUser` (userId + timestamp)
- Access: Read-only for authenticated users

**Feedback Table:**
- Primary Key: `id`
- GSI 1: `byLogId` (logId + timestamp)
- GSI 2: `byUser` (userId + timestamp)
- Access: Full CRUD for authenticated users

### Authentication

**Cognito User Pool:**
- Email-based authentication
- Password policy: 8+ characters, uppercase, lowercase, numbers
- Email verification enabled
- User groups: `admin`, `viewer`

### Storage

**S3 Bucket:**
- Private access per user
- Path structure: `private/{cognito-identity-id}/*`
- Server-side encryption enabled
- CORS configured for web access

## Deployment

### Option 1: Using PowerShell Script (Recommended for Windows)

```powershell
# Run the deployment script
.\scripts\deploy-backend.ps1
```

Select option 6 for full deployment (init + push).

### Option 2: Manual Deployment

#### Step 1: Initialize Amplify

```bash
amplify init
```

Answer the prompts:
- **Enter a name for the project**: `insightsphere`
- **Enter a name for the environment**: `dev`
- **Choose your default editor**: (your preference)
- **Choose the type of app**: `javascript`
- **What javascript framework**: `react`
- **Source Directory Path**: `src`
- **Distribution Directory Path**: `dist`
- **Build Command**: `npm run build`
- **Start Command**: `npm run dev`
- **Do you want to use an AWS profile?**: `Yes`
- **Please choose the profile**: (select your AWS profile)

#### Step 2: Push Backend to AWS

```bash
amplify push
```

This will:
1. Show you a summary of resources to be created
2. Ask if you want to continue (select `Yes`)
3. Create all AWS resources (takes 5-10 minutes)
4. Generate configuration files

#### Step 3: Generate GraphQL Code (Optional)

```bash
amplify codegen
```

This generates TypeScript types from your GraphQL schema.

## Post-Deployment Configuration

### 1. Update Environment Variables

After deployment, Amplify will output configuration values. Update your `.env` file:

```env
VITE_AWS_REGION=us-east-1
VITE_AWS_USER_POOL_ID=us-east-1_XXXXXXXXX
VITE_AWS_USER_POOL_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_AWS_GRAPHQL_ENDPOINT=https://XXXXXXXXXXXXXXXXXXXXXXXXXX.appsync-api.us-east-1.amazonaws.com/graphql
VITE_AWS_S3_BUCKET=insightsphere-exports-dev-XXXXXXXXX
VITE_ENV=development
```

### 2. Create User Groups

```bash
# Open Cognito Console
amplify auth console
```

In the AWS Console:
1. Navigate to your User Pool
2. Go to "Groups" tab
3. Create two groups:
   - **admin**: Full access to all features
   - **viewer**: Read-only access

### 3. Create Test Users

```bash
# Create a test user
aws cognito-idp admin-create-user \
  --user-pool-id <YOUR_USER_POOL_ID> \
  --username testuser@example.com \
  --user-attributes Name=email,Value=testuser@example.com \
  --temporary-password TempPass123!

# Add user to admin group
aws cognito-idp admin-add-user-to-group \
  --user-pool-id <YOUR_USER_POOL_ID> \
  --username testuser@example.com \
  --group-name admin
```

### 4. Populate ChatLog Table (Optional)

If you need test data, you can manually add entries to the ChatLog table:

```bash
# Open DynamoDB Console
aws dynamodb put-item \
  --table-name ChatLog-<API_ID>-dev \
  --item '{
    "id": {"S": "log-001"},
    "conversationId": {"S": "conv-001"},
    "userId": {"S": "user-001"},
    "timestamp": {"S": "2024-01-01T12:00:00Z"},
    "userMessage": {"S": "Hello, how are you?"},
    "aiResponse": {"S": "I am doing well, thank you!"},
    "responseTime": {"N": "250"},
    "accuracy": {"N": "95"},
    "sentiment": {"S": "positive"}
  }'
```

## Verification

### Using PowerShell Script

```powershell
.\scripts\verify-backend.ps1
```

This will check:
- Environment variables configuration
- Cognito User Pool accessibility
- S3 Bucket accessibility
- AppSync API accessibility
- DynamoDB tables existence

### Manual Verification

#### 1. Check Amplify Status

```bash
amplify status
```

Should show all resources as deployed.

#### 2. Test GraphQL API

```bash
# Open AppSync Console
amplify api console
```

Try running a query in the GraphQL explorer:

```graphql
query ListChatLogs {
  listChatLogs(limit: 10) {
    items {
      id
      conversationId
      userId
      timestamp
      userMessage
    }
  }
}
```

#### 3. Test Authentication

```bash
# Open Cognito Console
amplify auth console
```

Verify:
- User Pool exists
- User groups are created
- Test users are present

#### 4. Test S3 Bucket

```bash
aws s3 ls s3://<YOUR_BUCKET_NAME>
```

Should list the bucket contents (empty initially).

### 5. Run the Application

```bash
npm run dev
```

Navigate to `http://localhost:5173` and test:
- Login with test user credentials
- View chat logs (if data exists)
- Submit feedback
- Export CSV

## Troubleshooting

### Common Issues

#### 1. "Amplify CLI not found"

**Solution:**
```bash
npm install -g @aws-amplify/cli
```

#### 2. "AWS credentials not configured"

**Solution:**
```bash
aws configure
amplify configure
```

#### 3. "GraphQL schema validation failed"

**Solution:**
- Check `amplify/backend/api/insightsphere/schema.graphql` for syntax errors
- Run `amplify api gql-compile` to validate schema

#### 4. "DynamoDB table not found"

**Solution:**
- Ensure `amplify push` completed successfully
- Check AWS Console for table creation
- Verify table names match expected pattern

#### 5. "S3 bucket access denied"

**Solution:**
- Check IAM permissions for authenticated role
- Verify CORS configuration in S3 bucket
- Ensure user is authenticated

#### 6. "AppSync API returns 401 Unauthorized"

**Solution:**
- Verify JWT token is valid
- Check authentication rules in GraphQL schema
- Ensure user is in correct Cognito group

### Getting Help

1. **Check Amplify Logs**
   ```bash
   amplify diagnose
   ```

2. **View CloudWatch Logs**
   - Go to AWS Console → CloudWatch → Log Groups
   - Look for logs related to AppSync, Lambda, or Cognito

3. **Amplify Documentation**
   - https://docs.amplify.aws/

4. **AWS Support**
   - https://aws.amazon.com/support/

## Cleanup

To remove all backend resources:

```bash
amplify delete
```

**Warning:** This will permanently delete:
- Cognito User Pool (all users)
- DynamoDB tables (all data)
- S3 bucket (all files)
- AppSync API

Make sure to backup any important data before running this command.

## Next Steps

After successful backend setup:

1. ✅ Backend deployed and verified
2. ⏭️ Implement authentication UI (Task 4)
3. ⏭️ Create API service layer (Task 5)
4. ⏭️ Build dashboard components (Tasks 6-27)

## Additional Resources

- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [AppSync GraphQL API](https://docs.aws.amazon.com/appsync/)
- [Cognito User Pools](https://docs.aws.amazon.com/cognito/)
- [DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)
- [S3 Security Best Practices](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html)
