# InsightSphere Dashboard - Deployment Steps

## ✅ Prerequisites (Already Complete)
- ✅ Node.js v22.16.0 installed
- ✅ npm 10.9.2 installed
- ✅ AWS CLI configured (Account: 327052515912)
- ✅ Amplify CLI v14.2.3 installed
- ✅ Project dependencies installed

## 🚀 Deployment Steps

### Step 1: Initialize Amplify Backend

Open your terminal in the project directory and run:

```powershell
amplify init
```

**Answer the prompts:**

```
? Enter a name for the environment
  → dev

? Select the authentication method you want to use
  → AWS profile

? Please choose the profile you want to use
  → default
```

**Expected output:**
```
✔ Successfully created initial AWS cloud resources for deployments.
✔ Initialized provider successfully.
Initialized your environment successfully.
```

This takes about 2-3 minutes.

---

### Step 2: Deploy Backend Resources

After initialization completes, run:

```powershell
amplify push
```

**You'll see a table showing what will be created:**

```
| Category | Resource name        | Operation | Provider plugin   |
| -------- | -------------------- | --------- | ----------------- |
| Auth     | insightsphere        | Create    | awscloudformation |
| Api      | insightsphere        | Create    | awscloudformation |
| Storage  | insightspherestorage | Create    | awscloudformation |
```

**Confirm:**
```
? Are you sure you want to continue?
  → Yes
```

**This will create:**
- ✅ AWS Cognito User Pool (authentication)
- ✅ AWS AppSync GraphQL API (data layer)
- ✅ DynamoDB tables (ChatLog and Feedback)
- ✅ S3 bucket (file exports)

**This takes 5-10 minutes.**

---

### Step 3: Verify Deployment

After deployment completes, run:

```powershell
amplify status
```

**Expected output:**
```
| Category | Resource name        | Operation | Provider plugin   |
| -------- | -------------------- | --------- | ----------------- |
| Auth     | insightsphere        | No Change | awscloudformation |
| Api      | insightsphere        | No Change | awscloudformation |
| Storage  | insightspherestorage | No Change | awscloudformation |
```

---

### Step 4: Get AWS Configuration Values

Run this command to see your deployed resources:

```powershell
amplify console
```

Select "Amplify Console" to open the AWS Console.

Or get the configuration directly:

```powershell
cat src\aws-exports.js
```

---

### Step 5: Update Environment Variables

The `.env` file needs to be updated with real AWS values.

Run this PowerShell command to extract the values:

```powershell
# This will show you the values you need
amplify env get --name dev
```

Then update your `.env` file with:
- `VITE_USER_POOL_ID` - From Cognito
- `VITE_USER_POOL_CLIENT_ID` - From Cognito
- `VITE_GRAPHQL_ENDPOINT` - From AppSync
- `VITE_S3_BUCKET` - From S3

---

### Step 6: Create a Test User

Create a user in AWS Cognito:

```powershell
amplify console auth
```

This opens the Cognito console. Then:

1. Click on your User Pool
2. Go to "Users" tab
3. Click "Create user"
4. Enter:
   - Username: `testuser`
   - Email: `your-email@example.com`
   - Temporary password: `TempPass123!`
5. Click "Create user"

---

### Step 7: Test the Application

1. **Restart the development server:**
   ```powershell
   npm run dev
   ```

2. **Open browser:** http://localhost:5173

3. **Sign in with:**
   - Username: `testuser`
   - Password: `TempPass123!`
   - You'll be prompted to change your password

4. **Test features:**
   - ✅ Dashboard loads
   - ✅ Navigation works
   - ✅ Theme switching works
   - ✅ Data loads from AWS

---

### Step 8: Deploy to Amplify Hosting (Optional)

To deploy the frontend to AWS Amplify Hosting:

```powershell
amplify add hosting
```

Choose:
- **Hosting with Amplify Console**
- **Continuous deployment**

Then:

```powershell
amplify publish
```

This will:
- Build your application
- Deploy to Amplify Hosting
- Provide a live URL

---

## 🔧 Troubleshooting

### Issue: "amplify init" fails

**Solution:**
```powershell
# Clean up and try again
Remove-Item amplify\#current-cloud-backend -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item amplify\backend\amplify-meta.json -Force -ErrorAction SilentlyContinue
amplify init
```

### Issue: "amplify push" fails

**Solution:**
```powershell
# Check AWS credentials
aws sts get-caller-identity

# Try again
amplify push --force
```

### Issue: Can't sign in after deployment

**Solution:**
1. Verify user exists in Cognito Console
2. Check `.env` file has correct values
3. Restart development server
4. Clear browser cache

---

## 📞 Need Help?

If you encounter issues:

1. Check the error message carefully
2. Run `amplify diagnose` for detailed logs
3. Check AWS Console for resource status
4. Verify all environment variables are set

---

## ✅ Success Checklist

After completing all steps, you should have:

- ✅ Amplify backend deployed to AWS
- ✅ Cognito User Pool with test user
- ✅ AppSync GraphQL API running
- ✅ DynamoDB tables created
- ✅ S3 bucket for exports
- ✅ Application running locally with real AWS backend
- ✅ Ability to sign in and use all features

---

**Current Status:** Ready to run `amplify init`

**Next Command:** `amplify init`
