# Troubleshooting Guide - Chat Logs Review System

This guide provides solutions to common issues you may encounter with the Chat Logs Review System.

## Table of Contents

- [Authentication Issues](#authentication-issues)
- [Data Loading Issues](#data-loading-issues)
- [API Connection Issues](#api-connection-issues)
- [Deployment Issues](#deployment-issues)
- [Performance Issues](#performance-issues)
- [Build Issues](#build-issues)
- [Browser Issues](#browser-issues)
- [Network Issues](#network-issues)
- [Database Issues](#database-issues)
- [Lambda Function Issues](#lambda-function-issues)

## Authentication Issues

### Cannot Sign In

**Symptoms**:
- Sign-in button doesn't work
- Error message: "Incorrect username or password"
- Redirected back to sign-in page

**Possible Causes**:
1. Incorrect credentials
2. User not confirmed
3. Cognito configuration error
4. Network connectivity issue

**Solutions**:

#### 1. Verify Credentials
```bash
# Check if user exists
aws cognito-idp admin-get-user \
  --user-pool-id <pool-id> \
  --username <email>
```

#### 2. Confirm User
```bash
# Confirm user if not confirmed
aws cognito-idp admin-confirm-sign-up \
  --user-pool-id <pool-id> \
  --username <email>
```

#### 3. Reset Password
```bash
# Set new password
aws cognito-idp admin-set-user-password \
  --user-pool-id <pool-id> \
  --username <email> \
  --password <new-password> \
  --permanent
```

#### 4. Check Cognito Configuration
```bash
# Verify user pool client
aws cognito-idp describe-user-pool-client \
  --user-pool-id <pool-id> \
  --client-id <client-id>
```

Verify:
- Callback URLs include your application URL
- OAuth flows are enabled
- Allowed OAuth scopes include `email`, `openid`, `profile`

---

### Session Expired

**Symptoms**:
- Suddenly redirected to sign-in page
- Error message: "Session expired"
- API calls return 401 Unauthorized

**Possible Causes**:
1. JWT token expired (after 1 hour)
2. Refresh token expired (after 30 days)
3. User signed out from another device

**Solutions**:

#### 1. Sign In Again
Simply sign in again with your credentials.

#### 2. Enable Auto-Refresh
The application should automatically refresh tokens. If not working:

```typescript
// Check token refresh logic in src/contexts/AuthContext.tsx
const refreshSession = async () => {
  try {
    const session = await Auth.currentSession();
    return session;
  } catch (error) {
    // Redirect to sign-in
    navigate('/signin');
  }
};
```

#### 3. Clear Browser Storage
```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
// Then refresh page
```

---

### Cognito Hosted UI Not Loading

**Symptoms**:
- Blank page when clicking "Sign In"
- Error: "Invalid redirect URI"
- Cognito domain not found

**Possible Causes**:
1. Incorrect Cognito domain
2. Callback URL not configured
3. DNS propagation delay

**Solutions**:

#### 1. Verify Cognito Domain
```bash
# Check domain
aws cognito-idp describe-user-pool \
  --user-pool-id <pool-id> \
  --query 'UserPool.Domain'
```

#### 2. Check Callback URLs
```bash
# List callback URLs
aws cognito-idp describe-user-pool-client \
  --user-pool-id <pool-id> \
  --client-id <client-id> \
  --query 'UserPoolClient.CallbackURLs'
```

Add your application URL if missing:
```bash
aws cognito-idp update-user-pool-client \
  --user-pool-id <pool-id> \
  --client-id <client-id> \
  --callback-urls "http://localhost:5173" "https://your-app-url.com"
```

#### 3. Wait for DNS Propagation
If domain was just created, wait 5-10 minutes for DNS propagation.

---

## Data Loading Issues

### No Data Displayed

**Symptoms**:
- Empty tables
- "No data available" message
- Loading spinner never stops

**Possible Causes**:
1. No data in DynamoDB tables
2. GraphQL query error
3. Incorrect table names
4. IAM permission issues

**Solutions**:

#### 1. Check DynamoDB Tables
```bash
# Check if tables exist
aws dynamodb list-tables

# Check table item count
aws dynamodb describe-table \
  --table-name chat-logs-review-dev-UnityAIAssistantLogs \
  --query 'Table.ItemCount'

# Scan table (first 10 items)
aws dynamodb scan \
  --table-name chat-logs-review-dev-UnityAIAssistantLogs \
  --max-items 10
```

#### 2. Test GraphQL Query
```bash
# Test query with curl
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt-token>" \
  -d '{"query":"{ listUnityAIAssistantLogs(limit: 1) { items { log_id } } }"}' \
  <graphql-endpoint>
```

#### 3. Check Browser Console
Open browser DevTools (F12) and check Console tab for errors.

#### 4. Verify IAM Permissions
```bash
# Check AppSync service role
aws iam get-role-policy \
  --role-name chat-logs-review-dev-appsync-role \
  --policy-name DynamoDBAccess
```

Ensure policy includes:
- `dynamodb:Query`
- `dynamodb:Scan`
- `dynamodb:GetItem`

---

### Data Not Refreshing

**Symptoms**:
- Stale data displayed
- Changes not reflected
- Manual refresh required

**Possible Causes**:
1. Caching issue
2. Subscription not working
3. Browser cache

**Solutions**:

#### 1. Clear Browser Cache
```
Ctrl/Cmd + Shift + Delete
Select "Cached images and files"
Click "Clear data"
```

#### 2. Hard Refresh
```
Ctrl/Cmd + Shift + R (Windows/Mac)
Ctrl + F5 (Windows)
```

#### 3. Check Subscriptions
Verify WebSocket connection in Network tab (DevTools):
- Look for `wss://` connections
- Check if connection is "Open"
- Look for subscription messages

#### 4. Disable Cache in DevTools
1. Open DevTools (F12)
2. Go to Network tab
3. Check "Disable cache"
4. Keep DevTools open

---

## API Connection Issues

### GraphQL Queries Failing

**Symptoms**:
- Error: "Network request failed"
- Error: "GraphQL error"
- 400/500 status codes

**Possible Causes**:
1. Incorrect GraphQL endpoint
2. Invalid query syntax
3. Authentication token missing/invalid
4. AppSync API down

**Solutions**:

#### 1. Verify GraphQL Endpoint
Check `.env` file:
```env
VITE_GRAPHQL_ENDPOINT=https://XXXXXXXXXX.appsync-api.us-east-1.amazonaws.com/graphql
```

Get correct endpoint:
```bash
aws cloudformation describe-stacks \
  --stack-name chat-logs-review-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`GraphQLApiUrl`].OutputValue' \
  --output text
```

#### 2. Test Query Manually
```bash
# Get JWT token from browser
# Open DevTools → Application → Local Storage
# Copy token value

# Test query
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"query":"{ getReviewMetrics { totalChatLogs } }"}' \
  <graphql-endpoint>
```

#### 3. Check AppSync Logs
```bash
# View AppSync logs
aws logs tail /aws/appsync/apis/<api-id> --follow
```

#### 4. Verify API Status
Check [AWS Service Health Dashboard](https://status.aws.amazon.com/)

---

### CORS Errors

**Symptoms**:
- Error: "CORS policy blocked"
- Error: "No 'Access-Control-Allow-Origin' header"
- API calls fail from browser

**Possible Causes**:
1. Origin not in allowed list
2. AppSync CORS not configured
3. Incorrect request headers

**Solutions**:

#### 1. Check Allowed Origins
AppSync automatically handles CORS for authenticated requests.

Verify authentication header is included:
```typescript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

#### 2. Use Proxy for Development
Add to `vite.config.ts`:
```typescript
server: {
  proxy: {
    '/graphql': {
      target: process.env.VITE_GRAPHQL_ENDPOINT,
      changeOrigin: true
    }
  }
}
```

---

## Deployment Issues

### CloudFormation Stack Creation Failed

**Symptoms**:
- Stack status: `CREATE_FAILED` or `ROLLBACK_COMPLETE`
- Resources not created
- Error messages in CloudFormation events

**Possible Causes**:
1. Cognito domain already exists
2. IAM permission issues
3. Resource limits exceeded
4. Invalid parameters

**Solutions**:

#### 1. Check Stack Events
```bash
aws cloudformation describe-stack-events \
  --stack-name chat-logs-review-dev \
  --max-items 20
```

#### 2. Common Errors and Fixes

**Error: "Domain already exists"**
```bash
# Choose different domain prefix
# Update parameter:
CognitoDomainPrefix=mycompany-chat-review-dev-v2
```

**Error: "User is not authorized"**
```bash
# Check IAM permissions
aws iam get-user
aws iam list-attached-user-policies --user-name <username>
```

**Error: "Limit exceeded"**
```bash
# Check service quotas
aws service-quotas list-service-quotas \
  --service-code dynamodb
```

#### 3. Delete Failed Stack
```bash
aws cloudformation delete-stack \
  --stack-name chat-logs-review-dev

# Wait for deletion
aws cloudformation wait stack-delete-complete \
  --stack-name chat-logs-review-dev
```

#### 4. Retry with Correct Parameters
```bash
aws cloudformation create-stack \
  --stack-name chat-logs-review-dev \
  --template-body file://cloudformation/chat-logs-review-stack.yaml \
  --parameters file://parameters.json \
  --capabilities CAPABILITY_NAMED_IAM
```

---

### Amplify Build Failing

**Symptoms**:
- Build status: Failed
- Error in Amplify console
- Application not deployed

**Possible Causes**:
1. Build command error
2. Missing environment variables
3. Dependency installation failure
4. Out of memory

**Solutions**:

#### 1. Check Build Logs
1. Go to Amplify Console
2. Select your app
3. Click on failed build
4. Review build logs

#### 2. Verify Environment Variables
1. Go to App Settings → Environment variables
2. Ensure all required variables are set
3. No placeholder values (XXXXXXXXX)

#### 3. Test Build Locally
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Build
npm run build

# Check for errors
```

#### 4. Increase Build Resources
In `amplify.yml`:
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

---

## Performance Issues

### Slow Page Load

**Symptoms**:
- Pages take >5 seconds to load
- Blank screen for extended period
- Browser becomes unresponsive

**Possible Causes**:
1. Large bundle size
2. Slow network connection
3. Too many API calls
4. Memory leak

**Solutions**:

#### 1. Analyze Bundle Size
```bash
npm run build:analyze
```

Review output for large dependencies.

#### 2. Enable Code Splitting
Already configured in `vite.config.ts`. Verify:
```typescript
manualChunks: {
  vendor: ['react', 'react-dom'],
  mui: ['@mui/material'],
  aws: ['aws-amplify']
}
```

#### 3. Implement Lazy Loading
```typescript
const ChatLogsReviewPage = lazy(() => import('./pages/ChatLogsReviewPage'));
```

#### 4. Check Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Reload page
4. Look for slow requests (>1s)
5. Optimize or cache slow requests

#### 5. Profile Performance
1. Open DevTools (F12)
2. Go to Performance tab
3. Click Record
4. Interact with app
5. Stop recording
6. Analyze flame graph

---

### High Memory Usage

**Symptoms**:
- Browser tab crashes
- "Out of memory" errors
- System becomes slow

**Possible Causes**:
1. Memory leak
2. Too much data in state
3. Subscriptions not cleaned up
4. Large images/files

**Solutions**:

#### 1. Check Memory Usage
1. Open DevTools (F12)
2. Go to Memory tab
3. Take heap snapshot
4. Look for large objects

#### 2. Clean Up Subscriptions
```typescript
useEffect(() => {
  const subscription = API.graphql(/* ... */);
  
  return () => {
    subscription.unsubscribe(); // Important!
  };
}, []);
```

#### 3. Implement Pagination
Limit data loaded at once:
```typescript
const [limit] = useState(50); // Don't load all data
```

#### 4. Clear Cache Periodically
```typescript
// Clear old cache entries
const clearOldCache = () => {
  const cacheKeys = Object.keys(localStorage);
  cacheKeys.forEach(key => {
    if (key.startsWith('cache_') && isOld(key)) {
      localStorage.removeItem(key);
    }
  });
};
```

---

## Build Issues

### TypeScript Compilation Errors

**Symptoms**:
- Build fails with type errors
- Red squiggly lines in IDE
- `tsc` command fails

**Possible Causes**:
1. Type mismatch
2. Missing type definitions
3. Incorrect imports
4. Outdated dependencies

**Solutions**:

#### 1. Check Error Messages
```bash
npm run type-check
```

Read error messages carefully.

#### 2. Install Type Definitions
```bash
# Install missing types
npm install --save-dev @types/node @types/react @types/react-dom
```

#### 3. Fix Type Errors
Common fixes:
```typescript
// Add type annotations
const [data, setData] = useState<ChatLogEntry[]>([]);

// Use type assertions
const element = document.getElementById('root') as HTMLElement;

// Add null checks
if (data) {
  // Use data
}
```

#### 4. Update Dependencies
```bash
npm update
npm audit fix
```

---

### Linting Errors

**Symptoms**:
- Build fails with ESLint errors
- Warning messages in console
- CI/CD pipeline fails

**Possible Causes**:
1. Code style violations
2. Unused variables
3. Missing dependencies in useEffect
4. Incorrect imports

**Solutions**:

#### 1. Run Linter
```bash
npm run lint
```

#### 2. Auto-Fix Issues
```bash
npm run lint:fix
```

#### 3. Disable Specific Rules (if necessary)
```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = response;
```

#### 4. Update ESLint Config
Edit `eslint.config.js` to adjust rules.

---

## Browser Issues

### Application Not Loading

**Symptoms**:
- Blank white page
- Console errors
- "Failed to load resource"

**Possible Causes**:
1. JavaScript error
2. Missing files
3. Incorrect base URL
4. Browser compatibility

**Solutions**:

#### 1. Check Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Look for red error messages
4. Fix errors in code

#### 2. Clear Browser Cache
```
Ctrl/Cmd + Shift + Delete
Clear all cached data
Reload page
```

#### 3. Try Different Browser
Test in:
- Chrome
- Firefox
- Safari
- Edge

#### 4. Check Browser Compatibility
Minimum versions:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

### Cookies/Storage Issues

**Symptoms**:
- Can't stay signed in
- Settings not saved
- "Storage quota exceeded"

**Possible Causes**:
1. Cookies disabled
2. Private/Incognito mode
3. Storage quota exceeded
4. Browser extension blocking

**Solutions**:

#### 1. Enable Cookies
1. Browser Settings
2. Privacy & Security
3. Enable cookies
4. Allow third-party cookies for AWS domains

#### 2. Exit Private Mode
Use normal browser window, not incognito/private.

#### 3. Clear Storage
```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
```

#### 4. Disable Extensions
Temporarily disable browser extensions, especially:
- Ad blockers
- Privacy extensions
- Script blockers

---

## Network Issues

### Intermittent Connection Errors

**Symptoms**:
- Random API failures
- "Network error" messages
- Requests timeout

**Possible Causes**:
1. Unstable internet connection
2. Firewall/proxy blocking
3. DNS issues
4. AWS service issues

**Solutions**:

#### 1. Check Internet Connection
```bash
# Test connectivity
ping google.com
ping amazonaws.com
```

#### 2. Check DNS Resolution
```bash
# Test DNS
nslookup <your-api-id>.appsync-api.us-east-1.amazonaws.com
```

#### 3. Try Different Network
- Switch from WiFi to ethernet
- Try mobile hotspot
- Use VPN

#### 4. Check Firewall
Ensure these domains are allowed:
- `*.amazonaws.com`
- `*.amazoncognito.com`
- `*.amplifyapp.com`

---

## Database Issues

### DynamoDB Throttling

**Symptoms**:
- Error: "ProvisionedThroughputExceededException"
- Slow queries
- Timeouts

**Possible Causes**:
1. Too many requests
2. Hot partition
3. Insufficient capacity

**Solutions**:

#### 1. Check Metrics
```bash
# View throttled requests
aws cloudwatch get-metric-statistics \
  --namespace AWS/DynamoDB \
  --metric-name UserErrors \
  --dimensions Name=TableName,Value=chat-logs-review-dev-UnityAIAssistantLogs \
  --start-time 2024-12-05T00:00:00Z \
  --end-time 2024-12-05T23:59:59Z \
  --period 3600 \
  --statistics Sum
```

#### 2. Enable Auto Scaling
Already using PAY_PER_REQUEST mode, which auto-scales.

#### 3. Implement Exponential Backoff
Already implemented in application. Verify:
```typescript
const retryWithBackoff = async (fn, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 2 ** i * 1000));
    }
  }
};
```

---

## Lambda Function Issues

### Metrics Not Loading

**Symptoms**:
- Dashboard shows "Loading..."
- Error: "Lambda invocation failed"
- Metrics are zero

**Possible Causes**:
1. Lambda function error
2. IAM permission issues
3. DynamoDB access denied
4. Function timeout

**Solutions**:

#### 1. Check Lambda Logs
```bash
aws logs tail /aws/lambda/chat-logs-review-dev-GetReviewMetrics --follow
```

#### 2. Test Function Directly
```bash
aws lambda invoke \
  --function-name chat-logs-review-dev-GetReviewMetrics \
  response.json

cat response.json
```

#### 3. Check IAM Permissions
```bash
# Get function role
aws lambda get-function \
  --function-name chat-logs-review-dev-GetReviewMetrics \
  --query 'Configuration.Role'

# Check role policies
aws iam list-attached-role-policies \
  --role-name chat-logs-review-dev-lambda-role
```

#### 4. Increase Timeout
Update CloudFormation template:
```yaml
Timeout: 60  # Increase from 30 to 60 seconds
```

---

## Getting Additional Help

### Collect Diagnostic Information

Before contacting support, collect:

1. **Browser Information**
   - Browser name and version
   - Operating system
   - Screen resolution

2. **Error Messages**
   - Screenshot of error
   - Full error text from console
   - Network tab showing failed requests

3. **Steps to Reproduce**
   - What you were doing
   - What you expected
   - What actually happened

4. **Environment**
   - Development/Staging/Production
   - Application URL
   - Time of occurrence

5. **Logs**
   ```bash
   # Export CloudWatch logs
   aws logs filter-log-events \
     --log-group-name /aws/lambda/chat-logs-review-dev-GetReviewMetrics \
     --start-time $(date -d '1 hour ago' +%s)000 \
     --output json > logs.json
   ```

### Contact Support

1. **Check Documentation First**
   - README.md
   - API Documentation
   - User Guide
   - This Troubleshooting Guide

2. **Search Existing Issues**
   - Check GitHub issues
   - Search internal knowledge base

3. **Create Support Ticket**
   Include:
   - Diagnostic information (above)
   - What you've tried
   - Impact on work
   - Urgency level

4. **Emergency Contact**
   For production issues:
   - Contact: support@example.com
   - Phone: +1-XXX-XXX-XXXX
   - Slack: #chat-logs-review-support

---

**Last Updated**: December 2024  
**Version**: 1.0.0
