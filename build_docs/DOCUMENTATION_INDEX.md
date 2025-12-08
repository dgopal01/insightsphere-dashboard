# Documentation Index

Complete guide to all documentation in the InsightSphere Dashboard project.

## 🚀 Getting Started

Start here if you're new to the project:

1. **[START_HERE.md](START_HERE.md)** - Quick start guide for developers
2. **[QUICK_START.md](QUICK_START.md)** - Fast setup instructions
3. **[README.md](README.md)** - Project overview and structure

## 📦 Project Documentation

### Core Documentation
- **[README.md](README.md)** - Project overview, tech stack, and quick commands
- **[START_HERE.md](START_HERE.md)** - Getting started guide
- **[QUICK_START.md](QUICK_START.md)** - Quick setup options

## 🚢 Deployment Documentation

Location: `docs/deployment/`

### Current Status
- **[AMPLIFY_STATUS.md](docs/deployment/AMPLIFY_STATUS.md)** - Live deployment status and configuration

### Deployment Guides
- **[AMPLIFY_DEPLOYMENT_GUIDE.md](docs/deployment/AMPLIFY_DEPLOYMENT_GUIDE.md)** - Complete AWS Amplify deployment
- **[AMPLIFY_CONSOLE_SETUP.md](docs/deployment/AMPLIFY_CONSOLE_SETUP.md)** - Console-based setup
- **[README.md](docs/deployment/README.md)** - Deployment docs overview

### Troubleshooting
- **[DEPLOYMENT_FIX_SUMMARY.md](docs/deployment/DEPLOYMENT_FIX_SUMMARY.md)** - Recent fixes and solutions

### General Deployment
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** - General deployment guide
- **[DEPLOYMENT_CHECKLIST.md](docs/DEPLOYMENT_CHECKLIST.md)** - Pre/post deployment checklist
- **[DEPLOYMENT_QUICKSTART.md](docs/DEPLOYMENT_QUICKSTART.md)** - Quick deployment reference

## 🏗️ Build Documentation

Location: `build_docs/`

- **[BUILD_COMMANDS.md](build_docs/BUILD_COMMANDS.md)** - All build commands and scripts
- **[BUILD_OPTIMIZATION.md](docs/BUILD_OPTIMIZATION.md)** - Build optimization strategies
- **[CLOUD_DEPLOYMENT_GUIDE.md](build_docs/CLOUD_DEPLOYMENT_GUIDE.md)** - Cloud deployment options
- **[TESTING.md](build_docs/TESTING.md)** - Testing guide and strategies

## 🔧 Setup & Configuration

- **[ENVIRONMENT_SETUP.md](docs/ENVIRONMENT_SETUP.md)** - Environment configuration
- **[BACKEND_SETUP.md](docs/BACKEND_SETUP.md)** - AWS backend setup
- **[AUTHENTICATION.md](docs/AUTHENTICATION.md)** - Cognito authentication setup
- **[MONITORING_SETUP.md](docs/MONITORING_SETUP.md)** - Monitoring and logging

## 📋 Feature Documentation

Location: `docs/`

### Chat Logs Review System
- **[docs/chat-logs-review/](docs/chat-logs-review/)** - Complete feature documentation

### Other Features
- **[ERROR_HANDLING.md](docs/ERROR_HANDLING.md)** - Error handling patterns
- **[PERFORMANCE_OPTIMIZATIONS.md](docs/PERFORMANCE_OPTIMIZATIONS.md)** - Performance tips
- **[ACCESSIBILITY_VERIFICATION.md](docs/ACCESSIBILITY_VERIFICATION.md)** - Accessibility guidelines

## ☁️ CloudFormation & Infrastructure

Location: `cloudformation/`

- **[README.md](cloudformation/README.md)** - CloudFormation overview
- **[DEPLOYMENT_GUIDE.md](cloudformation/DEPLOYMENT_GUIDE.md)** - CloudFormation deployment
- **[CHAT_LOGS_REVIEW_README.md](cloudformation/CHAT_LOGS_REVIEW_README.md)** - Chat logs infrastructure
- **[IMPLEMENTATION_SUMMARY.md](cloudformation/IMPLEMENTATION_SUMMARY.md)** - Implementation details

## 🔄 CI/CD & Automation

- **[CI_CD_PIPELINE.md](docs/CI_CD_PIPELINE.md)** - Continuous integration setup
- **[amplify.yml](amplify.yml)** - Amplify build configuration

## 📜 Scripts Documentation

Location: `scripts/`

