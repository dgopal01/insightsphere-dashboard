# InsightSphere Dashboard - Project Structure

## 📁 Root Directory

### Configuration Files
- `package.json` - Project dependencies and scripts
- `tsconfig*.json` - TypeScript configuration
- `vite.config.ts` - Vite build configuration
- `vitest.config.ts` - Test configuration
- `eslint.config.js` - Linting rules
- `.prettierrc` - Code formatting rules
- `.gitignore` - Git ignore patterns
- `amplify.yml` - AWS Amplify Hosting build specification

### Environment Files
- `.env` - Local development environment variables
- `.env.example` - Example environment configuration
- `.env.development` - Development environment
- `.env.staging` - Staging environment
- `.env.production` - Production environment

### Deployment Scripts

#### CloudFormation Backend
- `deploy.sh` - Bash deployment script
- `deploy.cmd` - Windows CMD wrapper
- `deploy-cloudformation.ps1` - PowerShell deployment script
- `deploy-all.ps1` - Complete deployment orchestration

#### Utilities
- `create-admin-user.ps1` - Create Cognito admin users
- `update-env.ps1` - Update environment variables
- `deploy-to-s3-simple.ps1` - Alternative S3 static hosting

### Documentation

#### Main Documentation
- `README.md` - Project overview and getting started
- `SETUP.md` - Setup instructions
- `TESTING.md` - Testing guide

#### Deployment Documentation
- `DEPLOYMENT_COMPLETE.md` - **Current deployment status** ⭐
- `DEPLOYMENT_SUCCESS.md` - Deployment reference
- `CLOUD_DEPLOYMENT_GUIDE.md` - Cloud deployment options
- `AMPLIFY_SETUP_GUIDE.md` - Amplify Hosting setup guide
- `BACKEND_NOTE.md` - Backend architecture notes

#### Cleanup Documentation
- `CLEANUP_PLAN.md` - This cleanup plan

## 📂 Source Directories

### `/src` - Application Source Code
```
src/
├── components/          # Reusable React components
│   ├── ChatLogTable.tsx
│   ├── DashboardCard.tsx
│   ├── ErrorBoundary.tsx
│   ├── FeedbackForm.tsx
│   ├── Layout.tsx
│   ├── ProtectedRoute.tsx
│   └── index.ts
├── contexts/            # React Context providers
│   ├── AuthContext.tsx
│   ├── ThemeContext.tsx
│   └── index.ts
├── hooks/              # Custom React hooks
│   ├── useAuth.ts
│   ├── useChatLogs.ts
│   ├── useFeedback.ts
│   └── index.ts
├── pages/              # Page components
│   ├── ChatLogsPage.tsx
│   ├── DashboardPage.tsx
│   ├── FeedbackPage.tsx
│   ├── SignInPage.tsx
│   ├── UnauthorizedPage.tsx
│   └── index.ts
├── services/           # API and service layer
│   ├── api.ts
│   ├── graphql/
│   └── index.ts
├── types/              # TypeScript type definitions
│   ├── index.ts
│   └── models.ts
├── utils/              # Utility functions
│   ├── analytics.ts
│   ├── errorTracking.ts
│   ├── monitoring.ts
│   ├── performance.ts
│   └── index.ts
├── amplify-config.ts   # AWS Amplify configuration
├── aws-exports.ts      # AWS resource configuration
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
└── index.css           # Global styles
```

### `/cloudformation` - Infrastructure as Code
```
cloudformation/
├── insightsphere-stack.yaml  # Main CloudFormation template
└── README.md                 # Infrastructure documentation
```

### `/scripts` - Build and Deployment Scripts
```
scripts/
├── build-optimize.js      # Build optimization
├── configure-domain.js    # Domain configuration
├── deploy.js              # Deployment automation
├── health-check.js        # Health check utility
├── pre-deploy.js          # Pre-deployment checks
└── README.md              # Scripts documentation
```

### `/docs` - Detailed Documentation
```
docs/
├── CI_CD_PIPELINE.md
├── DEPLOYMENT.md
├── DEPLOYMENT_CHECKLIST.md
├── DEPLOYMENT_QUICKSTART.md
└── ENVIRONMENT_SETUP.md
```

### `/public` - Static Assets
```
public/
└── (static files served as-is)
```

### `/.github` - GitHub Configuration
```
.github/
└── workflows/
    ├── deploy.yml         # Deployment workflow
    └── pr-preview.yml     # PR preview workflow
```

### `/.kiro` - Kiro IDE Configuration
```
.kiro/
└── specs/
    └── insightsphere-dashboard/
        ├── requirements.md
        ├── design.md
        └── tasks.md
```

## 🗑️ Ignored Directories (in .gitignore)

- `node_modules/` - NPM dependencies
- `dist/` - Build output
- `coverage/` - Test coverage reports
- `amplify/` - Amplify CLI files (not used)
- `amplify-backup/` - Amplify CLI backup (not used)

## 🎯 Key Files by Purpose

### Development
- Start dev server: `npm run dev` (uses `vite.config.ts`)
- Run tests: `npm run test` (uses `vitest.config.ts`)
- Lint code: `npm run lint` (uses `eslint.config.js`)

### Deployment
- Deploy backend: `./deploy.sh` or `.\deploy-cloudformation.ps1`
- Frontend auto-deploys via Amplify Hosting on git push

### Configuration
- AWS resources: `src/aws-exports.ts`
- Environment variables: `.env` files
- Build settings: `amplify.yml`

### Documentation
- Getting started: `README.md`
- Current deployment: `DEPLOYMENT_COMPLETE.md`
- Testing: `TESTING.md`

## 📊 Project Statistics

- **Total Source Files**: ~50+ TypeScript/React files
- **Components**: 10+ reusable components
- **Pages**: 5 main pages
- **Deployment Scripts**: 7 active scripts
- **Documentation Files**: 15+ markdown files
- **Configuration Files**: 10+ config files

## 🧹 Recently Cleaned Up

Removed 14 obsolete/temporary files:
- Temporary buildspec and template files
- Obsolete Amplify CLI scripts
- Scripts with syntax errors
- Duplicate documentation
- Temporary troubleshooting files

## 📝 Notes

- Backend uses CloudFormation (not Amplify CLI)
- Frontend deploys via Amplify Hosting
- Environment variables set in Amplify Console
- Automatic deployments on git push to main
