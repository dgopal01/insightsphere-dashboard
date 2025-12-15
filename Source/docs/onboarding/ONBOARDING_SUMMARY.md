# EthosAI Onboarding Documentation Summary

## Overview
This folder contains comprehensive onboarding documentation for new team members joining the EthosAI project.

## Documents Created

### 1. 📘 [Developer Onboarding Guide](./DEVELOPER_ONBOARDING_GUIDE.md)
**For**: New developers joining the team  
**Purpose**: Step-by-step guide to get developers productive quickly

**Contents**:
- Prerequisites and software installation
- AWS access setup instructions
- Local development environment setup
- Project structure overview
- Development workflow
- Common tasks and examples
- Troubleshooting guide
- Resources and contacts

**Start Here**: This is the main document for new developers.

---

### 2. 🔐 [AWS Developer Permissions](./AWS_DEVELOPER_PERMISSIONS.md)
**For**: DevOps, Team Leads, IAM Administrators  
**Purpose**: Complete AWS IAM permissions required for developers

**Contents**:
- Complete IAM policy (JSON)
- Service-specific permissions breakdown
- Environment-specific access levels
- Setup instructions for IAM users
- Security best practices
- Common development tasks
- Troubleshooting access issues

**Key Features**:
- ✅ Read/Write access to development resources
- ✅ Cognito user management
- ✅ DynamoDB data access
- ✅ AppSync GraphQL API
- ✅ S3 storage access
- ✅ CloudWatch logs and metrics
- ✅ Amplify deployment
- ✅ Lambda function management

**Security**:
- MFA enforcement recommended
- Access key rotation policy
- Least privilege principle
- Environment separation (dev/staging/prod)

---

### 3. 📊 [AWS Monitoring Role Permissions](./AWS_MONITORING_ROLE_PERMISSIONS.md)
**For**: DevOps, SRE, Monitoring Team  
**Purpose**: AWS IAM permissions for monitoring and observability

**Contents**:
- Complete monitoring IAM policy (JSON)
- Read-only access to all services
- Full CloudWatch access
- Service-specific monitoring capabilities
- Dashboard and alert setup
- Security monitoring
- Cost monitoring
- Setup instructions

**Key Features**:
- ✅ **Read-only** access to application resources
- ✅ **Full access** to CloudWatch (dashboards, alarms, logs)
- ✅ CloudTrail for security auditing
- ✅ Cost Explorer for cost analysis
- ✅ X-Ray for distributed tracing
- ✅ Trusted Advisor insights

**Monitoring Capabilities**:
- Application performance monitoring (APM)
- User activity tracking
- Database performance metrics
- Error and exception tracking
- Security event monitoring
- Cost optimization insights

---

## Quick Reference

### For New Developers

1. **Read**: [Developer Onboarding Guide](./DEVELOPER_ONBOARDING_GUIDE.md)
2. **Request**: AWS access from team lead
3. **Setup**: Local development environment
4. **Start**: Pick your first task

### For DevOps/Team Leads

1. **Create**: IAM user for new developer
2. **Attach**: Developer policy from [AWS Developer Permissions](./AWS_DEVELOPER_PERMISSIONS.md)
3. **Provide**: Access keys and environment variables
4. **Verify**: Developer can access required resources

### For Monitoring Team

1. **Create**: Monitoring IAM role/user
2. **Attach**: Monitoring policy from [AWS Monitoring Role Permissions](./AWS_MONITORING_ROLE_PERMISSIONS.md)
3. **Setup**: CloudWatch dashboards and alarms
4. **Configure**: Third-party monitoring tools (if applicable)

---

## AWS Services Used

| Service | Developer Access | Monitoring Access |
|---------|-----------------|-------------------|
| **Cognito** | Read/Write | Read-Only |
| **DynamoDB** | Read/Write | Read-Only |
| **AppSync** | Read/Write | Read-Only |
| **S3** | Read/Write | Read-Only |
| **Amplify** | Read/Write | Read-Only |
| **Lambda** | Read/Write | Read-Only |
| **CloudWatch** | Read/Write | Full Access |
| **CloudFormation** | Read/Write | Read-Only |
| **IAM** | Read-Only | Read-Only |
| **CloudTrail** | Read-Only | Read-Only |
| **Cost Explorer** | None | Read-Only |

---

## Environment Structure

### Development Environment
- **Purpose**: Active development and testing
- **Access**: Full read/write for developers
- **Resources**: `*-dev-*`, `insightsphere-dev-*`

### Staging Environment
- **Purpose**: Pre-production testing
- **Access**: Read/write with approval
- **Resources**: `*-staging-*`, `insightsphere-staging-*`

### Production Environment
- **Purpose**: Live application
- **Access**: Read-only by default
- **Resources**: `*-prod-*`, `insightsphere-prod-*`

---

## Key AWS Resources

### Cognito
- **User Pool**: Authentication and user management
- **Identity Pool**: AWS credentials for authenticated users
- **User Groups**: `admin`, `viewer`

### DynamoDB Tables
- `chat-logs-review-dev-UnityAIAssistantLogs` - Chat logs
- `chat-logs-review-dev-UserFeedback` - User feedback
- `UnityAIAssistantEvalJob` - AI evaluation metrics

### AppSync
- **GraphQL API**: Main API endpoint
- **Data Sources**: DynamoDB tables
- **Resolvers**: Query and mutation logic

### S3 Buckets
- `insightsphere-*` - Application storage
- `amplify-*` - Amplify hosting

### CloudWatch
- **Log Groups**: Application and service logs
- **Metrics**: Performance and usage metrics
- **Alarms**: Automated alerts
- **Dashboards**: Visualization

---

## Security Best Practices

### For Developers
1. ✅ Enable MFA on AWS account
2. ✅ Rotate access keys every 90 days
3. ✅ Never commit credentials to Git
4. ✅ Use AWS Secrets Manager for sensitive data
5. ✅ Follow least privilege principle
6. ✅ Review IAM permissions quarterly

### For Monitoring Team
1. ✅ Read-only access to application data
2. ✅ Full access to monitoring resources only
3. ✅ Mask sensitive data in logs
4. ✅ Implement log retention policies
5. ✅ Audit monitoring user activity
6. ✅ Alert on unusual access patterns

---

## Common Tasks

### Developer Tasks
- Deploy to development environment
- Create test users in Cognito
- Query DynamoDB tables
- View application logs
- Update Lambda functions
- Test GraphQL queries

### Monitoring Tasks
- View application logs
- Check API performance metrics
- Monitor database usage
- Review security events
- Generate cost reports
- Create/update dashboards
- Configure alarms

---

## Troubleshooting

### Access Denied Errors
1. Verify IAM policy is attached
2. Check resource ARN matches
3. Verify AWS profile is set correctly
4. Contact DevOps if permissions missing

### Cannot View Logs
1. Check CloudWatch Logs permissions
2. Verify log group name is correct
3. Check AWS region matches
4. Ensure logs exist for time range

### Cannot Access DynamoDB
1. Verify table name is correct
2. Check DynamoDB permissions
3. Verify AWS region
4. Check table exists in environment

---

## Support Contacts

### Technical Support
- **DevOps Team**: devops@company.com
- **Team Lead**: lead@company.com
- **Security Team**: security@company.com

### Communication Channels
- **Slack**: #ethosai-dev, #ethosai-devops
- **Email**: dev-team@company.com
- **Stand-ups**: Daily at 10:00 AM

---

## Additional Resources

### Project Documentation
- [README](./README.md)
- [Setup Guide](./build_docs/SETUP.md)
- [Deployment Guide](./build_docs/CLOUD_DEPLOYMENT_GUIDE.md)
- [Testing Guide](./build_docs/TESTING.md)

### AWS Documentation
- [AWS IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [AWS Security Best Practices](https://aws.amazon.com/architecture/security-identity-compliance/)
- [CloudWatch Documentation](https://docs.aws.amazon.com/cloudwatch/)
- [Amplify Documentation](https://docs.amplify.aws/)

### Design System
- [Migration Complete](./MIGRATION_COMPLETE.md)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Radix UI Docs](https://www.radix-ui.com/primitives/docs/overview/introduction)

---

## Checklist for New Team Members

### Week 1: Setup
- [ ] Read Developer Onboarding Guide
- [ ] Request AWS access
- [ ] Install required software
- [ ] Configure AWS CLI
- [ ] Clone repository
- [ ] Set up local environment
- [ ] Run application locally
- [ ] Join communication channels

### Week 2: First Contributions
- [ ] Complete first task
- [ ] Create first PR
- [ ] Participate in code review
- [ ] Attend team meetings
- [ ] Ask questions and learn

### Week 3: Becoming Productive
- [ ] Complete multiple tasks
- [ ] Review others' PRs
- [ ] Contribute to documentation
- [ ] Help other team members

---

## Document Maintenance

### Update Frequency
- **Quarterly**: Review and update permissions
- **As Needed**: When AWS resources change
- **On Request**: When team members report issues

### Version History
- **v1.0** (December 2024): Initial documentation created

### Contributors
- DevOps Team
- Development Team
- Security Team

---

**Questions?** Contact your team lead or post in #ethosai-dev Slack channel.

**Last Updated**: December 2024  
**Version**: 1.0
