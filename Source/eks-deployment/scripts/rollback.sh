#!/bin/bash

# EKS Rollback Script for Swbc.Ethos.Ai Application
set -e

NAMESPACE="swbc-ethos-ai"
DEPLOYMENT_NAME="ethos-ai-frontend"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Show rollout history
show_history() {
    log_info "Showing rollout history for $DEPLOYMENT_NAME..."
    kubectl rollout history deployment/$DEPLOYMENT_NAME -n $NAMESPACE
}

# Rollback to previous version
rollback_previous() {
    log_info "Rolling back to previous version..."
    kubectl rollout undo deployment/$DEPLOYMENT_NAME -n $NAMESPACE
    
    log_info "Waiting for rollback to complete..."
    kubectl rollout status deployment/$DEPLOYMENT_NAME -n $NAMESPACE
    
    log_success "Rollback completed successfully"
}

# Rollback to specific revision
rollback_to_revision() {
    local revision=$1
    
    if [ -z "$revision" ]; then
        log_error "Revision number is required"
        exit 1
    fi
    
    log_info "Rolling back to revision $revision..."
    kubectl rollout undo deployment/$DEPLOYMENT_NAME --to-revision=$revision -n $NAMESPACE
    
    log_info "Waiting for rollback to complete..."
    kubectl rollout status deployment/$DEPLOYMENT_NAME -n $NAMESPACE
    
    log_success "Rollback to revision $revision completed successfully"
}

# Get current status
get_status() {
    log_info "Current deployment status:"
    kubectl get deployment $DEPLOYMENT_NAME -n $NAMESPACE
    
    echo ""
    log_info "Current pods:"
    kubectl get pods -l app=ethos-ai-frontend -n $NAMESPACE
    
    echo ""
    log_info "Recent events:"
    kubectl get events -n $NAMESPACE --sort-by='.lastTimestamp' | tail -10
}

# Main function
main() {
    case "${1:-help}" in
        "history")
            show_history
            ;;
        "previous")
            rollback_previous
            ;;
        "revision")
            rollback_to_revision $2
            ;;
        "status")
            get_status
            ;;
        "help")
            echo "EKS Rollback Script"
            echo "==================="
            echo ""
            echo "Usage: $0 [command] [options]"
            echo ""
            echo "Commands:"
            echo "  history           - Show rollout history"
            echo "  previous          - Rollback to previous version"
            echo "  revision <num>    - Rollback to specific revision"
            echo "  status            - Show current deployment status"
            echo "  help              - Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 history"
            echo "  $0 previous"
            echo "  $0 revision 3"
            ;;
        *)
            log_error "Unknown command: $1"
            echo "Use '$0 help' for usage information"
            exit 1
            ;;
    esac
}

main "$@"