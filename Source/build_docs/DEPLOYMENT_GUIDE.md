# Deployment Guide - AI Metrics Portal

## Prerequisites

Before deploying, ensure you have:

1. ✅ **AWS CLI installed and configured**
   ```bash
   aws --version
   aws configure
   ```

2. ✅ **Node.js and npm installed**
   ```bash
   node --version
   npm --version
   ```

3. ✅ **AWS Account with appropriate permissions**
   - CloudFormation
   - Cognito
   - AppSync
   - DynamoDB
   - S3
   - Lambda

4. ✅ **Admin email address** for Cognito user creation

## Deployment Options

### Option 1: Complete One-Click Deployment (Recommended)

This deploys everything: infrastructure, creates admin user, and configures the application.

```powershell
# Navigate to scripts directory
cd scripts

# Run complete deployment
.\deploy-all.ps1 -AdminEmail "your-email@example.com" -Environment dev

# With development server auto-start
.\deploy-all.ps1 -AdminEmail "your-email@example.com" -Environment dev -StartDevServer
```

**What it does:**
1. Deploys CloudFormation stack (Cognito, AppSync, DynamoDB, Lambda)
2. Creates admin user in Cognito
3. Updates configuration files (.env, aws-exports.ts)
4. Optionally starts development server

**Time:** ~10-15 minutes

---

### Option 2: Step-by-Step Deployment

#### Step 1: Deploy Infrastructure

```powershell
cd scripts
.\deploy-cloudformation.ps1 -AdminEmail "your-email@example.com" -Environment dev
```

This creates:
- Cognito User Pool for authentication
- AppSync GraphQL API
- DynamoDB tables (UnityAIAssistantLogs, UserFeedback)
- Lambda function for metrics
- S3 bucket for storage

#### Step 2: Create Admin User

```powershell
.\create-admin-user.ps1 -Username admin -Email "your-email@example.com" -Environment dev
```

Default password: `TempPass123!` (you'll be prompted to change it on first login)

#### Step 3: Build the Application

```bash
# Return to project root
cd ..

# Build for production
npm run build:prod

# Or build for development
npm run build:dev
```

#### Step 4: Start Development Server (Local Testing)

```bash
npm run dev
```

Access at: http://localhost:5173

---

### Option 3: Deploy to AWS Amplify Hosting

For production deployment with CI/CD:

#### Prerequisites:
- GitHub repository with your code
- AWS Amplify Hosting configured

#### Steps:

1. **Push code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/ai-metrics-portal.git
   git push -u origin main
   ```

2. **Deploy using npm script:**
   ```bash
   npm run deploy:prod
   ```

3. **Or use AWS Amplify Console:**
   - Go to AWS Amplify Console
   - Click "New app" → "Host web app"
   - Connect your GitHub repository
   - Configure build settings (use amplify.yml)
   - Deploy

---

### Option 4: Deploy to S3 + CloudFront

For static hosting:

```powershell
cd scripts

# Build and deploy to S3
.\deploy-to-s3-simple.ps1 -Environment prod
```

This will:
1. Build the application
2. Upload to S3 bucket
3. Configure CloudFront distribution
4. Provide access URLs

---

## Post-Deployment Steps

### 1. Verify Deployment

```powershell
cd scripts
.\verify-backend.ps1 -Environment dev
```

### 2. Test the Application

1. Open the application URL
2. Sign in with admin credentials
3. Test key features:
   - Dashboard loads
   - Chat logs display
   - Feedback logs display
   - Review submission works

### 3. Create Additional Users

```powershell
cd scripts
.\create-admin-user.ps1 -Username reviewer1 -Email "reviewer1@example.com"
```

### 4. Health Check

```bash
npm run health-check:dev
```

---

## Environment-Specific Deployments

### Development
```powershell
.\deploy-all.ps1 -AdminEmail "dev@example.com" -Environment dev
```

### Staging
```powershell
.\deploy-all.ps1 -AdminEmail "staging@example.com" -Environment staging
```

### Production
```powershell
.\deploy-all.ps1 -AdminEmail "prod@example.com" -Environment prod
```

---

## Configuration Files

After deployment, these files are automatically created/updated:

- `.env` - Environment variables
- `src/aws-exports.ts` - AWS Amplify configuration
- `deployment-info.json` - Deployment metadata

---

## Troubleshooting

### Issue: AWS CLI not found
**Solution:** Install AWS CLI from https://aws.amazon.com/cli/

### Issue: AWS credentials not configured
**Solution:** Run `aws configure` and enter your credentials

### Issue: CloudFormation stack creation failed
**Solution:** 
1. Check AWS Console → CloudFormation for error details
2. Ensure you have necessary permissions
3. Check if stack name already exists

### Issue: Admin user creation failed
**Solution:**
- User may already exist
- Check Cognito User Pool in AWS Console
- Try with different username

### Issue: Build fails
**Solution:**
```bash
# Clean and rebuild
rm -rf node_modules dist
npm install
npm run build:prod
```

### Issue: Environment variables not set
**Solution:**
1. Check `.env` file exists
2. Verify values match CloudFormation outputs
3. Restart development server

---

## Useful Commands

### Check Stack Status
```bash
aws cloudformation describe-stacks --stack-name insightsphere-dev --region us-east-1
```

### Get Stack Outputs
```bash
aws cloudformation describe-stacks --stack-name insightsphere-dev --query 'Stacks[0].Outputs' --region us-east-1
```

### Delete Stack (Cleanup)
```bash
aws cloudformation delete-stack --stack-name insightsphere-dev --region us-east-1
```

### View CloudWatch Logs
```bash
aws logs tail /aws/lambda/GetReviewMetrics --follow --region us-east-1
```

### Test GraphQL API
```bash
cd scripts
./test-appsync-query.sh
```

---

## Next Steps After Deployment

1. ✅ **Access the application** at the provided URL
2. ✅ **Sign in** with admin credentials
3. ✅ **Change temporary password** on first login
4. ✅ **Create additional users** as needed
5. ✅ **Configure monitoring** (optional - see docs/MONITORING_SETUP.md)
6. ✅ **Set up custom domain** (optional - see build_docs/CLOUD_DEPLOYMENT_GUIDE.md)
7. ✅ **Configure CI/CD** (optional - see docs/CI_CD_PIPELINE.md)

---

## Support

For detailed documentation:
- **Build Documentation:** `build_docs/`
- **Feature Documentation:** `docs/`
- **CloudFormation Details:** `cloudformation/README.md`
- **Scripts Documentation:** `scripts/README.md`

For issues:
1. Check CloudFormation stack events in AWS Console
2. Review CloudWatch logs
3. Check `deployment-info.json` for configuration details
4. Refer to `build_docs/TROUBLESHOOTING_AUTH.md` for auth issues

---

**Ready to deploy?** Start with Option 1 for the fastest path to a working application!
