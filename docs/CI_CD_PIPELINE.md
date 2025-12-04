# CI/CD Pipeline Documentation

This document describes the Continuous Integration and Continuous Deployment (CI/CD) pipeline for InsightSphere Dashboard.

## Overview

The CI/CD pipeline is implemented using GitHub Actions and AWS Amplify. It provides automated testing, building, and deployment across three environments.

## Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Repository                         │
└─────────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
        ┌───────▼────────┐     ┌───────▼────────┐
        │  Pull Request  │     │  Branch Push   │
        │    Workflow    │     │    Workflow    │
        └───────┬────────┘     └───────┬────────┘
                │                       │
        ┌───────▼────────┐     ┌───────▼────────┐
        │  Test & Build  │     │  Test & Build  │
        │   PR Preview   │     │   Artifacts    │
        └────────────────┘     └───────┬────────┘
                                       │
                        ┌──────────────┼──────────────┐
                        │              │              │
                ┌───────▼────┐  ┌──────▼─────┐  ┌────▼──────┐
                │   Deploy   │  │   Deploy   │  │  Deploy   │
                │    Dev     │  │  Staging   │  │   Prod    │
                └────────────┘  └────────────┘  └───────────┘
```

## Workflows

### 1. Pull Request Preview Workflow

**File**: `.github/workflows/pr-preview.yml`

**Triggers**:
- Pull request opened
- Pull request synchronized (new commits)
- Pull request reopened

**Jobs**:

#### Preview Build
1. Checkout code
2. Setup Node.js
3. Install dependencies
4. Run type checking
5. Run linting
6. Run tests with coverage
7. Build preview
8. Run pre-deployment checks
9. Upload preview artifacts
10. Comment on PR with build status
11. Upload coverage to Codecov

#### Bundle Size Check
1. Checkout code
2. Setup Node.js
3. Install dependencies
4. Build and analyze bundle
5. Generate bundle size report
6. Comment on PR with bundle size metrics

**Purpose**:
- Ensure code quality before merge
- Catch issues early in development
- Provide visibility into bundle size changes
- Enable code review with build artifacts

### 2. Deployment Workflow

**File**: `.github/workflows/deploy.yml`

**Triggers**:
- Push to `main` branch (production)
- Push to `staging` branch (staging)
- Push to `develop` branch (development)
- Pull request to `main` or `develop` (test only)
- Manual workflow dispatch

**Jobs**:

#### Test and Lint
1. Checkout code
2. Setup Node.js
3. Install dependencies
4. Run type checking
5. Run linting
6. Run format check
7. Run tests with coverage
8. Upload coverage reports

#### Build Application
1. Checkout code
2. Setup Node.js
3. Install dependencies
4. Set environment variables
5. Build application (environment-specific)
6. Run pre-deployment checks
7. Upload build artifacts

**Matrix Strategy**: Builds for all three environments in parallel

#### Deploy to Development
- **Condition**: Push to `develop` branch
- **Environment**: development
- **URL**: https://dev.insightsphere.example.com
- **Steps**:
  1. Download build artifacts
  2. Configure AWS credentials
  3. Deploy to Amplify

#### Deploy to Staging
- **Condition**: Push to `staging` branch
- **Environment**: staging
- **URL**: https://staging.insightsphere.example.com
- **Steps**:
  1. Download build artifacts
  2. Configure AWS credentials
  3. Deploy to Amplify

#### Deploy to Production
- **Condition**: Push to `main` branch
- **Environment**: production
- **URL**: https://insightsphere.example.com
- **Steps**:
  1. Download build artifacts
  2. Configure AWS credentials
  3. Deploy to Amplify
  4. Create Sentry release

#### Notify Deployment Status
- Runs after all deployment jobs
- Sends notification about deployment status
- Can be extended with Slack, email, etc.

## Environment Configuration

### GitHub Secrets

Required secrets for CI/CD:

#### AWS Credentials (per environment)
```
AWS_ACCESS_KEY_ID_DEV
AWS_SECRET_ACCESS_KEY_DEV
AWS_ACCESS_KEY_ID_STAGING
AWS_SECRET_ACCESS_KEY_STAGING
AWS_ACCESS_KEY_ID_PROD
AWS_SECRET_ACCESS_KEY_PROD
AWS_REGION
```

#### Monitoring
```
VITE_SENTRY_DSN
SENTRY_ORG
SENTRY_PROJECT
SENTRY_AUTH_TOKEN
```

#### Code Coverage
```
CODECOV_TOKEN
```

### Environment Variables

Set in GitHub Actions workflow:

```yaml
env:
  NODE_VERSION: '20.x'
  VITE_ENV: ${{ matrix.environment }}
