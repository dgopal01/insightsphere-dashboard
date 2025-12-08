# AWS Monitoring Role Permissions Guide

## Overview
This document outlines the AWS IAM permissions required for the monitoring role to observe, analyze, and alert on the EthosAI application's health, performance, and security.

## Table of Contents
1. [Monitoring Role Purpose](#monitoring-role-purpose)
2. [Monitoring IAM Policy](#monitoring-iam-policy)
3. [Service-Specific Permissions](#service-specific-permissions)
4. [Monitoring Capabilities](#monitoring-capabilities)
5. [Setup Instructions](#setup-instructions)
6. [Dashboards and Alerts](#dashboards-and-alerts)
7. [Security Considerations](#security-considerations)

---

## Monitoring Role Purpose

The monitoring role is designed for:
- **Read-only access** to all application resources
- **Viewing logs** and metrics across all services
- **Creating and managing** CloudWatch dashboards and alarms
- **Analyzing performance** and identifying issues
- **Security auditing** and compliance monitoring
- **Cost optimization** insights

**Key Principle**: No write access to application data or infrastructure (except monitoring resources)

---

## Monitoring IAM Policy

### Complete Monitoring Policy (JSON)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CloudWatchFullAccess",
      "Effect": "Allow",
      "Action": [
        "cloudwatch:*",
        "logs:*",
        "events:*",
        "sns:*",
        "autoscaling:Describe*"
      ],
      "Resource": "*"
    },
    {
      "Sid": "CognitoReadOnly",
      "Effect": "Allow",
      "Action": [
        "cognito-idp:DescribeUserPool",
        "cognito-idp:DescribeUserPoolClient",
        "cognito-idp:ListUsers",
        "cognito-idp:ListGroups",
        "cognito-idp:ListUserPools",
        "cognito-idp:GetUser",
        "cognito-idp:AdminGetUser",
        "cognito-idp:ListUsersInGroup",
        "cognito-identity:DescribeIdentityPool",
        "cognito-identity:ListIdentityPools",
        "cognito-identity:GetIdentityPoolRoles"
      ],
      "Resource": "*"
    },
    {
      "Sid": "DynamoDBReadOnly",
      "Effect": "Allow",
      "Action": [
        "dynamodb:DescribeTable",
        "dynamodb:DescribeTimeToLive",
        "dynamodb:DescribeContinuousBackups",
        "dynamodb:DescribeBackup",
        "dynamodb:ListTables",
        "dynamodb:ListBackups",
        "dynamodb:ListGlobalTables",
        "dynamodb:GetItem",
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:DescribeStream",
        "dynamodb:ListStreams"
      ],
      "Resource": [
        "arn:aws:dynamodb:*:*:table/chat-logs-review-*",
        "arn:aws:dynamodb:*:*:table/UnityAIAssistantEvalJob",
        "arn:aws:dynamodb:*:*:table/insightsphere-*"
      ]
    },
    {
      "Sid": "AppSyncReadOnly",
      "Effect": "Allow",
      "Action": [
        "appsync:GetGraphqlApi",
        "appsync:ListGraphqlApis",
        "appsync:GetDataSource",
        "appsync:ListDataSources",
        "appsync:GetResolver",
        "appsync:ListResolvers",
        "appsync:GetType",
        "appsync:ListTypes",
        "appsync:GetIntrospectionSchema"
      ],
      "Resource": "*"
    },
    {
      "Sid": "S3ReadOnly",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket",
        "s3:GetBucketLocation",
        "s3:GetBucketVersioning",
        "s3:GetBucketLogging",
        "s3:GetBucketPolicy",
        "s3:GetBucketAcl",
        "s3:GetBucketCORS",
        "s3:GetBucketWebsite",
        "s3:GetBucketNotification",
        "s3:GetLifecycleConfiguration",
        "s3:GetReplicationConfiguration",
        "s3:GetMetricsConfiguration",
        "s3:GetAnalyticsConfiguration",
        "s3:GetInventoryConfiguration"
      ],
      "Resource": [
        "arn:aws:s3:::insightsphere-*",
        "arn:aws:s3:::insightsphere-*/*",
        "arn:aws:s3:::amplify-*",
        "arn:aws:s3:::amplify-*/*"
      ]
    },
    {
      "Sid": "AmplifyReadOnly",
      "Effect": "Allow",
      "Action": [
        "amplify:GetApp",
        "amplify:ListApps",
        "amplify:GetBranch",
        "amplify:ListBranches",
        "amplify:GetJob",
        "amplify:ListJobs",
        "amplify:GetBackendEnvironment",
        "amplify:ListBackendEnvironments",
        "amplify:GetDomainAssociation",
        "amplify:ListDomainAssociations"
      ],
      "Resource": "*"
    },
    {
      "Sid": "LambdaReadOnly",
      "Effect": "Allow",
      "Action": [
        "lambda:GetFunction",
        "lambda:GetFunctionConfiguration",
        "lambda:ListFunctions",
        "lambda:ListVersionsByFunction",
        "lambda:ListAliases",
        "lambda:GetPolicy",
        "lambda:ListEventSourceMappings",
        "lambda:GetEventSourceMapping"
      ],
      "Resource": "*"
    },
    {
      "Sid": "CloudFormationReadOnly",
      "Effect": "Allow",
      "Action": [
        "cloudformation:DescribeStacks",
        "cloudformation:DescribeStackEvents",
        "cloudformation:DescribeStackResources",
        "cloudformation:DescribeStackResource",
        "cloudformation:GetTemplate",
        "cloudformation:ListStacks",
        "cloudformation:ListStackResources",
        "cloudformation:GetStackPolicy"
      ],
      "Resource": "*"
    },
    {
      "Sid": "IAMReadOnly",
      "Effect": "Allow",
      "Action": [
        "iam:GetRole",
        "iam:GetRolePolicy",
        "iam:GetPolicy",
        "iam:GetPolicyVersion",
        "iam:ListRoles",
        "iam:ListPolicies",
        "iam:ListAttachedRolePolicies",
        "iam:ListRolePolicies",
        "iam:ListUsers",
        "iam:ListGroups",
        "iam:GetUser",
        "iam:GetGroup",
        "iam:ListGroupsForUser",
        "iam:ListAttachedUserPolicies",
        "iam:ListUserPolicies"
      ],
      "Resource": "*"
    },
    {
      "Sid": "CloudTrailReadOnly",
      "Effect": "Allow",
      "Action": [
        "cloudtrail:LookupEvents",
        "cloudtrail:GetTrailStatus",
        "cloudtrail:DescribeTrails",
        "cloudtrail:ListTrails",
        "cloudtrail:GetEventSelectors",
        "cloudtrail:GetInsightSelectors"
      ],
      "Resource": "*"
    },
    {
      "Sid": "XRayReadOnly",
      "Effect": "Allow",
      "Action": [
        "xray:GetSamplingRules",
        "xray:GetSamplingTargets",
        "xray:GetSamplingStatisticSummaries",
        "xray:GetServiceGraph",
        "xray:GetTraceGraph",
        "xray:GetTraceSummaries",
        "xray:GetTimeSeriesServiceStatistics",
        "xray:BatchGetTraces"
      ],
      "Resource": "*"
    },
    {
      "Sid": "CostExplorerReadOnly",
      "Effect": "Allow",
      "Action": [
        "ce:GetCostAndUsage",
        "ce:GetCostForecast",
        "ce:GetDimensionValues",
        "ce:GetTags"
      ],
      "Resource": "*"
    },
    {
      "Sid": "TrustedAdvisorReadOnly",
      "Effect": "Allow",
      "Action": [
        "support:DescribeTrustedAdvisorChecks",
        "support:DescribeTrustedAdvisorCheckResult",
        "support:DescribeTrustedAdvisorCheckSummaries"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## Service-Specific Permissions

### 1. CloudWatch (Full Access)

**Purpose**: Core monitoring, logging, and alerting

```json
{
  "Effect": "Allow",
  "Action": [
    "cloudwatch:*",
    "logs:*",
    "events:*"
  ],
  "Resource": "*"
}
```

**Capabilities**:
- Create/update/delete dashboards
- Create/update/delete alarms
- View all metrics and logs
- Create log insights queries
- Set up EventBridge rules
- Configure SNS notifications

### 2. Cognito (Read-Only)

**Purpose**: Monitor user authentication and authorization

```json
{
  "Effect": "Allow",
  "Action": [
    "cognito-idp:DescribeUserPool",
    "cognito-idp:ListUsers",
    "cognito-idp:ListGroups",
    "cognito-identity:DescribeIdentityPool"
  ],
  "Resource": "*"
}
```

**Monitoring Metrics**:
- User sign-in success/failure rates
- Active user count
- User pool configuration
- Identity pool usage
- MFA adoption rate

### 3. DynamoDB (Read-Only)

**Purpose**: Monitor database performance and usage

```json
{
  "Effect": "Allow",
  "Action": [
    "dynamodb:DescribeTable",
    "dynamodb:ListTables",
    "dynamodb:GetItem",
    "dynamodb:Query",
    "dynamodb:Scan"
  ],
  "Resource": "arn:aws:dynamodb:*:*:table/*"
}
```

**Monitoring Metrics**:
- Read/write capacity units
- Throttled requests
- Table size and item count
- Query latency
- Scan operations
- Global secondary index usage

### 4. AppSync (Read-Only)

**Purpose**: Monitor GraphQL API performance

```json
{
  "Effect": "Allow",
  "Action": [
    "appsync:GetGraphqlApi",
    "appsync:ListGraphqlApis",
    "appsync:GetDataSource"
  ],
  "Resource": "*"
}
```

**Monitoring Metrics**:
- API request count
- Error rates (4xx, 5xx)
- Latency (p50, p95, p99)
- Resolver execution time
- Data source errors

### 5. Lambda (Read-Only)

**Purpose**: Monitor serverless function performance

```json
{
  "Effect": "Allow",
  "Action": [
    "lambda:GetFunction",
    "lambda:ListFunctions",
    "lambda:GetFunctionConfiguration"
  ],
  "Resource": "*"
}
```

**Monitoring Metrics**:
- Invocation count
- Error count and rate
- Duration (average, max)
- Throttles
- Concurrent executions
- Memory usage

### 6. S3 (Read-Only)

**Purpose**: Monitor storage usage and access patterns

```json
{
  "Effect": "Allow",
  "Action": [
    "s3:GetObject",
    "s3:ListBucket",
    "s3:GetBucketLocation"
  ],
  "Resource": "arn:aws:s3:::insightsphere-*"
}
```

**Monitoring Metrics**:
- Bucket size
- Number of objects
- Request metrics (GET, PUT, DELETE)
- Data transfer
- Error rates

---

## Monitoring Capabilities

### 1. Application Performance Monitoring (APM)

**Metrics to Monitor**:
- Page load time
- API response time
- Error rates
- User session duration
- Feature usage

**CloudWatch Metrics**:
```bash
# View API latency
aws cloudwatch get-metric-statistics \
  --namespace AWS/AppSync \
  --metric-name Latency \
  --dimensions Name=GraphQLAPIId,Value=YOUR_API_ID \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-02T00:00:00Z \
  --period 3600 \
  --statistics Average,Maximum
```

### 2. User Activity Monitoring

**Metrics to Track**:
- Daily active users (DAU)
- Monthly active users (MAU)
- Sign-in success rate
- Failed authentication attempts
- User session patterns

**CloudWatch Logs Insights Query**:
```sql
fields @timestamp, @message
| filter @message like /sign-in/
| stats count() by bin(5m)
```

### 3. Database Performance Monitoring

**Metrics to Monitor**:
- Read/write throughput
- Consumed capacity
- Throttled requests
- Query latency
- Table scan operations

**CloudWatch Alarm Example**:
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name high-dynamodb-throttles \
  --alarm-description "Alert when DynamoDB throttles exceed threshold" \
  --metric-name UserErrors \
  --namespace AWS/DynamoDB \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2
```

### 4. Error and Exception Monitoring

**Error Types to Track**:
- Application errors (500s)
- Client errors (400s)
- Authentication failures
- Database errors
- API timeouts

**CloudWatch Logs Insights Query**:
```sql
fields @timestamp, @message, @logStream
| filter @message like /ERROR/
| stats count() by bin(1h)
| sort @timestamp desc
```

### 5. Security Monitoring

**Security Events to Monitor**:
- Failed login attempts
- Unauthorized access attempts
- IAM policy changes
- Unusual API activity
- Data access patterns

**CloudTrail Query**:
```bash
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventName,AttributeValue=ConsoleLogin \
  --max-results 50
```

### 6. Cost Monitoring

**Cost Metrics to Track**:
- Daily/monthly spend by service
- Cost trends and forecasts
- Resource utilization
- Unused resources
- Cost anomalies

**Cost Explorer Query**:
```bash
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity DAILY \
  --metrics BlendedCost \
  --group-by Type=SERVICE
```

---

## Setup Instructions

### 1. Create Monitoring IAM Role

```bash
# Create trust policy
cat > trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "AWS": "arn:aws:iam::ACCOUNT_ID:root"
    },
    "Action": "sts:AssumeRole"
  }]
}
EOF

# Create role
aws iam create-role \
  --role-name InsightSphereMonitoringRole \
  --assume-role-policy-document file://trust-policy.json
```

### 2. Attach Monitoring Policy

```bash
# Create policy
aws iam create-policy \
  --policy-name InsightSphereMonitoringPolicy \
  --policy-document file://monitoring-policy.json

# Attach policy to role
aws iam attach-role-policy \
  --role-name InsightSphereMonitoringRole \
  --policy-arn arn:aws:iam::ACCOUNT_ID:policy/InsightSphereMonitoringPolicy
```

### 3. Create Monitoring User

```bash
# Create user
aws iam create-user --user-name monitoring-user

# Attach policy
aws iam attach-user-policy \
  --user-name monitoring-user \
  --policy-arn arn:aws:iam::ACCOUNT_ID:policy/InsightSphereMonitoringPolicy

# Create access keys
aws iam create-access-key --user-name monitoring-user
```

### 4. Configure Monitoring Tools

**For CloudWatch Dashboard**:
```bash
# Create dashboard
aws cloudwatch put-dashboard \
  --dashboard-name InsightSphere-Overview \
  --dashboard-body file://dashboard-config.json
```

**For Third-Party Tools** (Datadog, New Relic, etc.):
- Use the monitoring role ARN
- Configure cross-account access if needed
- Set up metric streaming

---

## Dashboards and Alerts

### 1. Application Overview Dashboard

**Widgets**:
- API request rate
- Error rate
- Average latency
- Active users
- Database operations

**CloudWatch Dashboard JSON**:
```json
{
  "widgets": [
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["AWS/AppSync", "4XXError", {"stat": "Sum"}],
          [".", "5XXError", {"stat": "Sum"}]
        ],
        "period": 300,
        "stat": "Sum",
        "region": "us-east-1",
        "title": "API Errors"
      }
    }
  ]
}
```

### 2. Database Performance Dashboard

**Metrics**:
- Read/write capacity
- Consumed capacity
- Throttled requests
- Query latency

### 3. User Activity Dashboard

**Metrics**:
- Sign-ins per hour
- Active sessions
- Failed authentications
- User distribution by group

### 4. Cost Dashboard

**Metrics**:
- Daily spend by service
- Month-to-date total
- Forecast vs. actual
- Top 5 cost drivers

### 5. Critical Alerts

**High Priority Alarms**:

```bash
# High error rate
aws cloudwatch put-metric-alarm \
  --alarm-name high-error-rate \
  --metric-name 5XXError \
  --namespace AWS/AppSync \
  --statistic Sum \
  --period 300 \
  --threshold 50 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --alarm-actions arn:aws:sns:us-east-1:ACCOUNT_ID:critical-alerts

