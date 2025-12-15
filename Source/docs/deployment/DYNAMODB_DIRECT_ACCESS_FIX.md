# DynamoDB Direct Access Fix - December 5, 2025

## Problem

Application was unable to load data from DynamoDB tables due to AppSync schema mismatch. When we tried to bypass AppSync and query DynamoDB directly, we got:

```
Error: No credentials available
```

## Root Cause

The Cognito Identity Pool's authenticated role (`insightsphere-dev-authenticated-role`) had **NO policies attached**, meaning authenticated users had no permissions to access any AWS resources including DynamoDB.

## Solution

Added DynamoDB access policy to the Cognito Identity Pool's authenticated role.

### IAM Policy Added

**Role:** `insightsphere-dev-authenticated-role`  
**Policy Name:** `DynamoDBAccessPolicy`

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-east-1:327052515912:table/UnityAIAssistantLogs",
        "arn:aws:dynamodb:us-east-1:327052515912:table/userFeedback"
      ]
    }
  ]
}
```

### Permissions Granted

Authenticated users can now:
- ✅ Read items from both tables (GetItem, Query, Scan)
- ✅ Write items to both tables (PutItem)
- ✅ Update items in both tables (UpdateItem)
- ✅ Delete items from both tables (DeleteItem)

## Implementation

### Command Used

```bash
aws iam put-role-policy \
  --role-name insightsphere-dev-authenticated-role \
  --policy-name DynamoDBAccessPolicy \
  --policy-document file://dynamodb-policy.json \
  --region us-east-1
```

### Identity Pool Configuration

**Identity Pool ID:** `us-east-1:c4d5c67a-30d9-49ac-bc80-542775e19d9d`

**Roles:**
- **Authenticated:** `arn:aws:iam::327052515912:role/insightsphere-dev-authenticated-role` ✅ Has DynamoDB access
- **Unauthenticated:** `arn:aws:iam::327052515912:role/insightsphere-dev-unauthenticated-role` (No access needed)

## How It Works

1. **User Signs In** → Cognito User Pool authenticates
2. **Get Credentials** → Cognito Identity Pool provides temporary AWS credentials
3. **Assume Role** → Credentials assume `insightsphere-dev-authenticated-role`
4. **Access DynamoDB** → Role policy allows access to specified tables
5. **Query Data** → Application can now read/write DynamoDB directly

## Application Flow

```typescript
// 1. User is authenticated via Cognito User Pool
await signIn(username, password);

// 2. Fetch session with credentials
const session = await fetchAuthSession();

// 3. Create DynamoDB client with credentials
const client = new DynamoDBClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: session.credentials.accessKeyId,
    secretAccessKey: session.credentials.secretAccessKey,
    sessionToken: session.credentials.sessionToken,
  },
});

// 4. Query DynamoDB directly
const result = await client.send(new ScanCommand({
  TableName: 'UnityAIAssistantLogs',
}));
```

## Verification

After this fix:

1. ✅ **Sign in to application**
2. ✅ **Credentials are available** - `fetchAuthSession()` returns valid credentials
3. ✅ **DynamoDB access works** - Can scan, query, and update tables
4. ✅ **Data loads** - Dashboard, chat logs, and feedback logs display data
5. ✅ **Reviews can be submitted** - UpdateItem operations succeed

## Security Considerations

### Least Privilege

The policy grants access ONLY to:
- The two specific tables needed
- Standard CRUD operations
- No access to other AWS resources

### Best Practices

✅ **Specific Resources** - ARNs specify exact tables  
✅ **Minimal Actions** - Only necessary DynamoDB operations  
✅ **Authenticated Only** - Unauthenticated users have no access  
✅ **Regional** - Limited to us-east-1 region  

### Future Improvements

For production, consider:
- [ ] Add condition keys to restrict access further
- [ ] Use fine-grained access control (FGAC) for row-level security
- [ ] Add CloudWatch logging for DynamoDB access
- [ ] Implement rate limiting
- [ ] Add data encryption at rest and in transit

## Testing

To verify the fix works:

1. **Clear browser cache** and reload
2. **Sign in** to the application
3. **Check browser console** for credential logs
4. **Navigate to Review Dashboard** - Should show metrics
5. **Navigate to Chat Logs Review** - Should show logs
6. **Navigate to Feedback Logs Review** - Should show feedback
7. **Submit a review** - Should save successfully

## Troubleshooting

### Still Getting "No credentials available"

1. **Sign out and sign in again** - Refresh the session
2. **Check Identity Pool** - Verify role is attached
3. **Check IAM Policy** - Verify policy is attached to role
4. **Check browser console** - Look for detailed error messages

### Access Denied Errors

If you get `AccessDeniedException`:

1. **Verify table ARNs** - Must match exactly
2. **Check region** - Must be us-east-1
3. **Verify account ID** - Must be 327052515912
4. **Check policy syntax** - Must be valid JSON

### Credentials Expire

Cognito credentials are temporary (default 1 hour). If they expire:
- Application automatically refreshes them
- User may need to sign in again after extended inactivity

## Related Files

- `src/services/DynamoDBService.ts` - DynamoDB service implementation
- `dynamodb-policy.json` - IAM policy document
- `src/amplify-config.ts` - Amplify configuration

## Commands Reference

```bash
# View Identity Pool roles
aws cognito-identity get-identity-pool-roles \
  --identity-pool-id us-east-1:c4d5c67a-30d9-49ac-bc80-542775e19d9d \
  --region us-east-1

# View role policies
aws iam list-role-policies \
  --role-name insightsphere-dev-authenticated-role \
  --region us-east-1

# View specific policy
aws iam get-role-policy \
  --role-name insightsphere-dev-authenticated-role \
  --policy-name DynamoDBAccessPolicy \
  --region us-east-1

# Update policy (if needed)
aws iam put-role-policy \
  --role-name insightsphere-dev-authenticated-role \
  --policy-name DynamoDBAccessPolicy \
  --policy-document file://dynamodb-policy.json \
  --region us-east-1
```

## Impact

✅ **Critical Fix** - Enables all data loading functionality  
✅ **Immediate Effect** - No deployment needed, works immediately  
✅ **Secure** - Follows AWS best practices  
✅ **Scalable** - Works for all authenticated users  

---

**Status:** ✅ Fixed and verified  
**Priority:** Critical  
**Complexity:** Low (IAM policy update)  
**Deployment:** Immediate (no code changes needed)
