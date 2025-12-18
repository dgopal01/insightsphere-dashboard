# EKS Deployment Maintenance Guide

This guide covers regular maintenance procedures, updates, and best practices for the EKS deployment of the Swbc.Ethos.Ai application.

## Regular Maintenance Schedule

### Daily Tasks
- [ ] Monitor application health and performance
- [ ] Check pod status and resource usage
- [ ] Review application logs for errors
- [ ] Verify backup completion
- [ ] Monitor security alerts

### Weekly Tasks
- [ ] Review resource utilization trends
- [ ] Check for security updates
- [ ] Validate monitoring and alerting
- [ ] Review access logs
- [ ] Update documentation

### Monthly Tasks
- [ ] Update cluster components
- [ ] Review and rotate secrets
- [ ] Conduct security scans
- [ ] Review cost optimization
- [ ] Test disaster recovery procedures

### Quarterly Tasks
- [ ] Major version updates
- [ ] Security audit
- [ ] Performance optimization review
- [ ] Capacity planning
- [ ] Team training updates

## Cluster Maintenance

### EKS Cluster Updates

#### Check Current Version
```bash
# Check cluster version
aws eks describe-cluster --name swbc-ethos-ai-cluster --query "cluster.version"

# Check available updates
aws eks describe-update --name swbc-ethos-ai-cluster --update-id <update-id>
```

#### Update Cluster
```bash
# Start cluster update
aws eks update-cluster-version \
  --name swbc-ethos-ai-cluster \
  --kubernetes-version 1.29

# Monitor update progress
aws eks describe-update \
  --name swbc-ethos-ai-cluster \
  --update-id <update-id>
```

#### Update Node Groups
```bash
# Update node group
aws eks update-nodegroup-version \
  --cluster-name swbc-ethos-ai-cluster \
  --nodegroup-name worker-nodes \
  --kubernetes-version 1.29

# Check node group status
aws eks describe-nodegroup \
  --cluster-name swbc-ethos-ai-cluster \
  --nodegroup-name worker-nodes
```

### Add-on Updates
```bash
# List add-ons
aws eks list-addons --cluster-name swbc-ethos-ai-cluster

# Update VPC CNI
aws eks update-addon \
  --cluster-name swbc-ethos-ai-cluster \
  --addon-name vpc-cni \
  --addon-version v1.15.1-eksbuild.1

# Update CoreDNS
aws eks update-addon \
  --cluster-name swbc-ethos-ai-cluster \
  --addon-name coredns \
  --addon-version v1.10.1-eksbuild.5
```

## Application Maintenance

### Image Updates

#### Build New Image
```bash
# Build new image
cd Swbc.Ethos.Ai/Source
docker build -f eks-deployment/docker/Dockerfile -t swbc-ethos-ai:v1.2.0 .

# Tag and push
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
docker tag swbc-ethos-ai:v1.2.0 $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/swbc-ethos-ai:v1.2.0
docker push $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/swbc-ethos-ai:v1.2.0
```

#### Update Deployment
```bash
# Update deployment image
kubectl set image deployment/ethos-ai-frontend \
  frontend=$ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/swbc-ethos-ai:v1.2.0 \
  -n swbc-ethos-ai

# Monitor rollout
kubectl rollout status deployment/ethos-ai-frontend -n swbc-ethos-ai

# Verify update
kubectl get pods -n swbc-ethos-ai -o wide
```

### Configuration Updates

#### Update ConfigMap
```bash
# Edit ConfigMap
kubectl edit configmap ethos-ai-config -n swbc-ethos-ai

# Restart deployment to pick up changes
kubectl rollout restart deployment/ethos-ai-frontend -n swbc-ethos-ai
```

#### Update Secrets
```bash
# Update secret
kubectl create secret generic ethos-ai-secrets \
  --from-literal=VITE_USER_POOL_ID=new-value \
  --dry-run=client -o yaml | kubectl apply -f -

# Restart deployment
kubectl rollout restart deployment/ethos-ai-frontend -n swbc-ethos-ai
```

## Scaling Operations

### Manual Scaling
```bash
# Scale up
kubectl scale deployment ethos-ai-frontend --replicas=5 -n swbc-ethos-ai

# Scale down
kubectl scale deployment ethos-ai-frontend --replicas=2 -n swbc-ethos-ai

# Check scaling status
kubectl get deployment ethos-ai-frontend -n swbc-ethos-ai
```

### Auto-scaling Configuration
```bash
# Create HPA
kubectl autoscale deployment ethos-ai-frontend \
  --cpu-percent=70 \
  --min=2 \
  --max=10 \
  -n swbc-ethos-ai

# Check HPA status
kubectl get hpa -n swbc-ethos-ai

# Update HPA
kubectl patch hpa ethos-ai-frontend -n swbc-ethos-ai -p '{"spec":{"maxReplicas":15}}'
```

