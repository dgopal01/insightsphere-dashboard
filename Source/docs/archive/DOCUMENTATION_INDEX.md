# Documentation Index - Quick Reference

This is a quick reference index for all documentation. For detailed navigation, see [README.md](./README.md).

## 📁 File Organization

### Root Level Documentation
```
/
├── README.md                    # Main project README
├── QUICK_START.md              # Quick start guide for all roles
└── docs/                       # All documentation
```

### Documentation Structure
```
docs/
├── README.md                           # Documentation hub (START HERE)
├── DOCUMENTATION_INDEX.md              # This file - Quick reference
│
├── 🏗️ Architecture & Design
│   ├── ARCHITECTURE_DIAGRAM.md         # 11 system architecture diagrams
│   ├── COLOR_SCHEME.md                 # UI color palette
│   └── AUTHENTICATION.md               # Cognito auth flow
│
├── 🚢 Deployment & Infrastructure
│   ├── DEPLOYMENT_GUIDE.md             # ⭐ Comprehensive guide (Amplify + EKS)
│   ├── DEPLOYMENT_QUICKSTART.md        # Quick deployment steps
│   ├── DEPLOYMENT_CHECKLIST.md         # Pre/post deployment checklist
│   ├── CI_CD_PIPELINE.md               # CI/CD setup
│   └── DEVOPS_BACKLOG.md               # ⭐ 5 PBIs for deployment
│
├── 🔧 Development
│   ├── ENVIRONMENT_SETUP.md            # Local dev environment
│   ├── BACKEND_SETUP.md                # Backend configuration
│   ├── BACKEND_QUICK_REFERENCE.md      # API quick reference
│   ├── ERROR_HANDLING.md               # Error handling patterns
│   └── ACCESSIBILITY_VERIFICATION.md   # A11y compliance
│
├── 📊 Operations
│   ├── MONITORING_SETUP.md             # CloudWatch & Sentry
│   ├── PERFORMANCE_OPTIMIZATIONS.md    # Performance tuning
│   └── BUILD_OPTIMIZATION.md           # Build optimization
│
├── 📖 Features
│   └── chat-logs-review/
│       ├── README.md                   # Feature overview
│       ├── USER_GUIDE.md               # End-user guide
│       ├── API_DOCUMENTATION.md        # API reference
│       ├── CONFIGURATION.md            # Configuration guide
│       ├── DEPLOYMENT_GUIDE.md         # Feature deployment
│       └── TROUBLESHOOTING.md          # Common issues
│
├── 👥 Team Resources
│   └── onboarding/
│       ├── DEVELOPER_ONBOARDING_GUIDE.md       # ⭐ New developer guide
│       ├── ONBOARDING_SUMMARY.md               # Quick reference
│       ├── AWS_DEVELOPER_PERMISSIONS.md        # IAM policies
│       └── AWS_MONITORING_ROLE_PERMISSIONS.md  # Monitoring IAM
│
├── 📝 Project History
│   ├── deployment/                     # Deployment troubleshooting history
│   ├── migration/                      # Design system migration history
│   ├── PHASE_5_CLEANUP_SUMMARY.md      # Phase 5 cleanup
│   └── TASK_8_UI_IMPROVEMENTS.md       # UI improvements
│
└── 📋 Reference (Legacy)
    ├── DEPLOYMENT.md                   # ⚠️ Superseded by DEPLOYMENT_GUIDE.md
    └── DOCUMENTATION_ORGANIZATION.md   # Old organization doc
```

---

## 🎯 Find What You Need

### "I need to deploy the application"
→ [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

### "I need to understand the architecture"
→ [ARCHITECTURE_DIAGRAM.md](./ARCHITECTURE_DIAGRAM.md)

### "I'm a new developer"
→ [onboarding/DEVELOPER_ONBOARDING_GUIDE.md](./onboarding/DEVELOPER_ONBOARDING_GUIDE.md)

### "I need to set up my local environment"
→ [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)

### "I need to configure monitoring"
→ [MONITORING_SETUP.md](./MONITORING_SETUP.md)

### "I need to understand authentication"
→ [AUTHENTICATION.md](./AUTHENTICATION.md)

### "I need the DevOps work items"
→ [DEVOPS_BACKLOG.md](./DEVOPS_BACKLOG.md)

### "I need to troubleshoot an issue"
→ [chat-logs-review/TROUBLESHOOTING.md](./chat-logs-review/TROUBLESHOOTING.md)

### "I need to understand the Chat Logs Review feature"
→ [chat-logs-review/README.md](./chat-logs-review/README.md)

### "I need AWS permissions for developers"
→ [onboarding/AWS_DEVELOPER_PERMISSIONS.md](./onboarding/AWS_DEVELOPER_PERMISSIONS.md)

---

## ⭐ Most Important Documents

1. **[README.md](./README.md)** - Documentation hub
2. **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Complete deployment guide
3. **[ARCHITECTURE_DIAGRAM.md](./ARCHITECTURE_DIAGRAM.md)** - System architecture
4. **[DEVOPS_BACKLOG.md](./DEVOPS_BACKLOG.md)** - Deployment work items
5. **[DEVELOPER_ONBOARDING_GUIDE.md](./onboarding/DEVELOPER_ONBOARDING_GUIDE.md)** - New developer guide

---

## 📊 Document Status Legend

- ✅ **Active** - Current and maintained
- 📚 **Reference** - Historical context
- ⚠️ **Deprecated** - Superseded by newer docs
- ⭐ **Essential** - Start here

---

## 🔄 Document Relationships

```
QUICK_START.md (Root)
    ↓
docs/README.md (Hub)
    ↓
    ├─→ DEPLOYMENT_GUIDE.md → DEVOPS_BACKLOG.md
    ├─→ ARCHITECTURE_DIAGRAM.md
    ├─→ onboarding/DEVELOPER_ONBOARDING_GUIDE.md → ENVIRONMENT_SETUP.md
    └─→ chat-logs-review/README.md → USER_GUIDE.md
```

---

## 📝 Quick Stats

- **Total Documents**: 50+
- **Active Documents**: 30+
- **Reference Documents**: 15+
- **Deprecated Documents**: 2
- **Last Major Update**: December 2024

---

**For detailed navigation and descriptions, see [README.md](./README.md)**
