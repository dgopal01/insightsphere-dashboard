# InsightSphere Dashboard - Quick Deployment Guide

## 🚀 One-Command Deployment

Deploy the entire application with a single command:

```powershell
.\deploy-all.ps1 -AdminEmail "your-email@example.com" -StartDevServer
```

That's it! This will:
- ✅ Deploy all AWS infrastructure
- ✅ Create admin user
- ✅ Configure the application
- ✅ Start the development server

## 📋 What You Need

- AWS CLI configured (`aws configure`)
- PowerShell
- Your email address

## ⚡ Quick Start Steps

### 1. Clone and Setup

```powershell
cd ai_metrics_portal
npm install
```

### 2. Deploy Everything

```powershell
.\deploy-all.ps1 -AdminEmail "admin@example.com" -StartDevServer
```

### 3. Open Browser

```
http://localhost:5173
```

### 4. Sign In

```
Username: admin
Password: TempPass123!
```

You'll be prompted to change the password on first login.

## 🎯 Alternative: Step-by-Step Deployment

If you prefer more control:

### Step 1: Deploy Infrastructure

```powershell
.\deploy-cloudformation.ps1 -AdminEmail "admin@example.com"
```

### Step 2: Create Admin User

```powershell
.\create-admin-user.ps1 -Email "admin@example.com"
```

### Step 3: Start Development Server

```powershell
npm run dev
```

## 📊 What Gets Deployed

| Resource | Purpose |
|----------|---------|
| Cognito User Pool | User authentication |
| AppSync GraphQL API | Real-time data access |
| DynamoDB Tables | Data storage (ChatLog, Feedback) |
| S3 Bucket | CSV export storage |
| IAM Roles | Permissions management |

## 🔧 Deployment Options

### Development Environment (Default)

```powershell
.\deploy-all.ps1 -AdminEmail "admin@example.com"
```

### Staging Environment

```powershell
.\deploy-all.ps1 `
    -AdminEmail "admin@example.com" `
    -Environment staging
```

### Production Environment

```powershell
.\deploy-all.ps1 `
    -AdminEmail "admin@example.com" `
    -Environment prod `
    -Region us-east-1
```

### Skip User Creation

```powershell
.\deploy-all.ps1 `
    -AdminEmail "admin@example.com" `
    -SkipUserCreation
```

## 🗑️ Cleanup

To remove all AWS resources:

```powershell
aws cloudformation delete-stack `
    --stack-name insightsphere-dev `
    --region us-east-1
```

## ❓ Troubleshooting

### Deployment Fails

Check the error message and stack events:

```powershell
aws cloudformation describe-stack-events `
    --stack-name insightsphere-dev `
    --region us-east-1 `
    --max-items 10
```

### Can't Sign In

1. Verify user exists:
   ```powershell
   aws cognito-idp list-users `
       --user-pool-id <USER_POOL_ID> `
       --region us-east-1
   ```

2. Reset password:
   ```powershell
   aws cognito-idp admin-set-user-password `
       --user-pool-id <USER_POOL_ID> `
       --username admin `
       --password "NewPass123!" `
       --permanent `
       --region us-east-1
   ```

### Environment Variables Not Working

Re-run the deployment script to regenerate configuration:

```powershell
.\deploy-cloudformation.ps1 -AdminEmail "admin@example.com"
```

## 📁 Generated Files

After deployment, these files are created/updated:

- `.env` - Environment variables
- `src/aws-exports.ts` - AWS configuration
- `deployment-info.json` - Deployment details
- `.env.backup-*` - Backup of previous .env

## 💰 Cost Estimate

**Development**: ~$2-8/month
**Production**: ~$18-135/month

Costs depend on actual usage. See `cloudformation/README.md` for details.

## 📚 Documentation

- **CloudFormation Details**: `cloudformation/README.md`
- **Full Deployment Guide**: `DEPLOYMENT_STEPS.md`
- **Comprehensive Docs**: `docs/DEPLOYMENT.md`

## ✅ Success Checklist

After deployment:

- [ ] Stack created successfully
- [ ] Admin user created
- [ ] `.env` file updated
- [ ] Development server running
- [ ] Can access http://localhost:5173
- [ ] Can sign in successfully
- [ ] Dashboard loads
- [ ] All features working

## 🆘 Need Help?

1. Check error messages carefully
2. Review `cloudformation/README.md`
3. Check AWS Console for resource status
4. Verify AWS credentials: `aws sts get-caller-identity`

## 🎉 You're Done!

Your InsightSphere Dashboard is now deployed and ready to use!

---

**Quick Commands Reference:**

```powershell
# Deploy everything
.\deploy-all.ps1 -AdminEmail "admin@example.com" -StartDevServer

# Create additional user
.\create-admin-user.ps1 -Email "user@example.com" -Username "newuser"

# Start dev server
npm run dev

# View deployment info
cat deployment-info.json

# Delete everything
aws cloudformation delete-stack --stack-name insightsphere-dev --region us-east-1
```

---

**Last Updated**: 2024-12-04
