# AWS CloudWatch Monitoring for EKS

This directory contains AWS CloudWatch monitoring configuration for the Swbc.Ethos.Ai EKS deployment, replacing the previous Prometheus setup.

## Files Overview

- `cloudwatch-config.yaml` - CloudWatch Container Insights configuration
- `cloudwatch-alarms.yaml` - CloudWatch alarms for application monitoring
- `cloudwatch-dashboard.json` - CloudWatch dashboard configuration
- `README.md` - This documentation file

## Setup Instructions

### 1. Enable Container Insights

First, enable Container Insights for your EKS cluster:

```bash
# Enable Container Insights for the cluster
aws eks update-cluster-config \
  --region us-east-1 \
  --name swbc-ethos-ai-cluster \
  --logging '{"enable":["api","audit","authenticator","controllerManager","scheduler"]}'

# Install CloudWatch agent
kubectl apply -f cloudwatch-config.yaml
```

### 2. Create IAM Roles

Create the necessary IAM roles for CloudWatch access:

```bash
# Create CloudWatch Agent Server Role
aws iam create-role \
  --role-name CloudWatchAgentServerRole \
  --assume-role-policy-document '{
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
          "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/oidc.eks.us-east-1.amazonaws.com/id/OIDC_ID"
        },
        "Action": "sts:AssumeRoleWithWebIdentity",
        "Condition": {
          "StringEquals": {
            "oidc.eks.us-east-1.amazonaws.com/id/OIDC_ID:sub": "system:serviceaccount:amazon-cloudwatch:cloudwatch-agent"
          }
        }
      }
    ]
  }'

# Attach CloudWatch Agent Server Policy
aws iam attach-role-policy \
  --role-name CloudWatchAgentServerRole \
  --policy-arn arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy

# Create CloudWatch Setup Role for alarms
aws iam create-role \
  --role-name CloudWatchSetupRole \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/oidc.eks.us-east-1.amazonaws.com/id/OIDC_ID"
        },
        "Action": "sts:AssumeRoleWithWebIdentity",
        "Condition": {
          "StringEquals": {
            "oidc.eks.us-east-1.amazonaws.com/id/OIDC_ID:sub": "system:serviceaccount:swbc-ethos-ai:cloudwatch-setup"
          }
        }
      }
    ]
  }'

# Attach CloudWatch Full Access Policy
aws iam attach-role-policy \
  --role-name CloudWatchSetupRole \
  --policy-arn arn:aws:iam::aws:policy/CloudWatchFullAccess
```

### 3. Update Configuration Files

Replace the placeholder values in the configuration files:

- `ACCOUNT_ID` - Your AWS Account ID
- `OIDC_ID` - Your EKS cluster's OIDC provider ID
- `LOAD_BALANCER_ID` - Your Application Load Balancer ID

```bash
# Get your account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Get OIDC provider ID
OIDC_ID=$(aws eks describe-cluster --name swbc-ethos-ai-cluster --query "cluster.identity.oidc.issuer" --output text | cut -d '/' -f 5)

# Update the configuration files
sed -i "s/ACCOUNT_ID/$ACCOUNT_ID/g" cloudwatch-config.yaml
sed -i "s/ACCOUNT_ID/$ACCOUNT_ID/g" cloudwatch-alarms.yaml
sed -i "s/OIDC_ID/$OIDC_ID/g" cloudwatch-config.yaml
sed -i "s/OIDC_ID/$OIDC_ID/g" cloudwatch-alarms.yaml
```

### 4. Deploy CloudWatch Configuration

```bash
# Apply CloudWatch agent configuration
kubectl apply -f cloudwatch-config.yaml

# Wait for CloudWatch agent to be ready
kubectl wait --for=condition=ready pod -l name=cloudwatch-agent -n amazon-cloudwatch --timeout=300s

# Set up CloudWatch alarms
kubectl apply -f cloudwatch-alarms.yaml
```

### 5. Create CloudWatch Dashboard

```bash
# Create the dashboard
aws cloudwatch put-dashboard \
  --dashboard-name "Swbc-Ethos-AI-EKS-Dashboard" \
  --dashboard-body file://cloudwatch-dashboard.json
```

### 6. Set up SNS Topic for Alerts

```bash
# Create SNS topic for alerts
aws sns create-topic --name swbc-ethos-ai-alerts

# Subscribe to email notifications (replace with your email)
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:ACCOUNT_ID:swbc-ethos-ai-alerts \
  --protocol email \
  --notification-endpoint your-email@company.com
```

