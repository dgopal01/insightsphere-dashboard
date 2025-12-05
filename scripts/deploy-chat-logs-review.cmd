@echo off
REM ============================================
REM Chat Logs Review System - Deployment Script
REM Windows Command Prompt Batch Script
REM ============================================

setlocal enabledelayedexpansion

REM Configuration
set STACK_NAME=chat-logs-review-dev
set REGION=us-east-1
set ENVIRONMENT=dev
set PROJECT_NAME=chat-logs-review
set TEMPLATE_FILE=cloudformation/chat-logs-review-stack.yaml

REM Parse command line arguments
if "%1"=="" (
    echo Error: Cognito domain prefix is required
    echo Usage: deploy-chat-logs-review.cmd [COGNITO_DOMAIN_PREFIX] [REGION] [ENVIRONMENT]
    echo Example: deploy-chat-logs-review.cmd my-chat-logs-review us-east-1 dev
    exit /b 1
)

set COGNITO_DOMAIN_PREFIX=%1

if not "%2"=="" set REGION=%2
if not "%3"=="" set ENVIRONMENT=%3
set STACK_NAME=chat-logs-review-%ENVIRONMENT%

REM Display header
echo.
echo ============================================
echo Chat Logs Review System - Deployment
echo ============================================
echo.
echo Configuration:
echo   Stack Name: %STACK_NAME%
echo   Environment: %ENVIRONMENT%
echo   Region: %REGION%
echo   Cognito Domain: %COGNITO_DOMAIN_PREFIX%
echo   Template: %TEMPLATE_FILE%
echo.

REM Step 1: Validate prerequisites
echo [1/6] Validating prerequisites...
echo.

REM Check AWS CLI
where aws >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: AWS CLI not found
    echo Please install AWS CLI from: https://aws.amazon.com/cli/
    exit /b 1
)
echo   [OK] AWS CLI installed

REM Check AWS credentials
aws sts get-caller-identity --region %REGION% >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo   [ERROR] AWS credentials not configured
    echo   Please run: aws configure
    exit /b 1
)

REM Get AWS account info
for /f "tokens=*" %%i in ('aws sts get-caller-identity --query Account --output text --region %REGION%') do set AWS_ACCOUNT=%%i
echo   [OK] AWS credentials configured
echo   [INFO] AWS Account: %AWS_ACCOUNT%

REM Check CloudFormation template
if not exist "%TEMPLATE_FILE%" (
    echo   [ERROR] CloudFormation template not found: %TEMPLATE_FILE%
    exit /b 1
)
echo   [OK] CloudFormation template found
echo.

REM Step 2: Validate CloudFormation template
echo [2/6] Validating CloudFormation template...
aws cloudformation validate-template --template-body file://%TEMPLATE_FILE% --region %REGION% >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo   [ERROR] Template validation failed
    aws cloudformation validate-template --template-body file://%TEMPLATE_FILE% --region %REGION%
    exit /b 1
)
echo   [OK] Template validation passed
echo.

REM Step 3: Check if Lambda function needs packaging
echo [3/6] Checking Lambda function...
echo   [INFO] Lambda function is inline in CloudFormation template
echo   [OK] No packaging required
echo.

REM Step 4: Confirm deployment
echo [4/6] Deployment confirmation
set /p CONFIRM="Do you want to proceed with deployment? (yes/no): "
if /i not "%CONFIRM%"=="yes" (
    echo Deployment cancelled
    exit /b 0
)
echo.

REM Step 5: Deploy CloudFormation stack
echo [5/6] Deploying CloudFormation stack...
echo   [INFO] This may take 10-15 minutes...
echo.

