# Deployment Documentation

This folder contains all deployment-related documentation for the InsightSphere Dashboard.

## Quick Links

### Current Status
- **[AMPLIFY_STATUS.md](AMPLIFY_STATUS.md)** - Current deployment status and configuration

### Deployment Guides
- **[AMPLIFY_DEPLOYMENT_GUIDE.md](AMPLIFY_DEPLOYMENT_GUIDE.md)** - Complete AWS Amplify deployment guide
- **[AMPLIFY_CONSOLE_SETUP.md](AMPLIFY_CONSOLE_SETUP.md)** - AWS Amplify Console setup instructions

### Troubleshooting
- **[DEPLOYMENT_FIX_SUMMARY.md](DEPLOYMENT_FIX_SUMMARY.md)** - Recent deployment fixes and solutions

## Current Deployment

**App:** insightsphere-dashboard  
**URL:** https://d33feletv96fod.amplifyapp.com  
**Status:** ✅ Live  
**Auto-Deploy:** Enabled on `main` branch

## Quick Deploy

To deploy updates:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Amplify will automatically build and deploy.

## Monitor Deployment

```powershell
# Check status
.\scripts\check-deployment.ps1

# Or visit AWS Console
# https://console.aws.amazon.com/amplify/home?region=us-east-1#/d33feletv96fod
```

## Documentation Overview

### AMPLIFY_STATUS.md
- Current app configuration
- Environment variables
- Backend resources (Cognito, AppSync, DynamoDB, S3)
- Access URLs
- Quick commands

### AMPLIFY_DEPLOYMENT_GUIDE.md
- Complete deployment walkthrough
- Prerequisites and setup
- Environment configuration
- Branch deployments
- Custom domain setup
- Monitoring and rollback procedures

### AMPLIFY_CONSOLE_SETUP.md
- AWS Console setup without CLI
- Backend deployment via CloudFormation
- Connecting GitHub to Amplify
- Environment variable configuration
- Troubleshooting common issues

### DEPLOYMENT_FIX_SUMMARY.md
- Recent React duplicate instance fix
- Build configuration changes
- Verification steps
- Timeline of fixes

## Related Documentation

- **[Main Deployment Guide](../DEPLOYMENT.md)** - General deployment documentation
- **[Backend Setup](../BACKEND_SETUP.md)** - AWS backend configuration
- **[CI/CD Pipeline](../CI_CD_PIPELINE.md)** - Continuous integration setup
- **[Deployment Checklist](../DEPLOYMENT_CHECKLIST.md)** - Pre/post deployment checklist

## Support

For deployment issues:
1. Check the troubleshooting sections in the guides
2. Review AWS Amplify Console logs
3. Check CloudWatch logs
4. Review recent commits for breaking changes

---

**Last Updated:** December 5, 2025
