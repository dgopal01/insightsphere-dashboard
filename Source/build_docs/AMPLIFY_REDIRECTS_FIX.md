# Fix Amplify SPA Routing (404 Errors)

## Problem
When accessing routes like `/feedback-logs-review` directly, Amplify returns a 404 error because it's looking for a file that doesn't exist. This is a common issue with Single Page Applications (SPAs).

## Solution
Configure redirects in the AWS Amplify Console to serve `index.html` for all routes.

## Steps to Fix

### Option 1: Configure in Amplify Console (Recommended)

1. **Go to AWS Amplify Console**
   - Navigate to: https://console.aws.amazon.com/amplify/
   - Select your app

2. **Open Rewrites and Redirects**
   - In the left sidebar, click **App settings** → **Rewrites and redirects**

3. **Add a New Rule**
   - Click **Add rule** or **Manage rewrites and redirects**
   
4. **Configure the Rule**
   ```
   Source address: </^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>
   Target address: /index.html
   Type: 200 (Rewrite)
   ```

   **OR use the simpler wildcard rule:**
   ```
   Source address: /<*>
   Target address: /index.html
   Type: 200 (Rewrite)
   ```

5. **Save the Rule**
   - Click **Save**

6. **Redeploy**
   - The changes should take effect immediately
   - If not, trigger a new deployment

### Option 2: Verify _redirects File

The `public/_redirects` file should already exist with this content:

```
/*    /index.html   200
```

This file should be automatically copied to the build output (`dist/`) during the build process.

### Option 3: Add to amplify.yml (Alternative)

If the above doesn't work, you can try adding redirects to `amplify.yml`:

```yaml
customHeaders:
  - pattern: '**'
    headers:
      - key: 'Cache-Control'
        value: 'no-cache'
```

However, the Amplify Console configuration (Option 1) is the most reliable method.

## Verification

After applying the fix:

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Try accessing the routes directly:**
   - https://your-app.amplifyapp.com/feedback-logs-review
   - https://your-app.amplifyapp.com/chat-logs-review
   - https://your-app.amplifyapp.com/dashboard

3. **All routes should load correctly** without 404 errors

## Common Issues

### Issue: Still getting 404 after configuration
**Solution:** 
- Clear browser cache completely
- Try in incognito/private browsing mode
- Wait 5-10 minutes for CDN cache to clear
- Trigger a new deployment

### Issue: Redirects work but assets (CSS/JS) don't load
**Solution:**
- Make sure the regex pattern excludes file extensions
- Use the pattern provided above that excludes common file types

### Issue: Redirects not taking effect
**Solution:**
- Check that the rule is at the top of the list (highest priority)
- Verify the rule type is "200 (Rewrite)" not "301 (Redirect)"
- Redeploy the application

## Technical Details

### Why This Happens
- React Router handles routing on the client side
- When you access `/feedback-logs-review` directly, the browser asks the server for that file
- The server doesn't have a file at that path, so it returns 404
- The fix tells the server to serve `index.html` for all routes
- React Router then takes over and displays the correct page

### The 200 Rewrite
- Status code 200 means "OK"
- "Rewrite" means serve a different file but keep the URL the same
- This allows React Router to see the correct URL and route accordingly

## Current Status

✅ `_redirects` file exists in `public/` folder
❌ Amplify Console redirects need to be configured manually

**Action Required:** Follow Option 1 above to configure redirects in Amplify Console.
