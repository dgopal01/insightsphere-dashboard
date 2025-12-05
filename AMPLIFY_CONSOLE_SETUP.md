# Quick Amplify Console Setup (Without CLI)

Since you're experiencing Amplify CLI issues, let's deploy directly via the AWS Amplify Console. This is actually the recommended approach for continuous deployment from GitHub.

## Step-by-Step Setup

### Step 1: Prepare Your Code

Your code is already on GitHub at: `https://github.com/dgopal01/insightsphere-dashboard.git`

Make sure your latest changes are pushed:

```powershell
git status
git add .
git commit -m "Prepare for Amplify deployment"
git push origin main
```

### Step 2: Deploy Backend via CloudFormation First

Before setting up Amplify Console, deploy your backend infrastructure:

```cmd
cd scripts
deploy-chat-logs-review.cmd insightsphere-dev us-east-1 dev
```

This will create:
- Cognito User Pool
- AppSync GraphQL API
- DynamoDB Tables
- Lambda Functions

**Time:** 10-15 minutes

### Step 3: Get Backend Configuration

After CloudFormation deployment completes, you'll get output values. Save these:

- `UserPoolId`
- `UserPoolClientId`
- `GraphQLEndpoint`
- `S3BucketName`
- `IdentityPoolId`

### Step 4: Connect to Amplify Console

1. **Open AWS Amplify Console**
   - Go to: https://console.aws.amazon.com/amplify/
   - Click "New app" > "Host web app"

2. **Connect GitHub**
   - Select "GitHub"
   - Click "Continue"
   - Authorize AWS Amplify (if not already authorized)
   - Select repository: `insightsphere-dashboard`
   - Select branch: `main`
   - Click "Next"

3. **Configure Build Settings**
   
   App name: `insightsphere-dashboard`
   
   The build settings should auto-detect from your `amplify.yml` file. Verify:
   
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: dist
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```
   
   Click "Next"

4. **Add Environment Variables**
   
   Click "Advanced settings" and add these environment variables:
   
   ```
   VITE_AWS_REGION=us-east-1
   VITE_AWS_USER_POOL_ID=<from-cloudformation-output>
   VITE_AWS_USER_POOL_CLIENT_ID=<from-cloudformation-output>
   VITE_AWS_GRAPHQL_ENDPOINT=<from-cloudformation-output>
   VITE_AWS_S3_BUCKET=<from-cloudformation-output>
   VITE_ENV=production
   ```
   
   Click "Next"

5. **Review and Deploy**
   - Review all settings
   - Click "Save and deploy"
   - Wait for build to complete (5-10 minutes)

### Step 5: Access Your Application

Once deployment completes:

1. You'll get a URL like: `https://main.d1234567890.amplifyapp.com`
2. Click the URL to access your application
3. Sign in with the admin user you created

### Step 6: Set Up Multiple Environments (Optional)

To deploy different branches to different environments:

1. **In Amplify Console**, click your app name
2. Click "App settings" > "General"
3. Scroll to "Branches"
4. Click "Connect branch"
5. Select branch (e.g., `develop` for dev environment)
6. Configure environment variables for that branch
7. Click "Save"

Repeat for each environment:
- `main` → Production
- `staging` → Staging
- `develop` → Development

### Step 7: Configure Custom Domain (Optional)

1. Go to "App settings" > "Domain management"
2. Click "Add domain"
3. Enter your domain name
4. Follow DNS configuration instructions
5. Wait for SSL certificate (automatic)

## Continuous Deployment

Now, every time you push to GitHub:

```powershell
git add .
git commit -m "Your changes"
git push origin main
```

Amplify will automatically:
1. Detect the push
2. Run the build
3. Deploy to production
4. Update the live site

## Monitoring

### View Build Logs
1. Go to Amplify Console
2. Click your app
3. Click on a build to see logs

### View Application Metrics
1. Go to Amplify Console
2. Click "Monitoring"
3. View traffic, errors, and performance

## Troubleshooting

### Build Fails

Check the build logs in Amplify Console. Common issues:

1. **Missing environment variables**
   - Go to App settings > Environment variables
   - Add missing variables
   - Redeploy

2. **Build command fails**
   - Test locally: `npm run build`
   - Check for errors
   - Fix and push

3. **Dependencies fail to install**
   - Check `package.json`
   - Ensure all dependencies are listed
   - Try: `npm ci` locally

### Application Doesn't Load

1. Check browser console for errors
2. Verify environment variables are set correctly
3. Ensure backend (CloudFormation) is deployed
4. Check API endpoints are accessible

## Next Steps

1. ✅ Deploy backend via CloudFormation
2. ✅ Connect GitHub to Amplify Console
3. ✅ Configure environment variables
4. ✅ Deploy and verify
5. ✅ Set up additional branches (optional)
6. ✅ Configure custom domain (optional)
7. ✅ Set up monitoring alerts

---

**Need help?** Check the detailed guide in `AMPLIFY_DEPLOYMENT_GUIDE.md`
