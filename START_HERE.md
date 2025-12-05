# 🚀 START HERE - AI Metrics Portal

## Quick Start (Local Development)

The fastest way to get started without AWS deployment:

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Create Environment File

```bash
# Copy the example environment file
copy .env.example .env
```

### Step 3: Start Development Server

```bash
npm run dev
```

### Step 4: Access the Application

Open your browser to: **http://localhost:5173**

---

## ⚠️ Note About AWS Deployment

The PowerShell deployment scripts have some encoding issues that need to be resolved. 

**For now, you have two options:**

### Option A: Use the Application Locally (UI Only)

The steps above will start the application locally. You'll see the UI, but without AWS backend configuration, data fetching won't work.

### Option B: Manual AWS Setup

If you need the full AWS backend:

1. **Deploy CloudFormation Stack Manually:**
   - Go to AWS Console → CloudFormation
   - Upload `cloudformation/chat-logs-review-stack.yaml`
   - Fill in parameters (AdminEmail, Environment)
   - Wait for stack creation (~10 minutes)

2. **Get Stack Outputs:**
   ```bash
   aws cloudformation describe-stacks --stack-name insightsphere-dev --query 'Stacks[0].Outputs'
   ```

3. **Update .env File:**
   Copy the output values to your `.env` file:
   ```
   VITE_AWS_REGION=us-east-1
   VITE_AWS_USER_POOL_ID=<from stack outputs>
   VITE_AWS_USER_POOL_CLIENT_ID=<from stack outputs>
   VITE_AWS_GRAPHQL_ENDPOINT=<from stack outputs>
   VITE_AWS_S3_BUCKET=<from stack outputs>
   ```

4. **Create Admin User:**
   ```bash
   aws cognito-idp admin-create-user \
     --user-pool-id <YOUR_USER_POOL_ID> \
     --username admin \
     --user-attributes Name=email,Value=your@email.com \
     --temporary-password TempPass123!
   ```

5. **Restart Dev Server:**
   ```bash
   npm run dev
   ```

---

## 📚 Documentation

- **Quick Start:** `QUICK_START.md`
- **Full Deployment Guide:** `build_docs/DEPLOYMENT_GUIDE.md`
- **Project README:** `README.md`
- **Scripts Documentation:** `scripts/README.md`

---

## 🐛 Known Issues

- PowerShell deployment scripts have encoding issues with special characters
- Working on fixing the automated deployment scripts
- Manual AWS deployment works fine

---

## ✅ What Works Now

- ✅ Local development server
- ✅ UI components and pages
- ✅ Build process
- ✅ Tests
- ✅ Manual AWS deployment via Console

## 🔧 What Needs Fixing

- ⏳ PowerShell deployment automation scripts
- ⏳ One-click deployment

---

**Ready to start?** Run `npm install` then `npm run dev`!
