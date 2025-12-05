# 🚀 START HERE - InsightSphere Dashboard

Welcome! This guide will get you up and running quickly.

## Quick Start (Local Development)

The fastest way to start developing:

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Start Development Server

```bash
npm run dev
```

### Step 3: Access the Application

Open your browser to: **http://localhost:3000**

**Note:** Without AWS backend configuration, you'll see the UI but data fetching won't work.

---

## AWS Amplify Deployment (Production)

Your app is already deployed and configured!

### Current Deployment Status

✅ **App Name:** insightsphere-dashboard  
✅ **Production URL:** https://d33feletv96fod.amplifyapp.com  
✅ **Status:** Live and operational  
✅ **Auto-Deploy:** Enabled on `main` branch

### How to Deploy Updates

Simply push to GitHub:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Amplify automatically builds and deploys your changes!

### Monitor Deployment

```powershell
# Check deployment status
.\scripts\check-deployment.ps1

# Or visit AWS Console
# https://console.aws.amazon.com/amplify/home?region=us-east-1#/d33feletv96fod
```

---

## 📚 Documentation

### Quick References
- **[Quick Start Guide](QUICK_START.md)** - Fast setup instructions
- **[README](README.md)** - Project overview and structure

### Deployment Documentation
- **[Amplify Status](docs/deployment/AMPLIFY_STATUS.md)** - Current deployment info
- **[Amplify Deployment Guide](docs/deployment/AMPLIFY_DEPLOYMENT_GUIDE.md)** - Complete deployment guide
- **[Amplify Console Setup](docs/deployment/AMPLIFY_CONSOLE_SETUP.md)** - Console configuration
- **[Deployment Fix Summary](docs/deployment/DEPLOYMENT_FIX_SUMMARY.md)** - Recent fixes

### Feature Documentation
- **[Chat Logs Review](docs/chat-logs-review/)** - Chat logs feature docs
- **[Backend Setup](docs/BACKEND_SETUP.md)** - AWS backend configuration
- **[Authentication](docs/AUTHENTICATION.md)** - Cognito authentication
- **[Monitoring](docs/MONITORING_SETUP.md)** - Monitoring and logging

### Build Documentation
- **[Build Commands](build_docs/BUILD_COMMANDS.md)** - All build commands
- **[Cloud Deployment](build_docs/CLOUD_DEPLOYMENT_GUIDE.md)** - Cloud deployment options
- **[Testing Guide](build_docs/TESTING.md)** - Testing documentation

---

## Common Tasks

### Development
```bash
npm run dev          # Start dev server
npm run test         # Run tests
npm run lint         # Check code quality
npm run type-check   # TypeScript validation
```

### Building
```bash
npm run build        # Build for production
npm run build:dev    # Build for development
npm run preview      # Preview production build
```

### Deployment
```bash
git push origin main # Deploy to production (auto)
```

---

## Need Help?

- **Deployment Issues:** See [docs/deployment/](docs/deployment/)
- **Build Issues:** See [build_docs/](build_docs/)
- **Feature Questions:** See [docs/](docs/)

---

**Ready to start?** Run `npm install` then `npm run dev`!
