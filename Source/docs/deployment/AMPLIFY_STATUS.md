# AWS Amplify Deployment Status

## ✅ Your Amplify App is Already Deployed!

**App Name:** insightsphere-dashboard  
**App ID:** d33feletv96fod  
**Region:** us-east-1  
**Repository:** https://github.com/dgopal01/insightsphere-dashboard  
**Default URL:** https://d33feletv96fod.amplifyapp.com  
**Production Branch:** main  
**Last Deploy:** December 5, 2025 at 3:24 PM  
**Status:** ✅ SUCCEED

## Current Configuration

### Environment Variables (Already Set)

Your Amplify app has all the necessary environment variables configured:

```
VITE_AWS_REGION=us-east-1
VITE_USER_POOL_ID=us-east-1_gYh3rcIFz
VITE_USER_POOL_CLIENT_ID=6mlu9llcomgp1iokfk3552tvs3
VITE_IDENTITY_POOL_ID=us-east-1:c4d5c67a-30d9-49ac-bc80-542775e19d9d
VITE_GRAPHQL_ENDPOINT=https://y7sc7o27czcp3pw6lyib6ma2we.appsync-api.us-east-1.amazonaws.com/graphql
VITE_GRAPHQL_API_ID=u3e7wpkmkrevbkkho5rh6pqf6u
VITE_S3_BUCKET=insightsphere-dev-exports-327052515912
VITE_CHATLOG_TABLE=UnityAIAssistantLogs
VITE_FEEDBACK_TABLE=userFeedback
VITE_ENV=dev
VITE_DEBUG_MODE=true
VITE_ENABLE_ERROR_TRACKING=true
VITE_ENABLE_ANALYTICS=false
```

### Branch Configuration

**Main Branch (Production)**
- Auto-build: ✅ Enabled
- Stage: PRODUCTION
- Framework: Web
- TTL: 5 minutes
- Pull Request Preview: Disabled

## What's Working

✅ **Continuous Deployment** - Pushes to `main` branch automatically trigger builds  
✅ **Backend Resources** - Cognito, AppSync, DynamoDB, S3 all configured  
✅ **Environment Variables** - All AWS resources properly configured  
✅ **Build Configuration** - Using your `amplify.yml` build spec  
✅ **Security Headers** - Custom headers configured for security  
✅ **Caching** - Amplify managed caching enabled  

## Access Your Application

### Production URL
https://d33feletv96fod.amplifyapp.com

Or via the main branch URL:
https://main.d33feletv96fod.amplifyapp.com

### AWS Amplify Console
https://console.aws.amazon.com/amplify/home?region=us-east-1#/d33feletv96fod

## How to Deploy Updates

Your continuous deployment is already set up! Just push to GitHub:

```powershell
# Make your changes
git add .
git commit -m "Your update message"
git push origin main
```

Amplify will automatically:
1. Detect the push
2. Start a new build
3. Run tests and build your app
4. Deploy to production
5. Update the live site

## View Build Status

### Via AWS Console
1. Go to: https://console.aws.amazon.com/amplify/home?region=us-east-1#/d33feletv96fod
2. Click on the "main" branch
3. View build history and logs

### Via CLI
```powershell
# List recent builds
aws amplify list-jobs --app-id d33feletv96fod --branch-name main --region us-east-1 --max-results 5

# Get specific build details
aws amplify get-job --app-id d33feletv96fod --branch-name main --job-id <JOB_ID> --region us-east-1
```

## Backend Resources

Your backend is fully deployed with:

### Cognito Authentication
- **User Pool ID:** us-east-1_gYh3rcIFz
- **Client ID:** 6mlu9llcomgp1iokfk3552tvs3
- **Identity Pool:** us-east-1:c4d5c67a-30d9-49ac-bc80-542775e19d9d

### AppSync GraphQL API
- **Endpoint:** https://y7sc7o27czcp3pw6lyib6ma2we.appsync-api.us-east-1.amazonaws.com/graphql
- **API ID:** u3e7wpkmkrevbkkho5rh6pqf6u

### DynamoDB Tables
- **Chat Logs:** UnityAIAssistantLogs
- **Feedback:** userFeedback

### S3 Storage
- **Bucket:** insightsphere-dev-exports-327052515912

## Create Admin User (If Not Already Done)

If you haven't created an admin user yet:

