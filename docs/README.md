# EthosAI Review Portal - Documentation

Welcome to the EthosAI Review Portal documentation. This guide will help you navigate through all available documentation.

## 📚 Documentation Structure

```
docs/
├── README.md (this file)
├── 🚀 Getting Started
│   ├── QUICK_START.md
│   └── ENVIRONMENT_SETUP.md
│
├── 🏗️ Architecture & Design
│   ├── ARCHITECTURE_DIAGRAM.md
│   ├── COLOR_SCHEME.md
│   └── AUTHENTICATION.md
│
├── 🔧 Development
│   ├── BACKEND_SETUP.md
│   ├── BACKEND_QUICK_REFERENCE.md
│   ├── ERROR_HANDLING.md
│   └── ACCESSIBILITY_VERIFICATION.md
│
├── 🚢 Deployment
│   ├── DEPLOYMENT_GUIDE.md (Comprehensive)
│   ├── DEPLOYMENT_QUICKSTART.md
│   ├── DEPLOYMENT_CHECKLIST.md
│   ├── CI_CD_PIPELINE.md
│   └── deployment/ (Detailed guides)
│
├── 📊 DevOps
│   ├── DEVOPS_BACKLOG.md
│   ├── MONITORING_SETUP.md
│   └── PERFORMANCE_OPTIMIZATIONS.md
│
├── 📖 Feature Documentation
│   └── chat-logs-review/ (Chat Logs Review System)
│
├── 👥 Team Resources
│   └── onboarding/ (Developer onboarding)
│
└── 📝 Project History
    └── migration/ (Design system migration)
```

---

## 🚀 Quick Links

### For New Developers
1. [Developer Onboarding Guide](./onboarding/DEVELOPER_ONBOARDING_GUIDE.md)
2. [Environment Setup](./ENVIRONMENT_SETUP.md)
3. [Backend Setup](./BACKEND_SETUP.md)

### For DevOps Engineers
1. [Deployment Guide](./DEPLOYMENT_GUIDE.md) - **Start Here**
2. [Architecture Diagrams](./ARCHITECTURE_DIAGRAM.md)
3. [DevOps Backlog](./DEVOPS_BACKLOG.md)
4. [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)

### For Product Owners
1. [Chat Logs Review User Guide](./chat-logs-review/USER_GUIDE.md)
2. [DevOps Backlog](./DEVOPS_BACKLOG.md)
3. [Monitoring Setup](./MONITORING_SETUP.md)

### For Architects
1. [Architecture Diagrams](./ARCHITECTURE_DIAGRAM.md)
2. [Authentication Flow](./AUTHENTICATION.md)
3. [Performance Optimizations](./PERFORMANCE_OPTIMIZATIONS.md)

---

## 📋 Documentation by Category

### 🏗️ Architecture & Design

| Document | Description | Audience |
|----------|-------------|----------|
| [Architecture Diagrams](./ARCHITECTURE_DIAGRAM.md) | Complete system architecture with 11 Mermaid diagrams | All |
| [Color Scheme](./COLOR_SCHEME.md) | Application color palette and usage guidelines | Developers, Designers |
| [Authentication](./AUTHENTICATION.md) | AWS Cognito authentication flow and setup | Developers, DevOps |

### 🚢 Deployment & Infrastructure

| Document | Description | Audience |
|----------|-------------|----------|
| [Deployment Guide](./DEPLOYMENT_GUIDE.md) | **Comprehensive deployment guide** (Amplify + EKS) | DevOps |
| [Deployment Quickstart](./DEPLOYMENT_QUICKSTART.md) | Quick deployment steps | DevOps |
| [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md) | Pre/post deployment checklist | DevOps |
| [CI/CD Pipeline](./CI_CD_PIPELINE.md) | Continuous integration and deployment setup | DevOps |
| [DevOps Backlog](./DEVOPS_BACKLOG.md) | 5 PBIs for deployment project | DevOps, PM |

### 🔧 Development

| Document | Description | Audience |
|----------|-------------|----------|
| [Environment Setup](./ENVIRONMENT_SETUP.md) | Local development environment setup | Developers |
| [Backend Setup](./BACKEND_SETUP.md) | Backend services configuration | Developers |
| [Backend Quick Reference](./BACKEND_QUICK_REFERENCE.md) | Quick reference for backend APIs | Developers |
| [Error Handling](./ERROR_HANDLING.md) | Error handling patterns and best practices | Developers |
| [Accessibility](./ACCESSIBILITY_VERIFICATION.md) | Accessibility compliance verification | Developers, QA |

### 📊 Operations & Monitoring

