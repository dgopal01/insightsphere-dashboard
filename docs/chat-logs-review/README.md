# Chat Logs Review System

A ReactJS web application built with AWS Amplify that enables reviewers to examine chat logs and user feedback from the Unity AI Assistant. The system provides three main interfaces: Chat Logs Review, Feedback Logs Review, and a Review Dashboard with metrics.

## 🎯 Overview

The Chat Logs Review System connects to existing DynamoDB tables (UnityAIAssistantLogs and UserFeedback) and allows authenticated reviewers to:

- **Review Chat Logs**: Browse, filter, and add review comments to AI assistant conversations
- **Review Feedback Logs**: Examine and annotate user-submitted feedback
- **Monitor Progress**: Track review completion through a comprehensive dashboard with color-coded metrics

## ✨ Features

### Chat Logs Review
- View all chat logs from UnityAIAssistantLogs table
- Filter by carrier name, date range, and review status
- Sort by timestamp (ascending/descending)
- Add review comments and feedback to individual logs
- Pagination support for large datasets
- Real-time data updates

### Feedback Logs Review
- View all feedback from UserFeedback table
- Filter by carrier, date range, and review status
- Sort by datetime
- Add review comments and feedback to individual entries
- Pagination support
- Real-time data updates

### Review Dashboard
- Total, reviewed, and pending counts for both log types
- Percentage completion with color-coded indicators:
  - 🟢 Green: >80% reviewed
  - 🟡 Yellow: 40-80% reviewed
  - 🔴 Red: <40% reviewed
- Auto-refresh functionality
- Last updated timestamp

### Security & Authentication
- AWS Cognito authentication with Hosted UI
- JWT token-based authorization
- Secure session management
- Role-based access control ready

### Data Validation
- XSS prevention and input sanitization
- Character limit enforcement (5000 chars)
- Required field validation
- Special character escaping

### Error Handling
- User-friendly error messages
- Network error detection and retry logic
- Authentication error handling with redirect
- Data preservation on failed submissions

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Application                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Chat Logs    │  │ Feedback     │  │   Review     │      │
│  │ Review       │  │ Logs Review  │  │  Dashboard   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│  ┌──────────────────────────────────────────────────┐      │
│  │         Custom Hooks & State Management          │      │
│  └──────────────────────────────────────────────────┘      │
│         │                                                    │
│  ┌──────────────────────────────────────────────────┐      │
│  │            Amplify Client Library                 │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    AWS AppSync (GraphQL)                     │
│  ┌──────────────────────────────────────────────────┐      │
│  │              GraphQL Resolvers                    │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Amazon DynamoDB                           │
│  ┌──────────────────┐      ┌──────────────────┐            │
│  │ UnityAIAssistant │      │   UserFeedback   │            │
│  │      Logs        │      │                  │            │
│  └──────────────────┘      └──────────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **UI Library**: Material-UI (MUI)
- **State Management**: React Hooks + Context API
- **Routing**: React Router v7
- **Backend**: AWS Amplify
  - **Authentication**: AWS Cognito
  - **API**: AWS AppSync (GraphQL)
  - **Database**: Amazon DynamoDB
  - **Compute**: AWS Lambda (metrics calculation)
  - **Hosting**: AWS Amplify Hosting
- **Testing**: Vitest + React Testing Library + fast-check (PBT)
- **Code Quality**: ESLint + Prettier + TypeScript Strict Mode

## 📋 Prerequisites

- Node.js 18+ and npm
- AWS Account with appropriate permissions
- AWS CLI configured
- Git

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd chat-logs-review-system
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Deploy AWS Infrastructure

The system uses CloudFormation to provision all AWS resources:

```bash
# Windows PowerShell
.\deploy-chat-logs-review.cmd

# Or manually with AWS CLI
aws cloudformation create-stack \
  --stack-name chat-logs-review-dev \
  --template-body file://cloudformation/chat-logs-review-stack.yaml \
  --parameters ParameterKey=EnvironmentName,ParameterValue=dev \
               ParameterKey=CognitoDomainPrefix,ParameterValue=your-unique-prefix \
  --capabilities CAPABILITY_NAMED_IAM
```

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Update the `.env` file with values from CloudFormation outputs:

```env
VITE_AWS_REGION=us-east-1
VITE_USER_POOL_ID=us-east-1_XXXXXXXXX
VITE_USER_POOL_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_IDENTITY_POOL_ID=us-east-1:XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
VITE_GRAPHQL_ENDPOINT=https://XXXXXXXXXXXXXXXXXXXXXXXXXX.appsync-api.us-east-1.amazonaws.com/graphql
VITE_COGNITO_DOMAIN=your-unique-prefix.auth.us-east-1.amazoncognito.com
```

### 5. Create Admin User

```powershell
# Windows PowerShell
.\create-admin-user.ps1 -Email "admin@example.com" -Password "TempPassword123!"
```

### 6. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📖 Usage

