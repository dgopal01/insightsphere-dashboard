# Security Considerations for EKS Deployment

This document outlines the security measures and best practices implemented in the EKS deployment of the Swbc.Ethos.Ai application.

## Container Security

### Image Security
- **Base Images**: Using official, minimal Alpine Linux images
- **Multi-stage Builds**: Separate build and runtime environments
- **Non-root User**: Containers run as non-root user (UID 101)
- **Read-only Root Filesystem**: Prevents runtime modifications
- **Dropped Capabilities**: All unnecessary Linux capabilities removed

```yaml
securityContext:
  allowPrivilegeEscalation: false
  runAsNonRoot: true
  runAsUser: 101
  readOnlyRootFilesystem: true
  capabilities:
    drop:
    - ALL
```

### Image Scanning
```bash
# Scan images for vulnerabilities
aws ecr start-image-scan --repository-name swbc-ethos-ai --image-id imageTag=latest

# Get scan results
aws ecr describe-image-scan-findings --repository-name swbc-ethos-ai --image-id imageTag=latest
```

## Network Security

### VPC Configuration
- **Private Subnets**: Worker nodes in private subnets
- **NAT Gateway**: Single NAT gateway for cost optimization
- **Security Groups**: Restrictive ingress/egress rules
- **Network ACLs**: Additional layer of network security

### Security Groups
```bash
# EKS Cluster Security Group
aws ec2 create-security-group \
  --group-name swbc-ethos-ai-cluster-sg \
  --description "Security group for EKS cluster"

# Worker Node Security Group
aws ec2 create-security-group \
  --group-name swbc-ethos-ai-worker-sg \
  --description "Security group for EKS worker nodes"

# ALB Security Group
aws ec2 create-security-group \
  --group-name swbc-ethos-ai-alb-sg \
  --description "Security group for Application Load Balancer"
```

### Network Policies
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: ethos-ai-network-policy
  namespace: swbc-ethos-ai
spec:
  podSelector:
    matchLabels:
      app: ethos-ai-frontend
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: kube-system
    ports:
    - protocol: TCP
      port: 80
  egress:
  - to: []
    ports:
    - protocol: TCP
      port: 443
    - protocol: TCP
      port: 80
```

## Identity and Access Management (IAM)

### Service Accounts
- **IRSA**: IAM Roles for Service Accounts
- **Least Privilege**: Minimal required permissions
- **Separate Roles**: Different roles for different services

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: ethos-ai-service-account
  namespace: swbc-ethos-ai
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::ACCOUNT_ID:role/EthosAIServiceRole
```

