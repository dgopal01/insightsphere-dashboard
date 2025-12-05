# 🚀 AWS Amplify Hosting Setup Guide

## Quick Setup (5 minutes)

Your GitHub repo is ready: `https://github.com/dgopal01/insightsphere-dashboard`

### Step 1: Open AWS Amplify Console

Click this link to open Amplify Console:
```
https://console.aws.amazon.com/amplify/home?region=us-east-1
```

### Step 2: Create New App

1. Click **"New app"** → **"Host web app"**
2. Select **"GitHub"** as the source
3. Click **"Continue"**

### Step 3: Authorize GitHub

1. Click **"Authorize AWS Amplify"**
2. Sign in to GitHub if prompted
3. Grant AWS Amplify access to your repositories

### Step 4: Select Repository

1. **Repository**: Select `dgopal01/insightsphere-dashboard`
2. **Branch**: Select `main`
3. Click **"Next"**

### Step 5: Configure Build Settings

The build settings should auto-detect from your `amplify.yml` file.

Verify these settings:
- **App name**: `insightsphere-dev`
- **Environment**: `dev`
- **Build command**: `npm run build`
- **Output directory**: `dist`

Click **"Next"**

### Step 6: Add Environment Variables

Click **"Advanced settings"** and add these environment variables:

```
VITE_ENV=dev
VITE_AWS_REGION=us-east-1
VITE_USER_POOL_ID=us-east-1_gYh3rcIFz
VITE_USER_POOL_CLIENT_ID=6mlu9llcomgp1iokfk3552tvs3
VITE_IDENTITY_POOL_ID=us-east-1:c4d5c67a-30d9-49ac-bc80-542775e19d9d
VITE_GRAPHQL_ENDPOINT=https://y7sc7o27czcp3pw6lyib6ma2we.appsync-api.us-east-1.amazonaws.com/graphql
VITE_GRAPHQL_API_ID=u3e7wpkmkrevbkkho5rh6pqf6u
VITE_S3_BUCKET=insightsphere-dev-exports-327052515912
VITE_CHATLOG_TABLE=insightsphere-dev-chatlogs
VITE_FEEDBACK_TABLE=insightsphere-dev-feedback
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_ERROR_TRACKING=true
VITE_DEBUG_MODE=true
```

### Step 7: Review and Deploy

1. Review all settings
2. Click **"Save and deploy"**
3. Wait 5-10 minutes for the build to complete

### Step 8: Access Your App

Once deployed, your app will be available at:
```
https://main.YOUR_APP_ID.amplifyapp.com
```

The URL will be shown in the Amplify Console.

---

## 🎯 What Happens Next

1. **Build starts automatically** - You'll see the build progress in real-time
2. **Build phases**:
   - Provision: Sets up build environment
   - Build: Runs `npm install` and `npm run build`
   - Deploy: Uploads to Amplify hosting
   - Verify: Checks deployment health

3. **Automatic deployments** - Every time you push to `main` branch, Amplify will automatically rebuild and deploy

---

## 🔧 Post-Deployment

### Test Your App

1. Click the deployment URL
2. Sign in with:
   - Email: `dgopal@swbc.com`
   - Password: `TempPass123!`
   - You'll be prompted to change your password

### Set Up Custom Domain (Optional)

1. In Amplify Console, go to **"Domain management"**
2. Click **"Add domain"**
3. Follow the wizard to connect your domain

### Enable PR Previews (Optional)

1. Go to **"Previews"** in Amplify Console
2. Enable **"Pull request previews"**
3. Now every PR will get its own preview URL!

---

## 📊 Monitoring

### View Build Logs

- Click on any build in the Amplify Console
- View detailed logs for each phase
- Check for errors or warnings

### View Access Logs

- Go to **"Monitoring"** tab
- View traffic, errors, and performance metrics

---

## 🐛 Troubleshooting

### Build Fails

**Check build logs** in Amplify Console:
- Look for npm install errors
- Check for TypeScript compilation errors
- Verify environment variables are set

**Common fixes**:
```bash
# Test build locally first
npm run build

# Check for errors
npm run type-check
npm run lint
```

### App Loads but Blank Screen

**Check browser console** for errors:
- F12 → Console tab
- Look for network errors or JavaScript errors

**Common issues**:
- Environment variables not set correctly
- CORS issues with API
- Authentication configuration mismatch

### Can't Sign In

**Verify**:
- User exists in Cognito
- Environment variables match CloudFormation outputs
- Browser allows cookies

---

## 💰 Cost

**AWS Amplify Hosting Pricing**:
- **Build minutes**: First 1,000 minutes/month free, then $0.01/minute
- **Hosting**: $0.15/GB stored + $0.15/GB served
- **Estimated cost**: $2-10/month for development

---

## 🔄 Update Deployment

### Option 1: Git Push (Automatic)
```bash
git add .
git commit -m "Update feature"
git push origin main
```
Amplify will automatically detect and deploy!

### Option 2: Manual Redeploy
1. Go to Amplify Console
2. Click **"Redeploy this version"**

---

## 📝 Next Steps

After successful deployment:

- ✅ Test all features
- ✅ Set up staging environment (repeat with `staging` branch)
- ✅ Configure custom domain
- ✅ Enable PR previews
- ✅ Set up monitoring alerts

---

**Ready? Open the Amplify Console:**
```
https://console.aws.amazon.com/amplify/home?region=us-east-1
```

Click **"New app"** → **"Host web app"** → **"GitHub"**
