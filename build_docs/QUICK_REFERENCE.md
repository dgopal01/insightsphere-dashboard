# InsightSphere Dashboard - Quick Reference

## 🚀 Quick Start

### Development
```bash
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:5173)
```

### Deployment
```bash
# Backend (CloudFormation)
./deploy.sh "your-email@example.com"

# Frontend (Amplify Hosting)
git push origin main  # Auto-deploys
```

## 🌐 Live Application

**URL**: https://main.d33feletv96fod.amplifyapp.com

**Sign In**:
- Email: dgopal@swbc.com
- Password: TempPass123! (change on first login)

## 📚 Key Documentation

| Document | Purpose |
|----------|---------|
| [README.md](README.md) | Main project documentation |
| [DEPLOYMENT_COMPLETE.md](DEPLOYMENT_COMPLETE.md) | Current deployment guide |
| [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) | Project organization |
| [TESTING.md](TESTING.md) | Testing guide |
| [SETUP.md](SETUP.md) | Setup instructions |

## 🛠️ Common Commands

### Development
```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build
npm run type-check       # TypeScript type checking
```

### Code Quality
```bash
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
```

### Testing
```bash
npm run test             # Run tests once
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
npm run test:ui          # Run tests with UI
```

### Deployment
```bash
# Backend
.\deploy-cloudformation.ps1 -AdminEmail "email@example.com"

# Create users
.\create-admin-user.ps1 -Email "admin@example.com"

# Update environment
.\update-env.ps1
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         GitHub Repository               │
│    dgopal01/insightsphere-dashboard     │
└──────────────┬──────────────────────────┘
               │ git push (auto-deploy)
               ▼
┌─────────────────────────────────────────┐
│      AWS Amplify Hosting (Frontend)     │
│  • Automatic builds                     │
│  • Environment variables                │
│  • CDN distribution                     │
│  • HTTPS enabled                        │
└──────────────┬──────────────────────────┘
               │ uses
               ▼
┌─────────────────────────────────────────┐
│   CloudFormation Stack (Backend)        │
│  • Cognito User Pool                    │
│  • AppSync GraphQL API                  │
│  • DynamoDB Tables                      │
│  • S3 Bucket                            │
└─────────────────────────────────────────┘
```

## 🔑 AWS Resources

### CloudFormation Stack
- **Name**: insightsphere-dev
- **Region**: us-east-1
- **Account**: 327052515912

### Cognito
- **User Pool ID**: us-east-1_gYh3rcIFz
- **Client ID**: 6mlu9llcomgp1iokfk3552tvs3
- **Identity Pool**: us-east-1:c4d5c67a-30d9-49ac-bc80-542775e19d9d

### AppSync
- **API ID**: u3e7wpkmkrevbkkho5rh6pqf6u
- **Endpoint**: https://y7sc7o27czcp3pw6lyib6ma2we.appsync-api.us-east-1.amazonaws.com/graphql

### DynamoDB
- **ChatLog Table**: insightsphere-dev-chatlogs
- **Feedback Table**: insightsphere-dev-feedback

### S3
- **Bucket**: insightsphere-dev-exports-327052515912

### Amplify Hosting
- **App ID**: d33feletv96fod
- **Domain**: d33feletv96fod.amplifyapp.com

## 🔧 Troubleshooting

### Build Fails
```bash
npm run type-check    # Check TypeScript errors
npm run lint          # Check linting errors
npm run build         # Test build locally
```

### Authentication Issues
- Check environment variables in Amplify Console
- Verify Cognito user exists
- Check browser console for errors

### Deployment Issues
- Check CloudFormation stack status
- View Amplify build logs in console
- Verify environment variables are set

## 📞 Useful AWS CLI Commands

### View Stack Status
```bash
aws cloudformation describe-stacks \
  --stack-name insightsphere-dev \
  --region us-east-1
```

### List Cognito Users
```bash
aws cognito-idp list-users \
  --user-pool-id us-east-1_gYh3rcIFz \
  --region us-east-1
```

### View Amplify Build
```bash
aws amplify list-jobs \
  --app-id d33feletv96fod \
  --branch-name main \
  --region us-east-1
```

### Trigger Manual Deploy
```bash
aws amplify start-job \
  --app-id d33feletv96fod \
  --branch-name main \
  --job-type RELEASE \
  --region us-east-1
```

## 💡 Tips

1. **Environment Variables**: Set in Amplify Console, not in code
2. **Auto Deploy**: Every git push to main triggers deployment
3. **Build Time**: ~3-5 minutes for frontend builds
4. **Logs**: Check Amplify Console for build logs
5. **Monitoring**: Use CloudWatch for backend metrics

## 📱 Access Points

- **Application**: https://main.d33feletv96fod.amplifyapp.com
- **Amplify Console**: https://console.aws.amazon.com/amplify/home?region=us-east-1#/d33feletv96fod
- **CloudFormation**: https://console.aws.amazon.com/cloudformation/home?region=us-east-1
- **Cognito**: https://console.aws.amazon.com/cognito/home?region=us-east-1
- **AppSync**: https://console.aws.amazon.com/appsync/home?region=us-east-1

---

**For detailed information, see the full documentation in the links above.**
