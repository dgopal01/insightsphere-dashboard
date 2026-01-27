# Deployment Guide - Chat Logs Review System

This guide provides comprehensive instructions for deploying the Chat Logs Review System to AWS.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Infrastructure Deployment](#infrastructure-deployment)
- [Application Deployment](#application-deployment)
- [Environment Configuration](#environment-configuration)
- [Post-Deployment Steps](#post-deployment-steps)
- [Monitoring and Verification](#monitoring-and-verification)
- [Rollback Procedures](#rollback-procedures)
- [Troubleshooting](#troubleshooting)

## Overview

The Chat Logs Review System uses a two-tier deployment architecture:

1. **Infrastructure Layer**: AWS CloudFormation provisions all backend resources
2. **Application Layer**: AWS Amplify Hosting deploys the React frontend

### Deployment Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Deploy CloudFormation Stack                              │
│    - Cognito User Pool                                       │
│    - DynamoDB Tables                                         │
│    - AppSync GraphQL API                                     │
│    - Lambda Functions                                        │
│    - IAM Roles & Policies                                    │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Configure Environment Variables                          │
│    - Copy CloudFormation outputs                            │
│    - Update .env file                                        │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Build & Deploy Application                               │
│    - Build React application                                │
│    - Deploy to Amplify Hosting                              │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Post-Deployment Configuration                            │
│    - Create admin users                                      │
│    - Verify connectivity                                     │
│    - Configure monitoring                                    │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites

### Required Tools

- **AWS CLI**: Version 2.x or higher
  ```bash
  aws --version
  ```

- **Node.js**: Version 18.x or higher
  ```bash
  node --version
  ```

- **npm**: Version 9.x or higher
  ```bash
  npm --version
  ```

- **Git**: For version control
  ```bash
  git --version
  ```

### AWS Permissions

Your AWS IAM user/role must have permissions to create:

- CloudFormation stacks
- Cognito User Pools
- DynamoDB tables
- AppSync APIs
- Lambda functions
- IAM roles and policies
- Amplify apps

### AWS Configuration

Configure AWS CLI with your credentials:

```bash
aws configure
```

Enter:
- AWS Access Key ID
- AWS Secret Access Key
- Default region (e.g., `us-east-1`)
- Default output format (e.g., `json`)

Verify configuration:

```bash
aws sts get-caller-identity
```

## Infrastructure Deployment

### Step 1: Prepare CloudFormation Template

The CloudFormation template is located at:
```
cloudformation/chat-logs-review-stack.yaml
```

### Step 2: Choose Deployment Method

#### Option A: Using Deployment Script (Recommended)

**Windows (PowerShell)**:
```powershell
.\deploy-chat-logs-review.cmd
```

**Linux/Mac (Bash)**:
```bash
chmod +x deploy-chat-logs-review.sh
./deploy-chat-logs-review.sh
```

The script will:
1. Validate AWS credentials
2. Package Lambda functions
3. Deploy CloudFormation stack
4. Display outputs

#### Option B: Manual Deployment with AWS CLI

```bash
# Set variables
STACK_NAME="chat-logs-review-dev"
ENVIRONMENT="dev"
COGNITO_DOMAIN="your-unique-prefix-dev"

# Create stack
aws cloudformation create-stack \
  --stack-name $STACK_NAME \
  --template-body file://cloudformation/chat-logs-review-stack.yaml \
  --parameters \
    ParameterKey=EnvironmentName,ParameterValue=$ENVIRONMENT \
    ParameterKey=ProjectName,ParameterValue=chat-logs-review \
    ParameterKey=CognitoDomainPrefix,ParameterValue=$COGNITO_DOMAIN \
  --capabilities CAPABILITY_NAMED_IAM \
  --region us-east-1

# Wait for stack creation
aws cloudformation wait stack-create-complete \
  --stack-name $STACK_NAME \
  --region us-east-1

# Get outputs
aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --query 'Stacks[0].Outputs' \
  --region us-east-1
```

#### Option C: AWS Console Deployment

1. Go to [AWS CloudFormation Console](https://console.aws.amazon.com/cloudformation/)
2. Click "Create stack" > "With new resources"
3. Choose "Upload a template file"
4. Upload `cloudformation/chat-logs-review-stack.yaml`
5. Click "Next"
6. Enter stack parameters:
   - **Stack name**: `chat-logs-review-dev`
   - **EnvironmentName**: `dev`
   - **ProjectName**: `chat-logs-review`
   - **CognitoDomainPrefix**: `your-unique-prefix-dev` (must be globally unique)
7. Click "Next"
8. Configure stack options (optional)
9. Click "Next"
10. Review and check "I acknowledge that AWS CloudFormation might create IAM resources"
11. Click "Create stack"
12. Wait for stack creation (10-15 minutes)

### Step 3: Verify Infrastructure Deployment

Check stack status:

```bash
aws cloudformation describe-stacks \
  --stack-name chat-logs-review-dev \
  --query 'Stacks[0].StackStatus' \
  --region us-east-1
```

Expected output: `CREATE_COMPLETE`

### Step 4: Retrieve Stack Outputs

```bash
aws cloudformation describe-stacks \
  --stack-name chat-logs-review-dev \
  --query 'Stacks[0].Outputs' \
  --region us-east-1 \
  --output table
```

Save these outputs - you'll need them for environment configuration.

## Application Deployment

### Step 1: Configure Environment Variables

Create `.env` file from template:

```bash
cp .env.example .env
```

Update `.env` with CloudFormation outputs:

```env
# AWS Configuration
VITE_AWS_REGION=us-east-1

# Cognito Configuration
VITE_USER_POOL_ID=<UserPoolId from CloudFormation>
VITE_USER_POOL_CLIENT_ID=<UserPoolClientId from CloudFormation>
VITE_IDENTITY_POOL_ID=<IdentityPoolId from CloudFormation>
VITE_COGNITO_DOMAIN=<CognitoDomain from CloudFormation>

# AppSync Configuration
VITE_GRAPHQL_ENDPOINT=<GraphQLApiUrl from CloudFormation>

# Environment
VITE_ENV=development
```

### Step 2: Install Dependencies

```bash
npm ci
```

### Step 3: Build Application

```bash
# Development build
npm run build:dev

# Staging build
npm run build:staging

# Production build
npm run build:prod
```

### Step 4: Deploy to Amplify Hosting

#### Option A: Automatic Deployment (Recommended)

1. Connect GitHub repository to Amplify:
   ```bash
   aws amplify create-app \
     --name chat-logs-review-dev \
     --repository <github-repo-url> \
     --access-token <github-token> \
     --region us-east-1
   ```

2. Create branch:
   ```bash
   aws amplify create-branch \
     --app-id <app-id> \
     --branch-name dev \
     --enable-auto-build \
     --region us-east-1
   ```

3. Configure build settings in `amplify.yml` (already included)

4. Push to GitHub - Amplify will automatically build and deploy

#### Option B: Manual Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy to S3 + CloudFront (alternative to Amplify):
   ```bash
   # Create S3 bucket
   aws s3 mb s3://chat-logs-review-dev-frontend

   # Upload build files
   aws s3 sync dist/ s3://chat-logs-review-dev-frontend/ \
     --delete \
     --cache-control "max-age=31536000"

   # Upload index.html without cache
   aws s3 cp dist/index.html s3://chat-logs-review-dev-frontend/index.html \
     --cache-control "no-cache"
   ```

3. Configure CloudFront distribution (see AWS documentation)

### Step 5: Verify Deployment

1. Get Amplify app URL:
   ```bash
   aws amplify get-app \
     --app-id <app-id> \
     --query 'app.defaultDomain' \
     --region us-east-1
   ```

2. Open URL in browser

3. Verify:
   - Application loads
   - Sign-in page appears
   - No console errors

## Environment Configuration

### Development Environment

```env
VITE_ENV=development
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
```

**Purpose**: Active development and testing

**Characteristics**:
- Debug mode enabled
- Verbose logging
- Source maps enabled
- No production optimizations

### Staging Environment

```env
VITE_ENV=staging
VITE_DEBUG_MODE=false
VITE_LOG_LEVEL=info
```

**Purpose**: Pre-production testing and QA

**Characteristics**:
- Production-like configuration
- Moderate logging
- Source maps enabled
- Performance monitoring

### Production Environment

```env
VITE_ENV=production
VITE_DEBUG_MODE=false
VITE_LOG_LEVEL=error
```

**Purpose**: Live user access

**Characteristics**:
- Debug mode disabled
- Error-only logging
- Source maps disabled
- Full optimizations
- Monitoring enabled

## Post-Deployment Steps

### 1. Create Admin User

```powershell
# Windows PowerShell
.\create-admin-user.ps1 -Email "admin@example.com" -Password "TempPassword123!"
```

Or manually via AWS Console:
1. Go to Cognito User Pools
2. Select your user pool
3. Click "Create user"
4. Enter email and temporary password
5. User will be prompted to change password on first login

### 2. Verify Cognito Configuration

Test authentication:

```bash
# Get Cognito domain
aws cognito-idp describe-user-pool \
  --user-pool-id <user-pool-id> \
  --query 'UserPool.Domain' \
  --region us-east-1

# Test Hosted UI
# Open in browser:
https://<cognito-domain>.auth.<region>.amazoncognito.com/login?client_id=<client-id>&response_type=code&redirect_uri=<redirect-uri>
```

### 3. Verify DynamoDB Tables

```bash
# List tables
aws dynamodb list-tables --region us-east-1

# Describe UnityAIAssistantLogs table
aws dynamodb describe-table \
  --table-name chat-logs-review-dev-UnityAIAssistantLogs \
  --region us-east-1

# Describe UserFeedback table
aws dynamodb describe-table \
  --table-name chat-logs-review-dev-UserFeedback \
  --region us-east-1
```

### 4. Verify AppSync API

```bash
# Get API details
aws appsync get-graphql-api \
  --api-id <api-id> \
  --region us-east-1

# Test query (requires authentication)
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt-token>" \
  -d '{"query":"query { getReviewMetrics { totalChatLogs } }"}' \
  <graphql-endpoint>
```

### 5. Verify Lambda Function

```bash
# Invoke metrics function
aws lambda invoke \
  --function-name chat-logs-review-dev-GetReviewMetrics \
  --region us-east-1 \
  response.json

# View response
cat response.json
```

### 6. Configure Monitoring

Set up CloudWatch alarms:

```bash
# High error rate alarm
aws cloudwatch put-metric-alarm \
  --alarm-name chat-logs-review-high-errors \
  --alarm-description "Alert when error rate is high" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1 \
  --dimensions Name=FunctionName,Value=chat-logs-review-dev-GetReviewMetrics
```

## Monitoring and Verification

### Health Checks

Create a health check script:

```bash
#!/bin/bash
# health-check.sh

echo "Checking Chat Logs Review System..."

# Check Amplify app
APP_STATUS=$(aws amplify get-app --app-id <app-id> --query 'app.status' --output text)
echo "Amplify Status: $APP_STATUS"

# Check Lambda function
LAMBDA_STATUS=$(aws lambda get-function --function-name chat-logs-review-dev-GetReviewMetrics --query 'Configuration.State' --output text)
echo "Lambda Status: $LAMBDA_STATUS"

# Check DynamoDB tables
CHAT_LOGS_STATUS=$(aws dynamodb describe-table --table-name chat-logs-review-dev-UnityAIAssistantLogs --query 'Table.TableStatus' --output text)
echo "Chat Logs Table: $CHAT_LOGS_STATUS"

FEEDBACK_STATUS=$(aws dynamodb describe-table --table-name chat-logs-review-dev-UserFeedback --query 'Table.TableStatus' --output text)
echo "Feedback Table: $FEEDBACK_STATUS"

# Check AppSync API
API_STATUS=$(aws appsync get-graphql-api --api-id <api-id> --query 'graphqlApi.status' --output text)
echo "AppSync API: $API_STATUS"

echo "Health check complete!"
```

### Logs

View logs:

```bash
# Lambda logs
aws logs tail /aws/lambda/chat-logs-review-dev-GetReviewMetrics --follow

# AppSync logs
aws logs tail /aws/appsync/apis/<api-id> --follow
```

### Metrics

View metrics in CloudWatch:

1. Go to [CloudWatch Console](https://console.aws.amazon.com/cloudwatch/)
2. Select "Metrics"
3. Browse by service:
   - Lambda: Function invocations, errors, duration
   - DynamoDB: Read/write capacity, throttles
   - AppSync: Request count, latency, errors

## Rollback Procedures

### Rollback Infrastructure

```bash
# Delete CloudFormation stack
aws cloudformation delete-stack \
  --stack-name chat-logs-review-dev \
  --region us-east-1

# Wait for deletion
aws cloudformation wait stack-delete-complete \
  --stack-name chat-logs-review-dev \
  --region us-east-1

# Redeploy previous version
aws cloudformation create-stack \
  --stack-name chat-logs-review-dev \
  --template-body file://cloudformation/chat-logs-review-stack-v1.0.0.yaml \
  --parameters file://parameters-v1.0.0.json \
  --capabilities CAPABILITY_NAMED_IAM
```

### Rollback Application

#### Amplify Hosting

1. Go to Amplify Console
2. Select your app
3. Click on the branch
4. Find previous successful deployment
5. Click "Redeploy this version"

#### Manual Rollback

```bash
# Checkout previous version
git checkout <previous-commit-hash>

# Build
npm run build

# Deploy
aws s3 sync dist/ s3://chat-logs-review-dev-frontend/ --delete
```

## Troubleshooting

### CloudFormation Stack Creation Failed

**Issue**: Stack creation fails with error

**Solutions**:

1. Check CloudFormation events:
   ```bash
   aws cloudformation describe-stack-events \
     --stack-name chat-logs-review-dev \
     --max-items 20
   ```

2. Common issues:
   - **Cognito domain already exists**: Choose a different domain prefix
   - **IAM permissions**: Ensure you have required permissions
   - **Resource limits**: Check AWS service quotas

3. Delete failed stack and retry:
   ```bash
   aws cloudformation delete-stack --stack-name chat-logs-review-dev
   ```

### Application Won't Load

**Issue**: Application shows blank page or errors

**Solutions**:

1. Check browser console for errors (F12)

2. Verify environment variables:
   ```bash
   cat .env
   ```

3. Rebuild application:
   ```bash
   rm -rf dist node_modules
   npm ci
   npm run build
   ```

4. Check Amplify build logs in console

### Authentication Errors

**Issue**: Users can't sign in

**Solutions**:

1. Verify Cognito configuration:
   ```bash
   aws cognito-idp describe-user-pool-client \
     --user-pool-id <pool-id> \
     --client-id <client-id>
   ```

2. Check callback URLs match application URL

3. Verify user exists and is confirmed:
   ```bash
   aws cognito-idp admin-get-user \
     --user-pool-id <pool-id> \
     --username <email>
   ```

4. Reset user password if needed:
   ```bash
   aws cognito-idp admin-set-user-password \
     --user-pool-id <pool-id> \
     --username <email> \
     --password <new-password> \
     --permanent
   ```

### API Connection Issues

**Issue**: GraphQL queries fail

**Solutions**:

1. Verify AppSync endpoint in `.env`

2. Check API authentication settings

3. Test API with curl:
   ```bash
   curl -X POST \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <token>" \
     -d '{"query":"{ getReviewMetrics { totalChatLogs } }"}' \
     <graphql-endpoint>
   ```

4. Check AppSync logs for errors

5. Verify IAM roles have correct permissions

### Lambda Function Errors

**Issue**: Metrics not loading

**Solutions**:

1. Check Lambda logs:
   ```bash
   aws logs tail /aws/lambda/chat-logs-review-dev-GetReviewMetrics
   ```

2. Test function directly:
   ```bash
   aws lambda invoke \
     --function-name chat-logs-review-dev-GetReviewMetrics \
     response.json
   cat response.json
   ```

3. Verify environment variables in Lambda

4. Check IAM role has DynamoDB read permissions

## Best Practices

1. **Use Infrastructure as Code**: Always deploy via CloudFormation
2. **Version Control**: Tag releases in Git
3. **Environment Separation**: Use separate stacks for dev/staging/prod
4. **Automated Testing**: Run tests before deployment
5. **Monitoring**: Set up CloudWatch alarms
6. **Backup**: Enable point-in-time recovery for DynamoDB
7. **Security**: Rotate credentials regularly
8. **Documentation**: Keep deployment docs updated
9. **Rollback Plan**: Always have a rollback strategy
10. **Change Management**: Use change tickets for production

## Deployment Checklist

### Pre-Deployment

- [ ] Code reviewed and approved
- [ ] All tests passing
- [ ] No linting errors
- [ ] Environment variables configured
- [ ] AWS credentials configured
- [ ] CloudFormation template validated
- [ ] Backup of current production (if applicable)

### During Deployment

- [ ] Deploy CloudFormation stack
- [ ] Verify stack creation successful
- [ ] Configure environment variables
- [ ] Build application
- [ ] Deploy to Amplify/S3
- [ ] Verify deployment successful

### Post-Deployment

- [ ] Create admin users
- [ ] Verify authentication works
- [ ] Test API connectivity
- [ ] Check Lambda function
- [ ] Verify DynamoDB tables
- [ ] Configure monitoring
- [ ] Run smoke tests
- [ ] Update documentation
- [ ] Notify stakeholders

## Additional Resources

- [AWS CloudFormation Documentation](https://docs.aws.amazon.com/cloudformation/)
- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [AWS AppSync Documentation](https://docs.aws.amazon.com/appsync/)
- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)

---

**Last Updated**: December 2024  
**Version**: 1.0.0
