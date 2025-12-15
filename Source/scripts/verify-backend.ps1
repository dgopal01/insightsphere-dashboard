# PowerShell script to verify AWS Amplify backend connectivity
# This script checks if all backend services are properly configured and accessible

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Backend Connectivity Verification" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Load environment variables
if (Test-Path ".env") {
    Write-Host "Loading environment variables from .env..." -ForegroundColor Yellow
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $name = $matches[1]
            $value = $matches[2]
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
    Write-Host "✓ Environment variables loaded" -ForegroundColor Green
} else {
    Write-Host "✗ .env file not found" -ForegroundColor Red
    Write-Host "Please create .env file with AWS configuration" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Checking configuration..." -ForegroundColor Yellow
Write-Host ""

# Check required environment variables
$requiredVars = @(
    "VITE_AWS_REGION",
    "VITE_AWS_USER_POOL_ID",
    "VITE_AWS_USER_POOL_CLIENT_ID",
    "VITE_AWS_GRAPHQL_ENDPOINT",
    "VITE_AWS_S3_BUCKET"
)

$allConfigured = $true
foreach ($var in $requiredVars) {
    $value = [Environment]::GetEnvironmentVariable($var, "Process")
    if ([string]::IsNullOrEmpty($value) -or $value -eq "your-*") {
        Write-Host "✗ $var is not configured" -ForegroundColor Red
        $allConfigured = $false
    } else {
        Write-Host "✓ $var is configured" -ForegroundColor Green
    }
}

if (-not $allConfigured) {
    Write-Host ""
    Write-Host "Please update your .env file with actual AWS values" -ForegroundColor Yellow
    Write-Host "Run 'amplify push' to deploy backend and get these values" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AWS Service Checks" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Cognito User Pool
Write-Host "Checking Cognito User Pool..." -ForegroundColor Yellow
$userPoolId = [Environment]::GetEnvironmentVariable("VITE_AWS_USER_POOL_ID", "Process")
$region = [Environment]::GetEnvironmentVariable("VITE_AWS_REGION", "Process")

try {
    $userPool = aws cognito-idp describe-user-pool --user-pool-id $userPoolId --region $region 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Cognito User Pool is accessible" -ForegroundColor Green
    } else {
        Write-Host "✗ Cannot access Cognito User Pool" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Error checking Cognito User Pool" -ForegroundColor Red
}

# Check S3 Bucket
Write-Host "Checking S3 Bucket..." -ForegroundColor Yellow
$bucketName = [Environment]::GetEnvironmentVariable("VITE_AWS_S3_BUCKET", "Process")

try {
    $bucket = aws s3api head-bucket --bucket $bucketName --region $region 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ S3 Bucket is accessible" -ForegroundColor Green
    } else {
        Write-Host "✗ Cannot access S3 Bucket" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Error checking S3 Bucket" -ForegroundColor Red
}

# Check AppSync API
Write-Host "Checking AppSync GraphQL API..." -ForegroundColor Yellow
$graphqlEndpoint = [Environment]::GetEnvironmentVariable("VITE_AWS_GRAPHQL_ENDPOINT", "Process")

if ($graphqlEndpoint -match "https://([^.]+)\.appsync-api\.") {
    $apiId = $matches[1]
    try {
        $api = aws appsync get-graphql-api --api-id $apiId --region $region 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ AppSync GraphQL API is accessible" -ForegroundColor Green
        } else {
            Write-Host "✗ Cannot access AppSync API" -ForegroundColor Red
        }
    } catch {
        Write-Host "✗ Error checking AppSync API" -ForegroundColor Red
    }
} else {
    Write-Host "⚠ Cannot extract API ID from GraphQL endpoint" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DynamoDB Tables Check" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# List DynamoDB tables
Write-Host "Checking DynamoDB tables..." -ForegroundColor Yellow
try {
    $tables = aws dynamodb list-tables --region $region --output json | ConvertFrom-Json
    $chatLogTable = $tables.TableNames | Where-Object { $_ -like "*ChatLog*" }
    $feedbackTable = $tables.TableNames | Where-Object { $_ -like "*Feedback*" }
    
    if ($chatLogTable) {
        Write-Host "✓ ChatLog table found: $chatLogTable" -ForegroundColor Green
    } else {
        Write-Host "✗ ChatLog table not found" -ForegroundColor Red
    }
    
    if ($feedbackTable) {
        Write-Host "✓ Feedback table found: $feedbackTable" -ForegroundColor Green
    } else {
        Write-Host "✗ Feedback table not found" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Error checking DynamoDB tables" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Verification Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "If all checks passed, your backend is ready!" -ForegroundColor Green
Write-Host "If any checks failed, please:" -ForegroundColor Yellow
Write-Host "  1. Run 'amplify push' to deploy backend" -ForegroundColor White
Write-Host "  2. Update .env file with correct values" -ForegroundColor White
Write-Host "  3. Ensure AWS credentials have proper permissions" -ForegroundColor White
Write-Host ""
