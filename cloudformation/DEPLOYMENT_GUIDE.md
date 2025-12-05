# Chat Logs Review System - Deployment Guide

This guide explains how to deploy the Chat Logs Review System using the provided deployment script.

## Prerequisites

Before deploying, ensure you have:

1. **AWS CLI** installed and configured
   - Download from: https://aws.amazon.com/cli/
   - Configure with: `aws configure`
   - Ensure you have appropriate IAM permissions for:
     - CloudFormation
     - DynamoDB
     - Cognito
     - AppSync
     - Lambda
     - IAM
     - Amplify

2. **AWS Account** with sufficient permissions

3. **Unique Cognito Domain Prefix**
   - Must be globally unique across all AWS accounts
   - Can only contain lowercase letters, numbers, and hyphens
   - Example: `my-company-chat-logs-review-dev`

## Deployment Script

The deployment script is located at: `deploy-chat-logs-review.cmd`

### Usage

```cmd
deploy-chat-logs-review.cmd [COGNITO_DOMAIN_PREFIX] [REGION] [ENVIRONMENT]
```

### Parameters

- **COGNITO_DOMAIN_PREFIX** (required): Unique domain prefix for Cognito Hosted UI
- **REGION** (optional): AWS region (default: us-east-1)
- **ENVIRONMENT** (optional): Environment name (default: dev)

### Examples

**Basic deployment (dev environment in us-east-1):**
```cmd
deploy-chat-logs-review.cmd my-chat-logs-review
```

**Deployment to specific region:**
```cmd
deploy-chat-logs-review.cmd my-chat-logs-review us-west-2
```

**Deployment to staging environment:**
```cmd
deploy-chat-logs-review.cmd my-chat-logs-staging us-east-1 staging
```

**Deployment to production:**
```cmd
deploy-chat-logs-review.cmd my-chat-logs-prod us-east-1 prod
```

## What the Script Does

The deployment script performs the following steps:

### 1. Validates Prerequisites
- Checks if AWS CLI is installed
- Validates AWS credentials
- Verifies CloudFormation template exists

### 2. Validates CloudFormation Template
- Runs AWS CloudFormation template validation
- Ensures template syntax is correct

### 3. Checks Lambda Function
- Verifies Lambda function code (inline in template)
- No packaging required for this deployment

### 4. Confirms Deployment
- Prompts user for confirmation before proceeding
- Allows cancellation if needed

### 5. Deploys CloudFormation Stack
- Creates new stack if it doesn't exist
- Updates existing stack if it already exists
- Waits for stack creation/update to complete
- Provides error messages and rollback instructions on failure

### 6. Retrieves and Displays Outputs
- Extracts stack outputs (User Pool ID, API endpoints, etc.)
- Creates `.env` file with configuration
- Creates `src/aws-exports.ts` for Amplify configuration
- Saves deployment info to `deployment-info.json`
- Displays next steps for completing setup

## Deployment Outputs

After successful deployment, the script creates:

### 1. `.env` File
Contains environment variables for the React application:
```env
VITE_ENV=dev
VITE_AWS_REGION=us-east-1
VITE_USER_POOL_ID=us-east-1_XXXXXXXXX
VITE_USER_POOL_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_IDENTITY_POOL_ID=us-east-1:XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
VITE_GRAPHQL_ENDPOINT=https://XXXXXXXXXXXXXXXXXXXXXXXXXX.appsync-api.us-east-1.amazonaws.com/graphql
VITE_COGNITO_DOMAIN=my-chat-logs-review.auth.us-east-1.amazoncognito.com
```

### 2. `src/aws-exports.ts` File
AWS Amplify configuration for the application

### 3. `deployment-info.json` File
JSON file containing all deployment information for reference

## Post-Deployment Steps

After the script completes, follow these steps:

### 1. Create Admin User

```cmd
aws cognito-idp admin-create-user ^
  --user-pool-id <USER_POOL_ID> ^
  --username admin ^
  --user-attributes Name=email,Value=admin@example.com Name=email_verified,Value=true ^
  --temporary-password TempPass123! ^
  --message-action SUPPRESS ^
  --region <REGION>
```

Replace `<USER_POOL_ID>` and `<REGION>` with values from the deployment output.

### 2. Install Dependencies

```cmd
npm install
```

### 3. Start Development Server

```cmd
npm run dev
```

### 4. Access Application

Open your browser to: http://localhost:5173

### 5. Sign In

- Username: `admin`
- Password: `TempPass123!`
- You'll be prompted to change the password on first login

## Error Handling

### Stack Creation/Update Failures

If the stack creation or update fails, the script will:

1. Display recent stack events showing the failure reason
2. Provide rollback commands:
   - For create failures: `aws cloudformation delete-stack --stack-name <STACK_NAME> --region <REGION>`
   - For update failures: `aws cloudformation cancel-update-stack --stack-name <STACK_NAME> --region <REGION>`

### Common Issues

**1. Cognito Domain Already Exists**
- Error: "Domain already exists"
- Solution: Choose a different, globally unique domain prefix

**2. Insufficient IAM Permissions**
- Error: "User is not authorized to perform..."
- Solution: Ensure your AWS user/role has necessary permissions

**3. Template Validation Failure**
- Error: "Template validation failed"
- Solution: Check CloudFormation template syntax

**4. Stack Already Exists**
- The script automatically detects existing stacks and performs an update instead of create

## Stack Resources

The CloudFormation stack creates the following resources:

### Authentication
- Cognito User Pool
- Cognito User Pool Client
- Cognito Identity Pool
- Cognito User Pool Domain

### Data Storage
- DynamoDB Table: UnityAIAssistantLogs (with GSI on carrier_name)
- DynamoDB Table: UserFeedback (with GSI on carrier)

### API
- AppSync GraphQL API
- GraphQL Schema
- Data Sources (DynamoDB, Lambda)
- Resolvers for queries and mutations

### Compute
- Lambda Function: GetReviewMetrics (for metrics calculation)

### Hosting
- Amplify App (for hosting the React application)
- Amplify Branch

### IAM
- IAM Roles for AppSync, Lambda, Cognito, and Amplify
- IAM Policies for resource access

## Updating the Stack

To update an existing stack, simply run the deployment script again with the same parameters:

```cmd
deploy-chat-logs-review.cmd my-chat-logs-review
```

The script will automatically detect the existing stack and perform an update.

## Deleting the Stack

To delete the entire stack and all resources:

```cmd
aws cloudformation delete-stack --stack-name chat-logs-review-dev --region us-east-1
```

**Warning:** This will delete all data in the DynamoDB tables. Ensure you have backups if needed.

## Troubleshooting

### View Stack Events

```cmd
aws cloudformation describe-stack-events --stack-name chat-logs-review-dev --region us-east-1
```

### View Stack Status

```cmd
aws cloudformation describe-stacks --stack-name chat-logs-review-dev --region us-east-1
```

### View Stack Outputs

```cmd
aws cloudformation describe-stacks --stack-name chat-logs-review-dev --region us-east-1 --query "Stacks[0].Outputs"
```

## Support

For issues or questions:
1. Check the CloudFormation stack events for detailed error messages
2. Review AWS CloudWatch logs for Lambda function errors
3. Verify IAM permissions for your AWS user/role
4. Ensure all prerequisites are met

## Security Notes

- The deployment script creates IAM roles with specific permissions
- Cognito is configured with password policies requiring:
  - Minimum 8 characters
  - Uppercase and lowercase letters
  - Numbers and symbols
- All API access requires authentication through Cognito
- DynamoDB tables have point-in-time recovery enabled in production
