# AWS Developer Permissions Guide

## Overview
This document outlines the AWS IAM permissions required for developers to actively develop, test, and deploy the EthosAI application.

## Table of Contents
1. [Required AWS Services](#required-aws-services)
2. [Developer IAM Policy](#developer-iam-policy)
3. [Service-Specific Permissions](#service-specific-permissions)
4. [Environment-Specific Access](#environment-specific-access)
5. [Setup Instructions](#setup-instructions)
6. [Security Best Practices](#security-best-practices)

---

## Required AWS Services

The EthosAI application uses the following AWS services:

| Service | Purpose | Access Level |
|---------|---------|--------------|
| **Cognito** | User authentication and authorization | Read/Write |
| **DynamoDB** | Data storage for logs and feedback | Read/Write |
| **AppSync** | GraphQL API | Read/Write |
| **S3** | Static asset storage | Read/Write |
| **Amplify** | Frontend hosting and CI/CD | Read/Write |
| **CloudWatch** | Logging and monitoring | Read/Write |
| **IAM** | Role and policy management | Limited |
| **CloudFormation** | Infrastructure as Code | Read/Write |
| **Lambda** | Serverless functions | Read/Write |

---

## Developer IAM Policy

### Complete Developer Policy (JSON)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CognitoAccess",
      "Effect": "Allow",
      "Action": [
        "cognito-idp:AdminCreateUser",
        "cognito-idp:AdminDeleteUser",
        "cognito-idp:AdminGetUser",
        "cognito-idp:AdminListGroupsForUser",
        "cognito-idp:AdminAddUserToGroup",
        "cognito-idp:AdminRemoveUserFromGroup",
        "cognito-idp:ListUsers",
        "cognito-idp:ListGroups",
        "cognito-idp:DescribeUserPool",
        "cognito-idp:DescribeUserPoolClient",
        "cognito-idp:GetUser",
        "cognito-identity:GetId",
        "cognito-identity:GetCredentialsForIdentity",
        "cognito-identity:DescribeIdentityPool"
      ],
      "Resource": [
        "arn:aws:cognito-idp:*:*:userpool/*",
        "arn:aws:cognito-identity:*:*:identitypool/*"
      ]
    },
    {
      "Sid": "DynamoDBAccess",
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:BatchGetItem",
        "dynamodb:BatchWriteItem",
        "dynamodb:DescribeTable",
        "dynamodb:ListTables"
      ],
      "Resource": [
        "arn:aws:dynamodb:*:*:table/chat-logs-review-*",
        "arn:aws:dynamodb:*:*:table/UnityAIAssistantEvalJob",
        "arn:aws:dynamodb:*:*:table/insightsphere-*"
      ]
    },
    {
      "Sid": "AppSyncAccess",
      "Effect": "Allow",
      "Action": [
        "appsync:GraphQL",
        "appsync:GetGraphqlApi",
        "appsync:ListGraphqlApis",
        "appsync:GetDataSource",
        "appsync:ListDataSources",
        "appsync:GetResolver",
        "appsync:ListResolvers"
      ],
      "Resource": [
        "arn:aws:appsync:*:*:apis/*"
      ]
    },
    {
      "Sid": "S3Access",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket",
        "s3:GetBucketLocation",
        "s3:GetBucketVersioning"
      ],
      "Resource": [
        "arn:aws:s3:::insightsphere-*",
        "arn:aws:s3:::insightsphere-*/*",
        "arn:aws:s3:::amplify-*",
        "arn:aws:s3:::amplify-*/*"
      ]
    },
    {
      "Sid": "AmplifyAccess",
      "Effect": "Allow",
      "Action": [
        "amplify:GetApp",
        "amplify:ListApps",
        "amplify:GetBranch",
        "amplify:ListBranches",
        "amplify:GetJob",
        "amplify:ListJobs",
        "amplify:StartJob",
        "amplify:StopJob",
        "amplify:GetBackendEnvironment",
        "amplify:ListBackendEnvironments"
      ],
      "Resource": [
        "arn:aws:amplify:*:*:apps/*"
      ]
    },
    {
      "Sid": "CloudWatchLogsAccess",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:DescribeLogGroups",
        "logs:DescribeLogStreams",
        "logs:GetLogEvents",
        "logs:FilterLogEvents"
      ],
      "Resource": [
        "arn:aws:logs:*:*:log-group:/aws/amplify/*",
        "arn:aws:logs:*:*:log-group:/aws/lambda/*",
        "arn:aws:logs:*:*:log-group:/aws/appsync/*"
      ]
    },
    {
      "Sid": "CloudWatchMetricsAccess",
      "Effect": "Allow",
      "Action": [
        "cloudwatch:PutMetricData",
        "cloudwatch:GetMetricData",
        "cloudwatch:GetMetricStatistics",
        "cloudwatch:ListMetrics"
      ],
      "Resource": "*"
    },
    {
      "Sid": "CloudFormationAccess",
      "Effect": "Allow",
      "Action": [
        "cloudformation:DescribeStacks",
        "cloudformation:DescribeStackEvents",
        "cloudformation:DescribeStackResources",
        "cloudformation:GetTemplate",
        "cloudformation:ListStacks",
        "cloudformation:ValidateTemplate",
        "cloudformation:CreateStack",
        "cloudformation:UpdateStack",
        "cloudformation:DeleteStack"
      ],
      "Resource": [
        "arn:aws:cloudformation:*:*:stack/insightsphere-*",
        "arn:aws:cloudformation:*:*:stack/amplify-*"
      ]
    },
    {
      "Sid": "LambdaAccess",
      "Effect": "Allow",
      "Action": [
        "lambda:GetFunction",
        "lambda:ListFunctions",
        "lambda:InvokeFunction",
        "lambda:GetFunctionConfiguration",
        "lambda:UpdateFunctionCode",
        "lambda:UpdateFunctionConfiguration",
        "lambda:PublishVersion",
        "lambda:CreateAlias",
        "lambda:UpdateAlias"
      ],
      "Resource": [
        "arn:aws:lambda:*:*:function:insightsphere-*",
        "arn:aws:lambda:*:*:function:amplify-*"
      ]
    },
    {
      "Sid": "IAMReadAccess",
      "Effect": "Allow",
      "Action": [
        "iam:GetRole",
        "iam:GetPolicy",
        "iam:GetPolicyVersion",
        "iam:ListRoles",
        "iam:ListPolicies",
        "iam:ListAttachedRolePolicies"
      ],
      "Resource": "*"
    },
    {
      "Sid": "IAMPassRole",
      "Effect": "Allow",
      "Action": [
        "iam:PassRole"
      ],
      "Resource": [
        "arn:aws:iam::*:role/insightsphere-*",
        "arn:aws:iam::*:role/amplify-*"
      ],
      "Condition": {
        "StringEquals": {
          "iam:PassedToService": [
            "lambda.amazonaws.com",
            "appsync.amazonaws.com",
            "amplify.amazonaws.com"
          ]
        }
      }
    }
  ]
}
```

---

## Service-Specific Permissions

### 1. Cognito Permissions

**Purpose**: User authentication, user management, and identity pool access

```json
{
  "Effect": "Allow",
  "Action": [
    "cognito-idp:AdminCreateUser",
    "cognito-idp:AdminDeleteUser",
    "cognito-idp:AdminGetUser",
    "cognito-idp:AdminListGroupsForUser",
    "cognito-idp:AdminAddUserToGroup",
    "cognito-idp:AdminRemoveUserFromGroup",
    "cognito-idp:ListUsers",
    "cognito-idp:ListGroups",
    "cognito-idp:DescribeUserPool",
    "cognito-idp:DescribeUserPoolClient"
  ],
  "Resource": "arn:aws:cognito-idp:*:*:userpool/*"
}
```

**Use Cases**:
- Creating test users for development
- Managing user groups (admin, viewer)
- Testing authentication flows
- Debugging user-related issues

### 2. DynamoDB Permissions

**Purpose**: Read/write access to application data tables

**Tables**:
- `chat-logs-review-dev-UnityAIAssistantLogs` - Chat logs
- `chat-logs-review-dev-UserFeedback` - User feedback
- `UnityAIAssistantEvalJob` - AI evaluation metrics

```json
{
  "Effect": "Allow",
  "Action": [
    "dynamodb:GetItem",
    "dynamodb:PutItem",
    "dynamodb:UpdateItem",
    "dynamodb:DeleteItem",
    "dynamodb:Query",
    "dynamodb:Scan",
    "dynamodb:BatchGetItem",
    "dynamodb:BatchWriteItem"
  ],
  "Resource": [
    "arn:aws:dynamodb:*:*:table/chat-logs-review-*",
    "arn:aws:dynamodb:*:*:table/UnityAIAssistantEvalJob"
  ]
}
```

**Use Cases**:
- Testing CRUD operations
- Seeding test data
- Debugging data issues
- Performance testing

### 3. AppSync (GraphQL) Permissions

**Purpose**: GraphQL API access for data operations

```json
{
  "Effect": "Allow",
  "Action": [
    "appsync:GraphQL",
    "appsync:GetGraphqlApi",
    "appsync:ListGraphqlApis"
  ],
  "Resource": "arn:aws:appsync:*:*:apis/*"
}
```

**Use Cases**:
- Testing GraphQL queries and mutations
- Debugging API issues
- Performance testing

### 4. S3 Permissions

**Purpose**: Static asset storage and Amplify hosting

```json
{
  "Effect": "Allow",
  "Action": [
    "s3:GetObject",
    "s3:PutObject",
    "s3:DeleteObject",
    "s3:ListBucket"
  ],
  "Resource": [
    "arn:aws:s3:::insightsphere-*",
    "arn:aws:s3:::insightsphere-*/*"
  ]
}
```

**Use Cases**:
- Uploading build artifacts
- Managing static assets
- Testing file uploads

### 5. CloudWatch Permissions

**Purpose**: Logging, monitoring, and debugging

```json
{
  "Effect": "Allow",
  "Action": [
    "logs:CreateLogGroup",
    "logs:CreateLogStream",
    "logs:PutLogEvents",
    "logs:GetLogEvents",
    "logs:FilterLogEvents",
    "cloudwatch:PutMetricData",
    "cloudwatch:GetMetricStatistics"
  ],
  "Resource": "*"
}
```

**Use Cases**:
- Viewing application logs
- Debugging errors
- Monitoring performance
- Creating custom metrics

---

## Environment-Specific Access

### Development Environment

**Full Access** to development resources:
- `insightsphere-dev-*`
- `chat-logs-review-dev-*`
- `amplify-dev-*`

### Staging Environment

**Read/Write Access** with approval for destructive operations:
- `insightsphere-staging-*`
- `chat-logs-review-staging-*`

### Production Environment

**Read-Only Access** by default:
- View logs and metrics
- No write access without approval
- Emergency access via break-glass procedure

---

## Setup Instructions

### 1. Create IAM User

```bash
# Using AWS CLI
aws iam create-user --user-name developer-john-doe

