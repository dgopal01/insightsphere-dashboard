# Amplify Deployment Helper Script
# This script helps deploy the InsightSphere Dashboard backend to AWS

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "InsightSphere Dashboard - AWS Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if AWS credentials are configured
Write-Host "Step 1: Checking AWS credentials..." -ForegroundColor Yellow
try {
    $awsIdentity = aws sts get-caller-identity 2>&1 | ConvertFrom-Json
    Write-Host "✓ AWS credentials configured" -ForegroundColor Green
    Write-Host "  Account: $($awsIdentity.Account)" -ForegroundColor Gray
    Write-Host "  User: $($awsIdentity.Arn)" -ForegroundColor Gray
} catch {
    Write-Host "✗ AWS credentials not configured" -ForegroundColor Red
    Write-Host "  Please run: aws configure" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Step 2: Initializing Amplify Backend..." -ForegroundColor Yellow
Write-Host ""
Write-Host "IMPORTANT: You will be asked several questions." -ForegroundColor Cyan
Write-Host "Please answer as follows:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  ? Do you want to use an existing environment?" -ForegroundColor White
Write-Host "    → No" -ForegroundColor Green
Write-Host ""
Write-Host "  ? Enter a name for the environment" -ForegroundColor White
Write-Host "    → dev" -ForegroundColor Green
Write-Host ""
Write-Host "  ? Choose your default editor" -ForegroundColor White
Write-Host "    → (Select your preference)" -ForegroundColor Green
Write-Host ""
Write-Host "  ? Choose the type of app that you're building" -ForegroundColor White
Write-Host "    → javascript (should be pre-selected)" -ForegroundColor Green
Write-Host ""
Write-Host "  ? What javascript framework are you using" -ForegroundColor White
Write-Host "    → react (should be pre-selected)" -ForegroundColor Green
Write-Host ""
Write-Host "  ? Source Directory Path" -ForegroundColor White
Write-Host "    → src (should be pre-selected)" -ForegroundColor Green
Write-Host ""
Write-Host "  ? Distribution Directory Path" -ForegroundColor White
Write-Host "    → dist (should be pre-selected)" -ForegroundColor Green
Write-Host ""
Write-Host "  ? Build Command" -ForegroundColor White
Write-Host "    → npm run build (should be pre-selected)" -ForegroundColor Green
Write-Host ""
Write-Host "  ? Start Command" -ForegroundColor White
Write-Host "    → npm run dev (should be pre-selected)" -ForegroundColor Green
Write-Host ""
Write-Host "  ? Select the authentication method" -ForegroundColor White
Write-Host "    → AWS profile" -ForegroundColor Green
Write-Host ""
Write-Host "  ? Please choose the profile you want to use" -ForegroundColor White
Write-Host "    → default (or your profile name)" -ForegroundColor Green
Write-Host ""
Write-Host "Press Enter to start the initialization process..." -ForegroundColor Yellow
Read-Host

# Run amplify init
Write-Host "Running: amplify init" -ForegroundColor Cyan
amplify init

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Amplify initialization completed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Step 3: Deploying backend resources..." -ForegroundColor Yellow
    Write-Host "This will create:" -ForegroundColor Cyan
    Write-Host "  - Cognito User Pool (authentication)" -ForegroundColor Gray
    Write-Host "  - AppSync GraphQL API (data layer)" -ForegroundColor Gray
    Write-Host "  - DynamoDB tables (storage)" -ForegroundColor Gray
    Write-Host "  - S3 bucket (file exports)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "This process will take 5-10 minutes." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press Enter to start deployment..." -ForegroundColor Yellow
    Read-Host
    
    Write-Host "Running: amplify push" -ForegroundColor Cyan
    amplify push
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "✓ Deployment completed successfully!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "1. Update .env file with AWS configuration" -ForegroundColor White
        Write-Host "2. Create a test user in Cognito" -ForegroundColor White
        Write-Host "3. Test the application" -ForegroundColor White
        Write-Host ""
        Write-Host "Run 'amplify status' to see your deployed resources" -ForegroundColor Yellow
    } else {
        Write-Host ""
        Write-Host "✗ Deployment failed" -ForegroundColor Red
        Write-Host "Check the error messages above" -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "✗ Initialization failed" -ForegroundColor Red
    Write-Host "Check the error messages above" -ForegroundColor Yellow
}