# High latency
aws cloudwatch put-metric-alarm \
  --alarm-name high-latency \
  --metric-name Latency \
  --namespace AWS/AppSync \
  --statistic Average \
  --period 300 \
  --threshold 1000 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 3 \
  --alarm-actions arn:aws:sns:us-east-1:ACCOUNT_ID:performance-alerts

# DynamoDB throttling
aws cloudwatch put-metric-alarm \
  --alarm-name dynamodb-throttles \
  --metric-name UserErrors \
  --namespace AWS/DynamoDB \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --alarm-actions arn:aws:sns:us-east-1:ACCOUNT_ID:database-alerts
```

---

## Security Considerations

### 1. Read-Only Access

The monitoring role has **no write access** to:
- Application data (DynamoDB)
- User accounts (Cognito)
- Infrastructure (CloudFormation)
- Code (Lambda, Amplify)

**Exception**: Can create/modify monitoring resources (dashboards, alarms)

### 2. Data Privacy

When viewing logs:
- Mask sensitive data (PII, credentials)
- Use CloudWatch Logs data protection
- Implement log retention policies
- Restrict access to sensitive log groups

### 3. Audit Trail

All monitoring activities are logged:
- CloudTrail tracks all API calls
- Review monitoring user activity monthly
- Alert on unusual access patterns

### 4. Least Privilege

- Grant only necessary permissions
- Use resource-specific ARNs where possible
- Avoid wildcard (*) permissions for data access
- Regular permission reviews

---

## Common Monitoring Tasks

### Task 1: View Application Logs

```bash
# Tail logs in real-time
aws logs tail /aws/amplify/insightsphere-prod --follow

