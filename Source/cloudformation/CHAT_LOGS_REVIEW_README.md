# Chat Logs Review System - CloudFormation Infrastructure

This CloudFormation template provisions the complete AWS infrastructure for the Chat Logs Review System.

## Architecture Components

### 1. Authentication (AWS Cognito)
- **User Pool**: Manages user authentication with email-based login
- **User Pool Domain**: Provides Cognito Hosted UI for authentication
- **User Pool Client**: Web application client configuration
- **Identity Pool**: Federated identity management for AWS resource access

### 2. Database (Amazon DynamoDB)
- **UnityAIAssistantLogs Table**: Stores chat log entries
  - Primary Key: `log_id` (String)
  - GSI: `byCarrierName` - Enables efficient filtering by carrier_name
  - Attributes: timestamp, carrier_name, question, response, review fields, etc.

- **UserFeedback Table**: Stores user feedback entries
  - Primary Key: `id` (String)
  - GSI: `byCarrier` - Enables efficient filtering by carrier
  - Attributes: datetime, carrier, comments, feedback, review fields, etc.

### 3. API (AWS AppSync GraphQL)
- **GraphQL API**: Provides type-safe API for data access
- **Schema**: Defines types for UnityAIAssistantLog, UserFeedback, and ReviewMetrics
- **Resolvers**: VTL-based resolvers for queries and mutations
- **Data Sources**: DynamoDB tables and Lambda function

### 4. Compute (AWS Lambda)
- **GetReviewMetrics Function**: Calculates review metrics
  - Runtime: Python 3.11
  - Scans both DynamoDB tables
  - Calculates total, reviewed, and pending counts
  - Returns aggregated metrics for dashboard

### 5. Hosting (AWS Amplify)
- **Amplify App**: Hosts the React application
- **Branch Configuration**: Environment-specific deployments
- **Build Settings**: Automated CI/CD pipeline
- **Environment Variables**: Injected during build

### 6. IAM Roles and Policies
- **AppSyncServiceRole**: Allows AppSync to access DynamoDB and Lambda
- **LambdaExecutionRole**: Allows Lambda to read from DynamoDB
- **AuthenticatedRole**: Allows authenticated users to call AppSync
- **UnauthenticatedRole**: Denies all access for unauthenticated users
- **AmplifyServiceRole**: Allows Amplify to build and deploy

## Parameters

| Parameter | Description | Default | Allowed Values |
|-----------|-------------|---------|----------------|
| EnvironmentName | Environment name | dev | dev, staging, prod |
| ProjectName | Project name for resource naming | chat-logs-review | - |
| CognitoDomainPrefix | Unique domain prefix for Cognito | - | lowercase, numbers, hyphens |

## Prerequisites

1. **AWS Account**: Active AWS account with appropriate permissions
2. **AWS CLI**: Installed and configured with credentials
3. **GitHub Token** (Optional): For Amplify integration
   - Store in AWS Secrets Manager as `github-token`
   - Or remove Amplify resources if deploying manually

## Deployment

### Option 1: AWS Console

1. Navigate to CloudFormation in AWS Console
2. Click "Create Stack" → "With new resources"
3. Upload `chat-logs-review-stack.yaml`
4. Fill in parameters:
   - EnvironmentName: `dev`, `staging`, or `prod`
   - ProjectName: `chat-logs-review` (or custom)
   - CognitoDomainPrefix: Unique prefix (e.g., `my-chat-logs-dev`)
5. Review and create stack

### Option 2: AWS CLI

```bash
aws cloudformation create-stack \
  --stack-name chat-logs-review-dev \
  --template-body file://chat-logs-review-stack.yaml \
  --parameters \
    ParameterKey=EnvironmentName,ParameterValue=dev \
    ParameterKey=ProjectName,ParameterValue=chat-logs-review \
    ParameterKey=CognitoDomainPrefix,ParameterValue=my-chat-logs-dev \
  --capabilities CAPABILITY_NAMED_IAM \
  --region us-east-1
```

### Option 3: PowerShell Script (Windows)

See `deploy.cmd` or `deploy.ps1` for automated deployment script.

## Stack Outputs

After successful deployment, the stack provides these outputs:

