# InsightSphere Setup Guide

This document provides detailed instructions for setting up the InsightSphere Dashboard project.

## Project Foundation Setup ✅

The following components have been successfully configured:

### 1. React TypeScript Project with Vite
- ✅ Initialized with Vite (faster than Create React App)
- ✅ React 19 with TypeScript
- ✅ Hot Module Replacement (HMR) enabled
- ✅ Fast build times with Vite

### 2. Core Dependencies Installed
- ✅ **Material-UI (MUI)**: UI component library
  - @mui/material
  - @mui/icons-material
  - @emotion/react
  - @emotion/styled
- ✅ **React Router v7**: Client-side routing
- ✅ **TanStack React Query**: Server state management
- ✅ **Recharts**: Data visualization
- ✅ **AWS Amplify**: Backend integration
  - aws-amplify
  - @aws-amplify/ui-react

### 3. AWS Amplify Configuration
- ✅ Amplify CLI installed globally
- ✅ Configuration files created:
  - `src/aws-exports.ts`: AWS service configuration
  - `src/amplify-config.ts`: Amplify initialization
- ✅ Environment variables template (`.env.example`)
- ✅ Amplify integrated in `main.tsx`

### 4. Code Quality Tools
- ✅ **ESLint**: Code linting with TypeScript support
- ✅ **Prettier**: Code formatting
- ✅ **TypeScript Strict Mode**: Enabled in `tsconfig.app.json`
- ✅ Integration between ESLint and Prettier

### 5. Project Structure
```
src/
├── components/     # React components (ready for implementation)
├── contexts/       # React contexts (ready for implementation)
├── hooks/          # Custom React hooks (ready for implementation)
├── pages/          # Page components (ready for implementation)
├── services/       # API and service layer (ready for implementation)
├── types/          # TypeScript type definitions ✅
├── utils/          # Utility functions (ready for implementation)
├── amplify-config.ts  # AWS Amplify configuration ✅
├── aws-exports.ts     # AWS configuration exports ✅
└── main.tsx        # Application entry point ✅
```

### 6. Type Definitions
- ✅ Core types defined in `src/types/index.ts`:
  - ChatLog
  - Feedback
  - MetricData
  - LogFilters
  - FeedbackInput
  - FeedbackMetrics
  - DateRange
  - UserRole
  - CognitoUser

## Next Steps

### AWS Backend Configuration (Task 2)
Before the application can function, you need to set up the AWS backend:

1. **Create Cognito User Pool**
   - Set up user pool for authentication
   - Configure user attributes
   - Create app client

2. **Set up AppSync GraphQL API**
   - Define GraphQL schema for ChatLog and Feedback
   - Configure resolvers
   - Set up authentication rules

3. **Create DynamoDB Tables**
   - ChatLogs table (read-only)
   - Feedback table (read-write)
   - Configure GSI indexes

4. **Set up S3 Bucket**
   - Create bucket for CSV exports
   - Configure access policies

5. **Update Environment Variables**
   - Copy `.env.example` to `.env`
   - Fill in actual AWS resource IDs and endpoints

### Development Workflow

**Start Development Server:**
```bash
npm run dev
```

**Run Linting:**
```bash
npm run lint
npm run lint:fix  # Auto-fix issues
```

**Format Code:**
```bash
npm run format
npm run format:check  # Check without modifying
```

**Type Checking:**
```bash
npm run type-check
```

**Build for Production:**
```bash
npm run build
```

## Verification

All setup tasks have been verified:
- ✅ Type checking passes
- ✅ Linting passes
- ✅ Build succeeds
- ✅ All dependencies installed correctly

## Requirements Satisfied

This setup satisfies the following requirements from the specification:
- **Requirement 6.1**: Authentication infrastructure ready (Cognito integration)
- **Requirement 6.2**: JWT token handling configured
- **Requirement 9.1**: Fast initial load time (Vite optimization)

## Notes

- The application uses Vite environment variables (prefixed with `VITE_`)
- AWS Amplify v6 is configured with the new modular API
- React Query is configured with sensible defaults (5-minute stale time, 1 retry)
- Material-UI theme is set up with light mode (dark mode to be implemented in Task 5)
- TypeScript strict mode is enabled for maximum type safety
