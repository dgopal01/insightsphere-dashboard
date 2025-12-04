@echo off
echo Deploying InsightSphere Dashboard...
echo.

set STACK_NAME=insightsphere-dev
set REGION=us-east-1
set ADMIN_EMAIL=dgopal@swbc.com

echo Stack: %STACK_NAME%
echo Region: %REGION%
echo Admin Email: %ADMIN_EMAIL%
echo.

echo Creating CloudFormation stack...
echo This will take 5-10 minutes...
echo.

aws cloudformation create-stack ^
    --stack-name %STACK_NAME% ^
    --template-body file://cloudformation/insightsphere-stack.yaml ^
    --parameters ^
        ParameterKey=EnvironmentName,ParameterValue=dev ^
        ParameterKey=ProjectName,ParameterValue=insightsphere ^
        ParameterKey=AdminEmail,ParameterValue=%ADMIN_EMAIL% ^
    --capabilities CAPABILITY_NAMED_IAM ^
    --region %REGION%

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Stack creation initiated!
    echo.
    echo Monitor progress with:
    echo aws cloudformation describe-stacks --stack-name %STACK_NAME% --region %REGION%
) else (
    echo.
    echo Stack creation failed!
)

pause
