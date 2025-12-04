# Environment Setup Guide

This guide provides detailed instructions for setting up and configuring each deployment environment.

## Overview

InsightSphere Dashboard supports three environments:

- **Development**: For active development and testing
- **Staging**: For pre-production testing and QA
- **Production**: For live user access

Each environment has its own AWS resources, configuration, and deployment pipeline.

## Environment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Development                              │
│  Branch: develop                                             │
│  URL: https://dev.insightsphere.example.com                  │
│  Purpose: Active development and testing                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Staging                                 │
│  Branch: staging                                             │
│  URL: https://staging.insightsphere.example.com              │
│  Purpose: Pre-production testing and QA                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Production                               │
│  Branch: main                                                │
│  URL: https://insightsphere.example.com                      │
│  Purpose: Live user access                                   │
└─────────────────────────────────────────────────────────────┘
```

## Development Environment

### Purpose

- Active feature development
- Unit and integration testing
- Rapid iteration and debugging
- Developer experimentation

### Configuration

**Branch**: `develop`

**Environment File**: `.env.development`

**Key Settings**:
```bash
VITE_ENV=development
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
VITE_ENABLE_SOURCE_MAPS=true
VITE_ENABLE_ERROR_TRACKING=true
VITE_ENABLE_ANALYTICS=false
```

### AWS Resources

- **Cognito User Pool**: `insightsphere-dev`
- **AppSync API**: `insightsphere-dev-api`
- **DynamoDB Tables**: 
  - `ChatLog-dev`
  - `Feedback-dev`
- **S3 Bucket**: `insightsphere-dev-exports`

### Setup Steps

1. **Create Amplify Environment**:
   ```bash
   amplify env add dev
   ```

2. **Configure Backend**:
   ```bash
   amplify push --environment dev
   ```

3. **Update Environment Variables**:
   - Copy `.env.development` to `.env`
   - Replace placeholder values with actual AWS resource IDs
   - Commit `.env.development` (without sensitive values)
   - Add `.env` to `.gitignore`

4. **Verify Configuration**:
   ```bash
   npm run build:dev
   npm run predeploy
   ```

5. **Deploy**:
   ```bash
   npm run deploy:dev
   ```

### Access Control

- All developers have access
- No production data
- Test users only
- Relaxed security for debugging

## Staging Environment

### Purpose

- Pre-production testing
- QA validation
- Performance testing
- User acceptance testing (UAT)
- Integration testing with production-like data

### Configuration

**Branch**: `staging`

**Environment File**: `.env.staging`

**Key Settings**:
```bash
VITE_ENV=staging
VITE_DEBUG_MODE=false
VITE_LOG_LEVEL=info
VITE_ENABLE_SOURCE_MAPS=true
VITE_ENABLE_ERROR_TRACKING=true
VITE_ENABLE_ANALYTICS=true
```

### AWS Resources

- **Cognito User Pool**: `insightsphere-staging`
- **AppSync API**: `insightsphere-staging-api`
- **DynamoDB Tables**: 
  - `ChatLog-staging`
  - `Feedback-staging`
- **S3 Bucket**: `insightsphere-staging-exports`

### Setup Steps

1. **Create Amplify Environment**:
   ```bash
   amplify env add staging
   ```

2. **Configure Backend**:
   ```bash
   amplify push --environment staging
   ```

3. **Populate Test Data**:
   - Import sample chat logs
   - Create test users
   - Generate test feedback

4. **Update Environment Variables**:
   - Copy `.env.staging` to `.env`
   - Replace placeholder values
   - Configure monitoring tools

5. **Verify Configuration**:
   ```bash
   npm run build:staging
   npm run predeploy
   ```

6. **Deploy**:
   ```bash
   npm run deploy:staging
   ```

### Access Control

- QA team has access
- Product owners have access
- Limited developer access
- Test data only (no real user data)
- Production-like security settings

### Testing Requirements

Before promoting to production:

- [ ] All automated tests pass
- [ ] Manual QA testing complete
- [ ] Performance benchmarks met
- [ ] Security scan passed
- [ ] Accessibility audit passed
- [ ] Browser compatibility verified
- [ ] Mobile responsiveness verified
- [ ] Load testing completed

## Production Environment

### Purpose

- Live user access
- Real data processing
- Business operations
- Customer-facing application

### Configuration

**Branch**: `main`

**Environment File**: `.env.production`

**Key Settings**:
```bash
VITE_ENV=production
VITE_DEBUG_MODE=false
VITE_LOG_LEVEL=error
VITE_ENABLE_SOURCE_MAPS=false
VITE_ENABLE_ERROR_TRACKING=true
VITE_ENABLE_ANALYTICS=true
```

### AWS Resources

- **Cognito User Pool**: `insightsphere-prod`
- **AppSync API**: `insightsphere-prod-api`
- **DynamoDB Tables**: 
  - `ChatLog-prod`
  - `Feedback-prod`
- **S3 Bucket**: `insightsphere-prod-exports`

### Setup Steps

1. **Create Amplify Environment**:
   ```bash
   amplify env add prod
   ```

2. **Configure Backend**:
   ```bash
   amplify push --environment prod
   ```

3. **Configure Monitoring**:
   - Set up CloudWatch alarms
   - Configure Sentry error tracking
   - Set up performance monitoring
   - Configure custom dashboards

4. **Update Environment Variables**:
   - Copy `.env.production` to `.env`
   - Replace all placeholder values
   - Verify no test/placeholder values remain
   - Configure all monitoring tools

5. **Security Hardening**:
   - Enable WAF rules
   - Configure rate limiting
   - Set up DDoS protection
   - Review IAM permissions
   - Enable CloudTrail logging

6. **Verify Configuration**:
   ```bash
   npm run build:prod
   npm run predeploy
   ```

7. **Deploy**:
   ```bash
   npm run deploy:prod
   ```

8. **Post-Deployment**:
   ```bash
   npm run health-check:prod
   ```

### Access Control

- Restricted access
- Admin users only
- Real user data
- Strict security settings
- Audit logging enabled
- MFA required for admin access

### Monitoring

- **Error Tracking**: Sentry configured with production DSN
- **Performance**: Web Vitals monitoring enabled
- **Logs**: CloudWatch logs with retention policy
- **Metrics**: Custom CloudWatch dashboards
- **Alerts**: Configured for critical errors and performance issues

### Backup and Recovery

- **Database**: DynamoDB point-in-time recovery enabled
- **S3**: Versioning enabled on export bucket
- **Backup Schedule**: Daily automated backups
- **Recovery Time Objective (RTO)**: < 1 hour
- **Recovery Point Objective (RPO)**: < 15 minutes

## Environment Variables Reference

### Required Variables (All Environments)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_ENV` | Environment identifier | `development`, `staging`, `production` |
| `VITE_AWS_REGION` | AWS region | `us-east-1` |
| `VITE_USER_POOL_ID` | Cognito User Pool ID | `us-east-1_XXXXXXXXX` |
| `VITE_USER_POOL_CLIENT_ID` | Cognito Client ID | `XXXXXXXXXXXXXXXXXXXXXXXXXX` |
| `VITE_GRAPHQL_ENDPOINT` | AppSync GraphQL endpoint | `https://xxx.appsync-api.us-east-1.amazonaws.com/graphql` |
| `VITE_S3_BUCKET` | S3 bucket for exports | `insightsphere-{env}-exports` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_TIMEOUT` | API request timeout (ms) | `30000` |
| `VITE_API_RETRY_ATTEMPTS` | Number of retry attempts | `3` |
| `VITE_ENABLE_ANALYTICS` | Enable analytics tracking | `false` |
| `VITE_ENABLE_ERROR_TRACKING` | Enable error tracking | `false` |
| `VITE_SENTRY_DSN` | Sentry DSN for error tracking | - |
| `VITE_DEBUG_MODE` | Enable debug mode | `false` |
| `VITE_LOG_LEVEL` | Logging level | `error` |

## GitHub Secrets Configuration

Configure these secrets in GitHub repository settings for CI/CD:

### AWS Credentials

- `AWS_ACCESS_KEY_ID_DEV`
- `AWS_SECRET_ACCESS_KEY_DEV`
- `AWS_ACCESS_KEY_ID_STAGING`
- `AWS_SECRET_ACCESS_KEY_STAGING`
- `AWS_ACCESS_KEY_ID_PROD`
- `AWS_SECRET_ACCESS_KEY_PROD`
- `AWS_REGION`

### Monitoring

- `VITE_SENTRY_DSN`
- `SENTRY_ORG`
- `SENTRY_PROJECT`
- `SENTRY_AUTH_TOKEN`

### Code Coverage

- `CODECOV_TOKEN`

## Switching Between Environments

### Local Development

```bash
# Switch to development
cp .env.development .env
npm run dev

