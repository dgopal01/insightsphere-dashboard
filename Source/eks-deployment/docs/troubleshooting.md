# EKS Deployment Troubleshooting Guide

This guide covers common issues and solutions when deploying the Swbc.Ethos.Ai application to EKS.

## Common Issues

### 1. Pods Not Starting

**Symptoms:**
- Pods stuck in `Pending`, `CrashLoopBackOff`, or `ImagePullBackOff` state
- Application not accessible

**Diagnosis:**
```bash
# Check pod status
kubectl get pods -n swbc-ethos-ai

# Describe problematic pod
kubectl describe pod <pod-name> -n swbc-ethos-ai

# Check pod logs
kubectl logs <pod-name> -n swbc-ethos-ai

# Check events
kubectl get events -n swbc-ethos-ai --sort-by='.lastTimestamp'
```

**Common Solutions:**

#### ImagePullBackOff
```bash
# Verify ECR repository exists
aws ecr describe-repositories --repository-names swbc-ethos-ai

# Check if image exists
aws ecr list-images --repository-name swbc-ethos-ai

# Verify ECR permissions
aws ecr get-authorization-token

# Check deployment image reference
kubectl get deployment ethos-ai-frontend -n swbc-ethos-ai -o yaml | grep image
```

#### Resource Constraints
```bash
# Check node resources
kubectl describe nodes

# Check resource requests/limits
kubectl describe deployment ethos-ai-frontend -n swbc-ethos-ai

# Scale down if needed
kubectl scale deployment ethos-ai-frontend --replicas=1 -n swbc-ethos-ai
```

#### Configuration Issues
```bash
# Check ConfigMap
kubectl get configmap ethos-ai-config -n swbc-ethos-ai -o yaml

# Check Secret
kubectl get secret ethos-ai-secrets -n swbc-ethos-ai -o yaml

# Verify environment variables in pod
kubectl exec -it <pod-name> -n swbc-ethos-ai -- env | grep VITE
```

### 2. Load Balancer Issues

**Symptoms:**
- Ingress not getting external IP
- Application not accessible from internet
- SSL/TLS certificate issues

**Diagnosis:**
```bash
# Check ingress status
kubectl get ingress -n swbc-ethos-ai

# Describe ingress
kubectl describe ingress ethos-ai-ingress -n swbc-ethos-ai

# Check ALB controller logs
kubectl logs -f deployment/aws-load-balancer-controller -n kube-system

# Check ALB controller status
kubectl get deployment aws-load-balancer-controller -n kube-system
```

**Solutions:**

#### ALB Controller Not Installed
```bash
# Install ALB controller
helm repo add eks https://aws.github.io/eks-charts
helm repo update

helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=swbc-ethos-ai-cluster \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller
```

#### Certificate Issues
```bash
# Verify certificate exists in ACM
aws acm list-certificates --region us-east-1

# Update ingress with correct certificate ARN
kubectl edit ingress ethos-ai-ingress -n swbc-ethos-ai
```

#### Security Group Issues
```bash
# Check security groups
aws ec2 describe-security-groups --group-ids sg-xxxxxxxxx

# Update ingress with correct security groups
kubectl edit ingress ethos-ai-ingress -n swbc-ethos-ai
```

### 3. DynamoDB Connection Issues

**Symptoms:**
- Application errors related to database operations
- Authentication failures
- Table not found errors

**Diagnosis:**
```bash
# Test DynamoDB connectivity
node eks-deployment/scripts/setup-dynamodb.js

# Check AWS credentials in pod
kubectl exec -it <pod-name> -n swbc-ethos-ai -- env | grep AWS

# Check IAM permissions
aws sts get-caller-identity
```

**Solutions:**

#### Tables Don't Exist
```bash
# Create tables
node eks-deployment/scripts/setup-dynamodb.js

# Verify tables exist
aws dynamodb list-tables
```

#### Permission Issues
```bash
# Check IAM role for service account
kubectl describe serviceaccount default -n swbc-ethos-ai

# Verify IAM permissions
aws iam get-role --role-name <role-name>
aws iam list-attached-role-policies --role-name <role-name>
```

### 4. Networking Issues

**Symptoms:**
- Pods can't communicate with AWS services
- DNS resolution failures
- Timeout errors

**Diagnosis:**
```bash
# Check DNS resolution
kubectl exec -it <pod-name> -n swbc-ethos-ai -- nslookup google.com

# Check network policies
kubectl get networkpolicies -n swbc-ethos-ai

# Check service endpoints
kubectl get endpoints -n swbc-ethos-ai

# Test connectivity to AWS services
kubectl exec -it <pod-name> -n swbc-ethos-ai -- curl -I https://dynamodb.us-east-1.amazonaws.com
```

**Solutions:**

#### VPC Configuration
```bash
# Check VPC settings
aws eks describe-cluster --name swbc-ethos-ai-cluster --query "cluster.resourcesVpcConfig"

# Verify subnets have internet access
aws ec2 describe-route-tables
```

#### Security Groups
```bash
# Check node security groups
aws ec2 describe-security-groups --filters "Name=group-name,Values=*swbc-ethos-ai*"

# Update security group rules if needed
aws ec2 authorize-security-group-ingress --group-id sg-xxxxxxxxx --protocol tcp --port 443 --cidr 0.0.0.0/0
```

### 5. Performance Issues

**Symptoms:**
- Slow application response
- High resource usage
- Pod restarts due to resource limits

**Diagnosis:**
```bash
# Check resource usage
kubectl top pods -n swbc-ethos-ai
kubectl top nodes

# Check pod metrics
kubectl describe pod <pod-name> -n swbc-ethos-ai

# Check application logs for performance issues
kubectl logs <pod-name> -n swbc-ethos-ai | grep -i "slow\|timeout\|error"
```

**Solutions:**

#### Resource Optimization
```bash
# Update resource requests/limits
kubectl edit deployment ethos-ai-frontend -n swbc-ethos-ai

# Scale horizontally
kubectl scale deployment ethos-ai-frontend --replicas=5 -n swbc-ethos-ai

# Enable horizontal pod autoscaler
kubectl autoscale deployment ethos-ai-frontend --cpu-percent=70 --min=2 --max=10 -n swbc-ethos-ai
```

## Debug Commands

### General Debugging
```bash
# Get all resources
kubectl get all -n swbc-ethos-ai

# Check cluster info
kubectl cluster-info

# Check node status
kubectl get nodes -o wide

# Check system pods
kubectl get pods -n kube-system
```

### Application Debugging
```bash
# Port forward for local testing
kubectl port-forward service/ethos-ai-frontend-service 3000:80 -n swbc-ethos-ai

# Execute commands in pod
kubectl exec -it <pod-name> -n swbc-ethos-ai -- /bin/sh

# Copy files from pod
kubectl cp <pod-name>:/path/to/file ./local-file -n swbc-ethos-ai

# Check application health
curl http://localhost:3000/health
```

### Logs and Events
```bash
# Follow logs
kubectl logs -f deployment/ethos-ai-frontend -n swbc-ethos-ai

# Get previous container logs
kubectl logs <pod-name> -n swbc-ethos-ai --previous

# Watch events
kubectl get events -n swbc-ethos-ai --watch

# Check system events
kubectl get events -A --sort-by='.lastTimestamp'
```

## Recovery Procedures

### Rollback Deployment
```bash
# Check rollout history
kubectl rollout history deployment/ethos-ai-frontend -n swbc-ethos-ai

# Rollback to previous version
kubectl rollout undo deployment/ethos-ai-frontend -n swbc-ethos-ai

# Rollback to specific revision
kubectl rollout undo deployment/ethos-ai-frontend --to-revision=2 -n swbc-ethos-ai
```

### Restart Services
```bash
# Restart deployment
kubectl rollout restart deployment/ethos-ai-frontend -n swbc-ethos-ai

# Delete and recreate pods
kubectl delete pods -l app=ethos-ai-frontend -n swbc-ethos-ai

# Restart system components
kubectl rollout restart deployment/aws-load-balancer-controller -n kube-system
```

### Clean Up and Redeploy
```bash
# Delete application
kubectl delete namespace swbc-ethos-ai

# Redeploy
kubectl apply -f eks-deployment/kubernetes/namespace.yaml
kubectl apply -f eks-deployment/kubernetes/configmap.yaml
kubectl apply -f eks-deployment/kubernetes/secret.yaml
kubectl apply -f eks-deployment/kubernetes/deployment.yaml
kubectl apply -f eks-deployment/kubernetes/service.yaml
```

## Monitoring and Alerting

### Health Checks
```bash
# Check application health
kubectl get pods -n swbc-ethos-ai
kubectl describe deployment ethos-ai-frontend -n swbc-ethos-ai

# Test health endpoint
kubectl port-forward service/ethos-ai-frontend-service 8080:80 -n swbc-ethos-ai &
curl http://localhost:8080/health
```

### Metrics Collection
```bash
# Apply CloudWatch configuration
kubectl apply -f eks-deployment/monitoring/cloudwatch-config.yaml

# Check CloudWatch agent status
kubectl get pods -n amazon-cloudwatch
kubectl logs -n amazon-cloudwatch -l name=cloudwatch-agent

# View metrics in CloudWatch
aws cloudwatch list-metrics --namespace ContainerInsights
```

## Getting Help

### Log Collection
```bash
# Collect all logs
kubectl logs deployment/ethos-ai-frontend -n swbc-ethos-ai > app-logs.txt
kubectl get events -n swbc-ethos-ai > events.txt
kubectl describe deployment ethos-ai-frontend -n swbc-ethos-ai > deployment-info.txt
```

### System Information
```bash
# Cluster information
kubectl version
kubectl cluster-info dump > cluster-info.txt

# Node information
kubectl get nodes -o yaml > nodes.yaml
kubectl describe nodes > node-details.txt
```

### Contact Information
- **DevOps Team**: devops@swbc.com
- **Platform Team**: platform@swbc.com
- **Emergency**: Use incident management system

## Prevention

### Best Practices
1. **Always test in staging first**
2. **Monitor resource usage regularly**
3. **Keep cluster and applications updated**
4. **Use proper resource requests and limits**
5. **Implement proper health checks**
6. **Monitor application logs**
7. **Have rollback procedures ready**
8. **Document configuration changes**

### Regular Maintenance
1. **Update cluster version quarterly**
2. **Review and update security groups**
3. **Monitor certificate expiration**
4. **Review resource usage monthly**
5. **Test disaster recovery procedures**
6. **Update documentation**