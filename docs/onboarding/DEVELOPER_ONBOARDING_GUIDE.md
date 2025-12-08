# Developer Onboarding Guide - EthosAI

## Welcome! 👋

This guide will help you get set up and productive with the EthosAI project quickly.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [AWS Access Setup](#aws-access-setup)
3. [Local Development Setup](#local-development-setup)
4. [Project Overview](#project-overview)
5. [Development Workflow](#development-workflow)
6. [Common Tasks](#common-tasks)
7. [Resources](#resources)

---

## Prerequisites

### Required Software
- **Node.js**: v18 or higher
- **npm**: v9 or higher
- **Git**: Latest version
- **AWS CLI**: v2.x
- **Code Editor**: VS Code (recommended)

### Install Node.js
```bash
# Check version
node --version
npm --version

# If not installed, download from:
# https://nodejs.org/
```

### Install AWS CLI
```bash
# macOS
brew install awscli

# Windows
# Download from: https://aws.amazon.com/cli/

# Linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Verify installation
aws --version
```

---

## AWS Access Setup

### Step 1: Request AWS Access

Contact your team lead or DevOps to request:
1. AWS IAM user account
2. Access keys (Access Key ID + Secret Access Key)
3. User pool ID and other environment variables

### Step 2: Configure AWS CLI

```bash
# Configure AWS profile
aws configure --profile insightsphere-dev

# Enter when prompted:
# AWS Access Key ID: [Your Access Key]
# AWS Secret Access Key: [Your Secret Key]
# Default region name: us-east-1
# Default output format: json
```

### Step 3: Test AWS Access

```bash
# Test Cognito access
aws cognito-idp list-user-pools --max-results 10 --profile insightsphere-dev

# Test DynamoDB access
aws dynamodb list-tables --profile insightsphere-dev

# Test S3 access
aws s3 ls --profile insightsphere-dev
```

### Step 4: Set Environment Variable

```bash
# Add to your shell profile (~/.bashrc, ~/.zshrc, etc.)
export AWS_PROFILE=insightsphere-dev

# Or set for current session
export AWS_PROFILE=insightsphere-dev
```

---

## Local Development Setup

### Step 1: Clone Repository

```bash
# Clone the repository
git clone https://github.com/your-org/ethosai.git
cd ethosai

# Create your feature branch
git checkout -b feature/your-name-initial-setup
```

### Step 2: Install Dependencies

```bash
# Install all dependencies
npm install

# This will install:
# - React and related libraries
# - AWS Amplify SDK
# - Material-UI components (being migrated to Tailwind)
# - Development tools
```

### Step 3: Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your values
# Get these from your team lead or AWS Console
```

**Required Environment Variables**:
```env
# AWS Configuration
VITE_AWS_REGION=us-east-1
VITE_USER_POOL_ID=us-east-1_XXXXXXXXX
VITE_USER_POOL_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_IDENTITY_POOL_ID=us-east-1:XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
VITE_GRAPHQL_ENDPOINT=https://XXXXXXXXXXXXXXXXXXXXXXXXXX.appsync-api.us-east-1.amazonaws.com/graphql

# DynamoDB Tables
VITE_CHATLOG_TABLE=chat-logs-review-dev-UnityAIAssistantLogs
VITE_FEEDBACK_TABLE=chat-logs-review-dev-UserFeedback
VITE_EVAL_JOB_TABLE=UnityAIAssistantEvalJob

# Environment
VITE_ENV=development
```

### Step 4: Start Development Server

```bash
# Start the development server
npm run dev

# Server will start at http://localhost:3000
# Hot reload is enabled - changes will reflect immediately
```

### Step 5: Verify Setup

1. Open http://localhost:3000 in your browser
2. You should see the sign-in page
3. Try signing in with test credentials (get from team lead)
4. Verify you can navigate to different pages

---

## Project Overview

### Technology Stack

**Frontend**:
- React 19.2.0 with TypeScript
- Tailwind CSS + Radix UI (new design system)
- Material-UI (being phased out)
- React Router v7
- Vite (build tool)

**Backend**:
- AWS Amplify
- AWS Cognito (authentication)
- AWS AppSync (GraphQL API)
- AWS DynamoDB (database)
- AWS S3 (storage)

**Testing**:
- Vitest (unit tests)
- React Testing Library
- fast-check (property-based testing)

### Project Structure

```
ethosai/
├── src/
│   ├── pages/              # Page components
│   │   ├── *PageNew.tsx    # New design system pages
│   │   └── *Page.tsx       # Old Material-UI pages (being phased out)
│   ├── components/
│   │   ├── ui/             # Reusable UI components (new design system)
│   │   ├── layout/         # Layout components (sidebar, header)
│   │   └── *.tsx           # Feature-specific components
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API and service layer
│   ├── contexts/           # React contexts
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript type definitions
│   └── styles/             # Global styles
├── cloudformation/         # AWS infrastructure templates
├── lambda/                 # Lambda function code
├── scripts/                # Build and deployment scripts
├── docs/                   # Feature documentation
└── build_docs/             # Build and deployment docs
```

### Key Pages

1. **Dashboard** (`/dashboard`) - Review metrics and progress
2. **AI Metrics** (`/ai-metrics`) - AI quality metrics and charts
3. **Chat Logs Review** (`/chat-logs-review`) - Review chat logs
4. **Feedback Logs** (`/feedback-logs-review`) - Review user feedback
5. **Sign In** (`/signin`) - Authentication page

---

## Development Workflow

### 1. Pick a Task

- Check Jira/GitHub Issues for assigned tasks
- Ask team lead if unsure what to work on
- Create a feature branch

### 2. Create Feature Branch

```bash
# Branch naming convention:
# feature/TICKET-123-short-description
# bugfix/TICKET-456-short-description
# hotfix/critical-issue-description

git checkout -b feature/TICKET-123-add-new-filter
```

### 3. Make Changes

- Write code following project conventions
- Use new design system components (Tailwind + Radix UI)
- Add TypeScript types for new code
- Write tests for new functionality

### 4. Test Your Changes

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Format code
npm run format
```

### 5. Commit Changes

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add filter by date range to chat logs

- Added date picker component
- Updated filter logic
- Added tests for date filtering
- Updated documentation

Closes TICKET-123"
```

**Commit Message Format**:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### 6. Push and Create PR

```bash
# Push to remote
git push origin feature/TICKET-123-add-new-filter

# Create Pull Request on GitHub
# - Add description of changes
# - Link to ticket
# - Request reviewers
# - Add screenshots if UI changes
```

### 7. Code Review

- Address reviewer comments
- Make requested changes
- Push updates to same branch
- Request re-review

### 8. Merge

- Once approved, merge to main
- Delete feature branch
- Pull latest main locally

---

## Common Tasks

### Task 1: Add a New Page

```bash
# 1. Create page component
touch src/pages/MyNewPageNew.tsx

# 2. Use template:
```

```tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MyNewPageNew: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My New Page</h1>
      <Card>
        <CardHeader>
          <CardTitle>Content</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Your content here */}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyNewPageNew;
```

```bash
# 3. Add route in App.tsx
# 4. Add navigation item in AppSidebar.tsx
# 5. Test the page
```

### Task 2: Add a New Component

```bash
# 1. Create component file
touch src/components/ui/my-component.tsx

# 2. Use component template with Tailwind CSS
# 3. Export from index if needed
# 4. Write tests
# 5. Document usage
```

### Task 3: Query DynamoDB

```typescript
// Use the DynamoDBService
import { listChatLogs } from '../services/DynamoDBService';

const fetchData = async () => {
  try {
    const result = await listChatLogs(100);
    console.log('Logs:', result.items);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Task 4: Add Authentication Check

```typescript
// Use the useAuth hook
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please sign in</div>;
  }
  
  return <div>Welcome, {user?.username}</div>;
};
```

### Task 5: View Logs

```bash
# View application logs
aws logs tail /aws/amplify/insightsphere-dev --follow --profile insightsphere-dev

# Filter for errors
aws logs tail /aws/amplify/insightsphere-dev --follow --filter-pattern "ERROR" --profile insightsphere-dev
```

---

## Design System Migration

**Important**: We're migrating from Material-UI to Tailwind CSS + Radix UI.

### Use New Components

✅ **DO**:
```tsx
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

<Button variant="default">Click Me</Button>
<Card>Content</Card>
```

❌ **DON'T**:
```tsx
import { Button, Card } from '@mui/material';

<Button variant="contained">Click Me</Button>
<Card>Content</Card>
```

### Available New Components

- Button
- Card
- Table
- Input
- Label
- Select
- Dialog
- Checkbox
- Badge
- Separator
- Sheet
- Tooltip
- Skeleton
- Sidebar
- Progress
- Alert

### Styling with Tailwind

```tsx
// Use Tailwind utility classes
<div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow-md">
  <h2 className="text-2xl font-bold text-gray-900">Title</h2>
  <p className="text-sm text-gray-600">Description</p>
</div>
```

---

## Troubleshooting

### Issue: AWS Access Denied

**Solution**:
```bash
# Check your AWS profile
aws sts get-caller-identity --profile insightsphere-dev

# Verify credentials are correct
aws configure list --profile insightsphere-dev

# Contact DevOps if permissions are missing
```

### Issue: Environment Variables Not Loading

**Solution**:
```bash
# Ensure .env file exists
ls -la .env

# Restart development server
npm run dev

# Check variables are prefixed with VITE_
# Only VITE_* variables are exposed to the browser
```

### Issue: Type Errors

**Solution**:
```bash
# Run type checking
npm run type-check

# Check for missing type definitions
# Add types to src/types/index.ts if needed
```

### Issue: Build Fails

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
rm -rf dist

# Try building again
npm run build
```

---

## Resources

### Documentation
- [Project README](./README.md)
- [Setup Guide](./build_docs/SETUP.md)
- [AWS Developer Permissions](./AWS_DEVELOPER_PERMISSIONS.md)
- [Design System Migration](./MIGRATION_COMPLETE.md)

### AWS Documentation
- [AWS Amplify Docs](https://docs.amplify.aws/)
- [AWS Cognito Docs](https://docs.aws.amazon.com/cognito/)
- [AWS DynamoDB Docs](https://docs.aws.amazon.com/dynamodb/)
- [AWS AppSync Docs](https://docs.aws.amazon.com/appsync/)

### Frontend Documentation
- [React Docs](https://react.dev/)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Radix UI Docs](https://www.radix-ui.com/primitives/docs/overview/introduction)

### Tools
- [VS Code](https://code.visualstudio.com/)
- [AWS Console](https://console.aws.amazon.com/)
- [GitHub](https://github.com/)

---

## Getting Help

### Team Contacts
- **Team Lead**: [Name] - [email]
- **DevOps**: [Name] - [email]
- **Frontend Lead**: [Name] - [email]

### Communication Channels
- **Slack**: #ethosai-dev
- **Email**: dev-team@company.com
- **Stand-ups**: Daily at 10:00 AM

### Code Review
- Tag appropriate reviewers on PRs
- Respond to comments within 24 hours
- Ask questions if feedback is unclear

---

## Next Steps

1. ✅ Complete AWS access setup
2. ✅ Set up local development environment
3. ✅ Run the application locally
4. ✅ Pick your first task
5. ✅ Create a feature branch
6. ✅ Make your first commit
7. ✅ Create your first PR

**Welcome to the team! Happy coding! 🚀**

---

**Last Updated**: December 2024  
**Version**: 1.0