# Query logs with Insights
aws logs start-query \
  --log-group-name /aws/amplify/insightsphere-prod \
  --start-time $(date -d '1 hour ago' +%s) \
  --end-time $(date +%s) \
  --query-string 'fields @timestamp, @message | filter @message like /ERROR/ | sort @timestamp desc'
```

### Task 2: Check API Performance

```bash
# Get API metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/AppSync \
  --metric-name Latency \
  --dimensions Name=GraphQLAPIId,Value=YOUR_API_ID \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average,Maximum,Minimum
```

### Task 3: Monitor Database Usage

```bash
# Get DynamoDB metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/DynamoDB \
  --metric-name ConsumedReadCapacityUnits \
  --dimensions Name=TableName,Value=chat-logs-review-prod-UnityAIAssistantLogs \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Sum
```

### Task 4: Review Security Events

```bash
# Check CloudTrail for security events
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventName,AttributeValue=ConsoleLogin \
  --max-results 50 \
  --query 'Events[?contains(CloudTrailEvent, `"errorCode"`)].{Time:EventTime,User:Username,Error:CloudTrailEvent}'
```

### Task 5: Generate Cost Report

```bash
# Get cost breakdown
aws ce get-cost-and-usage \
  --time-period Start=$(date -d '30 days ago' +%Y-%m-%d),End=$(date +%Y-%m-%d) \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=SERVICE \
  --output table
