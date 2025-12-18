# EthosAI - Emphasizing Ethical AI Principles

A comprehensive ReactJS web application built with AWS Amplify for reviewing and ensuring ethical AI principles in conversational AI systems. Monitor, review, and tag chat logs and user feedback to maintain high standards of AI ethics, accuracy, and safety.

## 🚀 Quick Start

### Local Development
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build:prod
```

### EKS Deployment (Recommended)
```bash
# Navigate to EKS deployment
cd eks-deployment

# One-command deployment
./scripts/deploy.sh
```

See `eks-deployment/QUICK-START.md` for detailed instructions.

## Project Structure

- `src/` - Application source code
- `eks-deployment/` - Complete EKS deployment solution
- `docs/` - General project documentation
- `cloudformation/` - AWS infrastructure templates
- `lambda/` - Lambda function code
- `scripts/` - Build and deployment scripts
- `amplify/` - AWS Amplify configuration (legacy)

See [PROJECT-STRUCTURE.md](./PROJECT-STRUCTURE.md) for detailed project organization.

## 📚 Documentation

### 🎯 Quick Access
- 📖 **[Documentation Hub](./docs/README.md)** - Complete documentation navigation
- 📋 **[Project Structure](./PROJECT-STRUCTURE.md)** - Complete project organization
- 🚀 **[EKS Deployment Guide](./eks-deployment/README.md)** - Production deployment to Kubernetes
- 🏗️ **[Architecture Diagrams](./docs/architecture/ARCHITECTURE_DIAGRAM.md)** - System architecture
- 🔧 **[Development Guides](./docs/development/)** - Development setup and guides
- 🚢 **[Deployment Guides](./docs/deployment/)** - Deployment and operations
- 📊 **[DevOps Backlog](./docs/DEVOPS_BACKLOG.md)** - Development backlog

### 👥 For New Team Members
- [Developer Onboarding Guide](./docs/onboarding/DEVELOPER_ONBOARDING_GUIDE.md)
- [Environment Setup](./docs/ENVIRONMENT_SETUP.md)
- [Backend Setup](./docs/BACKEND_SETUP.md)

### 🚢 For DevOps Engineers
- [EKS Deployment](./eks-deployment/) - **Start Here for Production Deployment**
- [EKS Quick Start](./eks-deployment/QUICK-START.md)
- [EKS Security Guide](./eks-deployment/docs/security.md)
- [EKS Troubleshooting](./eks-deployment/docs/troubleshooting.md)
- [EKS Maintenance](./eks-deployment/docs/maintenance.md)

### 📖 Feature Documentation
- [Chat Logs Review System](./docs/chat-logs-review/README.md)
- [User Guide](./docs/chat-logs-review/USER_GUIDE.md)
- [API Documentation](./docs/chat-logs-review/API_DOCUMENTATION.md)

### 🎨 Design & Architecture
- [Architecture Diagrams](./docs/ARCHITECTURE_DIAGRAM.md)
- [Color Scheme](./docs/COLOR_SCHEME.md)
- [Authentication Flow](./docs/AUTHENTICATION.md)

## Technology Stack

- **Frontend**: React 19.2.0, TypeScript, Tailwind CSS + Radix UI
- **Backend**: AWS Amplify, AppSync (GraphQL), DynamoDB
- **Authentication**: AWS Cognito
- **Build Tool**: Vite
- **Testing**: Vitest, React Testing Library, fast-check

> **Note**: Design system migration from Material-UI to Tailwind CSS + Radix UI is 100% complete!

## Key Features

1. **Chat Logs Review** - Review and annotate AI assistant conversation logs
2. **Feedback Logs Review** - Review and respond to user feedback
3. **Review Dashboard** - Monitor review progress with real-time metrics
4. **Authentication** - Secure access with AWS Cognito
5. **Filtering & Sorting** - Efficient data navigation and organization

## Environment Setup

Copy `.env.example` to `.env` and configure your AWS credentials:

```bash
cp .env.example .env
```

See [Setup Guide](./build_docs/SETUP.md) for detailed configuration instructions.

## Development

```bash
# Start development server
npm run dev

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Format code
npm run format
```

## Deployment

### EKS Deployment (Recommended)
```bash
# Setup DynamoDB tables
npm run setup:dynamodb

# Deploy to EKS cluster
npm run deploy:eks

# Check deployment status
npm run k8s:status
```

### Amplify Deployment (Legacy)
```bash
# Build for specific environment
npm run build:dev
npm run build:staging
npm run build:prod

# Deploy to specific environment
npm run deploy:dev
npm run deploy:staging
npm run deploy:prod
```

See `eks-deployment/` directory for comprehensive deployment documentation.

## License

Private - Internal Use Only
