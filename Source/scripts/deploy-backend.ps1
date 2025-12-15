# PowerShell script to deploy AWS Amplify backend
# This script initializes and deploys the Amplify backend services

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "InsightSphere Backend Deployment Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Amplify CLI is installed
Write-Host "Checking Amplify CLI installation..." -ForegroundColor Yellow
try {
    $amplifyVersion = amplify --version
    Write-Host "✓ Amplify CLI version: $amplifyVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Amplify CLI is not installed" -ForegroundColor Red
    Write-Host "Please install it with: npm install -g @aws-amplify/cli" -ForegroundColor Yellow
    exit 1
}

# Check if AWS CLI is configured
Write-Host "Checking AWS CLI configuration..." -ForegroundColor Yellow
try {
    $awsIdentity = aws sts get-caller-identity 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ AWS CLI is configured" -ForegroundColor Green
    } else {
        Write-Host "✗ AWS CLI is not configured" -ForegroundColor Red
        Write-Host "Please configure it with: aws configure" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "✗ AWS CLI is not installed or configured" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deployment Options" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "1. Initialize new Amplify project" -ForegroundColor White
Write-Host "2. Push backend to AWS (deploy/update)" -ForegroundColor White
Write-Host "3. Check deployment status" -ForegroundColor White
Write-Host "4. Generate GraphQL code" -ForegroundColor White
Write-Host "5. Open Amplify Console" -ForegroundColor White
Write-Host "6. Full deployment (init + push)" -ForegroundColor White
Write-Host "0. Exit" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (0-6)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "Initializing Amplify project..." -ForegroundColor Yellow
        amplify init
    }
    "2" {
        Write-Host ""
        Write-Host "Pushing backend to AWS..." -ForegroundColor Yellow
        Write-Host "This will create/update:" -ForegroundColor Cyan
        Write-Host "  - Cognito User Pool (Authentication)" -ForegroundColor White
        Write-Host "  - AppSync GraphQL API" -ForegroundColor White
        Write-Host "  - DynamoDB Tables (ChatLog, Feedback)" -ForegroundColor White
        Write-Host "  - S3 Bucket (CSV Exports)" -ForegroundColor White
        Write-Host ""
        $confirm = Read-Host "Continue? (y/n)"
        if ($confirm -eq "y" -or $confirm -eq "Y") {
            amplify push
            
            Write-Host ""
            Write-Host "========================================" -ForegroundColor Green
            Write-Host "Deployment Complete!" -ForegroundColor Green
            Write-Host "========================================" -ForegroundColor Green
            Write-Host ""
            Write-Host "Next steps:" -ForegroundColor Yellow
            Write-Host "1. Update your .env file with the generated values" -ForegroundColor White
            Write-Host "2. Create user groups (admin, viewer) in Cognito Console" -ForegroundColor White
            Write-Host "3. Create test users and assign them to groups" -ForegroundColor White
            Write-Host "4. Run 'npm run dev' to start the application" -ForegroundColor White
        }
    }
    "3" {
        Write-Host ""
        Write-Host "Checking deployment status..." -ForegroundColor Yellow
        amplify status
    }
    "4" {
        Write-Host ""
        Write-Host "Generating GraphQL code..." -ForegroundColor Yellow
        amplify codegen
    }
    "5" {
        Write-Host ""
        Write-Host "Opening Amplify Console..." -ForegroundColor Yellow
        amplify console
    }
    "6" {
        Write-Host ""
        Write-Host "Starting full deployment..." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Step 1: Initialize Amplify project" -ForegroundColor Cyan
        amplify init
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "Step 2: Push backend to AWS" -ForegroundColor Cyan
            amplify push
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host ""
                Write-Host "========================================" -ForegroundColor Green
                Write-Host "Full Deployment Complete!" -ForegroundColor Green
                Write-Host "========================================" -ForegroundColor Green
                Write-Host ""
                Write-Host "Backend resources created:" -ForegroundColor Yellow
                amplify status
            }
        }
    }
    "0" {
        Write-Host "Exiting..." -ForegroundColor Yellow
        exit 0
    }
    default {
        Write-Host "Invalid choice. Exiting..." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Script completed." -ForegroundColor Green
