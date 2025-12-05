# Step-by-Step: Update AppSync Resolvers via Console

## Overview
You need to update 2 resolvers to map your table schema to the app's expected format.

---

## Step 1: Open AppSync Console

1. **Open this link in your browser**:
   ```
   https://console.aws.amazon.com/appsync/home?region=us-east-1
   ```

2. **You should see a list of APIs**
   - Look for an API with ID: `u3e7wpkmkrevbkkho5rh6pqf6u`
   - Or name containing "insightsphere"

3. **Click on the API name** to open it

---

## Step 2: Navigate to Schema

1. **In the left sidebar**, click **"Schema"**
   
2. **You'll see**:
   - The GraphQL schema at the top
   - A list of "Resolvers" below the schema

3. **Scroll down** to the "Resolvers" section

---

## Step 3: Update listChatLogs Resolver

### 3.1 Find the Resolver

1. **In the Resolvers section**, look for:
   ```
   Query.listChatLogs
   ```
   - It should show "Data source: ChatLogTable"

2. **Click on "Query.listChatLogs"**
   - This opens the resolver editor

### 3.2 Update Response Mapping Template

1. **You'll see two text boxes**:
   - "Configure the request mapping template" (top)
   - "Configure the response mapping template" (bottom)

2. **Scroll to the BOTTOM text box** (Response mapping template)

3. **Select ALL the existing text** in the bottom box (Ctrl+A or Cmd+A)

4. **Delete it** and **paste this**:

```vtl
#set($items = [])
#foreach($item in $ctx.result.items)
  #set($mappedItem = {
    "id": $item.log_id,
    "conversationId": $util.defaultIfNull($item.session_id, $util.defaultIfNull($item.chat_id, $item.log_id)),
    "userId": $util.defaultIfNull($item.user_name, "anonymous"),
    "userMessage": $item.question,
    "aiResponse": $item.response,
    "timestamp": $item.timestamp,
    "metadata": $util.toJson({
      "carrier_name": $item.carrier_name,
      "citation": $item.citation,
      "chat_id": $item.chat_id,
      "session_id": $item.session_id,
      "fi_name": $item.fi_name,
      "guardrail_id": $item.guardrail_id,
      "model_id": $item.model_id
    })
  })
  $util.qr($items.add($mappedItem))
#end

{
  "items": $util.toJson($items),
  #if($ctx.result.nextToken)
    "nextToken": "$ctx.result.nextToken"
  #end
}
```

5. **Click "Save Resolver"** button (top right)

6. **You should see**: "Resolver saved successfully"

---

## Step 4: Update listFeedback Resolver

### 4.1 Go Back to Schema

1. **Click "Schema"** in the left sidebar (to go back)

2. **Scroll down** to the Resolvers section again

### 4.2 Find the Resolver

1. **Look for**:
   ```
   Query.listFeedback
   ```
   - It should show "Data source: FeedbackTable"

2. **Click on "Query.listFeedback"**

### 4.3 Update Response Mapping Template

1. **Scroll to the BOTTOM text box** (Response mapping template)

2. **Select ALL the existing text** (Ctrl+A or Cmd+A)

3. **Delete it** and **paste this**:

```vtl
#set($items = [])
#foreach($item in $ctx.result.items)
  #set($mappedItem = {
    "id": $item.id,
    "logId": $util.defaultIfNull($item.info.session_id, $item.id),
    "userId": $util.defaultIfNull($item.info.username, $util.defaultIfNull($item.info.user_name, "anonymous")),
    "rating": 0,
    "comment": $util.defaultIfNull($item.info.comments, $util.defaultIfNull($item.info.feedback, "")),
    "timestamp": $item.datetime
  })
  $util.qr($items.add($mappedItem))
#end

{
  "items": $util.toJson($items),
  #if($ctx.result.nextToken)
    "nextToken": "$ctx.result.nextToken"
  #end
}
```

4. **Click "Save Resolver"** button (top right)

5. **You should see**: "Resolver saved successfully"

---

## Step 5: Test the Changes

### 5.1 Open Queries Tab

1. **In the left sidebar**, click **"Queries"**