### Cluster Auto-scaling
```bash
# Check cluster autoscaler
kubectl get deployment cluster-autoscaler -n kube-system

# View autoscaler logs
kubectl logs -f deployment/cluster-autoscaler -n kube-system

# Update autoscaler configuration
kubectl edit deployment cluster-autoscaler -n kube-system
```

## Backup and Recovery

### Configuration Backup
```bash
# Backup all configurations
kubectl get all -n swbc-ethos-ai -o yaml > backup-$(date +%Y%m%d).yaml

# Backup specific resources
kubectl get configmap ethos-ai-config -n swbc-ethos-ai -o yaml > configmap-backup.yaml
kubectl get secret ethos-ai-secrets -n swbc-ethos-ai -o yaml > secret-backup.yaml
```

### DynamoDB Backup
```bash
# Create on-demand backup
aws dynamodb create-backup \
  --table-name UnityAIAssistantLogs \
  --backup-name logs-backup-$(date +%Y%m%d)

aws dynamodb create-backup \
  --table-name userFeedback \
  --backup-name feedback-backup-$(date +%Y%m%d)

aws dynamodb create-backup \
  --table-name UnityAIAssistantEvalJob \
  --backup-name evaljob-backup-$(date +%Y%m%d)

# List backups
aws dynamodb list-backups --table-name UnityAIAssistantLogs
```

### Disaster Recovery Testing
```bash
# Test cluster recreation
eksctl create cluster -f eks-deployment/infrastructure/eks-cluster.yaml --dry-run

# Test application deployment
kubectl apply -f eks-deployment/kubernetes/ --dry-run=client

# Test data recovery
aws dynamodb restore-table-from-backup \
  --target-table-name UnityAIAssistantLogs-test \
  --backup-arn arn:aws:dynamodb:us-east-1:ACCOUNT_ID:table/UnityAIAssistantLogs/backup/BACKUP_ID
```

## Monitoring and Alerting

### Health Checks
```bash
# Application health
kubectl get pods -n swbc-ethos-ai
kubectl describe deployment ethos-ai-frontend -n swbc-ethos-ai

# Cluster health
kubectl get nodes
kubectl get componentstatuses

# Service health
kubectl get services -n swbc-ethos-ai
kubectl get ingress -n swbc-ethos-ai
```

### Metrics Collection
```bash
# Check resource usage
kubectl top nodes
kubectl top pods -n swbc-ethos-ai

# View CloudWatch metrics
aws cloudwatch get-metric-statistics \
  --namespace ContainerInsights \
  --metric-name pod_cpu_utilization \
  --dimensions Name=ClusterName,Value=swbc-ethos-ai-cluster \
  --statistics Average \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300
```

### Log Management
```bash
# Application logs
kubectl logs -f deployment/ethos-ai-frontend -n swbc-ethos-ai

# System logs
kubectl logs -f daemonset/aws-node -n kube-system

# Audit logs
aws logs describe-log-groups --log-group-name-prefix /aws/eks/swbc-ethos-ai-cluster
```

## Security Maintenance

### Certificate Management
```bash
# Check certificate expiration
aws acm describe-certificate --certificate-arn arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/CERT_ID

# List certificates
aws acm list-certificates --certificate-statuses ISSUED

# Request new certificate if needed
aws acm request-certificate \
  --domain-name ethos-ai.swbc.com \
  --validation-method DNS
```

### Security Updates
```bash
# Scan for vulnerabilities
trivy image $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/swbc-ethos-ai:latest

# Update base images
docker pull node:18-alpine
docker pull nginx:alpine

# Rebuild with updated base images
docker build -f eks-deployment/docker/Dockerfile -t swbc-ethos-ai:security-update .
```

### Access Review
```bash
# Review RBAC
kubectl get rolebindings -n swbc-ethos-ai
kubectl get clusterrolebindings

# Review service accounts
kubectl get serviceaccounts -n swbc-ethos-ai

# Review network policies
kubectl get networkpolicies -n swbc-ethos-ai
```

## Performance Optimization

### Resource Optimization
```bash
# Analyze resource usage
kubectl describe nodes
kubectl top pods -n swbc-ethos-ai --sort-by=memory
kubectl top pods -n swbc-ethos-ai --sort-by=cpu

# Update resource requests/limits
kubectl patch deployment ethos-ai-frontend -n swbc-ethos-ai -p '
{
  "spec": {
    "template": {
      "spec": {
        "containers": [{
          "name": "frontend",
          "resources": {
            "requests": {"memory": "256Mi", "cpu": "200m"},
            "limits": {"memory": "512Mi", "cpu": "400m"}
          }
        }]
      }
    }
  }
}'
```

### Database Optimization
```bash
# Check DynamoDB metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/DynamoDB \
  --metric-name ConsumedReadCapacityUnits \
  --dimensions Name=TableName,Value=UnityAIAssistantLogs \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-02T00:00:00Z \
  --period 3600 \
  --statistics Sum

# Optimize table settings if needed
aws dynamodb update-table \
  --table-name UnityAIAssistantLogs \
  --billing-mode PAY_PER_REQUEST
```

## Cost Optimization

### Resource Right-sizing
```bash
# Check node utilization
kubectl describe nodes | grep -A 5 "Allocated resources"

# Optimize instance types
aws eks update-nodegroup-config \
  --cluster-name swbc-ethos-ai-cluster \
  --nodegroup-name worker-nodes \
  --scaling-config minSize=1,maxSize=3,desiredSize=2
```

### Cost Monitoring
```bash
# Check AWS costs
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=DIMENSION,Key=SERVICE

# Set up cost alerts
aws budgets create-budget \
  --account-id ACCOUNT_ID \
  --budget file://budget.json
```

## Troubleshooting Common Issues

### Pod Issues
```bash
# Pod not starting
kubectl describe pod <pod-name> -n swbc-ethos-ai
kubectl logs <pod-name> -n swbc-ethos-ai

# High resource usage
kubectl top pod <pod-name> -n swbc-ethos-ai --containers
kubectl exec -it <pod-name> -n swbc-ethos-ai -- top
```

### Network Issues
```bash
# DNS resolution
kubectl exec -it <pod-name> -n swbc-ethos-ai -- nslookup kubernetes.default

# Service connectivity
kubectl exec -it <pod-name> -n swbc-ethos-ai -- curl http://ethos-ai-frontend-service
```

### Storage Issues
```bash
# Check persistent volumes
kubectl get pv
kubectl get pvc -n swbc-ethos-ai

# Check disk usage
kubectl exec -it <pod-name> -n swbc-ethos-ai -- df -h
```

## Maintenance Scripts

### Automated Maintenance Script
```bash
#!/bin/bash
# maintenance.sh - Automated maintenance tasks

set -e

echo "Starting maintenance tasks..."

# Update cluster components
echo "Checking for cluster updates..."
aws eks describe-cluster --name swbc-ethos-ai-cluster

# Check application health
echo "Checking application health..."
kubectl get pods -n swbc-ethos-ai

# Backup configurations
echo "Creating backups..."
kubectl get all -n swbc-ethos-ai -o yaml > backup-$(date +%Y%m%d).yaml

# Check resource usage
echo "Checking resource usage..."
kubectl top nodes
kubectl top pods -n swbc-ethos-ai

# Security scan
echo "Running security scan..."
trivy image $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/swbc-ethos-ai:latest

echo "Maintenance tasks completed!"
```

### Cleanup Script
```bash
#!/bin/bash
# cleanup.sh - Clean up old resources

# Remove old images
docker image prune -f

# Clean up old backups (keep last 7 days)
find . -name "backup-*.yaml" -mtime +7 -delete

# Clean up old DynamoDB backups
aws dynamodb list-backups --table-name UnityAIAssistantLogs | \
  jq -r '.BackupSummaries[] | select(.BackupCreationDateTime < (now - 604800)) | .BackupArn' | \
  xargs -I {} aws dynamodb delete-backup --backup-arn {}
```

## Documentation Updates

### Maintenance Log Template
```markdown
# Maintenance Log - [Date]

## Tasks Performed
- [ ] Cluster updates
- [ ] Application updates
- [ ] Security patches
- [ ] Backup verification
- [ ] Performance optimization

## Issues Encountered
- Issue 1: Description and resolution
- Issue 2: Description and resolution

## Next Actions
- Action 1: Due date
- Action 2: Due date

## Notes
- Additional observations
- Recommendations for future maintenance
```

### Change Management
1. **Plan**: Document planned changes
2. **Test**: Test in staging environment
3. **Approve**: Get approval from stakeholders
4. **Execute**: Perform changes during maintenance window
5. **Verify**: Confirm changes are successful
6. **Document**: Update documentation and logs

## Contact Information

### Maintenance Team
- **DevOps Team**: devops@swbc.com
- **Platform Team**: platform@swbc.com
- **On-call Engineer**: +1-XXX-XXX-XXXX

### Escalation Procedures
1. **Level 1**: DevOps team member
2. **Level 2**: Senior DevOps engineer
3. **Level 3**: Platform architect
4. **Level 4**: CTO/VP Engineering