REM Check if stack exists
aws cloudformation describe-stacks --stack-name %STACK_NAME% --region %REGION% >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   [INFO] Stack exists. Updating stack...
    
    aws cloudformation update-stack ^
        --stack-name %STACK_NAME% ^
        --template-body file://%TEMPLATE_FILE% ^
        --parameters ^
            ParameterKey=EnvironmentName,ParameterValue=%ENVIRONMENT% ^
            ParameterKey=ProjectName,ParameterValue=%PROJECT_NAME% ^
            ParameterKey=CognitoDomainPrefix,ParameterValue=%COGNITO_DOMAIN_PREFIX% ^
        --capabilities CAPABILITY_NAMED_IAM ^
        --region %REGION%
    
    if %ERRORLEVEL% NEQ 0 (
        echo   [ERROR] Stack update failed
        echo.
        echo Recent stack events:
        aws cloudformation describe-stack-events --stack-name %STACK_NAME% --region %REGION% --max-items 5 --query "StackEvents[?ResourceStatus=='UPDATE_FAILED'].[LogicalResourceId,ResourceStatusReason]" --output table
        exit /b 1
    )
    
    echo   [INFO] Stack update initiated. Waiting for completion...
    aws cloudformation wait stack-update-complete --stack-name %STACK_NAME% --region %REGION%
    
    if %ERRORLEVEL% NEQ 0 (
        echo   [ERROR] Stack update failed or timed out
        echo.
        echo Recent stack events:
        aws cloudformation describe-stack-events --stack-name %STACK_NAME% --region %REGION% --max-items 10 --query "StackEvents[?ResourceStatus=='UPDATE_FAILED'].[LogicalResourceId,ResourceStatusReason]" --output table
        echo.
        echo To rollback, run:
        echo aws cloudformation cancel-update-stack --stack-name %STACK_NAME% --region %REGION%
        exit /b 1
    )
    
    echo   [OK] Stack updated successfully
) else (
    echo   [INFO] Stack does not exist. Creating new stack...
    
    aws cloudformation create-stack ^
        --stack-name %STACK_NAME% ^
        --template-body file://%TEMPLATE_FILE% ^
        --parameters ^
            ParameterKey=EnvironmentName,ParameterValue=%ENVIRONMENT% ^
            ParameterKey=ProjectName,ParameterValue=%PROJECT_NAME% ^
            ParameterKey=CognitoDomainPrefix,ParameterValue=%COGNITO_DOMAIN_PREFIX% ^
        --capabilities CAPABILITY_NAMED_IAM ^
        --tags Key=Environment,Value=%ENVIRONMENT% Key=Project,Value=%PROJECT_NAME% ^
        --region %REGION%
    
    if %ERRORLEVEL% NEQ 0 (
        echo   [ERROR] Stack creation failed
        exit /b 1
    )
    
    echo   [INFO] Stack creation initiated. Waiting for completion...
    aws cloudformation wait stack-create-complete --stack-name %STACK_NAME% --region %REGION%
    
    if %ERRORLEVEL% NEQ 0 (
        echo   [ERROR] Stack creation failed or timed out
        echo.
        echo Recent stack events:
        aws cloudformation describe-stack-events --stack-name %STACK_NAME% --region %REGION% --max-items 10 --query "StackEvents[?ResourceStatus=='CREATE_FAILED'].[LogicalResourceId,ResourceStatusReason]" --output table
        echo.
        echo To rollback, run:
        echo aws cloudformation delete-stack --stack-name %STACK_NAME% --region %REGION%
        exit /b 1
    )
    
    echo   [OK] Stack created successfully
)
echo.

REM Step 6: Retrieve and display outputs
echo [6/6] Retrieving stack outputs...
echo.

REM Get stack outputs
for /f "tokens=*" %%i in ('aws cloudformation describe-stacks --stack-name %STACK_NAME% --region %REGION% --query "Stacks[0].Outputs[?OutputKey=='UserPoolId'].OutputValue" --output text') do set USER_POOL_ID=%%i
for /f "tokens=*" %%i in ('aws cloudformation describe-stacks --stack-name %STACK_NAME% --region %REGION% --query "Stacks[0].Outputs[?OutputKey=='UserPoolClientId'].OutputValue" --output text') do set CLIENT_ID=%%i
for /f "tokens=*" %%i in ('aws cloudformation describe-stacks --stack-name %STACK_NAME% --region %REGION% --query "Stacks[0].Outputs[?OutputKey=='IdentityPoolId'].OutputValue" --output text') do set IDENTITY_POOL_ID=%%i
for /f "tokens=*" %%i in ('aws cloudformation describe-stacks --stack-name %STACK_NAME% --region %REGION% --query "Stacks[0].Outputs[?OutputKey=='CognitoDomain'].OutputValue" --output text') do set COGNITO_DOMAIN=%%i
for /f "tokens=*" %%i in ('aws cloudformation describe-stacks --stack-name %STACK_NAME% --region %REGION% --query "Stacks[0].Outputs[?OutputKey=='GraphQLApiEndpoint'].OutputValue" --output text') do set GRAPHQL_ENDPOINT=%%i
for /f "tokens=*" %%i in ('aws cloudformation describe-stacks --stack-name %STACK_NAME% --region %REGION% --query "Stacks[0].Outputs[?OutputKey=='GraphQLApiId'].OutputValue" --output text') do set GRAPHQL_API_ID=%%i
for /f "tokens=*" %%i in ('aws cloudformation describe-stacks --stack-name %STACK_NAME% --region %REGION% --query "Stacks[0].Outputs[?OutputKey=='AmplifyAppUrl'].OutputValue" --output text') do set AMPLIFY_URL=%%i

