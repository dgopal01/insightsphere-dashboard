# AI Metrics Portal - Chat Logs Review System

A ReactJS web application built with AWS Amplify for reviewing chat logs and user feedback from the Unity AI Assistant.

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

### Build & Deployment Documentation
All build, deployment, and setup documentation has been moved to the [`build_docs/`](./build_docs/) folder:

- [Setup Guide](./build_docs/SETUP.md)
- [Build Commands](./build_docs/BUILD_COMMANDS.md)
- [Cloud Deployment Guide](./build_docs/CLOUD_DEPLOYMENT_GUIDE.md)
- [Testing Guide](./build_docs/TESTING.md)
- [Quick Reference](./build_docs/QUICK_REFERENCE.md)
- [Project Structure](./build_docs/PROJECT_STRUCTURE.md)
- [User Guide](./build_docs/USER_GUIDE.md)

### Feature Documentation
Feature-specific documentation is in the [`docs/`](./docs/) folder:

- [Chat Logs Review System](./docs/chat-logs-review/)
- [Backend Setup](./docs/BACKEND_SETUP.md)
- [Authentication](./docs/AUTHENTICATION.md)
- [Deployment](./docs/DEPLOYMENT.md)
- [Monitoring Setup](./docs/MONITORING_SETUP.md)

## Technology Stack

- **Frontend**: React 19, TypeScript, Material-UI
- **Backend**: AWS Amplify, AppSync (GraphQL), DynamoDB
- **Authentication**: AWS Cognito
- **Build Tool**: Vite
- **Testing**: Vitest, React Testing Library, fast-check

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