```

---

## Monitoring Best Practices

### 1. Set Up Comprehensive Dashboards

Create dashboards for:
- Application health
- User activity
- Database performance
- Cost tracking
- Security events

### 2. Configure Meaningful Alerts

Alert on:
- Error rate thresholds
- Performance degradation
- Security anomalies
- Cost spikes
- Resource exhaustion

### 3. Regular Reviews

- Daily: Check critical metrics
- Weekly: Review trends and patterns
- Monthly: Analyze costs and optimization opportunities
- Quarterly: Review and update monitoring strategy

### 4. Documentation

Document:
- Alert thresholds and rationale
- Escalation procedures
- Runbooks for common issues
- Dashboard interpretations

### 5. Continuous Improvement

- Refine alert thresholds based on experience
- Add new metrics as application evolves
- Remove noise from alerts
- Optimize dashboard layouts

---

## Additional Resources

- [CloudWatch Documentation](https://docs.aws.amazon.com/cloudwatch/)
- [CloudWatch Logs Insights Query Syntax](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax.html)
- [AWS Well-Architected Framework - Operational Excellence](https://docs.aws.amazon.com/wellarchitected/latest/operational-excellence-pillar/)
- [AWS Cost Optimization](https://aws.amazon.com/aws-cost-management/)

---

## Support

For monitoring-related issues:
1. Check CloudWatch dashboards
2. Review recent alarms
3. Contact DevOps team
4. Escalate to on-call engineer if critical

**Last Updated**: December 2024  
**Version**: 1.0
