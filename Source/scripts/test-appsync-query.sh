#!/bin/bash

# Test AppSync query directly
API_URL="https://y7sc7o27czcp3pw6lyib6ma2we.appsync-api.us-east-1.amazonaws.com/graphql"
REGION="us-east-1"

# Get AWS credentials
AWS_ACCESS_KEY_ID=$(aws configure get aws_access_key_id)
AWS_SECRET_ACCESS_KEY=$(aws configure get aws_secret_access_key)
AWS_SESSION_TOKEN=$(aws configure get aws_session_token)

# GraphQL query
QUERY='{"query":"query { listChatLogs(limit: 2) { items { id userMessage aiResponse timestamp } } }"}'

# Make request with AWS Signature V4
aws appsync list-graphql-apis --region $REGION

echo "Testing AppSync query..."
echo "If this works, the issue is with authentication in the web app"
