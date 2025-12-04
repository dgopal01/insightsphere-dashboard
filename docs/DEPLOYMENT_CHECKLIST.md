# Deployment Checklist

This checklist ensures all necessary steps are completed before and after deployment.

## Pre-Deployment Checklist

### Code Quality

- [ ] All tests passing (`npm run test`)
- [ ] No linting errors (`npm run lint`)
- [ ] Code formatted correctly (`npm run format:check`)
- [ ] Type checking passes (`npm run type-check`)
- [ ] No console errors in development build
- [ ] Code reviewed and approved

### Environment Configuration

- [ ] Environment variables configured for target environment
- [ ] AWS credentials are valid and have correct permissions
- [ ] Cognito User Pool configured
- [ ] AppSync API endpoint configured
- [ ] S3 bucket configured for exports
- [ ] DynamoDB tables exist and are accessible

### Build Verification

- [ ] Build completes successfully (`npm run build`)
- [ ] Bundle size within limits (`npm run build:analyze`)
- [ ] Pre-deployment checks pass (`npm run predeploy`)
- [ ] No sensitive data in build output
- [ ] Build info generated correctly
- [ ] Source maps configured appropriately for environment

### Backend Services

- [ ] Amplify backend deployed (`amplify push`)
- [ ] Authentication working in target environment
- [ ] GraphQL API accessible
- [ ] DynamoDB tables populated (for staging/prod)
- [ ] S3 bucket permissions configured
- [ ] CloudWatch logging enabled

### Security

- [ ] Security headers configured in amplify.yml
- [ ] HTTPS enforced
- [ ] CORS configured correctly
- [ ] API authentication rules verified
- [ ] No hardcoded secrets in code
- [ ] Environment variables use secure values (not placeholders)

## Deployment Steps

### Development Deployment

1. [ ] Checkout develop branch
2. [ ] Pull latest changes
3. [ ] Run tests: `npm run test`
4. [ ] Build application: `npm run build:dev`
5. [ ] Run pre-deployment checks: `npm run predeploy`
6. [ ] Deploy: `npm run deploy:dev` or push to develop branch
7. [ ] Verify deployment in Amplify Console
8. [ ] Run health checks: `npm run health-check:dev`

### Staging Deployment

1. [ ] Merge develop into staging branch
2. [ ] Pull latest changes
3. [ ] Run full test suite: `npm run test:coverage`
4. [ ] Build application: `npm run build:staging`
5. [ ] Run pre-deployment checks: `npm run predeploy`
6. [ ] Deploy: `npm run deploy:staging` or push to staging branch
7. [ ] Verify deployment in Amplify Console
8. [ ] Run health checks: `npm run health-check:staging`
9. [ ] Perform QA testing
10. [ ] Verify all features work as expected

### Production Deployment

1. [ ] Merge staging into main branch
2. [ ] Create release tag (e.g., v1.0.0)
3. [ ] Pull latest changes
4. [ ] Run full test suite: `npm run test:coverage`
5. [ ] Build application: `npm run build:prod`
6. [ ] Run pre-deployment checks: `npm run predeploy`
7. [ ] Review bundle size report
8. [ ] Deploy: `npm run deploy:prod` or push to main branch
9. [ ] Verify deployment in Amplify Console
10. [ ] Run health checks: `npm run health-check:prod`
11. [ ] Monitor error tracking (Sentry)
12. [ ] Monitor CloudWatch logs
13. [ ] Verify all critical features
14. [ ] Notify stakeholders of deployment

## Post-Deployment Verification

### Functional Testing

- [ ] Application loads successfully
- [ ] Authentication works (sign in/sign out)
- [ ] Dashboard displays metrics correctly
- [ ] Chat logs page loads and displays data
- [ ] Filtering and sorting work correctly
- [ ] CSV export functionality works
- [ ] Feedback submission works
- [ ] Feedback metrics display correctly
- [ ] Real-time updates work (WebSocket)
- [ ] Theme switching works
- [ ] All navigation links work

### Performance Testing

- [ ] Initial load time < 3 seconds
- [ ] Bundle size < 500KB gzipped
- [ ] LCP < 2.5 seconds
- [ ] FID < 100 milliseconds
- [ ] CLS < 0.1
- [ ] No memory leaks in browser
- [ ] API responses < 1 second

### Security Testing

- [ ] HTTPS enforced
- [ ] Security headers present
- [ ] No console errors or warnings
- [ ] No sensitive data exposed
- [ ] Authentication required for protected routes
- [ ] Role-based access control working
- [ ] XSS protection working (sanitization)

### Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

### Accessibility Testing

- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] ARIA labels present
- [ ] Color contrast meets WCAG 2.1 AA
- [ ] Focus indicators visible
- [ ] Error messages associated with form fields

### Monitoring

- [ ] Error tracking configured (Sentry)
- [ ] CloudWatch logs accessible
- [ ] Performance monitoring active
- [ ] Analytics tracking working (if enabled)
- [ ] Custom dashboards configured
- [ ] Alerts configured for critical errors

## Rollback Procedure

If issues are detected after deployment:

1. [ ] Identify the issue and severity
2. [ ] Determine if rollback is necessary
3. [ ] If rollback needed:
   - [ ] Go to Amplify Console
   - [ ] Select the environment
   - [ ] Find previous successful deployment
   - [ ] Click "Redeploy this version"
4. [ ] Verify rollback successful
5. [ ] Notify stakeholders
6. [ ] Document the issue
7. [ ] Create fix in development environment
8. [ ] Test fix thoroughly
9. [ ] Redeploy when ready

## Emergency Contacts

- **DevOps Team**: [contact info]
- **AWS Support**: [support plan details]
- **On-Call Engineer**: [contact info]
- **Product Owner**: [contact info]

## Deployment Log

Keep a record of all deployments:

| Date | Environment | Version | Deployed By | Status | Notes |
|------|-------------|---------|-------------|--------|-------|
| YYYY-MM-DD | prod | v1.0.0 | Name | Success | Initial release |
| YYYY-MM-DD | staging | v1.0.1 | Name | Success | Bug fixes |

## Common Issues and Solutions

### Build Fails

**Issue**: Build fails during CI/CD

**Solution**:
1. Check build logs for specific error
2. Verify all dependencies installed
3. Check environment variables
4. Run build locally to reproduce
5. Fix issue and retry

### Deployment Timeout

**Issue**: Deployment takes too long or times out

**Solution**:
1. Check AWS service status
2. Verify network connectivity
3. Check Amplify Console for errors
4. Retry deployment
5. Contact AWS support if persistent

### Authentication Not Working

**Issue**: Users cannot sign in after deployment

**Solution**:
1. Verify Cognito User Pool ID
2. Check Cognito Client ID
3. Verify redirect URLs in Cognito
4. Check IAM permissions
5. Review CloudWatch logs

### API Errors

**Issue**: GraphQL queries fail

**Solution**:
1. Verify AppSync endpoint URL
2. Check API authentication settings
3. Verify DynamoDB tables exist
4. Check IAM roles and permissions
5. Review CloudWatch logs

### Performance Issues

**Issue**: Application is slow after deployment

**Solution**:
1. Check bundle size
2. Review network requests
3. Check API response times
4. Verify CDN configuration
5. Review CloudWatch metrics

## Notes

- Always test in development and staging before production
- Keep this checklist updated with lessons learned
- Document any deviations from standard process
- Maintain deployment logs for audit purposes
- Review and update checklist quarterly