### IAM Policies
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-east-1:*:table/UnityAIAssistantLogs",
        "arn:aws:dynamodb:us-east-1:*:table/userFeedback",
        "arn:aws:dynamodb:us-east-1:*:table/UnityAIAssistantEvalJob"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::insightsphere-*-exports-*/*"
    }
  ]
}
```

## Secrets Management

### Kubernetes Secrets
- **Encrypted at Rest**: Using AWS KMS
- **Encrypted in Transit**: TLS encryption
- **Access Control**: RBAC policies
- **Rotation**: Regular secret rotation

```bash
# Create secret from command line
kubectl create secret generic ethos-ai-secrets \
  --from-literal=VITE_USER_POOL_ID=us-east-1_gYh3rcIFz \
  --from-literal=VITE_USER_POOL_CLIENT_ID=6mlu9llcomgp1iokfk3552tvs3 \
  -n swbc-ethos-ai

# Encrypt secrets at rest
aws eks associate-encryption-config \
  --cluster-name swbc-ethos-ai-cluster \
  --encryption-config resources=secrets,provider='{keyId=arn:aws:kms:us-east-1:ACCOUNT_ID:key/KEY_ID}'
```

### AWS Secrets Manager Integration
```yaml
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: aws-secrets-manager
  namespace: swbc-ethos-ai
spec:
  provider:
    aws:
      service: SecretsManager
      region: us-east-1
      auth:
        jwt:
          serviceAccountRef:
            name: ethos-ai-service-account
```

## TLS/SSL Configuration

### Certificate Management
- **AWS Certificate Manager**: Managed SSL certificates
- **Automatic Renewal**: ACM handles certificate renewal
- **Strong Ciphers**: TLS 1.2+ only

```bash
# Request certificate
aws acm request-certificate \
  --domain-name ethos-ai.swbc.com \
  --validation-method DNS \
  --subject-alternative-names "*.ethos-ai.swbc.com"
```

### Ingress TLS Configuration
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ethos-ai-ingress
  annotations:
    alb.ingress.kubernetes.io/ssl-redirect: '443'
    alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/CERT_ID
    alb.ingress.kubernetes.io/ssl-policy: ELBSecurityPolicy-TLS-1-2-2017-01
spec:
  tls:
  - hosts:
    - ethos-ai.swbc.com
    secretName: ethos-ai-tls
```

## RBAC (Role-Based Access Control)

### Cluster Roles
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: ethos-ai-cluster-role
rules:
- apiGroups: [""]
  resources: ["pods", "services", "configmaps", "secrets"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["apps"]
  resources: ["deployments", "replicasets"]
  verbs: ["get", "list", "watch"]
```

### Role Bindings
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: ethos-ai-role-binding
  namespace: swbc-ethos-ai
subjects:
- kind: ServiceAccount
  name: ethos-ai-service-account
  namespace: swbc-ethos-ai
roleRef:
  kind: ClusterRole
  name: ethos-ai-cluster-role
  apiGroup: rbac.authorization.k8s.io
```

## Pod Security Standards

### Pod Security Policy
```yaml
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: ethos-ai-psp
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
    - ALL
  volumes:
    - 'configMap'
    - 'emptyDir'
    - 'projected'
    - 'secret'
    - 'downwardAPI'
    - 'persistentVolumeClaim'
  runAsUser:
    rule: 'MustRunAsNonRoot'
  seLinux:
    rule: 'RunAsAny'
  fsGroup:
    rule: 'RunAsAny'
```

### Security Context
```yaml
spec:
  securityContext:
    fsGroup: 101
    runAsNonRoot: true
    runAsUser: 101
  containers:
  - name: frontend
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      runAsNonRoot: true
      runAsUser: 101
      capabilities:
        drop:
        - ALL
```

## Monitoring and Auditing

### Audit Logging
```yaml
# EKS Cluster Configuration
cloudWatch:
  clusterLogging:
    enable: ["api", "audit", "authenticator", "controllerManager", "scheduler"]
```

### Security Monitoring
```bash
# Enable GuardDuty for EKS
aws guardduty create-detector --enable

# Enable Security Hub
aws securityhub enable-security-hub

# Enable Config for compliance monitoring
aws configservice put-configuration-recorder \
  --configuration-recorder name=default,roleARN=arn:aws:iam::ACCOUNT_ID:role/config-role
```

### Log Analysis
```bash
# Search for security events
kubectl logs -n swbc-ethos-ai -l app=ethos-ai-frontend | grep -i "error\|unauthorized\|forbidden"

# Monitor failed authentication attempts
aws logs filter-log-events \
  --log-group-name /aws/eks/swbc-ethos-ai-cluster/cluster \
  --filter-pattern "ERROR"
```

## Compliance and Governance

### Security Scanning
```bash
# Scan cluster configuration
kube-bench run --targets node,policies,managedservices

# Scan for CIS Kubernetes Benchmark
kube-hunter --remote ethos-ai.swbc.com

# Vulnerability scanning
trivy image ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/swbc-ethos-ai:latest
```

### Policy Enforcement
```yaml
# Open Policy Agent Gatekeeper
apiVersion: templates.gatekeeper.sh/v1beta1
kind: ConstraintTemplate
metadata:
  name: k8srequiredsecuritycontext
spec:
  crd:
    spec:
      names:
        kind: K8sRequiredSecurityContext
      validation:
        properties:
          runAsNonRoot:
            type: boolean
```

## Incident Response

### Security Incident Procedures
1. **Detection**: Monitor logs and alerts
2. **Containment**: Isolate affected resources
3. **Investigation**: Analyze logs and events
4. **Remediation**: Apply fixes and patches
5. **Recovery**: Restore normal operations
6. **Lessons Learned**: Update procedures

### Emergency Procedures
```bash
# Isolate compromised pod
kubectl delete pod <compromised-pod> -n swbc-ethos-ai

# Scale down deployment
kubectl scale deployment ethos-ai-frontend --replicas=0 -n swbc-ethos-ai

# Block network access
kubectl apply -f - <<EOF
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all
  namespace: swbc-ethos-ai
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
EOF
```

## Security Checklist

### Pre-deployment
- [ ] Container images scanned for vulnerabilities
- [ ] Security contexts configured
- [ ] Network policies defined
- [ ] RBAC policies implemented
- [ ] Secrets properly managed
- [ ] TLS certificates configured

### Post-deployment
- [ ] Security monitoring enabled
- [ ] Audit logging configured
- [ ] Compliance scanning scheduled
- [ ] Incident response procedures tested
- [ ] Security training completed
- [ ] Documentation updated

### Regular Maintenance
- [ ] Security patches applied
- [ ] Certificates renewed
- [ ] Access reviews conducted
- [ ] Vulnerability scans performed
- [ ] Compliance audits completed
- [ ] Security policies updated

## Security Tools and Resources

### Recommended Tools
- **Falco**: Runtime security monitoring
- **OPA Gatekeeper**: Policy enforcement
- **Twistlock/Prisma**: Container security
- **Aqua Security**: Cloud-native security
- **Sysdig**: Runtime security and compliance

### Security Resources
- [CIS Kubernetes Benchmark](https://www.cisecurity.org/benchmark/kubernetes)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [AWS EKS Security Best Practices](https://aws.github.io/aws-eks-best-practices/security/docs/)
- [Kubernetes Security Documentation](https://kubernetes.io/docs/concepts/security/)

## Contact Information

### Security Team
- **Security Officer**: security@swbc.com
- **DevSecOps Team**: devsecops@swbc.com
- **Incident Response**: incident-response@swbc.com
- **Emergency Hotline**: +1-XXX-XXX-XXXX