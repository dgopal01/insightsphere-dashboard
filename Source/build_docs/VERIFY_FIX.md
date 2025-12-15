# Quick Verification Guide

## What Was Fixed

1. **Schema Mismatch**: Updated code to use single partition keys instead of composite keys
2. **Table Names**: Corrected table names in `.env` to match CloudFormation stack

## Quick Test Steps

### Step 1: Verify Environment Variables
```bash
# Check that table names are correct
cat .env | grep TABLE
```

Expected output:
```
VITE_CHATLOG_TABLE=chat-logs-review-dev-UnityAIAssistantLogs
VITE_FEEDBACK_TABLE=chat-logs-review-dev-UserFeedback
```

### Step 2: Restart Development Server
```bash
# Stop current server (Ctrl+C)
# Start fresh
npm run dev
```

### Step 3: Test Feedback Logs Page
1. Open browser to http://localhost:5173
2. Navigate to "Feedback Logs" page
3. **Expected**: Logs should load without errors
4. Open browser console (F12)
5. **Expected**: See messages like:
   ```
   Fetching feedback logs from table: chat-logs-review-dev-UserFeedback
   Successfully fetched X feedback logs
   ```

### Step 4: Test Feedback Submission
1. Click on any feedback log row
2. Enter review comment: "Test review"
3. Select feedback rating
4. Click "Submit"
5. **Expected**: Success message appears
6. **Expected**: Console shows:
   ```
   Updating feedback log with params: {...}
   Update successful: {...}
   ```

### Step 5: Test Chat Logs Page
1. Navigate to "Chat Logs" page
2. **Expected**: Logs should load without errors
3. **Expected**: Console shows:
   ```
   Fetching chat logs from table: chat-logs-review-dev-UnityAIAssistantLogs
   Successfully fetched X chat logs
   ```

### Step 6: Test Chat Log Review
1. Click on any chat log row
2. Enter review comment and feedback
3. Click "Submit"
4. **Expected**: Success message appears
5. **Expected**: Console shows successful update

## Common Issues & Solutions

### Issue: "Table not found" error
**Solution**: 
- Verify table names in `.env` match actual AWS tables
- Run: `aws dynamodb list-tables --region us-east-1`
- Update `.env` with correct table names

### Issue: "The provided key element does not match the schema"
**Solution**: 
- This should be fixed by the code changes
- If still occurring, verify table schema:
  ```bash
  aws dynamodb describe-table \
    --table-name chat-logs-review-dev-UnityAIAssistantLogs \
    --region us-east-1 \
    --query 'Table.KeySchema'
  ```

### Issue: "Access Denied" or "User is not authorized"
**Solution**:
- Verify Cognito Identity Pool has correct IAM role
- Check that authenticated role has DynamoDB permissions
- See IAM policy in CloudFormation stack

### Issue: Logs not loading
**Solution**:
1. Check browser console for errors
2. Verify AWS credentials are valid
3. Check that you're signed in to the application
4. Verify table names in `.env`

## Verify AWS Resources

### Check Tables Exist
```bash
aws dynamodb list-tables --region us-east-1 | grep -E "(UnityAIAssistantLogs|UserFeedback)"
```

### Check Table Schema
```bash
# Chat Logs table
aws dynamodb describe-table \
  --table-name chat-logs-review-dev-UnityAIAssistantLogs \
  --region us-east-1 \
  --query 'Table.KeySchema'

# Expected output:
# [
#   {
#     "AttributeName": "log_id",
#     "KeyType": "HASH"
#   }
# ]

# Feedback table
aws dynamodb describe-table \
  --table-name chat-logs-review-dev-UserFeedback \
  --region us-east-1 \
  --query 'Table.KeySchema'

# Expected output:
# [
#   {
#     "AttributeName": "id",
#     "KeyType": "HASH"
#   }
# ]
```

### Check IAM Permissions
```bash
# Get Identity Pool authenticated role
aws cognito-identity get-identity-pool-roles \
  --identity-pool-id us-east-1:c4d5c67a-30d9-49ac-bc80-542775e19d9d \
  --region us-east-1

# Check role policies (replace ROLE_NAME with actual role)
aws iam list-attached-role-policies --role-name ROLE_NAME
aws iam list-role-policies --role-name ROLE_NAME
```

## Success Indicators

✅ **All working correctly if you see:**
- Feedback Logs page loads with data
- Chat Logs page loads with data
- Can submit reviews without errors
- Console shows successful fetch/update messages
- No "schema mismatch" errors
- No "table not found" errors

## Need More Help?

Check these files for detailed information:
- `build_docs/SCHEMA_FIX_SUMMARY.md` - Detailed explanation of changes
- `cloudformation/DEPLOYMENT_GUIDE.md` - Deployment instructions
- `src/services/DynamoDBService.ts` - Updated service code
- Browser console (F12) - Real-time error messages and logs