echo ============================================
echo Deployment Complete!
echo ============================================
echo.
echo AWS Resources:
echo   User Pool ID: %USER_POOL_ID%
echo   Client ID: %CLIENT_ID%
echo   Identity Pool ID: %IDENTITY_POOL_ID%
echo   Cognito Domain: %COGNITO_DOMAIN%
echo   GraphQL Endpoint: %GRAPHQL_ENDPOINT%
echo   GraphQL API ID: %GRAPHQL_API_ID%
echo   Amplify App URL: %AMPLIFY_URL%
echo.

REM Create .env file
echo Creating .env file...
(
echo # Chat Logs Review System - Environment Configuration
echo # Auto-generated by deploy-chat-logs-review.cmd
echo # Generated: %date% %time%
echo.
echo # Environment
echo VITE_ENV=%ENVIRONMENT%
echo.
echo # AWS Configuration
echo VITE_AWS_REGION=%REGION%
echo VITE_USER_POOL_ID=%USER_POOL_ID%
echo VITE_USER_POOL_CLIENT_ID=%CLIENT_ID%
echo VITE_IDENTITY_POOL_ID=%IDENTITY_POOL_ID%
echo VITE_GRAPHQL_ENDPOINT=%GRAPHQL_ENDPOINT%
echo VITE_COGNITO_DOMAIN=%COGNITO_DOMAIN%
echo.
echo # API Configuration
echo VITE_API_TIMEOUT=30000
echo VITE_API_RETRY_ATTEMPTS=3
echo.
echo # Feature Flags
echo VITE_ENABLE_ERROR_TRACKING=true
echo VITE_ENABLE_PERFORMANCE_MONITORING=true
echo.
echo # Debug Settings
echo VITE_DEBUG_MODE=true
echo VITE_LOG_LEVEL=debug
) > .env

echo   [OK] .env file created
echo.

REM Create aws-exports.ts
echo Creating aws-exports.ts...
(
echo /**
echo  * AWS Amplify Configuration
echo  * Auto-generated by deploy-chat-logs-review.cmd
echo  */
echo.
echo const awsconfig = {
echo   aws_project_region: '%REGION%',
echo   aws_cognito_region: '%REGION%',
echo   aws_user_pools_id: '%USER_POOL_ID%',
echo   aws_user_pools_web_client_id: '%CLIENT_ID%',
echo   aws_cognito_identity_pool_id: '%IDENTITY_POOL_ID%',
echo   aws_appsync_graphqlEndpoint: '%GRAPHQL_ENDPOINT%',
echo   aws_appsync_region: '%REGION%',
echo   aws_appsync_authenticationType: 'AMAZON_COGNITO_USER_POOLS',
echo   oauth: {
echo     domain: '%COGNITO_DOMAIN%',
echo     scope: ['email', 'openid', 'profile'],
echo     redirectSignIn: 'http://localhost:5173/',
echo     redirectSignOut: 'http://localhost:5173/',
echo     responseType: 'code',
echo   },
echo };
echo.
echo export default awsconfig;
) > src\aws-exports.ts

echo   [OK] aws-exports.ts created
echo.

REM Save deployment info
echo Saving deployment info...
(
echo {
echo   "timestamp": "%date% %time%",
echo   "environment": "%ENVIRONMENT%",
echo   "region": "%REGION%",
echo   "stackName": "%STACK_NAME%",
echo   "userPoolId": "%USER_POOL_ID%",
echo   "clientId": "%CLIENT_ID%",
echo   "identityPoolId": "%IDENTITY_POOL_ID%",
echo   "cognitoDomain": "%COGNITO_DOMAIN%",
echo   "graphqlEndpoint": "%GRAPHQL_ENDPOINT%",
echo   "graphqlApiId": "%GRAPHQL_API_ID%",
echo   "amplifyAppUrl": "%AMPLIFY_URL%"
echo }
) > deployment-info.json

echo   [OK] Deployment info saved to deployment-info.json
echo.

echo ============================================
echo Next Steps
echo ============================================
echo.
echo 1. Create an admin user in Cognito:
echo    aws cognito-idp admin-create-user ^
echo      --user-pool-id %USER_POOL_ID% ^
echo      --username admin ^
echo      --user-attributes Name=email,Value=admin@example.com Name=email_verified,Value=true ^
echo      --temporary-password TempPass123! ^
echo      --message-action SUPPRESS ^
echo      --region %REGION%
echo.
echo 2. Install dependencies:
echo    npm install
echo.
echo 3. Start the development server:
echo    npm run dev
echo.
echo 4. Open the application:
echo    http://localhost:5173
echo.
echo 5. Sign in with:
echo    Username: admin
echo    Password: TempPass123! (you'll be prompted to change it)
echo.
echo ============================================
echo.

endlocal