# Add user to developers group
aws iam add-user-to-group \
  --user-name developer-john-doe \
  --group-name insightsphere-developers
```

### 2. Attach Policy

```bash
# Create policy from JSON file
aws iam create-policy \
  --policy-name InsightSphereDeveloperPolicy \
  --policy-document file://developer-policy.json

# Attach policy to user
aws iam attach-user-policy \
  --user-name developer-john-doe \
  --policy-arn arn:aws:iam::ACCOUNT_ID:policy/InsightSphereDeveloperPolicy
```

### 3. Generate Access Keys

```bash
# Create access keys
aws iam create-access-key --user-name developer-john-doe

# Output will include:
# - AccessKeyId
# - SecretAccessKey
```

### 4. Configure AWS CLI

```bash
# Configure AWS CLI profile
aws configure --profile insightsphere-dev

# Enter:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region: us-east-1
# - Default output format: json
```

### 5. Test Access

```bash
# Test Cognito access
aws cognito-idp list-users \
  --user-pool-id YOUR_USER_POOL_ID \
  --profile insightsphere-dev

# Test DynamoDB access
aws dynamodb list-tables \
  --profile insightsphere-dev

# Test S3 access
aws s3 ls \
  --profile insightsphere-dev
```

---

## Security Best Practices

### 1. Use IAM Roles for EC2/Lambda

Instead of access keys, use IAM roles when running on AWS infrastructure:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "Service": "ec2.amazonaws.com"
    },
    "Action": "sts:AssumeRole"
  }]
}
```

### 2. Enable MFA

Require multi-factor authentication for all developers:

```bash
aws iam enable-mfa-device \
  --user-name developer-john-doe \
  --serial-number arn:aws:iam::ACCOUNT_ID:mfa/john-doe \
  --authentication-code-1 123456 \
  --authentication-code-2 789012
```

### 3. Rotate Access Keys Regularly

```bash
# Create new access key
aws iam create-access-key --user-name developer-john-doe

# Delete old access key after testing
aws iam delete-access-key \
  --user-name developer-john-doe \
  --access-key-id OLD_ACCESS_KEY_ID
```

### 4. Use AWS Secrets Manager

Store sensitive credentials in AWS Secrets Manager:

```bash
aws secretsmanager create-secret \
  --name insightsphere/dev/database \
  --secret-string '{"username":"admin","password":"secret"}'
```

### 5. Enable CloudTrail

Monitor all API calls for security auditing:

```bash
aws cloudtrail create-trail \
  --name insightsphere-audit \
  --s3-bucket-name insightsphere-audit-logs
```

### 6. Principle of Least Privilege

- Grant only necessary permissions
- Use resource-specific ARNs
- Avoid wildcard (*) permissions
- Review permissions quarterly

### 7. Use AWS Organizations

Separate accounts for different environments:
- Development Account
- Staging Account
- Production Account

