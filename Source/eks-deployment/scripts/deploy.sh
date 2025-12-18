#!/bin/bash

# EKS Deployment Script for Swbc.Ethos.Ai Application
set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Configuration
CLUSTER_NAME="swbc-ethos-ai-cluster"
REGION="us-east-1"
NAMESPACE="swbc-ethos-ai"
ECR_REPOSITORY="swbc-ethos-ai"
IMAGE_TAG="${IMAGE_TAG:-latest}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if required tools are installed
    local tools=("kubectl" "aws" "docker" "eksctl")
    for tool in "${tools[@]}"; do
        if ! command -v $tool &> /dev/null; then
            log_error "$tool is not installed or not in PATH"
            exit 1
        fi
    done
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "AWS credentials not configured"
        exit 1
    fi
    
    log_success "All prerequisites met"
}

# Get AWS account ID
get_account_id() {
    aws sts get-caller-identity --query Account --output text
}

# Create EKS cluster if it doesn't exist
create_cluster() {
    log_info "Checking if EKS cluster exists..."
    
    if aws eks describe-cluster --name $CLUSTER_NAME --region $REGION &> /dev/null; then
        log_success "EKS cluster $CLUSTER_NAME already exists"
    else
        log_info "Creating EKS cluster $CLUSTER_NAME..."
        eksctl create cluster -f "$SCRIPT_DIR/../infrastructure/eks-cluster.yaml"
        log_success "EKS cluster created successfully"
    fi
    
    # Update kubeconfig
    aws eks update-kubeconfig --region $REGION --name $CLUSTER_NAME
    log_success "Kubeconfig updated"
}

# Install AWS Load Balancer Controller
install_load_balancer_controller() {
    log_info "Installing AWS Load Balancer Controller..."
    
    # Check if already installed
    if kubectl get deployment -n kube-system aws-load-balancer-controller &> /dev/null; then
        log_success "AWS Load Balancer Controller already installed"
        return
    fi
    
    # Install using Helm
    helm repo add eks https://aws.github.io/eks-charts
    helm repo update
    
    ACCOUNT_ID=$(get_account_id)
    
    helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
        -n kube-system \
        --set clusterName=$CLUSTER_NAME \
        --set serviceAccount.create=false \
        --set serviceAccount.name=aws-load-balancer-controller \
        --set region=$REGION \
        --set vpcId=$(aws eks describe-cluster --name $CLUSTER_NAME --query "cluster.resourcesVpcConfig.vpcId" --output text)
    
    log_success "AWS Load Balancer Controller installed"
}

# Build and push Docker image
build_and_push_image() {
    log_info "Building and pushing Docker image..."
    
    ACCOUNT_ID=$(get_account_id)
    ECR_URI="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPOSITORY"
    
    # Create ECR repository if it doesn't exist
    if ! aws ecr describe-repositories --repository-names $ECR_REPOSITORY --region $REGION &> /dev/null; then
        log_info "Creating ECR repository..."
        aws ecr create-repository --repository-name $ECR_REPOSITORY --region $REGION
        log_success "ECR repository created"
    fi
    
    # Login to ECR
    aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR_URI
    
    # Build image from project root
    log_info "Building Docker image..."
    cd "$PROJECT_ROOT"
    docker build -f eks-deployment/docker/Dockerfile -t $ECR_REPOSITORY:$IMAGE_TAG .
    
    # Tag and push image
    docker tag $ECR_REPOSITORY:$IMAGE_TAG $ECR_URI:$IMAGE_TAG
    docker push $ECR_URI:$IMAGE_TAG
    
    log_success "Docker image pushed to ECR: $ECR_URI:$IMAGE_TAG"
}

# Check and create DynamoDB tables
setup_dynamodb_tables() {
    log_info "Setting up DynamoDB tables..."
    
    # Install dependencies if needed
    cd "$PROJECT_ROOT"
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    
    # Run DynamoDB table setup script
    node eks-deployment/scripts/setup-dynamodb.js
    
    log_success "DynamoDB tables setup completed"
}

# Deploy Kubernetes manifests
deploy_manifests() {
    log_info "Deploying Kubernetes manifests..."
    
    ACCOUNT_ID=$(get_account_id)
    
    # Create namespace
    kubectl apply -f "$SCRIPT_DIR/../kubernetes/namespace.yaml"
    
    # Apply ConfigMap and Secret
    kubectl apply -f "$SCRIPT_DIR/../kubernetes/configmap.yaml"
    kubectl apply -f "$SCRIPT_DIR/../kubernetes/secret.yaml"
    
    # Update deployment with correct image URI
    sed "s|ACCOUNT_ID|$ACCOUNT_ID|g" "$SCRIPT_DIR/../kubernetes/deployment.yaml" | kubectl apply -f -
    
    # Apply service
    kubectl apply -f "$SCRIPT_DIR/../kubernetes/service.yaml"
    
    # Update and apply ingress (you'll need to update certificate ARN and security groups)
    log_warning "Please update the ingress.yaml file with your certificate ARN and security groups before applying"
    # kubectl apply -f "$SCRIPT_DIR/../kubernetes/ingress.yaml"
    
    log_success "Kubernetes manifests deployed"
}

# Wait for deployment to be ready
wait_for_deployment() {
    log_info "Waiting for deployment to be ready..."
    
    kubectl wait --for=condition=available --timeout=300s deployment/ethos-ai-frontend -n $NAMESPACE
    
    log_success "Deployment is ready"
}

# Get deployment status
get_status() {
    log_info "Getting deployment status..."
    
    echo ""
    echo "Pods:"
    kubectl get pods -n $NAMESPACE
    
    echo ""
    echo "Services:"
    kubectl get services -n $NAMESPACE
    
    echo ""
    echo "Ingress:"
    kubectl get ingress -n $NAMESPACE
}

# Main deployment function
main() {
    echo "========================================"
    echo "EKS Deployment for Swbc.Ethos.Ai"
    echo "========================================"
    echo ""
    
    check_prerequisites
    create_cluster
    install_load_balancer_controller
    setup_dynamodb_tables
    build_and_push_image
    deploy_manifests
    wait_for_deployment
    get_status
    
    echo ""
    log_success "Deployment completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Update ingress.yaml with your certificate ARN and security groups"
    echo "2. Apply the ingress: kubectl apply -f eks-deployment/kubernetes/ingress.yaml"
    echo "3. Configure DNS to point to the ALB"
    echo "4. Test the application"
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "build")
        check_prerequisites
        build_and_push_image
        ;;
    "tables")
        setup_dynamodb_tables
        ;;
    "status")
        get_status
        ;;
    "help")
        echo "Usage: $0 [deploy|build|tables|status|help]"
        echo ""
        echo "Commands:"
        echo "  deploy  - Full deployment (default)"
        echo "  build   - Build and push Docker image only"
        echo "  tables  - Setup DynamoDB tables only"
        echo "  status  - Show deployment status"
        echo "  help    - Show this help message"
        ;;
    *)
        log_error "Unknown command: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac