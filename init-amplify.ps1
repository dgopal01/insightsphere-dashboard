# Simple Amplify Init Script
Write-Host "InsightSphere Dashboard - AWS Deployment" -ForegroundColor Cyan
Write-Host ""

# Check AWS credentials
Write-Host "Checking AWS credentials..." -ForegroundColor Yellow
$identity = aws sts get-caller-identity 2>&1 | ConvertFrom-Json
if ($identity) {
    Write-Host "AWS Account: $($identity.Account)" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "AWS credentials not found. Run: aws configure" -ForegroundColor Red
    exit 1
}

Write-Host "Starting Amplify initialization..." -ForegroundColor Yellow
Write-Host "You will be asked several questions. Answer as shown:" -ForegroundColor Cyan
Write-Host "  - Use existing environment? No" -ForegroundColor White
Write-Host "  - Environment name: dev" -ForegroundColor White
Write-Host "  - Authentication method: AWS profile" -ForegroundColor White
Write-Host "  - Profile: default" -ForegroundColor White
Write-Host ""
Write-Host "Press Enter to continue..." -ForegroundColor Yellow
Read-Host

amplify init
