# Project Structure

This document outlines the clean, organized structure of the Swbc.Ethos.Ai project after cleanup and reorganization.

## Directory Structure

```
Swbc.Ethos.Ai/Source/
├── README.md                           # Main project documentation
├── PROJECT-STRUCTURE.md               # This file - project organization
├── CLEANUP-PLAN.md                    # Documentation of cleanup process
├── package.json                       # Dependencies and scripts
├── package-lock.json                  # Locked dependency versions
├── .env*                              # Environment configuration files
├── .gitignore                         # Git ignore patterns
├── .prettierrc                        # Code formatting configuration
├── .prettierignore                    # Prettier ignore patterns
├── eslint.config.js                   # ESLint configuration
├── postcss.config.js                  # PostCSS configuration
├── tailwind.config.js                 # Tailwind CSS configuration
├── tsconfig*.json                     # TypeScript configuration
├── vite.config.ts                     # Vite build configuration
├── vitest.config.ts                   # Vitest test configuration
├── index.html                         # HTML entry point
├── amplify.yml                        # AWS Amplify configuration
├── schema.graphql                     # GraphQL schema
├── dynamodb-policy.json               # DynamoDB IAM policy
├── src/                               # Application source code
│   ├── components/                    # React components
│   ├── pages/                         # Page components
│   ├── contexts/                      # React contexts
│   ├── hooks/                         # Custom React hooks
│   ├── services/                      # API services
│   ├── utils/                         # Utility functions
│   ├── types/                         # TypeScript type definitions
│   ├── styles/                        # CSS and styling
│   ├── assets/                        # Static assets
│   ├── graphql/                       # GraphQL queries and mutations
│   ├── lib/                           # Library configurations
│   ├── test/                          # Test utilities
│   ├── App.tsx                        # Main App component
│   ├── main.tsx                       # Application entry point
│   ├── aws-exports.ts                 # AWS configuration
│   └── amplify-config.ts              # Amplify configuration
├── public/                            # Public static assets
│   ├── ethosai-logo.png              # Application logo
│   ├── redirects.json                # Redirect configuration
│   └── vite.svg                      # Vite logo
├── scripts/                           # Build and deployment scripts
│   ├── analyze-bundle.js             # Bundle analysis
│   ├── build-optimize.js             # Build optimization
│   ├── configure-domain.js           # Domain configuration
│   ├── deploy.js                     # Deployment script
│   ├── health-check.js               # Health check script
│   ├── pre-deploy.js                 # Pre-deployment checks
│   ├── test-build.js                 # Build testing
│   └── README.md                     # Scripts documentation
├── eks-deployment/                    # Complete EKS deployment solution
│   ├── README.md                     # EKS deployment overview
│   ├── DEPLOYMENT-PLAN.md            # Comprehensive deployment plan
│   ├── QUICK-START.md                # Quick start guide
│   ├── infrastructure/               # EKS cluster configuration
│   │   ├── eks-cluster.yaml         # EKS cluster definition
│   │   └── aws-load-balancer-controller.yaml # ALB controller
│   ├── kubernetes/                   # Kubernetes manifests
│   │   ├── namespace.yaml           # Namespace definition
│   │   ├── configmap.yaml           # Configuration
│   │   ├── secret.yaml              # Secrets
│   │   ├── deployment.yaml          # Application deployment
│   │   ├── service.yaml             # Kubernetes service
│   │   └── ingress.yaml             # Load balancer ingress
│   ├── docker/                      # Docker configuration
│   │   ├── Dockerfile               # Multi-stage Docker build
│   │   ├── .dockerignore            # Docker ignore patterns
│   │   └── nginx.conf               # Nginx configuration
│   ├── scripts/                     # Deployment scripts
│   │   ├── deploy.sh                # Main deployment script
│   │   ├── rollback.sh              # Rollback procedures
│   │   ├── setup-dynamodb.js        # DynamoDB management
│   │   └── env-config.sh            # Environment configuration
│   ├── monitoring/                  # Monitoring configuration
│   │   ├── cloudwatch-config.yaml   # CloudWatch Container Insights setup
│   │   ├── cloudwatch-alarms.yaml   # CloudWatch alarms configuration
│   │   ├── cloudwatch-dashboard.json # CloudWatch dashboard definition
│   │   └── README.md                # CloudWatch monitoring documentation
│   ├── ci-cd/                       # CI/CD pipeline
│   │   └── github-actions.yml       # GitHub Actions workflow
│   └── docs/                        # Detailed documentation
│       ├── troubleshooting.md       # Troubleshooting guide
│       ├── security.md              # Security considerations
│       └── maintenance.md           # Maintenance procedures
├── cloudformation/                   # AWS CloudFormation templates
│   ├── insightsphere-stack.yaml     # Main infrastructure stack
│   ├── chat-logs-review-stack.yaml  # Chat logs review infrastructure
│   └── *.md                         # CloudFormation documentation
├── lambda/                           # AWS Lambda functions
│   ├── get-review-metrics/          # Review metrics Lambda
│   └── *.md                         # Lambda documentation
├── docs/                            # General project documentation
│   ├── chat-logs-review/           # Chat logs review documentation
│   ├── onboarding/                  # Developer onboarding guides
│   └── *.md                         # Various documentation files
├── amplify/                         # AWS Amplify configuration
│   ├── backend/                     # Amplify backend configuration
│   ├── .config/                     # Amplify CLI configuration
│   └── *.json                       # Amplify metadata
├── .github/                         # GitHub configuration
│   └── workflows/                   # GitHub Actions workflows
│       └── deploy-eks.yml           # EKS deployment workflow
└── node_modules/                    # Dependencies (auto-generated)
```

## Key Components

### Application Code (`src/`)
- **React Application**: Modern React 19 with TypeScript
- **Routing**: React Router for navigation
- **State Management**: React Query for server state, React Context for client state
- **Styling**: Tailwind CSS with custom components
- **Authentication**: AWS Cognito integration
- **API**: AWS AppSync GraphQL integration

### EKS Deployment (`eks-deployment/`)
- **Complete Solution**: Production-ready Kubernetes deployment
- **Infrastructure as Code**: EKS cluster and AWS resources
- **Container Configuration**: Multi-stage Docker builds with Nginx
- **Monitoring**: AWS CloudWatch Container Insights with alarms and dashboards
- **CI/CD**: GitHub Actions pipeline
- **Documentation**: Comprehensive guides for deployment, security, and maintenance

### Build Scripts (`scripts/`)
- **Build Optimization**: Bundle analysis and optimization
- **Deployment**: Automated deployment to AWS
- **Health Checks**: Application health monitoring
- **Domain Configuration**: Custom domain setup

### AWS Infrastructure
- **CloudFormation**: Infrastructure as Code templates
- **Lambda Functions**: Serverless functions for specific features
- **Amplify Configuration**: Legacy Amplify setup (maintained for reference)

## Removed During Cleanup

### Duplicate Files
- `k8s/` directory (superseded by `eks-deployment/`)
- Root `Dockerfile` and `.dockerignore` (moved to `eks-deployment/docker/`)
- `EKS-DEPLOYMENT-PLAN.md` (moved to `eks-deployment/`)

### Outdated Documentation
- `build_docs/` directory (30+ outdated build documentation files)
- `archive/` directory (archived components)
- Multiple duplicate README and guide files

### Unused Scripts
- PowerShell scripts not referenced in package.json
- Legacy deployment scripts for different platforms
- Unused utility scripts

### Build Artifacts
- `dist/` directory (build output)
- Temporary files and caches

### Legacy/Unused Components
- `sample_app/` directory (sample application)
- Duplicate configuration files
- Unused markdown files

## Package.json Scripts

### Development
- `dev` - Start development server
- `build` - Build for production
- `build:dev/staging/prod` - Environment-specific builds
- `preview` - Preview production build
- `test` - Run tests
- `lint` - Code linting
- `format` - Code formatting

### Deployment
- `deploy:eks` - Deploy to EKS cluster
- `setup:dynamodb` - Setup DynamoDB tables
- `predeploy` - Pre-deployment checks
- `deploy` - Deploy to AWS Amplify
- `health-check` - Application health checks

### Analysis
- `analyze` - Bundle analysis
- `build:analyze` - Build with analysis
- `build:test` - Test build output

## Environment Configuration

### Environment Files
- `.env` - Development environment
- `.env.development` - Development-specific variables
- `.env.staging` - Staging environment
- `.env.production` - Production environment
- `.env.example` - Example environment file

### Key Variables
- AWS configuration (Cognito, AppSync, DynamoDB, S3)
- Feature flags and debugging options
- API endpoints and timeouts
- Monitoring and analytics settings

## Development Workflow

1. **Local Development**: `npm run dev`
2. **Testing**: `npm run test`
3. **Building**: `npm run build:prod`
4. **Deployment**: `npm run deploy:eks`
5. **Health Check**: `npm run health-check`

## Deployment Options

### EKS Deployment (Recommended)
- Complete Kubernetes solution in `eks-deployment/`
- Production-ready with monitoring and security
- Automated CI/CD pipeline

### Amplify Deployment (Legacy)
- Traditional Amplify deployment
- Maintained for backward compatibility
- Uses existing `amplify/` configuration

## Documentation

### Primary Documentation
- `README.md` - Main project overview
- `eks-deployment/README.md` - EKS deployment guide
- `eks-deployment/QUICK-START.md` - Quick start guide

### Detailed Guides
- `eks-deployment/docs/` - Comprehensive EKS documentation
- `docs/` - General project documentation
- `cloudformation/` - Infrastructure documentation

## Maintenance

### Regular Tasks
- Update dependencies: `npm update`
- Security audits: `npm audit`
- Build optimization: `npm run build:analyze`
- Health monitoring: `npm run health-check`

### Deployment Updates
- EKS cluster updates via `eks-deployment/scripts/`
- Application updates via CI/CD pipeline
- Infrastructure updates via CloudFormation

This clean, organized structure provides:
- ✅ Clear separation of concerns
- ✅ Comprehensive EKS deployment solution
- ✅ Minimal duplication
- ✅ Well-documented components
- ✅ Efficient development workflow
- ✅ Production-ready deployment options