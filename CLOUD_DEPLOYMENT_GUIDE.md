# ☁️ Cloud Deployment Guide

Quick guide to deploy InsightSphere Dashboard to AWS for testing.

## 🎯 Current Status

✅ **Backend Deployed** (CloudFormation)
- Cognito User Pool
- AppSync GraphQL API
- DynamoDB Tables
- S3 Bucket for exports

⏳ **Frontend Deployment** (Choose an option below)

---

## Option 1: Quick Deploy to S3 (Fastest - 5 minutes)

**Best for**: Immediate testing, no GitHub required

### Steps:

1. **Build and deploy**:
   ```powershell
   .\deploy-to-s3.ps1
   ```

2. **Access your app**:
   - S3 URL will be displayed (available immediately)
   - CloudFront URL will be displayed (available in 10-15 minutes)

3. **Update deployment**:
   ```powershell
   npm run build
   aws s3 sync dist/ s3://YOUR-BUCKET-NAME/ --delete
   ```

### Pros:
- ✅ Fastest deployment
- ✅ No GitHub required
- ✅ HTTPS via CloudFront
- ✅ Global CDN

### Cons:
- ❌ Manual updates required
- ❌ No automatic deployments

---

## Option 2: AWS Amplify Hosting (Recommended for Production)

**Best for**: Automatic deployments, CI/CD, preview environments

### Prerequisites:

1. **Create GitHub repository**:
   ```bash
   # Create repo at https://github.com/new
   # Then push your code:
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/insightsphere-dashboard.git
   git push -u origin main
   ```

2. **Deploy to Amplify**:
   ```powershell
   .\deploy-to-amplify-hosting.ps1 -GitHubRepo "https://github.com/YOUR_USERNAME/insightsphere-dashboard"
   ```

3. **Complete setup in AWS Console**:
   - Visit the Amplify Console URL (displayed after script runs)
   - Connect your GitHub repository
   - Authorize GitHub access
   - Trigger first deployment

### Pros:
- ✅ Automatic deployments on git push
- ✅ Preview environments for PRs
- ✅ Built-in CI/CD
- ✅ Custom domains
- ✅ HTTPS by default

### Cons:
- ❌ Requires GitHub repository
- ❌ Slightly more setup time

---

## Option 3: Manual Amplify Console Setup

**Best for**: Full control, custom configuration

### Steps:

1. **Build your app**:
   ```bash
   npm run build
   ```

2. **Go to AWS Amplify Console**:
   - Visit: https://console.aws.amazon.com/amplify/
   - Click "New app" → "Host web app"
   - Choose "Deploy without Git provider"
   - Upload your `dist` folder

3. **Configure environment variables** in Amplify Console:
   ```
   VITE_ENV=dev
   VITE_AWS_REGION=us-east-1
   VITE_USER_POOL_ID=us-east-1_gYh3rcIFz
   VITE_USER_POOL_CLIENT_ID=6mlu9llcomgp1iokfk3552tvs3
   VITE_IDENTITY_POOL_ID=us-east-1:c4d5c67a-30d9-49ac-bc80-542775e19d9d
   VITE_GRAPHQL_ENDPOINT=https://y7sc7o27czcp3pw6lyib6ma2we.appsync-api.us-east-1.amazonaws.com/graphql
   VITE_GRAPHQL_API_ID=u3e7wpkmkrevbkkho5rh6pqf6u
   VITE_S3_BUCKET=insightsphere-dev-exports-327052515912
   ```

---

## 🚀 Recommended: Quick Start (Option 1)

For immediate testing, use the S3 deployment:

```powershell
# 1. Deploy to S3
.\deploy-to-s3.ps1

# 2. Wait for the URL to be displayed

# 3. Open the URL in your browser

# 4. Sign in with:
#    Email: dgopal@swbc.com
#    Password: TempPass123!
#    (You'll be prompted to change it)
```

---

## 📊 Comparison

| Feature | S3 + CloudFront | Amplify Hosting | Manual Console |
|---------|----------------|-----------------|----------------|
| Setup Time | 5 min | 15 min | 10 min |
| GitHub Required | ❌ | ✅ | ❌ |
| Auto Deploy | ❌ | ✅ | ❌ |
| HTTPS | ✅ | ✅ | ✅ |
| Custom Domain | ⚠️ Manual | ✅ Easy | ✅ Easy |
| Preview Envs | ❌ | ✅ | ❌ |
| Cost | $ | $$ | $ |

---

## 🔧 Post-Deployment

After deployment, test your app:

1. **Open the deployed URL**
2. **Sign in** with your admin credentials
3. **Verify features**:
   - Dashboard loads
   - Charts display
   - Navigation works
   - Data fetches from GraphQL API

---

## 🐛 Troubleshooting

### Build Fails
```bash
# Check for errors
npm run build

# Fix TypeScript errors
npm run type-check

# Fix linting errors
npm run lint:fix
```

### App Loads but Can't Sign In
- Check browser console for errors
- Verify environment variables are set correctly
- Check Cognito user exists: `aws cognito-idp list-users --user-pool-id us-east-1_gYh3rcIFz`

### GraphQL Errors
- Verify AppSync endpoint is correct
- Check Cognito authentication is working
- Verify user has proper permissions

### S3 Access Denied
- Check bucket policy allows public read
- Verify files were uploaded: `aws s3 ls s3://YOUR-BUCKET-NAME/`

---

## 📝 Next Steps

After successful deployment:

1. ✅ Test all features
2. ✅ Create additional users
3. ✅ Set up custom domain (optional)
4. ✅ Configure monitoring
5. ✅ Set up staging environment

---

## 💰 Cost Estimate

**S3 + CloudFront**:
- S3: ~$0.50/month (minimal traffic)
- CloudFront: ~$1-5/month (depends on traffic)
- **Total**: ~$1.50-5.50/month

**Amplify Hosting**:
- Build minutes: Free tier (1000 min/month)
- Hosting: ~$0.15/GB stored + $0.15/GB served
- **Total**: ~$2-10/month (depends on usage)

---

**Ready to deploy? Run:**
```powershell
.\deploy-to-s3.ps1
```