## Monitoring Features

### Container Insights
- **Pod and Node Metrics**: CPU, memory, disk, and network utilization
- **Application Logs**: Centralized logging from all containers
- **Performance Monitoring**: Real-time performance data

### CloudWatch Alarms
- **High CPU Usage**: Alerts when CPU usage exceeds 80%
- **High Memory Usage**: Alerts when memory usage exceeds 80%
- **Pod Restarts**: Alerts on frequent pod restarts
- **ALB Health**: Monitors load balancer target health
- **Response Time**: Alerts on high response times
- **Error Rates**: Monitors 5xx error rates
- **DynamoDB Issues**: Monitors throttling and errors

### CloudWatch Dashboard
- **Resource Utilization**: EKS pod and node metrics
- **Application Performance**: Load balancer and response time metrics
- **Database Performance**: DynamoDB metrics for all tables
- **Application Logs**: Recent log entries with filtering
- **Cluster Health**: Node count and pod status
- **Connection Metrics**: Load balancer connection statistics

## Accessing Monitoring Data

### CloudWatch Console
1. Go to AWS CloudWatch Console
2. Navigate to "Dashboards" to view the Swbc-Ethos-AI-EKS-Dashboard
3. Check "Alarms" for any active alerts
4. Use "Logs" to search application logs

### CLI Access
```bash
# View recent logs
aws logs filter-log-events \
  --log-group-name /aws/containerinsights/swbc-ethos-ai-cluster/application \
  --filter-pattern "ERROR"

# Get metric statistics
aws cloudwatch get-metric-statistics \
  --namespace AWS/EKS \
  --metric-name CPUUtilization \
  --dimensions Name=ClusterName,Value=swbc-ethos-ai-cluster \
  --statistics Average \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-01T23:59:59Z \
  --period 3600
```

## Cost Optimization

### Log Retention
Set appropriate log retention periods to control costs:

```bash
# Set log retention to 30 days
aws logs put-retention-policy \
  --log-group-name /aws/containerinsights/swbc-ethos-ai-cluster/application \
  --retention-in-days 30
```

### Metric Filters
Use metric filters to reduce log ingestion costs:

```bash
# Create metric filter for errors only
aws logs put-metric-filter \
  --log-group-name /aws/containerinsights/swbc-ethos-ai-cluster/application \
  --filter-name ErrorMetricFilter \
  --filter-pattern "ERROR" \
  --metric-transformations \
    metricName=ApplicationErrors,metricNamespace=CustomApp,metricValue=1
```

## Troubleshooting

### CloudWatch Agent Not Starting
```bash
# Check agent status
kubectl get pods -n amazon-cloudwatch

# View agent logs
kubectl logs -n amazon-cloudwatch -l name=cloudwatch-agent

# Check IAM role permissions
aws iam get-role --role-name CloudWatchAgentServerRole
```

### Missing Metrics
```bash
# Verify Container Insights is enabled
aws eks describe-cluster --name swbc-ethos-ai-cluster --query cluster.logging

# Check metric namespaces
aws cloudwatch list-metrics --namespace ContainerInsights
```

### Alarm Issues
```bash
# List all alarms
aws cloudwatch describe-alarms --alarm-names ethos-ai-frontend-high-cpu

# Check alarm history
aws cloudwatch describe-alarm-history --alarm-name ethos-ai-frontend-high-cpu
```

## Migration from Prometheus

If migrating from Prometheus:

1. **Export Historical Data**: Use CloudWatch APIs to import historical metrics if needed
2. **Update Grafana**: Configure Grafana to use CloudWatch as a data source
3. **Alert Migration**: Convert Prometheus alert rules to CloudWatch alarms
4. **Dashboard Migration**: Recreate Prometheus dashboards in CloudWatch

## Best Practices

1. **Use Metric Filters**: Filter logs to reduce costs and noise
2. **Set Appropriate Retention**: Balance cost and compliance requirements
3. **Monitor Costs**: Use AWS Cost Explorer to track CloudWatch costs
4. **Use Composite Alarms**: Combine multiple metrics for more accurate alerting
5. **Tag Resources**: Use consistent tagging for better cost allocation
6. **Regular Review**: Periodically review and optimize monitoring configuration

## Support

For issues with CloudWatch monitoring:
1. Check AWS CloudWatch documentation
2. Review EKS Container Insights troubleshooting guide
3. Contact AWS Support for service-specific issues
4. Check application logs for configuration errors