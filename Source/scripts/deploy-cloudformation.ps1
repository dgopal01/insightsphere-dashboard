# InsightSphere Dashboard - Complete CloudFormation Deployment Script
# This script deploys the entire infrastructure with a single command

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('dev', 'staging', 'prod')]
    [string]$Environment = 'dev',
    
    [Parameter(Mandatory=$true)]
    [string]$AdminEmail,
    
    [Parameter(Mandatory=$false)]
    [string]$GitHubRepo = '',
    
    [Parameter(Mandatory=$false)]
    [string]$Region = 'us-east-1',
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipConfirmation
)

$ErrorActionPreference = "Stop"

# Colors for output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Header($message) {
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host $message -ForegroundColor Cyan
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Step($message) {
    Write-Host "▶ $message" -ForegroundColor Yellow
}

function Write-Success($message) {
    Write-Host "✓ $message" -ForegroundColor Green
}

function Write-Error($message) {
    Write-Host "✗ $message" -ForegroundColor Red
}

function Write-Info($message) {
    Write-Host "  $message" -ForegroundColor Gray
}

# Main deployment function
function Deploy-InsightSphere {
    Write-Header "InsightSphere Dashboard - CloudFormation Deployment"
    
    # Validate prerequisites
    Write-Step "Validating prerequisites..."
    
    # Check AWS CLI
    try {
        $awsVersion = aws --version 2>&1
        Write-Success "AWS CLI installed: $awsVersion"
    } catch {
        Write-Error "AWS CLI not found. Please install AWS CLI first."
        exit 1
    }
    
    # Check AWS credentials
    try {
        $identity = aws sts get-caller-identity --region $Region 2>&1 | ConvertFrom-Json
        Write-Success "AWS credentials configured"
        Write-Info "Account: $($identity.Account)"
        Write-Info "User: $($identity.Arn)"
    } catch {
        Write-Error "AWS credentials not configured. Run: aws configure"
        exit 1
    }
    
    # Check CloudFormation template
    if (-not (Test-Path "cloudformation/insightsphere-stack.yaml")) {
        Write-Error "CloudFormation template not found at: cloudformation/insightsphere-stack.yaml"
        exit 1
    }
    Write-Success "CloudFormation template found"
    
    # Set stack name
    $stackName = "insightsphere-$Environment"
    
    # Display deployment summary
    Write-Host ""
    Write-Host "Deployment Configuration:" -ForegroundColor Cyan
    Write-Info "Stack Name: $stackName"
    Write-Info "Environment: $Environment"
    Write-Info "Region: $Region"
    Write-Info "Admin Email: $AdminEmail"
    if ($GitHubRepo) {
        Write-Info "GitHub Repo: $GitHubRepo"
    }
    Write-Host ""
    
    # Confirm deployment
    if (-not $SkipConfirmation) {
        $confirm = Read-Host "Do you want to proceed with deployment? (yes/no)"
        if ($confirm -ne 'yes') {
            Write-Host "Deployment cancelled." -ForegroundColor Yellow
            exit 0
        }
    }
    
    # Validate CloudFormation template
    Write-Step "Validating CloudFormation template..."
    try {
        aws cloudformation validate-template `
            --template-body file://cloudformation/insightsphere-stack.yaml `
            --region $Region | Out-Null
        Write-Success "Template validation passed"
    } catch {
        Write-Error "Template validation failed"
        Write-Host $_.Exception.Message -ForegroundColor Red
        exit 1
    }
    
    # Check if stack exists
    Write-Step "Checking if stack exists..."
    $stackExists = $false
    try {
        $existingStack = aws cloudformation describe-stacks `
            --stack-name $stackName `
            --region $Region 2>&1 | ConvertFrom-Json
        $stackExists = $true
        Write-Info "Stack exists. Will update existing stack."
    } catch {
        Write-Info "Stack does not exist. Will create new stack."
    }
    
    # Prepare parameters
    $parameters = @(
        "ParameterKey=EnvironmentName,ParameterValue=$Environment",
        "ParameterKey=ProjectName,ParameterValue=insightsphere",
        "ParameterKey=AdminEmail,ParameterValue=$AdminEmail"
    )
    
    if ($GitHubRepo) {
        $parameters += "ParameterKey=GitHubRepository,ParameterValue=$GitHubRepo"
    }
    
    # Deploy stack
    if ($stackExists) {
        Write-Step "Updating CloudFormation stack..."
        Write-Info "This may take 10-15 minutes..."
        
        try {
            aws cloudformation update-stack `
                --stack-name $stackName `
                --template-body file://cloudformation/insightsphere-stack.yaml `
                --parameters $parameters `
                --capabilities CAPABILITY_NAMED_IAM `
                --region $Region
            
            Write-Info "Stack update initiated. Waiting for completion..."
            
            aws cloudformation wait stack-update-complete `
                --stack-name $stackName `
                --region $Region
            
            Write-Success "Stack updated successfully!"
        } catch {
            if ($_.Exception.Message -like "*No updates are to be performed*") {
                Write-Info "No updates needed. Stack is already up to date."
            } else {
                Write-Error "Stack update failed"
                Write-Host $_.Exception.Message -ForegroundColor Red
                exit 1
            }
        }
    } else {
        Write-Step "Creating CloudFormation stack..."
        Write-Info "This may take 10-15 minutes..."
        
        try {
            aws cloudformation create-stack `
                --stack-name $stackName `
                --template-body file://cloudformation/insightsphere-stack.yaml `
                --parameters $parameters `
                --capabilities CAPABILITY_NAMED_IAM `
                --region $Region `
                --tags Key=Environment,Value=$Environment Key=Project,Value=insightsphere
            
            Write-Info "Stack creation initiated. Waiting for completion..."
            
            aws cloudformation wait stack-create-complete `
                --stack-name $stackName `
                --region $Region
            
            Write-Success "Stack created successfully!"
        } catch {
            Write-Error "Stack creation failed"
            Write-Host $_.Exception.Message -ForegroundColor Red
            
            # Get stack events for debugging
            Write-Host ""
            Write-Host "Recent stack events:" -ForegroundColor Yellow
            aws cloudformation describe-stack-events `
                --stack-name $stackName `
                --region $Region `
                --max-items 10 `
                --query 'StackEvents[?ResourceStatus==`CREATE_FAILED`].[LogicalResourceId,ResourceStatusReason]' `
                --output table
            
            exit 1
        }
    }
    
    # Get stack outputs
    Write-Step "Retrieving stack outputs..."
    $outputs = aws cloudformation describe-stacks `
        --stack-name $stackName `
        --region $Region `
        --query 'Stacks[0].Outputs' | ConvertFrom-Json
    
    # Display outputs
    Write-Header "Deployment Complete!"
    
    Write-Host "AWS Resources Created:" -ForegroundColor Cyan
    foreach ($output in $outputs) {
        Write-Host "  $($output.OutputKey):" -ForegroundColor White
        Write-Host "    $($output.OutputValue)" -ForegroundColor Gray
    }
    
    # Extract key values
    $userPoolId = ($outputs | Where-Object { $_.OutputKey -eq 'UserPoolId' }).OutputValue
    $clientId = ($outputs | Where-Object { $_.OutputKey -eq 'UserPoolClientId' }).OutputValue
    $graphqlEndpoint = ($outputs | Where-Object { $_.OutputKey -eq 'GraphQLApiEndpoint' }).OutputValue
    $bucketName = ($outputs | Where-Object { $_.OutputKey -eq 'ExportsBucketName' }).OutputValue
    
    # Update .env file
    Write-Step "Updating .env file..."
    
    $envContent = @"
# Development Environment Configuration
# Auto-generated by deploy-cloudformation.ps1
# Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

# Environment identifier
VITE_ENV=$Environment

# AWS Amplify Configuration
VITE_AWS_REGION=$Region
VITE_USER_POOL_ID=$userPoolId
VITE_USER_POOL_CLIENT_ID=$clientId
VITE_GRAPHQL_ENDPOINT=$graphqlEndpoint
VITE_S3_BUCKET=$bucketName

# API Configuration
VITE_API_TIMEOUT=30000
VITE_API_RETRY_ATTEMPTS=3

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_ERROR_TRACKING=true
VITE_ENABLE_PERFORMANCE_MONITORING=true

# Monitoring (Optional - leave empty to disable)
VITE_SENTRY_DSN=
VITE_SENTRY_ENVIRONMENT=$Environment
VITE_SENTRY_TRACES_SAMPLE_RATE=0.1

# Debug Settings
VITE_DEBUG_MODE=$(if ($Environment -eq 'prod') { 'false' } else { 'true' })
VITE_LOG_LEVEL=$(if ($Environment -eq 'prod') { 'error' } else { 'debug' })

# Performance Settings
VITE_ENABLE_SOURCE_MAPS=$(if ($Environment -eq 'prod') { 'false' } else { 'true' })
VITE_BUNDLE_ANALYZER=false
"@
    
    # Backup existing .env
    if (Test-Path ".env") {
        $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
        Copy-Item ".env" ".env.backup-$timestamp" -Force
        Write-Info "Backed up existing .env to .env.backup-$timestamp"
    }
    
    # Write new .env
    $envContent | Out-File -FilePath ".env" -Encoding UTF8 -Force
    Write-Success ".env file updated successfully"
    
    # Create aws-exports.ts
    Write-Step "Creating aws-exports.ts..."
    
    $awsExportsContent = @"
/**
 * AWS Amplify Configuration
 * Auto-generated by deploy-cloudformation.ps1
 * Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
 */

const awsconfig = {
  aws_project_region: '$Region',
  aws_cognito_region: '$Region',
  aws_user_pools_id: '$userPoolId',
  aws_user_pools_web_client_id: '$clientId',
  aws_appsync_graphqlEndpoint: '$graphqlEndpoint',
  aws_appsync_region: '$Region',
  aws_appsync_authenticationType: 'AMAZON_COGNITO_USER_POOLS',
  aws_user_files_s3_bucket: '$bucketName',
  aws_user_files_s3_bucket_region: '$Region',
};

export default awsconfig;
"@
    
    $awsExportsContent | Out-File -FilePath "src/aws-exports.ts" -Encoding UTF8 -Force
    Write-Success "aws-exports.ts created successfully"
    
    # Next steps
    Write-Header "Next Steps"
    
    Write-Host "1. Create an admin user in Cognito:" -ForegroundColor Cyan
    Write-Host "   aws cognito-idp admin-create-user ``" -ForegroundColor White
    Write-Host "     --user-pool-id $userPoolId ``" -ForegroundColor White
    Write-Host "     --username admin ``" -ForegroundColor White
    Write-Host "     --user-attributes Name=email,Value=$AdminEmail ``" -ForegroundColor White
    Write-Host "     --temporary-password 'TempPass123!' ``" -ForegroundColor White
    Write-Host "     --region $Region" -ForegroundColor White
    Write-Host ""
    
    Write-Host "2. Add user to admin group:" -ForegroundColor Cyan
    Write-Host "   aws cognito-idp admin-add-user-to-group ``" -ForegroundColor White
    Write-Host "     --user-pool-id $userPoolId ``" -ForegroundColor White
    Write-Host "     --username admin ``" -ForegroundColor White
    Write-Host "     --group-name admin ``" -ForegroundColor White
    Write-Host "     --region $Region" -ForegroundColor White
    Write-Host ""
    
    Write-Host "3. Start the development server:" -ForegroundColor Cyan
    Write-Host "   npm run dev" -ForegroundColor White
    Write-Host ""
    
    Write-Host "4. Open the application:" -ForegroundColor Cyan
    Write-Host "   http://localhost:5173" -ForegroundColor White
    Write-Host ""
    
    Write-Host "5. Sign in with:" -ForegroundColor Cyan
    Write-Host "   Username: admin" -ForegroundColor White
    Write-Host "   Password: TempPass123! (you will be prompted to change it)" -ForegroundColor White
    Write-Host ""
    
    # Save deployment info
    $deploymentInfo = @{
        Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Environment = $Environment
        Region = $Region
        StackName = $stackName
        UserPoolId = $userPoolId
        ClientId = $clientId
        GraphQLEndpoint = $graphqlEndpoint
        BucketName = $bucketName
    }
    
    $deploymentInfo | ConvertTo-Json | Out-File -FilePath "deployment-info.json" -Encoding UTF8 -Force
    Write-Success "Deployment info saved to deployment-info.json"
    
    Write-Host ""
    Write-Host "Deployment completed successfully!" -ForegroundColor Green
    Write-Host ""
}

# Run deployment
try {
    Deploy-InsightSphere
} catch {
    Write-Error "Deployment failed with error:"
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host $_.ScriptStackTrace -ForegroundColor Red
    exit 1
}