```

## AWS Amplify Configuration

### Build Settings

**File**: `amplify.yml`

**Phases**:

#### Backend Build
```yaml
backend:
  phases:
    build:
      commands:
        - amplifyPush --simple
```

#### Frontend Pre-Build
```yaml
preBuild:
  commands:
    - npm ci
    - echo "Environment: $AWS_BRANCH"
```

#### Frontend Build
```yaml
build:
  commands:
    - # Set VITE_ENV based on branch
    - npm run build
```

#### Frontend Post-Build
```yaml
postBuild:
  commands:
    - node scripts/build-optimize.js
    - # Generate build-info.json
    - npm run predeploy
```

### Branch Configuration

| Branch | Environment | Auto Deploy |
|--------|-------------|-------------|
| `main` | production | ✅ |
| `staging` | staging | ✅ |
| `develop` | development | ✅ |

### Custom Headers

Security and caching headers configured in `amplify.yml`:

- `Strict-Transport-Security`
- `X-Content-Type-Options`
- `X-Frame-Options`
- `X-XSS-Protection`
- `Referrer-Policy`
- `Permissions-Policy`
- `Cache-Control` (per file type)

## Deployment Process

### Automatic Deployment

1. Developer pushes code to branch
2. GitHub Actions workflow triggered
3. Tests and linting run
4. Application built for target environment
5. Pre-deployment checks run
6. Build artifacts uploaded
7. AWS Amplify deploys automatically
8. Health checks can be run manually

### Manual Deployment

```bash
# Using deployment script
npm run deploy:dev
npm run deploy:staging
npm run deploy:prod

# Using Amplify CLI directly
amplify publish --environment dev
amplify publish --environment staging
amplify publish --environment prod
```

## Quality Gates

### Pre-Merge (Pull Request)

- ✅ Type checking passes
- ✅ Linting passes
- ✅ Format check passes
- ✅ All tests pass
- ✅ Code coverage maintained
- ✅ Bundle size within limits
- ✅ Code review approved

### Pre-Deployment

- ✅ All tests pass
- ✅ Build succeeds
- ✅ Pre-deployment checks pass
- ✅ No sensitive data in build
- ✅ Environment variables configured
- ✅ Build integrity verified

### Post-Deployment

- ✅ Application accessible
- ✅ Health checks pass
- ✅ No critical errors in logs
- ✅ Performance metrics acceptable
- ✅ Security headers present

## Monitoring and Alerts

### Build Monitoring

- GitHub Actions provides build status
- Email notifications on failure
- Slack integration (optional)
- Build logs available in Actions tab

### Deployment Monitoring

- AWS Amplify Console shows deployment status
- CloudWatch logs for backend
- Sentry for frontend errors
- Custom dashboards for metrics

### Alerts

Configure alerts for:
- Build failures
- Deployment failures
- Test failures
- Performance degradation
- Error rate spikes
- Security issues

## Rollback Procedures

### Via GitHub Actions

1. Revert the commit that caused issues
2. Push revert commit
3. CI/CD pipeline automatically deploys previous version

### Via Amplify Console

1. Go to AWS Amplify Console
2. Select the app and environment
3. Find previous successful deployment
4. Click "Redeploy this version"

### Via Amplify CLI

```bash
# Checkout previous commit
git checkout <previous-commit-hash>