```powershell
aws cognito-idp admin-create-user `
  --user-pool-id us-east-1_gYh3rcIFz `
  --username admin `
  --user-attributes Name=email,Value=admin@example.com Name=email_verified,Value=true `
  --temporary-password "TempPass123!" `
  --message-action SUPPRESS `
  --region us-east-1
```

## Add Additional Environments (Optional)

To deploy different branches to different environments:

### 1. Create a new branch
```powershell
git checkout -b develop
git push origin develop
```

### 2. Connect branch in Amplify Console
```powershell
# Via CLI
aws amplify create-branch `
  --app-id d33feletv96fod `
  --branch-name develop `
  --stage DEVELOPMENT `
  --enable-auto-build `
  --region us-east-1

# Or via Console: https://console.aws.amazon.com/amplify/home?region=us-east-1#/d33feletv96fod
# Click "Connect branch" and select "develop"
```

### 3. Configure environment variables for the branch
```powershell
aws amplify update-branch `
  --app-id d33feletv96fod `
  --branch-name develop `
  --environment-variables VITE_ENV=development `
  --region us-east-1
```

## Monitoring and Logs

### View Build Logs
- Go to Amplify Console
- Click on a build
- View detailed logs for each phase

### View Application Logs
- CloudWatch Logs: `/aws/amplify/d33feletv96fod`
- Access via: https://console.aws.amazon.com/cloudwatch/

### Performance Monitoring
- Amplify Console > Monitoring tab
- View traffic, errors, and performance metrics

## Troubleshooting

### If Build Fails

1. **Check build logs** in Amplify Console
2. **Test locally:**
   ```powershell
   npm ci
   npm run build
   ```
3. **Check environment variables** are set correctly
4. **Verify** no syntax errors: `npm run lint`

### If Application Doesn't Load

1. **Check browser console** for errors
2. **Verify** environment variables in Amplify Console
3. **Test API connectivity:**
   ```powershell
   curl https://y7sc7o27czcp3pw6lyib6ma2we.appsync-api.us-east-1.amazonaws.com/graphql
   ```
4. **Check Cognito** user pool is accessible

### Rollback to Previous Version

Via Amplify Console:
1. Go to your app
2. Click "main" branch
3. Find previous successful build
4. Click "Redeploy this version"

## Cost Monitoring

Monitor your AWS costs:
- Go to: https://console.aws.amazon.com/billing/
- Check Amplify, Cognito, AppSync, DynamoDB costs
- Set up billing alerts if needed

## Security Recommendations

✅ **Already Configured:**
- HTTPS enforced
- Security headers (HSTS, X-Frame-Options, etc.)
- Cognito authentication
- IAM roles with least privilege

**Additional Steps:**
- [ ] Enable AWS CloudTrail for audit logs
- [ ] Set up AWS Config for compliance
- [ ] Enable MFA on AWS account
- [ ] Review IAM policies regularly
- [ ] Set up AWS GuardDuty for threat detection

## Next Steps

Your deployment is complete! Here's what you can do:

1. ✅ **Access your app:** https://d33feletv96fod.amplifyapp.com
2. ✅ **Make updates:** Push to GitHub and watch auto-deployment
3. ⬜ **Add custom domain** (optional)
4. ⬜ **Set up staging environment** (optional)
5. ⬜ **Configure monitoring alerts** (optional)
6. ⬜ **Add more users** in Cognito

## Quick Commands Reference

```powershell
# View app details
aws amplify get-app --app-id d33feletv96fod --region us-east-1

# List branches
aws amplify list-branches --app-id d33feletv96fod --region us-east-1

# View recent builds
aws amplify list-jobs --app-id d33feletv96fod --branch-name main --region us-east-1

# Start a new build manually
aws amplify start-job --app-id d33feletv96fod --branch-name main --job-type RELEASE --region us-east-1

# Update environment variables
aws amplify update-app --app-id d33feletv96fod --environment-variables KEY=VALUE --region us-east-1
```

## Support

- **AWS Amplify Console:** https://console.aws.amazon.com/amplify/
- **Documentation:** https://docs.amplify.aws/
- **GitHub Repository:** https://github.com/dgopal01/insightsphere-dashboard

---

**Status:** ✅ Fully Deployed and Operational  
**Last Updated:** December 5, 2025
