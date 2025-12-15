# AWS Amplify Console Deployment Guide

## Overview
This guide walks you through deploying the InsightSphere Dashboard to AWS Amplify Console with continuous deployment from GitHub.

## Prerequisites Checklist
- ✅ AWS CLI installed (v2.32.7)
- ✅ Amplify CLI installed (v14.2.3)
- ✅ Amplify backend configured
- ⬜ GitHub repository with code pushed
- ⬜ AWS account with Amplify permissions
- ⬜ AWS credentials configured

## Step 1: Verify AWS Credentials

```powershell
# Check if AWS credentials are configured
aws sts get-caller-identity
```

If not configured, run:
```powershell
aws configure
```

## Step 2: Push Amplify Backend (If Not Already Done)

```powershell
# Check current Amplify environment
amplify env list

# Push backend to AWS (if needed)
amplify push
```

This will create:
- Cognito User Pool (Authentication)
- AppSync GraphQL API
- DynamoDB Tables
- S3 Storage Bucket

**Time:** 5-10 minutes

## Step 3: Get Backend Configuration

After `amplify push` completes, get your backend configuration:

```powershell
# Get Amplify outputs
amplify env get --name dev
```

Or manually from AWS Console:
1. Go to AWS Amplify Console
2. Select your app
3. Go to Backend environments > dev
4. Note the resource IDs

## Step 4: Create Environment Files

Create `.env.development`, `.env.staging`, and `.env.production` with your AWS values:

```env
# AWS Configuration
VITE_AWS_REGION=us-east-1
VITE_AWS_USER_POOL_ID=<from-amplify-outputs>
VITE_AWS_USER_POOL_CLIENT_ID=<from-amplify-outputs>
VITE_AWS_GRAPHQL_ENDPOINT=<from-amplify-outputs>
VITE_AWS_S3_BUCKET=<from-amplify-outputs>

# Environment
VITE_ENV=development

# Optional: Error Tracking
VITE_SENTRY_DSN=
VITE_ENABLE_ERROR_TRACKING=false
```

## Step 5: Push Code to GitHub

```powershell
# Initialize git (if not already done)
git init

# Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Add all files
git add .

# Commit
git commit -m "Initial commit for Amplify deployment"

# Push to GitHub
git push -u origin main
```

## Step 6: Connect GitHub to Amplify Console

### Option A: Via AWS Console (Recommended)

1. **Go to AWS Amplify Console**
   - Navigate to: https://console.aws.amazon.com/amplify/
   - Click "Get Started" under "Host your web app"

2. **Connect Repository**
   - Select "GitHub"
   - Click "Continue"
   - Authorize AWS Amplify to access your GitHub account
   - Select your repository
   - Select branch: `main` (for production) or `develop` (for dev)
   - Click "Next"

3. **Configure Build Settings**
   - App name: `insightsphere-dashboard`
   - Environment: `dev` (or `staging`/`prod`)
   - The build settings should auto-detect from `amplify.yml`
   - Verify the build command: `npm run build`
   - Verify the output directory: `dist`
   - Click "Next"

4. **Advanced Settings**
   - Add environment variables:
     - `VITE_AWS_REGION`: us-east-1
     - `VITE_AWS_USER_POOL_ID`: <your-value>
     - `VITE_AWS_USER_POOL_CLIENT_ID`: <your-value>
     - `VITE_AWS_GRAPHQL_ENDPOINT`: <your-value>
     - `VITE_AWS_S3_BUCKET`: <your-value>
     - `VITE_ENV`: development
   - Click "Next"

5. **Review and Deploy**
   - Review all settings
   - Click "Save and deploy"

### Option B: Via Amplify CLI

```powershell
# Add hosting
amplify add hosting

# Select: Hosting with Amplify Console
# Select: Continuous deployment (Git-based deployments)

# Publish
amplify publish
```

## Step 7: Configure Branch Deployments

Set up multiple environments for different branches:

1. **In Amplify Console**, go to your app
2. Click "App settings" > "Branch settings"
3. Add branches:
   - `main` → Production environment
   - `staging` → Staging environment
   - `develop` → Development environment

For each branch:
1. Click "Connect branch"
2. Select the branch
3. Select the backend environment
4. Configure environment variables specific to that environment
5. Enable automatic builds

## Step 8: Configure Custom Domain (Optional)

1. Go to "App settings" > "Domain management"
2. Click "Add domain"
3. Enter your domain (e.g., `insightsphere.example.com`)
4. Configure subdomains:
   - `www.insightsphere.example.com` → main branch
   - `staging.insightsphere.example.com` → staging branch
   - `dev.insightsphere.example.com` → develop branch