- **[check-deployment.ps1](scripts/check-deployment.ps1)** - Check deployment status
- **[deploy-chat-logs-review.cmd](scripts/deploy-chat-logs-review.cmd)** - Deploy backend
- **[start-local.ps1](scripts/start-local.ps1)** - Start local development

## 🎯 Quick Reference by Task

### I want to...

#### Start Development
1. Read [START_HERE.md](START_HERE.md)
2. Run `npm install && npm run dev`

#### Deploy to Production
1. Read [AMPLIFY_STATUS.md](docs/deployment/AMPLIFY_STATUS.md)
2. Push to GitHub: `git push origin main`
3. Monitor: `.\scripts\check-deployment.ps1`

#### Set Up AWS Backend
1. Read [BACKEND_SETUP.md](docs/BACKEND_SETUP.md)
2. Read [CloudFormation Guide](cloudformation/DEPLOYMENT_GUIDE.md)
3. Run deployment script

#### Configure Environment
1. Read [ENVIRONMENT_SETUP.md](docs/ENVIRONMENT_SETUP.md)
2. Copy `.env.example` to `.env`
3. Configure AWS credentials

#### Build for Production
1. Read [BUILD_COMMANDS.md](build_docs/BUILD_COMMANDS.md)
2. Run `npm run build:prod`

#### Run Tests
1. Read [TESTING.md](build_docs/TESTING.md)
2. Run `npm test`

#### Troubleshoot Deployment
1. Read [DEPLOYMENT_FIX_SUMMARY.md](docs/deployment/DEPLOYMENT_FIX_SUMMARY.md)
2. Check [DEPLOYMENT_CHECKLIST.md](docs/DEPLOYMENT_CHECKLIST.md)
3. Review AWS Console logs

#### Set Up Monitoring
1. Read [MONITORING_SETUP.md](docs/MONITORING_SETUP.md)
2. Configure CloudWatch
3. Set up Sentry (optional)

## 📊 Documentation Structure

```
.
├── START_HERE.md                    # Start here!
├── QUICK_START.md                   # Quick setup
├── README.md                        # Project overview
├── DOCUMENTATION_INDEX.md           # This file
│
├── docs/                            # Feature & setup docs
│   ├── deployment/                  # Deployment docs
│   │   ├── README.md
│   │   ├── AMPLIFY_STATUS.md
│   │   ├── AMPLIFY_DEPLOYMENT_GUIDE.md
│   │   ├── AMPLIFY_CONSOLE_SETUP.md
│   │   └── DEPLOYMENT_FIX_SUMMARY.md
│   │
│   ├── chat-logs-review/           # Feature docs
│   ├── BACKEND_SETUP.md
│   ├── AUTHENTICATION.md
│   ├── DEPLOYMENT.md
│   ├── DEPLOYMENT_CHECKLIST.md
│   ├── DEPLOYMENT_QUICKSTART.md
│   ├── ENVIRONMENT_SETUP.md
│   ├── ERROR_HANDLING.md
│   ├── MONITORING_SETUP.md
│   └── PERFORMANCE_OPTIMIZATIONS.md
│
├── build_docs/                      # Build & testing docs
│   ├── BUILD_COMMANDS.md
│   ├── CLOUD_DEPLOYMENT_GUIDE.md
│   └── TESTING.md
│
├── cloudformation/                  # Infrastructure docs
│   ├── README.md
│   ├── DEPLOYMENT_GUIDE.md
│   └── IMPLEMENTATION_SUMMARY.md
│
└── scripts/                         # Deployment scripts
    ├── check-deployment.ps1
    ├── deploy-chat-logs-review.cmd
    └── start-local.ps1
```

## 🔍 Finding Documentation

### By Topic

**Deployment:** `docs/deployment/`  
**Building:** `build_docs/`  
**Features:** `docs/chat-logs-review/`  
**Infrastructure:** `cloudformation/`  
**Setup:** `docs/BACKEND_SETUP.md`, `docs/ENVIRONMENT_SETUP.md`

### By Role

**New Developer:** Start with [START_HERE.md](START_HERE.md)  
**DevOps Engineer:** See `docs/deployment/` and `cloudformation/`  
**QA Engineer:** See [TESTING.md](build_docs/TESTING.md)  
**Product Manager:** See [README.md](README.md) and feature docs

## 📝 Documentation Standards

All documentation follows these standards:
- Clear, concise language
- Step-by-step instructions
- Code examples where applicable
- Troubleshooting sections
- Last updated dates

## 🆘 Getting Help

1. Check this index for relevant documentation
2. Search documentation for keywords
3. Check troubleshooting sections
4. Review AWS Console logs
5. Check recent commits for changes

---

**Last Updated:** December 5, 2025  
**Maintained By:** Development Team
