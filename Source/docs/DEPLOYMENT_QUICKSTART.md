# Deployment Quick Start Guide

This guide provides a quick reference for deploying InsightSphere Dashboard.

## Prerequisites

- ✅ Node.js 20.x or higher installed
- ✅ AWS Amplify CLI installed: `npm install -g @aws-amplify/cli`
- ✅ AWS account with appropriate permissions
- ✅ GitHub repository access
- ✅ Environment variables configured

## First-Time Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd insightsphere-dashboard
npm install
```

### 2. Configure AWS Amplify

```bash
# Initialize Amplify
amplify init

# Add environments
amplify env add dev
amplify env add staging
amplify env add prod

# Push backend configuration
amplify push
```

### 3. Configure Environment Variables

```bash
# Copy environment template
cp .env.example .env.development
cp .env.example .env.staging
cp .env.example .env.production

# Edit each file and replace placeholder values
# Get values from AWS Amplify Console after backend deployment
```

### 4. Configure GitHub Secrets

Go to GitHub repository Settings > Secrets and variables > Actions

Add these secrets:
- `AWS_ACCESS_KEY_ID_DEV`
- `AWS_SECRET_ACCESS_KEY_DEV`
- `AWS_ACCESS_KEY_ID_STAGING`
- `AWS_SECRET_ACCESS_KEY_STAGING`
- `AWS_ACCESS_KEY_ID_PROD`
- `AWS_SECRET_ACCESS_KEY_PROD`
- `AWS_REGION`
- `VITE_SENTRY_DSN` (optional)
- `SENTRY_ORG` (optional)
- `SENTRY_PROJECT` (optional)
- `SENTRY_AUTH_TOKEN` (optional)
- `CODECOV_TOKEN` (optional)

### 5. Configure Amplify Console

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Connect your GitHub repository
3. Configure branch settings:
   - `main` → production
   - `staging` → staging
   - `develop` → development
4. Set environment variables in Amplify Console
5. Enable automatic deployments

## Daily Deployment Workflow

### Development Deployment

```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Make changes and commit
git add .
git commit -m "Add new feature"

# 3. Push to develop branch
git checkout develop
git merge feature/my-feature
git push origin develop

# 4. Automatic deployment triggered via GitHub Actions
# 5. Monitor deployment in GitHub Actions and Amplify Console
```

### Staging Deployment

```bash
# 1. Merge develop into staging
git checkout staging
git merge develop
git push origin staging

# 2. Automatic deployment triggered
# 3. Run QA tests on staging environment
# 4. Verify all features work correctly
```

### Production Deployment

```bash
# 1. Merge staging into main
git checkout main
git merge staging
git push origin main

# 2. Automatic deployment triggered
# 3. Monitor deployment closely
# 4. Run health checks
npm run health-check:prod

# 5. Verify critical features
# 6. Monitor error tracking and logs
```

## Manual Deployment

If you need to deploy manually:

```bash
# Development
npm run deploy:dev

# Staging
npm run deploy:staging

# Production
npm run deploy:prod
```

## Quick Commands

### Build Commands

```bash
# Build for development
npm run build:dev

# Build for staging
npm run build:staging

# Build for production
npm run build:prod

# Build and analyze bundle size
npm run build:analyze
```

### Testing Commands

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint

# Run type checking
npm run type-check
```

### Deployment Commands

```bash
# Pre-deployment checks
npm run predeploy

# Deploy to environment
npm run deploy:dev
npm run deploy:staging
npm run deploy:prod

# Health checks
npm run health-check:dev
npm run health-check:staging
npm run health-check:prod
```

### Utility Commands

```bash
# Configure custom domain
npm run configure-domain

# View deployment documentation
cat docs/DEPLOYMENT.md

# View deployment checklist
cat docs/DEPLOYMENT_CHECKLIST.md
```

## Verification Steps

After deployment, verify:

### 1. Application Loads
```bash
# Open in browser
# Dev: https://dev.insightsphere.example.com
# Staging: https://staging.insightsphere.example.com
# Prod: https://insightsphere.example.com
```

### 2. Run Health Checks
```bash
npm run health-check:prod
```

### 3. Check Key Features
- [ ] Sign in works
- [ ] Dashboard displays metrics
- [ ] Chat logs load
- [ ] Filters work
- [ ] CSV export works
- [ ] Feedback submission works
- [ ] Theme switching works

### 4. Monitor Logs
- Check AWS Amplify Console for build logs
- Check CloudWatch for backend logs
- Check Sentry for frontend errors (if configured)

## Troubleshooting

### Build Fails

```bash
# Check build locally
npm run build

# Check for errors
npm run lint
npm run type-check
npm run test
```

### Deployment Fails

```bash
# Check Amplify environment
amplify env list

# Pull latest environment config
amplify pull

# Verify AWS credentials
aws sts get-caller-identity
```

### Application Not Loading

```bash
# Check environment variables
cat .env.production

# Verify backend resources
amplify status

# Check CloudWatch logs
# Go to AWS CloudWatch Console
```

## Rollback

If deployment causes issues:

### Via Amplify Console
1. Go to AWS Amplify Console
2. Select your app
3. Click on the environment
4. Find previous successful deployment
5. Click "Redeploy this version"

### Via Git
```bash
# Revert the problematic commit
git revert <commit-hash>
git push origin main

# Automatic redeployment triggered
```

## Common Issues

### Issue: Environment variables not working

**Solution**:
```bash
# Verify variables in Amplify Console
# App Settings > Environment variables

# Ensure no placeholder values (XXXXXXXXX)
# Restart build after updating variables
```

### Issue: Authentication not working

**Solution**:
```bash
# Verify Cognito configuration
amplify auth status

# Check User Pool ID and Client ID
# Verify redirect URLs in Cognito Console
```

### Issue: API queries failing

**Solution**:
```bash
# Verify AppSync endpoint
amplify api status

# Check DynamoDB tables exist
# Verify IAM permissions
```

## Getting Help

1. **Check Documentation**:
   - [Full Deployment Guide](./DEPLOYMENT.md)
   - [Environment Setup](./ENVIRONMENT_SETUP.md)
   - [CI/CD Pipeline](./CI_CD_PIPELINE.md)
   - [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)

2. **Check Logs**:
   - GitHub Actions logs
   - AWS Amplify Console logs
   - CloudWatch logs
   - Browser console

3. **Contact Support**:
   - DevOps team
   - AWS Support
   - GitHub repository issues

## Next Steps

After successful deployment:

1. ✅ Configure custom domain (optional)
2. ✅ Set up monitoring alerts
3. ✅ Configure backup policies
4. ✅ Document any custom configurations
5. ✅ Train team on deployment process
6. ✅ Schedule regular security reviews
7. ✅ Plan for disaster recovery

## Additional Resources

- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)

---

**Last Updated**: 2024-12-04

**Maintained By**: DevOps Team
