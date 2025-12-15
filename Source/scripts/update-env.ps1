# Update .env file with AWS Amplify configuration
# Run this AFTER amplify push completes successfully

Write-Host "Extracting AWS configuration from Amplify..." -ForegroundColor Cyan
Write-Host ""

# Check if aws-exports.js exists
if (-not (Test-Path "src\aws-exports.js")) {
    Write-Host "Error: aws-exports.js not found!" -ForegroundColor Red
    Write-Host "Make sure you've run 'amplify push' successfully" -ForegroundColor Yellow
    exit 1
}

# Read aws-exports.js
$awsExports = Get-Content "src\aws-exports.js" -Raw

# Extract values using regex
$userPoolId = if ($awsExports -match 'aws_user_pools_id:\s*[''"]([^''"]+)[''"]') { $matches[1] } else { "" }
$userPoolClientId = if ($awsExports -match 'aws_user_pools_web_client_id:\s*[''"]([^''"]+)[''"]') { $matches[1] } else { "" }
$graphqlEndpoint = if ($awsExports -match 'aws_appsync_graphqlEndpoint:\s*[''"]([^''"]+)[''"]') { $matches[1] } else { "" }
$s3Bucket = if ($awsExports -match 'aws_user_files_s3_bucket:\s*[''"]([^''"]+)[''"]') { $matches[1] } else { "" }
$region = if ($awsExports -match 'aws_project_region:\s*[''"]([^''"]+)[''"]') { $matches[1] } else { "us-east-1" }

Write-Host "Found AWS Configuration:" -ForegroundColor Green
Write-Host "  Region: $region" -ForegroundColor Gray
Write-Host "  User Pool ID: $userPoolId" -ForegroundColor Gray
Write-Host "  Client ID: $userPoolClientId" -ForegroundColor Gray
Write-Host "  GraphQL Endpoint: $graphqlEndpoint" -ForegroundColor Gray
Write-Host "  S3 Bucket: $s3Bucket" -ForegroundColor Gray
Write-Host ""

# Update .env file
$envContent = @"
# Development Environment Configuration
# This file contains environment-specific settings for development
# Updated automatically by update-env.ps1

# Environment identifier
VITE_ENV=development

# AWS Amplify Configuration (Development)
VITE_AWS_REGION=$region
VITE_USER_POOL_ID=$userPoolId
VITE_USER_POOL_CLIENT_ID=$userPoolClientId
VITE_GRAPHQL_ENDPOINT=$graphqlEndpoint
VITE_S3_BUCKET=$s3Bucket

# API Configuration
VITE_API_TIMEOUT=30000
VITE_API_RETRY_ATTEMPTS=3

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_ERROR_TRACKING=true
VITE_ENABLE_PERFORMANCE_MONITORING=true

# Monitoring (Optional - leave empty to disable)
VITE_SENTRY_DSN=
VITE_SENTRY_ENVIRONMENT=development
VITE_SENTRY_TRACES_SAMPLE_RATE=0.1

# Debug Settings
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug

# Performance Settings
VITE_ENABLE_SOURCE_MAPS=true
VITE_BUNDLE_ANALYZER=false
"@

# Backup existing .env
if (Test-Path ".env") {
    Copy-Item ".env" ".env.backup" -Force
    Write-Host "Backed up existing .env to .env.backup" -ForegroundColor Yellow
}

# Write new .env
$envContent | Out-File -FilePath ".env" -Encoding UTF8 -Force

Write-Host ""
Write-Host "✓ .env file updated successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Restart your development server: npm run dev" -ForegroundColor White
Write-Host "2. Create a test user in Cognito: amplify console auth" -ForegroundColor White
Write-Host "3. Sign in to the application" -ForegroundColor White
Write-Host ""
