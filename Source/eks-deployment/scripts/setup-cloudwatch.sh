#!/bin/bash

# CloudWatch Setup Script for EKS
# This script sets up CloudWatch Container Insights and monitoring for the Swbc.Ethos.Ai application

set -e

# Configuration
CLUSTER_NAME="swbc-ethos-ai-cluster"
REGION="us-east-1"
NAMESPACE="swbc-ethos-ai"

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
    
    # Check if kubectl is installed
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed. Please install kubectl first."
        exit 1
    fi
    
    # Check if AWS CLI is installed
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI is not installed. Please install AWS CLI first."
        exit 1
    fi
    
    # Check if cluster exists
    if ! aws eks describe-cluster --name $CLUSTER_NAME --region $REGION &> /dev/null; then
        log_error "EKS cluster '$CLUSTER_NAME' not found in region '$REGION'"
        exit 1
    fi
    
    # Check kubectl context
    if ! kubectl cluster-info &> /dev/null; then
        log_error "kubectl is not configured or cluster is not accessible"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Get AWS account ID and OIDC provider
get_aws_info() {
    log_info "Getting AWS account information..."
    
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    if [ -z "$ACCOUNT_ID" ]; then
        log_error "Failed to get AWS account ID"
        exit 1
    fi
    
    OIDC_ISSUER=$(aws eks describe-cluster --name $CLUSTER_NAME --region $REGION --query "cluster.identity.oidc.issuer" --output text)
    OIDC_ID=$(echo $OIDC_ISSUER | cut -d '/' -f 5)
    
    if [ -z "$OIDC_ID" ]; then
        log_error "Failed to get OIDC provider ID"
        exit 1
    fi
    
    log_success "AWS Account ID: $ACCOUNT_ID"
    log_success "OIDC Provider ID: $OIDC_ID"
}

# Create IAM roles for CloudWatch
create_iam_roles() {
    log_info "Creating IAM roles for CloudWatch..."
    
    # CloudWatch Agent Server Role
    log_info "Creating CloudWatchAgentServerRole..."
    
    cat > /tmp/cloudwatch-agent-trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    },
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::${ACCOUNT_ID}:oidc-provider/oidc.eks.${REGION}.amazonaws.com/id/${OIDC_ID}"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "oidc.eks.${REGION}.amazonaws.com/id/${OIDC_ID}:sub": "system:serviceaccount:amazon-cloudwatch:cloudwatch-agent"
        }
      }
    }
  ]
}
EOF
    
    if aws iam get-role --role-name CloudWatchAgentServerRole &> /dev/null; then
        log_warning "CloudWatchAgentServerRole already exists, skipping creation"
    else
        aws iam create-role \
            --role-name CloudWatchAgentServerRole \
            --assume-role-policy-document file:///tmp/cloudwatch-agent-trust-policy.json
        
        aws iam attach-role-policy \
            --role-name CloudWatchAgentServerRole \
            --policy-arn arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy
        
        log_success "CloudWatchAgentServerRole created"
    fi
    
    # CloudWatch Setup Role
    log_info "Creating CloudWatchSetupRole..."
    
    cat > /tmp/cloudwatch-setup-trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::${ACCOUNT_ID}:oidc-provider/oidc.eks.${REGION}.amazonaws.com/id/${OIDC_ID}"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "oidc.eks.${REGION}.amazonaws.com/id/${OIDC_ID}:sub": "system:serviceaccount:${NAMESPACE}:cloudwatch-setup"
        }
      }
    }
  ]
}
EOF
    
    if aws iam get-role --role-name CloudWatchSetupRole &> /dev/null; then
        log_warning "CloudWatchSetupRole already exists, skipping creation"
    else
        aws iam create-role \
            --role-name CloudWatchSetupRole \
            --assume-role-policy-document file:///tmp/cloudwatch-setup-trust-policy.json
        
        aws iam attach-role-policy \
            --role-name CloudWatchSetupRole \
            --policy-arn arn:aws:iam::aws:policy/CloudWatchFullAccess
        
        log_success "CloudWatchSetupRole created"
    fi
    
    # Clean up temporary files
    rm -f /tmp/cloudwatch-agent-trust-policy.json /tmp/cloudwatch-setup-trust-policy.json
}

# Update configuration files with actual values
update_config_files() {
    log_info "Updating configuration files with actual values..."
    
    # Create temporary directory for updated configs
    TEMP_DIR="/tmp/cloudwatch-configs"
    mkdir -p $TEMP_DIR
    
    # Copy and update cloudwatch-config.yaml
    cp eks-deployment/monitoring/cloudwatch-config.yaml $TEMP_DIR/
    sed -i "s/ACCOUNT_ID/$ACCOUNT_ID/g" $TEMP_DIR/cloudwatch-config.yaml
    sed -i "s/OIDC_ID/$OIDC_ID/g" $TEMP_DIR/cloudwatch-config.yaml
    
    # Copy and update cloudwatch-alarms.yaml
    cp eks-deployment/monitoring/cloudwatch-alarms.yaml $TEMP_DIR/
    sed -i "s/ACCOUNT_ID/$ACCOUNT_ID/g" $TEMP_DIR/cloudwatch-alarms.yaml
    sed -i "s/OIDC_ID/$OIDC_ID/g" $TEMP_DIR/cloudwatch-alarms.yaml
    
    log_success "Configuration files updated in $TEMP_DIR"
}

