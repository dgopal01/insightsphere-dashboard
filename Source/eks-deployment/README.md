# EKS Deployment for Swbc.Ethos.Ai

This directory contains all the necessary files and configurations to deploy the Swbc.Ethos.Ai application to Amazon EKS (Elastic Kubernetes Service).

## Directory Structure

```
eks-deployment/
├── README.md                           # This file - deployment overview
├── DEPLOYMENT-PLAN.md                  # Comprehensive deployment plan
├── infrastructure/                     # EKS cluster and AWS infrastructure
│   ├── eks-cluster.yaml               # EKS cluster configuration
│   └── aws-load-balancer-controller.yaml # ALB controller setup
├── kubernetes/                        # Kubernetes manifests
│   ├── namespace.yaml                 # Namespace definition
│   ├── configmap.yaml                 # Configuration variables
│   ├── secret.yaml                    # Sensitive configuration
│   ├── deployment.yaml                # Application deployment
│   ├── service.yaml                   # Kubernetes service
│   └── ingress.yaml                   # Load balancer ingress
├── docker/                           # Docker configuration
│   ├── Dockerfile                    # Multi-stage Docker build
│   ├── .dockerignore                 # Docker ignore patterns
│   └── nginx.conf                    # Nginx configuration
├── scripts/                          # Deployment and management scripts
│   ├── deploy.sh                     # Main deployment script
│   ├── rollback.sh                   # Rollback procedures
│   ├── setup-dynamodb.js            # DynamoDB table management
│   └── env-config.sh                 # Environment configuration
├── monitoring/                       # Monitoring and observability
│   ├── cloudwatch-config.yaml       # CloudWatch Container Insights setup
│   ├── cloudwatch-alarms.yaml       # CloudWatch alarms configuration
│   ├── cloudwatch-dashboard.json    # CloudWatch dashboard definition
│   └── README.md                    # CloudWatch monitoring documentation
├── ci-cd/                           # CI/CD pipeline
│   └── github-actions.yml           # GitHub Actions workflow
└── docs/                            # Additional documentation
    ├── troubleshooting.md           # Troubleshooting guide
    ├── security.md                  # Security considerations
    └── maintenance.md               # Maintenance procedures
```

## Quick Start

1. **Prerequisites**: Ensure you have AWS CLI, kubectl, eksctl, Docker, and Helm installed
2. **Configure AWS**: Run `aws configure` with your credentials
3. **Deploy**: Execute `./scripts/deploy.sh` from this directory

## Key Components

- **Infrastructure**: EKS cluster with auto-scaling and load balancer controller
- **Application**: Containerized React app with Nginx
- **Database**: Automated DynamoDB table creation and management
- **Monitoring**: AWS CloudWatch Container Insights with alarms and dashboards
- **CI/CD**: GitHub Actions pipeline for automated deployments

## Environment Variables

The application requires the following environment variables (configured in `kubernetes/secret.yaml`):
- `VITE_USER_POOL_ID`
- `VITE_USER_POOL_CLIENT_ID`
- `VITE_IDENTITY_POOL_ID`
- `VITE_GRAPHQL_ENDPOINT`
- `VITE_S3_BUCKET`
- `VITE_CHATLOG_TABLE`
- `VITE_FEEDBACK_TABLE`
- `VITE_EVAL_JOB_TABLE`

## Support

For detailed instructions, see `DEPLOYMENT-PLAN.md`. For troubleshooting, check `docs/troubleshooting.md`.