# Troubleshooting 401 Error

## Where is the error happening?

### Option 1: In the Web App

**Check browser console** (F12):
1. Open the app: https://main.d33feletv96fod.amplifyapp.com
2. Press F12 to open Developer Tools
3. Go to Console tab
4. Look for the full error message

**Common causes**:
1. User session expired
2. AppSync API authentication mode mismatch
3. Missing authentication token

**Quick fixes**:

#### Fix 1: Sign out and sign back in
1. Click your profile icon → Sign Out
2. Sign in again with your credentials
3. Try accessing Chat Logs again

#### Fix 2: Check AppSync Authentication Mode

The AppSync API might be configured for a different auth mode. Let's check:

```bash
aws appsync get-graphql-api --api-id u3e7wpkmkrevbkkho5rh6pqf6u --region us-east-1 --query "graphqlApi.authenticationType"
```

Should return: `"AMAZON_COGNITO_USER_POOLS"`

If it returns something else, we need to update it.

#### Fix 3: Update AppSync API Authentication

If the authentication type is wrong, update it:

```bash
aws appsync update-graphql-api \
  --api-id u3e7wpkmkrevbkkho5rh6pqf6u \
  --name insightsphere-dev-api \
  --authentication-type AMAZON_COGNITO_USER_POOLS \
  --user-pool-config "userPoolId=us-east-1_gYh3rcIFz,awsRegion=us-east-1,defaultAction=ALLOW" \
  --region us-east-1
```

### Option 2: In AppSync Console (Queries tab)

If you're testing in the AppSync Console Queries tab:

1. **Look for "Authorization" dropdown** at the top of the Queries page
2. **Select "Amazon Cognito User Pools"**
3. **You'll need to provide a token**

**To get a token for testing**:

```bash
# Sign in and get tokens
aws cognito-idp initiate-auth \
  --auth-flow USER_PASSWORD_AUTH \
  --client-id 6mlu9llcomgp1iokfk3552tvs3 \
  --auth-parameters USERNAME=dgopal@swbc.com,PASSWORD=YOUR_PASSWORD \
  --region us-east-1
```

This returns an `IdToken` - copy it and paste into the AppSync Console.

**Easier alternative**: Use AWS IAM authentication for testing:

1. In AppSync Console → Settings
2. Add "AWS_IAM" as an additional authorization mode
3. Then in Queries tab, select "AWS IAM" from the Authorization dropdown

## Detailed Diagnostics

### Step 1: Check if you're signed in

Open browser console and run:
```javascript
import { fetchAuthSession } from 'aws-amplify/auth';
const session = await fetchAuthSession();
console.log('Signed in:', !!session.tokens);
```

### Step 2: Check AppSync configuration

```bash
# Check API details
aws appsync get-graphql-api --api-id u3e7wpkmkrevbkkho5rh6pqf6u --region us-east-1

# Check data sources
aws appsync list-data-sources --api-id u3e7wpkmkrevbkkho5rh6pqf6u --region us-east-1
```

### Step 3: Check IAM permissions

The AppSync service role needs permissions for your tables:

```bash
aws iam get-role-policy \
  --role-name insightsphere-dev-appsync-role \
  --policy-name DynamoDBAccess
```

Should show permissions for:
- `UnityAIAssistantLogs`
- `userFeedback`

### Step 4: Test direct DynamoDB access

```bash
# Test if tables are accessible
aws dynamodb scan --table-name UnityAIAssistantLogs --limit 1 --region us-east-1
aws dynamodb scan --table-name userFeedback --limit 1 --region us-east-1
```

## Most Likely Solution

The 401 error is most likely because:

1. **You need to sign out and sign back in** (session expired)
2. **AppSync API auth mode needs to be updated**

Try this:

```bash
# Update AppSync API to use Cognito User Pools
aws appsync update-graphql-api \
  --api-id u3e7wpkmkrevbkkho5rh6pqf6u \
  --name insightsphere-dev-api \
  --authentication-type AMAZON_COGNITO_USER_POOLS \
  --user-pool-config "userPoolId=us-east-1_gYh3rcIFz,awsRegion=us-east-1,defaultAction=ALLOW" \
  --region us-east-1
```

Then:
1. Clear browser cache
2. Sign out of the app
3. Sign back in
4. Try accessing Chat Logs again

## If Still Not Working

Share the exact error from browser console:
1. Open app
2. Press F12
3. Go to Console tab
4. Try to access Chat Logs
5. Copy the full error message

This will help me diagnose the exact issue.
