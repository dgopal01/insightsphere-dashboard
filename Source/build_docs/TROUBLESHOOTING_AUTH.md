# Troubleshooting: Auth UserPool Not Configured

## Issue
Getting "Auth UserPool not configured" error when trying to sign in to the deployed app.

## Root Cause
Environment variables are not being injected into the build properly, causing the AWS configuration to be empty.

## Diagnosis Steps

### 1. Check Browser Console
Open the deployed app and check the browser console (F12):

Look for the log message:
```
AWS Config Status: {
  region: "us-east-1",
  hasUserPoolId: true/false,
  userPoolIdPrefix: "us-east-1_..." or "MISSING",
  ...
}
```

If you see `hasUserPoolId: false` or `userPoolIdPrefix: "MISSING"`, the environment variables aren't being loaded.

### 2. Verify Environment Variables in Amplify Console

1. Go to: https://console.aws.amazon.com/amplify/home?region=us-east-1#/d33feletv96fod/settings/variables

2. Verify these variables are set:
   ```
   VITE_AWS_REGION=us-east-1
   VITE_USER_POOL_ID=us-east-1_gYh3rcIFz
   VITE_USER_POOL_CLIENT_ID=6mlu9llcomgp1iokfk3552tvs3
   VITE_IDENTITY_POOL_ID=us-east-1:c4d5c67a-30d9-49ac-bc80-542775e19d9d
   VITE_GRAPHQL_ENDPOINT=https://y7sc7o27czcp3pw6lyib6ma2we.appsync-api.us-east-1.amazonaws.com/graphql
   VITE_GRAPHQL_API_ID=u3e7wpkmkrevbkkho5rh6pqf6u
   VITE_S3_BUCKET=insightsphere-dev-exports-327052515912
   ```

### 3. Check Build Logs

1. Go to: https://console.aws.amazon.com/amplify/home?region=us-east-1#/d33feletv96fod

2. Click on the latest build

3. Look for environment variables in the "Build" phase:
   - Should see `VITE_USER_POOL_ID` and other variables
   - If not visible, they might not be set correctly

## Solutions

### Solution 1: Verify and Re-add Environment Variables

If environment variables are missing or incorrect:

```bash
# Update environment variables via CLI
aws amplify update-app \
  --app-id d33feletv96fod \
  --region us-east-1 \
  --environment-variables \
    VITE_AWS_REGION=us-east-1 \
    VITE_USER_POOL_ID=us-east-1_gYh3rcIFz \
    VITE_USER_POOL_CLIENT_ID=6mlu9llcomgp1iokfk3552tvs3 \
    VITE_IDENTITY_POOL_ID=us-east-1:c4d5c67a-30d9-49ac-bc80-542775e19d9d \
    VITE_GRAPHQL_ENDPOINT=https://y7sc7o27czcp3pw6lyib6ma2we.appsync-api.us-east-1.amazonaws.com/graphql \
    VITE_GRAPHQL_API_ID=u3e7wpkmkrevbkkho5rh6pqf6u \
    VITE_S3_BUCKET=insightsphere-dev-exports-327052515912 \
    VITE_ENV=dev \
    VITE_DEBUG_MODE=true
```

Then trigger a new build:
```bash
aws amplify start-job \
  --app-id d33feletv96fod \
  --branch-name main \
  --job-type RELEASE \
  --region us-east-1
```

### Solution 2: Add Variables via Console

1. Go to Amplify Console → Environment variables
2. Click "Manage variables"
3. Add each variable manually
4. Save
5. Redeploy

### Solution 3: Use Hardcoded Configuration (Temporary)

If environment variables continue to fail, temporarily use hardcoded values:

Edit `src/aws-exports.ts`:
```typescript
const awsconfig = {
  aws_project_region: 'us-east-1',
  aws_cognito_region: 'us-east-1',
  aws_user_pools_id: 'us-east-1_gYh3rcIFz',
  aws_user_pools_web_client_id: '6mlu9llcomgp1iokfk3552tvs3',
  aws_cognito_identity_pool_id: 'us-east-1:c4d5c67a-30d9-49ac-bc80-542775e19d9d',
  aws_appsync_graphqlEndpoint: 'https://y7sc7o27czcp3pw6lyib6ma2we.appsync-api.us-east-1.amazonaws.com/graphql',
  aws_appsync_region: 'us-east-1',
  aws_appsync_authenticationType: 'AMAZON_COGNITO_USER_POOLS' as const,
  aws_user_files_s3_bucket: 'insightsphere-dev-exports-327052515912',
  aws_user_files_s3_bucket_region: 'us-east-1',
};
```

Commit and push:
```bash
git add src/aws-exports.ts
git commit -m "Use hardcoded AWS configuration temporarily"
git push origin main
```

### Solution 4: Check Vite Configuration

Verify `vite.config.ts` doesn't have any issues with environment variable loading:

```typescript
// Should have this in vite.config.ts
export default defineConfig({
  // ... other config
  envPrefix: 'VITE_', // This is the default
});
```

## Verification

After applying a solution:

1. Wait for build to complete (~3-5 minutes)
2. Open the app: https://main.d33feletv96fod.amplifyapp.com
3. Open browser console (F12)
4. Look for the "AWS Config Status" log
5. Verify all values show as present:
   ```
   hasUserPoolId: true
   hasClientId: true
   hasGraphQLEndpoint: true
   ```

## Common Issues

### Issue: Variables show in Console but not in build
**Cause**: Build cache
**Solution**: Clear cache and rebuild
```bash
aws amplify start-job \
  --app-id d33feletv96fod \
  --branch-name main \
  --job-type RELEASE \
  --region us-east-1
```

### Issue: Variables work locally but not in Amplify
**Cause**: Amplify environment variables not set
**Solution**: Set variables in Amplify Console (Solution 2)

### Issue: Build succeeds but app shows empty config
**Cause**: Vite not injecting variables at build time
**Solution**: Use hardcoded config (Solution 3) or check Vite config

## Testing Locally

To test if environment variables work locally:

1. Create `.env.local`:
   ```
   VITE_AWS_REGION=us-east-1
   VITE_USER_POOL_ID=us-east-1_gYh3rcIFz
   VITE_USER_POOL_CLIENT_ID=6mlu9llcomgp1iokfk3552tvs3
   VITE_IDENTITY_POOL_ID=us-east-1:c4d5c67a-30d9-49ac-bc80-542775e19d9d
   VITE_GRAPHQL_ENDPOINT=https://y7sc7o27czcp3pw6lyib6ma2we.appsync-api.us-east-1.amazonaws.com/graphql
   VITE_GRAPHQL_API_ID=u3e7wpkmkrevbkkho5rh6pqf6u
   VITE_S3_BUCKET=insightsphere-dev-exports-327052515912
   ```

2. Run dev server:
   ```bash
   npm run dev
   ```

3. Check console for "AWS Config Status"

4. If it works locally, the issue is with Amplify environment variables

## Next Steps

1. **Wait for current build** to complete (includes debug logging)
2. **Open the app** and check browser console
3. **Share the console output** to diagnose further
4. **Apply appropriate solution** based on diagnosis

---

**Current Build Status**: Check at https://console.aws.amazon.com/amplify/home?region=us-east-1#/d33feletv96fod
