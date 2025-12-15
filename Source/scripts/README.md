# Scripts Directory

This directory contains all build, deployment, testing, and utility scripts for the AI Metrics Portal (Chat Logs Review System).

## Scripts Overview

### Deployment Scripts

#### deploy.js
Main deployment script for AWS Amplify.

**Usage:**
```bash
npm run deploy:dev
npm run deploy:staging
npm run deploy:prod
```

#### deploy.sh / deploy.cmd
Shell scripts for deployment automation.

**Usage:**
```bash
# Linux/Mac
./scripts/deploy.sh

# Windows
scripts\deploy.cmd
```

#### deploy-all.ps1
PowerShell script to deploy all components.

**Usage:**
```powershell
.\scripts\deploy-all.ps1 -Environment prod
```

#### deploy-cloudformation.ps1
Deploy CloudFormation infrastructure.

**Usage:**
```powershell
.\scripts\deploy-cloudformation.ps1
```

#### deploy-to-s3-simple.ps1
Simple S3 deployment script.

**Usage:**
```powershell
.\scripts\deploy-to-s3-simple.ps1
```

#### deploy-chat-logs-review.cmd
Deploy chat logs review system specifically.

**Usage:**
```cmd
scripts\deploy-chat-logs-review.cmd
```

#### simple-deploy.ps1
Simplified deployment for quick updates.

**Usage:**
```powershell
.\scripts\simple-deploy.ps1
```

### Backend Management Scripts

#### deploy-backend.ps1
Deploy AWS Amplify backend resources.

**Usage:**
```powershell
.\scripts\deploy-backend.ps1 -Environment dev
```

#### verify-backend.ps1
Verify backend deployment status.

**Usage:**
```powershell
.\scripts\verify-backend.ps1 -Environment dev
```

#### update-appsync-tables.ps1
Update AppSync table configurations.

**Usage:**
```powershell
.\scripts\update-appsync-tables.ps1
```

#### test-appsync-query.sh
Test AppSync GraphQL queries.

**Usage:**
```bash
./scripts/test-appsync-query.sh
```

### User Management Scripts

#### create-admin-user.ps1
Create admin users in Cognito.

**Usage:**
```powershell
.\scripts\create-admin-user.ps1 -Username admin@example.com
```

### Environment Management Scripts

#### update-env.ps1
Update environment variables.

**Usage:**
```powershell
.\scripts\update-env.ps1 -Environment prod
```

### Build & Optimization Scripts

### build-optimize.js

Performs post-build optimizations and analysis.

**Features:**
- Analyzes bundle sizes (raw and gzipped)
- Generates build reports
- Optimizes HTML files with preconnect hints
- Warns about oversized bundles
- Fails production builds if size limits exceeded

**Usage:**
```bash
# Run after build
npm run build && node scripts/build-optimize.js

# Or use the combined command
npm run build:analyze
```

**Output:**
- Console output with bundle size analysis
- `dist/build-report.json` with detailed metrics

### pre-deploy.js

Runs pre-deployment checks to ensure build quality.

**Checks:**
- Required files exist (index.html, build-info.json)
- Environment variables are configured
- No sensitive data in build output
- Build integrity verification

**Usage:**
```bash
# Run before deployment
node scripts/pre-deploy.js

# Or use the npm script
npm run predeploy
```

**Exit Codes:**
- `0`: All checks passed
- `1`: One or more checks failed

### deploy-backend.ps1

PowerShell script for deploying AWS Amplify backend.

**Features:**
- Deploys backend resources to AWS
- Configures authentication, API, and storage
- Supports multiple environments

**Usage:**
```powershell
# Deploy to development
.\scripts\deploy-backend.ps1 -Environment dev

# Deploy to production
.\scripts\deploy-backend.ps1 -Environment prod
```

### verify-backend.ps1

PowerShell script for verifying backend deployment.

**Features:**
- Checks backend resource status
- Verifies API endpoints
- Tests authentication configuration

**Usage:**
```powershell
# Verify development environment
.\scripts\verify-backend.ps1 -Environment dev
```

