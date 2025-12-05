# GetReviewMetrics Lambda Function

## Overview

This Lambda function calculates review metrics for the Chat Logs Review System by scanning both DynamoDB tables (UnityAIAssistantLogs and UserFeedback) and returning aggregated statistics.

## Requirements Validation

This function implements the following requirements:

- **8.1**: Calculate total count of chat logs in the UnityAIAssistantLogs table
- **8.2**: Count reviewed chat logs (entries where rev_comment OR rev_feedback are not empty)
- **8.3**: Count pending chat logs (entries where both rev_comment AND rev_feedback are empty)
- **8.4**: Calculate total count of feedback logs in the UserFeedback table
- **8.5**: Count reviewed feedback logs (entries where rev_comment OR rev_feedback are not empty)
- **8.6**: Count pending feedback logs (entries where both rev_comment AND rev_feedback are empty)

## Environment Variables

- `CHAT_LOGS_TABLE`: Name of the UnityAIAssistantLogs DynamoDB table
- `FEEDBACK_TABLE`: Name of the UserFeedback DynamoDB table

## Response Format

```json
{
  "statusCode": 200,
  "body": {
    "totalChatLogs": 100,
    "reviewedChatLogs": 75,
    "pendingChatLogs": 25,
    "totalFeedbackLogs": 50,
    "reviewedFeedbackLogs": 30,
    "pendingFeedbackLogs": 20
  }
}
```

## Review Logic

An entry is considered **reviewed** if:
- `rev_comment` is not empty (after stripping whitespace), OR
- `rev_feedback` is not empty (after stripping whitespace)

An entry is considered **pending** if:
- Both `rev_comment` AND `rev_feedback` are empty (or contain only whitespace)

## Deployment

This function is deployed as part of the CloudFormation stack defined in `cloudformation/chat-logs-review-stack.yaml`. The function code is embedded inline in the CloudFormation template for simplicity.

For local development and testing, this standalone file can be used.

## IAM Permissions Required

The Lambda execution role needs the following DynamoDB permissions:
- `dynamodb:Scan` on both tables
- `dynamodb:Query` on both tables (for future optimizations)
- `dynamodb:GetItem` on both tables (for future optimizations)

## Performance Considerations

- The function uses `Scan` operations which can be slow for large tables
- Pagination is handled automatically to retrieve all items
- Only necessary fields are projected to minimize data transfer
- For production use with large datasets, consider:
  - Using DynamoDB Streams to maintain a running count
  - Caching results with a TTL
  - Using provisioned concurrency for consistent performance

## Testing

To test locally, you'll need:
1. AWS credentials configured
2. Access to the DynamoDB tables
3. Python 3.11+ installed

```bash
# Set environment variables
export CHAT_LOGS_TABLE=your-chat-logs-table-name
export FEEDBACK_TABLE=your-feedback-table-name

# Run the function
python index.py
```

## Error Handling

The function handles the following error scenarios:
- Missing environment variables (returns 500 with configuration error)
- DynamoDB access errors (returns 500 with error details)
- Unexpected exceptions (returns 500 with generic error message)

All errors are logged to CloudWatch Logs for debugging.
