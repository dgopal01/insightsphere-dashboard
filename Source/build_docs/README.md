# InsightSphere Dashboard

A comprehensive AI performance and feedback web application that provides real-time insights into AI chatbot performance through log analysis, user feedback collection, and performance metrics visualization.

## Features

- **Chat Log Viewing**: Browse and search through AI conversation logs
- **Feedback Collection**: Submit and view user feedback on AI responses
- **Performance Metrics**: Real-time dashboard with accuracy, satisfaction, and response time metrics
- **CSV Export**: Export chat logs for offline analysis
- **Authentication**: Secure access with AWS Cognito
- **Real-time Updates**: Live data synchronization via GraphQL subscriptions

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **UI Library**: Material-UI (MUI)
- **State Management**: TanStack React Query
- **Routing**: React Router v7
- **Charts**: Recharts
- **Backend**: AWS Amplify (Cognito, AppSync, DynamoDB, S3)
- **Code Quality**: ESLint + Prettier + TypeScript Strict Mode

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- AWS Account with Amplify CLI configured
- AWS Cognito User Pool
- AWS AppSync GraphQL API
- DynamoDB tables for ChatLogs and Feedback

### Installation

1. Clone the repository

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up AWS backend (see [Backend Setup Guide](docs/BACKEND_SETUP.md)):
   ```powershell
   # Windows PowerShell
   .\scripts\deploy-backend.ps1
   ```
   
   Or manually:
   ```bash
   amplify init
   amplify push
   ```

4. Copy `.env.example` to `.env` and configure your AWS settings:
   ```bash
   cp .env.example .env
   ```

5. Update the `.env` file with your AWS credentials (generated after `amplify push`):
   - `VITE_AWS_REGION`: Your AWS region
   - `VITE_AWS_USER_POOL_ID`: Cognito User Pool ID
   - `VITE_AWS_USER_POOL_CLIENT_ID`: Cognito User Pool Client ID
   - `VITE_AWS_GRAPHQL_ENDPOINT`: AppSync GraphQL endpoint
   - `VITE_AWS_S3_BUCKET`: S3 bucket name for exports

6. Verify backend connectivity:
   ```powershell
   # Windows PowerShell
   .\scripts\verify-backend.ps1
   ```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

### Code Quality

Run linting:
```bash
npm run lint
```

Fix linting issues:
```bash
npm run lint:fix
```

Format code:
```bash
npm run format
```

Check formatting:
```bash
npm run format:check
```

Type checking:
```bash
npm run type-check
```

## Project Structure

```
src/
├── components/     # React components
├── contexts/       # React contexts
├── hooks/          # Custom React hooks
├── pages/          # Page components
├── services/       # API and service layer
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
├── amplify-config.ts  # AWS Amplify configuration
├── aws-exports.ts     # AWS configuration exports
└── main.tsx        # Application entry point
```

## AWS Backend

The application uses AWS Amplify for backend services:

### Resources

1. **Cognito User Pool**: Email-based authentication with user groups (admin, viewer)
2. **AppSync GraphQL API**: Real-time data access with subscriptions
3. **DynamoDB Tables**:
   - **ChatLog**: Read-only access to existing chat logs with GSI indexes
   - **Feedback**: Full CRUD access for user feedback
4. **S3 Bucket**: Private storage for CSV exports

### Setup

For detailed backend setup instructions, see:
- [Backend Setup Guide](docs/BACKEND_SETUP.md) - Complete setup walkthrough
- [Quick Reference](docs/BACKEND_QUICK_REFERENCE.md) - Common commands and queries

### GraphQL Schema

The GraphQL schema is defined in `amplify/backend/api/insightsphere/schema.graphql` with:
- ChatLog model with read-only authentication
- Feedback model with full access
- Custom queries for aggregated metrics
- Real-time subscriptions for live updates

### DynamoDB Indexes

**ChatLog Table:**
- Primary Key: `id`
- GSI 1: `byConversation` (conversationId + timestamp)
- GSI 2: `byUser` (userId + timestamp)

**Feedback Table:**
- Primary Key: `id`
- GSI 1: `byLogId` (logId + timestamp)
- GSI 2: `byUser` (userId + timestamp)

For detailed schema and configuration, refer to `.kiro/specs/insightsphere-dashboard/design.md`.

## Monitoring and Analytics

InsightSphere includes comprehensive monitoring and analytics capabilities:

### Error Tracking (Sentry)
- Automatic error capture and reporting
- Session replay for debugging
- Performance tracing
- User context tracking

### Performance Monitoring
- Web Vitals tracking (LCP, INP, CLS, FCP, TTFB)
- Bundle size monitoring
- API call performance tracking
- Component render time measurement

### CloudWatch Integration
- Custom metrics publishing
- Log aggregation
- API performance tracking
- Error rate monitoring

### User Analytics
- Session tracking
- Page view tracking
- User action tracking
- Event tracking with multiple types

### Custom Monitoring Dashboard
- Real-time Web Vitals display
- Analytics summary cards
- Recent errors table
- Recent API calls table
- Session information

For detailed setup instructions, see [Monitoring Setup Guide](docs/MONITORING_SETUP.md).

## Deployment

InsightSphere Dashboard uses a two-tier deployment architecture:
- **Backend**: AWS CloudFormation (Cognito, AppSync, DynamoDB, S3)
- **Frontend**: AWS Amplify Hosting (automatic deployments from GitHub)

### Current Deployment

**Live Application**: https://main.d33feletv96fod.amplifyapp.com

### Quick Deployment

#### Backend (CloudFormation)
```bash
# Deploy backend infrastructure
./deploy.sh "your-email@example.com"

# Or using PowerShell
.\deploy-cloudformation.ps1 -AdminEmail "your-email@example.com"
```

#### Frontend (Amplify Hosting)
Automatic deployment on git push to main branch. See [DEPLOYMENT_COMPLETE.md](DEPLOYMENT_COMPLETE.md) for details.

### Deployment Scripts

- `deploy.sh` - Deploy CloudFormation backend (bash)
- `deploy-cloudformation.ps1` - Deploy CloudFormation backend (PowerShell)
- `deploy-all.ps1` - Complete deployment orchestration
- `create-admin-user.ps1` - Create Cognito users
- `update-env.ps1` - Update environment variables
- `deploy-to-s3-simple.ps1` - Alternative S3 static hosting deployment

### Deployment Documentation

- [DEPLOYMENT_COMPLETE.md](DEPLOYMENT_COMPLETE.md) - Current deployment status and guide
- [DEPLOYMENT_SUCCESS.md](DEPLOYMENT_SUCCESS.md) - Deployment reference
- [CLOUD_DEPLOYMENT_GUIDE.md](CLOUD_DEPLOYMENT_GUIDE.md) - Cloud deployment options
- [AMPLIFY_SETUP_GUIDE.md](AMPLIFY_SETUP_GUIDE.md) - Amplify Hosting setup
- [BACKEND_NOTE.md](BACKEND_NOTE.md) - Backend architecture notes
- [CloudFormation README](cloudformation/README.md) - Infrastructure details

### Architecture

```
GitHub (main branch)
    ↓ (auto-deploy)
AWS Amplify Hosting
    ↓ (uses)
CloudFormation Stack
    ├── Cognito User Pool
    ├── AppSync GraphQL API
    ├── DynamoDB Tables
    └── S3 Bucket
```

## Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

### Test Coverage

The project maintains comprehensive test coverage including:
- Unit tests for components and utilities
- Integration tests for API services
- Property-based tests for correctness properties
- Accessibility tests

See [Testing Guide](TESTING.md) for detailed testing documentation.

## License

Private - All rights reserved
