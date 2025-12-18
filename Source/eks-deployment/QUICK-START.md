# EKS Deployment Quick Start Guide

## Overview

This directory contains a complete, production-ready EKS deployment solution for the Swbc.Ethos.Ai application. All files have been organized into a logical structure for easy management and deployment.

## Directory Structure

```
eks-deployment/
├── README.md                           # Overview and quick start
├── DEPLOYMENT-PLAN.md                  # Comprehensive deployment plan
├── QUICK-START.md                      # This file
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

## Prerequisites

Install the following tools:

```bash
# AWS CLI v2.0+
aws --version

# kubectl v1.28+
kubectl version --client

# eksctl v0.150+
eksctl version

# Docker v20.0+
docker --version

# Helm v3.0+
helm version

# Node.js v18+
node --version
```

## One-Command Deployment

```bash
# Navigate to the EKS deployment directory
cd Swbc.Ethos.Ai/Source/eks-deployment

# Configure AWS credentials
aws configure

# Make scripts executable (Linux/Mac)
chmod +x scripts/*.sh

# Deploy everything
./scripts/deploy.sh
```

## Manual Step-by-Step Deployment

### 1. Create EKS Cluster
```bash
eksctl create cluster -f infrastructure/eks-cluster.yaml
aws eks update-kubeconfig --region us-east-1 --name swbc-ethos-ai-cluster
```

### 2. Setup DynamoDB Tables
```bash
cd ../  # Go back to project root
node eks-deployment/scripts/setup-dynamodb.js
```

### 3. Build and Push Docker Image
```bash
# Get AWS account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Create ECR repository
aws ecr create-repository --repository-name swbc-ethos-ai --region us-east-1

# Build and push image
docker build -f eks-deployment/docker/Dockerfile -t swbc-ethos-ai:latest .
docker tag swbc-ethos-ai:latest $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/swbc-ethos-ai:latest

# Login to ECR and push
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
docker push $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/swbc-ethos-ai:latest
```

### 4. Deploy to Kubernetes
```bash
cd eks-deployment

# Apply manifests
kubectl apply -f kubernetes/namespace.yaml
kubectl apply -f kubernetes/configmap.yaml
kubectl apply -f kubernetes/secret.yaml

# Update deployment with your account ID
sed "s|ACCOUNT_ID|$ACCOUNT_ID|g" kubernetes/deployment.yaml | kubectl apply -f -

kubectl apply -f kubernetes/service.yaml
```

### 5. Configure Ingress (Optional)
```bash
# Update ingress.yaml with your certificate ARN and security groups
# Then apply:
kubectl apply -f kubernetes/ingress.yaml
```

## Environment Configuration

Update the following files with your specific values:

### kubernetes/secret.yaml
```yaml
stringData:
  VITE_USER_POOL_ID: "your-user-pool-id"
  VITE_USER_POOL_CLIENT_ID: "your-client-id"
  VITE_IDENTITY_POOL_ID: "your-identity-pool-id"
  VITE_GRAPHQL_ENDPOINT: "your-graphql-endpoint"
  VITE_S3_BUCKET: "your-s3-bucket"
  # ... other variables
```

### kubernetes/ingress.yaml
```yaml
annotations:
  alb.ingress.kubernetes.io/certificate-arn: "your-certificate-arn"
  alb.ingress.kubernetes.io/security-groups: "your-security-groups"
  alb.ingress.kubernetes.io/subnets: "your-subnets"
```

## Verification

After deployment, verify everything is working:

```bash
# Check pods
kubectl get pods -n swbc-ethos-ai

# Check services
kubectl get services -n swbc-ethos-ai

# Check ingress
kubectl get ingress -n swbc-ethos-ai

# Test health endpoint
kubectl port-forward service/ethos-ai-frontend-service 8080:80 -n swbc-ethos-ai &
curl http://localhost:8080/health
```

## Management Commands

### Scaling
```bash
# Scale up
kubectl scale deployment ethos-ai-frontend --replicas=5 -n swbc-ethos-ai

# Auto-scaling
kubectl autoscale deployment ethos-ai-frontend --cpu-percent=70 --min=2 --max=10 -n swbc-ethos-ai
```

### Updates
```bash
# Update image
kubectl set image deployment/ethos-ai-frontend frontend=NEW_IMAGE -n swbc-ethos-ai

# Check rollout status
kubectl rollout status deployment/ethos-ai-frontend -n swbc-ethos-ai
```

### Rollback
```bash
# Using the rollback script
./scripts/rollback.sh history
./scripts/rollback.sh previous
./scripts/rollback.sh revision 2
```

### Monitoring
```bash
# Apply CloudWatch monitoring
kubectl apply -f monitoring/cloudwatch-config.yaml
kubectl apply -f monitoring/cloudwatch-alarms.yaml

# Check logs
kubectl logs -f deployment/ethos-ai-frontend -n swbc-ethos-ai
```

## CI/CD Integration

To set up automated deployments:

1. Copy `ci-cd/github-actions.yml` to `.github/workflows/deploy-eks.yml`
2. Set up GitHub secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `SLACK_WEBHOOK` (optional)

## Troubleshooting

For common issues and solutions, see:
- `docs/troubleshooting.md` - Comprehensive troubleshooting guide
- `docs/security.md` - Security considerations and best practices
- `docs/maintenance.md` - Regular maintenance procedures

## Key Features

✅ **Production Ready**: Security best practices, resource limits, health checks
✅ **Auto-scaling**: Horizontal Pod Autoscaler and Cluster Autoscaler
✅ **Monitoring**: AWS CloudWatch Container Insights with alarms and dashboards
✅ **Security**: Non-root containers, network policies, RBAC
✅ **High Availability**: Multi-AZ deployment with pod anti-affinity
✅ **Cost Optimized**: Right-sized resources and efficient scaling
✅ **CI/CD Ready**: GitHub Actions workflow included
✅ **DynamoDB Management**: Automated table creation and management
✅ **Rollback Support**: Easy rollback procedures
✅ **Comprehensive Documentation**: Detailed guides for all aspects

## Support

- **Documentation**: See `docs/` directory for detailed guides
- **Issues**: Check `docs/troubleshooting.md` first
- **Updates**: Follow maintenance procedures in `docs/maintenance.md`

## Next Steps

1. **Deploy to staging** first to validate everything works
2. **Update configuration** with your specific values
3. **Set up monitoring** and alerting
4. **Configure CI/CD** pipeline
5. **Train your team** on the new deployment process

This EKS deployment provides a robust, scalable, and maintainable solution for your Swbc.Ethos.Ai application while maintaining all existing functionality.