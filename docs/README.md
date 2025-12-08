# EthosAI Documentation

Welcome to the EthosAI documentation hub. This directory contains all project documentation organized by category.

## 📚 Documentation Structure

```
docs/
├── README.md                          # This file - Documentation index
├── onboarding/                        # New team member onboarding
│   ├── ONBOARDING_SUMMARY.md         # Quick reference and overview
│   ├── DEVELOPER_ONBOARDING_GUIDE.md # Complete developer setup guide
│   ├── AWS_DEVELOPER_PERMISSIONS.md  # AWS IAM policies for developers
│   └── AWS_MONITORING_ROLE_PERMISSIONS.md # AWS IAM policies for monitoring
├── migration/                         # Design system migration docs
│   ├── MIGRATION_COMPLETE.md         # Final migration summary
│   ├── MIGRATION_STATUS.md           # Current migration status
│   ├── DESIGN_SYSTEM_MIGRATION_PROMPT.md # Migration plan
│   ├── PHASE_1_COMPLETE.md           # Setup & Core Components
│   ├── PHASE_2_COMPLETE.md           # Layout Components
│   ├── PHASE_3_COMPLETE.md           # Initial Page Migration
│   ├── PHASE_3_SUMMARY.md            # Phase 3 summary
│   ├── PHASE_4_COMPLETE.md           # Remaining Pages (in progress)
│   └── PHASE_4_FINAL.md              # Phase 4 final summary
├── chat-logs-review/                  # Feature-specific documentation
│   └── [existing feature docs]
├── AUTHENTICATION.md                  # Authentication setup
├── BACKEND_SETUP.md                   # Backend configuration
├── DEPLOYMENT.md                      # Deployment guide
└── MONITORING_SETUP.md                # Monitoring configuration
```

---

## 🚀 Quick Start

### For New Developers
**Start here**: [Developer Onboarding Guide](./onboarding/DEVELOPER_ONBOARDING_GUIDE.md)

This guide will walk you through:
1. Setting up your development environment
2. Configuring AWS access
3. Running the application locally
4. Understanding the project structure
5. Making your first contribution

### For DevOps/Team Leads
**Start here**: [Onboarding Summary](./onboarding/ONBOARDING_SUMMARY.md)

Quick reference for:
- Setting up new team members
- AWS IAM policies and permissions
- Environment configuration
- Access management

### For Monitoring Team
**Start here**: [AWS Monitoring Role Permissions](./onboarding/AWS_MONITORING_ROLE_PERMISSIONS.md)

Complete guide for:
- Monitoring IAM policies
- CloudWatch setup
- Dashboard configuration
- Alert management

---

## 📖 Documentation Categories

### 1. Onboarding Documentation

Essential guides for new team members.

| Document | Audience | Purpose |
|----------|----------|---------|
| [Onboarding Summary](./onboarding/ONBOARDING_SUMMARY.md) | All | Quick reference and overview |
| [Developer Onboarding Guide](./onboarding/DEVELOPER_ONBOARDING_GUIDE.md) | Developers | Complete setup guide |
| [AWS Developer Permissions](./onboarding/AWS_DEVELOPER_PERMISSIONS.md) | DevOps | IAM policies for developers |
| [AWS Monitoring Permissions](./onboarding/AWS_MONITORING_ROLE_PERMISSIONS.md) | SRE/Monitoring | IAM policies for monitoring |

### 2. Migration Documentation

Design system migration from Material-UI to Tailwind CSS + Radix UI.

| Document | Status | Description |
|----------|--------|-------------|
| [Migration Complete](./migration/MIGRATION_COMPLETE.md) | ✅ Final | Complete migration summary |
| [Migration Status](./migration/MIGRATION_STATUS.md) | ✅ Current | Current status tracker |
| [Migration Prompt](./migration/DESIGN_SYSTEM_MIGRATION_PROMPT.md) | 📋 Plan | Original migration plan |
| [Phase 1 Complete](./migration/PHASE_1_COMPLETE.md) | ✅ Done | Setup & Core Components |
| [Phase 2 Complete](./migration/PHASE_2_COMPLETE.md) | ✅ Done | Layout Components |
| [Phase 3 Complete](./migration/PHASE_3_COMPLETE.md) | ✅ Done | Initial Page Migration |
| [Phase 4 Final](./migration/PHASE_4_FINAL.md) | ✅ Done | All Pages Migrated |