2. **You'll see a GraphQL editor**

### 5.2 Run Test Query

1. **Paste this query** in the editor:

```graphql
query TestChatLogs {
  listChatLogs(limit: 5) {
    items {
      id
      userMessage
      aiResponse
      timestamp
      metadata
    }
  }
}
```

2. **Click the orange "Play" button** (▶) at the top

3. **You should see**:
   - Data from your UnityAIAssistantLogs table
   - With fields: id, userMessage, aiResponse, timestamp, metadata

### 5.3 Test Feedback

1. **Replace the query** with:

```graphql
query TestFeedback {
  listFeedback(limit: 5) {
    items {
      id
      comment
      timestamp
      userId
    }
  }
}
```

2. **Click the Play button** again

3. **You should see**:
   - Data from your userFeedback table

---

## Step 6: Update Amplify Environment Variables

Now that the backend is ready, update the frontend:

1. **Open Amplify Console**:
   ```
   https://console.aws.amazon.com/amplify/home?region=us-east-1#/d33feletv96fod/settings/variables
   ```

2. **Click "Manage variables"**

3. **Find and update these two**:
   - `VITE_CHATLOG_TABLE`: Change to `UnityAIAssistantLogs`
   - `VITE_FEEDBACK_TABLE`: Change to `userFeedback`

4. **Click "Save"**

5. **Go to the main branch** and click **"Redeploy this version"**

---

## Step 7: Verify in the App

After the build completes (~3-5 minutes):

1. **Open your app**:
   ```
   https://main.d33feletv96fod.amplifyapp.com
   ```

2. **Sign in**

3. **Click "Chat Logs"** in the sidebar

4. **You should see**:
   - Log ID (from log_id)
   - Carrier Name (from carrier_name)
   - Question (from question)
   - Response (from response)
   - Citations (from citation field)
   - Timestamp

---

## Troubleshooting

### If you see "Resolver not found"
- Make sure you're looking at the correct API
- Check that the API ID is `u3e7wpkmkrevbkkho5rh6pqf6u`

### If the query returns empty results
- Check that your tables have data:
  ```bash
  aws dynamodb scan --table-name UnityAIAssistantLogs --limit 1 --region us-east-1
  ```

### If you see GraphQL errors
- Check the CloudWatch logs in AppSync Console
- Click "Logs" in the left sidebar
- Look for error messages

### If the app still shows old data
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Check that Amplify build completed successfully

---

## Visual Guide

### What You're Looking For:

**AppSync Console - Schema Page:**
```
┌─────────────────────────────────────┐
│ AWS AppSync                         │
├─────────────────────────────────────┤
│ ☰ Schema                           │
│   Queries                           │
│   Settings                          │
│   ...                               │
└─────────────────────────────────────┘

Schema Definition:
[GraphQL schema code here]

Resolvers:
┌──────────────────────────────────────┐
│ Query.listChatLogs                   │ ← Click this
│ Data source: ChatLogTable            │
├──────────────────────────────────────┤
│ Query.listFeedback                   │ ← Then click this
│ Data source: FeedbackTable           │
└──────────────────────────────────────┘
```

**Resolver Editor:**
```
┌─────────────────────────────────────────┐
│ Configure the request mapping template  │
│ ┌─────────────────────────────────────┐ │
│ │ [Don't change this]                 │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Configure the response mapping template│
│ ┌─────────────────────────────────────┐ │
│ │ [PASTE NEW CODE HERE]               │ │ ← Update this
│ │                                     │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│              [Save Resolver]            │ ← Click this
└─────────────────────────────────────────┘
```

---

## Summary

✅ **Step 1**: Open AppSync Console  
✅ **Step 2**: Click "Schema"  
✅ **Step 3**: Update `Query.listChatLogs` response template  
✅ **Step 4**: Update `Query.listFeedback` response template  
✅ **Step 5**: Test in Queries tab  
✅ **Step 6**: Update Amplify environment variables  
✅ **Step 7**: Verify in the app  

**Total time**: ~10 minutes

---

**Need help?** Check the browser console (F12) for any errors after the changes.
