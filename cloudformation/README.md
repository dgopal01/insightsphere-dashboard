# InsightSphere Dashboard - CloudFormation Deployment

This directory contains Infrastructure as Code (IaC) for deploying the complete InsightSphere Dashboard to AWS using CloudFormation.

## 🚀 Quick Start

Deploy the entire application with a single command:

```powershell
.\deploy-cloudformation.ps1 -AdminEmail "your-email@example.com"
```

That's it! The script will:
- ✅ Create all AWS resources
- ✅ Configure authentication (Cognito)
- ✅ Set up the database (DynamoDB)
- ✅ Create the API (AppSync GraphQL)
- ✅ Configure file storage (S3)
- ✅ Update your `.env` file automatically
- ✅ Generate `aws-exports.ts`

## 📋 Prerequisites

- ✅ AWS CLI installed and configured
- ✅ AWS account with appropriate permissions
- ✅ PowerShell (Windows) or PowerShell Core (cross-platform)
- ✅ Valid email address for admin user

## 🏗️ What Gets Deployed

The CloudFormation stack creates:

### Authentication & Authorization
- **Cognito User Pool** - User authentication
- **Cognito User Pool Client** - Application client
- **Cognito Identity Pool** - Federated identities
- **User Groups** - Admin and Viewer roles

### Data Layer
- **DynamoDB ChatLog Table** - Stores chat conversation logs
  - Primary Key: `id`
  - GSI: `byConversation` (conversationId + timestamp)
  - GSI: `byUser` (userId + timestamp)
- **DynamoDB Feedback Table** - Stores user feedback
  - Primary Key: `id`
  - GSI: `byLogId` (logId + timestamp)
  - GSI: `byUser` (userId + timestamp)

### API Layer
- **AppSync GraphQL API** - Real-time data access
- **GraphQL Schema** - Complete data model
- **Data Sources** - DynamoDB resolvers
- **Subscriptions** - Real-time updates

### Storage
- **S3 Bucket** - CSV export storage
  - Encryption enabled
  - Versioning (production only)
  - Lifecycle policies (30-day retention)
  - CORS configured

### IAM Roles & Policies
- **AppSync Service Role** - DynamoDB access
- **Authenticated User Role** - S3 access for logged-in users
- **Unauthenticated User Role** - Deny all access

## 📝 Deployment Commands

### Basic Deployment (Development)

```powershell
.\deploy-cloudformation.ps1 -AdminEmail "admin@example.com"
```

### Staging Deployment

```powershell
.\deploy-cloudformation.ps1 `
    -Environment staging `
    -AdminEmail "admin@example.com" `
    -Region us-east-1
```

### Production Deployment

```powershell
.\deploy-cloudformation.ps1 `
    -Environment prod `
    -AdminEmail "admin@example.com" `
    -Region us-east-1 `
    -GitHubRepo "https://github.com/your-org/insightsphere"
```

### Skip Confirmation Prompt

```powershell
.\deploy-cloudformation.ps1 `
    -AdminEmail "admin@example.com" `
    -SkipConfirmation
```

## 👤 Creating Users

### Create Admin User

After deployment, create an admin user:

```powershell
.\create-admin-user.ps1 -Email "admin@example.com"
```

Or manually:

```powershell
aws cognito-idp admin-create-user `
    --user-pool-id <USER_POOL_ID> `
    --username admin `
    --user-attributes Name=email,Value=admin@example.com `
    --temporary-password 'TempPass123!' `
    --region us-east-1

aws cognito-idp admin-add-user-to-group `
    --user-pool-id <USER_POOL_ID> `
    --username admin `
    --group-name admin `
    --region us-east-1
```

### Create Viewer User

```powershell
aws cognito-idp admin-create-user `
    --user-pool-id <USER_POOL_ID> `
    --username viewer `
    --user-attributes Name=email,Value=viewer@example.com `
    --temporary-password 'TempPass123!' `
    --region us-east-1

aws cognito-idp admin-add-user-to-group `
    --user-pool-id <USER_POOL_ID> `
    --username viewer `
    --group-name viewer `
    --region us-east-1
```

## 🔄 Updating the Stack

To update an existing deployment:

```powershell
.\deploy-cloudformation.ps1 -AdminEmail "admin@example.com"
```

The script automatically detects if the stack exists and performs an update instead of creating a new stack.

## 🗑️ Deleting the Stack

To remove all resources:

```powershell
aws cloudformation delete-stack `
    --stack-name insightsphere-dev `
    --region us-east-1