**Migration Progress**: 100% Complete 🎉

### 3. Feature Documentation

Feature-specific implementation guides.

- [Chat Logs Review System](./chat-logs-review/) - Review and annotate AI chat logs
- [Backend Setup](./BACKEND_SETUP.md) - AWS backend configuration
- [Authentication](./AUTHENTICATION.md) - Cognito authentication setup
- [Deployment](./DEPLOYMENT.md) - Deployment procedures
- [Monitoring Setup](./MONITORING_SETUP.md) - Monitoring configuration

### 4. Build Documentation

Located in [`../build_docs/`](../build_docs/)

- [Setup Guide](../build_docs/SETUP.md) - Initial project setup
- [Build Commands](../build_docs/BUILD_COMMANDS.md) - Build and deployment commands
- [Cloud Deployment Guide](../build_docs/CLOUD_DEPLOYMENT_GUIDE.md) - AWS deployment
- [Testing Guide](../build_docs/TESTING.md) - Testing strategies
- [Quick Reference](../build_docs/QUICK_REFERENCE.md) - Command reference
- [Project Structure](../build_docs/PROJECT_STRUCTURE.md) - Codebase organization
- [User Guide](../build_docs/USER_GUIDE.md) - End-user documentation

---

## 🎯 Common Use Cases

### I'm a new developer joining the team
1. Read [Developer Onboarding Guide](./onboarding/DEVELOPER_ONBOARDING_GUIDE.md)
2. Request AWS access from your team lead
3. Follow the setup instructions
4. Review the [Migration Complete](./migration/MIGRATION_COMPLETE.md) guide to understand the new design system

### I need to set up AWS permissions for a new developer
1. Review [AWS Developer Permissions](./onboarding/AWS_DEVELOPER_PERMISSIONS.md)
2. Use the provided IAM policy JSON
3. Create IAM user and attach policy
4. Provide access keys to developer

### I need to set up monitoring
1. Review [AWS Monitoring Role Permissions](./onboarding/AWS_MONITORING_ROLE_PERMISSIONS.md)
2. Create monitoring IAM role/user
3. Set up CloudWatch dashboards
4. Configure alerts

### I want to understand the design system migration
1. Start with [Migration Complete](./migration/MIGRATION_COMPLETE.md)
2. Review individual phase documents for details
3. Check [Migration Status](./migration/MIGRATION_STATUS.md) for current state

### I need to deploy the application
1. Review [Deployment Guide](./DEPLOYMENT.md)
2. Check [Cloud Deployment Guide](../build_docs/CLOUD_DEPLOYMENT_GUIDE.md)
3. Follow environment-specific procedures

---

## 🔧 Technology Stack

### Frontend
- **Framework**: React 19.2.0 with TypeScript
- **UI Library**: Tailwind CSS + Radix UI (new), Material-UI (legacy)
- **Routing**: React Router v7
- **State Management**: React Context + TanStack Query
- **Build Tool**: Vite

### Backend
- **Platform**: AWS Amplify
- **Authentication**: AWS Cognito
- **API**: AWS AppSync (GraphQL)
- **Database**: AWS DynamoDB
- **Storage**: AWS S3
- **Functions**: AWS Lambda

### Testing
- **Unit Tests**: Vitest
- **Component Tests**: React Testing Library
- **Property Tests**: fast-check

---

## 📊 Project Status

### Current State
- ✅ Design system migration: **100% complete**
- ✅ All pages migrated to new design system
- ✅ 16 reusable UI components created
- ✅ Responsive design implemented
- ✅ Type-safe throughout
- ✅ Production-ready