# Switch to staging
cp .env.staging .env
npm run dev

# Switch to production (for testing only)
cp .env.production .env
npm run dev
```

### Amplify CLI

```bash
# List environments
amplify env list

# Switch environment
amplify env checkout dev
amplify env checkout staging
amplify env checkout prod

# Pull environment configuration
amplify pull --environment dev
```

## Troubleshooting

### Environment Variables Not Loading

**Issue**: Application can't connect to AWS services

**Solution**:
1. Verify `.env` file exists in project root
2. Check variable names match exactly (case-sensitive)
3. Ensure no placeholder values (XXXXXXXXX)
4. Restart development server after changes
5. Clear browser cache

### Wrong Environment Deployed

**Issue**: Deployed to wrong environment

**Solution**:
1. Check current branch: `git branch`
2. Verify Amplify environment: `amplify env list`
3. If wrong environment, rollback in Amplify Console
4. Deploy to correct environment

### Authentication Errors

**Issue**: Users can't sign in

**Solution**:
1. Verify Cognito User Pool ID
2. Check Cognito Client ID
3. Ensure redirect URLs configured in Cognito
4. Verify IAM permissions
5. Check CloudWatch logs for errors

### API Connection Issues

**Issue**: GraphQL queries fail

**Solution**:
1. Verify AppSync endpoint URL
2. Check API authentication settings
3. Ensure DynamoDB tables exist
4. Verify IAM roles and permissions
5. Check network connectivity

## Best Practices

1. **Never commit `.env` files** with real credentials
2. **Always test in development first** before staging
3. **Use staging for QA** before production deployment
4. **Keep environment configurations in sync** (structure, not values)
5. **Document any environment-specific changes**
6. **Regularly review and rotate credentials**
7. **Monitor all environments** for issues
8. **Maintain separate AWS accounts** for production isolation
9. **Use infrastructure as code** for reproducibility
10. **Automate environment setup** where possible

## Additional Resources

- [AWS Amplify Environments](https://docs.amplify.aws/cli/teams/overview/)
- [Environment Variables in Vite](https://vitejs.dev/guide/env-and-mode.html)
- [AWS Best Practices](https://aws.amazon.com/architecture/well-architected/)
- [Twelve-Factor App](https://12factor.net/)