### For Reviewers

See the [User Guide](./USER_GUIDE.md) for detailed instructions on:
- Signing in
- Reviewing chat logs
- Reviewing feedback logs
- Understanding the dashboard
- Filtering and sorting data
- Submitting reviews

### For Developers

See the [Development Guide](./DEVELOPMENT.md) for:
- Project structure
- Component architecture
- Custom hooks
- Testing strategy
- Contributing guidelines

### For DevOps

See the [Deployment Guide](./DEPLOYMENT_GUIDE.md) for:
- Environment setup
- Deployment process
- Configuration management
- Monitoring and logging
- Troubleshooting

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run property-based tests
npm run test -- test_properties
```

### Test Coverage

The project includes:
- **Unit Tests**: Component and utility function tests
- **Integration Tests**: Complete workflow tests with MSW
- **Property-Based Tests**: Correctness properties with fast-check
- **Accessibility Tests**: WCAG compliance tests

Target coverage: >80% for all code

## 📁 Project Structure

```
chat-logs-review-system/
├── .kiro/
│   └── specs/
│       └── chat-logs-review-system/
│           ├── requirements.md      # System requirements
│           ├── design.md            # Design document
│           └── tasks.md             # Implementation tasks
├── cloudformation/
│   └── chat-logs-review-stack.yaml  # Infrastructure as Code
├── docs/
│   └── chat-logs-review/
│       ├── README.md                # This file
│       ├── DEPLOYMENT_GUIDE.md      # Deployment instructions
│       ├── API_DOCUMENTATION.md     # GraphQL API reference
│       ├── USER_GUIDE.md            # User manual
│       ├── CONFIGURATION.md         # Environment configuration
│       └── TROUBLESHOOTING.md       # Common issues
├── lambda/
│   └── get-review-metrics/          # Lambda function for metrics
├── src/
│   ├── components/                  # React components
│   ├── contexts/                    # React contexts
│   ├── hooks/                       # Custom hooks
│   ├── pages/                       # Page components
│   ├── services/                    # API services
│   ├── types/                       # TypeScript types
│   ├── utils/                       # Utility functions
│   └── test/                        # Test utilities
├── .env.example                     # Environment template
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
├── vite.config.ts                   # Vite config
└── vitest.config.ts                 # Vitest config
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_AWS_REGION` | AWS region | Yes |
| `VITE_USER_POOL_ID` | Cognito User Pool ID | Yes |
| `VITE_USER_POOL_CLIENT_ID` | Cognito Client ID | Yes |
| `VITE_IDENTITY_POOL_ID` | Cognito Identity Pool ID | Yes |
| `VITE_GRAPHQL_ENDPOINT` | AppSync GraphQL endpoint | Yes |
| `VITE_COGNITO_DOMAIN` | Cognito domain for Hosted UI | Yes |

See [CONFIGURATION.md](./CONFIGURATION.md) for complete configuration reference.

## 🚢 Deployment

### Development

```bash
npm run build:dev
# Deploy to development environment
```

### Staging

```bash
npm run build:staging
# Deploy to staging environment
```

### Production

```bash
npm run build:prod
# Deploy to production environment
```

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

## 📊 Monitoring

### CloudWatch Logs

- Lambda function logs: `/aws/lambda/chat-logs-review-{env}-GetReviewMetrics`
- AppSync logs: `/aws/appsync/apis/{api-id}`

### Metrics

- Review completion rate
- API response times
- Error rates
- User activity

### Alerts

Configure CloudWatch alarms for:
- High error rates
- API latency
- Lambda failures
- Authentication issues

## 🐛 Troubleshooting

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues and solutions:

- Authentication errors
- API connection issues
- Data not loading
- Build failures
- Deployment issues

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Run linting and tests
5. Submit a pull request

### Code Style

- Follow TypeScript best practices
- Use ESLint and Prettier
- Write meaningful commit messages
- Add JSDoc comments for public APIs
- Maintain test coverage >80%

## 📄 License

Private - All rights reserved

## 📞 Support

For issues and questions:

1. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. Review [API Documentation](./API_DOCUMENTATION.md)
3. Check CloudWatch logs
4. Contact the development team

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Basic review functionality
- ✅ Dashboard metrics
- ✅ Authentication
- ✅ Input validation

### Phase 2 (Planned)
- [ ] Advanced filtering (date ranges, multi-select)
- [ ] Bulk operations
- [ ] Export functionality
- [ ] Review assignments

### Phase 3 (Future)
- [ ] Analytics and trends
- [ ] AI-assisted review suggestions
- [ ] Collaboration features
- [ ] Mobile app

## 📚 Additional Resources

- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [AWS AppSync Documentation](https://docs.aws.amazon.com/appsync/)
- [React Documentation](https://react.dev/)
- [Material-UI Documentation](https://mui.com/)
- [Vitest Documentation](https://vitest.dev/)

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Maintained by**: Development Team