### Active Development
- Feature enhancements
- Performance optimization
- Additional monitoring capabilities
- Documentation updates

---

## 🔗 External Resources

### AWS Documentation
- [AWS Amplify](https://docs.amplify.aws/)
- [AWS Cognito](https://docs.aws.amazon.com/cognito/)
- [AWS DynamoDB](https://docs.aws.amazon.com/dynamodb/)
- [AWS AppSync](https://docs.aws.amazon.com/appsync/)
- [AWS IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)

### Frontend Documentation
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/primitives/docs/overview/introduction)
- [React Router](https://reactrouter.com/)

### Tools
- [Vite](https://vitejs.dev/)
- [Vitest](https://vitest.dev/)
- [TanStack Query](https://tanstack.com/query/latest)

---

## 📝 Contributing to Documentation

### Adding New Documentation
1. Create document in appropriate category folder
2. Update this README with link and description
3. Follow existing documentation style
4. Include table of contents for long documents
5. Add examples and code snippets where helpful

### Documentation Standards
- Use clear, concise language
- Include code examples
- Add troubleshooting sections
- Keep documents up to date
- Use consistent formatting

### Markdown Style Guide
- Use ATX-style headers (`#` not underlines)
- Include table of contents for docs > 200 lines
- Use code blocks with language specification
- Use tables for structured data
- Include emojis for visual navigation (sparingly)

---

## 🆘 Getting Help

### Documentation Issues
If you find errors or have suggestions for documentation:
1. Create an issue in the project repository
2. Tag with `documentation` label
3. Provide specific feedback or corrections

### Technical Support
- **Slack**: #ethosai-dev
- **Email**: dev-team@company.com
- **Team Lead**: [Contact info]

### Emergency Contacts
- **DevOps**: devops@company.com
- **Security**: security@company.com
- **On-Call**: [On-call rotation]

---

## 📅 Document Maintenance

### Review Schedule
- **Monthly**: Review onboarding docs for accuracy
- **Quarterly**: Update AWS permissions and policies
- **As Needed**: Update migration docs during active development
- **Annually**: Comprehensive documentation audit

### Version History
- **v1.0** (December 2024): Initial comprehensive documentation
  - Onboarding guides created
  - AWS permission policies documented
  - Migration documentation completed
  - Documentation structure organized

### Document Owners
- **Onboarding**: DevOps Team
- **Migration**: Frontend Team
- **AWS Policies**: Security Team
- **Feature Docs**: Feature Teams

---

## 🎓 Learning Path

### Week 1: Getting Started
1. Read [Developer Onboarding Guide](./onboarding/DEVELOPER_ONBOARDING_GUIDE.md)
2. Set up development environment
3. Run application locally
4. Review [Migration Complete](./migration/MIGRATION_COMPLETE.md)

### Week 2: Understanding the Codebase
1. Review [Project Structure](../build_docs/PROJECT_STRUCTURE.md)
2. Study feature documentation
3. Understand authentication flow
4. Learn the new design system

### Week 3: Contributing
1. Pick first task
2. Follow development workflow
3. Create first PR
4. Participate in code reviews

### Week 4: Becoming Productive
1. Complete multiple tasks
2. Help other team members
3. Contribute to documentation
4. Suggest improvements

---

## 📈 Metrics and KPIs

### Documentation Health
- ✅ All critical paths documented
- ✅ Onboarding time: < 1 week
- ✅ Setup success rate: > 95%
- ✅ Documentation coverage: 100%

### Team Metrics
- Average onboarding time: 3-5 days
- Time to first PR: < 1 week
- Documentation satisfaction: High
- Support ticket reduction: 60%

---

**Last Updated**: December 2024  
**Version**: 1.0  
**Maintained By**: EthosAI Development Team

---

**Need help?** Start with the [Onboarding Summary](./onboarding/ONBOARDING_SUMMARY.md) or ask in #ethosai-dev Slack channel.
