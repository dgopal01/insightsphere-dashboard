# Debug: No Data Showing in App

## Quick Checks

### 1. Open Browser Console
1. Open the app: https://main.d33feletv96fod.amplifyapp.com
2. Press **F12**
3. Click **Console** tab
4. Click **"Chat Logs"** in the sidebar
5. **Look for errors** - share the exact error message

### 2. Check Network Tab
1. In Developer Tools, click **Network** tab
2. Click **"Chat Logs"** in the sidebar
3. Look for a request to `appsync-api.us-east-1.amazonaws.com`
4. Click on it
5. Check:
   - **Status**: Should be 200, not 401 or 403
   - **Response**: What data is returned?
   - **Headers**: Is Authorization header present?

## Common Issues & Fixes

### Issue 1: 401 Unauthorized

**Cause**: Not authenticated or session expired

**Fix**:
```
1. Sign out of the app
2. Clear browser cache (Ctrl+Shift+Delete)
3. Sign back in
4. Try again
```

### Issue 2: Empty Response

**Cause**: Resolver not mapping data correctly

**Test if data is accessible**:
```bash
# Test DynamoDB directly
aws dynamodb scan --table-name UnityAIAssistantLogs --limit 1 --region us-east-1

# Should return data with fields: log_id, question, response, etc.
```

**Fix**: Update the resolver response template (see CONSOLE_UPDATE_STEPS.md)

### Issue 3: GraphQL Errors

**Check CloudWatch Logs**:
1. Go to: https://console.aws.amazon.com/appsync/home?region=us-east-1
2. Click your API
3. Click "Logs" in left sidebar
4. Look for recent errors

**Common GraphQL errors**:
- `"Cannot return null for non-nullable field"` - Field mapping issue
- `"Unauthorized"` - Authentication issue
- `"Access denied"` - IAM permissions issue

### Issue 4: CORS Errors

**Symptoms**: Error mentions "CORS" or "Access-Control-Allow-Origin"

**Fix**: AppSync should have CORS enabled by default, but check:
```bash
aws appsync get-graphql-api --api-id u3e7wpkmkrevbkkho5rh6pqf6u --region us-east-1
```

## Step-by-Step Debugging

### Step 1: Verify You're Signed In

Open browser console and run:
```javascript
// Check if signed in
localStorage.getItem('CognitoIdentityServiceProvider.6mlu9llcomgp1iokfk3552tvs3.LastAuthUser')
```

Should return your username. If null, you're not signed in.

### Step 2: Check AWS Config

In browser console:
```javascript
// Check if AWS config is loaded
console.log(window.localStorage)
```

Look for Cognito tokens.

### Step 3: Test GraphQL Query Manually

In browser console:
```javascript
// Test query
fetch('https://y7sc7o27czcp3pw6lyib6ma2we.appsync-api.us-east-1.amazonaws.com/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN_HERE' // Get from localStorage
  },
  body: JSON.stringify({
    query: `query { listChatLogs(limit: 2) { items { id userMessage aiResponse } } }`
  })
}).then(r => r.json()).then(console.log)
```

### Step 4: Check Resolver Output

Go to AppSync Console → Queries tab and test:
```graphql
query TestData {
  listChatLogs(limit: 2) {
    items {
      id
      userMessage
      aiResponse
      timestamp
    }
  }
}
```

**If this works in console but not in app**: Authentication issue
**If this doesn't work in console**: Resolver issue

## Most Likely Solutions

### Solution 1: Clear Everything and Re-authenticate

```bash
# In browser console
localStorage.clear()
sessionStorage.clear()

# Then refresh page and sign in again
```

### Solution 2: Add IAM Auth for Testing

```bash
# Add IAM as additional auth
aws appsync update-graphql-api \
  --api-id u3e7wpkmkrevbkkho5rh6pqf6u \
  --name insightsphere-dev-api \
  --authentication-type AMAZON_COGNITO_USER_POOLS \
  --user-pool-config "userPoolId=us-east-1_gYh3rcIFz,awsRegion=us-east-1,defaultAction=ALLOW" \
  --additional-authentication-providers "authenticationType=AWS_IAM" \
  --region us-east-1
```

Then test in AppSync Console with IAM auth.

### Solution 3: Check if Resolvers Were Actually Updated

```bash
# Check listChatLogs resolver
aws appsync get-resolver \
  --api-id u3e7wpkmkrevbkkho5rh6pqf6u \
  --type-name Query \
  --field-name listChatLogs \
  --region us-east-1 \
  --query "resolver.responseMappingTemplate"
```

Should show the mapping template with `$item.log_id`, `$item.question`, etc.

## What to Share for Help

If still not working, share:

1. **Browser console errors** (screenshot or copy/paste)
2. **Network tab** - Status code and response for the GraphQL request
3. **Result of this command**:
   ```bash
   aws appsync get-resolver --api-id u3e7wpkmkrevbkkho5rh6pqf6u --type-name Query --field-name listChatLogs --region us-east-1 --query "resolver.responseMappingTemplate" --output text
   ```

This will help identify the exact issue!

## Quick Test Script

Run this to test everything:

```bash
echo "=== Testing DynamoDB Access ==="
aws dynamodb scan --table-name UnityAIAssistantLogs --limit 1 --region us-east-1 --query "Items[0].{log_id:log_id.S,question:question.S}"

echo ""
echo "=== Testing AppSync API ==="
aws appsync get-graphql-api --api-id u3e7wpkmkrevbkkho5rh6pqf6u --region us-east-1 --query "graphqlApi.authenticationType"

echo ""
echo "=== Testing IAM Permissions ==="
aws iam get-role-policy --role-name insightsphere-dev-appsync-role --policy-name DynamoDBAccess --query "PolicyDocument.Statement[0].Resource"

echo ""
echo "=== Testing Resolver ==="
aws appsync get-resolver --api-id u3e7wpkmkrevbkkho5rh6pqf6u --type-name Query --field-name listChatLogs --region us-east-1 --query "resolver.dataSourceName"
```

This will show if everything is configured correctly.
