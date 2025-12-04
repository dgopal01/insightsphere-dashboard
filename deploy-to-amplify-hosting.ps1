# Deploy InsightSphere Dashboard to AWS Amplify Hosting
# This script sets up Amplify Hosting with your existing CloudFormation resources

param(
    [string]$GitHubRepo = "",
    [string]$GitHubToken = "",
    [string]$Branch = "main",
    [string]$Environment = "dev",
    [string]$Region = "us-east-1"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AWS Amplify Hosting Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if AWS CLI is installed
if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-Host "✗ AWS CLI not found" -ForegroundColor Red
    Write-Host "Please install AWS CLI: https://aws.amazon.com/cli/" -ForegroundColor Yellow
    exit 1
}

# Check AWS credentials
Write-Host "Checking AWS credentials..." -ForegroundColor Yellow
try {
    $identity = aws sts get-caller-identity --region $Region | ConvertFrom-Json
    Write-Host "✓ AWS Account: $($identity.Account)" -ForegroundColor Green
} catch {
    Write-Host "✗ AWS credentials not configured" -ForegroundColor Red
    Write-Host "Run: aws configure" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Get CloudFormation stack outputs
Write-Host "Retrieving CloudFormation stack outputs..." -ForegroundColor Yellow
$stackName = "insightsphere-$Environment"

try {
    $outputs = aws cloudformation describe-stacks `
        --stack-name $stackName `
        --region $Region `
        --query 'Stacks[0].Outputs' | ConvertFrom-Json
    
    $userPoolId = ($outputs | Where-Object { $_.OutputKey -eq "UserPoolId" }).OutputValue
    $clientId = ($outputs | Where-Object { $_.OutputKey -eq "UserPoolClientId" }).OutputValue
    $identityPoolId = ($outputs | Where-Object { $_.OutputKey -eq "IdentityPoolId" }).OutputValue
    $graphqlEndpoint = ($outputs | Where-Object { $_.OutputKey -eq "GraphQLApiEndpoint" }).OutputValue
    $graphqlApiId = ($outputs | Where-Object { $_.OutputKey -eq "GraphQLApiId" }).OutputValue
    $s3Bucket = ($outputs | Where-Object { $_.OutputKey -eq "ExportsBucketName" }).OutputValue
    
    Write-Host "✓ Stack outputs retrieved" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to retrieve stack outputs" -ForegroundColor Red
    Write-Host "Make sure CloudFormation stack '$stackName' exists" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Check if GitHub repo is provided
if ([string]::IsNullOrEmpty($GitHubRepo)) {
    Write-Host "GitHub Repository Setup" -ForegroundColor Cyan
    Write-Host "========================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "To deploy with Amplify Hosting, you need a GitHub repository." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Option 1: Create a new GitHub repository" -ForegroundColor White
    Write-Host "  1. Go to https://github.com/new" -ForegroundColor Gray
    Write-Host "  2. Create a repository named 'insightsphere-dashboard'" -ForegroundColor Gray
    Write-Host "  3. Push your code:" -ForegroundColor Gray
    Write-Host ""
    Write-Host "     git init" -ForegroundColor DarkGray
    Write-Host "     git add ." -ForegroundColor DarkGray
    Write-Host "     git commit -m 'Initial commit'" -ForegroundColor DarkGray
    Write-Host "     git branch -M main" -ForegroundColor DarkGray
    Write-Host "     git remote add origin https://github.com/YOUR_USERNAME/insightsphere-dashboard.git" -ForegroundColor DarkGray
    Write-Host "     git push -u origin main" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "Option 2: Manual Deployment (No GitHub required)" -ForegroundColor White
    Write-Host "  Use AWS Amplify CLI to deploy directly:" -ForegroundColor Gray
    Write-Host ""
    Write-Host "     npm install -g @aws-amplify/cli" -ForegroundColor DarkGray
    Write-Host "     amplify publish" -ForegroundColor DarkGray
    Write-Host ""
    
    $choice = Read-Host "Do you have a GitHub repository URL? (yes/no)"
    
    if ($choice -eq "yes") {
        $GitHubRepo = Read-Host "Enter your GitHub repository URL (e.g., https://github.com/username/repo)"
        $GitHubToken = Read-Host "Enter your GitHub Personal Access Token (for private repos, or leave empty for public)" -AsSecureString
        $GitHubToken = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($GitHubToken))
    } else {
        Write-Host ""
        Write-Host "Manual Deployment Instructions:" -ForegroundColor Cyan
        Write-Host "===============================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "1. Build your application:" -ForegroundColor White
        Write-Host "   npm run build" -ForegroundColor Gray
        Write-Host ""
        Write-Host "2. Deploy to S3 + CloudFront (Alternative):" -ForegroundColor White
        Write-Host "   - Create an S3 bucket for hosting" -ForegroundColor Gray
        Write-Host "   - Enable static website hosting" -ForegroundColor Gray
        Write-Host "   - Upload dist/ folder contents" -ForegroundColor Gray
        Write-Host "   - Create CloudFront distribution" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Or use Amplify CLI:" -ForegroundColor White
        Write-Host "   npm install -g @aws-amplify/cli" -ForegroundColor Gray
        Write-Host "   amplify init" -ForegroundColor Gray
        Write-Host "   amplify add hosting" -ForegroundColor Gray
        Write-Host "   amplify publish" -ForegroundColor Gray
        Write-Host ""
        exit 0
    }
}

Write-Host ""
Write-Host "Creating Amplify App..." -ForegroundColor Yellow

# Create Amplify app
$appName = "insightsphere-$Environment"

try {
    $createAppCmd = "aws amplify create-app --name $appName --region $Region"
    
    # Add environment variables
    $envVars = @{
        "VITE_ENV" = $Environment
        "VITE_AWS_REGION" = $Region
        "VITE_USER_POOL_ID" = $userPoolId
        "VITE_USER_POOL_CLIENT_ID" = $clientId
        "VITE_IDENTITY_POOL_ID" = $identityPoolId
        "VITE_GRAPHQL_ENDPOINT" = $graphqlEndpoint
        "VITE_GRAPHQL_API_ID" = $graphqlApiId
        "VITE_S3_BUCKET" = $s3Bucket
    }
    
    $envVarsJson = $envVars | ConvertTo-Json -Compress
    $createAppCmd += " --environment-variables '$envVarsJson'"
    
    # Add custom rules for SPA routing
    $customRules = @(
        @{
            source = "/<*>"
            target = "/index.html"
            status = "404-200"
        }
    ) | ConvertTo-Json -Compress
    
    $createAppCmd += " --custom-rules '$customRules'"
    
    $app = Invoke-Expression $createAppCmd | ConvertFrom-Json
    $appId = $app.app.appId
    
    Write-Host "✓ Amplify app created: $appId" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to create Amplify app" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Connect GitHub repository
if (-not [string]::IsNullOrEmpty($GitHubRepo)) {
    Write-Host "Connecting GitHub repository..." -ForegroundColor Yellow
    
    try {
        $connectCmd = "aws amplify create-branch --app-id $appId --branch-name $Branch --region $Region"
        
        if (-not [string]::IsNullOrEmpty($GitHubToken)) {
            # For private repos, you need to set up OAuth in the console first
            Write-Host "Note: For private repositories, you need to authorize GitHub access in the Amplify Console" -ForegroundColor Yellow
            Write-Host "Visit: https://console.aws.amazon.com/amplify/home?region=$Region#/$appId" -ForegroundColor Cyan
        }
        
        Invoke-Expression $connectCmd | Out-Null
        Write-Host "✓ Branch connected: $Branch" -ForegroundColor Green
    } catch {
        Write-Host "⚠ Branch connection requires manual setup in Amplify Console" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✓ Amplify Hosting Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Complete GitHub connection in Amplify Console:" -ForegroundColor White
Write-Host "   https://console.aws.amazon.com/amplify/home?region=$Region#/$appId" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Configure build settings (already set in amplify.yml)" -ForegroundColor White
Write-Host ""
Write-Host "3. Trigger a deployment:" -ForegroundColor White
Write-Host "   - Push to your GitHub repository" -ForegroundColor Gray
Write-Host "   - Or manually trigger in the console" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Your app will be available at:" -ForegroundColor White
Write-Host "   https://$Branch.$appId.amplifyapp.com" -ForegroundColor Cyan
Write-Host ""
Write-Host "Environment Variables (already configured):" -ForegroundColor Yellow
foreach ($key in $envVars.Keys) {
    Write-Host "  $key = $($envVars[$key])" -ForegroundColor Gray
}
Write-Host ""
