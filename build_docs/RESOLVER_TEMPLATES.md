# AppSync Resolver Templates

Copy these templates into AppSync Console for each resolver.

## listChatLogs Resolver

### Request Mapping Template
```vtl
{
  "version": "2017-02-28",
  "operation": "Scan",
  "limit": $util.defaultIfNull($ctx.args.limit, 20),
  #if($ctx.args.nextToken)
    "nextToken": "$ctx.args.nextToken"
  #end
}
```

### Response Mapping Template
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

## listFeedback Resolver

### Request Mapping Template
```vtl
{
  "version": "2017-02-28",
  "operation": "Scan",
  "limit": $util.defaultIfNull($ctx.args.limit, 20),
  #if($ctx.args.nextToken)
    "nextToken": "$ctx.args.nextToken"
  #end
}
```

### Response Mapping Template
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

## How to Apply

1. Go to AppSync Console: https://console.aws.amazon.com/appsync/home?region=us-east-1
2. Click your API
3. Click "Schema" → Find the resolver (e.g., "listChatLogs")
4. Click on the resolver name
5. Paste the templates above
6. Click "Save Resolver"
7. Repeat for each resolver

## Test Query

After updating, test with:

```graphql
query TestData {
  listChatLogs(limit: 5) {
    items {
      id
      userMessage
      aiResponse
      timestamp
      metadata
    }
  }
  
  listFeedback(limit: 5) {
    items {
      id
      comment
      timestamp
    }
  }
}
```
