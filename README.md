# EthosAI - Emphasizing Ethical AI Principles

A comprehensive ReactJS web application built with AWS Amplify for reviewing and ensuring ethical AI principles in conversational AI systems. Monitor, review, and tag chat logs and user feedback to maintain high standards of AI ethics, accuracy, and safety.

## Quick Start

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

## Project Structure

- `src/` - Application source code
- `docs/` - Feature-specific documentation
- `build_docs/` - Build, deployment, and setup documentation
- `cloudformation/` - AWS infrastructure templates
- `lambda/` - Lambda function code
- `scripts/` - Build and deployment scripts

## Documentation

📚 **[Complete Documentation Index](./docs/README.md)** - Start here for all documentation

### For New Team Members
- 🚀 [Developer Onboarding Guide](./docs/onboarding/DEVELOPER_ONBOARDING_GUIDE.md) - Complete setup guide
- 📋 [Onboarding Summary](./docs/onboarding/ONBOARDING_SUMMARY.md) - Quick reference
- 🔐 [AWS Developer Permissions](./docs/onboarding/AWS_DEVELOPER_PERMISSIONS.md) - IAM policies
- 📊 [AWS Monitoring Permissions](./docs/onboarding/AWS_MONITORING_ROLE_PERMISSIONS.md) - Monitoring setup

### Design System Migration
- ✅ [Migration Complete](./docs/migration/MIGRATION_COMPLETE.md) - 100% complete!
- 📈 [Migration Status](./docs/migration/MIGRATION_STATUS.md) - Current status

### Build & Deployment
- [Setup Guide](./build_docs/SETUP.md)
- [Build Commands](./build_docs/BUILD_COMMANDS.md)
- [Cloud Deployment Guide](./build_docs/CLOUD_DEPLOYMENT_GUIDE.md)
- [Testing Guide](./build_docs/TESTING.md)

### Feature Documentation
- [Chat Logs Review System](./docs/chat-logs-review/)
- [Backend Setup](./docs/BACKEND_SETUP.md)
- [Authentication](./docs/AUTHENTICATION.md)
- [Monitoring Setup](./docs/MONITORING_SETUP.md)

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

See [Cloud Deployment Guide](./build_docs/CLOUD_DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

## License

Private - Internal Use Only