---

## Common Development Tasks

### Task 1: Deploy to Development

**Required Permissions**:
- Amplify: `StartJob`, `GetJob`
- S3: `PutObject`, `ListBucket`
- CloudFormation: `UpdateStack`

```bash
npm run deploy:dev
```

### Task 2: View Application Logs

**Required Permissions**:
- CloudWatch Logs: `GetLogEvents`, `FilterLogEvents`

```bash
aws logs tail /aws/amplify/insightsphere-dev --follow
```

### Task 3: Create Test User

**Required Permissions**:
- Cognito: `AdminCreateUser`, `AdminAddUserToGroup`

```bash
aws cognito-idp admin-create-user \
  --user-pool-id YOUR_USER_POOL_ID \
  --username test@example.com \
  --user-attributes Name=email,Value=test@example.com
```

### Task 4: Query DynamoDB

**Required Permissions**:
- DynamoDB: `Query`, `Scan`

```bash
aws dynamodb scan \
  --table-name chat-logs-review-dev-UnityAIAssistantLogs \
  --limit 10
```

### Task 5: Update Lambda Function

**Required Permissions**:
- Lambda: `UpdateFunctionCode`, `PublishVersion`

```bash
aws lambda update-function-code \
  --function-name insightsphere-dev-processor \
  --zip-file fileb://function.zip
```

---

## Troubleshooting

### Access Denied Errors

1. **Check IAM Policy**: Verify policy is attached
2. **Check Resource ARN**: Ensure ARN matches
3. **Check Conditions**: Verify condition keys
4. **Check Service Control Policies**: Organization-level restrictions

### Permission Boundary Issues

If using permission boundaries:

```bash
aws iam get-user --user-name developer-john-doe
# Check PermissionsBoundary field
```

### Session Token Expiration

For temporary credentials:

```bash
# Refresh credentials
aws sts get-session-token --duration-seconds 3600
```

---

## Additional Resources

- [AWS IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [AWS Security Best Practices](https://aws.amazon.com/architecture/security-identity-compliance/)
- [Amplify CLI Documentation](https://docs.amplify.aws/cli/)
- [DynamoDB Developer Guide](https://docs.aws.amazon.com/dynamodb/latest/developerguide/)

---

## Support

For permission-related issues:
1. Contact DevOps team
2. Submit ticket with error details
3. Include CloudTrail logs if available

**Last Updated**: December 2024  
**Version**: 1.0