# Enable Container Insights
enable_container_insights() {
    log_info "Enabling Container Insights for cluster..."
    
    aws eks update-cluster-config \
        --region $REGION \
        --name $CLUSTER_NAME \
        --logging '{"enable":["api","audit","authenticator","controllerManager","scheduler"]}'
    
    log_success "Container Insights enabled"
}

# Deploy CloudWatch agent
deploy_cloudwatch_agent() {
    log_info "Deploying CloudWatch agent..."
    
    kubectl apply -f $TEMP_DIR/cloudwatch-config.yaml
    
    log_info "Waiting for CloudWatch agent to be ready..."
    kubectl wait --for=condition=ready pod -l name=cloudwatch-agent -n amazon-cloudwatch --timeout=300s
    
    log_success "CloudWatch agent deployed and ready"
}

# Set up CloudWatch alarms
setup_alarms() {
    log_info "Setting up CloudWatch alarms..."
    
    # Create SNS topic if it doesn't exist
    if ! aws sns get-topic-attributes --topic-arn "arn:aws:sns:${REGION}:${ACCOUNT_ID}:swbc-ethos-ai-alerts" &> /dev/null; then
        log_info "Creating SNS topic for alerts..."
        aws sns create-topic --name swbc-ethos-ai-alerts --region $REGION
        log_success "SNS topic created: arn:aws:sns:${REGION}:${ACCOUNT_ID}:swbc-ethos-ai-alerts"
        log_warning "Don't forget to subscribe to the SNS topic for email notifications!"
    fi
    
    kubectl apply -f $TEMP_DIR/cloudwatch-alarms.yaml
    
    log_success "CloudWatch alarms configured"
}

# Create CloudWatch dashboard
create_dashboard() {
    log_info "Creating CloudWatch dashboard..."
    
    # Update dashboard JSON with actual values
    cp eks-deployment/monitoring/cloudwatch-dashboard.json $TEMP_DIR/
    sed -i "s/LOAD_BALANCER_ID/$(get_load_balancer_id)/g" $TEMP_DIR/cloudwatch-dashboard.json
    
    aws cloudwatch put-dashboard \
        --dashboard-name "Swbc-Ethos-AI-EKS-Dashboard" \
        --dashboard-body file://$TEMP_DIR/cloudwatch-dashboard.json \
        --region $REGION
    
    log_success "CloudWatch dashboard created: Swbc-Ethos-AI-EKS-Dashboard"
}

# Get load balancer ID (helper function)
get_load_balancer_id() {
    # This is a placeholder - in practice, you'd get this from your ALB
    echo "placeholder-load-balancer-id"
}

# Verify setup
verify_setup() {
    log_info "Verifying CloudWatch setup..."
    
    # Check CloudWatch agent pods
    if kubectl get pods -n amazon-cloudwatch -l name=cloudwatch-agent | grep -q Running; then
        log_success "CloudWatch agent pods are running"
    else
        log_error "CloudWatch agent pods are not running properly"
        return 1
    fi
    
    # Check if metrics are being collected
    log_info "Checking if metrics are being collected (this may take a few minutes)..."
    sleep 30
    
    if aws cloudwatch list-metrics --namespace ContainerInsights --region $REGION | grep -q "MetricName"; then
        log_success "CloudWatch metrics are being collected"
    else
        log_warning "CloudWatch metrics not yet available (may take up to 5 minutes)"
    fi
    
    log_success "CloudWatch setup verification completed"
}

# Cleanup function
cleanup() {
    log_info "Cleaning up temporary files..."
    rm -rf $TEMP_DIR
}

# Main function
main() {
    echo "========================================"
    echo "CloudWatch Setup for Swbc.Ethos.Ai EKS"
    echo "========================================"
    echo ""
    
    check_prerequisites
    get_aws_info
    create_iam_roles
    update_config_files
    enable_container_insights
    deploy_cloudwatch_agent
    setup_alarms
    create_dashboard
    verify_setup
    cleanup
    
    echo ""
    log_success "CloudWatch setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Subscribe to SNS topic: arn:aws:sns:${REGION}:${ACCOUNT_ID}:swbc-ethos-ai-alerts"
    echo "2. View dashboard: https://console.aws.amazon.com/cloudwatch/home?region=${REGION}#dashboards:name=Swbc-Ethos-AI-EKS-Dashboard"
    echo "3. Check alarms: https://console.aws.amazon.com/cloudwatch/home?region=${REGION}#alarmsV2:"
    echo "4. View logs: https://console.aws.amazon.com/cloudwatch/home?region=${REGION}#logsV2:log-groups"
}

# Handle script arguments
case "${1:-setup}" in
    "setup")
        main
        ;;
    "verify")
        check_prerequisites
        verify_setup
        ;;
    "cleanup")
        cleanup
        ;;
    "help")
        echo "Usage: $0 [setup|verify|cleanup|help]"
        echo ""
        echo "Commands:"
        echo "  setup   - Set up CloudWatch monitoring (default)"
        echo "  verify  - Verify CloudWatch setup"
        echo "  cleanup - Clean up temporary files"
        echo "  help    - Show this help message"
        ;;
    *)
        log_error "Unknown command: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac