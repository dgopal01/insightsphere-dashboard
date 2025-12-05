# Configuration Guide - Chat Logs Review System

This guide provides detailed information about configuring the Chat Logs Review System for different environments.

## Table of Contents

- [Environment Variables](#environment-variables)
- [AWS Configuration](#aws-configuration)
- [Build Configuration](#build-configuration)
- [Runtime Configuration](#runtime-configuration)
- [Security Configuration](#security-configuration)
- [Performance Configuration](#performance-configuration)
- [Monitoring Configuration](#monitoring-configuration)

## Environment Variables

### Overview

The application uses environment variables for configuration. Variables are prefixed with `VITE_` to be accessible in the browser.

### Environment Files

- `.env.example`: Template with placeholder values
- `.env.development`: Development environment settings
- `.env.staging`: Staging environment settings
- `.env.production`: Production environment settings
- `.env`: Local environment (not committed to Git)

### Required Variables

#### AWS Region

```env
VITE_AWS_REGION=us-east-1
```

**Description**: AWS region where resources are deployed

**Values**:
- `us-east-1`: US East (N. Virginia)
- `us-west-2`: US West (Oregon)
- `eu-west-1`: Europe (Ireland)
- Other AWS regions

**Required**: Yes

---

#### Cognito User Pool ID

```env
VITE_USER_POOL_ID=us-east-1_XXXXXXXXX
```

**Description**: Cognito User Pool identifier for authentication

**Format**: `<region>_<alphanumeric>`

**How to Get**:
```bash
aws cloudformation describe-stacks \
  --stack-name chat-logs-review-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`UserPoolId`].OutputValue' \
  --output text
```

**Required**: Yes

---

#### Cognito User Pool Client ID

```env
VITE_USER_POOL_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Description**: Cognito App Client ID for the application

**Format**: 26-character alphanumeric string

**How to Get**:
```bash
aws cloudformation describe-stacks \
  --stack-name chat-logs-review-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`UserPoolClientId`].OutputValue' \
  --output text
```

**Required**: Yes

---

#### Cognito Identity Pool ID

```env
VITE_IDENTITY_POOL_ID=us-east-1:XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
```

**Description**: Cognito Identity Pool for AWS credentials

**Format**: `<region>:<uuid>`

**How to Get**:
```bash
aws cloudformation describe-stacks \
  --stack-name chat-logs-review-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`IdentityPoolId`].OutputValue' \
  --output text
```

**Required**: Yes

---

#### GraphQL Endpoint

```env
VITE_GRAPHQL_ENDPOINT=https://XXXXXXXXXXXXXXXXXXXXXXXXXX.appsync-api.us-east-1.amazonaws.com/graphql
```

**Description**: AWS AppSync GraphQL API endpoint

**Format**: `https://<api-id>.appsync-api.<region>.amazonaws.com/graphql`

**How to Get**:
```bash
aws cloudformation describe-stacks \
  --stack-name chat-logs-review-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`GraphQLApiUrl`].OutputValue' \
  --output text
```

**Required**: Yes

---

#### Cognito Domain

```env
VITE_COGNITO_DOMAIN=your-unique-prefix.auth.us-east-1.amazoncognito.com
```

**Description**: Cognito Hosted UI domain

**Format**: `<domain-prefix>.auth.<region>.amazoncognito.com`

**How to Get**:
```bash
aws cloudformation describe-stacks \
  --stack-name chat-logs-review-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`CognitoDomain`].OutputValue' \
  --output text
```

**Required**: Yes

### Optional Variables

#### Environment Name

```env
VITE_ENV=development
```

**Description**: Environment identifier

**Values**:
- `development`: Development environment
- `staging`: Staging environment
- `production`: Production environment

**Default**: `development`

**Required**: No

---

#### Debug Mode

```env
VITE_DEBUG_MODE=true
```

**Description**: Enable debug logging and features

**Values**:
- `true`: Enable debug mode
- `false`: Disable debug mode

**Default**: `false`

**Recommended**:
- Development: `true`
- Staging: `false`
- Production: `false`

**Required**: No

---

#### Log Level

```env
VITE_LOG_LEVEL=debug
```

**Description**: Logging verbosity level

**Values**:
- `debug`: All logs (verbose)
- `info`: Informational logs
- `warn`: Warnings only
- `error`: Errors only

**Default**: `error`

**Recommended**:
- Development: `debug`
- Staging: `info`
- Production: `error`

**Required**: No

---

#### API Timeout

```env
VITE_API_TIMEOUT=30000
```

**Description**: API request timeout in milliseconds

**Default**: `30000` (30 seconds)

**Range**: 5000-60000 (5-60 seconds)

**Required**: No

---

#### API Retry Attempts

```env
VITE_API_RETRY_ATTEMPTS=3
```

**Description**: Number of retry attempts for failed API requests

**Default**: `3`

**Range**: 0-5

**Required**: No

---

#### Enable Source Maps

```env
VITE_ENABLE_SOURCE_MAPS=true
```

**Description**: Generate source maps for debugging

**Values**:
- `true`: Generate source maps
- `false`: No source maps

**Default**: `false`

**Recommended**:
- Development: `true`
- Staging: `true`
- Production: `false`

**Required**: No

## AWS Configuration

### CloudFormation Parameters

When deploying the CloudFormation stack, configure these parameters:

#### EnvironmentName

```yaml
ParameterKey: EnvironmentName
ParameterValue: dev
```

**Description**: Environment name for resource naming

**Values**: `dev`, `staging`, `prod`

**Default**: `dev`

---

#### ProjectName

```yaml
ParameterKey: ProjectName
ParameterValue: chat-logs-review
```

**Description**: Project name for resource naming

**Default**: `chat-logs-review`

---

#### CognitoDomainPrefix

```yaml
ParameterKey: CognitoDomainPrefix
ParameterValue: your-unique-prefix-dev
```

**Description**: Unique domain prefix for Cognito Hosted UI

**Requirements**:
- Must be globally unique across all AWS accounts
- Lowercase letters, numbers, and hyphens only
- 1-63 characters

**Example**: `mycompany-chat-review-dev`

### DynamoDB Configuration

#### Table Names

Tables are automatically named by CloudFormation:

- Chat Logs: `{ProjectName}-{EnvironmentName}-UnityAIAssistantLogs`
- Feedback: `{ProjectName}-{EnvironmentName}-UserFeedback`

Example: `chat-logs-review-dev-UnityAIAssistantLogs`

#### Billing Mode

```yaml
BillingMode: PAY_PER_REQUEST
```

**Options**:
- `PAY_PER_REQUEST`: On-demand pricing (recommended)
- `PROVISIONED`: Provisioned capacity

#### Point-in-Time Recovery

```yaml
PointInTimeRecoveryEnabled: true  # Production only
```

**Enabled for**: Production environment only

**Purpose**: Backup and recovery

### Lambda Configuration

#### Function Settings

```yaml
Runtime: python3.11
Handler: index.lambda_handler
Timeout: 30
MemorySize: 256
```

**Timeout**: 30 seconds (max time for metrics calculation)

**Memory**: 256 MB (sufficient for scanning tables)

#### Environment Variables

Lambda function receives:

```yaml
CHAT_LOGS_TABLE: chat-logs-review-dev-UnityAIAssistantLogs
FEEDBACK_TABLE: chat-logs-review-dev-UserFeedback
```

### AppSync Configuration

#### Authentication

```yaml
AuthenticationType: AMAZON_COGNITO_USER_POOLS
```

**Type**: Cognito User Pools

**Requires**: Valid JWT token in Authorization header

#### Logging

```yaml
FieldLogLevel: ALL  # Development/Staging
FieldLogLevel: ERROR  # Production
```

**Levels**:
- `NONE`: No logging
- `ERROR`: Errors only
- `ALL`: All requests and responses

## Build Configuration

### Vite Configuration

Located in `vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: process.env.VITE_ENABLE_SOURCE_MAPS === 'true',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          aws: ['aws-amplify', '@aws-amplify/ui-react']
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true
  }
});
```

### TypeScript Configuration

Located in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "react-jsx",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### Build Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "build:dev": "tsc && vite build --mode development",
    "build:staging": "tsc && vite build --mode staging",
    "build:prod": "tsc && vite build --mode production",
    "preview": "vite preview"
  }
}
```

## Runtime Configuration

### React Router Configuration

Routes defined in `src/App.tsx`:

```typescript
const routes = [
  { path: '/', element: <ReviewDashboardPage /> },
  { path: '/chat-logs', element: <ChatLogsReviewPage /> },
  { path: '/feedback-logs', element: <FeedbackLogsReviewPage /> },
  { path: '/signin', element: <SignInPage /> }
];
```

### Amplify Configuration

Located in `src/amplify-config.ts`:

```typescript
const amplifyConfig = {
  Auth: {
    region: import.meta.env.VITE_AWS_REGION,
    userPoolId: import.meta.env.VITE_USER_POOL_ID,
    userPoolWebClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,
    identityPoolId: import.meta.env.VITE_IDENTITY_POOL_ID,
    oauth: {
      domain: import.meta.env.VITE_COGNITO_DOMAIN,
      scope: ['email', 'openid', 'profile'],
      redirectSignIn: window.location.origin,
      redirectSignOut: window.location.origin,
      responseType: 'code'
    }
  },
  API: {
    GraphQL: {
      endpoint: import.meta.env.VITE_GRAPHQL_ENDPOINT,
      region: import.meta.env.VITE_AWS_REGION,
      defaultAuthMode: 'userPool'
    }
  }
};
```

## Security Configuration

### Content Security Policy

Add to `index.html`:

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline'; 
               connect-src 'self' https://*.amazonaws.com https://*.amazoncognito.com;">
```

### CORS Configuration

AppSync CORS is configured in CloudFormation:

```yaml
AllowedOrigins:
  - http://localhost:5173
  - https://*.amplifyapp.com
```

### IAM Policies

Minimum required permissions for authenticated users:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "appsync:GraphQL"
      ],
      "Resource": "arn:aws:appsync:*:*:apis/*/types/Query/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "appsync:GraphQL"
      ],
      "Resource": "arn:aws:appsync:*:*:apis/*/types/Mutation/*"
    }
  ]
}
```

## Performance Configuration

### Caching

#### Browser Caching

Configure in Amplify Hosting:

```yaml
customHeaders:
  - pattern: '**/*.js'
    headers:
      - key: 'Cache-Control'
        value: 'public, max-age=31536000, immutable'
  - pattern: '**/*.css'
    headers:
      - key: 'Cache-Control'
        value: 'public, max-age=31536000, immutable'
  - pattern: '/index.html'
    headers:
      - key: 'Cache-Control'
        value: 'no-cache'
```

#### GraphQL Caching

Configure in custom hooks:

```typescript
const cacheConfig = {
  ttl: 300000, // 5 minutes
  maxSize: 100 // Max cached queries
};
```

### Code Splitting

Configured in `vite.config.ts`:

```typescript
manualChunks: {
  vendor: ['react', 'react-dom'],
  mui: ['@mui/material'],
  aws: ['aws-amplify']
}
```

### Lazy Loading

Implement in routes:

```typescript
const ChatLogsReviewPage = lazy(() => import('./pages/ChatLogsReviewPage'));
const FeedbackLogsReviewPage = lazy(() => import('./pages/FeedbackLogsReviewPage'));
```

## Monitoring Configuration

### CloudWatch Logs

#### Log Groups

- Lambda: `/aws/lambda/chat-logs-review-{env}-GetReviewMetrics`
- AppSync: `/aws/appsync/apis/{api-id}`

#### Log Retention

```yaml
RetentionInDays: 7  # Development
RetentionInDays: 30  # Staging
RetentionInDays: 90  # Production
```

### CloudWatch Alarms

#### High Error Rate

```yaml
MetricName: Errors
Namespace: AWS/Lambda
Threshold: 10
Period: 300
EvaluationPeriods: 1
ComparisonOperator: GreaterThanThreshold
```

#### High Latency

```yaml
MetricName: Duration
Namespace: AWS/Lambda
Threshold: 5000
Period: 300
EvaluationPeriods: 2
ComparisonOperator: GreaterThanThreshold
```

### Custom Metrics

Publish custom metrics:

```typescript
const publishMetric = async (metricName: string, value: number) => {
  await cloudwatch.putMetricData({
    Namespace: 'ChatLogsReview',
    MetricData: [{
      MetricName: metricName,
      Value: value,
      Unit: 'Count',
      Timestamp: new Date()
    }]
  });
};
```

## Configuration Validation

### Validation Script

Create `scripts/validate-config.js`:

```javascript
const requiredVars = [
  'VITE_AWS_REGION',
  'VITE_USER_POOL_ID',
  'VITE_USER_POOL_CLIENT_ID',
  'VITE_IDENTITY_POOL_ID',
  'VITE_GRAPHQL_ENDPOINT',
  'VITE_COGNITO_DOMAIN'
];

requiredVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`Missing required environment variable: ${varName}`);
    process.exit(1);
  }
});

console.log('✓ All required environment variables are set');
```

Run before build:

```bash
node scripts/validate-config.js && npm run build
```

## Configuration Best Practices

1. **Never Commit Secrets**: Add `.env` to `.gitignore`
2. **Use Templates**: Provide `.env.example` with placeholders
3. **Validate Early**: Check configuration before deployment
4. **Document Changes**: Update this guide when adding variables
5. **Environment Separation**: Use different values per environment
6. **Secure Storage**: Use AWS Secrets Manager for sensitive values
7. **Rotate Credentials**: Regularly update access keys and tokens
8. **Audit Access**: Review who has access to configuration
9. **Version Control**: Track configuration changes in Git
10. **Test Configuration**: Verify in each environment

## Troubleshooting Configuration

### Environment Variables Not Loading

**Issue**: Application can't read environment variables

**Solutions**:
1. Verify `.env` file exists in project root
2. Check variable names start with `VITE_`
3. Restart development server after changes
4. Clear browser cache
5. Check for typos in variable names

### Invalid AWS Credentials

**Issue**: Authentication or API calls fail

**Solutions**:
1. Verify all AWS variables are set correctly
2. Check CloudFormation outputs match `.env` values
3. Ensure no placeholder values (XXXXXXXXX)
4. Verify Cognito domain is correct
5. Check GraphQL endpoint URL

### Build Failures

**Issue**: Build fails with configuration errors

**Solutions**:
1. Run configuration validation script
2. Check TypeScript compilation errors
3. Verify all imports are correct
4. Clear `node_modules` and reinstall
5. Check Vite configuration syntax

## Additional Resources

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [AWS Amplify Configuration](https://docs.amplify.aws/lib/client-configuration/configuring-amplify-categories/)
- [AWS CloudFormation Parameters](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/parameters-section-structure.html)

---

**Last Updated**: December 2024  
**Version**: 1.0.0
