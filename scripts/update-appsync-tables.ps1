# Update AppSync Data Sources to Use Existing Tables
# This script updates the AppSync API to read from UnityAIAssistantLogs and userFeedback tables

param(
    [string]$ApiId = "u3e7wpkmkrevbkkho5rh6pqf6u",
    [string]$Region = "us-east-1",
    [string]$ChatLogTable = "UnityAIAssistantLogs",
    [string]$FeedbackTable = "userFeedback"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Update AppSync Data Sources" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get current data sources
Write-Host "Fetching current data sources..." -ForegroundColor Yellow
$dataSources = aws appsync list-data-sources --api-id $ApiId --region $Region | ConvertFrom-Json

Write-Host "Current data sources:" -ForegroundColor White
foreach ($ds in $dataSources.dataSources) {
    Write-Host "  - $($ds.name): $($ds.dynamodbConfig.tableName)" -ForegroundColor Gray
}

Write-Host ""

# Update ChatLog data source
Write-Host "Updating ChatLogTable data source..." -ForegroundColor Yellow
$chatLogDs = $dataSources.dataSources | Where-Object { $_.name -eq "ChatLogTable" } | Select-Object -First 1

if ($chatLogDs) {
    aws appsync update-data-source `
        --api-id $ApiId `
        --name "ChatLogTable" `
        --type AMAZON_DYNAMODB `
        --service-role-arn $chatLogDs.serviceRoleArn `
        --dynamodb-config "tableName=$ChatLogTable,awsRegion=$Region" `
        --region $Region | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ ChatLogTable data source updated to: $ChatLogTable" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to update ChatLogTable data source" -ForegroundColor Red
    }
} else {
    Write-Host "⚠ ChatLogTable data source not found" -ForegroundColor Yellow
}

Write-Host ""

# Update Feedback data source
Write-Host "Updating FeedbackTable data source..." -ForegroundColor Yellow
$feedbackDs = $dataSources.dataSources | Where-Object { $_.name -eq "FeedbackTable" } | Select-Object -First 1

if ($feedbackDs) {
    aws appsync update-data-source `
        --api-id $ApiId `
        --name "FeedbackTable" `
        --type AMAZON_DYNAMODB `
        --service-role-arn $feedbackDs.serviceRoleArn `
        --dynamodb-config "tableName=$FeedbackTable,awsRegion=$Region" `
        --region $Region | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ FeedbackTable data source updated to: $FeedbackTable" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to update FeedbackTable data source" -ForegroundColor Red
    }
} else {
    Write-Host "⚠ FeedbackTable data source not found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✓ Data Sources Updated!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "AppSync API will now read from:" -ForegroundColor Cyan
Write-Host "  - Chat Logs: $ChatLogTable" -ForegroundColor White
Write-Host "  - Feedback: $FeedbackTable" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Verify tables exist in DynamoDB" -ForegroundColor Gray
Write-Host "2. Ensure IAM role has permissions for these tables" -ForegroundColor Gray
Write-Host "3. Test the app to confirm data loads" -ForegroundColor Gray
Write-Host ""