# Deploy
amplify publish --environment prod
```

## Performance Optimization

### Build Optimization

- **Caching**: Node modules cached between builds
- **Parallel Builds**: Matrix strategy builds all environments in parallel
- **Artifact Reuse**: Build artifacts shared between jobs
- **Incremental Builds**: Only changed files rebuilt

### Deployment Optimization

- **CDN**: CloudFront distribution for fast global access
- **Compression**: Gzip compression enabled
- **Code Splitting**: Lazy loading for routes
- **Bundle Optimization**: Tree shaking and minification

## Security

### Secrets Management

- Secrets stored in GitHub Secrets
- Never committed to repository
- Rotated regularly
- Scoped to specific environments

### Access Control

- Branch protection rules enforced
- Required reviews before merge
- Status checks must pass
- Signed commits recommended

### Security Scanning

- Dependency vulnerability scanning
- Code security analysis
- Sensitive data detection
- License compliance checking

## Troubleshooting

### Build Failures

**Issue**: Build fails in CI/CD

**Solution**:
1. Check GitHub Actions logs
2. Reproduce locally: `npm run build`
3. Verify dependencies: `npm ci`
4. Check environment variables
5. Review recent changes

### Test Failures

**Issue**: Tests fail in CI/CD but pass locally

**Solution**:
1. Check for environment-specific issues
2. Verify Node.js version matches
3. Check for timing issues in tests
4. Review test logs in Actions
5. Run tests in CI mode locally: `npm run test`

### Deployment Failures

**Issue**: Deployment fails after successful build

**Solution**:
1. Check Amplify Console logs
2. Verify AWS credentials
3. Check IAM permissions
4. Verify backend resources exist
5. Review CloudWatch logs

### Slow Builds

**Issue**: CI/CD builds take too long

**Solution**:
1. Review build logs for bottlenecks
2. Optimize dependencies
3. Use caching effectively
4. Consider parallel test execution
5. Review bundle size

## Best Practices

1. **Keep workflows simple** - Easy to understand and maintain
2. **Use caching** - Speed up builds with dependency caching
3. **Fail fast** - Run quick checks first (linting, type checking)
4. **Parallel execution** - Run independent jobs in parallel
5. **Clear naming** - Use descriptive job and step names
6. **Comprehensive logging** - Log important information
7. **Secure secrets** - Never expose secrets in logs
8. **Test locally** - Reproduce CI/CD steps locally
9. **Monitor builds** - Set up alerts for failures
10. **Document changes** - Keep this document updated

## Metrics and KPIs

Track these metrics to measure CI/CD effectiveness:

- **Build Time**: Average time from commit to deployment
- **Build Success Rate**: Percentage of successful builds
- **Deployment Frequency**: How often code is deployed
- **Lead Time**: Time from commit to production
- **Mean Time to Recovery (MTTR)**: Time to recover from failures
- **Change Failure Rate**: Percentage of deployments causing issues

## Future Improvements

Potential enhancements to the CI/CD pipeline:

- [ ] Automated performance testing
- [ ] Visual regression testing
- [ ] Automated accessibility testing
- [ ] Canary deployments
- [ ] Blue-green deployments
- [ ] Automated rollback on errors
- [ ] Integration with project management tools
- [ ] Advanced monitoring and alerting
- [ ] Multi-region deployments
- [ ] A/B testing infrastructure

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [AWS Amplify CI/CD](https://docs.aws.amazon.com/amplify/latest/userguide/multi-environments.html)
- [Continuous Delivery Best Practices](https://aws.amazon.com/devops/continuous-delivery/)
- [GitHub Actions Best Practices](https://docs.github.com/en/actions/learn-github-actions/best-practices-for-github-actions)
