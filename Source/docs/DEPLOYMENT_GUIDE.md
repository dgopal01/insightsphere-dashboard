# EthosAI Review Portal - Deployment Guide

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [AWS Services Required](#aws-services-required)
5. [Deployment Option 1: AWS Amplify Hosting](#deployment-option-1-aws-amplify-hosting)
6. [Deployment Option 2: Amazon EKS](#deployment-option-2-amazon-eks)
7. [IAM Roles and Permissions](#iam-roles-and-permissions)
8. [Environment Configuration](#environment-configuration)
9. [Post-Deployment Steps](#post-deployment-steps)
10. [Monitoring and Logging](#monitoring-and-logging)
11. [Troubleshooting](#troubleshooting)

---

## Overview

The EthosAI Review Portal is a React-based single-page application (SPA) that provides AI review and analytics capabilities for multiple products. The application uses AWS services for authentication, data storage, and hosting.

### Application Stack
- **Frontend**: React 19 + TypeScript + Vite
- **UI Framework**: Tailwind CSS v4 + Radix UI
- **State Management**: TanStack Query (React Query)
- **Authentication**: AWS Cognito
- **Data Storage**: Amazon DynamoDB
- **API**: AWS AppSync (GraphQL) + Direct DynamoDB Access
- **Hosting Options**: AWS Amplify or Amazon EKS

---

## Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                         Users                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              CloudFront / ALB (EKS)                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         React SPA (Amplify Hosting / EKS Pod)                │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Cognito  │  │ AppSync  │  │ DynamoDB │
│  Auth    │  │ GraphQL  │  │  Direct  │
└──────────┘  └──────────┘  └──────────┘
```

### Data Flow
1. User authenticates via AWS Cognito
2. Frontend receives JWT tokens
3. API calls use Cognito credentials
4. DynamoDB accessed directly via AWS SDK
5. AppSync provides GraphQL interface (optional)

---


## Prerequisites

### Required Tools
- AWS CLI v2.x or higher
- Node.js v18.x or higher
- npm v9.x or higher
- Git
- Docker (for EKS deployment)
- kubectl (for EKS deployment)
- eksctl (for EKS deployment)

### AWS Account Requirements
- AWS Account with appropriate permissions
- AWS Region selected (recommended: us-east-1)
- Domain name (optional, for custom domain)
- SSL/TLS certificate in ACM (for custom domain)

### Access Requirements
- AWS Console access
- IAM permissions to create resources
- GitHub repository access (for CI/CD)

---

## AWS Services Required

### Core Services

#### 1. Amazon Cognito
**Purpose**: User authentication and authorization

**Resources Needed**:
- User Pool
- User Pool Client (App Client)
- Identity Pool
- User Pool Domain (for hosted UI)

**Configuration**:
```yaml
UserPool:
  - MFA: Optional
  - Password Policy: Strong (min 8 chars, uppercase, lowercase, numbers, symbols)
  - Email Verification: Required
  - Username Attributes: Email
  
UserPoolClient:
  - OAuth Flows: Authorization Code Grant
  - Callback URLs: https://your-domain.com/
  - Logout URLs: https://your-domain.com/signin
  - Scopes: openid, email, profile
  
IdentityPool:
  - Authenticated Role: Required
  - Unauthenticated Role: Not needed
```


#### 2. Amazon DynamoDB
**Purpose**: Data storage for chat logs, feedback, and metrics

**Tables Required**:

**Table 1: UnityAIAssistantLogs**
```yaml
TableName: UnityAIAssistantLogs
PartitionKey: log_id (String)
SortKey: timestamp (String)
BillingMode: PAY_PER_REQUEST or PROVISIONED
Attributes:
  - log_id: String
  - timestamp: String
  - carrier_name: String
  - question: String
  - response: String
  - rev_comment: String
  - rev_feedback: String
  - issue_tags: String (JSON array)
  - session_id: String
  - user_name: String
GlobalSecondaryIndexes:
  - carrier_name-timestamp-index
  - session_id-timestamp-index
```

**Table 2: userFeedback**
```yaml
TableName: userFeedback
PartitionKey: id (String)
SortKey: datetime (String)
BillingMode: PAY_PER_REQUEST or PROVISIONED
Attributes:
  - id: String
  - datetime: String
  - info: Map (contains feedback, question, response, etc.)
  - rev_comment: String
  - rev_feedback: String
GlobalSecondaryIndexes:
  - datetime-index
```

**Table 3: UnityAIAssistantEvalJob**
```yaml
TableName: UnityAIAssistantEvalJob
PartitionKey: log_id (String)
SortKey: job_id (String)
BillingMode: PAY_PER_REQUEST or PROVISIONED
Attributes:
  - log_id: String
  - job_id: String
  - timestamp: String
  - prompt_text: String
  - output_text: String
  - reference_response_text: String
  - results: List (evaluation metrics)
```


#### 3. AWS AppSync (Optional)
**Purpose**: GraphQL API layer

**Configuration**:
```yaml
API:
  Name: EthosAI-GraphQL-API
  AuthenticationType: AMAZON_COGNITO_USER_POOLS
  UserPoolConfig:
    UserPoolId: <cognito-user-pool-id>
    AwsRegion: us-east-1
    DefaultAction: ALLOW
DataSources:
  - DynamoDB tables (3 tables)
Resolvers:
  - Query: listUnityAIAssistantLogs
  - Query: listUserFeedbacks
  - Query: getReviewMetrics
  - Mutation: updateUnityAIAssistantLog
  - Mutation: updateUserFeedback
```

#### 4. Amazon S3 (for Amplify Hosting)
**Purpose**: Static asset storage

**Buckets**:
- Amplify hosting bucket (auto-created)
- Build artifacts bucket (optional)

**Configuration**:
```yaml
Bucket:
  Versioning: Enabled
  Encryption: AES256
  PublicAccess: Blocked
  CORS: Configured for CloudFront
```

#### 5. Amazon CloudFront
**Purpose**: CDN for global content delivery

**Configuration**:
```yaml
Distribution:
  Origins:
    - S3 bucket (Amplify) or ALB (EKS)
  DefaultCacheBehavior:
    ViewerProtocolPolicy: redirect-to-https
    AllowedMethods: GET, HEAD, OPTIONS
    CachedMethods: GET, HEAD
    Compress: true
  CustomErrorResponses:
    - ErrorCode: 404
      ResponseCode: 200
      ResponsePagePath: /index.html
  PriceClass: PriceClass_100
  ViewerCertificate:
    ACMCertificateArn: <certificate-arn>
    SSLSupportMethod: sni-only
```


---

## Deployment Option 1: AWS Amplify Hosting

### Overview
AWS Amplify provides a fully managed CI/CD and hosting solution for modern web applications.

### Step 1: Create Amplify App

```bash
# Using AWS CLI
aws amplify create-app \
  --name ethosai-review-portal \
  --repository https://github.com/your-org/ethosai-portal \
  --access-token <github-token> \
  --region us-east-1
```

### Step 2: Configure Build Settings

Create `amplify.yml` in repository root (already exists):
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### Step 3: Set Environment Variables

```bash
# Set environment variables in Amplify Console
aws amplify update-app \
  --app-id <app-id> \
  --environment-variables \
    VITE_AWS_REGION=us-east-1 \
    VITE_USER_POOL_ID=<user-pool-id> \
    VITE_USER_POOL_CLIENT_ID=<client-id> \
    VITE_IDENTITY_POOL_ID=<identity-pool-id> \
    VITE_CHATLOG_TABLE=UnityAIAssistantLogs \
    VITE_FEEDBACK_TABLE=userFeedback \
    VITE_EVAL_JOB_TABLE=UnityAIAssistantEvalJob
```

### Step 4: Configure Custom Domain (Optional)

```bash
# Add custom domain
aws amplify create-domain-association \
  --app-id <app-id> \
  --domain-name your-domain.com \
  --sub-domain-settings prefix=www,branchName=main
```

### Step 5: Deploy

```bash
# Trigger deployment
aws amplify start-job \
  --app-id <app-id> \
  --branch-name main \
  --job-type RELEASE
```

### Amplify Hosting Costs (Estimated)
- Build minutes: $0.01 per minute
- Hosting: $0.15 per GB served
- Storage: $0.023 per GB/month
- Estimated monthly cost: $50-200 (depending on traffic)


---

## Deployment Option 2: Amazon EKS

### Overview
Deploy the application as a containerized workload on Amazon EKS for more control and scalability.

### Architecture Components
```
┌─────────────────────────────────────────────────────────┐
│                    Route 53 (DNS)                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Application Load Balancer                   │
│              (AWS ALB Ingress Controller)                │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                    EKS Cluster                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Kubernetes Service                   │   │
│  │              (ClusterIP/LoadBalancer)             │   │
│  └────────────────────┬─────────────────────────────┘   │
│                       │                                  │
│  ┌────────────────────┴─────────────────────────────┐   │
│  │           Deployment (Nginx + React SPA)          │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐        │   │
│  │  │  Pod 1   │  │  Pod 2   │  │  Pod 3   │        │   │
│  │  │  Nginx   │  │  Nginx   │  │  Nginx   │        │   │
│  │  │  + SPA   │  │  + SPA   │  │  + SPA   │        │   │
│  │  └──────────┘  └──────────┘  └──────────┘        │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Step 1: Create EKS Cluster

```bash
# Create EKS cluster using eksctl
eksctl create cluster \
  --name ethosai-cluster \
  --region us-east-1 \
  --nodegroup-name standard-workers \
  --node-type t3.medium \
  --nodes 3 \
  --nodes-min 2 \
  --nodes-max 5 \
  --managed \
  --version 1.28
```

Or using CloudFormation/Terraform:
```yaml
# eks-cluster.yaml
apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig

metadata:
  name: ethosai-cluster
  region: us-east-1
  version: "1.28"

managedNodeGroups:
  - name: standard-workers
    instanceType: t3.medium
    minSize: 2
    maxSize: 5
    desiredCapacity: 3
    volumeSize: 20
    ssh:
      allow: false
    labels:
      role: worker
    tags:
      Environment: production
      Application: ethosai

iam:
  withOIDC: true
  serviceAccounts:
    - metadata:
        name: aws-load-balancer-controller
        namespace: kube-system
      wellKnownPolicies:
        awsLoadBalancerController: true
```


### Step 2: Create Docker Image

Create `Dockerfile` in repository root:
```dockerfile
# Multi-stage build for optimized image size
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

Create `nginx.conf`:
```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 20M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss 
               application/rss+xml font/truetype font/opentype 
               application/vnd.ms-fontobject image/svg+xml;

    server {
        listen 80;
        server_name _;
        root /usr/share/nginx/html;
        index index.html;

        # Security headers
        add_header X-Frame-Options "DENY" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # SPA routing - serve index.html for all routes
        location / {
            try_files $uri $uri/ /index.html;
            add_header Cache-Control "no-cache, no-store, must-revalidate";
        }

        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

Build and push image:
```bash
# Build image
docker build -t ethosai-portal:latest .

# Tag for ECR
docker tag ethosai-portal:latest \
  <account-id>.dkr.ecr.us-east-1.amazonaws.com/ethosai-portal:latest

# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Push to ECR
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/ethosai-portal:latest
```


### Step 3: Create Kubernetes Manifests

Create `k8s/namespace.yaml`:
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: ethosai
  labels:
    name: ethosai
```

Create `k8s/configmap.yaml`:
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: ethosai-config
  namespace: ethosai
data:
  VITE_AWS_REGION: "us-east-1"
  VITE_CHATLOG_TABLE: "UnityAIAssistantLogs"
  VITE_FEEDBACK_TABLE: "userFeedback"
  VITE_EVAL_JOB_TABLE: "UnityAIAssistantEvalJob"
  VITE_ENV: "production"
```

Create `k8s/secret.yaml`:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: ethosai-secrets
  namespace: ethosai
type: Opaque
stringData:
  VITE_USER_POOL_ID: "<user-pool-id>"
  VITE_USER_POOL_CLIENT_ID: "<client-id>"
  VITE_IDENTITY_POOL_ID: "<identity-pool-id>"
```

Create `k8s/deployment.yaml`:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ethosai-portal
  namespace: ethosai
  labels:
    app: ethosai-portal
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ethosai-portal
  template:
    metadata:
      labels:
        app: ethosai-portal
    spec:
      serviceAccountName: ethosai-sa
      containers:
      - name: ethosai-portal
        image: <account-id>.dkr.ecr.us-east-1.amazonaws.com/ethosai-portal:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 80
          protocol: TCP
        envFrom:
        - configMapRef:
            name: ethosai-config
        - secretRef:
            name: ethosai-secrets
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - ethosai-portal
              topologyKey: kubernetes.io/hostname
```

Create `k8s/service.yaml`:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: ethosai-portal-service
  namespace: ethosai
  labels:
    app: ethosai-portal
spec:
  type: ClusterIP
  selector:
    app: ethosai-portal
  ports:
  - port: 80
    targetPort: 80
    protocol: TCP
    name: http
```


Create `k8s/ingress.yaml`:
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ethosai-portal-ingress
  namespace: ethosai
  annotations:
    kubernetes.io/ingress.class: alb
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/certificate-arn: <certificate-arn>
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTP": 80}, {"HTTPS": 443}]'
    alb.ingress.kubernetes.io/ssl-redirect: '443'
    alb.ingress.kubernetes.io/healthcheck-path: /health
    alb.ingress.kubernetes.io/healthcheck-interval-seconds: '30'
    alb.ingress.kubernetes.io/healthcheck-timeout-seconds: '5'
    alb.ingress.kubernetes.io/healthy-threshold-count: '2'
    alb.ingress.kubernetes.io/unhealthy-threshold-count: '3'
spec:
  rules:
  - host: ethosai.your-domain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: ethosai-portal-service
            port:
              number: 80
```

Create `k8s/hpa.yaml` (Horizontal Pod Autoscaler):
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ethosai-portal-hpa
  namespace: ethosai
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ethosai-portal
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 30
      - type: Pods
        value: 2
        periodSeconds: 30
      selectPolicy: Max
```

### Step 4: Install AWS Load Balancer Controller

```bash
# Add EKS Helm repo
helm repo add eks https://aws.github.io/eks-charts
helm repo update

# Install AWS Load Balancer Controller
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=ethosai-cluster \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller
```

### Step 5: Deploy Application

```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml

# Verify deployment
kubectl get pods -n ethosai
kubectl get svc -n ethosai
kubectl get ingress -n ethosai
```

### EKS Costs (Estimated)
- EKS Control Plane: $0.10/hour = $73/month
- EC2 Nodes (3x t3.medium): ~$90/month
- ALB: ~$20/month
- Data Transfer: Variable
- Total estimated: $180-250/month


---

## IAM Roles and Permissions

### 1. Cognito Identity Pool Authenticated Role

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:BatchGetItem"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-east-1:ACCOUNT_ID:table/UnityAIAssistantLogs",
        "arn:aws:dynamodb:us-east-1:ACCOUNT_ID:table/UnityAIAssistantLogs/index/*",
        "arn:aws:dynamodb:us-east-1:ACCOUNT_ID:table/userFeedback",
        "arn:aws:dynamodb:us-east-1:ACCOUNT_ID:table/userFeedback/index/*",
        "arn:aws:dynamodb:us-east-1:ACCOUNT_ID:table/UnityAIAssistantEvalJob",
        "arn:aws:dynamodb:us-east-1:ACCOUNT_ID:table/UnityAIAssistantEvalJob/index/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "appsync:GraphQL"
      ],
      "Resource": [
        "arn:aws:appsync:us-east-1:ACCOUNT_ID:apis/*/types/Query/*",
        "arn:aws:appsync:us-east-1:ACCOUNT_ID:apis/*/types/Mutation/*"
      ]
    }
  ]
}
```

### 2. EKS Node IAM Role (for EKS deployment)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
```

Attach AWS managed policies:
- `AmazonEKSWorkerNodePolicy`
- `AmazonEKS_CNI_Policy`
- `AmazonEC2ContainerRegistryReadOnly`

### 3. EKS Service Account IAM Role (IRSA)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "elasticloadbalancing:*",
        "ec2:DescribeAccountAttributes",
        "ec2:DescribeAddresses",
        "ec2:DescribeAvailabilityZones",
        "ec2:DescribeInternetGateways",
        "ec2:DescribeVpcs",
        "ec2:DescribeSubnets",
        "ec2:DescribeSecurityGroups",
        "ec2:DescribeInstances",
        "ec2:DescribeNetworkInterfaces",
        "ec2:DescribeTags",
        "ec2:CreateTags",
        "ec2:AuthorizeSecurityGroupIngress",
        "ec2:RevokeSecurityGroupIngress",
        "ec2:CreateSecurityGroup",
        "ec2:DeleteSecurityGroup"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "cognito-idp:DescribeUserPoolClient",
        "acm:ListCertificates",
        "acm:DescribeCertificate",
        "iam:CreateServiceLinkedRole",
        "iam:GetServerCertificate",
        "iam:ListServerCertificates",
        "waf-regional:GetWebACLForResource",
        "waf-regional:GetWebACL",
        "waf-regional:AssociateWebACL",
        "waf-regional:DisassociateWebACL",
        "wafv2:GetWebACL",
        "wafv2:GetWebACLForResource",
        "wafv2:AssociateWebACL",
        "wafv2:DisassociateWebACL",
        "shield:DescribeProtection",
        "shield:GetSubscriptionState",
        "shield:DeleteProtection",
        "shield:CreateProtection",
        "shield:DescribeSubscription",
        "shield:ListProtections"
      ],
      "Resource": "*"
    }
  ]
}
```

### 4. Amplify Service Role

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
```

Attach AWS managed policy:
- `AdministratorAccess-Amplify`


---

## Environment Configuration

### Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `VITE_AWS_REGION` | AWS Region | Yes | `us-east-1` |
| `VITE_USER_POOL_ID` | Cognito User Pool ID | Yes | `us-east-1_ABC123` |
| `VITE_USER_POOL_CLIENT_ID` | Cognito App Client ID | Yes | `1a2b3c4d5e6f7g8h9i0j` |
| `VITE_IDENTITY_POOL_ID` | Cognito Identity Pool ID | Yes | `us-east-1:12345678-1234-1234-1234-123456789012` |
| `VITE_GRAPHQL_ENDPOINT` | AppSync GraphQL Endpoint | No | `https://xxx.appsync-api.us-east-1.amazonaws.com/graphql` |
| `VITE_CHATLOG_TABLE` | DynamoDB Chat Logs Table | Yes | `UnityAIAssistantLogs` |
| `VITE_FEEDBACK_TABLE` | DynamoDB Feedback Table | Yes | `userFeedback` |
| `VITE_EVAL_JOB_TABLE` | DynamoDB Eval Jobs Table | Yes | `UnityAIAssistantEvalJob` |
| `VITE_ENV` | Environment Name | Yes | `production` |
| `VITE_SENTRY_DSN` | Sentry Error Tracking DSN | No | `https://xxx@sentry.io/xxx` |
| `VITE_ENABLE_ERROR_TRACKING` | Enable Sentry | No | `true` |
| `VITE_ENABLE_CLOUDWATCH` | Enable CloudWatch | No | `true` |
| `VITE_APP_NAME` | Application Name | No | `EthosAI` |
| `VITE_APP_VERSION` | Application Version | No | `1.0.0` |

### Creating Environment Files

For Amplify:
```bash
# Set in Amplify Console > App Settings > Environment Variables
```

For EKS:
```bash
# Create from template
cp .env.example .env.production

# Edit values
vim .env.production

# Create Kubernetes secret
kubectl create secret generic ethosai-secrets \
  --from-env-file=.env.production \
  -n ethosai
```

---

## Post-Deployment Steps

### 1. Create Cognito Users

```bash
# Create admin user
aws cognito-idp admin-create-user \
  --user-pool-id <user-pool-id> \
  --username admin@example.com \
  --user-attributes Name=email,Value=admin@example.com \
  --temporary-password "TempPass123!" \
  --message-action SUPPRESS

# Add user to admin group (if groups are configured)
aws cognito-idp admin-add-user-to-group \
  --user-pool-id <user-pool-id> \
  --username admin@example.com \
  --group-name Admins
```

### 2. Verify DynamoDB Tables

```bash
# Check table status
aws dynamodb describe-table \
  --table-name UnityAIAssistantLogs \
  --query 'Table.TableStatus'

# Verify indexes
aws dynamodb describe-table \
  --table-name UnityAIAssistantLogs \
  --query 'Table.GlobalSecondaryIndexes[*].IndexName'
```

### 3. Test Application

```bash
# Get application URL
# For Amplify:
aws amplify get-app --app-id <app-id> --query 'app.defaultDomain'

# For EKS:
kubectl get ingress -n ethosai -o jsonpath='{.items[0].status.loadBalancer.ingress[0].hostname}'

# Test health endpoint
curl https://your-domain.com/health

# Test authentication flow
# 1. Navigate to application URL
# 2. Sign in with test user
# 3. Verify dashboard loads
# 4. Check browser console for errors
```

### 4. Configure Monitoring

```bash
# Enable CloudWatch Container Insights (EKS)
aws eks update-cluster-config \
  --name ethosai-cluster \
  --logging '{"clusterLogging":[{"types":["api","audit","authenticator","controllerManager","scheduler"],"enabled":true}]}'

# Create CloudWatch dashboard
aws cloudwatch put-dashboard \
  --dashboard-name EthosAI-Portal \
  --dashboard-body file://cloudwatch-dashboard.json
```

### 5. Set Up Alerts

```bash
# Create SNS topic for alerts
aws sns create-topic --name ethosai-alerts

# Subscribe email to topic
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:ACCOUNT_ID:ethosai-alerts \
  --protocol email \
  --notification-endpoint devops@example.com

# Create CloudWatch alarms
aws cloudwatch put-metric-alarm \
  --alarm-name ethosai-high-error-rate \
  --alarm-description "Alert when error rate exceeds threshold" \
  --metric-name Errors \
  --namespace AWS/ApplicationELB \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --alarm-actions arn:aws:sns:us-east-1:ACCOUNT_ID:ethosai-alerts
```


---

## Monitoring and Logging

### CloudWatch Logs

**Log Groups**:
- `/aws/amplify/<app-id>` (Amplify builds)
- `/aws/eks/ethosai-cluster/cluster` (EKS control plane)
- `/aws/containerinsights/ethosai-cluster/application` (Container logs)
- `/aws/lambda/get-review-metrics` (Lambda functions)

**Log Retention**: Set to 30 days for cost optimization

### CloudWatch Metrics

**Key Metrics to Monitor**:

1. **Application Metrics**:
   - Request count
   - Error rate (4xx, 5xx)
   - Response time (p50, p95, p99)
   - Active connections

2. **Infrastructure Metrics** (EKS):
   - CPU utilization
   - Memory utilization
   - Pod count
   - Node count
   - Disk usage

3. **DynamoDB Metrics**:
   - Read/Write capacity units
   - Throttled requests
   - System errors
   - User errors

### Application Performance Monitoring (APM)

**Sentry Integration** (Optional):
```javascript
// Already configured in src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_ENV,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

### Logging Best Practices

1. **Structured Logging**: Use JSON format
2. **Log Levels**: ERROR, WARN, INFO, DEBUG
3. **Correlation IDs**: Track requests across services
4. **PII Redaction**: Remove sensitive data
5. **Log Sampling**: Sample high-volume logs

---

## Troubleshooting

### Common Issues

#### 1. Authentication Failures

**Symptom**: Users cannot sign in

**Checks**:
```bash
# Verify Cognito User Pool
aws cognito-idp describe-user-pool --user-pool-id <pool-id>

# Check user status
aws cognito-idp admin-get-user \
  --user-pool-id <pool-id> \
  --username user@example.com

# Verify app client settings
aws cognito-idp describe-user-pool-client \
  --user-pool-id <pool-id> \
  --client-id <client-id>
```

**Solutions**:
- Verify callback URLs match application URL
- Check OAuth flow configuration
- Ensure Identity Pool has correct User Pool mapping
- Verify IAM roles are attached to Identity Pool

#### 2. DynamoDB Access Denied

**Symptom**: "AccessDeniedException" in browser console

**Checks**:
```bash
# Verify IAM role permissions
aws iam get-role-policy \
  --role-name Cognito_IdentityPoolAuth_Role \
  --policy-name DynamoDBAccess

# Test DynamoDB access
aws dynamodb scan \
  --table-name UnityAIAssistantLogs \
  --limit 1
```

**Solutions**:
- Add DynamoDB permissions to Cognito authenticated role
- Verify table names match environment variables
- Check table exists in correct region
- Ensure Identity Pool role trust policy is correct

#### 3. Build Failures (Amplify)

**Symptom**: Build fails in Amplify Console

**Checks**:
```bash
# View build logs
aws amplify get-job \
  --app-id <app-id> \
  --branch-name main \
  --job-id <job-id>
```

**Solutions**:
- Verify Node.js version in build settings
- Check environment variables are set
- Ensure package-lock.json is committed
- Review build logs for specific errors

#### 4. Pod Crashes (EKS)

**Symptom**: Pods in CrashLoopBackOff state

**Checks**:
```bash
# Check pod status
kubectl get pods -n ethosai

# View pod logs
kubectl logs -n ethosai <pod-name>

# Describe pod for events
kubectl describe pod -n ethosai <pod-name>

# Check resource usage
kubectl top pods -n ethosai
```

**Solutions**:
- Increase memory/CPU limits
- Fix application errors in logs
- Verify environment variables
- Check image pull permissions

#### 5. High Latency

**Symptom**: Slow page loads

**Checks**:
```bash
# Check CloudFront cache hit ratio
aws cloudwatch get-metric-statistics \
  --namespace AWS/CloudFront \
  --metric-name CacheHitRate \
  --dimensions Name=DistributionId,Value=<dist-id> \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-02T00:00:00Z \
  --period 3600 \
  --statistics Average

# Check DynamoDB throttling
aws cloudwatch get-metric-statistics \
  --namespace AWS/DynamoDB \
  --metric-name UserErrors \
  --dimensions Name=TableName,Value=UnityAIAssistantLogs \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-02T00:00:00Z \
  --period 300 \
  --statistics Sum
```

**Solutions**:
- Enable CloudFront caching
- Increase DynamoDB capacity
- Optimize queries (use indexes)
- Enable compression
- Implement pagination


---

## Security Checklist

### Pre-Deployment Security

- [ ] Enable MFA for AWS root account
- [ ] Use IAM roles instead of access keys
- [ ] Enable CloudTrail logging
- [ ] Configure AWS Config rules
- [ ] Set up AWS GuardDuty
- [ ] Enable VPC Flow Logs (for EKS)
- [ ] Configure AWS WAF rules
- [ ] Set up AWS Shield Standard (free)

### Application Security

- [ ] Enable HTTPS only (redirect HTTP to HTTPS)
- [ ] Configure security headers (CSP, HSTS, X-Frame-Options)
- [ ] Implement rate limiting
- [ ] Enable CORS with specific origins
- [ ] Sanitize user inputs
- [ ] Implement proper error handling (no stack traces in production)
- [ ] Use environment variables for secrets
- [ ] Enable audit logging for data changes

### Cognito Security

- [ ] Enable MFA for users
- [ ] Configure strong password policy
- [ ] Set up account recovery
- [ ] Enable advanced security features
- [ ] Configure user pool domain with custom domain
- [ ] Set token expiration appropriately
- [ ] Enable user pool analytics

### DynamoDB Security

- [ ] Enable encryption at rest
- [ ] Enable point-in-time recovery
- [ ] Configure backup retention
- [ ] Use IAM policies for access control
- [ ] Enable DynamoDB Streams encryption
- [ ] Set up CloudWatch alarms for unusual activity
- [ ] Implement least privilege access

### Network Security (EKS)

- [ ] Use private subnets for worker nodes
- [ ] Configure security groups with minimal access
- [ ] Enable VPC endpoints for AWS services
- [ ] Use Network Policies for pod-to-pod communication
- [ ] Configure ALB with WAF
- [ ] Enable ALB access logs
- [ ] Use TLS 1.2+ only

---

## Cost Optimization

### Amplify Hosting

**Optimization Strategies**:
1. Enable build caching
2. Use incremental builds
3. Optimize asset sizes (images, bundles)
4. Configure CloudFront caching
5. Use on-demand pricing for low traffic

**Estimated Monthly Costs**:
- Low traffic (< 10GB): $15-30
- Medium traffic (10-50GB): $50-100
- High traffic (50-200GB): $100-300

### EKS Deployment

**Optimization Strategies**:
1. Use Spot Instances for worker nodes (70% savings)
2. Right-size node instances
3. Enable Cluster Autoscaler
4. Use Horizontal Pod Autoscaler
5. Implement pod disruption budgets
6. Use Fargate for burst workloads
7. Enable Container Insights selectively

**Estimated Monthly Costs**:
- Small (2 nodes): $150-200
- Medium (3-5 nodes): $250-400
- Large (5-10 nodes): $400-800

### DynamoDB

**Optimization Strategies**:
1. Use on-demand pricing for unpredictable workloads
2. Use provisioned capacity with auto-scaling for predictable workloads
3. Enable DynamoDB Accelerator (DAX) for read-heavy workloads
4. Implement efficient query patterns
5. Use sparse indexes
6. Archive old data to S3

**Estimated Monthly Costs**:
- On-demand (low traffic): $10-50
- Provisioned (medium traffic): $50-200
- With DAX: +$100-300

### General AWS Costs

**Optimization Strategies**:
1. Use AWS Cost Explorer
2. Set up billing alerts
3. Tag all resources
4. Use AWS Budgets
5. Review and delete unused resources
6. Use Reserved Instances for predictable workloads
7. Enable S3 Intelligent-Tiering

---

## Disaster Recovery

### Backup Strategy

**DynamoDB**:
```bash
# Enable point-in-time recovery
aws dynamodb update-continuous-backups \
  --table-name UnityAIAssistantLogs \
  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true

# Create on-demand backup
aws dynamodb create-backup \
  --table-name UnityAIAssistantLogs \
  --backup-name UnityAIAssistantLogs-backup-$(date +%Y%m%d)
```

**Application Code**:
- Store in Git repository
- Use GitHub/GitLab for version control
- Implement branch protection rules
- Tag releases

**Configuration**:
- Store infrastructure as code (CloudFormation/Terraform)
- Version control all configuration files
- Document manual configuration steps

### Recovery Procedures

**RTO (Recovery Time Objective)**: 4 hours
**RPO (Recovery Point Objective)**: 1 hour

**Recovery Steps**:

1. **Amplify Hosting Failure**:
   ```bash
   # Redeploy from Git
   aws amplify start-job \
     --app-id <app-id> \
     --branch-name main \
     --job-type RELEASE
   ```

2. **EKS Cluster Failure**:
   ```bash
   # Restore from backup
   eksctl create cluster -f eks-cluster.yaml
   kubectl apply -f k8s/
   ```

3. **DynamoDB Table Corruption**:
   ```bash
   # Restore from point-in-time
   aws dynamodb restore-table-to-point-in-time \
     --source-table-name UnityAIAssistantLogs \
     --target-table-name UnityAIAssistantLogs-restored \
     --restore-date-time 2024-01-01T12:00:00Z
   ```

4. **Cognito User Pool Deletion**:
   - Recreate User Pool from CloudFormation template
   - Import users from backup (if available)
   - Update application configuration

### Multi-Region Deployment (Optional)

For high availability, deploy to multiple regions:

1. **Primary Region**: us-east-1
2. **Secondary Region**: us-west-2

**Components**:
- Route 53 with health checks and failover routing
- DynamoDB Global Tables
- Cross-region replication for S3
- Multi-region Cognito setup

---

## Compliance and Governance

### Compliance Requirements

**GDPR**:
- Implement data retention policies
- Enable data deletion capabilities
- Provide data export functionality
- Document data processing activities

**HIPAA** (if applicable):
- Enable encryption at rest and in transit
- Implement audit logging
- Use BAA-compliant AWS services
- Restrict data access

**SOC 2**:
- Implement access controls
- Enable monitoring and alerting
- Document security procedures
- Conduct regular security reviews

### Governance

**Tagging Strategy**:
```yaml
Required Tags:
  - Environment: production|staging|development
  - Application: ethosai-portal
  - Owner: team-name
  - CostCenter: cost-center-id
  - Compliance: gdpr|hipaa|sox
```

**Resource Naming Convention**:
```
Format: <app>-<env>-<resource-type>-<name>
Example: ethosai-prod-eks-cluster
```

---

## Support and Maintenance

### Regular Maintenance Tasks

**Daily**:
- Monitor CloudWatch dashboards
- Review error logs
- Check application health

**Weekly**:
- Review security alerts
- Analyze cost reports
- Update dependencies (security patches)
- Review backup status

**Monthly**:
- Conduct security reviews
- Optimize costs
- Update documentation
- Review and rotate credentials
- Test disaster recovery procedures

**Quarterly**:
- Conduct penetration testing
- Review compliance requirements
- Update disaster recovery plan
- Capacity planning review

### Contact Information

**DevOps Team**: devops@example.com
**Security Team**: security@example.com
**On-Call**: +1-XXX-XXX-XXXX

### Additional Resources

- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [EKS Best Practices](https://aws.github.io/aws-eks-best-practices/)
- [DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)
- [Amplify Documentation](https://docs.amplify.aws/)

---

## Appendix

### A. CloudFormation Templates

See `cloudformation/` directory for complete templates:
- `insightsphere-stack.yaml` - Main infrastructure
- `chat-logs-review-stack.yaml` - Review system resources

### B. Terraform Alternative

For teams preferring Terraform, equivalent configurations are available in the `terraform/` directory (to be created).

### C. CI/CD Pipeline

GitHub Actions workflow example:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm test
      - name: Deploy to Amplify
        run: |
          aws amplify start-job \
            --app-id ${{ secrets.AMPLIFY_APP_ID }} \
            --branch-name main \
            --job-type RELEASE
```

### D. Runbook

Quick reference for common operations:
- Deploy new version: See Section 5 or 6
- Rollback deployment: Use Amplify Console or `kubectl rollout undo`
- Scale application: Adjust HPA settings or Amplify instance count
- Update environment variables: Amplify Console or `kubectl edit configmap`
- View logs: CloudWatch Logs or `kubectl logs`

---

**Document Version**: 1.0
**Last Updated**: December 2024
**Maintained By**: DevOps Team