5. Update DNS records with provided CNAME values
6. Wait for SSL certificate provisioning (automatic)

## Step 9: Create Admin User

After deployment, create an admin user in Cognito:

```powershell
# Get User Pool ID from Amplify outputs
$USER_POOL_ID = "<your-user-pool-id>"

# Create admin user
aws cognito-idp admin-create-user `
  --user-pool-id $USER_POOL_ID `
  --username admin `
  --user-attributes Name=email,Value=admin@example.com Name=email_verified,Value=true `
  --temporary-password "TempPass123!" `
  --message-action SUPPRESS `
  --region us-east-1
```

## Step 10: Verify Deployment

1. **Check Build Status**
   - Go to Amplify Console
   - View build logs
   - Ensure build succeeds

2. **Access Application**
   - Click the provided URL (e.g., `https://main.d1234567890.amplifyapp.com`)
   - Or your custom domain

3. **Test Login**
   - Username: `admin`
   - Password: `TempPass123!`
   - Change password when prompted

4. **Verify Features**
   - Dashboard loads
   - Data displays correctly
   - All features work

## Continuous Deployment Workflow

Once set up, deployments are automatic:

1. **Make changes** to your code
2. **Commit and push** to GitHub:
   ```powershell
   git add .
   git commit -m "Your changes"
   git push origin main
   ```
3. **Amplify automatically**:
   - Detects the push
   - Runs build
   - Deploys to production
   - Updates the live site

## Monitoring and Logs

### View Build Logs
1. Go to Amplify Console
2. Select your app
3. Click on a build
4. View detailed logs

### View Application Logs
1. Go to CloudWatch
2. Navigate to Log groups
3. Find `/aws/amplify/<app-id>`

### Set Up Alerts
1. Go to Amplify Console > Monitoring
2. Configure CloudWatch alarms
3. Set up SNS notifications

## Rollback Procedure

If a deployment fails or causes issues:

1. **Via Amplify Console**:
   - Go to your app
   - Click on the branch
   - Find the previous successful build
   - Click "Redeploy this version"

2. **Via Git**:
   ```powershell
   # Revert the commit
   git revert HEAD
   git push origin main
   ```

## Troubleshooting

### Build Fails

**Check build logs** in Amplify Console for specific errors.

Common issues:
- Missing environment variables
- Dependency installation failures
- Build command errors

**Solution**:
```powershell
# Test build locally
npm run build

# Check for errors
npm run lint
npm run type-check
```

### Environment Variables Not Working

**Solution**:
1. Go to App settings > Environment variables
2. Verify all variables are set
3. Ensure no placeholder values
4. Click "Save"
5. Trigger a new build

### Authentication Errors

**Solution**:
1. Verify Cognito User Pool ID and Client ID
2. Check redirect URLs in Cognito Console
3. Ensure Amplify backend is pushed

### API Connection Issues

**Solution**:
1. Verify AppSync endpoint URL
2. Check API authentication settings
3. Ensure DynamoDB tables exist
4. Run: `amplify status`

## Cost Estimation

AWS Amplify Console pricing (as of 2024):
- **Build minutes**: $0.01 per build minute
- **Hosting**: $0.15 per GB served
- **Storage**: $0.023 per GB stored

Typical monthly cost for low-traffic app: **$5-20**

## Security Best Practices

1. **Never commit** `.env` files to Git
2. **Use environment variables** in Amplify Console
3. **Enable branch protection** in GitHub
4. **Require pull request reviews** before merging to main
5. **Enable AWS CloudTrail** for audit logs
6. **Use IAM roles** with least privilege
7. **Enable MFA** on AWS account

## Next Steps

After successful deployment:

1. ✅ Configure custom domain
2. ✅ Set up monitoring alerts
3. ✅ Configure backup policies
4. ✅ Set up staging environment
5. ✅ Document deployment process
6. ✅ Train team on workflow
7. ✅ Schedule security reviews

## Quick Reference Commands

```powershell
# Check Amplify status
amplify status

# Push backend changes
amplify push

# Pull latest backend config
amplify pull

# View environment info
amplify env list
amplify env get --name dev

# View console
amplify console

# View hosting console
amplify console hosting

# Publish (backend + frontend)
amplify publish
```

## Support Resources

- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [Amplify Console Guide](https://docs.aws.amazon.com/amplify/latest/userguide/)
- [GitHub Actions with Amplify](https://docs.amplify.aws/guides/hosting/git-based-deployments/)
- [Amplify CLI Reference](https://docs.amplify.aws/cli/)

---

**Ready to deploy?** Start with Step 1 and work through each step sequentially.
