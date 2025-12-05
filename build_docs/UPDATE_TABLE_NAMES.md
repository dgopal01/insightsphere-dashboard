# ✅ Table Names Updated!

## What Was Done

### 1. AppSync Data Sources Updated
✅ **ChatLogTable** now points to: `UnityAIAssistantLogs`
✅ **FeedbackTable** now points to: `userFeedback`

### 2. IAM Permissions Updated
✅ AppSync role now has permissions for the new tables

### 3. Local Environment Updated
✅ `.env` file updated with new table names

## Next Step: Update Amplify Console Environment Variables

You need to update the environment variables in Amplify Console:

### Option 1: Via AWS Console (Easiest)

1. **Open Amplify Console**:
   https://console.aws.amazon.com/amplify/home?region=us-east-1#/d33feletv96fod/settings/variables

2. **Update these two variables**:
   - `VITE_CHATLOG_TABLE`: Change to `UnityAIAssistantLogs`
   - `VITE_FEEDBACK_TABLE`: Change to `userFeedback`

3. **Click "Save"**

4. **Redeploy**:
   - Go to main branch
   - Click "Redeploy this version"

### Option 2: Via AWS CLI

Run this command:

```powershell
# Note: This updates ALL environment variables, so we include all of them
aws amplify update-branch `
  --app-id d33feletv96fod `
  --branch-name main `
  --region us-east-1 `
  --environment-variables `
    VITE_AWS_REGION=us-east-1 `
    VITE_USER_POOL_ID=us-east-1_gYh3rcIFz `
    VITE_USER_POOL_CLIENT_ID=6mlu9llcomgp1iokfk3552tvs3 `
    VITE_IDENTITY_POOL_ID=us-east-1:c4d5c67a-30d9-49ac-bc80-542775e19d9d `
    VITE_GRAPHQL_ENDPOINT=https://y7sc7o27czcp3pw6lyib6ma2we.appsync-api.us-east-1.amazonaws.com/graphql `
    VITE_GRAPHQL_API_ID=u3e7wpkmkrevbkkho5rh6pqf6u `
    VITE_S3_BUCKET=insightsphere-dev-exports-327052515912 `
    VITE_CHATLOG_TABLE=UnityAIAssistantLogs `
    VITE_FEEDBACK_TABLE=userFeedback `
    VITE_ENV=dev `
    VITE_DEBUG_MODE=true `
    VITE_ENABLE_ANALYTICS=false `
    VITE_ENABLE_ERROR_TRACKING=true
```

Then trigger a new build:
```powershell
aws amplify start-job `
  --app-id d33feletv96fod `
  --branch-name main `
  --job-type RELEASE `
  --region us-east-1
```

## Verification

After the build completes:

### 1. Check the App
- Open: https://main.d33feletv96fod.amplifyapp.com
- Go to "Chat Logs" page
- You should see data from `UnityAIAssistantLogs` table

### 2. Check Browser Console
- Open browser console (F12)
- Look for any GraphQL errors
- Should see data loading successfully

### 3. Test Feedback
- Go to "Feedback" page
- Should see data from `userFeedback` table
- Try submitting new feedback

## Table Schema Requirements

Make sure your tables have the correct schema:

### UnityAIAssistantLogs Table
**Required attributes**:
- `id` (String) - Primary Key
- `conversationId` (String)
- `userId` (String)
- `userMessage` (String)
- `aiResponse` (String)
- `timestamp` (String)

**Optional GSIs** (for better performance):
- `byConversation` - conversationId (HASH) + timestamp (RANGE)
- `byUser` - userId (HASH) + timestamp (RANGE)

### userFeedback Table
**Required attributes**:
- `id` (String) - Primary Key
- `logId` (String)
- `userId` (String)
- `rating` (Number)
- `timestamp` (String)
- `comment` (String) - Optional

**Optional GSIs**:
- `byLogId` - logId (HASH) + timestamp (RANGE)
- `byUser` - userId (HASH) + timestamp (RANGE)

## Troubleshooting

### No Data Showing
**Possible causes**:
1. Tables are empty
2. Schema doesn't match
3. IAM permissions issue

**Solutions**:
- Check if tables have data in DynamoDB console
- Verify table schema matches requirements
- Check browser console for GraphQL errors

### GraphQL Errors
**Possible causes**:
1. Missing required fields
2. Wrong data types
3. IAM permissions

**Solutions**:
- Check CloudWatch logs for AppSync
- Verify IAM role has permissions
- Check table schema

### Permission Errors
**If you see permission errors**:

Verify IAM role has access:
```powershell
aws iam get-role-policy `
  --role-name insightsphere-dev-appsync-role `
  --policy-name DynamoDBAccess
```

Should show permissions for:
- `UnityAIAssistantLogs`
- `userFeedback`

## Summary

✅ **Backend Updated**: AppSync now reads from your tables
✅ **Permissions Set**: IAM role has access
⏳ **Frontend Update Needed**: Update Amplify environment variables

Once you update the environment variables and redeploy, the app will read from your tables!

---

**Current Status**:
- AppSync Data Sources: ✅ Updated
- IAM Permissions: ✅ Updated
- Local .env: ✅ Updated
- Amplify Console Variables: ⏳ Needs update (see instructions above)
