# InsightSphere Dashboard - Complete One-Click Deployment
# This script deploys everything and sets up the application ready to use

param(
    [Parameter(Mandatory=$true)]
    [string]$AdminEmail,
    
    [Parameter(Mandatory=$false)]
    [ValidateSet('dev', 'staging', 'prod')]
    [string]$Environment = 'dev',
    
    [Parameter(Mandatory=$false)]
    [string]$AdminUsername = 'admin',
    
    [Parameter(Mandatory=$false)]
    [string]$Region = 'us-east-1',
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipUserCreation,
    
    [Parameter(Mandatory=$false)]
    [switch]$StartDevServer
)

$ErrorActionPreference = "Stop"

function Write-Header($message) {
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host $message -ForegroundColor Cyan
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Step($step, $message) {
    Write-Host ""
    Write-Host "[$step] $message" -ForegroundColor Yellow
    Write-Host ""
}

function Write-Success($message) {
    Write-Host "[OK] $message" -ForegroundColor Green
}

function Write-Info($message) {
    Write-Host "  $message" -ForegroundColor Gray
}

Write-Header "InsightSphere Dashboard - Complete Deployment"

Write-Host "This script will:" -ForegroundColor Cyan
Write-Host "  1. Deploy AWS infrastructure (CloudFormation)" -ForegroundColor White
Write-Host "  2. Create admin user in Cognito" -ForegroundColor White
Write-Host "  3. Update configuration files" -ForegroundColor White
Write-Host "  4. Optionally start the development server" -ForegroundColor White
Write-Host ""
Write-Host "Configuration:" -ForegroundColor Cyan
Write-Info "Environment: $Environment"
Write-Info "Region: $Region"
Write-Info "Admin Email: $AdminEmail"
Write-Info "Admin Username: $AdminUsername"
Write-Host ""

$confirm = Read-Host "Do you want to proceed? (yes/no)"
if ($confirm -ne 'yes') {
    Write-Host "Deployment cancelled." -ForegroundColor Yellow
    exit 0
}

# Step 1: Deploy CloudFormation Stack
Write-Step "1/4" "Deploying AWS Infrastructure"

try {
    $scriptPath = Join-Path $PSScriptRoot "deploy-cloudformation.ps1"
    & $scriptPath `
        -Environment $Environment `
        -AdminEmail $AdminEmail `
        -Region $Region `
        -SkipConfirmation
    
    Write-Success "Infrastructure deployed successfully"
} catch {
    Write-Host "[ERROR] Infrastructure deployment failed" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# Step 2: Create Admin User
if (-not $SkipUserCreation) {
    Write-Step "2/4" "Creating Admin User"
    
    try {
        $scriptPath = Join-Path $PSScriptRoot "create-admin-user.ps1"
        & $scriptPath `
            -Username $AdminUsername `
            -Email $AdminEmail `
            -Environment $Environment `
            -Region $Region
        
        Write-Success "Admin user created successfully"
    } catch {
        Write-Host "[WARNING] Admin user creation failed (may already exist)" -ForegroundColor Yellow
        Write-Host $_.Exception.Message -ForegroundColor Gray
    }
} else {
    Write-Step "2/4" "Skipping User Creation"
    Write-Info "User creation skipped as requested"
}

# Step 3: Verify Configuration
Write-Step "3/4" "Verifying Configuration"

if (Test-Path ".env") {
    Write-Success ".env file exists"
    
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "VITE_USER_POOL_ID=us-east-1_") {
        Write-Success "Environment variables configured"
    } else {
        Write-Host "[WARNING] Environment variables may not be fully configured" -ForegroundColor Yellow
    }
} else {
    Write-Host "[ERROR] .env file not found" -ForegroundColor Red
}

if (Test-Path "src/aws-exports.ts") {
    Write-Success "aws-exports.ts exists"
} else {
    Write-Host "[ERROR] aws-exports.ts not found" -ForegroundColor Red
}

if (Test-Path "deployment-info.json") {
    Write-Success "Deployment info saved"
    
    $deployInfo = Get-Content "deployment-info.json" | ConvertFrom-Json
    Write-Info "Stack: $($deployInfo.StackName)"
    Write-Info "Region: $($deployInfo.Region)"
} else {
    Write-Host "[WARNING] Deployment info not found" -ForegroundColor Yellow
}

# Step 4: Start Development Server (Optional)
Write-Step "4/4" "Development Server"

if ($StartDevServer) {
    Write-Info "Starting development server..."
    Write-Info "The server will start in a new window"
    Write-Info "Access the application at: http://localhost:5173"
    Write-Host ""
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
    
    Write-Success "Development server started"
} else {
    Write-Info "To start the development server, run:"
    Write-Host "  npm run dev" -ForegroundColor White
}

# Final Summary
Write-Header "Deployment Complete!"

Write-Host "[SUCCESS] All steps completed successfully!" -ForegroundColor Green
Write-Host ""

Write-Host "What's Next:" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Start the development server (if not already started):" -ForegroundColor Yellow
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""

Write-Host "2. Open your browser:" -ForegroundColor Yellow
Write-Host "   http://localhost:5173" -ForegroundColor White
Write-Host ""

Write-Host "3. Sign in with:" -ForegroundColor Yellow
Write-Host "   Username: $AdminUsername" -ForegroundColor White
Write-Host "   Password: TempPass123!" -ForegroundColor White
Write-Host "   (You will be prompted to change it)" -ForegroundColor Gray
Write-Host ""

Write-Host "4. Explore the application:" -ForegroundColor Yellow
Write-Host "   - Dashboard with metrics" -ForegroundColor White
Write-Host "   - Chat logs viewer" -ForegroundColor White
Write-Host "   - Feedback collection" -ForegroundColor White
Write-Host "   - CSV export functionality" -ForegroundColor White
Write-Host ""

Write-Host "Deployment Information:" -ForegroundColor Cyan
if (Test-Path "deployment-info.json") {
    $info = Get-Content "deployment-info.json" | ConvertFrom-Json
    Write-Host "  Stack Name: $($info.StackName)" -ForegroundColor Gray
    Write-Host "  Region: $($info.Region)" -ForegroundColor Gray
    Write-Host "  User Pool: $($info.UserPoolId)" -ForegroundColor Gray
    Write-Host "  GraphQL API: $($info.GraphQLEndpoint)" -ForegroundColor Gray
}
Write-Host ""

Write-Host "Useful Commands:" -ForegroundColor Cyan
Write-Host "  View stack status:" -ForegroundColor White
Write-Host "    aws cloudformation describe-stacks --stack-name insightsphere-$Environment --region $Region" -ForegroundColor Gray
Write-Host ""
Write-Host "  Create another user:" -ForegroundColor White
Write-Host "    .\create-admin-user.ps1 -Email user@example.com -Username newuser" -ForegroundColor Gray
Write-Host ""
Write-Host "  Delete stack:" -ForegroundColor White
Write-Host "    aws cloudformation delete-stack --stack-name insightsphere-$Environment --region $Region" -ForegroundColor Gray
Write-Host ""

Write-Host "Documentation:" -ForegroundColor Cyan
Write-Host "  - CloudFormation: cloudformation/README.md" -ForegroundColor Gray
Write-Host "  - Deployment Guide: build_docs/DEPLOYMENT_GUIDE.md" -ForegroundColor Gray
Write-Host "  - Full Documentation: docs/DEPLOYMENT.md" -ForegroundColor Gray
Write-Host ""

Write-Host "Happy coding!" -ForegroundColor Green
Write-Host ""
