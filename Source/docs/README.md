# Swbc.Ethos.Ai Documentation Hub

Welcome to the comprehensive documentation for the Swbc.Ethos.Ai project. This documentation is organized into logical sections for easy navigation.

## 📚 Documentation Structure

### 🚀 Getting Started
- [Project Overview](../README.md) - Main project introduction
- [Project Structure](../PROJECT-STRUCTURE.md) - Complete project organization
- [Environment Setup](development/ENVIRONMENT_SETUP.md) - Development environment configuration
- [Quick Start Guide](chat-logs-review/README.md) - Get up and running quickly

### 🏗️ Architecture & Design
- [Architecture Diagram](architecture/ARCHITECTURE_DIAGRAM.md) - System architecture overview
- [Authentication](architecture/AUTHENTICATION.md) - Authentication and authorization
- [Color Scheme](architecture/COLOR_SCHEME.md) - UI design system
- [Error Handling](architecture/ERROR_HANDLING.md) - Error handling patterns

### 🔧 Development
- [Backend Setup](development/BACKEND_SETUP.md) - Backend development guide
- [Backend Quick Reference](development/BACKEND_QUICK_REFERENCE.md) - API reference
- [Build Optimization](development/BUILD_OPTIMIZATION.md) - Build process optimization
- [Accessibility Verification](development/ACCESSIBILITY_VERIFICATION.md) - Accessibility testing

### 🚢 Deployment
- [EKS Deployment](../eks-deployment/README.md) - Complete EKS deployment guide
- [CloudFormation](../cloudformation/README.md) - Infrastructure as Code
- [CI/CD Pipeline](deployment/CI_CD_PIPELINE.md) - Continuous integration and deployment
- [Monitoring Setup](deployment/MONITORING_SETUP.md) - Application monitoring
- [CloudWatch Migration](deployment/CLOUDWATCH-MIGRATION.md) - Monitoring system migration

### 📊 DevOps & Operations
- [DevOps Backlog](deployment/DEVOPS_BACKLOG.md) - Operational improvements
- [Performance Optimizations](deployment/PERFORMANCE_OPTIMIZATIONS.md) - Performance tuning

### 👥 Team Resources
- [Developer Onboarding](onboarding/DEVELOPER_ONBOARDING_GUIDE.md) - New developer guide
- [AWS Permissions](onboarding/AWS_DEVELOPER_PERMISSIONS.md) - Required AWS access
- [Chat Logs Review System](chat-logs-review/README.md) - Feature documentation

### 🔧 Implementation Details
- [Lambda Functions](../lambda/README.md) - Serverless functions
- [Source Code Documentation](../src/) - Code-level documentation
- [Scripts](../scripts/README.md) - Build and deployment scripts
- [Implementation Guides](implementation/) - Detailed implementation documentation

### 📋 Project Management
- [Cleanup Summary](project-management/CLEANUP-SUMMARY.md) - Project organization history
- [Cleanup Plan](project-management/CLEANUP-PLAN.md) - Organization process

## 🗂️ Directory Organization

```
docs/
├── README.md (this file)           # Documentation hub
├── architecture/                   # Architecture & Design
│   ├── ARCHITECTURE_DIAGRAM.md
│   ├── AUTHENTICATION.md
│   ├── COLOR_SCHEME.md
│   └── ERROR_HANDLING.md
├── development/                    # Development Guides
│   ├── BACKEND_SETUP.md
│   ├── BACKEND_QUICK_REFERENCE.md
│   ├── BUILD_OPTIMIZATION.md
│   ├── ENVIRONMENT_SETUP.md
│   └── ACCESSIBILITY_VERIFICATION.md
├── deployment/                     # Deployment & Operations
│   ├── CI_CD_PIPELINE.md
│   ├── MONITORING_SETUP.md
│   ├── DEVOPS_BACKLOG.md
│   ├── PERFORMANCE_OPTIMIZATIONS.md
│   └── CLOUDWATCH-MIGRATION.md
├── implementation/                 # Code Implementation Details
│   ├── useReviewMetrics.md
│   ├── TYPES_IMPLEMENTATION.md
│   ├── ERROR_HANDLING_IMPLEMENTATION.md
│   └── VALIDATION_IMPLEMENTATION.md
├── project-management/             # Project Management
│   ├── CLEANUP-PLAN.md
│   └── CLEANUP-SUMMARY.md
├── onboarding/                     # Team Onboarding
│   ├── DEVELOPER_ONBOARDING_GUIDE.md
│   ├── AWS_DEVELOPER_PERMISSIONS.md
│   ├── AWS_MONITORING_ROLE_PERMISSIONS.md
│   └── ONBOARDING_SUMMARY.md
├── chat-logs-review/               # Feature Documentation
│   ├── README.md
│   ├── USER_GUIDE.md
│   ├── API_DOCUMENTATION.md
│   ├── CONFIGURATION.md
│   ├── DEPLOYMENT_GUIDE.md
│   └── TROUBLESHOOTING.md
└── archive/                        # Legacy Documentation
    ├── DOCUMENTATION_INDEX.md
    └── TASK_8_UI_IMPROVEMENTS.md
```

## 🔍 Quick Navigation

### For New Developers
1. Start with [Project Overview](../README.md)
2. Follow [Developer Onboarding](onboarding/DEVELOPER_ONBOARDING_GUIDE.md)
3. Set up [Development Environment](development/ENVIRONMENT_SETUP.md)
4. Review [Architecture Diagram](architecture/ARCHITECTURE_DIAGRAM.md)

### For DevOps Engineers
1. Review [EKS Deployment Guide](../eks-deployment/README.md)
2. Check [CloudFormation Templates](../cloudformation/README.md)
3. Set up [Monitoring](deployment/MONITORING_SETUP.md)
4. Review [CI/CD Pipeline](deployment/CI_CD_PIPELINE.md)

### For Product Managers
1. Read [Chat Logs Review System](chat-logs-review/README.md)
2. Check [DevOps Backlog](deployment/DEVOPS_BACKLOG.md)
3. Review [Performance Optimizations](deployment/PERFORMANCE_OPTIMIZATIONS.md)

### For QA Engineers
1. Review [Accessibility Verification](development/ACCESSIBILITY_VERIFICATION.md)
2. Check [Error Handling](architecture/ERROR_HANDLING.md)
3. Follow [Testing Documentation](../src/test/README.md)

## 📝 Documentation Standards

### File Naming Convention
- Use `UPPERCASE_WITH_UNDERSCORES.md` for main documentation files
- Use `lowercase-with-hyphens.md` for implementation-specific files
- Use descriptive names that clearly indicate content

### Content Organization
- Start each document with a clear title and purpose
- Use consistent heading structure (H1 for title, H2 for main sections)
- Include table of contents for longer documents
- Add cross-references to related documentation

### Maintenance
- Keep documentation up-to-date with code changes
- Review and update quarterly
- Archive outdated documentation in appropriate sections
- Use clear versioning for major changes

## 🔄 Recent Updates

- **Documentation Organization**: Restructured documentation into logical directories
- **CloudWatch Migration**: Migrated from Prometheus to AWS CloudWatch monitoring
- **Project Cleanup**: Organized and cleaned up project structure
- **EKS Deployment**: Complete EKS deployment solution with automation

## 📞 Support

For questions about documentation:
1. Check the relevant section above
2. Review related implementation files
3. Contact the development team
4. Create an issue for missing documentation

---

*This documentation hub is maintained by the Swbc.Ethos.Ai development team. Last updated: December 2024*