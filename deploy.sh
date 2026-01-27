#!/bin/bash

# Deploy DynamoDB Proxy Lambda Function and API Gateway
# Run: ./deploy.sh

set -e

FUNCTION_NAME="dynamodb-proxy"
ROLE_ARN="arn:aws:iam::327052515912:role/lambda-execution-role"
REGION="us-east-1"

echo "🚀 Deploying DynamoDB Proxy Lambda Function..."

# Create deployment package
echo "📦 Creating deployment package..."
cd lambda
zip -r ../lambda-deployment.zip .
cd ..

# Create or update Lambda function
echo "⚡ Creating/updating Lambda function..."
if aws lambda get-function --function-name $FUNCTION_NAME --region $REGION >/dev/null 2>&1; then
    echo "Function exists, updating code..."
    aws lambda update-function-code \
        --function-name $FUNCTION_NAME \
        --zip-file fileb://lambda-deployment.zip \
        --region $REGION
else
    echo "Creating new function..."
    aws lambda create-function \
        --function-name $FUNCTION_NAME \
        --runtime nodejs18.x \
        --role $ROLE_ARN \
        --handler dynamodb-proxy.handler \
        --zip-file fileb://lambda-deployment.zip \
        --environment Variables="{CHATLOG_TABLE=UnityAIAssistantLogs,FEEDBACK_TABLE=userFeedback,EVAL_JOB_TABLE=UnityAIAssistantEvalJob}" \
        --region $REGION
fi

# Get Lambda function ARN
LAMBDA_ARN=$(aws lambda get-function --function-name $FUNCTION_NAME --region $REGION --query 'Configuration.FunctionArn' --output text)
echo "Lambda ARN: $LAMBDA_ARN"

# Create API Gateway
echo "🌐 Creating API Gateway..."
API_ID=$(aws apigateway create-rest-api \
    --name "dynamodb-proxy-api" \
    --description "API for DynamoDB proxy Lambda" \
    --region $REGION \
    --query 'id' --output text)

echo "API Gateway ID: $API_ID"

# Get root resource ID
ROOT_ID=$(aws apigateway get-resources \
    --rest-api-id $API_ID \
    --region $REGION \
    --query 'items[0].id' --output text)

# Create resource
RESOURCE_ID=$(aws apigateway create-resource \
    --rest-api-id $API_ID \
    --parent-id $ROOT_ID \
    --path-part "dynamodb" \
    --region $REGION \
    --query 'id' --output text)

# Create POST method
aws apigateway put-method \
    --rest-api-id $API_ID \
    --resource-id $RESOURCE_ID \
    --http-method POST \
    --authorization-type NONE \
    --region $REGION

# Create OPTIONS method for CORS
aws apigateway put-method \
    --rest-api-id $API_ID \
    --resource-id $RESOURCE_ID \
    --http-method OPTIONS \
    --authorization-type NONE \
    --region $REGION

# Set up Lambda integration for POST
aws apigateway put-integration \
    --rest-api-id $API_ID \
    --resource-id $RESOURCE_ID \
    --http-method POST \
    --type AWS_PROXY \
    --integration-http-method POST \
    --uri "arn:aws:apigateway:$REGION:lambda:path/2015-03-31/functions/$LAMBDA_ARN/invocations" \
    --region $REGION

# Set up OPTIONS integration for CORS
aws apigateway put-integration \
    --rest-api-id $API_ID \
    --resource-id $RESOURCE_ID \
    --http-method OPTIONS \
    --type MOCK \
    --region $REGION

# Add Lambda permission for API Gateway
aws lambda add-permission \
    --function-name $FUNCTION_NAME \
    --statement-id api-gateway-invoke \
    --action lambda:InvokeFunction \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:$REGION:327052515912:$API_ID/*/*" \
    --region $REGION

# Deploy API
aws apigateway create-deployment \
    --rest-api-id $API_ID \
    --stage-name prod \
    --region $REGION

# Clean up
rm lambda-deployment.zip

# Output the API endpoint
API_ENDPOINT="https://$API_ID.execute-api.$REGION.amazonaws.com/prod/dynamodb"
echo ""
echo "✅ Deployment complete!"
echo "📍 API Endpoint: $API_ENDPOINT"
echo ""
echo "🔧 Update your .env file:"
echo "VITE_DYNAMODB_API_ENDPOINT=$API_ENDPOINT"