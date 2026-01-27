@echo off
REM Deploy DynamoDB Proxy Lambda Function and API Gateway

set FUNCTION_NAME=dynamodb-proxy
set ROLE_ARN=arn:aws:iam::327052515912:role/lambda-execution-role
set REGION=us-east-1

echo Deploying DynamoDB Proxy Lambda Function...

REM Create deployment package
echo Creating deployment package...
cd lambda
powershell -Command "Compress-Archive -Path * -DestinationPath ../lambda-deployment.zip -Force"
cd ..

REM Create or update Lambda function
echo Creating/updating Lambda function...
aws lambda get-function --function-name %FUNCTION_NAME% --region %REGION% >nul 2>&1
if %errorlevel% equ 0 (
    echo Function exists, updating code...
    aws lambda update-function-code --function-name %FUNCTION_NAME% --zip-file fileb://lambda-deployment.zip --region %REGION%
) else (
    echo Creating new function...
    aws lambda create-function --function-name %FUNCTION_NAME% --runtime nodejs18.x --role %ROLE_ARN% --handler dynamodb-proxy.handler --zip-file fileb://lambda-deployment.zip --environment Variables="{CHATLOG_TABLE=UnityAIAssistantLogs,FEEDBACK_TABLE=userFeedback,EVAL_JOB_TABLE=UnityAIAssistantEvalJob}" --region %REGION%
)

REM Get Lambda function ARN
for /f "tokens=*" %%i in ('aws lambda get-function --function-name %FUNCTION_NAME% --region %REGION% --query "Configuration.FunctionArn" --output text') do set LAMBDA_ARN=%%i
echo Lambda ARN: %LAMBDA_ARN%

REM Create API Gateway
echo Creating API Gateway...
for /f "tokens=*" %%i in ('aws apigateway create-rest-api --name "dynamodb-proxy-api" --description "API for DynamoDB proxy Lambda" --region %REGION% --query "id" --output text') do set API_ID=%%i
echo API Gateway ID: %API_ID%

REM Get root resource ID
for /f "tokens=*" %%i in ('aws apigateway get-resources --rest-api-id %API_ID% --region %REGION% --query "items[0].id" --output text') do set ROOT_ID=%%i

REM Create resource
for /f "tokens=*" %%i in ('aws apigateway create-resource --rest-api-id %API_ID% --parent-id %ROOT_ID% --path-part "dynamodb" --region %REGION% --query "id" --output text') do set RESOURCE_ID=%%i

REM Create POST method
aws apigateway put-method --rest-api-id %API_ID% --resource-id %RESOURCE_ID% --http-method POST --authorization-type NONE --region %REGION%

REM Create OPTIONS method for CORS
aws apigateway put-method --rest-api-id %API_ID% --resource-id %RESOURCE_ID% --http-method OPTIONS --authorization-type NONE --region %REGION%

REM Set up Lambda integration for POST
aws apigateway put-integration --rest-api-id %API_ID% --resource-id %RESOURCE_ID% --http-method POST --type AWS_PROXY --integration-http-method POST --uri "arn:aws:apigateway:%REGION%:lambda:path/2015-03-31/functions/%LAMBDA_ARN%/invocations" --region %REGION%

REM Set up OPTIONS integration for CORS
aws apigateway put-integration --rest-api-id %API_ID% --resource-id %RESOURCE_ID% --http-method OPTIONS --type MOCK --region %REGION%

REM Add Lambda permission for API Gateway
aws lambda add-permission --function-name %FUNCTION_NAME% --statement-id api-gateway-invoke --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:%REGION%:327052515912:%API_ID%/*/*" --region %REGION%

REM Deploy API
aws apigateway create-deployment --rest-api-id %API_ID% --stage-name prod --region %REGION%

REM Clean up
del lambda-deployment.zip

REM Output the API endpoint
set API_ENDPOINT=https://%API_ID%.execute-api.%REGION%.amazonaws.com/prod/dynamodb
echo.
echo Deployment complete!
echo API Endpoint: %API_ENDPOINT%
echo.
echo Update your .env file:
echo VITE_DYNAMODB_API_ENDPOINT=%API_ENDPOINT%