| Document | Description | Audience |
|----------|-------------|----------|
| [Monitoring Setup](./MONITORING_SETUP.md) | CloudWatch and Sentry configuration | DevOps |
| [Performance Optimizations](./PERFORMANCE_OPTIMIZATIONS.md) | Performance tuning guide | Developers, DevOps |
| [Build Optimization](./BUILD_OPTIMIZATION.md) | Build process optimization | DevOps |

### 📖 Feature Documentation

| Document | Description | Audience |
|----------|-------------|----------|
| [Chat Logs Review - README](./chat-logs-review/README.md) | Overview of Chat Logs Review system | All |
| [Chat Logs Review - User Guide](./chat-logs-review/USER_GUIDE.md) | End-user documentation | Users, PM |
| [Chat Logs Review - API Docs](./chat-logs-review/API_DOCUMENTATION.md) | API reference | Developers |
| [Chat Logs Review - Configuration](./chat-logs-review/CONFIGURATION.md) | Configuration guide | DevOps |
| [Chat Logs Review - Troubleshooting](./chat-logs-review/TROUBLESHOOTING.md) | Common issues and solutions | Support, DevOps |

### 👥 Team Resources

| Document | Description | Audience |
|----------|-------------|----------|
| [Developer Onboarding](./onboarding/DEVELOPER_ONBOARDING_GUIDE.md) | Complete onboarding guide for new developers | New Developers |
| [AWS Developer Permissions](./onboarding/AWS_DEVELOPER_PERMISSIONS.md) | Required AWS permissions for developers | DevOps, Admins |
| [AWS Monitoring Permissions](./onboarding/AWS_MONITORING_ROLE_PERMISSIONS.md) | Monitoring role permissions | DevOps, Admins |

---

## 🎯 Common Tasks

### Deploying to Production
1. Review [Deployment Guide](./DEPLOYMENT_GUIDE.md)
2. Check [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)
3. Follow [DevOps Backlog](./DEVOPS_BACKLOG.md) PBIs
4. Verify with [Monitoring Setup](./MONITORING_SETUP.md)

### Setting Up Local Development
1. Follow [Environment Setup](./ENVIRONMENT_SETUP.md)
2. Configure [Backend Setup](./BACKEND_SETUP.md)
3. Review [Developer Onboarding](./onboarding/DEVELOPER_ONBOARDING_GUIDE.md)

### Troubleshooting Issues
1. Check [Chat Logs Review Troubleshooting](./chat-logs-review/TROUBLESHOOTING.md)
2. Review [Error Handling](./ERROR_HANDLING.md)
3. Check deployment fixes in [deployment/](./deployment/) folder

### Understanding the System
1. Start with [Architecture Diagrams](./ARCHITECTURE_DIAGRAM.md)
2. Review [Authentication](./AUTHENTICATION.md) flow
3. Check [Chat Logs Review README](./chat-logs-review/README.md)

---

## 📝 Document Status

### Active Documents (Current)
These documents are actively maintained and up-to-date:
- ✅ DEPLOYMENT_GUIDE.md
- ✅ ARCHITECTURE_DIAGRAM.md
- ✅ DEVOPS_BACKLOG.md
- ✅ COLOR_SCHEME.md
- ✅ All files in `chat-logs-review/`
- ✅ All files in `onboarding/`

### Reference Documents
These documents provide historical context:
- 📚 migration/ - Design system migration history
- 📚 deployment/ - Deployment troubleshooting history
- 📚 PHASE_5_CLEANUP_SUMMARY.md
- 📚 TASK_8_UI_IMPROVEMENTS.md

### Deprecated Documents
These documents may be outdated:
- ⚠️ DEPLOYMENT.md (superseded by DEPLOYMENT_GUIDE.md)

---

## 🔄 Document Maintenance

### Update Frequency
- **Architecture & Design**: Update when major changes occur
- **Deployment Guides**: Review quarterly or after infrastructure changes
- **Development Guides**: Update with new features or tools
- **Troubleshooting**: Add new issues as they're discovered

### Contributing
When updating documentation:
1. Keep language clear and concise
2. Include code examples where helpful
3. Update the relevant section in this README
4. Add date and version to document footer
5. Review for broken links

---

## 📞 Support

### Documentation Issues
- Found outdated information? Create an issue
- Need clarification? Contact the DevOps team
- Want to contribute? Submit a pull request

### Team Contacts
- **DevOps Team**: devops@example.com
- **Development Team**: dev@example.com
- **Product Owner**: po@example.com

---

## 🔗 External Resources

- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [AWS EKS Best Practices](https://aws.github.io/aws-eks-best-practices/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)

---

**Last Updated**: December 2024
**Maintained By**: DevOps & Development Teams
**Version**: 1.0