### deploy.js

Node.js script for manual deployment to AWS Amplify.

**Features:**
- Builds application for target environment
- Runs pre-deployment checks
- Deploys to AWS Amplify
- Provides deployment confirmation

**Usage:**
```bash
# Deploy to development
npm run deploy:dev

# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:prod
```

### configure-domain.js

Node.js script for custom domain configuration guidance.

**Features:**
- Displays domain configuration instructions
- Shows DNS record requirements
- Generates Amplify redirect rules
- Provides verification steps

**Usage:**
```bash
# Show configuration instructions
npm run configure-domain

# Generate redirect rules
node scripts/configure-domain.js --redirects

# Check domain status
node scripts/configure-domain.js --check
```

### health-check.js

Node.js script for post-deployment health verification.

**Features:**
- Checks site accessibility
- Verifies security headers
- Validates build info
- Tests multiple environments

**Usage:**
```bash
# Check all environments
npm run health-check

# Check specific environment
npm run health-check:dev
npm run health-check:staging
npm run health-check:prod
```

## Build Optimization Details

### Bundle Size Limits

- **Individual chunks**: 500 KB (gzipped)
- **Total bundle**: Should be minimized for performance

### Optimization Techniques

1. **Code Splitting**: Vendor chunks separated by library
2. **Tree Shaking**: Unused code removed automatically
3. **Minification**: Terser minification enabled
4. **Compression**: Gzip compression for analysis
5. **Lazy Loading**: Routes loaded on demand

### HTML Optimizations

- Preconnect hints for AWS services
- Resource hints for faster loading
- Security headers configured

## Pre-Deployment Checks

### Required Files

- `index.html`: Main application entry point
- `build-info.json`: Build metadata

### Environment Variables

Required for all environments:
- `VITE_ENV`
- `VITE_AWS_REGION`
- `VITE_USER_POOL_ID`
- `VITE_USER_POOL_CLIENT_ID`
- `VITE_GRAPHQL_ENDPOINT`
- `VITE_S3_BUCKET`

### Security Checks

Scans for:
- AWS secret keys
- Hardcoded passwords
- API keys in build output

### Build Integrity

Verifies:
- Build info matches environment
- Build timestamp is recent
- Version information is present

## Integration with CI/CD

These scripts are integrated into the GitHub Actions workflow:

```yaml
# Build with optimization
- run: npm run build:prod

# Pre-deployment checks
- run: npm run predeploy

# Deploy to Amplify
- run: amplify publish
```

## Troubleshooting

### Bundle Size Warnings

If you see bundle size warnings:

1. Run `npm run build:analyze` to see detailed breakdown
2. Check for large dependencies
3. Consider code splitting or lazy loading
4. Review the build report in `dist/build-report.json`

### Pre-Deployment Failures

If pre-deployment checks fail:

1. Check the error message for specific issue
2. Verify environment variables are set
3. Ensure build completed successfully
4. Review security scan results

### Build Optimization Errors

If optimization script fails:

1. Ensure build completed successfully
2. Check that `dist` directory exists
3. Verify Node.js version compatibility
4. Review script output for specific errors

## Development

### Adding New Checks

To add new pre-deployment checks:

1. Add check function to `pre-deploy.js`
2. Add to checks array in main function
3. Update documentation

### Modifying Size Limits

To change bundle size limits:

1. Update `SIZE_LIMIT_KB` in `build-optimize.js`
2. Update documentation
3. Communicate changes to team

### Custom Optimizations

To add custom optimizations:

1. Add function to `build-optimize.js`
2. Call from main function
3. Test thoroughly before deploying

## Best Practices

1. **Always run pre-deployment checks** before deploying
2. **Review build reports** regularly to track bundle size
3. **Monitor optimization output** for warnings
4. **Keep scripts updated** with project changes
5. **Test scripts locally** before committing changes

## Support

For issues with deployment scripts:

1. Check script output for error messages
2. Review this documentation
3. Check GitHub Actions logs
4. Contact DevOps team
