# EthosAI Review Portal - Quick Start Guide

Get up and running with the EthosAI Review Portal in minutes.

## 🚀 For Developers

### Prerequisites
- Node.js 18+ and npm 9+
- Git
- AWS account (for deployment)

### Local Development Setup

```bash
# 1. Clone repository
git clone https://github.com/your-org/ethosai-portal.git
cd ethosai-portal

# 2. Install dependencies
npm install

# 3. Copy environment file
cp .env.example .env

# 4. Configure environment variables
# Edit .env with your AWS credentials

# 5. Start development server
npm run dev

# 6. Open browser
# Navigate to http://localhost:5173
```

### Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm test                 # Run tests
npm run lint             # Check code quality

# Deployment
npm run build:prod       # Build production bundle
npm run deploy:prod      # Deploy to production
```

### Next Steps
- 📖 [Complete Developer Onboarding](./docs/onboarding/DEVELOPER_ONBOARDING_GUIDE.md)
- 🔧 [Backend Setup Guide](./docs/BACKEND_SETUP.md)
- 📚 [Full Documentation](./docs/README.md)

---

## 🚢 For DevOps Engineers

### Deployment Options

**Option 1: AWS Amplify (Recommended for Quick Start)**
```bash
# 1. Create Amplify app
aws amplify create-app --name ethosai-portal

# 2. Connect GitHub repository
# Use Amplify Console

# 3. Configure environment variables
# Set in Amplify Console

# 4. Deploy
# Automatic on git push
```

**Option 2: Amazon EKS (For Production)**
```bash
# 1. Create EKS cluster
eksctl create cluster -f eks-cluster.yaml

# 2. Build and push Docker image
docker build -t ethosai-portal .
docker push <ecr-repo>/ethosai-portal

# 3. Deploy to Kubernetes
kubectl apply -f k8s/

# 4. Verify deployment
kubectl get pods -n ethosai
```

### Infrastructure Setup

**Required AWS Services:**
1. Amazon Cognito (Authentication)
2. DynamoDB (3 tables)
3. AWS Amplify or EKS (Hosting)
4. CloudWatch (Monitoring)

### Next Steps
- 📖 [Complete Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)
- 🏗️ [Architecture Diagrams](./docs/ARCHITECTURE_DIAGRAM.md)
- 📊 [DevOps Backlog](./docs/DEVOPS_BACKLOG.md)

---

## 📖 For Product Owners

### Accessing the Application

1. **Navigate to Application URL**
   - Development: Provided by DevOps team
   - Production: https://your-domain.com

2. **Sign In**
   - Use Cognito credentials provided by admin
   - First-time users will need to change temporary password

3. **Select Product**
   - Click on "Unity ISA" tile on landing page

4. **Navigate Features**
   - AI Metrics Dashboard
   - Review Dashboard
   - Chat Logs Review
   - Feedback Logs Review

### Key Features

- **Chat Logs Review**: Review AI conversation logs, add comments, and tag issues
- **Feedback Logs Review**: Review user feedback and provide responses
- **AI Metrics Dashboard**: View AI performance metrics and quality scores
- **Review Dashboard**: Monitor review progress and team metrics

### Next Steps
- 📖 [User Guide](./docs/chat-logs-review/USER_GUIDE.md)
- 📊 [DevOps Backlog](./docs/DEVOPS_BACKLOG.md)

---

## 🎯 Common Tasks

### Adding a New User
```bash
aws cognito-idp admin-create-user \
  --user-pool-id <pool-id> \
  --username user@example.com \
  --user-attributes Name=email,Value=user@example.com
```

### Viewing Logs
```bash
# Amplify logs
aws amplify get-job --app-id <app-id> --branch-name main --job-id <job-id>

# EKS logs
kubectl logs -n ethosai <pod-name>

# CloudWatch logs
aws logs tail /aws/amplify/<app-id> --follow
```

### Troubleshooting
- Check [Troubleshooting Guide](./docs/chat-logs-review/TROUBLESHOOTING.md)
- Review [Error Handling](./docs/ERROR_HANDLING.md)
- Contact DevOps team

---

## 📞 Support

- **Documentation**: [docs/README.md](./docs/README.md)
- **DevOps Team**: devops@example.com
- **Development Team**: dev@example.com
- **Issues**: Create GitHub issue

---

## 🔗 Important Links

| Resource | Link |
|----------|------|
| Full Documentation | [docs/README.md](./docs/README.md) |
| Deployment Guide | [docs/DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md) |
| Architecture | [docs/ARCHITECTURE_DIAGRAM.md](./docs/ARCHITECTURE_DIAGRAM.md) |
| DevOps Backlog | [docs/DEVOPS_BACKLOG.md](./docs/DEVOPS_BACKLOG.md) |
| User Guide | [docs/chat-logs-review/USER_GUIDE.md](./docs/chat-logs-review/USER_GUIDE.md) |

---

**Need more details?** See the [Complete Documentation Index](./docs/README.md)
