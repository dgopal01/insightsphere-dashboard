# Simple deployment script
$stackName = "insightsphere-dev"
$region = "us-east-1"
$adminEmail = "admin@insightsphere.local"

Write-Host "Deploying InsightSphere Dashboard..." -ForegroundColor Cyan
Write-Host "Stack: $stackName" -ForegroundColor Gray
Write-Host "Region: $region" -ForegroundColor Gray
Write-Host ""

# Create stack
Write-Host "Creating CloudFormation stack..." -ForegroundColor Yellow
Write-Host "This will take 10-15 minutes..." -ForegroundColor Gray
Write-Host ""

aws cloudformation create-stack `
    --stack-name $stackName `
    --template-body "file://cloudformation/insightsphere-stack.yaml" `
    --parameters `
        ParameterKey=EnvironmentName,ParameterValue=dev `
        ParameterKey=ProjectName,ParameterValue=insightsphere `
        ParameterKey=AdminEmail,ParameterValue=$adminEmail `
    --capabilities CAPABILITY_NAMED_IAM `
    --region $region

if ($LASTEXITCODE -eq 0) {
    Write-Host "Stack creation initiated!" -ForegroundColor Green
    Write-Host "Waiting for completion..." -ForegroundColor Yellow
    
    aws cloudformation wait stack-create-complete `
        --stack-name $stackName `
        --region $region
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Stack created successfully!" -ForegroundColor Green
    } else {
        Write-Host "Stack creation failed or timed out" -ForegroundColor Red
    }
} else {
    Write-Host "Failed to initiate stack creation" -ForegroundColor Red
}
