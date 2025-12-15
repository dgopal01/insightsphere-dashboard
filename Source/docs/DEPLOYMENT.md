# Deployment Guide

This document provides comprehensive instructions for deploying the InsightSphere Dashboard to different environments.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [AWS Amplify Setup](#aws-amplify-setup)
- [GitHub Actions CI/CD](#github-actions-cicd)
- [Manual Deployment](#manual-deployment)
- [Custom Domain Configuration](#custom-domain-configuration)
- [Monitoring and Rollback](#monitoring-and-rollback)
- [Troubleshooting](#troubleshooting)

## Overview

InsightSphere Dashboard uses AWS Amplify for hosting and deployment. The application supports three environments:

- **Development**: For active development and testing
- **Staging**: For pre-production testing and QA
- **Production**: For live user access

## Prerequisites

Before deploying, ensure you have:

1. **AWS Account** with appropriate permissions
2. **AWS Amplify CLI** installed: `npm install -g @aws-amplify/cli`
3. **Node.js** version 20.x or higher
4. **Git** repository connected to GitHub
5. **Environment variables** configured for each environment

## Environment Configuration

### 1. Configure Environment Variables

Each environment requires specific configuration. Copy the appropriate `.env` file:

```bash
# For development
cp .env.development .env

# For staging
cp .env.staging .env

# For production
cp .env.production .env
```

### 2. Update AWS Configuration

Edit the `.env` file and replace placeholder values:

```bash
# AWS Amplify Configuration
VITE_AWS_REGION=us-east-1
VITE_USER_POOL_ID=your-user-pool-id
VITE_USER_POOL_CLIENT_ID=your-client-id
VITE_GRAPHQL_ENDPOINT=your-appsync-endpoint
VITE_S3_BUCKET=your-s3-bucket-name
```

### 3. Configure Monitoring (Optional)

For error tracking and monitoring:

```bash
# Sentry Configuration
VITE_SENTRY_DSN=your-sentry-dsn
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=your-auth-token
```

## AWS Amplify Setup

### Initial Setup

1. **Initialize Amplify** (if not already done):

```bash
amplify init
```

Follow the prompts:
- Environment name: `dev`, `staging`, or `prod`
- Default editor: Your preferred editor
- App type: `javascript`
- Framework: `react`
- Source directory: `src`
- Distribution directory: `dist`
- Build command: `npm run build`
- Start command: `npm run dev`

2. **Configure Backend**:

```bash
# Add authentication
amplify add auth

# Add API
amplify add api

# Add storage
amplify add storage

# Push changes to AWS
amplify push
```

3. **Add Hosting**:

```bash
amplify add hosting
```

Select:
- Hosting with Amplify Console
- Continuous deployment

### Environment-Specific Setup

Create separate environments for each deployment stage:

```bash
# Create staging environment
amplify env add staging

# Create production environment
amplify env add prod
```

### Configure Amplify Console

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Select your app
3. Configure build settings using the `amplify.yml` file
4. Set environment variables in the console:
   - Go to App Settings > Environment variables
   - Add all variables from your `.env` file

## GitHub Actions CI/CD

### Setup GitHub Secrets

Add the following secrets to your GitHub repository:

1. Go to Settings > Secrets and variables > Actions
2. Add the following secrets:

**AWS Credentials (per environment):**
- `AWS_ACCESS_KEY_ID_DEV`
- `AWS_SECRET_ACCESS_KEY_DEV`
- `AWS_ACCESS_KEY_ID_STAGING`
- `AWS_SECRET_ACCESS_KEY_STAGING`
- `AWS_ACCESS_KEY_ID_PROD`
- `AWS_SECRET_ACCESS_KEY_PROD`
- `AWS_REGION`

**Sentry (optional):**
- `VITE_SENTRY_DSN`
- `SENTRY_ORG`
- `SENTRY_PROJECT`
- `SENTRY_AUTH_TOKEN`

**Codecov (optional):**
- `CODECOV_TOKEN`

### Deployment Workflow

The CI/CD pipeline automatically triggers on:

- **Push to `develop`**: Deploys to development
- **Push to `staging`**: Deploys to staging
- **Push to `main`**: Deploys to production
- **Pull requests**: Runs tests only

### Manual Trigger

You can manually trigger a deployment:

1. Go to Actions tab in GitHub
2. Select "Deploy InsightSphere Dashboard"
3. Click "Run workflow"
4. Select the branch to deploy

## Manual Deployment

### Development Deployment

```bash
# Build for development
npm run build:dev

# Run pre-deployment checks
npm run predeploy

# Deploy to Amplify
amplify publish --environment dev
```

### Staging Deployment

```bash
# Build for staging
npm run build:staging

# Run pre-deployment checks
npm run predeploy

# Deploy to Amplify
amplify publish --environment staging
```

### Production Deployment

```bash
# Build for production
npm run build:prod

# Run pre-deployment checks
npm run predeploy

# Deploy to Amplify
amplify publish --environment prod
```

## Custom Domain Configuration

### 1. Add Custom Domain in Amplify Console

1. Go to App Settings > Domain management
2. Click "Add domain"
3. Enter your domain name (e.g., `insightsphere.example.com`)
4. Configure subdomains:
   - `www.insightsphere.example.com` → Production
   - `staging.insightsphere.example.com` → Staging
   - `dev.insightsphere.example.com` → Development

### 2. Update DNS Records

Add the CNAME records provided by Amplify to your DNS provider:

```
Type: CNAME
Name: www
Value: [amplify-provided-value]
```

### 3. SSL Certificate

Amplify automatically provisions and manages SSL certificates for custom domains.

### 4. Update Environment Variables

Update the URLs in your environment files:

```bash
# .env.production
VITE_APP_URL=https://insightsphere.example.com
```

## Monitoring and Rollback

### Monitoring Deployment

1. **Amplify Console**: Monitor build progress in real-time
2. **CloudWatch**: View logs and metrics
3. **Sentry**: Track errors and performance issues

### Rollback Procedure

If a deployment fails or causes issues:

#### Via Amplify Console:

1. Go to your app in Amplify Console
2. Click on the environment
3. Find the previous successful deployment
4. Click "Redeploy this version"

#### Via CLI:

```bash
# List previous deployments
amplify env list

# Checkout previous version
git checkout <previous-commit-hash>

# Redeploy
amplify publish
```

### Health Checks

After deployment, verify:

1. **Application loads**: Visit the URL
2. **Authentication works**: Try signing in
3. **API connectivity**: Check dashboard data loads
4. **No console errors**: Open browser DevTools
5. **Performance metrics**: Check Web Vitals

## Troubleshooting

### Build Fails

**Issue**: Build fails during CI/CD

**Solution**:
1. Check build logs in GitHub Actions or Amplify Console
2. Verify all environment variables are set
3. Ensure dependencies are up to date: `npm ci`
4. Run build locally: `npm run build`

### Environment Variables Not Working

**Issue**: App can't connect to AWS services

**Solution**:
1. Verify variables are set in Amplify Console
2. Check variable names match exactly (case-sensitive)
3. Ensure no placeholder values (XXXXXXXXX)
4. Restart the build after updating variables

### Authentication Errors

**Issue**: Users can't sign in

**Solution**:
1. Verify Cognito User Pool ID and Client ID
2. Check Cognito domain configuration
3. Ensure redirect URLs are configured in Cognito
4. Verify IAM permissions for Cognito

### API Connection Issues

**Issue**: GraphQL queries fail

**Solution**:
1. Verify AppSync endpoint URL
2. Check API authentication settings
3. Ensure DynamoDB tables exist
4. Verify IAM roles and permissions

### Bundle Size Too Large

**Issue**: Build warnings about bundle size

**Solution**:
1. Run bundle analyzer: `npm run build:analyze`
2. Review large dependencies
3. Implement code splitting
4. Use dynamic imports for heavy components

### Deployment Timeout

**Issue**: Deployment takes too long or times out

**Solution**:
1. Check network connectivity
2. Verify AWS service status
3. Reduce build complexity
4. Contact AWS support if persistent

## Best Practices

1. **Always test in development first**
2. **Use staging for QA before production**
3. **Monitor deployments closely**
4. **Keep environment variables secure**
5. **Document any configuration changes**
6. **Maintain deployment logs**
7. **Have a rollback plan ready**
8. **Run pre-deployment checks**
9. **Verify health after deployment**
10. **Keep dependencies updated**

## Support

For deployment issues:

1. Check [AWS Amplify Documentation](https://docs.amplify.aws/)
2. Review [GitHub Actions Documentation](https://docs.github.com/en/actions)
3. Contact your DevOps team
4. Open an issue in the repository

## Quick Reference

### Deployment Commands

```bash
# Development
npm run deploy:dev

# Staging
npm run deploy:staging

# Production
npm run deploy:prod

# Health checks
npm run health-check:dev
npm run health-check:staging
npm run health-check:prod

# Domain configuration
npm run configure-domain
```

### Pre-Deployment Checklist

Before deploying, ensure:

1. ✅ All tests pass: `npm run test`
2. ✅ No linting errors: `npm run lint`
3. ✅ Build succeeds: `npm run build`
4. ✅ Pre-deployment checks pass: `npm run predeploy`
5. ✅ Environment variables configured
6. ✅ Code reviewed and approved

See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for complete checklist.

## Related Documentation

- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md) - Complete pre/post-deployment checklist
- [Environment Setup Guide](./ENVIRONMENT_SETUP.md) - Detailed environment configuration
- [Scripts README](../scripts/README.md) - Deployment scripts documentation
- [Backend Setup](./BACKEND_SETUP.md) - AWS backend configuration

## Additional Resources

- [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
- [Vite Build Documentation](https://vitejs.dev/guide/build.html)
- [React Deployment Guide](https://react.dev/learn/start-a-new-react-project#deploying-to-production)
- [AWS CloudWatch](https://console.aws.amazon.com/cloudwatch/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