```

**Warning**: This will delete all data in DynamoDB tables and S3 bucket!

## 📊 Monitoring Deployment

### View Stack Status

```powershell
aws cloudformation describe-stacks `
    --stack-name insightsphere-dev `
    --region us-east-1
```

### View Stack Events

```powershell
aws cloudformation describe-stack-events `
    --stack-name insightsphere-dev `
    --region us-east-1 `
    --max-items 20
```

### View Stack Resources

```powershell
aws cloudformation list-stack-resources `
    --stack-name insightsphere-dev `
    --region us-east-1
```

## 🔍 Troubleshooting

### Deployment Fails

1. **Check stack events**:
   ```powershell
   aws cloudformation describe-stack-events `
       --stack-name insightsphere-dev `
       --region us-east-1 `
       --query 'StackEvents[?ResourceStatus==`CREATE_FAILED`]'
   ```

2. **View detailed error**:
   ```powershell
   aws cloudformation describe-stack-events `
       --stack-name insightsphere-dev `
       --region us-east-1 `
       --query 'StackEvents[0].ResourceStatusReason'
   ```

3. **Common issues**:
   - **Insufficient permissions**: Ensure your AWS user has CloudFormation, Cognito, DynamoDB, AppSync, S3, and IAM permissions
   - **Resource limits**: Check AWS service quotas
   - **Name conflicts**: Stack names must be unique in your account/region

### Stack Stuck in UPDATE_ROLLBACK_FAILED

```powershell
aws cloudformation continue-update-rollback `
    --stack-name insightsphere-dev `
    --region us-east-1
```

### Can't Delete Stack

If resources can't be deleted:

1. **Empty S3 bucket first**:
   ```powershell
   aws s3 rm s3://insightsphere-dev-exports-<ACCOUNT_ID> --recursive
   ```

2. **Then delete stack**:
   ```powershell
   aws cloudformation delete-stack `
       --stack-name insightsphere-dev `
       --region us-east-1
   ```

## 📁 Files

- `insightsphere-stack.yaml` - Main CloudFormation template
- `../deploy-cloudformation.ps1` - Deployment script
- `../create-admin-user.ps1` - User creation script
- `README.md` - This file

## 🔐 Security Best Practices

1. **Use different environments**: Separate dev, staging, and prod
2. **Rotate credentials**: Change temporary passwords immediately
3. **Enable MFA**: For production admin users
4. **Monitor access**: Use CloudWatch and CloudTrail
5. **Backup data**: Enable point-in-time recovery for production
6. **Least privilege**: Grant minimum necessary permissions

## 💰 Cost Estimation

Approximate monthly costs (us-east-1):

### Development Environment
- Cognito: $0 (first 50,000 MAUs free)
- DynamoDB: $1-5 (on-demand, low usage)
- AppSync: $0-2 (first 250,000 queries free)
- S3: $0-1 (minimal storage)
- **Total**: ~$2-8/month

### Production Environment
- Cognito: $0-50 (depends on MAUs)
- DynamoDB: $10-50 (depends on usage)
- AppSync: $5-20 (depends on queries)
- S3: $1-5 (depends on storage)
- CloudWatch: $2-10 (logs and metrics)
- **Total**: ~$18-135/month

*Costs vary based on actual usage*

## 📚 Additional Resources

- [AWS CloudFormation Documentation](https://docs.aws.amazon.com/cloudformation/)
- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [AWS AppSync Documentation](https://docs.aws.amazon.com/appsync/)
- [AWS DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/)
- [Main Deployment Guide](../DEPLOYMENT_STEPS.md)

## 🆘 Support

If you encounter issues:

1. Check this README
2. Review CloudFormation events
3. Check AWS service status
4. Review the main deployment documentation
5. Open an issue in the repository

## ✅ Post-Deployment Checklist

After successful deployment:

- [ ] Stack created successfully
- [ ] All outputs visible
- [ ] `.env` file updated
- [ ] `aws-exports.ts` created
- [ ] Admin user created
- [ ] User added to admin group
- [ ] Development server started
- [ ] Successfully signed in
- [ ] Dashboard loads with data
- [ ] All features working

---

**Last Updated**: 2024-12-04