| Output | Description | Usage |
|--------|-------------|-------|
| UserPoolId | Cognito User Pool ID | Frontend configuration |
| UserPoolClientId | Cognito Client ID | Frontend configuration |
| IdentityPoolId | Cognito Identity Pool ID | Frontend configuration |
| CognitoDomain | Cognito Hosted UI domain | Authentication redirect |
| GraphQLApiEndpoint | AppSync API endpoint | Frontend API calls |
| GraphQLApiId | AppSync API ID | AWS Console reference |
| UnityAIAssistantLogsTableName | DynamoDB table name | Data management |
| UserFeedbackTableName | DynamoDB table name | Data management |
| GetReviewMetricsFunctionArn | Lambda function ARN | Monitoring |
| AmplifyAppId | Amplify App ID | Deployment management |
| AmplifyAppUrl | Application URL | Access the app |
| Region | AWS Region | Configuration |

## Post-Deployment Configuration

### 1. Create Admin User

```bash
aws cognito-idp admin-create-user \
  --user-pool-id <UserPoolId> \
  --username admin@example.com \
  --user-attributes Name=email,Value=admin@example.com Name=email_verified,Value=true \
  --temporary-password TempPassword123! \
  --region us-east-1
```

### 2. Update Frontend Configuration

Create `.env` file with stack outputs:

```env
VITE_AWS_REGION=us-east-1
VITE_USER_POOL_ID=<UserPoolId>
VITE_USER_POOL_CLIENT_ID=<UserPoolClientId>
VITE_IDENTITY_POOL_ID=<IdentityPoolId>
VITE_GRAPHQL_ENDPOINT=<GraphQLApiEndpoint>
VITE_COGNITO_DOMAIN=<CognitoDomain>
```

### 3. Seed Test Data (Optional)

Use AWS Console or CLI to add test data to DynamoDB tables for development.

## Monitoring and Logging

### CloudWatch Logs
- Lambda function logs: `/aws/lambda/chat-logs-review-<env>-GetReviewMetrics`
- AppSync logs: `/aws/appsync/apis/<GraphQLApiId>`

### Metrics to Monitor
- Lambda invocations and errors
- AppSync request count and latency
- DynamoDB read/write capacity
- Cognito authentication attempts

## Cost Estimation

### Development Environment (Low Usage)
- DynamoDB: $0-5/month (PAY_PER_REQUEST)
- Lambda: $0-1/month (free tier)
- AppSync: $0-5/month (free tier)
- Cognito: $0 (free tier up to 50,000 MAUs)
- Amplify: $0-5/month (build minutes)
- **Total: ~$0-15/month**

### Production Environment (Moderate Usage)
- DynamoDB: $10-50/month
- Lambda: $5-20/month
- AppSync: $10-30/month
- Cognito: $0-50/month
- Amplify: $10-30/month
- **Total: ~$35-180/month**

## Updating the Stack

```bash
aws cloudformation update-stack \
  --stack-name chat-logs-review-dev \
  --template-body file://chat-logs-review-stack.yaml \
  --parameters \
    ParameterKey=EnvironmentName,UsePreviousValue=true \
    ParameterKey=ProjectName,UsePreviousValue=true \
    ParameterKey=CognitoDomainPrefix,UsePreviousValue=true \
  --capabilities CAPABILITY_NAMED_IAM \
  --region us-east-1
```

## Deleting the Stack

```bash
aws cloudformation delete-stack \
  --stack-name chat-logs-review-dev \
  --region us-east-1
```

**Warning**: This will delete all resources including DynamoDB tables and data. Ensure you have backups if needed.

## Troubleshooting

### Stack Creation Fails

1. **CognitoDomainPrefix already exists**: Choose a different unique prefix
2. **IAM permissions**: Ensure your AWS user has sufficient permissions
3. **Resource limits**: Check AWS service quotas for your account

### Amplify Build Fails

1. Check GitHub token is valid in Secrets Manager
2. Verify repository URL is correct
3. Review build logs in Amplify Console

### Lambda Function Errors

1. Check CloudWatch Logs for error details
2. Verify DynamoDB table names in environment variables
3. Ensure Lambda has correct IAM permissions

## Security Best Practices

1. **Enable MFA**: Require MFA for Cognito users
2. **Rotate Credentials**: Regularly rotate GitHub tokens and API keys
3. **Enable Encryption**: DynamoDB encryption at rest is enabled by default
4. **Monitor Access**: Use CloudTrail to audit API calls
5. **Least Privilege**: Review and minimize IAM permissions
6. **Enable Point-in-Time Recovery**: For production DynamoDB tables

## Support

For issues or questions:
1. Check CloudFormation stack events for error details
2. Review CloudWatch Logs for application errors
3. Consult AWS documentation for service-specific issues
4. Contact your AWS support team for infrastructure issues
